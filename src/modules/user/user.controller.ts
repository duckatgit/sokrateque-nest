import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from 'src/modules/user/dtos/user.dto';
import {
  USER_SUCCESS,
  USER_ERROR,
  AUTH_ERROR,
  SERVER_SUCCESS,
} from 'src/core/messages';
import { TockenGuard } from 'src/core/guards/tocken.guard';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StanderdisationService } from 'src/core/services/standerdisation/standerdisation.service';
import { GDriveService } from '../g-drive/g-drive.service';
import { Request, Response } from 'express';

@ApiTags('User Modules')
@Controller('user')
@ApiHeader({
  name: 'Authorizations',
  description: 'Auth token',
})
export class UserController {
  constructor(
    private readonly userService: UserService,
    private standerdisationService: StanderdisationService,
    private gDriveService: GDriveService,
  ) {}

  @Get('find-all')
  @UseGuards(TockenGuard)
  @ApiOperation({ summary: 'will return all the users in the db' })
  @ApiResponse({
    status: 200,
    description: 'list of all users',
  })
  @ApiResponse({
    status: 401,
    description: 'token is invalid or expired',
  })
  @ApiResponse({
    status: 404,
    description: 'Users not found',
  })
  async FfindAll() {
    const usersList = await this.userService.findAll();
    if (!usersList) throw new NotFoundException(USER_ERROR.notFound);
    return usersList;
  }

  @Get('find-one')
  @UseGuards(TockenGuard)
  @ApiOperation({ summary: 'Will return user data accourding to id given' })
  @ApiResponse({
    status: 200,
    description: 'Data of user',
  })
  @ApiResponse({
    status: 401,
    description: 'token is invalid or expired',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findOne(@Req() req: Request) {
    const user = req['user'];
    const userData = await this.userService.findById(user.id);
    if (!userData) throw new NotFoundException(USER_ERROR.notFound);
    const files = await this.gDriveService.checkGetFiles(user.id);
    console.log(files);
    const filteredUser: any = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      country: userData.country,
      email: userData.email,
      user_image: userData.user_image,
      user_role: userData.user_role,
      userType: userData.userType,
      total_time_saved: userData.total_time_saved,
      welcomeCounter: userData.welcomeCounter,
      provider: userData.provider,
      now: Date.now(),
      difference: Date.now() - userData.drive_expairy_date,
      driveStatus: files,
    };
    return this.standerdisationService.successDataResponse(
      SERVER_SUCCESS.common,
      filteredUser,
    );
  }

  @Post('create')
  @UseGuards(TockenGuard)
  @ApiOperation({
    summary:
      'will add the user data to the db. it is seperate from login and requires token for auth',
  })
  @ApiResponse({
    status: 200,
    description: 'successfully added the user data',
  })
  @ApiResponse({
    status: 401,
    description: 'token is invalid or expired',
  })
  @ApiResponse({
    status: 403,
    description: 'error when creating',
  })
  async create(@Body() user: UserDto) {
    if (!user.email) throw new Error(AUTH_ERROR.invalidEmail);
    const exist = await this.userService.findByEmail(user.email);
    if (!exist) {
      const userData = await this.userService.create(user);
      if (!userData) throw new ForbiddenException(USER_ERROR.creationError);
      return this.standerdisationService.successDataResponse(
        SERVER_SUCCESS.common,
        userData,
      );
    } else {
      throw new ConflictException(USER_ERROR.emailExist);
    }
  }

  @Put('update')
  @UseGuards(TockenGuard)
  async update(@Body() user: UserDto, @Req() req: Request) {
    const loginData = req['user'];
    const updatedData = await this.userService.update(loginData.id, user);
    return this.standerdisationService.successDataResponse(
      USER_SUCCESS.userUpdated,
      updatedData,
    );
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: number) {
    const result = await this.userService.delete(id);
    if (result.affected != 1) throw new Error(USER_ERROR.userDeleteError);
    return this.standerdisationService.successMessageResponse(
      USER_SUCCESS.userDeleteSuccess,
    );
  }

  @Put('update-welcome-counter')
  @UseGuards(TockenGuard)
  async updateWelcomeCounter(@Req() req: Request) {
    const user = req['user'];
    await this.userService.updateWelcomeCounter(1, user.id);
    return this.standerdisationService.successMessageResponse(
      'successfully updated count',
    );
  }

  @Get('verify-user')
  @UseGuards(TockenGuard)
  async verifyToken() {
    console.log('token verified');
    const valid = {
      statusCode: 200,
      message: 'The use is valid',
      status: 'Valid Token',
    };

    return valid;
  }
}
