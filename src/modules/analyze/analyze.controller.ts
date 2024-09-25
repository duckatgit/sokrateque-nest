import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  Sse,
  Res,
} from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { TockenGuard } from 'src/core/guards/tocken.guard';
import { AnalyzeService } from './analyze.service';
import { StanderdisationService } from 'src/core/services/standerdisation/standerdisation.service';
import { TryYourSelf } from './dtos/analyzeYourSelf.dto';
import { urlAnalyzer } from './dtos/urlprompts.dto';
import { SessionInterface } from 'src/core/interface/session.interface';
import { SessionsService } from '../sessions/sessions.service';
import { SpecialGeneratorService } from 'src/core/services/special-generator/special-generator.service';
// import { Observable, Subscriber } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UrlPrompt } from './dtos/urlWithPrompt.dto';
import { googleAnalysis } from './dtos/googleDocId.dto';
import { googleAnalysisYourself } from './dtos/googleTryYourSelf.dto';
import { Observable } from 'rxjs';
// import { content } from 'googleapis/build/src/apis/content';
// import { get } from 'https';
// import { NewsSummary } from './dtos/getNewsSummary.dot';
// import { subscribe } from 'diagnostics_channel';

@ApiTags('Analyze Module')
@Controller('analyze')
@ApiHeader({
  name: 'Authorizations',
  description: 'Auth token',
})
export class AnalyzeController {
  constructor(
    private analyzeService: AnalyzeService,
    private standerdistionService: StanderdisationService,
    private sessionService: SessionsService,
    private specialService: SpecialGeneratorService,
    private eventEmitter: EventEmitter2,
  ) {}
  @Post('start')
  @Sse()
  async startProcess(@Res() res: Response) {
    // return new Observable<any>((observer) => {
    //   setTimeout(() => {
    //     observer.next('1/5');
    //   }, 2000);
    //   setTimeout(() => {
    //     observer.next('2/5');
    //   }, 4000);
    //   setTimeout(() => {
    //     observer.next('3/5');
    //   }, 6000);
    //   setTimeout(() => {
    //     observer.next({ message: 'error has occoured' });
    //   }, 8000);
    //   setTimeout(() => {
    //     observer.next('5/5');
    //     observer.complete();
    //   }, 10000);
    // });
    res.setHeader('Content-Type', 'text/plain');
    res.flushHeaders(); // Flush the headers to establish a connection with the client
    // Simulate processing and send progress updates
    for (let i = 1; i <= 10; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate work
      res.write(`Progress ${i} of 10 complete...\n`); // Send progress update
    }
    // Once processing is done, send the final result
    res.write('COMPLETES');
    // res.json();
    res.end(); // Close the connection
  }
  @Get('newData')
  @Sse()
  async newData() {
    return new Observable<any>((observer) => {
      setTimeout(() => {
        observer.next('1/5');
      }, 2000);
      setTimeout(() => {
        observer.next('2/5');
      }, 4000);
      setTimeout(() => {
        observer.next('3/5');
      }, 6000);
      setTimeout(() => {
        observer.error({ message: 'error has occoured' });
      }, 8000);
      setTimeout(() => {
        observer.next('5/5');
        observer.complete();
      }, 10000);
    });
  }

  @Get('summarize-file/:fileId/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async getFileAnalysis(
    @Param('fileId') fileId: string,
    @Req() req: Request,
    @Param('parent') parent: string,
  ) {
    return new Observable<any>((observer) => {
      observer.next('0');
      const now = Date.now();
      const user = req['user'];
      this.analyzeService
        .sumarizeDocument(fileId, user.email)
        .then((result) => {
          observer.next('40');
          const totalTimeSaved = this.specialService.calculateTimeSaved(
            result.content,
          );
          const standard = [
            this.standerdistionService.standerdizeResults(
              result.gptResp,
              'chat-gpt',
              1,
              '',
              totalTimeSaved,
              result.original,
            ),
          ];
          const payload = {
            question: 'can you summarize this content',
            answer: [],
          };
          this.analyzeService.getFollowUpQuestions(payload).then((folloup) => {
            observer.next('60');
            const finalFormat = this.standerdistionService.globalAnswerFromat(
              'get open ended questions form this file',
              standard,
              Date.now() - now,
              folloup.split('\n'),
              totalTimeSaved,
              1,
            );
            const sessionData: SessionInterface = {
              question: 'get open ended questions form this file',
              questionType: 'analyze file',
              fileIds: [fileId],
              answer: JSON.stringify(finalFormat),
              isParent: parent === '0' ? true : false,
              parent: parent === '0' ? null : parent,
              userId: user.id,
            };
            this.sessionService.createSession(sessionData).then((session) => {
              // this.standerdistionService.successDataResponse(
              //   'successfully summarized file',
              //   finalFormat,
              //   session.parent,
              //   session.question,
              // );
              observer.next('95');
              const finalresult = {
                ...finalFormat,
                parent: session.parent,
                questionId: session.question,
                question: 'Summarize this file',
                questionType: 'Analyze file',
              };

              observer.next(JSON.stringify(finalresult));
              observer.complete();
            });
          });
        });
    });
  }

