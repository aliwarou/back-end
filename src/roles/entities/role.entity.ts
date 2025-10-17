import { RoleEnum } from 'src/iam/authentification/enums/role.enum';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, default: RoleEnum.Regular })
  name: RoleEnum;

  @OneToMany(() => User, (user) => user.role)
  user: User;
}
