import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { WelcomeModule } from '../welcome/welcome.module';

@Module({
  imports: [WelcomeModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
