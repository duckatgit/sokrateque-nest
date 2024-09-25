import { Module } from '@nestjs/common';
import { EmailService } from './email/email.service';
import { ApiServiceService } from './api-service/api-service.service';
import { HttpModule } from '@nestjs/axios';
import { SpecialGeneratorService } from './special-generator/special-generator.service';
// import { MailerModule } from '@nestjs-modules/mailer';
// // import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
// import {
//   MAIL_HOST,
//   MAIL_PORT,
//   MAIL_USER,
//   MAIL_PASS,
// } from 'src/config/mailer.config';
import { BoxServiceService } from './box-service/box-service.service';
import { StanderdisationService } from './standerdisation/standerdisation.service';
import { BingService } from './bing/bing.service';
import { GptServicesService } from './gpt-services/gpt-services.service';
import * as dotenv from 'dotenv';
import { ConfigModule } from '@nestjs/config';
import { GHelperService } from './g-drive/g-drive.service';
import { AnalyzerPromptsService } from './analyzer-prompts/analyzer-prompts.service';
import { FlowiseService } from './flowise/flowise.service';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot(),
    // MailerModule.forRoot({
    //   transport: {
    //     host: MAIL_HOST,
    //     port: Number(MAIL_PORT),
    //     secure: true,
    //     auth: {
    //       user: MAIL_USER,
    //       pass: MAIL_PASS,
    //     },
    //   },
    // }),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  providers: [
    EmailService,
    ApiServiceService,
    SpecialGeneratorService,
    BoxServiceService,
    StanderdisationService,
    BingService,
    GptServicesService,
    GHelperService,
    AnalyzerPromptsService,
    FlowiseService,
  ],
  exports: [
    EmailService,
    ApiServiceService,
    SpecialGeneratorService,
    BoxServiceService,
    StanderdisationService,
    BingService,
    GptServicesService,
    GHelperService,
    AnalyzerPromptsService,
    FlowiseService,
  ],
})
export class ServicesModule {}
