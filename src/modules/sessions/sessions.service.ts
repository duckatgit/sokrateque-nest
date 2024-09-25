import { Injectable, NotFoundException } from '@nestjs/common';
import { Session } from './schema/sessions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { SessionInterface } from 'src/core/interface/session.interface';
import { GptServicesService } from 'src/core/services/gpt-services/gpt-services.service';
import { StanderdisationService } from 'src/core/services/standerdisation/standerdisation.service';
// import { videointelligence } from 'googleapis/build/src/apis/videointelligence';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session) private sessionRepository: Repository<Session>,
    private userService: UserService,
    private gptService: GptServicesService,
    private standardService: StanderdisationService,
  ) {}
  async createSession(data: SessionInterface) {
    let sessionName = null;
    const user = await this.userService.findById(data.userId);
    if (!data.isParent) {
      const parentData = await this.sessionRepository.findOne({
        where: { id: parseInt(data.parent) },
      });
      if (!parentData) throw new NotFoundException('parent not found');
    } else {
      const text = this.standardService.sessionNameGeneratorPrompt(
        data.question,
      );
      const responce = await this.gptService.chatGptFormatting(text);
      sessionName = responce;
    }
    const value = JSON.parse(data.answer);
    const newAnswers = [];
    value.answer.forEach((answer, index) => {
      answer.like = false;
      answer.id = index;
      newAnswers.push(answer);
    });
    value.answer = newAnswers;
    const payload: DeepPartial<Session> = {
      question: data.question,
      questionType: data.questionType,
      fileIds: data.fileIds ? data.fileIds : null,
      folderIds: data.folderIds ? data.folderIds : null,
      questiningUrl: data.questiningUrl ? data.questiningUrl : null,
      answer: JSON.stringify(value),
      isParent: data.isParent,
      parent: data.isParent ? null : data.parent,
      user: user,
      sessionName,
    };
    const session = this.sessionRepository.create(payload);
    const sessionResponce = await this.sessionRepository.save(session);
    return {
      parent: sessionResponce.isParent
        ? sessionResponce.id.toString()
        : sessionResponce.parent,
      question: sessionResponce.id,
    };
  }
  async findAllSession(parentId: string) {
    const parent = await this.sessionRepository.findOne({
      where: { id: parseInt(parentId), status: true, ignore: false },
    });
    const children = await this.sessionRepository.find({
      where: { parent: parentId, status: true, ignore: false },
    });
    const finalResult = [parent, ...children];
    return finalResult;
  }
  async retreaveUserHistory(userId: string) {
    const final = [];
    const history = await this.userService.findUserHistory(userId);
    history.session.forEach((session) => {
      if (session.isParent && session.status) {
        const temp = {
          sessionId: session.id,
          sessionName: session.sessionName,
          totalQuestions: 0,
          totalAnswers: 0,
          totalFiles: 0,
          children: [session],
        };
        history.session.forEach((child) => {
          if (parseInt(child.parent) == session.id && child.status) {
            temp.children.push(child);
            const answers = JSON.parse(child.answer);
            if (answers.answer) {
              temp.totalAnswers += answers.answer.length;
            } else {
              temp.totalAnswers += answers.length;
            }
          }
        });
        temp.totalQuestions = temp.children.length;
        temp.totalFiles = temp.totalAnswers;
        final.push(temp);
      }
    });
    return final;
  }
  async chnageName(sessionId: string, newName: string) {
    const sessionParent = await this.sessionRepository.findOne({
      where: { id: parseInt(sessionId), isParent: true, status: true },
    });
    if (!sessionParent) throw new NotFoundException('session not found');
    sessionParent.sessionName = newName;
    return this.sessionRepository.save(sessionParent);
  }
  async findSession(sessionId: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: parseInt(sessionId), status: true },
    });
    return session;
  }
  async mergeSessions(session1: string, session2: string) {
    const primarySession = await this.sessionRepository.findOne({
      where: { id: parseInt(session1), status: true },
    });
    if (!primarySession) throw new NotFoundException('session not found');
    const secondarySession = await this.sessionRepository.findOne({
      where: { id: parseInt(session2), status: true },
    });
    if (!secondarySession) throw new NotFoundException('session not found');
    const secondaryChildren = await this.sessionRepository.find({
      where: { parent: session2, status: true },
    });

    secondarySession.isParent = false;
    secondarySession.parent = primarySession.id.toString();
    secondarySession.sessionName = null;
    secondaryChildren.forEach(async (session) => {
      session.parent = primarySession.id.toString();
      await this.sessionRepository.save(session);
    });
    await this.sessionRepository.save(secondarySession);
    return;
  }

  async deleteSession(sessionId: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: parseInt(sessionId), status: true },
    });
    if (!session) throw new NotFoundException('session not found');
    if (session.isParent) {
      const children = await this.sessionRepository.find({
        where: { parent: sessionId },
      });
      children.forEach(async (child) => {
        child.status = false;
        await this.sessionRepository.save(child);
      });
    }
    session.status = false;
    return await this.sessionRepository.save(session);
  }

  async restoreSession(sessionId: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: parseInt(sessionId), status: false },
    });
    if (!session) throw new NotFoundException('session not found');
    if (session.isParent) {
      const children = await this.sessionRepository.find({
        where: { parent: sessionId },
      });
      children.forEach(async (child) => {
        child.status = true;
        await this.sessionRepository.save(child);
      });
    }
    session.status = true;
    return await this.sessionRepository.save(session);
  }
  async getUserTrash(userId: string) {
    const final = [];
    const history = await this.userService.findUserHistory(userId);
    history.session.forEach((session) => {
      if (session.isParent && !this.isActive(session)) {
        const temp = {
          sessionId: session.id,
          sessionName: session.sessionName,
          children: [session],
        };
        history.session.forEach((child) => {
          if (parseInt(child.parent) == session.id && !this.isActive(child)) {
            temp.children.push(child);
          }
        });
        final.push(temp);
      }
    });
    return final;
  }

  async isActive(session: Session) {
    return session.status;
  }
  async getQuestionDetails(questionId: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: parseInt(questionId) },
    });
    session.answer = JSON.parse(session.answer);
    return session;
  }
  async removeAnswer(session: any, answerId: string) {
    const newSession = session.answer.answer.filter((answer) => {
      if (answer.id != answerId) return answer;
    });
    session.answer.answer = newSession;
    session.answer = JSON.stringify(session.answer);
    return await this.sessionRepository.save(session);
  }
  async likeAnswer(qId: string, aId: string) {
    const currentSession = await this.sessionRepository.findOne({
      where: { id: parseInt(qId) },
    });
    const value = JSON.parse(currentSession.answer);
    const newAnswer = [];
    value.answer.forEach((answer) => {
      if (answer.id == aId) {
        answer.like = true;
      }
      newAnswer.push(answer);
    });
    value.answer = newAnswer;
    currentSession.answer = JSON.stringify(value);
    const result = await this.sessionRepository.save(currentSession);
    return result;
  }
  async unLikeAnswer(qId: string, aId: string) {
    const currentSession = await this.sessionRepository.findOne({
      where: { id: parseInt(qId) },
    });
    const value = JSON.parse(currentSession.answer);
    const newAnswer = [];
    value.answer.forEach((answer) => {
      if (answer.id == aId) {
        answer.like = false;
      }
      newAnswer.push(answer);
    });
    value.answer = newAnswer;
    currentSession.answer = JSON.stringify(value);
    const result = await this.sessionRepository.save(currentSession);
    return result;
  }
  async restructure() {}
  async calculateSessionData(userId: string) {
    const userData = await this.userService.findUserHistory(userId);
    let totalAnswers = 0;
    let totalSessions = 0;
    userData.session.forEach((session) => {
      try {
        if (session.isParent) totalSessions++;
        const answers = JSON.parse(session.answer);
        if (!answers?.answer) totalAnswers += answers.length;
        else totalAnswers += answers.answer.length;
      } catch (err) {
        console.error(err);
        console.log(session);
      }
    });
    const payload = {
      totalQuestions: userData.session.length,
      totalAnswers,
      documents: totalAnswers,
      totalTimeSaved: userData.total_time_saved,
      totalSessions,
    };
    return payload;
  }
}
