import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ACCESS_TOKEN_SECRET } from 'src/config/token.config';
import { UserModule } from '../user/user.module';
import { Token } from './schema/token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesModule } from 'src/core/services/services.module';
import { SessionsModule } from '../sessions/sessions.module';
// import { BookShelfModule } from '../book-shelf/book-shelf.module';
// import { SessionsModule } from '../sessions/sessions.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Token]),
    PassportModule,
    JwtModule.register({
      secret: ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    forwardRef(() => UserModule),
    forwardRef(() => SessionsModule),
    ServicesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
