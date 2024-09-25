import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiHeader } from '@nestjs/swagger';
import { TockenGuard } from 'src/core/guards/tocken.guard';
import { SessionsService } from './sessions.service';
import { ChangeName } from './dtos/changeName.dto';
import { StanderdisationService } from 'src/core/services/standerdisation/standerdisation.service';
import { Merging } from './dtos/mergeing.dto';
import { AnswerLists } from './dtos/questionIdList.dto';
import { Request, Response } from 'express';

@ApiTags('Sessions Module')
@Controller('sessions')
@ApiHeader({
  name: 'Authorizations',
  description: 'Auth token',
})
export class SessionsController {
  constructor(
    private sessionService: SessionsService,
    private standerdService: StanderdisationService,
  ) {}
  @Get('current-session/:parentId')
  @UseGuards(TockenGuard)
  async getCurrentSession(@Param('parentId') parentId: string) {
    const result = await this.sessionService.findAllSession(parentId);
    return this.standerdService.successDataResponse(
      'success',
      result,
      parentId,
    );
  }

  @Get('session-history')
  @UseGuards(TockenGuard)
  async getUserHistory(@Req() req: Request) {
    const user = req['user'];
    const result = await this.sessionService.retreaveUserHistory(user.id);
    return this.standerdService.successDataResponse('success', result);
  }

  @Put('change-name/:parentId')
  @UseGuards(TockenGuard)
  async changeName(
    @Param('parentId') parentId: string,
    @Body() data: ChangeName,
  ) {
    await this.sessionService.chnageName(parentId, data.newName);
    return this.standerdService.successMessageResponse(
      'successfully chnaged session name',
    );
  }

  @Delete('delete-session/:sessionId')
  @UseGuards(TockenGuard)
  async deleteSession(@Param('sessionId') sessionId: string) {
    const result = await this.sessionService.deleteSession(sessionId);
    return this.standerdService.successDataResponse(
      'successfully deleted session',
      result,
    );
  }

  @Put('restore-session/:sessionId')
  @UseGuards(TockenGuard)
  async restoreSession(@Param('sessionId') sessionId: string) {
    const result = await this.sessionService.restoreSession(sessionId);
    return this.standerdService.successDataResponse(
      'successfully restored session',
      result,
    );
  }

  @Get('user-trash')
  @UseGuards(TockenGuard)
  async userTrash(@Req() req: Request) {
    const user = req['user'];
    const result = await this.sessionService.getUserTrash(user.id);
    return this.standerdService.successDataResponse(
      'successfully retreaved trash files',
      result,
    );
  }
  @Put('merge-session')
  @UseGuards(TockenGuard)
  async mergeSession(@Body() data: Merging) {
    const result = await this.sessionService.mergeSessions(
      data.primaryId,
      data.secondaryId,
    );
    return this.standerdService.successDataResponse(
      'successfully merged session',
      result,
    );
  }
  @Delete('delete-answer/:questionId/:answerId')
  @UseGuards(TockenGuard)
  async findSession(
    @Param('questionId') questionId: string,
    @Param('answerId') answerId: string,
  ) {
    const session = await this.sessionService.getQuestionDetails(questionId);
    const result = await this.sessionService.removeAnswer(session, answerId);
    return this.standerdService.successDataResponse(
      'successfully deleted session',
      result,
    );
  }

  @Put('like-answer/:questionId')
  @UseGuards(TockenGuard)
  async likeSession(
    @Param('questionId') qsId: string,
    @Body() data: AnswerLists,
  ) {
    const answerList = data.answerLists;
    for (let i = 0; i < answerList.length; i++) {
      await this.sessionService.likeAnswer(qsId, answerList[i]);
    }
    return this.standerdService.successMessageResponse(
      'successfully liked answer ',
    );
  }
  @Get('retreave-question/:questionId')
  @UseGuards(TockenGuard)
  async retreaveQuestion(@Param('questionId') questionId: string) {
    const session = await this.sessionService.getQuestionDetails(questionId);
    return session;
  }
  @Put('unlike-answer/:questionId')
  @UseGuards(TockenGuard)
  async unlikeSession(
    @Param('questionId') qsId: string,
    @Body() data: AnswerLists,
  ) {
    const answerList = data.answerLists;
    for (let i = 0; i < answerList.length; i++) {
      await this.sessionService.unLikeAnswer(qsId, answerList[i]);
    }
    return this.standerdService.successMessageResponse(
      'successfully unliked answer ',
    );
  }
  @Get('restructure')
  async restructure() {
    const result = await this.sessionService.restructure();
    return result;
  }
  @Get('get-details')
  @UseGuards(TockenGuard)
  async getDetails(@Req() req: Request) {
    const user = req['user'];
    const result = await this.sessionService.calculateSessionData(user.id);
    return this.standerdService.successDataResponse('successfull', result);
  }
}
