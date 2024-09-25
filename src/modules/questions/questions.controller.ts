import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Req,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
// import { BookShelf } from './dtos/bookshelf.dto';
import { QuestionsService } from './questions.service';
// import { BookShelfService } from '../book-shelf/book-shelf.service';
import { TockenGuard } from 'src/core/guards/tocken.guard';
import { StanderdisationService } from 'src/core/services/standerdisation/standerdisation.service';
import { AskFolder } from './dtos/askFolder.dto';
import { FilesQuestion } from './dtos/filesQuestion.dto';
import { askChat } from './dtos/askChat.dto';
import { AskUrl } from './dtos/askUrl.dto';
import { SessionsService } from '../sessions/sessions.service';
import { SessionInterface } from 'src/core/interface/session.interface';
import { UserService } from '../user/user.service';
import { QuestionSummary } from './dtos/questionSummary.dot';
import { Testing } from './dtos/testing.dto';
import { LargeFileTesting } from './dtos/largeTesting.dto';
import { askGoogleDocs } from './dtos/askGoogleDocument.dto';
import { Observable } from 'rxjs';
import { SpecialGeneratorService } from 'src/core/services/special-generator/special-generator.service';
import { FlowiseService } from 'src/core/services/flowise/flowise.service';
import { Flowise } from './dtos/flowise.dto';
import { Request, Response } from 'express';
// import e from 'express';
// import { UserService } from '../user/user.service';
// import { readFileSync } from 'fs';
// import { join } from 'path';
@ApiTags('Questions Module')
@Controller('questions')
@ApiHeader({
  name: 'Authorizations',
  description: 'Auth token',
})
export class QuestionsController {
  constructor(
    private questionService: QuestionsService,
    private sessionService: SessionsService,
    private standerdisationService: StanderdisationService,
    private userService: UserService,
    private specialService: SpecialGeneratorService,
    private flowise: FlowiseService,
  ) {}
  @Get('ask-questions-testing/:question/:page')
  @Sse()
  askBingQuestions(
    @Param('question') question: string,
    @Param('page') page: number,
  ) {
    return new Observable((observer) => {
      const now = Date.now();
      const count = 10;
      const offset = count * page;
      const totalAnswers = [];
      // let finalAnswer = {};
      this.questionService
        .getWebsites(question, count, offset)
        .then((websites) => {
          let countno = 1;
          websites.forEach((website, index) => {
            this.questionService.scrapeWebsite(website.url).then((content) => {
              this.flowise
                .testingQuestions(question, content)
                .then((response) => {
                  if (response.text[0] != '{') {
                    console.log('the error has happened');
                    response.text = '{' + response.text + '}';
                    console.log(response.text);
                  }
                  const answers = JSON.parse(response.text);
                  // if (answers.answer != 'answer not found') {
                  console.log();
                  const payload = {
                    text: answers.answer,
                    question: question,
                    content: content,
                    trueResponse: response,
                    timeSaved: this.specialService.calculateTimeSaved(content),
                    url: website.url,
                    timeTaken: Date.now() - now,
                  };
                  observer.next(JSON.stringify(payload));
                  totalAnswers.push(payload);
                  if (countno == websites.length) {
                    // console.log('connection closed');
                    // // console.log(totalAnswers);
                    // const textAnsers = [];
                    // totalAnswers.forEach((item) => {
                    //   textAnsers.push(item.text);
                    // });
                    // const payload = {
                    //   question: question,
                    //   answer: textAnsers,
                    // };
                    // this.questionService
                    //   .getFollowUpQuestions(payload)
                    //   .then((followup) => {
                    //     finalAnswer = {
                    //       answer: totalAnswers,
                    //       followup: followup.split('\n'),
                    //     };
                    //     this.sessionFormating(
                    //       question,
                    //       finalAnswer,
                    //       parent,
                    //       user.id,
                    //     ).then((session) => {
                    //       console.log(session);
                    //       const returnResult =
                    //         this.standerdisationService.successDataResponse(
                    //           'request was successfull',
                    //           finalAnswer,
                    //           session.parent,
                    //           session.question,
                    //         );
                    //       // observer.next(
                    //       //   JSON.stringify({
                    //       //     message: 'complete',
                    //       //     data: returnResult,
                    //       //   }),
                    //       // );
                    observer.complete();
                    //     });
                    //   });
                  } else {
                    console.log(index, websites.length);
                  }
                  // } else {
                  //   console.log('failed');
                  // }
                  countno++;
                })
                .catch((error) => {
                  console.error(error);
                  throw new InternalServerErrorException(
                    'internal server error',
                  );
                });
            });
          });
        });
    });
  }

