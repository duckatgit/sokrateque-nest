import { Injectable } from '@nestjs/common';

@Injectable()
export class SpecialGeneratorService {
  generateRandomString(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    return result;
  }
  generateOtp(length: number): string {
    const characters = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    return result;
  }
  calculateTimeSaved(content: string) {
    const length = content.trim().split(/\s+/).length;
    const result = length / 238;
    const roundedResult = Math.ceil(result);

    return roundedResult;
  }
}
