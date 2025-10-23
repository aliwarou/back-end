import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { VerifyLawyerDto } from './dto/verify-lawyer.dto';
import { SuspendUserDto } from './dto/suspend-user.dto';
import { Auth } from 'src/iam/authentification/decorators/auth.decorator';
import { AuthType } from 'src/iam/authentification/enums/auth-type.enum';
import { Role } from 'src/iam/authorization/decorators/role.decorator';
import { RoleEnum } from 'src/iam/authentification/enums/role.enum';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';

@Controller('admin')
@Auth(AuthType.Bearer)
@Role(RoleEnum.Admin)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('statistics')
  getStatistics(@ActiveUser() activeUser: ActiveUserData) {
    return this.adminService.getStatistics(activeUser);
  }

  @Get('users')
  getAllUsers(@ActiveUser() activeUser: ActiveUserData) {
    return this.adminService.getAllUsers(activeUser);
  }

  @Get('lawyers/pending-verification')
  getPendingVerifications(@ActiveUser() activeUser: ActiveUserData) {
    return this.adminService.getPendingVerifications(activeUser);
  }

  @Patch('lawyers/:id/verify')
  verifyLawyer(
    @Param('id', ParseIntPipe) id: number,
    @Body() verifyDto: VerifyLawyerDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.adminService.verifyLawyer(id, verifyDto, activeUser);
  }

  @Patch('users/:id/suspend')
  suspendUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() suspendDto: SuspendUserDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.adminService.suspendUser(id, suspendDto, activeUser);
  }

  @Delete('users/:id')
  deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.adminService.deleteUser(id, activeUser);
  }

  @Get('reviews/reported')
  getReportedReviews(@ActiveUser() activeUser: ActiveUserData) {
    return this.adminService.getReportedReviews(activeUser);
  }

  @Get('appointments')
  getAllAppointments(@ActiveUser() activeUser: ActiveUserData) {
    return this.adminService.getAllAppointments(activeUser);
  }
}
