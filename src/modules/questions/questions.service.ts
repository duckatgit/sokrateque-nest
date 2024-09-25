import {
  ForbiddenException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { ApiServiceService } from 'src/core/services/api-service/api-service.service';
import { BingService } from 'src/core/services/bing/bing.service';
import { BoxServiceService } from 'src/core/services/box-service/box-service.service';
import { UserService } from '../user/user.service';
import { GptServicesService } from 'src/core/services/gpt-services/gpt-services.service';
import { StanderdisationService } from 'src/core/services/standerdisation/standerdisation.service';
import { BookShelfService } from '../book-shelf/book-shelf.service';
import { SpecialGeneratorService } from 'src/core/services/special-generator/special-generator.service';
import { SessionsService } from '../sessions/sessions.service';
import { AnalyzerPromptsService } from 'src/core/services/analyzer-prompts/analyzer-prompts.service';
import { LargeFileTesting } from './dtos/largeTesting.dto';
// import { GHelperService } from 'src/core/services/g-drive/g-drive.servic                  e';
import { GDriveService } from '../g-drive/g-drive.service';
// import { Observable } from 'rxjs';

@Injectable()
export class QuestionsService {
  constructor(
    private apiService: ApiServiceService,
    private bingService: BingService,
    private boxService: BoxServiceService,
    private userService: UserService,
    private gptService: GptServicesService,
    private standardService: StanderdisationService,
    private bookShelfService: BookShelfService,
    private specialService: SpecialGeneratorService,
    private standerdService: StanderdisationService,
    private sessionService: SessionsService,
    private analyzePromptService: AnalyzerPromptsService,
    private gdService: GDriveService,
  ) {}

  async askQuestion(bookData: { context: string; question: string }) {
    const result = await this.apiService.albertApiCall(bookData);
    return result;
  }
  async getWebsites(question: string, count: number, offset: number) {
    // console.log('searching');
    const result = await this.bingService.askBing(question, count, offset);
    // console.log(result);
    return result;
  }
  async scrapeWebsite(webUri: string) {
    // return new Observable((observer) => {
    //   webUri.map((url) => {});
    // });
    const getText = await this.bingService.getPageString(webUri);
    return getText;
  }
  async askingAlbert(question: string, content: string) {
    const payload = {
      question: question,
      context: content,
    };
    const albertResp = await this.apiService.albertApiCall(payload);
    return albertResp;
  }
  async gptFormatingPrompt(question: string, text: string) {
    const prompt = this.analyzePromptService.standerdisationGptPrompt(
      question,
      text,
    );
    return prompt;
  }
  async gptAnswerPrompt(question: string, text: string) {
    const prompt = this.standardService.noAlbertBingPrompt(question, text);
    return prompt;
  }
  async gptAnaswering(prompt: string) {
    const text = await this.gptService.chatGptFormatting(prompt);
    return text;
  }
  async gpt35Answering(prompt: string) {
    const text = await this.gptService.specialTurbo(prompt);
    return text;
  }
  async gpt4oAnswering(prompt: string) {
    const text = await this.gptService.testing4o(prompt);
    return text;
  }

  async getTextFromPdf(fileId: string, userEmail: string) {
    const context = await this.boxService.getFile(fileId, userEmail);
    return context;
  }

  async getFilesFromFolder(folderId: string, userEmail: string) {
    const files = await this.bookShelfService.getDocuemnts(userEmail, folderId);
    const values = files.files.filter((value) => {
      return value.fileType != 'folder';
    });
    console.log(values);
    return values;
  }

  // async properLooping(quesiton:string,offset:number = 0){
  //   return new Observable((observer)=>{
  //     const count = 10;
  //   })
  // }
  async askBing(question: string, model: string) {
    const now = Date.now();
    let totalTimeSaved = 0;
    const gptAnswer = [];
    let offset = 0;
    const count = 10;
    let analysisCount = 0;
    const coefficents = [];
    console.log('starting loop');
    while (gptAnswer.length < 5) {
      if (offset >= 100 && gptAnswer.length < 5)
        throw new NotFoundException(
          'un able to find solution to this question',
        );
      analysisCount++;
      let tempAnswer: any;
      if (model == 'albert') {
        tempAnswer = await this.analyzeBingAnswers(question, count, offset);
      } else {
        tempAnswer = await this.analyzeBingNoAlbert(
          question,
          count,
          offset,
          model,
        );
        console.log('back home');
      }
      coefficents.push(tempAnswer.coefficent);
      tempAnswer.data = tempAnswer.data.filter((answer) => {
        if (answer != false) return answer;
      });
      tempAnswer.data.forEach((ans) => {
        gptAnswer.push(ans);
        totalTimeSaved += ans.timeSaved;
      });
      offset += count;
      console.log(gptAnswer.length);
    }
    console.log('got all values', Date.now() - now);
    const payload = {
      question: question,
      answer: [],
    };
    gptAnswer.forEach((results) => {
      payload.answer.push(results.text);
    });
    console.log('before followup');
    const followup = await this.getFollowUpQuestions(payload);
    const finalFormat = this.standardService.globalAnswerFromat(
      question,
      gptAnswer,
      Date.now() - now,
      followup.split('\n'),
      totalTimeSaved,
      analysisCount,
    );
    return { data: finalFormat, coefficents };
  }

  async getAnswersFromFolder(
    userId: string,
    folderId: string,
    question: string,
  ) {
    try {
      const now = Date.now();
      const files = await this.bookShelfService.getDocuemnts(userId, folderId);
      if (!files) throw new NotFoundException('no files present in the folder');
      const values = files.files.filter((value) => {
        return value.fileType != 'folder';
      });
      let totalTimeSaved = 0;
      const promises = values.map(async (value) => {
        const context = await this.boxService.getFile(value.id, userId);
        const payload = {
          context: context,
          question,
        };
        const result = await this.apiService.albertApiCall(payload);
        if (result.length <= 0)
          throw new NotAcceptableException(
            'albert could not answer this question form the given files',
          );
        const prompt = this.analyzePromptService.standerdisationGptPrompt(
          question,
          result[0].text,
        );
        const originalFile = await this.boxService.getOriginalFile(
          userId,
          value.id,
        );
        totalTimeSaved += this.specialService.calculateTimeSaved(context);
        const text = await this.gptService.chatGptFormatting(prompt);
        const temp = this.standardService.standerdizeResults(
          text,
          'albert',
          result[0].probability,
          '',
          this.specialService.calculateTimeSaved(context),
          originalFile,
          result[0].text,
        );
        return temp;
      });
      const gptAnswer = await Promise.all(promises);
      const payload = {
        question: question,
        answer: [],
      };
      gptAnswer.forEach((answer) => {
        payload.answer.push(answer.text);
      });
      const followup = await this.getFollowUpQuestions(payload);
      const finalFormat = this.standardService.globalAnswerFromat(
        question,
        gptAnswer,
        Date.now() - now,
        followup.split('\n'),
        totalTimeSaved,
        1,
      );
      if (gptAnswer) {
        return finalFormat;
      }
    } catch (error) {
      console.error(error);
    }
  }
  async getGoogleAnswers(
    htmlcontent: string,
    fileId: string,
    userId: string,
    question: string,
  ) {
    const now = Date.now();
    // const content: string = await this.gdService.getFile(htmlcontent);
    const payload = {
      context: htmlcontent,
      question,
    };

    const result = await this.apiService.albertApiCall(payload);

    if (result.length <= 0)
      throw new NotFoundException('un able to find answer');
    const prompt = this.analyzePromptService.standerdisationGptPrompt(
      question,
      result[0].text,
    );
    const originalFile = fileId;
    const totalTimeSaved = this.specialService.calculateTimeSaved(htmlcontent);
    const text = await this.gptService.chatGptFormatting(prompt);
    const temp = this.standardService.standerdizeResults(
      text,
      'albert',
      result[0].probability,
      '',
      this.specialService.calculateTimeSaved(htmlcontent),
      originalFile,
      result[0].text,
    );
    const newpayload = {
      question: question,
      answer: [],
    };
    newpayload.answer.push(temp.text);
    const followup = await this.getFollowUpQuestions(newpayload);
    const finalFormat = this.standardService.globalAnswerFromat(
      question,
      [temp],
      Date.now() - now,
      followup.split('\n'),
      totalTimeSaved,
      1,
    );
    return finalFormat;
  }
  async getAnswersFromFilesNoAlbert(
    filesList: string[],
    question: string,
    userId: string,
    model: string,
  ) {
    const now = Date.now();
    let totalTimeSaved = 0;
    const promises = filesList.map(async (value) => {
      const context = await this.boxService.getFile(value, userId);
      const prompt = this.standardService.noAlbertBingPrompt(question, context);
      const originalFile = await this.boxService.getOriginalFile(userId, value);
      totalTimeSaved += this.specialService.calculateTimeSaved(context);
      let text = '';
      if (model == 'gpt-4o') {
        text = await this.gptService.specialTurbo(prompt);
      } else if (model == 'gpt-3.5') {
        text = await this.gptService.specialTurbo(prompt);
      }
      const temp = this.standardService.standerdizeResults(
        text,
        'albert',
        1,
        '',
        this.specialService.calculateTimeSaved(context),
        originalFile,
      );
      return temp;
    });
    const gptAnswer = await Promise.all(promises);
    const payload = {
      question: question,
      answer: [],
    };
    gptAnswer.forEach((result) => {
      payload.answer.push(result.text);
    });
    const followup = await this.getFollowUpQuestions(payload);
    const finalFormat = this.standardService.globalAnswerFromat(
      question,
      gptAnswer,
      Date.now() - now,
      followup.split('\n'),
      totalTimeSaved,
      filesList.length,
    );
    return finalFormat;
  }
  async getAnswersFromFiles(
    filesList: string[],
    question: string,
    userId: string,
  ) {
    const now = Date.now();
    let totalTimeSaved = 0;
    const promises = filesList.map(async (value) => {
      const context = await this.boxService.getFile(value, userId);
      const payload = {
        context: context,
        question,
      };
      const result = await this.apiService.albertApiCall(payload);
      if (result.length <= 0)
        throw new NotFoundException('un able to find answer');
      const prompt = this.analyzePromptService.standerdisationGptPrompt(
        question,
        result[0].text,
      );
      const originalFile = await this.boxService.getOriginalFile(userId, value);
      totalTimeSaved += this.specialService.calculateTimeSaved(context);
      const text = await this.gptService.chatGptFormatting(prompt);
      const temp = this.standardService.standerdizeResults(
        text,
        'albert',
        result[0].probability,
        '',
        this.specialService.calculateTimeSaved(context),
        originalFile,
        result[0].text,
      );
      return temp;
    });
    const gptAnswer = await Promise.all(promises);
    const payload = {
      question: question,
      answer: [],
    };
    gptAnswer.forEach((result) => {
      payload.answer.push(result.text);
    });
    const followup = await this.getFollowUpQuestions(payload);
    const finalFormat = this.standardService.globalAnswerFromat(
      question,
      gptAnswer,
      Date.now() - now,
      followup.split('\n'),
      totalTimeSaved,
      filesList.length,
    );
    return finalFormat;
  }
  async askChat(quesiton: string) {
    const now = Date.now();
    const result = await this.gptService.chatGptFormatting(quesiton);
    const payload = {
      question: quesiton,
      answer: [result],
    };
    const followup = await this.getFollowUpQuestions(payload);
    const temp = this.standardService.standerdizeResults(
      result,
      'chat-gpt',
      0,
      '',
      0,
      {},
      '',
    );
    const finalFormat = this.standardService.globalAnswerFromat(
      quesiton,
      [temp],
      Date.now() - now,
      followup.split('\n'),
      0,
      0,
    );
    return finalFormat;
  }
  async getFollowUpQuestions(data: { question: string; answer: string[] }) {
    const text = this.standardService.getFollowUpPrompt(
      data.question,
      data.answer,
    );
    const result = await this.gptService.chatGptFormatting(text);
    return result;
  }
  async analyzeBingNoAlbert(question: string, count, offset, model: string) {
    const now = Date.now();
    const result = await this.bingService.askBing(question, count, offset);

    const coefficent = {
      albert: {
        count: 0,
        details: [],
      },
      scraping: {
        count: 0,
        details: [],
      },
      chatGpt: {
        count: 0,
        detail: [],
      },
      packet: {
        count: 0,
        detail: [],
      },
      individual: {
        count: 0,
        detail: [],
      },
    };
    // const coefficent = {
    //   albert: {
    //     count: 0,
    //     details: [],
    //   },
    //   scraping: {
    //     count: 0,
    //     details: [],
    //   },
    //   chatGpt: {
    //     count: 0,
    //     detail: [],
    //   },
    // };
    const promises = result.map(async (value) => {
      const now = Date.now();
      const getText = await this.bingService.getPageString(value.url);
      const temp = {
        time: Date.now() - now,
        url: value.url,
      };
      coefficent.scraping.count++;
      coefficent.scraping.details.push(temp);
      if (getText != 'cannot-work') {
        const gpt = Date.now();
        const prompt = this.standardService.noAlbertBingPrompt(
          question,
          getText,
        );
        let gptResult = '';
        if (model == 'gpt-4o') {
          gptResult = await this.gptService.chatGptFormatting(prompt);
        } else if (model == 'gpt-3.5') {
          gptResult = await this.gptService.specialTurbo(prompt);
        }
        const temp3 = {
          time: Date.now() - gpt,
          url: value.url,
        };
        coefficent.chatGpt.count++;
        coefficent.chatGpt.detail.push(temp3);
        const temp = this.standardService.standerdizeResults(
          gptResult,
          'albert',
          1,
          value.url,
          this.specialService.calculateTimeSaved(getText),
          {},
        );
        coefficent.individual.count++;
        coefficent.individual.detail.push({
          time: Date.now() - now,
          url: value.url,
        });
        return temp;
      } else {
        coefficent.individual.count++;
        coefficent.individual.detail.push({
          time: Date.now() - now,
          url: value.url,
        });
        return false;
      }
    });
    const tempAnswer = await Promise.all(promises);
    coefficent.packet.count++;
    coefficent.packet.detail.push({
      time: Date.now() - now,
      order: offset + '-' + count,
    });
    return { data: tempAnswer, coefficent };
  }
  async analyzeBingAnswers(question: string, count, offsett) {
    const now = Date.now();
    const result = await this.bingService.askBing(question, count, offsett);
    const coefficent = {
      albert: {
        count: 0,
        details: [],
      },
      scraping: {
        count: 0,
        details: [],
      },
      chatGpt: {
        count: 0,
        detail: [],
      },
      packet: {
        count: 0,
        detail: [],
      },
      individual: {
        count: 0,
        detail: [],
      },
    };
    const promises = result.map(async (value) => {
      const now = Date.now();
      const getText = await this.bingService.getPageString(value.url);
      const temp = {
        time: Date.now() - now,
        url: value.url,
      };
      coefficent.scraping.count++;
      coefficent.scraping.details.push(temp);

      if (getText != 'cannot-work') {
        const payload = {
          question: question,
          context: getText,
        };
        const albert = Date.now();
        const albertResp = await this.apiService.albertApiCall(payload);
        const temp2 = {
          time: Date.now() - albert,
          url: value.url,
        };
        coefficent.albert.count++;
        coefficent.albert.details.push(temp2);
        if (!albertResp) return false;
        if (albertResp[0]?.text) {
          const formated = this.analyzePromptService.standerdisationGptPrompt(
            question,
            albertResp[0]?.text,
          );
          const gpt = Date.now();
          const text = await this.gptService.chatGptFormatting(formated);
          const temp3 = {
            time: Date.now() - gpt,
            url: value.url,
          };
          coefficent.chatGpt.count++;
          coefficent.chatGpt.detail.push(temp3);

          const temp = this.standardService.standerdizeResults(
            text,
            'albert',
            albertResp[0].probability,
            value.url,
            this.specialService.calculateTimeSaved(getText),
            {},
            albertResp[0]?.text,
          );
          coefficent.individual.count++;
          coefficent.individual.detail.push({
            time: Date.now() - now,
            url: value.url,
          });
          return temp;
        } else {
          coefficent.individual.count++;
          coefficent.individual.detail.push({
            time: Date.now() - now,
            url: value.url,
          });
          return false;
        }
      } else {
        coefficent.individual.count++;
        coefficent.individual.detail.push({
          time: Date.now() - now,
          url: value.url,
        });
        return false;
      }
    });
    const tempAnswer = await Promise.all(promises);
    coefficent.packet.count++;
    coefficent.packet.detail.push({
      time: Date.now() - now,
      order: offsett + '-' + count,
    });
    return { data: tempAnswer, coefficent };
  }
  async askUrl(url: string, question: string) {
    const now = Date.now();
    const text = await this.bingService.getPageString(url);
    if (text == 'cannot-work') {
      throw new ForbiddenException('the website is not allowed to be accessed');
    }
    const payload = {
      context: text,
      question: question,
    };
    const albertResult = await this.apiService.albertApiCall(payload);
    const formated = this.analyzePromptService.standerdisationGptPrompt(
      question,
      albertResult[0].text,
    );
    const gptResult = await this.gptService.chatGptFormatting(formated);
    const followuppayload = {
      question: question,
      answer: [gptResult],
    };
    const followup = await this.getFollowUpQuestions(followuppayload);
    const totalTimeSaved = this.specialService.calculateTimeSaved(text);
    const temp = this.standardService.standerdizeResults(
      gptResult,
      'albert',
      albertResult[0].probability,
      url,
      totalTimeSaved,
      {},
      albertResult[0].text,
    );
    const finalFormat = this.standardService.globalAnswerFromat(
      question,
      [temp],
      Date.now() - now,
      followup.split('\n'),
      totalTimeSaved,
      1,
    );
    return finalFormat;
  }
  async getSessionSummary(sessionId: string) {
    const sessions = await this.sessionService.findAllSession(sessionId);
    const result = await this.sessionHistoryManagement(sessions);
    return result;
  }
  async questionSummary(answers: string[], question: string) {
    const result = this.resolveHistories(answers, question);
    return result;
  }
  async resolveAnswers(sessions: any[]) {
    const formattedValues = [];
    sessions.forEach((session) => {
      const answer = JSON.parse(session.answer);
      const temp = {
        question: session.question,
        answer: [],
      };
      answer.answer.forEach((ans) => {
        temp.answer.push(ans.text);
      });
      formattedValues.push(temp);
    });
    let prepText = '\n\n';
    formattedValues.forEach((value) => {
      prepText = prepText + `question: ${value.question}\n answers:\n`;
      value.answer.forEach((answer: string, index: number) => {
        prepText = prepText + `\t (0${index + 1}) ${answer}\n`;
      });
    });
    const text = this.analyzePromptService.answersSummary(prepText, '');
    const gptResult = await this.gptService.chatGptFormatting(text);
    return gptResult;
  }
  async resolveHistories(sessions: any[], question: string) {
    let prepText = '\n\n';
    sessions.forEach((value, index) => {
      prepText += `(0${index + 1}). "${value}" \n`;
    });
    const text = this.analyzePromptService.answersSummary(prepText, question);
    const gptResult = await this.gptService.chatGptFormatting(text);
    return gptResult;
  }

  async sessionHistoryManagement(sessions: any[]) {
    let finaltext = '';
    sessions.forEach((session, index) => {
      const values = JSON.parse(session.answer);
      finaltext += `question ${index + 1}: ${values.question}\n answers: \n`;
      values.answer.forEach((ans) => {
        finaltext += `\t${ans.text} \n`;
      });
    });
    const text = this.analyzePromptService.sessionSummaries(finaltext);
    const gptResult = await this.gptService.chatGptFormatting(text);
    return gptResult;
  }

  //testing functions
  async prompttesting(text: string) {
    const gptResult = await this.gptService.chatGptFormatting(text);
    return gptResult;
  }

  async albertTesting(fileId: string, question: string, email: string) {
    const now = Date.now();
    const context = await this.boxService.getFile(fileId, email);
    const payload = {
      context: context,
      question,
    };
    const boxTime = Date.now() - now;
    const newnow = Date.now();
    const result = await this.apiService.albertApiCall(payload);
    const timeTaken = Date.now() - newnow;
    return { timeTaken, boxTime, result };
  }

  async largeFileTesting(data: LargeFileTesting, userEmail: string) {
    const content = await this.boxService.getFile(data.fileId, userEmail);
    const result = await this.gptService.testingchunkerGptRequest(
      data.PrimaryPrompt,
      data.SecondaryPrompt,
      data.keyWord,
      content,
    );
    return result;
  }

  async testingNews() {
    const result: any = await this.bingService.BingNews();
    const headlines = [];
    if (!result) throw new ForbiddenException('new not retreavable');
    result!.forEach((news) => {
      headlines.push(news.name);
    });
    const prompt = this.analyzePromptService.newsAnalyzer(headlines);
    const gptResult = await this.gptService.chatGptFormatting(prompt);
    return gptResult.split('\n');
  }
  async getHeadlines() {
    const result = await this.bingService.BingNews();
    const headlines = [];
    result!.forEach((news) => {
      headlines.push(news.name);
    });
    return headlines;
  }
  async getStirng(url: string) {
    const result = await this.bingService.getPageString(url);
    return result;
  }
  async promptTesting4o(prompt: string) {
    const result = await this.gptService.testing4o(prompt);
    return result;
  }
  async promptTesting35(prompt: string) {
    const result = await this.gptService.specialTurbo(prompt);
    return result;
  }
}