  @Get('askBing/:question/:model/:page/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async askBing(
    @Param('question') question: string,
    @Param('model') model: string,
    @Param('parent') parent: string,
    @Param('page') page: number = 0,
    @Req() req: Request,
  ) {
    console.log('serveer has started');
    return new Observable((observer) => {
      try {
        const now = Date.now();
        console.log('observer started');
        const user = req['user'];
        const count = 10;
        const offset = count * page;
        const totalAnswers = [];
        let finalAnswer = {};
        let answerId = 0;
        this.questionService
          .getWebsites(question, count, offset)
          .then((websites) => {
            let countno = 1;
            websites.forEach((website, index) => {
              this.questionService
                .scrapeWebsite(website.url)
                .then((content) => {
                  // need to chain an if else to check if the model is albert, 3.5 or 4o
                  if (model == 'albert') {
                    this.questionService
                      .askingAlbert(question, content)
                      .then((snippet) => {
                        if (snippet[0]?.text) {
                          this.questionService
                            .gptFormatingPrompt(question, snippet[0].text)
                            .then((prompt) => {
                              this.questionService
                                .gptAnaswering(prompt)
                                .then((answer) => {
                                  console.log(answer);
                                  const processing = {
                                    text: answer,
                                    question: question,
                                    id: answerId++,
                                    timeSaved:
                                      this.specialService.calculateTimeSaved(
                                        content,
                                      ),
                                    model: model,
                                    url: website.url,
                                    timeTaken: Date.now() - now,
                                  };
                                  observer.next(JSON.stringify(processing));
                                  totalAnswers.push(processing);
                                  if (countno == websites.length) {
                                    const textAnsers = [];
                                    totalAnswers.forEach((item) => {
                                      textAnsers.push(item.text);
                                    });
                                    const payload = {
                                      question: question,
                                      answer: textAnsers,
                                    };
                                    this.questionService
                                      .getFollowUpQuestions(payload)
                                      .then((followup) => {
                                        finalAnswer = {
                                          answer: totalAnswers,
                                          followup: followup.split('\n'),
                                        };
                                        this.sessionFormating(
                                          question,
                                          finalAnswer,
                                          parent,
                                          user.id,
                                        ).then((session) => {
                                          const returnResult =
                                            this.standerdisationService.successDataResponse(
                                              'request was successfull',
                                              finalAnswer,
                                              session.parent,
                                              session.question,
                                              // followup.split('\n'),
                                            );
                                          observer.next(
                                            JSON.stringify({
                                              message: 'complete',
                                              data: returnResult,
                                            }),
                                          );
                                          observer.complete();
                                        });
                                      });
                                  } else {
                                    console.log(index, websites.length);
                                  }
                                  countno++;
                                });
                            });
                        } else {
                          countno++;
                        }
                      });
                  } else if (model == 'gpt-3.5') {
                    this.questionService
                      .gptAnswerPrompt(question, content)
                      .then((prompt) => {
                        this.questionService
                          .gpt35Answering(prompt)
                          .then((answer) => {
                            if (answer) {
                              const processing = {
                                text: answer,
                                question: question,
                                timeSaved:
                                  this.specialService.calculateTimeSaved(
                                    content,
                                  ),
                                model: model,
                                url: website.url,
                                timeTaken: Date.now() - now,
                              };
                              console.log(processing);
                              observer.next(JSON.stringify(processing));
                              totalAnswers.push(processing);
                              if (countno == websites.length) {
                                console.log('connection closed');
                                const textAnsers = [];
                                totalAnswers.forEach((item) => {
                                  textAnsers.push(item.text);
                                });
                                const payload = {
                                  question: question,
                                  answer: textAnsers,
                                };
                                this.questionService
                                  .getFollowUpQuestions(payload)
                                  .then((followup) => {
                                    finalAnswer = {
                                      answer: totalAnswers,
                                      followup: followup.split('\n'),
                                    };
                                    this.sessionFormating(
                                      question,
                                      finalAnswer,
                                      parent,
                                      user.id,
                                    ).then((session) => {
                                      const returnResult =
                                        this.standerdisationService.successDataResponse(
                                          'request was successfull',
                                          finalAnswer,
                                          session.parent,
                                          session.question,
                                        );
                                      observer.next(
                                        JSON.stringify({
                                          message: 'complete',
                                          data: returnResult,
                                        }),
                                      );
                                      observer.complete();
                                    });
                                  });
                              } else {
                                console.log(index, websites.length);
                              }
                            }
                            countno++;
                          });
                      });
                  } else if (model == 'gpt-4o') {
                    // console.log(index, websites.length, 'counter');
                    this.questionService
                      .gptAnswerPrompt(question, content)
                      .then((prompt) => {
                        this.questionService
                          .gpt4oAnswering(prompt)
                          .then((answer) => {
                            // console.log(index, 'answer received');
                            if (answer) {
                              const processing = {
                                text: answer,
                                question: question,
                                id: answerId++,
                                timeSaved:
                                  this.specialService.calculateTimeSaved(
                                    content,
                                  ),
                                model: model,
                                url: website.url,
                                timeTaken: Date.now() - now,
                              };
                              // console.log(answer);
                              observer.next(JSON.stringify(processing));
                              totalAnswers.push(processing);
                              if (countno == websites.length) {
                                console.log('connection closed');
                                // console.log(totalAnswers);
                                const textAnsers = [];
                                totalAnswers.forEach((item) => {
                                  textAnsers.push(item.text);
                                });
                                const payload = {
                                  question: question,
                                  answer: textAnsers,
                                };
                                this.questionService
                                  .getFollowUpQuestions(payload)
                                  .then((followup) => {
                                    finalAnswer = {
                                      answer: totalAnswers,
                                      followup: followup.split('\n'),
                                    };
                                    this.sessionFormating(
                                      question,
                                      finalAnswer,
                                      parent,
                                      user.id,
                                    ).then((session) => {
                                      console.log(session);
                                      const returnResult =
                                        this.standerdisationService.successDataResponse(
                                          'request was successfull',
                                          finalAnswer,
                                          session.parent,
                                          session.question,
                                        );
                                      observer.next(
                                        JSON.stringify({
                                          message: 'complete',
                                          data: returnResult,
                                        }),
                                      );
                                      observer.complete();
                                    });
                                  });
                              } else {
                                console.log(index, websites.length);
                              }
                              countno++;
                            } else {
                              console.log('failed');
                              countno++;
                            }
                          });
                      });
                  } else if (model == 'flowise') {
                    this.flowise
                      .testingQuestions(question, content)
                      .then((response) => {
                        if (response.text[0] != '{') {
                          console.log('the error has happened');
                          response.text = '{' + response.text + '}';
                          console.log(response.text);
                        }
                        const answers = JSON.parse(response.text);
                        if (answers.answer != 'answer not found') {
                          console.log();
                          const payload = {
                            text: answers.answer,
                            question: question,
                            id: answerId++,
                            timeSaved:
                              this.specialService.calculateTimeSaved(content),
                            model: model,
                            url: website.url,
                            timeTaken: Date.now() - now,
                          };
                          observer.next(JSON.stringify(payload));
                          totalAnswers.push(payload);
                          if (countno == websites.length) {
                            console.log('connection closed');
                            // console.log(totalAnswers);
                            const textAnsers = [];
                            totalAnswers.forEach((item) => {
                              textAnsers.push(item.text);
                            });
                            const payload = {
                              question: question,
                              answer: textAnsers,
                            };
                            this.questionService
                              .getFollowUpQuestions(payload)
                              .then((followup) => {
                                finalAnswer = {
                                  answer: totalAnswers,
                                  followup: followup.split('\n'),
                                };
                                this.sessionFormating(
                                  question,
                                  finalAnswer,
                                  parent,
                                  user.id,
                                ).then((session) => {
                                  console.log(session);
                                  const returnResult =
                                    this.standerdisationService.successDataResponse(
                                      'request was successfull',
                                      finalAnswer,
                                      session.parent,
                                      session.question,
                                    );
                                  observer.next(
                                    JSON.stringify({
                                      message: 'complete',
                                      data: returnResult,
                                    }),
                                  );
                                  observer.complete();
                                });
                              });
                          } else {
                            console.log(index, websites.length);
                          }
                        } else {
                          console.log('failed');
                        }
                        countno++;
                      })
                      .catch((error) => {
                        console.error(error);
                        throw new InternalServerErrorException(
                          'internal server error',
                        );
                      });
                  }

                  //where the if else ends
                });
            });
          });
      } catch (error) {
        console.error(error);
        throw new InternalServerErrorException('internal server error');
      }
    });
  }
  async sessionFormating(question, answers, parent, userId) {
    const sessionData: SessionInterface = {
      question: question,
      questionType: 'ask bing',
      answer: JSON.stringify(answers),
      isParent: parent == '0' ? true : false,
      parent: parent === '0' ? null : parent,
      userId: userId,
    };
    const session = await this.sessionService.createSession(sessionData);
    return session;
  }

