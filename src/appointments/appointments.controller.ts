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
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { Auth } from 'src/iam/authentification/decorators/auth.decorator';
import { AuthType } from 'src/iam/authentification/enums/auth-type.enum';
import { Role } from 'src/iam/authorization/decorators/role.decorator';
import { RoleEnum } from 'src/iam/authentification/enums/role.enum';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Auth(AuthType.Bearer)
  @Role(RoleEnum.Client)
  @Post()
  create(
    @Body() createDto: CreateAppointmentDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.appointmentsService.create(createDto, activeUser);
  }

  @Auth(AuthType.Bearer)
  @Get('my-appointments')
  findMyAppointments(@ActiveUser() activeUser: ActiveUserData) {
    return this.appointmentsService.findMyAppointments(activeUser);
  }

  @Auth(AuthType.Bearer)
  @Role(RoleEnum.Admin)
  @Get()
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Auth(AuthType.Bearer)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.findOne(id);
  }

  @Auth(AuthType.Bearer)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAppointmentStatusDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.appointmentsService.updateStatus(id, updateDto, activeUser);
  }

  @Auth(AuthType.Bearer)
  @Delete(':id/cancel')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() activeUser: ActiveUserData,
    @Body('reason') reason?: string,
  ) {
    return this.appointmentsService.cancel(id, activeUser, reason);
  }
}
