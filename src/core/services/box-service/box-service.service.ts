import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  RequestTimeoutException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
// import { Observable } from 'rxjs';
// import { AxiosResponse } from 'axios';
import { BOX_URI } from 'src/config';
// import * as FormData from 'form-data';
// import { QUESTION_ERROR } from 'src/core/messages';
// import * as pdfParse from 'pdf-parse';
// import * as fs from 'fs';
@Injectable()
export class BoxServiceService {
  private box_uri = BOX_URI;
  constructor(private readonly httpService: HttpService) {}
  async getUserDocuments(userName: string, folerId: string) {
    try {
      const endPoint =
        this.box_uri +
        'retrieve/files?userName=' +
        userName +
        '&parentFolderId=' +
        folerId;
      const result = await this.httpService.axiosRef({
        method: 'GET',
        responseType: 'json',
        url: endPoint,
      });
      return result;
    } catch (error) {
      console.error(error);
      throw new RequestTimeoutException('the request timed out');
    }
  }
  async uploadDocument(form: FormData) {
    try {
      const endPoint = this.box_uri + 'upload/file';
      const result = await this.httpService.axiosRef({
        method: 'POST',
        responseType: 'json',
        url: endPoint,
        timeout: 120000,
        data: form,
      });
      if (result.data) {
        return result.data;
      }
    } catch (error) {
      console.error('newErrro:', error);
      throw new InternalServerErrorException(error.response.data.message);
    }
  }
  async createFolder(folderData: FormData) {
    try {
      const endPoint = this.box_uri + 'create/folder';
      const result = await this.httpService.axiosRef({
        method: 'POST',
        responseType: 'json',
        url: endPoint,
        data: folderData,
      });
      if (result.data) {
        return result.data;
      }
    } catch (error) {
      console.error(error.response.data);
      throw new ForbiddenException(error.response.data.message);
    }
  }
  async getFile(fileId: string, userName: string) {
    try {
      const endPoint =
        this.box_uri +
        'retrieve/file/text?fileId=' +
        fileId +
        '&userId=' +
        userName;
      const result = await this.httpService.axiosRef({
        method: 'GET',
        responseType: 'json',
        url: endPoint,
      });
      return result.data;
    } catch (error) {
      console.error(error.response);
      throw new ForbiddenException('api server error');
    }
  }
  async getOriginalFile(username: string, fileId: string) {
    try {
      const endPoint =
        this.box_uri +
        'retrieve/file?username=' +
        username +
        '&fileId=' +
        fileId;
      const result = await this.httpService.axiosRef({
        method: 'GET',
        responseType: 'json',
        url: endPoint,
      });
      return result.data.files[0];
    } catch (error) {
      console.error(error);
    }
  }
  async putReauest(endPoint: string, data: FormData) {
    try {
      const url = this.box_uri + endPoint;
      const result = await this.httpService.axiosRef({
        method: 'PUT',
        data: data,
        url: url,
      });
      return result.data;
    } catch (error) {
      console.error(error);
    }
  }
  async deleteRequest(endPoint: string, data: FormData) {
    try {
      const url = this.box_uri + endPoint;
      const result = await this.httpService.axiosRef({
        method: 'DELETE',
        data: data,
        url: url,
      });
      return result.data;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'internal server error:' + error.response.data.message,
      );
    }
  }
  async getRequest(endPoint: string) {
    try {
      const url = this.box_uri + endPoint;
      const result = await this.httpService.axiosRef({
        method: 'GET',
        url: url,
      });
      return result.data;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'internal server error: ' + error.response.data.message,
      );
    }
  }
}
