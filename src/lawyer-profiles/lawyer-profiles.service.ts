import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LawyerProfile } from './entities/lawyer-profile.entity';
import { CreateLawyerProfileDto } from './dto/create-lawyer-profile.dto';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';
import { RoleEnum } from 'src/iam/authentification/enums/role.enum';
import { UpdateLawyerProfileDto } from './dto/update-lawyer-profile.dto';

@Injectable()
export class LawyerProfileService {
  constructor(
    @InjectRepository(LawyerProfile)
    private readonly lawyerProfileRepository: Repository<LawyerProfile>,
  ) {}

  async create(
    createDto: CreateLawyerProfileDto,
    activeUser: ActiveUserData,
  ): Promise<LawyerProfile> {
    if (activeUser.role !== RoleEnum.Juriste) {
      throw new ForbiddenException(
        'Seul un juriste peut créer un profil professionnel.',
      );
    }

    const existingProfile = await this.lawyerProfileRepository.findOneBy({
      userId: activeUser.sub,
    });
    if (existingProfile) {
      throw new ConflictException(
        'Un profil existe déjà pour cet utilisateur.',
      );
    }

    const profile = this.lawyerProfileRepository.create({
      ...createDto,
      userId: activeUser.sub,
    });

    return this.lawyerProfileRepository.save(profile);
  }

  async update(
    updateDto: UpdateLawyerProfileDto,
    activeUser: ActiveUserData,
  ): Promise<LawyerProfile> {
    if (activeUser.role !== RoleEnum.Juriste) {
      throw new ForbiddenException('Seul un juriste peut modifier son profil.');
    }

    const profile = await this.lawyerProfileRepository.findOneBy({
      userId: activeUser.sub,
    });

    if (!profile) {
      throw new NotFoundException(
        "Profil non trouvé. Veuillez d'abord en créer un.",
      );
    }

    // Met à jour les champs du profil avec les nouvelles données
    Object.assign(profile, updateDto);

    return this.lawyerProfileRepository.save(profile);
  }

  async findAll(): Promise<LawyerProfile[]> {
    return this.lawyerProfileRepository.find({
      where: { isVerified: true },
      relations: { user: true },
      order: { averageRating: 'DESC' },
    });
  }

  async search(searchDto: any): Promise<{
    data: LawyerProfile[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      specialization,
      name,
      city,
      country,
      languages,
      minRate,
      maxRate,
      minRating,
      minExperience,
      sortBy = 'rating',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
    } = searchDto;

    const queryBuilder = this.lawyerProfileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .where('profile.isVerified = :verified', { verified: true });

    // Filtres
    if (specialization) {
      queryBuilder.andWhere(
        'LOWER(profile.specialization) LIKE LOWER(:specialization)',
        {
          specialization: `%${specialization}%`,
        },
      );
    }

    if (name) {
      queryBuilder.andWhere('LOWER(user.name) LIKE LOWER(:name)', {
        name: `%${name}%`,
      });
    }

    if (city) {
      queryBuilder.andWhere('LOWER(profile.city) LIKE LOWER(:city)', {
        city: `%${city}%`,
      });
    }

    if (country) {
      queryBuilder.andWhere('LOWER(profile.country) LIKE LOWER(:country)', {
        country: `%${country}%`,
      });
    }

    if (languages && languages.length > 0) {
      // Vérifier si au moins une langue correspond
      const languageConditions = languages.map(
        (_, index) => `profile.languages LIKE :lang${index}`,
      );
      queryBuilder.andWhere(
        `(${languageConditions.join(' OR ')})`,
        languages.reduce((acc, lang, index) => {
          acc[`lang${index}`] = `%${lang}%`;
          return acc;
        }, {}),
      );
    }

    if (minRate !== undefined) {
      queryBuilder.andWhere('profile.hourlyRate >= :minRate', { minRate });
    }

    if (maxRate !== undefined) {
      queryBuilder.andWhere('profile.hourlyRate <= :maxRate', { maxRate });
    }

    if (minRating !== undefined) {
      queryBuilder.andWhere('profile.averageRating >= :minRating', {
        minRating,
      });
    }

    if (minExperience !== undefined) {
      queryBuilder.andWhere('profile.yearsOfExperience >= :minExperience', {
        minExperience,
      });
    }

    // Tri
    const sortField =
      {
        rating: 'profile.averageRating',
        rate: 'profile.hourlyRate',
        experience: 'profile.yearsOfExperience',
        reviews: 'profile.totalReviews',
      }[sortBy] || 'profile.averageRating';

    queryBuilder.orderBy(sortField, sortOrder as 'ASC' | 'DESC');

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<LawyerProfile> {
    const profile = await this.lawyerProfileRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!profile) {
      throw new NotFoundException(
        `Profil de juriste avec l'ID "${id}" non trouvé.`,
      );
    }
    return profile;
  }

  async findByUserId(userId: number): Promise<LawyerProfile> {
    const profile = await this.lawyerProfileRepository.findOne({
      where: { userId },
      relations: { user: true },
    });
    if (!profile) {
      throw new NotFoundException(
        'Profil de juriste non trouvé pour cet utilisateur.',
      );
    }
    return profile;
  }

  async updateRating(
    lawyerProfileId: number,
    averageRating: number,
    totalReviews: number,
  ): Promise<void> {
    await this.lawyerProfileRepository.update(lawyerProfileId, {
      averageRating,
      totalReviews,
    });
  }
}
