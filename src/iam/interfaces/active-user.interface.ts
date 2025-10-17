import { RoleEnum } from '../authentification/enums/role.enum';

export interface ActiveUserData {
  sub: number;
  email: string;
  role: RoleEnum;
}
