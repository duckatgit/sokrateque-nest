import { Injectable, NotFoundException } from '@nestjs/common';
import { BookShelf } from './schema/bookShelf.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
// import * as pdf from 'pdf-parse';
import { UserService } from '../user/user.service';
import { BoxServiceService } from 'src/core/services/box-service/box-service.service';
import { USER_ERROR } from 'src/core/messages';
import { BingService } from 'src/core/services/bing/bing.service';
import { join } from 'path';
// import { USER_ERROR } from 'src/core/messages';

@Injectable()
export class BookShelfService {
  constructor(
    @InjectRepository(BookShelf)
    private bookShelfRepository: Repository<BookShelf>,
    private userService: UserService,
    private boxService: BoxServiceService,
    private bingService: BingService,
  ) {}
  async getDocuemnts(email: string, folderId: string) {
    const result = await this.boxService.getUserDocuments(email, folderId);
    return result.data;
  }
  async uploadDocument(
    userId: number,
    fileName: string,
    path: string,
    folderId: number,
  ) {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException(USER_ERROR.notFound);
    const form = new FormData();
    const fileBuffer = fs.readFileSync(path);
    const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });
    form.append('file', blob);
    form.append('userName', user.email);
    form.append('fileName', fileName);
    form.append('parentFolderId', folderId.toString());
    return this.boxService.uploadDocument(form);
  }
  async createBookShelf(
    username: string,
    folderName: string,
    parentFolderId: string,
  ) {
    const form = new FormData();
    form.append('username', username);
    form.append('folderName', folderName);
    form.append('parentFolderId', parentFolderId);
    return await this.boxService.createFolder(form);
  }
  async retreaveOriginalFile(userName: string, fileId: string) {
    return await this.boxService.getOriginalFile(userName, fileId);
  }
  async retreaveTextFile(userName: string, fileId: string) {
    return await this.boxService.getFile(fileId, userName);
  }
  async moveFolder(userId: string, folderId: string, toFolderId: string) {
    const form = new FormData();
    form.append('userId', userId);
    form.append('folderId', folderId);
    form.append('targetFolderId', toFolderId);
    const endPoint = 'move/folder';
    const result = await this.boxService.putReauest(endPoint, form);
    return result;
  }
  async moveFile(userId: string, fileId: string, folderId: string) {
    const form = new FormData();
    form.append('fromUserId', userId);
    form.append('fileId', fileId);
    form.append('folderId', folderId);
    const endPoint = 'move/file';
    const result = await this.boxService.putReauest(endPoint, form);
    return result;
  }
  async deleteFile(userId: string, fileId: string) {
    const form = new FormData();
    form.append('fromUserId', userId);
    form.append('fileId', fileId);
    const endPoint = 'delete/file';
    const result = await this.boxService.deleteRequest(endPoint, form);
    return result;
  }
  async deleteFolder(userId: string, folderId: string) {
    const form = new FormData();
    form.append('folderId', folderId);
    form.append('fromUserId', userId);
    const endPonit = 'delete/folder';
    const result = await this.boxService.deleteRequest(endPonit, form);
    return result;
  }
  async likeFile(userId: string, fileId: string) {
    const form = new FormData();
    form.append('fileId', fileId);
    form.append('userId', userId);
    const endPoint = 'like/file';
    const result = await this.boxService.putReauest(endPoint, form);
    return result;
  }
  async likeFolder(userId: string, folderId: string) {
    const form = new FormData();
    form.append('userId', userId);
    form.append('folderId', folderId);
    const endPoint = 'like/folder';
    const result = await this.boxService.putReauest(endPoint, form);
    return result;
  }
  async unLikeFile(userId: string, fileId: string) {
    const form = new FormData();
    form.append('fileId', fileId);
    form.append('userId', userId);
    const endPoint = 'unlike/file';
    const result = await this.boxService.putReauest(endPoint, form);
    return result;
  }
  async unLikeFolder(userId: string, folderId: string) {
    const form = new FormData();
    form.append('userId', userId);
    form.append('folderId', folderId);
    const endPoint = 'unlike/folder';
    const result = await this.boxService.putReauest(endPoint, form);
    return result;
  }

  async retreaveFaivorates(userId: string) {
    const endPoint = 'retrieve/favorites?userId=' + userId;
    const result = await this.boxService.getRequest(endPoint);
    return result;
  }
  async renameFile(userId: string, fileId: string, newName: string) {
    const endPoint = 'retrieve/file?username=' + userId + '&fileId=' + fileId;
    const originalFile = await this.boxService.getRequest(endPoint);
    const ext = originalFile.files[0].fileName.split('.').pop();
    const form = new FormData();
    form.append('fileId', fileId);
    form.append('fromUserId', userId);
    form.append('newName', newName + '.' + ext);
    const renameEndPoint = 'rename/file';
    const result = await this.boxService.putReauest(renameEndPoint, form);
    return result;
  }
  async renameFolder(userId: string, folderId: string, newName: string) {
    const form = new FormData();
    form.append('folderId', folderId);
    form.append('userId', userId);
    form.append('newName', newName);
    const endPoint = 'rename/folder';
    const result = await this.boxService.putReauest(endPoint, form);
    return result;
  }
  async scearch(userId: string, fileName: string) {
    const endPoint = `search?userId=${userId}&query="fileName":"${fileName}"`;
    const result = await this.boxService.getRequest(endPoint);
    return result;
  }
  async getFolders(userId: string) {
    const endPoint = `search?userId=${userId}&query="fileType": "folder"`;
    const result = await this.boxService.getRequest(endPoint);
    return result;
  }
  async downloadPage(urls: string[], userId: string) {
    const result = await this.getFolders(userId);
    const downloadsFolder = result.files.filter((fileData) => {
      if (fileData.fileName == 'Downloads') return fileData;
    });
    if (downloadsFolder.length != 1) {
      await this.createBookShelf(userId, 'Downloads', '0');
    }
    const promises = urls.map(async (url) => {
      const names = url.split('/');
      const bufferData = await this.bingService.downloadPage(url);
      const form = new FormData();
      const blob = new Blob([bufferData], { type: 'application/octet-stream' });
      form.append('file', blob);
      form.append('userName', userId);
      form.append(
        'fileName',
        names[names.length - 1] + '-' + Date.now() + '.pdf',
      );
      form.append('parentFolderId', downloadsFolder[0].id);
      const result = await this.boxService.uploadDocument(form);
      return result;
    });

    const textList = await Promise.all(promises);
    return textList;
  }
  getFolderId(allData: any, folderName: string) {
    let downloadsId = '';
    allData.files.forEach((folder) => {
      if (folder.fileName == folderName) {
        downloadsId = folder.id;
      }
    });
    if (downloadsId != '') {
      return downloadsId;
    } else {
      return false;
    }
  }
  async retreaveAllFiles(folderId: string, userEmail: string) {
    const allFiles = [];
    const allFolder = [folderId];
    while (allFolder.length > 0) {
      const currentFolder = allFolder.shift();
      const folderContent = await this.getDocuemnts(userEmail, currentFolder);
      if (folderContent?.files?.length > 0) {
        folderContent.files.forEach((item) => {
          if (item.fileType == 'folder') {
            allFolder.push(item.id);
          } else {
            allFiles.push(item);
          }
        });
      }
    }
    return { length: allFiles.length, content: allFiles };
  }
  extractDownloadLinks(files: any[]) {
    const allLinks = {
      download: [],
      thumbnail: [],
      preview: [],
    };
    files.forEach((file) => {
      allLinks.download.push(file.downloadUrl);
      allLinks.preview.push(file.previewUrl);
      allLinks.thumbnail.push(file.thumbnailUrl);
    });
    return allLinks;
  }

  async uploadDefaultsFile1(userEmail: string) {
    const file1 = join(
      __dirname,
      '..',
      '..',
      '..',
      'assets',
      'default',
      'file1.pdf',
    );
    const fileContent = fs.readFileSync(file1);
    const arrayBuffer = fileContent.buffer;

    // Create a new Blob from the ArrayBuffer
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const formData1 = new FormData();
    formData1.append('file', blob, 'file1.pdf');
    formData1.append('userName', userEmail);
    formData1.append(
      'fileName',
      'On the electrodynamics of moving bodies by Albert Einstein',
    );
    formData1.append('parentFolderId', '0');
    console.log(formData1.get('file'));
    const uploadResult = await this.boxService.uploadDocument(formData1);
    console.log(uploadResult);
    return;
  }
  async uploadDefaultsFile2(userEmail: string) {
    const file1 = join(
      __dirname,
      '..',
      '..',
      '..',
      'assets',
      'default',
      'file2.pdf',
    );
    const fileContent = fs.readFileSync(file1);
    const arrayBuffer = fileContent.buffer;

    // Create a new Blob from the ArrayBuffer
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const formData1 = new FormData();
    formData1.append('file', blob, 'file2.pdf');
    formData1.append('userName', userEmail);
    formData1.append(
      'fileName',
      'Reconstruction of the Apollo 11 Moon Landing Final Descent Trajectory - NASA',
    );
    formData1.append('parentFolderId', '0');
    console.log(formData1.get('file'));
    const uploadResult = await this.boxService.uploadDocument(formData1);
    console.log(uploadResult);
    return;
  }
}
