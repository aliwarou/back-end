import { IsEmail, IsEnum, IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '../enums/role.enum';

export enum SignUpEnum {
  Client = RoleEnum.Client,
  Juriste = RoleEnum.Juriste,
}

export class SignUpDto {
  @ApiProperty({
    description: "Adresse email de l'utilisateur",
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Nom complet de l'utilisateur",
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description:
      'Mot de passe (min 4 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 symbole)',
    example: 'Pass123!',
    minLength: 4,
  })
  @IsStrongPassword({
    minLength: 4,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;

  @ApiProperty({
    description: "Rôle de l'utilisateur",
    enum: SignUpEnum,
    example: RoleEnum.Client,
    default: RoleEnum.Client,
  })
  @IsEnum(SignUpEnum)
  role?: RoleEnum = RoleEnum.Client;
}
