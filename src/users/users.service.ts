import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleService } from 'src/roles/roles.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleEnum } from 'src/iam/authentification/enums/role.enum';
import { HashingService } from 'src/users/hashing/hashing.service';
import { UNIQUE_CONSTRAINT } from 'constants/postgres-codes.constant';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly roleService: RoleService,
    private readonly haschingService: HashingService,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    console.log('user DTO', createUserDto);

    try {
      const role = await this.getRole(createUserDto.role);

      let hashedPassword = null;
      if (createUserDto.password)
        hashedPassword = await this.haschingService.hash(
          createUserDto.password,
        );

      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
        role,
      });

      return await this.userRepository.save(user);
    } catch (e) {
      if (e.code == UNIQUE_CONSTRAINT)
        throw new ConflictException('user already exist');
      throw e;
    }
  }

  private async getRole(roleName: RoleEnum) {
    const role = await this.roleService.findOneByName(roleName);
    console.log('role', role);

    if (!role) {
      throw new NotFoundException(`Role ${role} not found`);
    }
    return role;
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('user does not exist');
    return user;
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  async findOneByGoogeId(googleId: string) {
    return await this.userRepository.findOneBy({ googleId });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    const role = await this.roleService.findOneByName(updateUserDto.role);
    if (!role) throw new NotFoundException('role not found');
    user.role = role;
    return await this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    return this.userRepository.remove(user);
  }
}
