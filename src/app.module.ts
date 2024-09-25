import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { LoggerModule } from './modules/logger/logger.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { JwtService } from '@nestjs/jwt';
import { ServicesModule } from './core/services/services.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { BookShelfModule } from './modules/book-shelf/book-shelf.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { AnalyzeModule } from './modules/analyze/analyze.module';
import { ChatModule } from './modules/chat/chat.module';
import { GDriveModule } from './modules/g-drive/g-drive.module';
import { AdminModule } from './modules/admin/admin.module';
import { WelcomeModule } from './modules/welcome/welcome.module';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('SQL_HOST'),
        port: +configService.get('SQL_PORT'),
        username: configService.get('SQL_USERNAME'),
        password: configService.get('SQL_PASSWORD'),
        database: configService.get('SQL_DATABASE'),
        entities: [join(process.cwd(), 'dist/**/*.entity.js')],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    LoggerModule,
    ServicesModule,
    QuestionsModule,
    BookShelfModule,
    SessionsModule,
    AnalyzeModule,
    ChatModule,
    GDriveModule,
    AdminModule,
    WelcomeModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    JwtService,
  ],
})
export class AppModule {}
