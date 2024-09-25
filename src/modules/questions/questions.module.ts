import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { ServicesModule } from 'src/core/services/services.module';
import { BookShelfModule } from '../book-shelf/book-shelf.module';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { SessionsModule } from '../sessions/sessions.module';
import { GDriveModule } from '../g-drive/g-drive.module';
@Module({
  imports: [
    ServicesModule,
    BookShelfModule,
    AuthModule,
    UserModule,
    SessionsModule,
    GDriveModule,
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService, JwtService],
})
export class QuestionsModule {}
