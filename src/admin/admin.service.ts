import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { LawyerProfile } from 'src/lawyer-profiles/entities/lawyer-profile.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Document } from 'src/documents/entities/document.entity';
import { VerifyLawyerDto } from './dto/verify-lawyer.dto';
import { SuspendUserDto } from './dto/suspend-user.dto';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';
import { RoleEnum } from 'src/iam/authentification/enums/role.enum';
import { AppointmentStatus } from 'src/appointments/enums/appointment-status.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(LawyerProfile)
    private readonly lawyerProfileRepository: Repository<LawyerProfile>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  private checkAdminRole(activeUser: ActiveUserData): void {
    if (activeUser.role !== RoleEnum.Admin) {
      throw new ForbiddenException('Accès réservé aux administrateurs.');
    }
  }

  async getStatistics(activeUser: ActiveUserData) {
    this.checkAdminRole(activeUser);

    const [
      totalUsers,
      totalClients,
      totalLawyers,
      totalAdmins,
      totalLawyerProfiles,
      verifiedLawyers,
      pendingVerification,
      totalAppointments,
      completedAppointments,
      totalReviews,
      totalDocuments,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { role: RoleEnum.Client } }),
      this.userRepository.count({ where: { role: RoleEnum.Juriste } }),
      this.userRepository.count({ where: { role: RoleEnum.Admin } }),
      this.lawyerProfileRepository.count(),
      this.lawyerProfileRepository.count({ where: { isVerified: true } }),
      this.lawyerProfileRepository.count({ where: { isVerified: false } }),
      this.appointmentRepository.count(),
      this.appointmentRepository.count({
        where: { status: AppointmentStatus.COMPLETED },
      }),
      this.reviewRepository.count(),
      this.documentRepository.count(),
    ]);

    // Calcul du revenu total (simulé)
    const appointments = await this.appointmentRepository.find({
      where: { isPaid: true },
    });
    const totalRevenue = appointments.reduce(
      (sum, app) => sum + (Number(app.amount) || 0),
      0,
    );

    return {
      users: {
        total: totalUsers,
        clients: totalClients,
        lawyers: totalLawyers,
        admins: totalAdmins,
      },
      lawyerProfiles: {
        total: totalLawyerProfiles,
        verified: verifiedLawyers,
        pendingVerification,
      },
      appointments: {
        total: totalAppointments,
        completed: completedAppointments,
      },
      reviews: {
        total: totalReviews,
      },
      documents: {
        total: totalDocuments,
      },
      revenue: {
        total: totalRevenue,
      },
    };
  }

  async getAllUsers(activeUser: ActiveUserData): Promise<User[]> {
    this.checkAdminRole(activeUser);
    return this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getPendingVerifications(
    activeUser: ActiveUserData,
  ): Promise<LawyerProfile[]> {
    this.checkAdminRole(activeUser);
    return this.lawyerProfileRepository.find({
      where: { isVerified: false },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  async verifyLawyer(
    lawyerProfileId: number,
    verifyDto: VerifyLawyerDto,
    activeUser: ActiveUserData,
  ): Promise<LawyerProfile> {
    this.checkAdminRole(activeUser);

    const lawyerProfile = await this.lawyerProfileRepository.findOne({
      where: { id: lawyerProfileId },
      relations: { user: true },
    });

    if (!lawyerProfile) {
      throw new NotFoundException('Profil de juriste non trouvé.');
    }

    lawyerProfile.isVerified = verifyDto.isVerified;
    lawyerProfile.kycVerified = verifyDto.kycVerified;

    if (verifyDto.kycVerified) {
      lawyerProfile.kycVerifiedAt = new Date();
      lawyerProfile.verifiedBy = activeUser.sub;
    }

    return this.lawyerProfileRepository.save(lawyerProfile);
  }

  async suspendUser(
    userId: number,
    suspendDto: SuspendUserDto,
    activeUser: ActiveUserData,
  ): Promise<User> {
    this.checkAdminRole(activeUser);

    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }

    user.isActive = suspendDto.isActive;

    return this.userRepository.save(user);
  }

  async deleteUser(userId: number, activeUser: ActiveUserData): Promise<void> {
    this.checkAdminRole(activeUser);

    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }

    await this.userRepository.remove(user);
  }

  async getReportedReviews(activeUser: ActiveUserData): Promise<Review[]> {
    this.checkAdminRole(activeUser);
    return this.reviewRepository.find({
      where: { isReported: true },
      relations: { client: true, lawyerProfile: true },
      order: { reportedAt: 'DESC' },
    });
  }

  async getAllAppointments(activeUser: ActiveUserData): Promise<Appointment[]> {
    this.checkAdminRole(activeUser);
    return this.appointmentRepository.find({
      relations: { client: true, lawyerProfile: true },
      order: { scheduledAt: 'DESC' },
      take: 100, // Limiter pour les performances
    });
  }
}
