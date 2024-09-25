import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { JwtService } from '@nestjs/jwt';
@Module({
  imports: [UserModule, AuthModule],
  controllers: [PaymentController],
  providers: [PaymentService, JwtService],
})
export class PaymentModule {}
