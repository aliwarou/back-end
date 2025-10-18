import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LawyerProfile } from './entities/lawerprofile.entity';
import { CreateLawyerProfileDto } from './dto/create-lawerprofile.dto';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';
import { RoleEnum } from 'src/iam/authentification/enums/role.enum';
import { UpdateLawerprofileDto } from './dto/update-lawerprofile.dto';

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
      throw new ConflictException('Un profil existe déjà pour cet utilisateur.');
    }

    const profile = this.lawyerProfileRepository.create({
      ...createDto,
      userId: activeUser.sub,
    });

    return this.lawyerProfileRepository.save(profile);
  }

  async update(
    updateDto: UpdateLawerprofileDto,
    activeUser: ActiveUserData,
  ): Promise<LawyerProfile> {
    if (activeUser.role !== RoleEnum.Juriste) {
      throw new ForbiddenException(
        'Seul un juriste peut modifier son profil.',
      );
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

  findAll(): Promise<LawyerProfile[]> {
    return this.lawyerProfileRepository.find({
      relations: {
        user: true, // Assure que les détails de l'utilisateur sont joints
      },
    });
  }

  async findOne(id: number): Promise<LawyerProfile> {
    const profile = await this.lawyerProfileRepository.findOne({
        where: { id },
        relations: { user: true }
    });
    if (!profile) {
      throw new NotFoundException(`Profil de juriste avec l'ID "${id}" non trouvé.`);
    }
    return profile;
  }
}
