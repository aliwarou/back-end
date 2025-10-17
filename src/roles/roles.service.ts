import {
  ConflictException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { UNIQUE_CONSTRAINT } from 'constants/postgres-codes.constant';
import { RoleEnum } from 'src/iam/authentification/enums/role.enum';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}
  async create(createRoleDto: CreateRoleDto) {
    try {
      const role = this.roleRepository.create(createRoleDto);
      return await this.roleRepository.save(role);
    } catch (error) {
      if (error.code == UNIQUE_CONSTRAINT)
        throw new ConflictException('cette role existe deja');
    }
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  async findOneByName(roleName: RoleEnum): Promise<Role> {
    if (!roleName) roleName = RoleEnum.Regular;
    const role = await this.roleRepository.findOneBy({ name: roleName });

    if (!role) throw new NotFoundException(`role ${roleName} does not exist`);
    return role;
  }

  async remove(name: RoleEnum): Promise<void> {
    const role = await this.findOneByName(name);
    try {
      await this.roleRepository.delete(role);
    } catch (_) {
      throw new NotAcceptableException('impossible de supprimer cette roe');
    }
  }
}
