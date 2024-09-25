import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as cheerio from 'cheerio';
@Injectable()
export class GHelperService {
  constructor(private readonly httpService: HttpService) {}
  async extractText(token: string, documentId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // return new Promise((resolve, reject) => {
    try {
      const response = await this.httpService.axiosRef({
        method: 'Get',
        url: `https://www.googleapis.com/drive/v3/files/${documentId}/export?mimeType=text/html`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const $data = cheerio.load(response.data);
      const isSnippetPresent = $data('body').text();
      console.log(isSnippetPresent);
      return isSnippetPresent;
    } catch (error) {
      console.error(error.response);
      throw new InternalServerErrorException('internal server error');
    }
  }
}
