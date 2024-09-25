import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MAGENTA_COLOR, BASE_COLOR, BASE_URL } from 'src/config/common';
import { LoggerService } from 'src/modules/logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // const request = context.switchToHttp().getRequest();
    const newNow = new Date();
    const formattedDate = newNow.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    console.info(
      MAGENTA_COLOR + BASE_COLOR,
      '\nSTART',
      `[${formattedDate}]`,
      ' - ',
      context.switchToHttp().getRequest().method,
      ' :',
      BASE_URL + context.switchToHttp().getRequest().url,
    );
    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        console.info(
          MAGENTA_COLOR + BASE_COLOR,
          `END OF ROUTE ... ${Date.now() - now} ms`,
        );
        const fullData = context.switchToHttp().getRequest();
        this.loggerService.storeApiLogData(fullData);
      }),
    );
  }
}
