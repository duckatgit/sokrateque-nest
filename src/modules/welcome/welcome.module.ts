import { Module } from '@nestjs/common';
import { WelcomeController } from './welcome.controller';
import { WelcomeService } from './welcome.service';
import { Welcome } from './schema/welcome.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesModule } from 'src/core/services/services.module';

@Module({
  imports: [TypeOrmModule.forFeature([Welcome]), ServicesModule],
  controllers: [WelcomeController],
  providers: [WelcomeService],
  exports: [WelcomeService],
})
export class WelcomeModule {}
