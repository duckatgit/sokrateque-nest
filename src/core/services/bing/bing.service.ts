import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { GptServicesService } from '../gpt-services/gpt-services.service';
import { StanderdisationService } from '../standerdisation/standerdisation.service';
import { ApiServiceService } from '../api-service/api-service.service';
// import { ApiBadRequestResponse } from '@nestjs/swagger';
// import https from 'https';
// import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
// import { access } from 'fs';
// import { count } from 'console';

@Injectable()
export class BingService {
  $accessKey = '379bfe6adde24750bfd9c2fe5ca49dc3';
  $endpoint = 'https://api.bing.microsoft.com/v7.0/search';

  constructor(
    private readonly httpService: HttpService,
    private gptService: GptServicesService,
    private standerdService: StanderdisationService,
    private apiService: ApiServiceService,
  ) {}

  async askBing(query, count, offset) {
    try {
      const encoded = encodeURIComponent(query);
      const accessKey = 'a6510cd16c834b36ae8d22e45e63b288';
      const endpoint =
        this.$endpoint + '?q=' + encoded + `&count=${count}&offset=${offset}`;
      console.log(endpoint);
      const result = await this.httpService.axiosRef({
        method: 'GET',
        url: endpoint,
        headers: {
          'Ocp-Apim-Subscription-Key': accessKey,
        },
      });
      const values = result.data.webPages.value;
      // console.log(result);
      return values;
    } catch (error) {
      console.error(error);
      throw new ForbiddenException('encountered bad request');
    }
  }
  async getPageString(pageUri: string) {
    try {
      const data = await this.httpService.axiosRef({
        method: 'Post',
        url: 'https://staging.sokrateque.ai/scrapping/webscrap/api/getresult',
        data: {
          url: pageUri,
        },
      });
      return data.data.content;
    } catch (error) {
      return 'cannot-work';
    }
  }
  async downloadPage(pageUrl: string) {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 500000 }); // 500 seconds

      await page.emulateMediaType('screen');

      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
        printBackground: true,
      });

      await browser.close();

      return pdfBuffer;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('internal server error');
    }
  }
  async BingNews() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // return new Promise(async (resolve, reject) => {
    try {
      const accessKey = 'a6510cd16c834b36ae8d22e45e63b288';
      const endpoint = `https://api.bing.microsoft.com/v7.0/news?category=Business&&mkt=en-GB&setLang=EN&cc=EN`;
      const response = await this.httpService.axiosRef({
        method: 'GET',
        url: endpoint,
        headers: {
          'Ocp-Apim-Subscription-Key': accessKey,
        },
      });

      return response.data.value;
      // .subscribe((data) => {
      //   console.log(data.data.value);
      //   resolve(data.data.value);
      // });
    } catch (error) {
      console.error(error.response.data);
      console.log(error.response.data);
      throw new InternalServerErrorException('internal server error');
    }
    // });
  }
  async scrapeWebPage(url: string): Promise<string> {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url);

      // Example: Extract the text content from all paragraphs
      const paragraphElements = await page.$$('p');
      const pageContent = await Promise.all(
        paragraphElements.map(async (element) => {
          return await element.evaluate((node) => node.textContent);
        }),
      );

      await browser.close();
      return pageContent.join('\n');
    } catch (error) {
      console.error('Error during Puppeteer scraping:', error.message);
      return 'Error occurred during scraping';
    }
  }
}
