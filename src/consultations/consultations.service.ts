import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { Consultation } from './entities/consultation.entity';
import { AppointmentsService } from 'src/appointments/appointments.service';
import { LawyerProfileService } from 'src/lawyer-profiles/lawyer-profiles.service';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';
import { AppointmentStatus } from 'src/appointments/enums/appointment-status.enum';

@Injectable()
export class ConsultationsService {
  constructor(
    @InjectRepository(Consultation)
    private readonly consultationRepository: Repository<Consultation>,
    private readonly appointmentsService: AppointmentsService,
    private readonly lawyerProfileService: LawyerProfileService,
  ) {}

  async create(
    createDto: CreateConsultationDto,
    activeUser: ActiveUserData,
  ): Promise<Consultation> {
    const appointment = await this.appointmentsService.findOne(
      createDto.appointmentId,
    );

    // Vérifier que l'utilisateur fait partie du rendez-vous
    let lawyerProfile = null;
    try {
      lawyerProfile = await this.lawyerProfileService.findByUserId(
        activeUser.sub,
      );
    } catch (error) {
      // L'utilisateur n'est pas un juriste
    }

    const isClient = appointment.clientId === activeUser.sub;
    const isLawyer =
      lawyerProfile && appointment.lawyerProfileId === lawyerProfile.id;

    if (!isClient && !isLawyer) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à créer une consultation pour ce rendez-vous.",
      );
    }

    // Vérifier que le rendez-vous est confirmé
    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException(
        'Le rendez-vous doit être confirmé pour créer une consultation.',
      );
    }

    // Vérifier si une consultation existe déjà
    const existing = await this.consultationRepository.findOneBy({
      appointmentId: createDto.appointmentId,
    });

    if (existing) {
      return existing;
    }

    // Générer un room ID unique pour Jitsi
    const videoRoomId = this.generateRoomId();
    const videoLink = `${process.env.JITSI_BASE_URL || 'https://meet.jit.si'}/${videoRoomId}`;

    const consultation = this.consultationRepository.create({
      appointmentId: createDto.appointmentId,
      videoRoomId,
      videoLink,
    });

    return this.consultationRepository.save(consultation);
  }

  async findAll(): Promise<Consultation[]> {
    return this.consultationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findMyConsultations(
    activeUser: ActiveUserData,
  ): Promise<Consultation[]> {
    const consultations = await this.consultationRepository.find({
      order: { createdAt: 'DESC' },
    });

    // Filtrer celles où l'utilisateur est participant
    let lawyerProfile = null;
    try {
      lawyerProfile = await this.lawyerProfileService.findByUserId(
        activeUser.sub,
      );
    } catch (error) {
      // L'utilisateur n'est pas un juriste
    }

    const filtered = consultations.filter((consultation) => {
      const isClient = consultation.appointment.clientId === activeUser.sub;
      const isLawyer =
        lawyerProfile &&
        consultation.appointment.lawyerProfileId === lawyerProfile.id;

      return isClient || isLawyer;
    });

    return filtered;
  }

  async findOne(id: number, activeUser: ActiveUserData): Promise<Consultation> {
    const consultation = await this.consultationRepository.findOne({
      where: { id },
    });

    if (!consultation) {
      throw new NotFoundException(
        `Consultation avec l'ID "${id}" non trouvée.`,
      );
    }

    // Vérifier l'accès
    let lawyerProfile = null;
    try {
      lawyerProfile = await this.lawyerProfileService.findByUserId(
        activeUser.sub,
      );
    } catch (error) {
      // L'utilisateur n'est pas un juriste
    }

    const isClient = consultation.appointment.clientId === activeUser.sub;
    const isLawyer =
      lawyerProfile &&
      consultation.appointment.lawyerProfileId === lawyerProfile.id;

    if (!isClient && !isLawyer) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à accéder à cette consultation.",
      );
    }

    return consultation;
  }

  async start(id: number, activeUser: ActiveUserData): Promise<Consultation> {
    const consultation = await this.findOne(id, activeUser);

    if (consultation.startedAt) {
      return consultation; // Déjà démarrée
    }

    consultation.startedAt = new Date();
    return this.consultationRepository.save(consultation);
  }

  async end(id: number, activeUser: ActiveUserData): Promise<Consultation> {
    const consultation = await this.findOne(id, activeUser);

    if (!consultation.startedAt) {
      throw new BadRequestException("La consultation n'a pas encore démarré.");
    }

    if (consultation.endedAt) {
      return consultation; // Déjà terminée
    }

    consultation.endedAt = new Date();
    consultation.isActive = false;

    // Calculer la durée
    const duration =
      (consultation.endedAt.getTime() - consultation.startedAt.getTime()) /
      1000 /
      60;
    consultation.durationMinutes = Math.round(duration);

    const savedConsultation =
      await this.consultationRepository.save(consultation);

    // Mettre à jour le statut du rendez-vous via le service
    try {
      await this.appointmentsService.updateStatus(
        consultation.appointmentId,
        { status: AppointmentStatus.COMPLETED },
        activeUser,
      );
    } catch (error) {
      // Le statut sera mis à jour par un autre moyen
    }

    return savedConsultation;
  }

  async update(
    id: number,
    updateDto: UpdateConsultationDto,
    activeUser: ActiveUserData,
  ): Promise<Consultation> {
    const consultation = await this.findOne(id, activeUser);

    Object.assign(consultation, updateDto);
    return this.consultationRepository.save(consultation);
  }

  private generateRoomId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `consultation-${timestamp}-${random}`;
  }
}
