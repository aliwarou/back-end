import { IsEmail, IsEnum, IsString, IsStrongPassword } from 'class-validator';
import { RoleEnum } from '../enums/role.enum';

export enum SignUpEnum {
  Client = RoleEnum.Client,
  Juriste = RoleEnum.Juriste,
}

export class SignUpDto {
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
  password: string;

  @IsEnum(SignUpEnum)
  role?: RoleEnum = RoleEnum.Client;
}
