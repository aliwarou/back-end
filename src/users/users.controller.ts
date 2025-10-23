import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthType } from 'src/iam/authentification/enums/auth-type.enum';
import { Auth } from 'src/iam/authentification/decorators/auth.decorator';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Auth(AuthType.None)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Auth(AuthType.Bearer)
  @Get('me/export-data')
  exportMyData(@ActiveUser() activeUser: ActiveUserData) {
    return this.usersService.exportUserData(activeUser.sub);
  }

  @Auth(AuthType.Bearer)
  @Delete('me/delete-account')
  deleteMyAccount(@ActiveUser() activeUser: ActiveUserData) {
    return this.usersService.deleteUserData(activeUser.sub);
  }

  @Auth(AuthType.None)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Auth(AuthType.None)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Auth(AuthType.None)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Auth(AuthType.None)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