  @Get('get-theame/:fileId/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async getTheame(
    @Param('fileId') fileId: string,
    @Req() req: Request,
    @Param('parent') parent: string,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService.getFileTheam(fileId, user.email).then((result) => {
        observer.next('30');
        const totalTimeSaved = this.specialService.calculateTimeSaved(
          result.content,
        );
        const standard = [
          this.standerdistionService.standerdizeResults(
            result.gptResp,
            'chat-gpt',
            1,
            '',
            totalTimeSaved,
            result.original,
          ),
        ];
        const payload = {
          question: 'can you summarize this content',
          answer: [],
        };
        this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
          observer.next('60');
          const finalFormat = this.standerdistionService.globalAnswerFromat(
            'get open ended questions form this file',
            standard,
            Date.now() - now,
            followup.split('\n'),
            totalTimeSaved,
            1,
          );
          const sessionData: SessionInterface = {
            question: 'get open ended questions form this file',
            questionType: 'analyze file',
            fileIds: [fileId],
            answer: JSON.stringify(finalFormat),
            isParent: parent === '0' ? true : false,
            parent: parent === '0' ? null : parent,
            userId: user.id,
          };
          this.sessionService.createSession(sessionData).then((session) => {
            observer.next('95');
            const finalresult = {
              ...finalFormat,
              parent: session.parent,
              questionId: session.question,
              question: 'Get file theme',
              questionType: 'Analyze file',
            };
            observer.next(JSON.stringify(finalresult));
            observer.complete();
          });
        });
      });
    });
  }

  @Get('get-argumeent/:fileId/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async getArguments(
    @Param('fileId') fileId: string,
    @Req() req: Request,
    @Param('parent') parent: string,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService
        .getFileArguments(fileId, user.email)
        .then((result) => {
          observer.next('20');
          const totalTimeSaved = this.specialService.calculateTimeSaved(
            result.content,
          );
          const standard = [
            this.standerdistionService.standerdizeResults(
              result.gptResp,
              'chat-gpt',
              1,
              '',
              totalTimeSaved,
              result.original,
            ),
          ];
          const payload = {
            question: 'can you summarize this content',
            answer: [],
          };
          this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
            observer.next('50');
            const finalFormat = this.standerdistionService.globalAnswerFromat(
              'get open ended questions form this file',
              standard,
              Date.now() - now,
              followup.split('\n'),
              totalTimeSaved,
              1,
            );
            const sessionData: SessionInterface = {
              question: 'get argument form this file',
              questionType: 'analyze file',
              fileIds: [fileId],
              answer: JSON.stringify(finalFormat),
              isParent: parent === '0' ? true : false,
              parent: parent === '0' ? null : parent,
              userId: user.id,
            };
            this.sessionService.createSession(sessionData).then((session) => {
              observer.next('95');
              const returnResult = {
                ...finalFormat,
                parent: session.parent,
                questionId: session.question,
                question: 'Get arguments from file',
                questionType: 'Analyze file',
              };
              observer.next(JSON.stringify(returnResult));
              observer.complete();
            });
          });
        });
    });
  }

  @Get('get-rethoric-statement/:fileId/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async getRethoricStatement(
    @Param('fileId') fileId: string,
    @Req() req: Request,
    @Param('parent') parent: string,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService
        .getRethoricStatment(fileId, user.email)
        .then((result) => {
          observer.next('30');
          const totalTimeSaved = this.specialService.calculateTimeSaved(
            result.content,
          );
          const standard = [
            this.standerdistionService.standerdizeResults(
              result.gptResp,
              'chat-gpt',
              1,
              '',
              totalTimeSaved,
              result.original,
            ),
          ];
          const payload = {
            question: 'can you summarize this content',
            answer: [],
          };
          this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
            observer.next('50');
            const finalFormat = this.standerdistionService.globalAnswerFromat(
              'get open ended questions form this file',
              standard,
              Date.now() - now,
              followup.split('\n'),
              totalTimeSaved,
              1,
            );
            const sessionData: SessionInterface = {
              question: 'get rethoric statemnet form this file',
              questionType: 'analyze file',
              fileIds: [fileId],
              answer: JSON.stringify(finalFormat),
              isParent: parent === '0' ? true : false,
              parent: parent === '0' ? null : parent,
              userId: user.id,
            };
            this.sessionService.createSession(sessionData).then((session) => {
              observer.next('95');
              const returnResult = {
                ...finalFormat,
                parent: session.parent,
                questionId: session.question,
                question: 'Create rethoric statement from file',
                questionType: 'Analyze file',
              };
              observer.next(JSON.stringify(returnResult));
              observer.complete();
            });
          });
        });
    });
  }
  @Get('get-sentiment/:fileId/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async getSentiment(
    @Param('fileId') fileId: string,
    @Req() req: Request,
    @Param('parent') parent: string,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService.getSentiment(fileId, user.email).then((result) => {
        observer.next('30');
        const totalTimeSaved = this.specialService.calculateTimeSaved(
          result.content,
        );
        const standard = [
          this.standerdistionService.standerdizeResults(
            result.gptResp,
            'chat-gpt',
            1,
            '',
            totalTimeSaved,
            result.original,
          ),
        ];
        const payload = {
          question: 'can you summarize this content',
          answer: [],
        };
        this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
          observer.next('60');
          const finalFormat = this.standerdistionService.globalAnswerFromat(
            'get open ended questions form this file',
            standard,
            Date.now() - now,
            followup.split('\n'),
            totalTimeSaved,
            1,
          );
          const sessionData: SessionInterface = {
            question: 'get sentiment form this file',
            questionType: 'analyze file',
            fileIds: [fileId],
            answer: JSON.stringify(finalFormat),
            isParent: parent === '0' ? true : false,
            parent: parent === '0' ? null : parent,
            userId: user.id,
          };
          this.sessionService.createSession(sessionData).then((session) => {
            observer.next('95');
            const returnResult = {
              ...finalFormat,
              parent: session.parent,
              questionId: session.question,
              question: 'Get sentiment from file',
              questionType: 'Analyze file',
            };
            observer.next(JSON.stringify(returnResult));
            observer.complete();
          });
        });
      });
    });
  }
  @Get('brief/:fileId/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async createBrief(
    @Param('fileId') fileId: string,
    @Req() req: Request,
    @Param('parent') parent: string,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService.prepareBrief(fileId, user.email).then((result) => {
        observer.next('40');
        const totalTimeSaved = this.specialService.calculateTimeSaved(
          result.content,
        );
        const standard = [
          this.standerdistionService.standerdizeResults(
            result.gptResp,
            'chat-gpt',
            1,
            '',
            totalTimeSaved,
            result.original,
          ),
        ];
        const payload = {
          question: 'can you summarize this content',
          answer: [],
        };
        this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
          observer.next('60');
          const finalFormat = this.standerdistionService.globalAnswerFromat(
            'get open ended questions form this file',
            standard,
            Date.now() - now,
            followup.split('\n'),
            totalTimeSaved,
            1,
          );
          const sessionData: SessionInterface = {
            question: 'get brief form this file',
            questionType: 'analyze file',
            fileIds: [fileId],
            answer: JSON.stringify(finalFormat),
            isParent: parent === '0' ? true : false,
            parent: parent === '0' ? null : parent,
            userId: user.id,
          };
          this.sessionService.createSession(sessionData).then((session) => {
            observer.next('95');
            const returnResult = {
              ...finalFormat,
              parent: session.parent,
              question: session.question,
            };
            observer.next(JSON.stringify(returnResult));
            observer.complete();
          });
        });
      });
    });
  }

  @Get('exam-mc-questions/:fileId/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async examineMCFile(
    @Param('fileId') fileId: string,
    @Req() req: Request,
    @Param('parent') parent: string,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService.examinSegmentMC(fileId, user.email).then((result) => {
        observer.next('30');
        const totalTimeSaved = this.specialService.calculateTimeSaved(
          result.content,
        );
        const standard = [
          this.standerdistionService.standerdizeResults(
            result.gptResp,
            'chat-gpt',
            1,
            '',
            totalTimeSaved,
            result.original,
          ),
        ];
        const payload = {
          question: 'can you summarize this content',
          answer: [],
        };
        this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
          observer.next('60');
          const finalFormat = this.standerdistionService.globalAnswerFromat(
            'get open ended questions form this file',
            standard,
            Date.now() - now,
            followup.split('\n'),
            totalTimeSaved,
            1,
          );
          const sessionData: SessionInterface = {
            question: 'get MCQ questions form this file',
            questionType: 'analyze file',
            fileIds: [fileId],
            answer: JSON.stringify(finalFormat),
            isParent: parent === '0' ? true : false,
            parent: parent === '0' ? null : parent,
            userId: user.id,
          };
          this.sessionService.createSession(sessionData).then((session) => {
            observer.next('95');
            const returnResult = {
              ...finalFormat,
              parent: session.parent,
              question: session.question,
            };
            observer.next(JSON.stringify(returnResult));
            observer.complete();
          });
        });
      });
    });
  }

  @Get('exam-open-questions/:fileId/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async examineOpenFile(
    @Param('fileId') fileId: string,
    @Req() req: Request,
    @Param('parent') parent: string,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService
        .examinSegmentOpen(fileId, user.email)
        .then((result) => {
          observer.next('40');
          const totalTimeSaved = this.specialService.calculateTimeSaved(
            result.content,
          );
          const standard = [
            this.standerdistionService.standerdizeResults(
              result.gptResp,
              'chat-gpt',
              1,
              '',
              totalTimeSaved,
              result.original,
            ),
          ];
          const payload = {
            question: 'can you summarize this content',
            answer: [],
          };
          this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
            observer.next('60');
            const finalFormat = this.standerdistionService.globalAnswerFromat(
              'get open ended questions form this file',
              standard,
              Date.now() - now,
              followup.split('\n'),
              totalTimeSaved,
              1,
            );
            const sessionData: SessionInterface = {
              question: 'get open ended questions form this file',
              questionType: 'analyze file',
              fileIds: [fileId],
              answer: JSON.stringify(finalFormat),
              isParent: parent === '0' ? true : false,
              parent: parent === '0' ? null : parent,
              userId: user.id,
            };
            this.sessionService.createSession(sessionData).then((session) => {
              observer.next('95');
              const returnResult = {
                ...finalFormat,
                parent: session.parent,
                question: session.question,
              };
              observer.next(JSON.stringify(returnResult));
              observer.complete();
            });
          });
        });
    });
  }

  @Post('try-yourself/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async tryYourSelf(
    @Body() data: TryYourSelf,
    @Req() req: Request,
    @Param('parent') parent: string,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      if (data.prompt == '')
        throw new ForbiddenException('please enter a question');
      this.analyzeService
        .tryYourSelf(data.fileId, data.prompt, user.email)
        .then((result) => {
          observer.next('40');
          const totalTimeSaved = this.specialService.calculateTimeSaved(
            result.content,
          );
          const standard = [
            this.standerdistionService.standerdizeResults(
              result.gptResp,
              'chat-gpt',
              1,
              '',
              totalTimeSaved,
              result.original,
            ),
          ];
          const payload = {
            question: 'can you summarize this content',
            answer: [],
          };
          this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
            observer.next('60');
            const finalFormat = this.standerdistionService.globalAnswerFromat(
              data.prompt,
              standard,
              Date.now() - now,
              followup.split('\n'),
              totalTimeSaved,
              1,
            );
            const sessionData: SessionInterface = {
              question: data.prompt,
              questionType: 'analyze file',
              fileIds: [data.fileId],
              answer: JSON.stringify(finalFormat),
              isParent: parent === '0' ? true : false,
              parent: parent === '0' ? null : parent,
              userId: user.id,
            };
            this.sessionService.createSession(sessionData).then((session) => {
              observer.next('95');
              const returnResult = {
                ...finalFormat,
                parent: session.parent,
                question: session.question,
              };
              observer.next(JSON.stringify(returnResult));
              observer.complete();
            });
          });
        });
    });
  }

  // url analysis section

  @Post('url-summary/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async urlSummary(
    @Body() data: urlAnalyzer,
    @Param('parent') parent: string,
    @Req() req: Request,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService.getText(data.url).then((content) => {
        observer.next('30');
        const prompt = this.analyzeService.attachSummaryPrompt(content);
        this.analyzeService.sendToGpt(prompt).then((response) => {
          observer.next('40');
          const totalTimeSaved =
            this.specialService.calculateTimeSaved(content);
          const standard = [
            this.standerdistionService.standerdizeResults(
              response,
              'chat-gpt',
              1,
              data.url,
              totalTimeSaved,
            ),
          ];
          const payload = {
            question: 'can you summarize this content',
            answer: [],
          };
          standard.forEach((answer) => {
            payload.answer.push(answer.text);
          });
          this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
            observer.next('60');
            const finalFormat = this.standerdistionService.globalAnswerFromat(
              'get summary form url',
              standard,
              Date.now() - now,
              followup.split('\n'),
              totalTimeSaved,
              1,
            );
            const sessionData: SessionInterface = {
              question: 'get summary from url',
              questionType: 'analyze url',
              questiningUrl: [data.url],
              answer: JSON.stringify(finalFormat),
              isParent: parent === '0' ? true : false,
              parent: parent === '0' ? null : parent,
              userId: user.id,
            };
            this.sessionService.createSession(sessionData).then((session) => {
              observer.next('90');
              const returnResult = {
                ...finalFormat,
                parent: session.parent,
                question: session.question,
              };
              observer.next(JSON.stringify(returnResult));
              observer.complete();
            });
          });
        });
      });
    });
  }

  @Post('url-theme/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async urlTheme(
    @Body() data: urlAnalyzer,
    @Param('parent') parent: string,
    @Req() req: Request,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService.getText(data.url).then((content) => {
        observer.next('30');
        const prompt = this.analyzeService.attachThemePrompt(content);
        this.analyzeService.sendToGpt(prompt).then((response) => {
          observer.next('50');
          const totalTimeSaved =
            this.specialService.calculateTimeSaved(content);
          const standard = [
            this.standerdistionService.standerdizeResults(
              response,
              'chat-gpt',
              1,
              data.url,
              totalTimeSaved,
            ),
          ];
          const payload = {
            question: 'get theme form url',
            answer: [],
          };
          standard.forEach((answer) => {
            payload.answer.push(answer.text);
          });
          this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
            observer.next('70');
            const finalFormat = this.standerdistionService.globalAnswerFromat(
              'get theme form url',
              standard,
              Date.now() - now,
              followup.split('\n'),
              totalTimeSaved,
              1,
            );
            const sessionData: SessionInterface = {
              question: 'get Theme from url',
              questionType: 'analyze url',
              questiningUrl: [data.url],
              answer: JSON.stringify(finalFormat),
              isParent: parent === '0' ? true : false,
              parent: parent === '0' ? null : parent,
              userId: user.id,
            };
            this.sessionService.createSession(sessionData).then((session) => {
              observer.next('90');
              const returnalble = {
                ...finalFormat,
                parent: session.parent,
                question: session.question,
              };
              observer.next(JSON.stringify(returnalble));
              observer.complete();
            });
          });
        });
      });
    });
  }

  @Post('url-argument/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async urlArgument(
    @Body() data: urlAnalyzer,
    @Param('parent') parent: string,
    @Req() req: Request,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService.getText(data.url).then((content) => {
        observer.next('30');
        const prompt = this.analyzeService.attachArgumentPrompt(content);
        this.analyzeService.sendToGpt(prompt).then((response) => {
          observer.next('50');
          const totalTimeSaved =
            this.specialService.calculateTimeSaved(content);
          const standard = [
            this.standerdistionService.standerdizeResults(
              response,
              'chat-gpt',
              1,
              data.url,
              totalTimeSaved,
            ),
          ];
          const payload = {
            question: 'get argument form url',
            answer: [],
          };
          standard.forEach((answer) => {
            payload.answer.push(answer.text);
          });
          this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
            observer.next('60');
            const finalFormat = this.standerdistionService.globalAnswerFromat(
              'get argument form url',
              standard,
              Date.now() - now,
              followup.split('\n'),
              totalTimeSaved,
              1,
            );
            const sessionData: SessionInterface = {
              question: 'get argument from url',
              questionType: 'analyze url',
              questiningUrl: [data.url],
              answer: JSON.stringify(finalFormat),
              isParent: parent === '0' ? true : false,
              parent: parent === '0' ? null : parent,
              userId: user.id,
            };
            this.sessionService.createSession(sessionData).then((session) => {
              observer.next('90');
              const returnable = {
                ...finalFormat,
                parent: session.parent,
                question: session.question,
              };
              observer.next(JSON.stringify(returnable));
              observer.complete();
            });
          });
        });
      });
    });
  }
  @Post('url-rethoric-statement/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async urlRethoricStatement(
    @Req() req: Request,
    @Body() data: urlAnalyzer,
    @Param('parent') parent: string,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService.getText(data.url).then((content) => {
        observer.next('30');
        const prompt = this.analyzeService.attachRethoricPrompt(content);
        this.analyzeService.sendToGpt(prompt).then((response) => {
          observer.next('50');
          const totalTimeSaved =
            this.specialService.calculateTimeSaved(content);
          const standard = [
            this.standerdistionService.standerdizeResults(
              response,
              'chat-gpt',
              1,
              data.url,
              totalTimeSaved,
            ),
          ];
          const payload = {
            question: 'get rethoric statement form url',
            answer: [],
          };
          standard.forEach((answer) => {
            payload.answer.push(answer.text);
          });
          this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
            observer.next('60');
            const finalFormat = this.standerdistionService.globalAnswerFromat(
              'get rethoric statement form url',
              standard,
              Date.now() - now,
              followup.split('\n'),
              totalTimeSaved,
              1,
            );
            const sessionData: SessionInterface = {
              question: 'get rethoric statement from url',
              questionType: 'analyze url',
              questiningUrl: [data.url],
              answer: JSON.stringify(finalFormat),
              isParent: parent === '0' ? true : false,
              parent: parent === '0' ? null : parent,
              userId: user.id,
            };
            this.sessionService.createSession(sessionData).then((session) => {
              observer.next('90');
              const returnable = {
                ...finalFormat,
                parent: session.parent,
                question: session.question,
              };
              observer.next(JSON.stringify(returnable));
              observer.complete();
            });
          });
        });
      });
    });
  }
  @Post('url-sentiment/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async urlSentiment(
    @Req() req: Request,
    @Body() data: urlAnalyzer,
    @Param('parent') parent: string,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService.getText(data.url).then((content) => {
        observer.next('20');
        const prompt = this.analyzeService.attachSentimentPrompt(content);
        this.analyzeService.sendToGpt(prompt).then((response) => {
          observer.next('40');
          const totalTimeSaved =
            this.specialService.calculateTimeSaved(content);
          const standard = [
            this.standerdistionService.standerdizeResults(
              response,
              'chat-gpt',
              1,
              data.url,
              totalTimeSaved,
            ),
          ];
          const payload = {
            question: 'get sentiment form url',
            answer: [],
          };
          standard.forEach((answer) => {
            payload.answer.push(answer.text);
          });
          this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
            observer.next('60');
            const finalFormat = this.standerdistionService.globalAnswerFromat(
              'get sentiment form url',
              standard,
              Date.now() - now,
              followup.split('\n'),
              totalTimeSaved,
              1,
            );
            const sessionData: SessionInterface = {
              question: 'get sentiment form url',
              questionType: 'analyze url',
              questiningUrl: [data.url],
              answer: JSON.stringify(finalFormat),
              isParent: parent === '0' ? true : false,
              parent: parent === '0' ? null : parent,
              userId: user.id,
            };
            this.sessionService.createSession(sessionData).then((session) => {
              observer.next('90');
              const returnable = {
                ...finalFormat,
                parent: session.parent,
                question: session.question,
              };
              observer.next(JSON.stringify(returnable));
              observer.complete();
            });
          });
        });
      });
    });
  }
  @Post('url-brief/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async urlBrief(
    @Req() req: Request,
    @Body() data: urlAnalyzer,
    @Param('parent') parent: string,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService.getText(data.url).then((content) => {
        observer.next('30');
        const prompt = this.analyzeService.attachBrief(content);
        this.analyzeService.sendToGpt(prompt).then((response) => {
          observer.next('40');
          const totalTimeSaved =
            this.specialService.calculateTimeSaved(content);
          const standard = [
            this.standerdistionService.standerdizeResults(
              response,
              'chat-gpt',
              1,
              data.url,
              totalTimeSaved,
            ),
          ];
          const payload = {
            question: 'get brief form url',
            answer: [],
          };
          standard.forEach((answer) => {
            payload.answer.push(answer.text);
          });
          this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
            observer.next('60');
            const finalFormat = this.standerdistionService.globalAnswerFromat(
              'get brief form url',
              standard,
              Date.now() - now,
              followup.split('\n'),
              totalTimeSaved,
              1,
            );
            const sessionData: SessionInterface = {
              question: 'get brief from url',
              questionType: 'analyze url',
              questiningUrl: [data.url],
              answer: JSON.stringify(finalFormat),
              isParent: parent === '0' ? true : false,
              parent: parent === '0' ? null : parent,
              userId: user.id,
            };
            this.sessionService.createSession(sessionData).then((session) => {
              observer.next('90');
              const returnable = {
                ...finalFormat,
                parent: session.parent,
                question: session.question,
              };
              observer.next(JSON.stringify(returnable));
              observer.complete();
            });
          });
        });
      });
    });
  }
  @Post('url-mcq-questions/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async urlMcqQuestions(
    @Req() req: Request,
    @Body() data: urlAnalyzer,
    @Param('parent') parent: string,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService.getText(data.url).then((content) => {
        observer.next('30');
        const prompt = this.analyzeService.attachMCQPrompt(content);
        this.analyzeService.sendToGpt(prompt).then((response) => {
          observer.next('50');
          const totalTimeSaved =
            this.specialService.calculateTimeSaved(content);
          const standard = [
            this.standerdistionService.standerdizeResults(
              response,
              'chat-gpt',
              1,
              data.url,
              totalTimeSaved,
            ),
          ];
          const payload = {
            question: 'get multiple choise questions url',
            answer: [],
          };
          standard.forEach((answer) => {
            payload.answer.push(answer.text);
          });
          this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
            observer.next('60');
            const finalFormat = this.standerdistionService.globalAnswerFromat(
              'get multiple choise questions form url',
              standard,
              Date.now() - now,
              followup.split('\n'),
              totalTimeSaved,
              1,
            );
            const sessionData: SessionInterface = {
              question: 'get multiple choise questions url',
              questionType: 'analyze url',
              questiningUrl: [data.url],
              answer: JSON.stringify(finalFormat),
              isParent: parent === '0' ? true : false,
              parent: parent === '0' ? null : parent,
              userId: user.id,
            };
            this.sessionService.createSession(sessionData).then((session) => {
              observer.next('90');
              const returnable = {
                ...finalFormat,
                parent: session.parent,
                question: session.question,
              };
              observer.next(JSON.stringify(returnable));
              observer.complete();
            });
          });
        });
      });
    });
  }
  @Post('url-open-questions/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async urlOpenQuestions(
    @Req() req: Request,
    @Body() data: urlAnalyzer,
    @Param('parent') parent: string,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService.getText(data.url).then((content) => {
        observer.next('30');
        const prompt = this.analyzeService.attachOpenPrompt(content);
        this.analyzeService.sendToGpt(prompt).then((response) => {
          observer.next('50');
          const totalTimeSaved =
            this.specialService.calculateTimeSaved(content);
          const standard = [
            this.standerdistionService.standerdizeResults(
              response,
              'chat-gpt',
              1,
              data.url,
              totalTimeSaved,
            ),
          ];
          const payload = {
            question:
              'can you generate some open ended questions form this content',
            answer: [],
          };
          standard.forEach((answer) => {
            payload.answer.push(answer.text);
          });
          this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
            observer.next('70');
            const finalFormat = this.standerdistionService.globalAnswerFromat(
              'get open ended questions form url',
              standard,
              Date.now() - now,
              followup.split('\n'),
              totalTimeSaved,
              1,
            );
            const sessionData: SessionInterface = {
              question: 'get open ended questions from url',
              questionType: 'analyze url',
              questiningUrl: [data.url],
              answer: JSON.stringify(finalFormat),
              isParent: parent === '0' ? true : false,
              parent: parent === '0' ? null : parent,
              userId: user.id,
            };
            this.sessionService.createSession(sessionData).then((session) => {
              observer.next('90');
              const returnable = {
                ...finalFormat,
                parent: session.parent,
                question: session.question,
              };
              observer.next(JSON.stringify(returnable));
              observer.complete();
            });
          });
        });
      });
    });
  }
  @Post('url-try-yourself')
  @Sse()
  @UseGuards(TockenGuard)
  TryYourSelf(
    @Req() req: Request,
    @Body() data: UrlPrompt,
    @Param('parent') parent: string,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService.getText(data.url).then((content) => {
        observer.next('30');
        const prompt = this.analyzeService.attachTryYourSelfPrompt(
          content,
          data.prompt,
        );
        this.analyzeService.sendToGpt(prompt).then((response) => {
          observer.next('40');
          const totalTimeSaved =
            this.specialService.calculateTimeSaved(content);
          const standard = [
            this.standerdistionService.standerdizeResults(
              response,
              'chat-gpt',
              1,
              data.url,
              totalTimeSaved,
            ),
          ];
          const payload = {
            question: data.prompt,
            answer: [],
          };
          standard.forEach((answer) => {
            payload.answer.push(answer.text);
          });
          this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
            observer.next('60');
            const finalFormat = this.standerdistionService.globalAnswerFromat(
              data.prompt,
              standard,
              Date.now() - now,
              followup.split('\n'),
              totalTimeSaved,
              1,
            );
            console.log('till here ');
            const sessionData: SessionInterface = {
              question: data.prompt,
              questionType: 'analyze url',
              questiningUrl: [data.url],
              answer: JSON.stringify(finalFormat),
              isParent: parent === '0' ? true : false,
              parent: parent === '0' ? null : parent,
              userId: user.id,
            };
            this.sessionService.createSession(sessionData).then((session) => {
              observer.next('90');
              const returnable = {
                ...finalFormat,
                parent: session.parent,
                questionId: session.question,
                question: data.prompt,
                questionType: 'ANALYZE',
              };
              observer.next(JSON.stringify(returnable));
              observer.complete();
            });
          });
        });
      });
    });
  }

  ///google drive analysis

  @Post('summarize-google-doc/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async summarizeGoogleDoc(
    @Req() req: Request,
    @Body() data: googleAnalysis,
    @Param('parent') parent: string,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService.getGoogleDocContent(data.contnet).then((content) => {
        observer.next('20');
        const prompt = this.analyzeService.attachSummaryPrompt(content);
        this.analyzeService.sendToGpt(prompt).then((response) => {
          observer.next('40');
          const totalTimeSaved =
            this.specialService.calculateTimeSaved(content);
          const standard = [
            this.standerdistionService.standerdizeResults(
              response,
              'chat-gpt',
              1,
              '',
              totalTimeSaved,
              data.fileId,
            ),
          ];
          const payload = {
            question: 'Can you summarize this document?',
            answer: [],
          };
          standard.forEach((answer) => {
            payload.answer.push(answer.text);
          });
          this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
            observer.next('60');
            const finalFormat = this.standerdistionService.globalAnswerFromat(
              'Can you summarize this document?',
              standard,
              Date.now() - now,
              followup.split('\n'),
              totalTimeSaved,
              1,
            );
            const sessionData: SessionInterface = {
              question: 'Can you summarize this document?',
              questionType: 'analyze google doc',
              fileIds: [data.fileId],
              answer: JSON.stringify(finalFormat),
              isParent: parent === '0' ? true : false,
              parent: parent === '0' ? null : parent,
              userId: user.id,
            };
            this.sessionService.createSession(sessionData).then((session) => {
              observer.next('90');
              const returnable = {
                ...finalFormat,
                parent: session.parent,
                questionId: session.question,
                question: 'summarize this document',
                questionType: 'ANALYZE',
              };
              observer.next(JSON.stringify(returnable));
              observer.complete();
            });
          });
        });
      });
    });
  }

  @Post('theme-google-doc/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async googleDocTheme(
    @Req() req: Request,
    @Body() data: googleAnalysis,
    @Param('parent') parent: string,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService.getGoogleDocContent(data.contnet).then((content) => {
        const prompt = this.analyzeService.attachThemePrompt(content);
        this.analyzeService.sendToGpt(prompt).then((response) => {
          const totalTimeSaved =
            this.specialService.calculateTimeSaved(content);
          const standard = [
            this.standerdistionService.standerdizeResults(
              response,
              'chat-gpt',
              1,
              '',
              totalTimeSaved,
              data.fileId,
            ),
          ];
          const payload = {
            question: 'Can you get the thmem of this document?',
            answer: [],
          };
          standard.forEach((answer) => {
            payload.answer.push(answer.text);
          });
          this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
            const finalFormat = this.standerdistionService.globalAnswerFromat(
              'Can you get the thmem of this document?',
              standard,
              Date.now() - now,
              followup.split('\n'),
              totalTimeSaved,
              1,
            );
            const sessionData: SessionInterface = {
              question: 'Can you get the thmem of this document?',
              questionType: 'analyze google doc',
              fileIds: [data.fileId],
              answer: JSON.stringify(finalFormat),
              isParent: parent === '0' ? true : false,
              parent: parent === '0' ? null : parent,
              userId: user.id,
            };
            this.sessionService.createSession(sessionData).then((session) => {
              const returnable = {
                ...finalFormat,
                parent: session.parent,
                questionId: session.question,
                question: 'get theme form document',
                questionType: 'ANALYZE',
              };
              observer.next(returnable);
              observer.complete();
            });
          });
        });
      });
    });
  }

  @Post('argument-google-doc/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async googleDocArgument(
    @Req() req: Request,
    @Body() data: googleAnalysis,
    @Param('parent') parent: string,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService.getGoogleDocContent(data.contnet).then((content) => {
        observer.next('30');
        const prompt = this.analyzeService.attachArgumentPrompt(content);
        this.analyzeService.sendToGpt(prompt).then((response) => {
          observer.next('40');
          const totalTimeSaved =
            this.specialService.calculateTimeSaved(content);
          const standard = [
            this.standerdistionService.standerdizeResults(
              response,
              'chat-gpt',
              1,
              '',
              totalTimeSaved,
              data.fileId,
            ),
          ];
          const payload = {
            question: 'Can you get the argument of this document?',
            answer: [],
          };
          standard.forEach((answer) => {
            payload.answer.push(answer.text);
          });
          this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
            observer.next('60');
            const finalFormat = this.standerdistionService.globalAnswerFromat(
              'Can you get the argument of this document?',
              standard,
              Date.now() - now,
              followup.split('\n'),
              totalTimeSaved,
              1,
            );
            const sessionData: SessionInterface = {
              question: 'Can you get the argument of this document?',
              questionType: 'analyze google doc',
              fileIds: [data.fileId],
              answer: JSON.stringify(finalFormat),
              isParent: parent === '0' ? true : false,
              parent: parent === '0' ? null : parent,
              userId: user.id,
            };
            this.sessionService.createSession(sessionData).then((session) => {
              observer.next('90');
              const returnable = {
                ...finalFormat,
                parent: session.parent,
                questionId: session.question,
                question: 'get argument from document',
                questionType: 'ANALYZE',
              };
              observer.next(JSON.stringify(returnable));
            });
          });
        });
      });
    });
  }

  @Post('rethoric-google-doc/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async googleDocRethoric(
    @Req() req: Request,
    @Body() data: googleAnalysis,
    @Param('parent') parent: string,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService.getGoogleDocContent(data.contnet).then((content) => {
        observer.next('30');
        const prompt = this.analyzeService.attachRethoricPrompt(content);
        this.analyzeService.sendToGpt(prompt).then((response) => {
          observer.next('50');
          const totalTimeSaved =
            this.specialService.calculateTimeSaved(content);
          const standard = [
            this.standerdistionService.standerdizeResults(
              response,
              'chat-gpt',
              1,
              '',
              totalTimeSaved,
              data.fileId,
            ),
          ];
          const payload = {
            question: 'Can you get the rethoric statement of this document?',
            answer: [],
          };
          standard.forEach((answer) => {
            payload.answer.push(answer.text);
          });
          this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
            observer.next('70');
            const finalFormat = this.standerdistionService.globalAnswerFromat(
              'Can you get the rethoric statement of this document?',
              standard,
              Date.now() - now,
              followup.split('\n'),
              totalTimeSaved,
              1,
            );
            const sessionData: SessionInterface = {
              question: 'Can you get the rethoric statement of this document?',
              questionType: 'analyze google doc',
              fileIds: [data.fileId],
              answer: JSON.stringify(finalFormat),
              isParent: parent === '0' ? true : false,
              parent: parent === '0' ? null : parent,
              userId: user.id,
            };
            this.sessionService.createSession(sessionData).then((session) => {
              observer.next('90');
              const returnable = {
                ...finalFormat,
                parent: session.parent,
                questionId: session.question,
                question: 'get rethoric statement from file',
                questionType: 'ANALYZE',
              };
              observer.next(JSON.stringify(returnable));
              observer.complete();
            });
          });
        });
      });
    });
  }

  @Post('sentiment-google-doc/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async googleDocsentiment(
    @Req() req: Request,
    @Body() data: googleAnalysis,
    @Param('parent') parent: string,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService.getGoogleDocContent(data.contnet).then((content) => {
        observer.next('30');
        const prompt = this.analyzeService.attachSentimentPrompt(content);
        this.analyzeService.sendToGpt(prompt).then((response) => {
          observer.next('50');
          const totalTimeSaved =
            this.specialService.calculateTimeSaved(content);
          const standard = [
            this.standerdistionService.standerdizeResults(
              response,
              'chat-gpt',
              1,
              '',
              totalTimeSaved,
              data.fileId,
            ),
          ];
          const payload = {
            question: 'Can you get the sentiment of this document?',
            answer: [],
          };
          standard.forEach((answer) => {
            payload.answer.push(answer.text);
          });
          this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
            observer.next('60');
            const finalFormat = this.standerdistionService.globalAnswerFromat(
              'Can you get the sentiment of this document?',
              standard,
              Date.now() - now,
              followup.split('\n'),
              totalTimeSaved,
              1,
            );
            const sessionData: SessionInterface = {
              question: 'Can you get the sentiment of this document?',
              questionType: 'analyze google doc',
              fileIds: [data.fileId],
              answer: JSON.stringify(finalFormat),
              isParent: parent === '0' ? true : false,
              parent: parent === '0' ? null : parent,
              userId: user.id,
            };
            this.sessionService.createSession(sessionData).then((session) => {
              observer.next('90');
              const returnable = {
                ...finalFormat,
                parent: session.parent,
                questionId: session.question,
                question: 'get sentiment from file',
                questionType: 'ANALYZE',
              };
              observer.next(JSON.stringify(returnable));
              observer.complete();
            });
          });
        });
      });
    });
  }

  @Post('brief-google-doc/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async googleDocBrief(
    @Req() req: Request,
    @Body() data: googleAnalysis,
    @Param('parent') parent: string,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService.getGoogleDocContent(data.contnet).then((content) => {
        observer.next('30');
        const prompt = this.analyzeService.attachBrief(content);
        this.analyzeService.sendToGpt(prompt).then((response) => {
          observer.next('50');
          const totalTimeSaved =
            this.specialService.calculateTimeSaved(content);
          const standard = [
            this.standerdistionService.standerdizeResults(
              response,
              'chat-gpt',
              1,
              '',
              totalTimeSaved,
              data.fileId,
            ),
          ];
          const payload = {
            question: 'Can you get the brief of this document?',
            answer: [],
          };
          standard.forEach((answer) => {
            payload.answer.push(answer.text);
          });
          this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
            observer.next('70');
            const finalFormat = this.standerdistionService.globalAnswerFromat(
              'Can you get the brief of this document?',
              standard,
              Date.now() - now,
              followup.split('\n'),
              totalTimeSaved,
              1,
            );
            const sessionData: SessionInterface = {
              question: 'Can you get the brief of this document?',
              questionType: 'analyze google doc',
              fileIds: [data.fileId],
              answer: JSON.stringify(finalFormat),
              isParent: parent === '0' ? true : false,
              parent: parent === '0' ? null : parent,
              userId: user.id,
            };
            this.sessionService.createSession(sessionData).then((session) => {
              observer.next('90');
              const returnable = {
                ...finalFormat,
                parent: session.parent,
                questionId: session.question,
                question: 'get breif from file',
                questionType: 'ANALYZE',
              };
              observer.next(JSON.stringify(returnable));
              observer.complete();
            });
          });
        });
      });
    });
  }
  @Post('mcq-google-doc/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async googleDocmcq(
    @Req() req: Request,
    @Body() data: googleAnalysis,
    @Param('parent') parent: string,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService.getGoogleDocContent(data.contnet).then((content) => {
        observer.next('30');
        const prompt = this.analyzeService.attachMCQPrompt(content);
        this.analyzeService.sendToGpt(prompt).then((response) => {
          observer.next('50');
          const totalTimeSaved =
            this.specialService.calculateTimeSaved(content);
          const standard = [
            this.standerdistionService.standerdizeResults(
              response,
              'chat-gpt',
              1,
              '',
              totalTimeSaved,
              data.fileId,
            ),
          ];
          const payload = {
            question:
              'Can you get the multiple choise questions of this document?',
            answer: [],
          };
          standard.forEach((answer) => {
            payload.answer.push(answer.text);
          });
          this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
            observer.next('70');
            const finalFormat = this.standerdistionService.globalAnswerFromat(
              'Can you get the multiple choise questions of this document?',
              standard,
              Date.now() - now,
              followup.split('\n'),
              totalTimeSaved,
              1,
            );
            const sessionData: SessionInterface = {
              question:
                'Can you get the multiple choise questions of this document?',
              questionType: 'analyze google doc',
              fileIds: [data.fileId],
              answer: JSON.stringify(finalFormat),
              isParent: parent === '0' ? true : false,
              parent: parent === '0' ? null : parent,
              userId: user.id,
            };
            this.sessionService.createSession(sessionData).then((session) => {
              observer.next('90');
              const returnable = {
                ...finalFormat,
                parent: session.parent,
                questionId: session.question,
                question: 'generate multiple choise questions form this file',
                questionType: 'ANALYZE',
              };
              observer.next(JSON.stringify(returnable));
              observer.complete();
            });
          });
        });
      });
    });
  }

  @Post('open-google-doc/:parent')
  @UseGuards(TockenGuard)
  async googleDocOpen(
    @Req() req: Request,
    @Body() data: googleAnalysis,
    @Param('parent') parent: string,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService.getGoogleDocContent(data.contnet).then((content) => {
        observer.next('30');
        const prompt = this.analyzeService.attachOpenPrompt(content);
        this.analyzeService.sendToGpt(prompt).then((response) => {
          observer.next('50');
          const totalTimeSaved =
            this.specialService.calculateTimeSaved(content);
          const standard = [
            this.standerdistionService.standerdizeResults(
              response,
              'chat-gpt',
              1,
              '',
              totalTimeSaved,
              data.fileId,
            ),
          ];
          const payload = {
            question: 'Can you get the open ended questions of this document?',
            answer: [],
          };
          standard.forEach((answer) => {
            payload.answer.push(answer.text);
          });
          this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
            observer.next('70');
            const finalFormat = this.standerdistionService.globalAnswerFromat(
              'Can you get the ended questions of this document?',
              standard,
              Date.now() - now,
              followup.split('\n'),
              totalTimeSaved,
              1,
            );
            const sessionData: SessionInterface = {
              question: 'Can you get the ended questions of this document?',
              questionType: 'analyze google doc',
              fileIds: [data.fileId],
              answer: JSON.stringify(finalFormat),
              isParent: parent === '0' ? true : false,
              parent: parent === '0' ? null : parent,
              userId: user.id,
            };
            this.sessionService.createSession(sessionData).then((session) => {
              observer.next('90');
              const returnable = {
                ...finalFormat,
                parent: session.parent,
                questionId: session.question,
                question: 'get open ended questions from this file',
                questionType: 'ANALYZE',
              };
              observer.next(JSON.stringify(returnable));
              observer.complete();
            });
          });
        });
      });
    });
  }

  @Post('try-yourself-google-doc/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async googleDocTryYourself(
    @Req() req: Request,
    @Body() data: googleAnalysisYourself,
    @Param('parent') parent: string,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const user = req['user'];
      this.analyzeService.getGoogleDocContent(data.contnet).then((content) => {
        observer.next('30');
        const prompt = this.analyzeService.attachTryYourSelfPrompt(
          content,
          data.prompt,
        );
        this.analyzeService.sendToGpt(prompt).then((response) => {
          observer.next('50');
          const totalTimeSaved =
            this.specialService.calculateTimeSaved(content);
          const standard = [
            this.standerdistionService.standerdizeResults(
              response,
              'chat-gpt',
              1,
              '',
              totalTimeSaved,
              data.fileId,
            ),
          ];
          const payload = {
            question: data.prompt,
            answer: [],
          };
          standard.forEach((answer) => {
            payload.answer.push(answer.text);
          });
          this.analyzeService.getFollowUpQuestions(payload).then((followup) => {
            observer.next('70');
            const finalFormat = this.standerdistionService.globalAnswerFromat(
              data.prompt,
              standard,
              Date.now() - now,
              followup.split('\n'),
              totalTimeSaved,
              1,
            );
            const sessionData: SessionInterface = {
              question: data.prompt,
              questionType: 'analyze google doc',
              fileIds: [data.fileId],
              answer: JSON.stringify(finalFormat),
              isParent: parent === '0' ? true : false,
              parent: parent === '0' ? null : parent,
              userId: user.id,
            };
            this.sessionService.createSession(sessionData).then((session) => {
              observer.next('90');
              const returnable = {
                ...finalFormat,
                parent: session.parent,
                questionId: session.question,
                question: data.prompt,
                questionType: 'ANALYZE',
              };
              observer.next(JSON.stringify(returnable));
              observer.complete();
            });
          });
        });
      });
    });
  }

  @Get('folder-summary/:folderId')
  @UseGuards(TockenGuard)
  async folderSummary(
    @Param('folderId') folderId: string,
    @Req() req: Request,
  ) {
    const user = req['user'];
    const files = await this.analyzeService.getFileIds(user.email, folderId);
    const filesText = await this.analyzeService.getTextFromFiles(
      files,
      user.email,
    );
    const promptsList =
      await this.analyzeService.getChatGptSummarizetext(filesText);
    const finalResults = await this.analyzeService.AskChatGpt(promptsList);
    return finalResults;
  }
}
