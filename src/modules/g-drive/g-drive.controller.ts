import {
  Body,
  Controller,
  Get,
  // Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GDriveService } from './g-drive.service';
import { GLogin } from './dtos/g-login.dto';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { TockenGuard } from 'src/core/guards/tocken.guard';
import { Request } from 'express';
import { StanderdisationService } from 'src/core/services/standerdisation/standerdisation.service';
import { AUTH_SUCCESS } from 'src/core/messages';
import { GCode } from './dtos/g-code.dot';

@ApiTags('Google Module')
@Controller('g-drive')
export class GDriveController {
  constructor(
    private readonly gdService: GDriveService,
    private standardService: StanderdisationService,
  ) {}

  @Post('login')
  async gLogin(@Body() data: GLogin) {
    console.log(data);
    const result = await this.gdService.doGoogleLogin(data);
    return this.standardService.successDataResponse(
      AUTH_SUCCESS.loginSuccess,
      result,
    );
  }

  @Get('permission-url')
  @ApiHeader({
    name: 'Authorizations',
    description: 'Auth token',
  })
  @UseGuards(TockenGuard)
  async getPermissions() {
    const result = await this.gdService.generateAuthUrl();
    return this.standardService.successDataResponse('resuest success', result);
  }

  @Post('generate-token')
  @ApiHeader({
    name: 'Authorizations',
    description: 'Auth token',
  })
  @UseGuards(TockenGuard)
  async getTockens(@Req() req: Request, @Body() data: GCode) {
    const user = req['user'];
    const result = await this.gdService.generateToken(data.code, user.id);
    return this.standardService.successDataResponse('request success', result);
  }

  @Get('get-file')
  @ApiHeader({
    name: 'Authorizations',
    description: 'Auth token',
  })
  @UseGuards(TockenGuard)
  async getFiles(@Req() req: Request) {
    const user = req['user'];
    const result = await this.gdService.getFiles(user.id);
    if (result == 'could not get files') {
      return this.standardService.successMessageResponse(result);
    }
    return this.standardService.successDataResponse('request success', result);
  }

  @Get('default')
  default(@Query() query: any) {
    return { message: 'working', query };
  }

  // @Get('download-flie/:fileId')
  // @ApiHeader({
  //   name: 'Authorizations',
  //   description: 'Auth token',
  // })
  // @UseGuards(TockenGuard)
  // async downloadFile(@Param('fileId') fileId: string, @Req() req: Request) {
  //   const user = req['user'];
  //   const result = await this.gdService.getFile(user.id);
  //   return result;
  // }
}
