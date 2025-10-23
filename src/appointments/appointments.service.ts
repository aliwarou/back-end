import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { Appointment } from './entities/appointment.entity';
import { LawyerProfileService } from 'src/lawyer-profiles/lawyer-profiles.service';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';
import { RoleEnum } from 'src/iam/authentification/enums/role.enum';
import { AppointmentStatus } from './enums/appointment-status.enum';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly lawyerProfileService: LawyerProfileService,
  ) {}

  async create(
    createDto: CreateAppointmentDto,
    activeUser: ActiveUserData,
  ): Promise<Appointment> {
    if (activeUser.role !== RoleEnum.Client) {
      throw new ForbiddenException(
        'Seuls les clients peuvent créer des rendez-vous.',
      );
    }

    const lawyerProfile = await this.lawyerProfileService.findOne(
      createDto.lawyerProfileId,
    );

    if (!lawyerProfile.isVerified) {
      throw new BadRequestException("Ce juriste n'est pas encore vérifié.");
    }

    // Générer un lien de consultation unique
    const consultationLink = this.generateConsultationLink();

    const appointment = this.appointmentRepository.create({
      ...createDto,
      clientId: activeUser.sub,
      consultationLink,
      amount: lawyerProfile.hourlyRate
        ? (lawyerProfile.hourlyRate * createDto.durationMinutes) / 60
        : null,
    });

    return this.appointmentRepository.save(appointment);
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      relations: { client: true, lawyerProfile: true },
      order: { scheduledAt: 'DESC' },
    });
  }

  async findMyAppointments(activeUser: ActiveUserData): Promise<Appointment[]> {
    if (activeUser.role === RoleEnum.Client) {
      return this.appointmentRepository.find({
        where: { clientId: activeUser.sub },
        relations: { lawyerProfile: true },
        order: { scheduledAt: 'DESC' },
      });
    } else if (activeUser.role === RoleEnum.Juriste) {
      const lawyerProfile = await this.lawyerProfileService.findByUserId(
        activeUser.sub,
      );

      return this.appointmentRepository.find({
        where: { lawyerProfileId: lawyerProfile.id },
        relations: { client: true },
        order: { scheduledAt: 'DESC' },
      });
    }

    throw new ForbiddenException('Rôle non autorisé.');
  }

  async findOne(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: { client: true, lawyerProfile: true },
    });

    if (!appointment) {
      throw new NotFoundException(`Rendez-vous avec l'ID "${id}" non trouvé.`);
    }

    return appointment;
  }

  async updateStatus(
    id: number,
    updateDto: UpdateAppointmentStatusDto,
    activeUser: ActiveUserData,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // Vérifier les autorisations selon le statut
    if (
      updateDto.status === AppointmentStatus.ACCEPTED ||
      updateDto.status === AppointmentStatus.REJECTED
    ) {
      // Seul le juriste peut accepter/rejeter
      const lawyerProfile = await this.lawyerProfileService.findByUserId(
        activeUser.sub,
      );

      if (!lawyerProfile || appointment.lawyerProfileId !== lawyerProfile.id) {
        throw new ForbiddenException(
          'Seul le juriste concerné peut accepter ou rejeter ce rendez-vous.',
        );
      }

      if (appointment.status !== AppointmentStatus.PENDING) {
        throw new BadRequestException(
          'Seuls les rendez-vous en attente peuvent être acceptés ou rejetés.',
        );
      }
    }

    // Validation du workflow
    this.validateStatusTransition(appointment.status, updateDto.status);

    // Mettre à jour le statut
    appointment.status = updateDto.status;

    if (updateDto.status === AppointmentStatus.ACCEPTED) {
      appointment.status = AppointmentStatus.SCHEDULED;
    }

    if (updateDto.status === AppointmentStatus.REJECTED) {
      appointment.rejectionReason = updateDto.rejectionReason;
    }

    if (updateDto.status === AppointmentStatus.CANCELLED) {
      appointment.cancellationReason = updateDto.cancellationReason;
      appointment.cancelledBy = activeUser.sub;
    }

    if (updateDto.status === AppointmentStatus.COMPLETED) {
      appointment.completedAt = new Date();
    }

    if (updateDto.lawyerNotes) {
      appointment.lawyerNotes = updateDto.lawyerNotes;
    }

    return this.appointmentRepository.save(appointment);
  }

  async cancel(
    id: number,
    activeUser: ActiveUserData,
    reason?: string,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // Client ou juriste peuvent annuler
    let lawyerProfile = null;
    try {
      lawyerProfile = await this.lawyerProfileService.findByUserId(
        activeUser.sub,
      );
    } catch (error) {
      // L'utilisateur n'est pas un juriste, c'est OK
    }

    const isClient = appointment.clientId === activeUser.sub;
    const isLawyer =
      lawyerProfile && appointment.lawyerProfileId === lawyerProfile.id;

    if (!isClient && !isLawyer) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à annuler ce rendez-vous.",
      );
    }

    if (
      appointment.status === AppointmentStatus.COMPLETED ||
      appointment.status === AppointmentStatus.CANCELLED
    ) {
      throw new BadRequestException('Ce rendez-vous ne peut pas être annulé.');
    }

    appointment.status = AppointmentStatus.CANCELLED;
    appointment.cancellationReason = reason;
    appointment.cancelledBy = activeUser.sub;

    return this.appointmentRepository.save(appointment);
  }

  private validateStatusTransition(
    currentStatus: AppointmentStatus,
    newStatus: AppointmentStatus,
  ): void {
    const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      [AppointmentStatus.PENDING]: [
        AppointmentStatus.ACCEPTED,
        AppointmentStatus.REJECTED,
        AppointmentStatus.CANCELLED,
      ],
      [AppointmentStatus.ACCEPTED]: [
        AppointmentStatus.SCHEDULED,
        AppointmentStatus.CANCELLED,
      ],
      [AppointmentStatus.REJECTED]: [],
      [AppointmentStatus.SCHEDULED]: [
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.NO_SHOW,
      ],
      [AppointmentStatus.COMPLETED]: [],
      [AppointmentStatus.CANCELLED]: [],
      [AppointmentStatus.NO_SHOW]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Transition de statut invalide: ${currentStatus} -> ${newStatus}`,
      );
    }
  }

  private generateConsultationLink(): string {
    const roomId = `consultation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return `${process.env.JITSI_BASE_URL || 'https://meet.jit.si'}/${roomId}`;
  }
}
