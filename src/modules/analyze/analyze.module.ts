import { Module } from '@nestjs/common';
import { AnalyzeController } from './analyze.controller';
import { AnalyzeService } from './analyze.service';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { BookShelfModule } from '../book-shelf/book-shelf.module';
import { ServicesModule } from 'src/core/services/services.module';
import { SessionsModule } from '../sessions/sessions.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GDriveModule } from '../g-drive/g-drive.module';

@Module({
  imports: [
    AuthModule,
    BookShelfModule,
    ServicesModule,
    SessionsModule,
    EventEmitterModule.forRoot(),
    GDriveModule,
  ],
  controllers: [AnalyzeController],
  providers: [AnalyzeService, JwtService],
})
export class AnalyzeModule {}
