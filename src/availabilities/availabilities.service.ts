import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { Availability } from './entities/availability.entity';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';
import { RoleEnum } from 'src/iam/authentification/enums/role.enum';
import { LawyerProfile } from 'src/lawyer-profiles/entities/lawyer-profile.entity';

@Injectable()
export class AvailabilitiesService {
  constructor(
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
    @InjectRepository(LawyerProfile)
    private readonly lawyerProfileRepository: Repository<LawyerProfile>,
  ) {}

  async create(
    createDto: CreateAvailabilityDto,
    activeUser: ActiveUserData,
  ): Promise<Availability> {
    if (activeUser.role !== RoleEnum.Juriste) {
      throw new ForbiddenException(
        'Seuls les juristes peuvent créer des créneaux de disponibilité.',
      );
    }

    const lawyerProfile = await this.lawyerProfileRepository.findOneBy({
      userId: activeUser.sub,
    });

    if (!lawyerProfile) {
      throw new NotFoundException(
        "Profil de juriste non trouvé. Veuillez créer un profil d'abord.",
      );
    }

    // Validation: startTime < endTime
    if (createDto.startTime >= createDto.endTime) {
      throw new BadRequestException(
        "L'heure de début doit être antérieure à l'heure de fin.",
      );
    }

    const availability = this.availabilityRepository.create({
      ...createDto,
      lawyerProfileId: lawyerProfile.id,
    });

    return this.availabilityRepository.save(availability);
  }

  async findAll(): Promise<Availability[]> {
    return this.availabilityRepository.find({
      relations: { lawyerProfile: true },
    });
  }

  async findByLawyerProfile(lawyerProfileId: number): Promise<Availability[]> {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    return this.availabilityRepository.find({
      where: {
        lawyerProfileId,
        date: MoreThanOrEqual(currentDate),
        isAvailable: true,
      },
      order: {
        date: 'ASC',
        startTime: 'ASC',
      },
    });
  }

  async findMyAvailabilities(
    activeUser: ActiveUserData,
  ): Promise<Availability[]> {
    if (activeUser.role !== RoleEnum.Juriste) {
      throw new ForbiddenException(
        'Seuls les juristes peuvent consulter leurs disponibilités.',
      );
    }

    const lawyerProfile = await this.lawyerProfileRepository.findOneBy({
      userId: activeUser.sub,
    });

    if (!lawyerProfile) {
      throw new NotFoundException('Profil de juriste non trouvé.');
    }

    return this.availabilityRepository.find({
      where: { lawyerProfileId: lawyerProfile.id },
      order: {
        date: 'ASC',
        startTime: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Availability> {
    const availability = await this.availabilityRepository.findOne({
      where: { id },
      relations: { lawyerProfile: true },
    });

    if (!availability) {
      throw new NotFoundException(
        `Créneau de disponibilité avec l'ID "${id}" non trouvé.`,
      );
    }

    return availability;
  }

  async update(
    id: number,
    updateDto: UpdateAvailabilityDto,
    activeUser: ActiveUserData,
  ): Promise<Availability> {
    if (activeUser.role !== RoleEnum.Juriste) {
      throw new ForbiddenException(
        'Seuls les juristes peuvent modifier leurs créneaux.',
      );
    }

    const availability = await this.findOne(id);

    const lawyerProfile = await this.lawyerProfileRepository.findOneBy({
      userId: activeUser.sub,
    });

    if (!lawyerProfile || availability.lawyerProfileId !== lawyerProfile.id) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres créneaux.',
      );
    }

    // Validation si les deux horaires sont fournis
    if (updateDto.startTime && updateDto.endTime) {
      if (updateDto.startTime >= updateDto.endTime) {
        throw new BadRequestException(
          "L'heure de début doit être antérieure à l'heure de fin.",
        );
      }
    }

    Object.assign(availability, updateDto);
    return this.availabilityRepository.save(availability);
  }

  async remove(id: number, activeUser: ActiveUserData): Promise<void> {
    if (activeUser.role !== RoleEnum.Juriste) {
      throw new ForbiddenException(
        'Seuls les juristes peuvent supprimer leurs créneaux.',
      );
    }

    const availability = await this.findOne(id);

    const lawyerProfile = await this.lawyerProfileRepository.findOneBy({
      userId: activeUser.sub,
    });

    if (!lawyerProfile || availability.lawyerProfileId !== lawyerProfile.id) {
      throw new ForbiddenException(
        'Vous ne pouvez supprimer que vos propres créneaux.',
      );
    }

    await this.availabilityRepository.remove(availability);
  }
}
