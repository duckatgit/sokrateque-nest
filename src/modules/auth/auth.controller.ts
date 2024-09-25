import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotAcceptableException,
  NotFoundException,
  NotImplementedException,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  // UseGuards,
  // UseGuards,
  // UseGuards,
} from '@nestjs/common';
import { LoginDto } from 'src/modules/auth/dto/login.dto';
import { AuthService } from './auth.service';
import {
  AUTH_ERROR,
  AUTH_SUCCESS,
  USER_ERROR,
  USER_SUCCESS,
} from 'src/core/messages';
import { SignupDto } from './dto/signup.dto';
import { UserService } from '../user/user.service';
import { Response } from 'express';
// import { TockenGuard } from 'src/core/guards/tocken.guard';
// import { TokenDto } from './dto/token.dto';
import { TokenType } from 'src/core/enum/token_type.enum';
import { ForgotPassword } from './dto/forgotPassword.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResetPassword } from './dto/resetPassword.dto';
import { UserDto } from '../user/dtos/user.dto';
import { VerifyEmail } from './dto/verifyEmail.dto';
import { SpecialGeneratorService } from 'src/core/services/special-generator/special-generator.service';
import { StanderdisationService } from 'src/core/services/standerdisation/standerdisation.service';
// import { TockenGuard } from 'src/core/guards/tocken.guard';
import { JwtService } from '@nestjs/jwt';

@ApiTags('Auth Modules')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private specialGeneratorService: SpecialGeneratorService,
    private standerdisationService: StanderdisationService,
    private jwtService: JwtService,
  ) {}

  @Post('login')
  // @UseGuards(TockenGuard)
  async loginUser(@Body() loginParams: LoginDto) {
    console.log(loginParams);
    const loginData = await this.authService.doLogin(loginParams);
    if (loginData.isMatch) {
      const payload = {
        id: loginData.userData.id,
        email: loginData.userData.email,
        role: loginData.userData.user_role,
      };
      const accessToken = this.authService.generateToken(payload);
      await this.userService.changeLoginStatus(loginData.userData.id, true);
      await this.userService.setLastLogin(loginData.userData.id, new Date());
      const sessionData = await this.authService.getUserDetails(
        loginData.userData.id,
      );
      await this.authService.addToken(
        accessToken,
        TokenType.ACCESS,
        loginData.userData.id,
      );
      console.log(accessToken);
      return this.standerdisationService.successDataResponse(
        AUTH_SUCCESS.loginSuccess,
        {
          auth_token: accessToken,
          timeSaved: loginData.userData.total_time_saved,
          firstName: loginData.userData.firstName,
          lastName: loginData.userData.lastName,
          sessionData,
          welcomeCount: loginData.userData.welcomeCounter,
        },
      );
    } else {
      throw new UnauthorizedException(AUTH_ERROR.incorrectDetails);
    }
  }

  @Post('signup')
  async signupUser(@Body() signUpParams: SignupDto) {
    const isExist = await this.userService.findByEmail(signUpParams.email);
    if (isExist) throw new ForbiddenException(USER_ERROR.emailExist);
    const otp = await this.authService.setUserSignupEmail(signUpParams);
    signUpParams.otp = otp;
    await this.userService.create(signUpParams);
    await this.authService.uploadDefaultsFile1(signUpParams.email);
    await this.authService.uploadDefaultsFile2(signUpParams.email);
    return this.standerdisationService.successMessageResponse(
      USER_SUCCESS.userCreated,
    );
  }

  @Get('signout')
  // @UseGuards(TockenGuard)
  async userSignOut(@Req() req, @Res() res: Response) {
    // if (!req.headers.authorizations || req.headers.authorizations == '')
    //   throw new UnauthorizedException(AUTH_ERROR.unauthorizedUser);
    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const [barer, token] = req.headers?.authorizations.split(' ');
    // if (!token) {
    //   throw new UnauthorizedException(AUTH_ERROR.unauthorizedUser);
    // }
    // const expairy = await this.jwtService.decode(token);
    // const id = expairy.id;
    // await this.userService.changeLoginStatus(id, false);
    // await this.authService.blacklistToken(token);
    res.status(200).json({ status: true, message: 'successfully logged out' });
  }
  @Post('forgot-password')
  async forgotPassword(@Body() email: ForgotPassword) {
    const user = await this.userService.findByEmail(email.email);
    if (!user) throw new NotFoundException(USER_ERROR.notFound);
    const newCode = this.specialGeneratorService.generateOtp(6);
    const payload: UserDto = {
      otp: newCode,
      otp_expiry: new Date(new Date().getTime() + 15 * 60 * 1000),
    };
    const update = await this.userService.update(user.id, payload);
    await this.authService.resetPasswordEmail(email.email);
    if (!update) throw new NotImplementedException(USER_ERROR.resetError);
    return USER_SUCCESS.otpSend;
  }
  @Post('reset-password')
  async resetPassword(@Body() newData: ResetPassword) {
    const validity = await this.userService.verifyUserOtp(newData.otp);
    if (!validity.status) {
      throw new NotAcceptableException(USER_ERROR.otpExpired);
    }
    const newValues = await this.userService.resetPassword(
      validity.data.id,
      newData.password,
    );
    if (!newValues) throw new ForbiddenException(USER_ERROR.resetError);
    return this.standerdisationService.successMessageResponse(
      USER_SUCCESS.resetSuccess,
    );
  }
  @Post('confirm-email')
  async confirmEmailToken(@Body() data: VerifyEmail) {
    const status = await this.authService.activateUser(data.token);
    if (status)
      return this.standerdisationService.successMessageResponse(
        AUTH_SUCCESS.userActivated,
      );
  }
  @Get('resend-email/:email')
  async resendRegistrationEmail(@Param('email') email: string) {
    await this.authService.resendRegistrationEmail(email);
    return this.standerdisationService.successMessageResponse(
      AUTH_SUCCESS.resendSuccess,
    );
  }
  @Get('version')
  getVersion() {
    return '2024.05.08 / 0.2';
  }
}
