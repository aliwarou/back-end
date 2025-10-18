import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { LawyerProfileService } from './lawerprofiles.service';
import { CreateLawyerProfileDto } from './dto/create-lawerprofile.dto';
import { Auth } from 'src/iam/authentification/decorators/auth.decorator';
import { AuthType } from 'src/iam/authentification/enums/auth-type.enum';
import { Role } from 'src/iam/authorization/decorators/role.decorator';
import { RoleEnum } from 'src/iam/authentification/enums/role.enum';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';
import { UpdateLawerprofileDto } from './dto/update-lawerprofile.dto';

@Controller('lawyer-profiles')
export class LawyerProfileController {
  constructor(private readonly lawyerProfileService: LawyerProfileService) {}

  /**
   * Crée un profil de juriste.
   * - Requiert une authentification de type Bearer (JWT).
   * - Requiert que l'utilisateur ait le rôle 'Juriste'.
   */
  @Auth(AuthType.Bearer)
  @Role(RoleEnum.Juriste)
  @Post()
  create(
    @Body() createDto: CreateLawyerProfileDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.lawyerProfileService.create(createDto, activeUser);
  }

  /**
   * Met à jour le profil du juriste authentifié.
   * - Requiert une authentification de type Bearer (JWT).
   * - Requiert que l'utilisateur ait le rôle 'Juriste'.
   */
  @Auth(AuthType.Bearer)
  @Role(RoleEnum.Juriste)
  @Patch()
  update(
    @Body() updateDto: UpdateLawerprofileDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.lawyerProfileService.update(updateDto, activeUser);
  }

  /**
   * Récupère la liste de tous les profils de juristes.
   * - Route publique, aucune authentification requise.
   */
  @Auth(AuthType.None)
  @Get()
  findAll() {
    return this.lawyerProfileService.findAll();
  }

  /**
   * Récupère un profil de juriste spécifique par son ID.
   * - Route publique.
   */
  @Auth(AuthType.None)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lawyerProfileService.findOne(id);
  }
}
