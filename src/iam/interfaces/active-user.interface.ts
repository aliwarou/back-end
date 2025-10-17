import { Role } from 'src/roles/entities/role.entity';

export interface ActiveUserData {
  sub: number;
  email: string;
  role: Role;
}
