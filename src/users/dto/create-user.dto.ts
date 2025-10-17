import {
  IsEmail,
  IsEmpty,
  IsEnum,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { RoleEnum } from 'src/iam/authentification/enums/role.enum';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsStrongPassword({
    minLength: 4,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password?: string;

  @IsEmpty()
  googleId?: string = null;

  @IsEnum(RoleEnum)
  role?: RoleEnum = RoleEnum.Regular;
}
