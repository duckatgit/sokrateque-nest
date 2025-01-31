import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BASE_COLOR, BASE_URL, RED_COLOR } from 'src/config/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status = exception.getStatus();

    // to log an error on the console
    console.info(RED_COLOR + BASE_COLOR, '\nSTART OF Exception');
    console.info('url :', BASE_URL + request.url);
    console.info('status:', status);
    console.info('message:', exception);
    console.info(RED_COLOR + BASE_COLOR, 'END OF Exception');

    response.status(status).json({
      statusCode: status,
      message: exception['response'].message,
      error: exception['response'].error,
    });
  }
}
