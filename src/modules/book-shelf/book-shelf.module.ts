import { Module } from '@nestjs/common';
import { BookShelfController } from './book-shelf.controller';
import { BookShelfService } from './book-shelf.service';
import { BookShelf } from './schema/bookShelf.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { ServicesModule } from 'src/core/services/services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookShelf]),
    UserModule,
    AuthModule,
    ServicesModule,
  ],
  controllers: [BookShelfController],
  providers: [BookShelfService, JwtService],
  exports: [BookShelfService],
})
export class BookShelfModule {}
