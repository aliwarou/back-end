import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { RespondReviewDto } from './dto/respond-review.dto';
import { ReportReviewDto } from './dto/report-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { Review } from './entities/review.entity';
import { LawyerProfileService } from 'src/lawyer-profiles/lawyer-profiles.service';
import { AppointmentsService } from 'src/appointments/appointments.service';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';
import { RoleEnum } from 'src/iam/authentification/enums/role.enum';
import { AppointmentStatus } from 'src/appointments/enums/appointment-status.enum';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly lawyerProfileService: LawyerProfileService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  async create(
    createDto: CreateReviewDto,
    activeUser: ActiveUserData,
  ): Promise<Review> {
    if (activeUser.role !== RoleEnum.Client) {
      throw new ForbiddenException(
        'Seuls les clients peuvent laisser des avis.',
      );
    }

    const lawyerProfile = await this.lawyerProfileService.findOne(
      createDto.lawyerProfileId,
    );

    // Vérifier si une consultation a été terminée
    if (createDto.appointmentId) {
      const appointment = await this.appointmentsService.findOne(
        createDto.appointmentId,
      );

      if (
        appointment.clientId !== activeUser.sub ||
        appointment.status !== AppointmentStatus.COMPLETED
      ) {
        throw new BadRequestException(
          'Vous ne pouvez laisser un avis que pour une consultation terminée.',
        );
      }

      // Vérifier si un avis existe déjà pour ce rendez-vous
      const existingReview = await this.reviewRepository.findOneBy({
        appointmentId: createDto.appointmentId,
      });

      if (existingReview) {
        throw new ConflictException(
          'Vous avez déjà laissé un avis pour cette consultation.',
        );
      }
    }

    const review = this.reviewRepository.create({
      ...createDto,
      clientId: activeUser.sub,
    });

    const savedReview = await this.reviewRepository.save(review);

    // Mettre à jour la note moyenne du juriste
    await this.updateLawyerAverageRating(createDto.lawyerProfileId);

    return savedReview;
  }

  async findAll(): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { isPublished: true },
      relations: { client: true, lawyerProfile: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByLawyer(lawyerProfileId: number): Promise<Review[]> {
    return this.reviewRepository.find({
      where: {
        lawyerProfileId,
        isPublished: true,
      },
      relations: { client: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findMyReviews(activeUser: ActiveUserData): Promise<Review[]> {
    if (activeUser.role === RoleEnum.Client) {
      return this.reviewRepository.find({
        where: { clientId: activeUser.sub },
        relations: { lawyerProfile: true },
        order: { createdAt: 'DESC' },
      });
    } else if (activeUser.role === RoleEnum.Juriste) {
      const lawyerProfile = await this.lawyerProfileService.findByUserId(
        activeUser.sub,
      );

      return this.reviewRepository.find({
        where: { lawyerProfileId: lawyerProfile.id },
        relations: { client: true },
        order: { createdAt: 'DESC' },
      });
    }

    throw new ForbiddenException('Rôle non autorisé.');
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: { client: true, lawyerProfile: true },
    });

    if (!review) {
      throw new NotFoundException(`Avis avec l'ID "${id}" non trouvé.`);
    }

    return review;
  }

  async respond(
    id: number,
    respondDto: RespondReviewDto,
    activeUser: ActiveUserData,
  ): Promise<Review> {
    if (activeUser.role !== RoleEnum.Juriste) {
      throw new ForbiddenException(
        'Seuls les juristes peuvent répondre aux avis.',
      );
    }

    const review = await this.findOne(id);

    const lawyerProfile = await this.lawyerProfileService.findByUserId(
      activeUser.sub,
    );

    if (!lawyerProfile || review.lawyerProfileId !== lawyerProfile.id) {
      throw new ForbiddenException(
        "Vous ne pouvez répondre qu'aux avis de votre profil.",
      );
    }

    review.lawyerResponse = respondDto.lawyerResponse;
    review.respondedAt = new Date();

    return this.reviewRepository.save(review);
  }

  async report(
    id: number,
    reportDto: ReportReviewDto,
    activeUser: ActiveUserData,
  ): Promise<Review> {
    const review = await this.findOne(id);

    review.isReported = true;
    review.reportReason = reportDto.reportReason;
    review.reportedBy = activeUser.sub;
    review.reportedAt = new Date();

    return this.reviewRepository.save(review);
  }

  async moderate(
    id: number,
    moderateDto: ModerateReviewDto,
    activeUser: ActiveUserData,
  ): Promise<Review> {
    if (activeUser.role !== RoleEnum.Admin) {
      throw new ForbiddenException(
        'Seuls les admins peuvent modérer les avis.',
      );
    }

    const review = await this.findOne(id);

    review.isPublished = moderateDto.isPublished;
    review.isModerated = true;
    review.moderatedBy = activeUser.sub;
    review.moderatedAt = new Date();
    review.moderationNotes = moderateDto.moderationNotes;

    const moderatedReview = await this.reviewRepository.save(review);

    // Recalculer la note moyenne du juriste
    await this.updateLawyerAverageRating(review.lawyerProfileId);

    return moderatedReview;
  }

  async remove(id: number, activeUser: ActiveUserData): Promise<void> {
    const review = await this.findOne(id);

    // Seul le client qui a créé l'avis ou un admin peut le supprimer
    if (
      activeUser.role !== RoleEnum.Admin &&
      review.clientId !== activeUser.sub
    ) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à supprimer cet avis.",
      );
    }

    const lawyerProfileId = review.lawyerProfileId;
    await this.reviewRepository.remove(review);

    // Mettre à jour la note moyenne
    await this.updateLawyerAverageRating(lawyerProfileId);
  }

  async updateLawyerAverageRating(lawyerProfileId: number): Promise<void> {
    const reviews = await this.reviewRepository.find({
      where: {
        lawyerProfileId,
        isPublished: true,
      },
    });

    const lawyerProfile =
      await this.lawyerProfileService.findOne(lawyerProfileId);

    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      // On devrait avoir une méthode dans LawyerProfileService pour mettre à jour les ratings
      // Pour l'instant, on accède directement au repository (À AMÉLIORER)
      await this.lawyerProfileService.updateRating(
        lawyerProfileId,
        totalRating / reviews.length,
        reviews.length,
      );
    } else {
      await this.lawyerProfileService.updateRating(lawyerProfileId, 0, 0);
    }
  }
}
