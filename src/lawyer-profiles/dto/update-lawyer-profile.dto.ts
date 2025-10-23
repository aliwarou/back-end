import { PartialType } from '@nestjs/mapped-types';
import { CreateLawyerProfileDto } from './create-lawyer-profile.dto';

export class UpdateLawyerProfileDto extends PartialType(
  CreateLawyerProfileDto,
) {}