  @Post('ask-folder/:parent')
  @UseGuards(TockenGuard)
  async askFolder(
    @Param('parent') parent: string,
    @Body() data: AskFolder,
    @Req() req: Request,
  ) {
    return new Observable((observer) => {
      const user = req['user'];
      let counter = 0;
      const final: any[] = [];
      console.log(user, data);
      this.questionService
        .getFilesFromFolder(data.folderId, user.email)
        .then((files) => {
          console.log(files.length);
          for (let i = 2; i < 5; i++) {
            observer.next(JSON.stringify(files[i].id));
            console.log(files[i].id);
            this.questionService
              .getTextFromPdf(files[i].id, user.email)
              .then((response) => {
                observer.next(response);
                // observer.next(JSON.stringify(response));
                this.flowise
                  .testingQuestions(data.question, response)
                  .then((flowiseAnswer) => {
                    observer.next(JSON.stringify(flowiseAnswer.text));
                    final.push(flowiseAnswer.text);
                    final.push(response);
                    counter++;
                    console.log(counter);
                    if (counter >= 3) {
                      observer.next(JSON.stringify(final));
                      observer.complete();
                    }
                  });
              });
          }
          // files.forEach((file) => {
          // observer.next(JSON.stringify(file.id));
          // console.log(file.id);
          // this.questionService
          //   .getTextFromPdf(file.id, user.email)
          //   .then((response) => {
          //     this.flowise
          //       .testingQuestions(data.question, response)
          //       .then((flowiseAnswer) => {
          //         observer.next(flowiseAnswer);
          //         final.push(flowiseAnswer);
          //         counter++;
          //         if (counter >= files.length) {
          //           observer.next(JSON.stringify(final));
          //           observer.complete();
          //         }
          //       });
          //   });
          // });
        });
    });
  }
  @Post('ask-files/:model/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async getAnswerFromFiles(
    @Param('model') model: string,
    @Param('parent') parent: string,
    @Body() data: FilesQuestion,
    @Req() req: Request,
  ) {
    return new Observable((observer) => {
      const user = req['user'];
      let counter = 0;
      data.filesList.forEach((fileIds) => {
        if (model == 'albert') {
          console.log('yes albert');
          this.questionService
            .getAnswersFromFiles([fileIds], data.question, user.email)
            .then((result) => {
              const sessionData: SessionInterface = {
                question: data.question,
                questionType: 'ask files',
                fileIds: data.filesList,
                answer: JSON.stringify(result),
                isParent: parent === '0' ? true : false,
                parent: parent === '0' ? null : parent,
                userId: user.id,
              };
              this.userService
                .updateTimeSaved(user.id, result.totalTimeSaved)
                .then(() => {
                  observer.next(JSON.stringify(result));
                  if (counter >= data.filesList.length) {
                    this.sessionService
                      .createSession(sessionData)
                      .then((session) => {
                        const returnResult =
                          this.standerdisationService.successDataResponse(
                            'request was successfull',
                            result,
                            session.parent,
                            session.question,
                          );
                        observer.next(JSON.stringify(returnResult));
                        observer.complete();
                      });
                  }
                  counter++;
                });
            });
        } else {
          console.log('defenetly no albert');
          this.questionService
            .getAnswersFromFilesNoAlbert(
              [fileIds],
              data.question,
              user.email,
              model,
            )
            .then((result) => {
              const sessionData: SessionInterface = {
                question: data.question,
                questionType: 'ask files',
                fileIds: data.filesList,
                answer: JSON.stringify(result),
                isParent: parent === '0' ? true : false,
                parent: parent === '0' ? null : parent,
                userId: user.id,
              };
              this.userService
                .updateTimeSaved(user.id, result.totalTimeSaved)
                .then(() => {
                  if (counter >= data.filesList.length) {
                    this.sessionService
                      .createSession(sessionData)
                      .then((session) => {
                        const returnResult =
                          this.standerdisationService.successDataResponse(
                            'request was successfull',
                            result,
                            session.parent,
                            session.question,
                          );
                        observer.next(JSON.stringify(returnResult));
                        observer.complete();
                      });
                  }
                  counter++;
                });
            });
        }
      });
    });
  }
  @Post('ask-google-document/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async askDocument(
    @Param('parent') parent: string,
    @Body() data: askGoogleDocs,
    @Req() req: Request,
  ) {
    return new Observable((observer) => {
      const user = req['user'];
      this.questionService
        .getGoogleAnswers(data.contnet, data.fileId, user.id, data.question)
        .then((result) => {
          observer.next('50');
          const sessionData: SessionInterface = {
            question: data.question,
            questionType: 'ask google document',
            answer: JSON.stringify(result),
            fileIds: [data.fileId],
            isParent: parent === '0' ? true : false,
            parent: parent === '0' ? null : parent,
            userId: user.id,
          };
          observer.next('60');
          this.sessionService.createSession(sessionData).then((session) => {
            observer.next('90');
            const returnable = this.standerdisationService.successDataResponse(
              'request was successfull',
              result,
              session.parent,
              session.question,
            );
            observer.next(JSON.stringify(returnable));
            observer.complete();
          });
        });
    });
  }

