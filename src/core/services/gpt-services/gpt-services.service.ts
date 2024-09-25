import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { GPT_ENDPOINT, GPT_KEY } from 'src/config';
@Injectable()
export class GptServicesService {
  private readonly endPoint = GPT_ENDPOINT;
  private readonly key = GPT_KEY;
  constructor(private readonly httpService: HttpService) {}
  async chatGptFormatting(context: string) {
    try {
      console.log(context.length);
      if (context.length > 5000) {
        const resulting = await this.chunkerGptRequest(context);
        if (!resulting) {
          console.error('an errrr occoured');
        }
        return resulting.toString();
      } else {
        console.log('3.5');
        const query = {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: context,
            },
          ],
          max_tokens: 2000,
        };
        const result = await this.httpService.axiosRef({
          method: 'POST',
          url: this.endPoint,
          data: query,
          timeout: 60000,
          maxContentLength: 500 * 1000 * 1000,
          headers: {
            Authorization: this.key,
            'Content-Type': 'application/json',
          },
        });
        if (result.data.choices[0]) {
          return result.data.choices[0].message.content;
        }
      }
    } catch (error) {
      console.error(error);
      throw new ForbiddenException('internal server error');
    }
  }
  async testing4o(context: string) {
    const resulting = await this.chunkerGptRequest(context);
    if (!resulting) {
      console.error('an errrr occoured');
    }
    return resulting.toString();
  }
  async specialTurbo(prompt: string) {
    try {
      console.log('3.5-turbo');
      const max_tokens = 10000;
      const chunks = this.splitIntoChunks(prompt, max_tokens);
      const summarycompilation = [
        {
          role: 'user',
          content: chunks[0],
        },
      ];
      for (let i = 0; i < chunks.length - 1; i++) {
        // const query = {
        //   model: 'gpt-3.5-turbo',
        //   messages: summarycompilation,
        //   temperature: 0.5,
        //   max_tokens: 2000,
        // };
        // const result = await this.httpService.axiosRef({
        //   method: 'POST',
        //   url: this.endPoint,
        //   data: query,
        //   timeout: 60000,
        //   maxContentLength: 500 * 1000 * 1000,
        //   headers: {
        //     Authorization: this.key,
        //     'Content-Type': 'application/json',
        //   },
        // });
        summarycompilation.push({
          role: 'user',
          content: chunks[i],
        });
      }
      summarycompilation.push({
        role: 'user',
        content: 'Data fully sent',
      });
      const query = {
        model: 'gpt-3.5-turbo',
        messages: summarycompilation,
        // temperature: 0.5,
        // max_tokens: 2000,
      };
      const result = await this.httpService.axiosRef({
        method: 'POST',
        url: this.endPoint,
        data: query,
        timeout: 60000,
        maxContentLength: 500 * 1000 * 1000,
        headers: {
          Authorization: this.key,
          'Content-Type': 'application/json',
        },
      });
      return result.data.choices[0].message.content;
    } catch (error) {
      console.error('internal server error:-' + error);
      return false;
      // throw new InternalServerErrorException('internal server error');
    }
  }
  async chunkerGptRequest(prompt: string) {
    console.log('4o');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise(async (resolve, reject) => {
      try {
        const max_tokens = 8000;
        const chunks = this.splitIntoChunks(prompt, max_tokens);
        const messagesList = [];
        // const promises = chunks.map(async (chunk) => {
        chunks.forEach((chunk) => {
          const current = { role: 'user', content: chunk };
          messagesList.push(current);
        });
        // const messagesLists: any[] = await Promise.all(promises);
        const messagesLists = messagesList;
        messagesLists.push({ role: 'user', content: 'Data fully sent' });
        this.httpService
          .post(
            this.endPoint,
            {
              model: 'gpt-4o',
              // model: 'gpt-3.5-turbo',
              messages: messagesLists,
              // temperature: 0.5,
            },
            {
              headers: {
                Authorization: this.key, // Replace with your actual API key
                'Content-Type': 'application/json',
              },
              timeout: 60000,
            },
          )
          .subscribe({
            next: (data) => {
              resolve(data.data.choices[0].message.content);
            },
            error: (error) => {
              console.error('Error in subscription:', error);
              resolve(false);
              // return false;
            },
          });
      } catch (error) {
        console.error(error);
        throw new InternalServerErrorException('internal server error');
      }
    });
  }

  splitIntoChunks(prompt, maxLength) {
    const chunks = [];
    const cleanedString = prompt.replace(/ +/g, ' ');
    for (let i = 0; i < 16000; i += maxLength) {
      chunks.push(cleanedString.slice(i, i + maxLength));
    }
    return chunks;
  }

  // tesing seciton
  async testingchunkerGptRequest(
    primaryprompt: string,
    SecondaryPrompt: string,
    key: string,
    content: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise(async (resolve, reject) => {
      try {
        const max_tokens = 10000;
        const chunks = this.testingsplitIntoChunks(
          primaryprompt,
          SecondaryPrompt,
          content,
          max_tokens,
        );
        const messagesList = [];
        chunks.forEach((chunk) => {
          messagesList.push({ role: 'user', content: chunk });
          const response = this.httpService.post(
            this.endPoint,
            {
              model: 'gpt-4o',
              messages: messagesList,
              temperature: 0.5,
            },
            {
              headers: {
                Authorization: this.key, // Replace with your actual API key
                'Content-Type': 'application/json',
              },
              timeout: 20000,
            },
          );
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          response.subscribe((data) => {});
        });
        messagesList.push({ role: 'user', content: key });
        this.httpService
          .post(
            this.endPoint,
            {
              model: 'gpt-3.5-turbo',
              messages: messagesList,
              temperature: 0.5,
            },
            {
              headers: {
                Authorization: this.key, // Replace with your actual API key
                'Content-Type': 'application/json',
              },
              timeout: 20000,
            },
          )
          .subscribe({
            next: (data) => {
              resolve(data.data.choices[0].message.content);
            },
            error: (error) => {
              console.error('Error in subscription:', error);
            },
          });
      } catch (error) {
        console.error('new error: ', error);
        throw new InternalServerErrorException('gpt rate limit exceeded');
      }
    });
  }

  testingsplitIntoChunks(
    primaryPrompt: string,
    secondaryPrompt: string,
    content: string,
    maxLength: number,
  ) {
    const chunks = [primaryPrompt, secondaryPrompt];
    const cleanedString = content.replace(/ +/g, ' ');
    for (let i = 0; i < 2000000; i += maxLength) {
      chunks.push(cleanedString.slice(i, i + maxLength));
    }
    return chunks;
  }
}
