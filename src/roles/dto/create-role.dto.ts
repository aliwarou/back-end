import { IsEnum } from 'class-validator';
import { RoleEnum } from 'src/iam/authentification/enums/role.enum';

export class CreateRoleDto {
  @IsEnum(RoleEnum)
  name: RoleEnum;
}
