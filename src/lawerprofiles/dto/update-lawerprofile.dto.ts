import { PartialType } from '@nestjs/mapped-types';
import { CreateLawyerProfileDto } from './create-lawerprofile.dto';

export class UpdateLawerprofileDto extends PartialType(CreateLawyerProfileDto) {}
