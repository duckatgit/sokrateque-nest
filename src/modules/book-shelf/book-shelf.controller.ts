import {
  Body,
  Controller,
  Delete,
  // ForbiddenException,
  Get,
  Param,
  // Param,
  Post,
  Put,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiHeader, ApiTags } from '@nestjs/swagger';
import { FileUpload } from './dtos/fileUpload.dto';
import { BookShelfService } from './book-shelf.service';
import { UserService } from '../user/user.service';
import { TockenGuard } from 'src/core/guards/tocken.guard';
import { Request } from 'express';
import { fileUploadOptions } from 'src/config/storage.config';
import { StanderdisationService } from 'src/core/services/standerdisation/standerdisation.service';
import { BOOKSHELF_SUCCESS, SERVER_SUCCESS } from 'src/core/messages';
import { FolderStructure } from './dtos/folderStructure.dto';
import { moveFolder } from './dtos/moveFolder.dto';
import { moveFile } from './dtos/moveFile.dto';
import { renameFile } from './dtos/renameFile.dto';
import { renameFolder } from './dtos/renameFolder.dot';
import { DownloadUrl } from './dtos/downloadUrl.dto';
import { FileLists } from './dtos/fileList.dto';
import { FolderList } from './dtos/folderList.dto';

@ApiTags('Book Shelf')
@Controller('book-shelf')
@ApiHeader({
  name: 'Authorizations',
  description: 'Auth token',
})
export class BookShelfController {
  constructor(
    private bookShelfService: BookShelfService,
    private userService: UserService,
    private standerdisationService: StanderdisationService,
  ) {}

  @Post('add-book')
  @ApiConsumes('multipart/form-data')
  @UseGuards(TockenGuard)
  @UseInterceptors(FilesInterceptor('files', 10, fileUploadOptions))
  async addFilesToBookShelf(
    @Body() data: FileUpload,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: Request,
  ) {
    const userId = req['user'].id;
    const finalResults = [];
    for (const file of files) {
      const result = await this.bookShelfService.uploadDocument(
        userId,
        file.originalname,
        file.path,
        data.folderId,
      );
      finalResults.push(result);
    }
    return this.standerdisationService.successMessageResponse(
      BOOKSHELF_SUCCESS.uploadSuccess,
    );
  }

