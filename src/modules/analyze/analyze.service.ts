import { Injectable } from '@nestjs/common';
import { BookShelfService } from '../book-shelf/book-shelf.service';
import { GptServicesService } from 'src/core/services/gpt-services/gpt-services.service';
import { StanderdisationService } from 'src/core/services/standerdisation/standerdisation.service';
import { BingService } from 'src/core/services/bing/bing.service';
import { SpecialGeneratorService } from 'src/core/services/special-generator/special-generator.service';
import { AnalyzerPromptsService } from 'src/core/services/analyzer-prompts/analyzer-prompts.service';
import { GDriveService } from '../g-drive/g-drive.service';

@Injectable()
export class AnalyzeService {
  constructor(
    private bookShelfService: BookShelfService,
    private gptService: GptServicesService,
    private standadisationService: StanderdisationService,
    private bingService: BingService,
    private specialService: SpecialGeneratorService,
    private analyzePromptService: AnalyzerPromptsService,
    private gDriveService: GDriveService,
  ) {}

  async sumarizeDocument(fileId: string, userEmail: string) {
    const content = await this.bookShelfService.retreaveTextFile(
      userEmail,
      fileId,
    );
    const original = await this.bookShelfService.retreaveOriginalFile(
      userEmail,
      fileId,
    );
    const text = this.analyzePromptService.sumarizeGptPrompt(content);
    const gptResp = await this.gptService.chatGptFormatting(text);
    return { gptResp, original, content };
  }
  async getFileTheam(fileId: string, userEmail: string) {
    const content = await this.bookShelfService.retreaveTextFile(
      userEmail,
      fileId,
    );
    const original = await this.bookShelfService.retreaveOriginalFile(
      userEmail,
      fileId,
    );
    const text = this.analyzePromptService.getThemeGptPrompt(content);
    const gptResp = await this.gptService.chatGptFormatting(text);
    return { gptResp, original, content };
  }
  async getFileArguments(fileId: string, userEmail: string) {
    const content = await this.bookShelfService.retreaveTextFile(
      userEmail,
      fileId,
    );
    const original = await this.bookShelfService.retreaveOriginalFile(
      userEmail,
      fileId,
    );
    const text = this.analyzePromptService.getArgumentsGptPrompt(content);
    const gptResp = await this.gptService.chatGptFormatting(text);
    return { gptResp, original, content };
  }
  async getRethoricStatment(fileId: string, userEmail: string) {
    const content = await this.bookShelfService.retreaveTextFile(
      userEmail,
      fileId,
    );
    const original = await this.bookShelfService.retreaveOriginalFile(
      userEmail,
      fileId,
    );
    const text = this.analyzePromptService.getRethoricGptPrompt(content);
    const gptResp = await this.gptService.chatGptFormatting(text);
    return { gptResp, original, content };
  }
  async getSentiment(fileId: string, userEmail: string) {
    const content = await this.bookShelfService.retreaveTextFile(
      userEmail,
      fileId,
    );
    const original = await this.bookShelfService.retreaveOriginalFile(
      userEmail,
      fileId,
    );
    const text = this.analyzePromptService.getSentimentGptPrompt(content);
    const gptResp = await this.gptService.chatGptFormatting(text);
    return { gptResp, original, content };
  }
  async examinSegmentMC(fileId: string, userEmail: string) {
    const content = await this.bookShelfService.retreaveTextFile(
      userEmail,
      fileId,
    );
    const original = await this.bookShelfService.retreaveOriginalFile(
      userEmail,
      fileId,
    );
    const text = this.analyzePromptService.getExaminationMCGptPrompt(content);
    const gptResp = await this.gptService.chatGptFormatting(text);
    return { gptResp, original, content };
  }
  async examinSegmentOpen(fileId: string, userEmail: string) {
    const content = await this.bookShelfService.retreaveTextFile(
      userEmail,
      fileId,
    );
    const original = await this.bookShelfService.retreaveOriginalFile(
      userEmail,
      fileId,
    );
    const text = this.analyzePromptService.getExaminationOpenGptPrompt(content);
    const gptResp = await this.gptService.chatGptFormatting(text);
    return { gptResp, original, content };
  }
  async tryYourSelf(fileId: string, prompt: string, userEmail: string) {
    const content = await this.bookShelfService.retreaveTextFile(
      userEmail,
      fileId,
    );
    const original = await this.bookShelfService.retreaveOriginalFile(
      userEmail,
      fileId,
    );
    const text = this.analyzePromptService.getTryYourSelfPrompt(
      prompt,
      content,
    );
    const gptResp = await this.gptService.chatGptFormatting(text);
    return { gptResp, original, content };
  }
  async getUrlString(pageUri: string) {
    const websiteString = await this.bingService.getPageString(pageUri);
    return websiteString;
  }
  async getText(pageUri: string) {
    const content = await this.getUrlString(pageUri);
    return content;
  }

