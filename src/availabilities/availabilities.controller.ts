import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { AvailabilitiesService } from './availabilities.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { Auth } from 'src/iam/authentification/decorators/auth.decorator';
import { AuthType } from 'src/iam/authentification/enums/auth-type.enum';
import { Role } from 'src/iam/authorization/decorators/role.decorator';
import { RoleEnum } from 'src/iam/authentification/enums/role.enum';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';

@Controller('availabilities')
export class AvailabilitiesController {
  constructor(private readonly availabilitiesService: AvailabilitiesService) {}

  @Auth(AuthType.Bearer)
  @Role(RoleEnum.Juriste)
  @Post()
  create(
    @Body() createDto: CreateAvailabilityDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.availabilitiesService.create(createDto, activeUser);
  }

  @Auth(AuthType.Bearer)
  @Role(RoleEnum.Juriste)
  @Get('my-availabilities')
  findMyAvailabilities(@ActiveUser() activeUser: ActiveUserData) {
    return this.availabilitiesService.findMyAvailabilities(activeUser);
  }

  @Auth(AuthType.None)
  @Get('lawyer/:lawyerProfileId')
  findByLawyerProfile(@Param('lawyerProfileId', ParseIntPipe) id: number) {
    return this.availabilitiesService.findByLawyerProfile(id);
  }

  @Auth(AuthType.None)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.availabilitiesService.findOne(id);
  }

  @Auth(AuthType.Bearer)
  @Role(RoleEnum.Juriste)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAvailabilityDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.availabilitiesService.update(id, updateDto, activeUser);
  }

  @Auth(AuthType.Bearer)
  @Role(RoleEnum.Juriste)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.availabilitiesService.remove(id, activeUser);
  }
}
