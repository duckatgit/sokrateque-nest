import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import pinecone from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';
@Injectable()
export class FlowiseService {
  $pineConeKey: string = '';
  $openAiKey: string = '';

  constructor(private readonly httpService: HttpService) {}

  async testingQuestions(question: string, content: string) {
    try {
      // console.log(content);
      const endPoint =
        'https://flowiseai-railway-production-1cf4.up.railway.app/api/v1/prediction/a98de876-1399-4603-a7a4-8f37656ea026';
      const result = await this.httpService.axiosRef({
        method: 'POST',
        timeout: 300000,
        url: endPoint,
        headers: {
          Authorization: 'Bearer fh6uh5+lRKArrHPEXVbSnIWzyNKkB6VgPR8Td4cvxmA=',
          'Content-Type': 'application/json',
        },
        data: {
          overrideConfig: {
            text: content,
          },
          question: JSON.stringify(question),
        },
      });
      // console.log(result.data, 'this is the data');
      return result.data;
    } catch (error) {
      console.error('an error has occoured', error);
      throw new InternalServerErrorException('internal server error');
    }
  }
  async uploadDocument(text: string) {}
}