  //prompt attachment
  attachSummaryPrompt(content: string) {
    const result = this.analyzePromptService.sumarizeGptPrompt(content);
    return result;
  }
  attachThemePrompt(content: string) {
    const result = this.analyzePromptService.getThemeGptPrompt(content);
    return result;
  }
  attachArgumentPrompt(content: string) {
    const result = this.analyzePromptService.getArgumentsGptPrompt(content);
    return result;
  }
  attachRethoricPrompt(content: string) {
    const result = this.analyzePromptService.getRethoricGptPrompt(content);
    return result;
  }
  attachSentimentPrompt(content: string) {
    const result = this.analyzePromptService.getSentimentGptPrompt(content);
    return result;
  }
  attachBrief(content: string) {
    const result = this.analyzePromptService.getBriefPrompt(content);
    return result;
  }
  attachMCQPrompt(content: string) {
    const result = this.analyzePromptService.getExaminationMCGptPrompt(content);
    return result;
  }
  attachOpenPrompt(content: string) {
    const result =
      this.analyzePromptService.getExaminationOpenGptPrompt(content);
    return result;
  }
  attachTryYourSelfPrompt(content: string, prompt: string) {
    const text = this.analyzePromptService.getTryYourSelfPrompt(
      prompt,
      content,
    );
    return text;
  }
  // getting answers
  async sendToGpt(text: string) {
    const gptAnswer = await this.gptService.chatGptFormatting(text);
    return gptAnswer;
  }
  //getting followup questions
  async getFollowUpQuestions(data: { question: string; answer: string[] }) {
    const text = this.standadisationService.getFollowUpPrompt(
      data.question,
      data.answer,
    );
    const result = await this.gptService.chatGptFormatting(text);
    return result;
  }
  async getGoogleDocContent(constent: string) {
    const text = this.gDriveService.getFile(constent);
    return text;
  }

  async prepareBrief(fileId: string, userEmail: string) {
    const content = await this.bookShelfService.retreaveTextFile(
      userEmail,
      fileId,
    );
    const original = await this.bookShelfService.retreaveOriginalFile(
      userEmail,
      fileId,
    );
    const text = this.analyzePromptService.getBriefPrompt(content);
    const gptResp = await this.gptService.chatGptFormatting(text);
    return { gptResp, original, content };
  }
  async getFileIds(userEmail: string, folderId: string) {
    const files = await this.bookShelfService.retreaveAllFiles(
      folderId,
      userEmail,
    );
    const filesIds = [];
    files.content.forEach((file) => {
      filesIds.push(file.id);
    });
    return filesIds;
  }
  async getTextFromFiles(filesIds: string[], userEmail: string) {
    // const filesText = [];
    const promises = filesIds.map(async (value) => {
      const text = await this.bookShelfService.retreaveTextFile(
        userEmail,
        value,
      );
      return text;
    });
    const textList = await Promise.all(promises);
    return textList;
  }
  async getChatGptSummarizetext(filesText: string[]) {
    const promises = filesText.map(async (text: string) => {
      const answer = await this.analyzePromptService.sumarizeGptPrompt(text);
      return answer;
    });
    const textList = await Promise.all(promises);
    return textList;
  }
  async AskChatGpt(filesText: string[]) {
    const promises = filesText.map(async (text: string) => {
      const answer = await this.gptService.chatGptFormatting(text);
      return answer;
    });
    const textList = await Promise.all(promises);
    return textList;
  }
}
