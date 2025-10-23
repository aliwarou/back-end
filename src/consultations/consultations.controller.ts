import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { Auth } from 'src/iam/authentification/decorators/auth.decorator';
import { AuthType } from 'src/iam/authentification/enums/auth-type.enum';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';

@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Auth(AuthType.Bearer)
  @Post()
  create(
    @Body() createDto: CreateConsultationDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.consultationsService.create(createDto, activeUser);
  }

  @Auth(AuthType.Bearer)
  @Get()
  findMyConsultations(@ActiveUser() activeUser: ActiveUserData) {
    return this.consultationsService.findMyConsultations(activeUser);
  }

  @Auth(AuthType.Bearer)
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.consultationsService.findOne(id, activeUser);
  }

  @Auth(AuthType.Bearer)
  @Post(':id/start')
  start(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.consultationsService.start(id, activeUser);
  }

  @Auth(AuthType.Bearer)
  @Post(':id/end')
  end(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.consultationsService.end(id, activeUser);
  }

  @Auth(AuthType.Bearer)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateConsultationDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.consultationsService.update(id, updateDto, activeUser);
  }
}
