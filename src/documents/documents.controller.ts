import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { Auth } from 'src/iam/authentification/decorators/auth.decorator';
import { AuthType } from 'src/iam/authentification/enums/auth-type.enum';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Auth(AuthType.Bearer)
  @Post('upload-url')
  getUploadUrl(
    @Body() createDto: CreateDocumentDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.documentsService.getUploadUrl(createDto, activeUser);
  }

  @Auth(AuthType.Bearer)
  @Get()
  findAll(@ActiveUser() activeUser: ActiveUserData) {
    return this.documentsService.findAll(activeUser);
  }

  @Auth(AuthType.Bearer)
  @Get('my-documents')
  findMyDocuments(@ActiveUser() activeUser: ActiveUserData) {
    return this.documentsService.findMyDocuments(activeUser);
  }

  @Auth(AuthType.Bearer)
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.documentsService.findOne(id, activeUser);
  }

  @Auth(AuthType.Bearer)
  @Get(':id/download-url')
  getDownloadUrl(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.documentsService.getDownloadUrl(id, activeUser);
  }

  @Auth(AuthType.Bearer)
  @Patch(':id/grant-access/:userId')
  grantAccess(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.documentsService.grantAccess(id, userId, activeUser);
  }

  @Auth(AuthType.Bearer)
  @Patch(':id/revoke-access/:userId')
  revokeAccess(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.documentsService.revokeAccess(id, userId, activeUser);
  }

  @Auth(AuthType.Bearer)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.documentsService.remove(id, activeUser);
  }
}
