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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { RespondReviewDto } from './dto/respond-review.dto';
import { ReportReviewDto } from './dto/report-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { Auth } from 'src/iam/authentification/decorators/auth.decorator';
import { AuthType } from 'src/iam/authentification/enums/auth-type.enum';
import { Role } from 'src/iam/authorization/decorators/role.decorator';
import { RoleEnum } from 'src/iam/authentification/enums/role.enum';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Auth(AuthType.Bearer)
  @Role(RoleEnum.Client)
  @Post()
  create(
    @Body() createDto: CreateReviewDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.reviewsService.create(createDto, activeUser);
  }

  @Auth(AuthType.None)
  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @Auth(AuthType.None)
  @Get('lawyer/:lawyerProfileId')
  findByLawyer(@Param('lawyerProfileId', ParseIntPipe) id: number) {
    return this.reviewsService.findByLawyer(id);
  }

  @Auth(AuthType.Bearer)
  @Get('my-reviews')
  findMyReviews(@ActiveUser() activeUser: ActiveUserData) {
    return this.reviewsService.findMyReviews(activeUser);
  }

  @Auth(AuthType.Bearer)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  @Auth(AuthType.Bearer)
  @Role(RoleEnum.Juriste)
  @Patch(':id/respond')
  respond(
    @Param('id', ParseIntPipe) id: number,
    @Body() respondDto: RespondReviewDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.reviewsService.respond(id, respondDto, activeUser);
  }

  @Auth(AuthType.Bearer)
  @Post(':id/report')
  report(
    @Param('id', ParseIntPipe) id: number,
    @Body() reportDto: ReportReviewDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.reviewsService.report(id, reportDto, activeUser);
  }

  @Auth(AuthType.Bearer)
  @Role(RoleEnum.Admin)
  @Patch(':id/moderate')
  moderate(
    @Param('id', ParseIntPipe) id: number,
    @Body() moderateDto: ModerateReviewDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.reviewsService.moderate(id, moderateDto, activeUser);
  }

  @Auth(AuthType.Bearer)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.reviewsService.remove(id, activeUser);
  }
}