  @Post('ask-chat/:parent')
  @UseGuards(TockenGuard)
  async getAnswerFromChat(
    @Param('parent') parent: string,
    @Body() data: askChat,
    @Req() req: Request,
  ) {
    const user = req['user'];
    const result = await this.questionService.askChat(data.question);
    const sessionData: SessionInterface = {
      question: data.question,
      questionType: 'ask chat',
      answer: JSON.stringify(result),
      isParent: parent === '0' ? true : false,
      parent: parent === '0' ? null : parent,
      userId: user.id,
    };
    await this.userService.updateTimeSaved(user.id, result.totalTimeSaved);
    const session = await this.sessionService.createSession(sessionData);
    return this.standerdisationService.successDataResponse(
      'successfully retreaved data',
      result,
      session.parent,
      session.question,
    );
  }
  @Post('ask-url/:parent')
  @Sse()
  @UseGuards(TockenGuard)
  async askUrl(
    @Param('parent') parent: string,
    @Body() data: AskUrl,
    @Req() req: Request,
  ) {
    return new Observable((observer) => {
      const user = req['user'];
      this.questionService.askUrl(data.url, data.question).then((result) => {
        observer.next('30');
        const sessionData: SessionInterface = {
          question: data.question,
          questionType: 'ask url',
          questiningUrl: [data.url],
          answer: JSON.stringify(result),
          isParent: parent === '0' ? true : false,
          parent: parent === '0' ? null : parent,
          userId: user.id,
        };
        this.userService
          .updateTimeSaved(user.id, result.totalTimeSaved)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .then((_saved) => {
            observer.next('60');
            this.sessionService.createSession(sessionData).then((session) => {
              observer.next('90');
              const returner = this.standerdisationService.successDataResponse(
                'successfully receaved answer',
                result,
                session.parent,
                session.question,
              );
              observer.next(JSON.stringify(returner));
              observer.complete();
            });
          });
      });
    });
  }
  @Get('session-summary/:sessionId/:parent')
  @UseGuards(TockenGuard)
  async sessionSummary(
    @Param('sessionId') sessionId: string,
    @Param('parent') parent: string,
    @Req() req: Request,
  ) {
    const now = Date.now();
    const user = req['user'];
    const result = await this.questionService.getSessionSummary(sessionId);
    const payload = {
      question: `Can you summarise the results from this session?`,
      answer: [result],
    };
    const followup = await this.questionService.getFollowUpQuestions(payload);
    const temp = this.standerdisationService.standerdizeResults(
      result,
      'chat-gpt',
      0,
      '',
      0,
      {},
      '',
    );
    const finalFormat = this.standerdisationService.globalAnswerFromat(
      `Can you summarise the results from this session?`,
      [temp],
      Date.now() - now,
      followup.split('\n'),
      0,
      1,
    );
    const sessionData: SessionInterface = {
      question: 'Can you summarise the results from this session?',
      questionType: 'session-summary',
      sessionIds: [sessionId],
      answer: JSON.stringify(finalFormat),
      isParent: parent === '0' ? true : false,
      parent: parent === '0' ? null : parent,
      userId: user.id,
      ignore: true,
    };
    const session = await this.sessionService.createSession(sessionData);
    return this.standerdisationService.successDataResponse(
      'success',
      finalFormat,
      session.parent,
      session.question,
    );
  }

