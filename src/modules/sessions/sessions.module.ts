import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { Session } from './schema/sessions.entity';
import { Module, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ServicesModule } from 'src/core/services/services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session]),
    forwardRef(() => UserModule),
    // UserModule,
    ServicesModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [SessionsController],
  providers: [SessionsService, JwtService],
  exports: [SessionsService],
})
export class SessionsModule {}
