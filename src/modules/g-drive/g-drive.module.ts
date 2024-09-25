import { Module, forwardRef } from '@nestjs/common';
import { GDriveController } from './g-drive.controller';
import { GDriveService } from './g-drive.service';
import { ServicesModule } from 'src/core/services/services.module';
import { UserModule } from '../user/user.module';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ServicesModule, forwardRef(() => UserModule), AuthModule],
  controllers: [GDriveController],
  providers: [GDriveService, JwtService],
  exports: [GDriveService],
})
export class GDriveModule {}