  @Get('get-user-documents/:folderId')
  @UseGuards(TockenGuard)
  async getUserDocuments(
    @Req() req: Request,
    @Param('folderId') folderId: string,
  ) {
    const parentFolder = folderId ? folderId : '0';
    const userId = req['user'].id;
    const user = await this.userService.findById(userId);
    const doccumentData = await this.bookShelfService.getDocuemnts(
      user.email,
      parentFolder,
    );
    doccumentData;
    return this.standerdisationService.successDataResponse(
      SERVER_SUCCESS.common,
      doccumentData,
    );
  }
  @Post('create-folder')
  @UseGuards(TockenGuard)
  async createNewFolder(@Body() data: FolderStructure, @Req() req: Request) {
    const user = req['user'];
    const responce = await this.bookShelfService.createBookShelf(
      user.email,
      data.folderName,
      data.parentFolderId,
    );
    return responce;
  }
  @Put('move-folder')
  @UseGuards(TockenGuard)
  async moveFolder(@Body() data: moveFolder, @Req() req: Request) {
    const user = req['user'];
    await this.bookShelfService.moveFolder(
      user.email,
      data.folderId,
      data.whereFolderId,
    );
    return this.standerdisationService.successMessageResponse(
      'successfully moved folder',
    );
  }
  @Put('move-file')
  @UseGuards(TockenGuard)
  async moveFile(@Body() data: moveFile, @Req() req: Request) {
    const user = req['user'];
    await this.bookShelfService.moveFile(
      user.email,
      data.fileId,
      data.folderId,
    );
    return this.standerdisationService.successMessageResponse(
      'successfully moved file',
    );
  }
  @Delete('delete-file/:fileId')
  @UseGuards(TockenGuard)
  async deleteFile(@Param('fileId') fileId: string, @Req() req: Request) {
    const user = req['user'];
    await this.bookShelfService.deleteFile(user.email, fileId);
    return this.standerdisationService.successMessageResponse(
      'successfully deleted the file',
    );
  }
  @Delete('delete-folder/:folderId')
  @UseGuards(TockenGuard)
  async deleteFolder(@Param('folderId') folderId: string, @Req() req: Request) {
    const user = req['user'];
    await this.bookShelfService.deleteFolder(user.email, folderId);
    return this.standerdisationService.successMessageResponse(
      'successfully deleted folder',
    );
  }
  @Put('like-file')
  @UseGuards(TockenGuard)
  async likeFile(@Body() data: FileLists, @Req() req: Request) {
    const user = req['user'];
    const fileLists = data.filesList;
    const promises = fileLists.map(async (fileId) => {
      await this.bookShelfService.likeFile(user.email, fileId);
    });
    await Promise.all(promises);
    return this.standerdisationService.successMessageResponse(
      'successfully liked the file',
    );
  }
  @Put('like-folder')
  @UseGuards(TockenGuard)
  async likeFolder(@Body() data: FolderList, @Req() req: Request) {
    const user = req['user'];
    const folderList = data.foldersList;
    const promises = folderList.map(async (folderId) => {
      await this.bookShelfService.likeFolder(user.email, folderId);
    });
    await Promise.all(promises);
    return this.standerdisationService.successMessageResponse(
      'successfully liked folder',
    );
  }
  @Put('unlike-file')
  @UseGuards(TockenGuard)
  async unLikeFile(@Body() data: FileLists, @Req() req: Request) {
    const user = req['user'];
    const fileLists = data.filesList;
    const promises = fileLists.map(async (fileId) => {
      await this.bookShelfService.unLikeFile(user.email, fileId);
    });
    await Promise.all(promises);
    return this.standerdisationService.successMessageResponse(
      'successfully unLiked the file',
    );
  }
  @Put('unlike-folder')
  @UseGuards(TockenGuard)
  async unLikeFolder(@Body() data: FolderList, @Req() req: Request) {
    const user = req['user'];
    const folderList = data.foldersList;
    const promises = folderList.map(async (folderId) => {
      await this.bookShelfService.unLikeFolder(user.email, folderId);
    });
    await Promise.all(promises);
    return this.standerdisationService.successMessageResponse(
      'successfully unliked folder',
    );
  }
  @Get('get-faivorates')
  @UseGuards(TockenGuard)
  async getFaivorates(@Req() req: Request) {
    const user = req['user'];
    const result = await this.bookShelfService.retreaveFaivorates(user.email);
    return this.standerdisationService.successDataResponse(
      'successfully retreaved data',
      result,
    );
  }
  @Put('rename-file')
  @UseGuards(TockenGuard)
  async renameFile(@Body() data: renameFile, @Req() req: Request) {
    const user = req['user'];
    await this.bookShelfService.renameFile(
      user.email,
      data.fileId,
      data.newName,
    );
    return this.standerdisationService.successMessageResponse(
      'successfully renamed the file',
    );
  }
  @Put('rename-folder')
  @UseGuards(TockenGuard)
  async renameFolder(@Body() data: renameFolder, @Req() req: Request) {
    const user = req['user'];
    await this.bookShelfService.renameFolder(
      user.email,
      data.folderId,
      data.newName,
    );
    return this.standerdisationService.successMessageResponse(
      'successfully renamed folder',
    );
  }
  @Get('scearch/:fileName')
  @UseGuards(TockenGuard)
  async scearchFile(@Param('fileName') fileName: string, @Req() req: Request) {
    const user = req['user'];
    const result = await this.bookShelfService.scearch(user.email, fileName);
    return result;
  }
  @Post('download-page')
  @UseGuards(TockenGuard)
  async downloadPage(@Body() data: DownloadUrl, @Req() req: Request) {
    const user = req['user'];
    await this.bookShelfService.downloadPage(data.url, user.email);
    return this.standerdisationService.successMessageResponse(
      'successfully uploaded files',
    );
  }
  @Get('downloads')
  @UseGuards(TockenGuard)
  async getDownloads(@Req() req: Request) {
    const user = req['user'];
    const allData = await this.bookShelfService.getFolders(user.email);
    const downloadsId = this.bookShelfService.getFolderId(allData, 'Downloads');
    if (!downloadsId)
      return this.standerdisationService.successMessageResponse(
        'no downloads found',
      );
    const downloads = await this.bookShelfService.getDocuemnts(
      user.email,
      downloadsId,
    );
    return this.standerdisationService.successDataResponse(
      'successfull in retreaving data',
      downloads,
    );
  }
  @Get('download-folder/:folderId')
  @UseGuards(TockenGuard)
  async downloadFolder(
    @Param('folderId') folderId: string,
    @Req() req: Request,
  ) {
    const user = req['user'];
    const files = await this.bookShelfService.retreaveAllFiles(
      folderId,
      user.email,
    );
    const downloadLinks = this.bookShelfService.extractDownloadLinks(
      files.content,
    );
    return this.standerdisationService.successDataResponse(
      'successfull',
      downloadLinks.download,
    );
  }
}