  @Get('news-questions')
  // @UseGuards(TockenGuard)
  async getNews() {
    const result = await this.questionService.testingNews();
    return result;
  }

  @Post('answers-summary/:parent')
  @UseGuards(TockenGuard)
  async questionSummary(
    @Body() data: QuestionSummary,
    @Param('parent') parent: string,
    @Req() req: Request,
  ) {
    const now = Date.now();
    const user = req['user'];
    const result = await this.questionService.questionSummary(
      data.answers,
      data.question,
    );
    const payload = {
      question: `can you summarize the answers to this question: ${data.question}`,
      answer: [result],
    };
    const followup = await this.questionService.getFollowUpQuestions(payload);
    const temp = this.standerdisationService.standerdizeResults(
      result,
      'chat-gpt',
      0,
      '',
      0,
      {},
      '',
    );
    const finalFormat = this.standerdisationService.globalAnswerFromat(
      `can you summarize the answers to this question: ${data.question}`,
      [temp],
      Date.now() - now,
      followup.split('\n'),
      0,
      1,
      data.questionId,
    );
    const sessionData: SessionInterface = {
      question: `can you summarize the answers to this question: ${data.question}`,
      questionType: 'summarize',
      answers: [...data.answers],
      answer: JSON.stringify(finalFormat),
      isParent: parent === '0' ? true : false,
      parent: parent === '0' ? null : parent,
      userId: user.id,
      ignore: true,
    };
    const session = await this.sessionService.createSession(sessionData);
    return this.standerdisationService.successDataResponse(
      'success',
      finalFormat,
      session.parent,
      session.question,
    );
  }
  @Post('prompt-testing')
  async testingPrompt(@Body() data: Testing) {
    const result = await this.questionService.prompttesting(data.text);
    return result;
  }

