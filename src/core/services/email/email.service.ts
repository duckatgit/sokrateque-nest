import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as SendGrid from '@sendgrid/mail';
import { SEND_GRID_KEY, FROM_EMAIL } from 'src/config/mailer.config';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {
    SendGrid.setApiKey(SEND_GRID_KEY);
  }
  async signUpEmail(emailCredentials): Promise<void> {
    try {
      const htmlTemplate = fs.readFileSync(
        './src/core/email-templates/signup.template.html',
        'utf8',
      );
      const replacedTemplate = htmlTemplate
        .replace(/\[USER\]/g, emailCredentials.userName)
        .replace(/\[URL\]/g, emailCredentials.token);
      const mailPayload: SendGrid.MailDataRequired = {
        to: emailCredentials.email,
        subject: 'Email Verification',
        from: FROM_EMAIL,
        html: replacedTemplate,
      };
      await SendGrid.send(mailPayload);
      return;
    } catch (error) {
      console.error(error.response.body.errors[0]);
      throw new ForbiddenException('forbideen');
    }
  }
  async forgotPasswordEmail(emailCredentials) {
    const htmlTemplate = fs.readFileSync(
      './src/core/email-templates/forgotPassword.template.html',
      'utf8',
    );
    const replacedTemplate = htmlTemplate
      .replace(/\[USER\]/g, emailCredentials.userName)
      .replace(/\[OTP\]/g, emailCredentials.token);
    const payload: SendGrid.MailDataRequired = {
      to: emailCredentials.email,
      subject: 'PasswordOTP',
      from: FROM_EMAIL,
      html: replacedTemplate,
    };
    await SendGrid.send(payload);
    return;
  }
}
