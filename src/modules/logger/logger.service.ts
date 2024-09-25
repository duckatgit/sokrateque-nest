import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from './schema/logger.entity';
// import { USER_ERROR } from 'src/core/messages';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { UserService } from '../user/user.service';

@Injectable()
export class LoggerService {
  private readonly logger: winston.Logger;
  constructor(
    @InjectRepository(Logger) private loggerRepository: Repository<Logger>,
    private authService: AuthService,
    private userService: UserService,
  ) {
    this.logger = winston.createLogger({
      transports: [
        new DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    });
  }
  async storeApiLogData(data: Request) {
    const logData = {
      method: data.method,
      endPoint: data.url,
      user: null,
      reqData: null,
    };
    if (data.method == 'POST') logData.reqData = data.body;
    if (data.headers['authorizations']) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [barer, token] = data.headers['authorizations'].split(' ');
      const userData = await this.authService.getDataFromToken(token);
      if (!userData == null) {
        const user = await this.userService.findById(userData.id);
        logData.user = user;
      }
    } else {
      logData.user = null;
    }
    return true;
  }
  storeInFile() {}
  storeInDb() {}
}
