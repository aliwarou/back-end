import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { RoleService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { Auth } from 'src/iam/authentification/decorators/auth.decorator';
import { AuthType } from 'src/iam/authentification/enums/auth-type.enum';
import { RoleEnum } from 'src/iam/authentification/enums/role.enum';

@Auth(AuthType.None)
@Controller('roles')
export class RolesController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':role')
  findOne(@Param('role') role: RoleEnum) {
    return this.roleService.findOneByName(role);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
  //   return this.roleService.update(+id, updateRoleDto);
  // }

  @Delete(':id')
  remove(@Param('name') name: RoleEnum) {
    return this.roleService.remove(name);
  }
}