  @Get('albert-testing/:fileId/:question')
  @UseGuards(TockenGuard)
  async albertTesting(
    @Param('fileId') fileId: string,
    @Param('question') question: string,
    @Req() req: Request,
  ) {
    const user = req['user'];
    const result = this.questionService.albertTesting(
      fileId,
      question,
      user.email,
    );
    return result;
  }
  @Post('large-file-testing')
  @UseGuards(TockenGuard)
  async largeTesting(@Body() data: LargeFileTesting, @Req() req: Request) {
    const user = req['user'];
    const result = await this.questionService.largeFileTesting(
      data,
      user.email,
    );
    return result;
  }

  @Get('headlines')
  async getHeadlines() {
    const headlines = await this.questionService.getHeadlines();
    return headlines;
  }

  @Get('testing-retreavel')
  async getContent() {
    const now = Date.now();
    const result = await this.questionService.getStirng(
      'https://www.w3schools.com/whatis/whatis_react.asp',
    );
    return { ans: result, time: Date.now() - now };
  }

  @Post('test-4o')
  async promptTest4o(@Body() data: Testing) {
    const result = await this.questionService.promptTesting4o(data.text);
    return result;
  }

  @Post('test-3.5')
  async promptTest35(@Body() data: Testing) {
    const result = await this.questionService.promptTesting35(data.text);
    return result;
  }

  @Post('test-flowise')
  async flowiseTesting(@Body() data: Flowise) {
    const content = await this.questionService.scrapeWebsite(data.url);
    const result = await this.flowise.testingQuestions(data.question, content);
    return result;
  }
}
