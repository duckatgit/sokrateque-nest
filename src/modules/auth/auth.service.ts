import {
  ForbiddenException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { AUTH_ERROR, TOKEN_ERROR, USER_ERROR } from 'src/core/messages';
import { Token } from './schema/token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenType } from 'src/core/enum/token_type.enum';
import { EmailService } from 'src/core/services/email/email.service';
import { SignupDto } from './dto/signup.dto';
import { CLIENT_URL } from 'src/config';
import { SpecialGeneratorService } from 'src/core/services/special-generator/special-generator.service';
import { join } from 'path';
import { BoxServiceService } from 'src/core/services/box-service/box-service.service';
import { readFileSync } from 'fs';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private emailService: EmailService,
    private specialService: SpecialGeneratorService,
    private boxService: BoxServiceService,
    @InjectRepository(Token) private tokenRepository: Repository<Token>,
  ) {}

  async doLogin(loginParams: LoginDto) {
    const userData = await this.userService.findByEmail(loginParams.email);
    if (!userData) throw new NotFoundException('user not found');
    if (!userData.isActive)
      throw new ForbiddenException(AUTH_ERROR.userInactive);
    if (userData.provider != 'application')
      throw new ForbiddenException('user login type error');
    const now = new Date(new Date().getTime());
    const expairy = new Date(
      new Date(userData.lastActivity).getTime() + 15 * 1000,
    );
    if (userData.isLogged && now < expairy)
      throw new NotAcceptableException(AUTH_ERROR.loggedIn);
    if (!userData) throw new NotFoundException(USER_ERROR.userNotExist);
    const isMatch = await bcrypt.compare(
      loginParams.password,
      userData.password,
    );
    return { isMatch, userData };
  }
  generateToken(payload) {
    const jwt = this.jwtService.sign(payload, { expiresIn: '2d' });
    return jwt;
  }
  generateRefreshToken(payload) {
    const jwt = this.jwtService.sign(payload, { expiresIn: '7d' });
    return jwt;
  }
  async addToken(token: string, type: TokenType, userId: number) {
    const user = await this.userService.findById(userId);
    const tokenDatas = {
      token: token,
      isBlackListed: false,
      Token_Type: type,
      user: user,
    };

    const newToken = this.tokenRepository.create(tokenDatas);
    return await this.tokenRepository.save(newToken);
  }
  // async blacklistToken(token: string) {
  //   // const tokenData = await this.tokenRepository.findOne({
  //   //   where: { token: token },
  //   // });
  //   // if (!tokenData) throw new UnauthorizedException(TOKEN_ERROR.notFound);
  //   // tokenData.isBlackListed = true;
  //   // return await this.tokenRepository.save(tokenData);
  // }
  async isBlacklisted(token: string) {
    const tokenData = await this.tokenRepository.findOne({
      where: { token: token },
    });
    if (!tokenData) throw new UnauthorizedException(TOKEN_ERROR.notFound);
    return tokenData.isBlackListed;
  }
  async getDataFromToken(token: string) {
    const data = await this.jwtService.decode(token);
    if (!data) return null;
    const userData = await this.userService.findById(data.id);
    return userData;
  }
  async setUserSignupEmail(userDetails: SignupDto) {
    const token = this.specialService.generateRandomString(24);
    const payload = {
      email: userDetails.email,
      userName: userDetails.firstName + ' ' + userDetails.lastName,
      token: CLIENT_URL + '/email-verification/' + token,
    };
    await this.emailService.signUpEmail(payload);

    return token;
  }
  async resendRegistrationEmail(email: string) {
    const userDetails = await this.userService.findByEmail(email);
    if (!userDetails) throw new NotFoundException(USER_ERROR.notFound);
    const payload = {
      email: userDetails.email,
      userName: userDetails.firstName + ' ' + userDetails.lastName,
      token: CLIENT_URL + '/email-verification/' + userDetails.otp,
    };
    return await this.emailService.signUpEmail(payload);
  }
  async activateUser(token: string) {
    const user = await this.userService.findByToken(token);
    if (!user) throw new NotFoundException(USER_ERROR.notFound);
    const payload = {
      isActive: true,
      otp: '',
    };
    await this.userService.update(user.id, payload);
    return true;
  }
  async getUserDetails(userId: number) {
    const sessions = await this.userService.findUserHistory(userId.toString());
    let totalAnswers = 0;
    // console.log(sessions);
    sessions.session.forEach((session) => {
      try {
        const trials = JSON.parse(session.answer);
        console.log(trials.answer.length);
        // const answers = JSON.parse(session.answer);
        if (trials?.answer) {
          console.log('working 1');
          totalAnswers += trials.answer.length;
        } else {
          console.log('working 2');
          totalAnswers += trials.length;
        }
      } catch (error) {
        console.error(error);
        console.log(session);
      }
    });
    console.log('all the sessions completed');
    const payload = {
      totalQuestions: sessions.session.length,
      totalAnswers,
      documents: totalAnswers,
    };
    return payload;
  }
  async resetPasswordEmail(email: string) {
    const userDetails = await this.userService.findByEmail(email);
    if (!userDetails) throw new NotFoundException(USER_ERROR.notFound);
    const payload = {
      email: userDetails.email,
      userName: userDetails.firstName + ' ' + userDetails.lastName,
      token: userDetails.otp,
    };
    await this.emailService.forgotPasswordEmail(payload);
    return;
  }
  async uploadDefaultsFile1(userEmail: string) {
    const file1 = join(
      __dirname,
      '..',
      '..',
      '..',
      'assets',
      'default',
      'file1.pdf',
    );
    const fileContent = readFileSync(file1);
    const arrayBuffer = fileContent.buffer;

    // Create a new Blob from the ArrayBuffer
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const formData1 = new FormData();
    formData1.append('file', blob, 'file1.pdf');
    formData1.append('userName', userEmail);
    formData1.append(
      'fileName',
      'On the electrodynamics of moving bodies by Albert Einstein',
    );
    formData1.append('parentFolderId', '0');
    console.log(formData1.get('file'));
    const uploadResult = await this.boxService.uploadDocument(formData1);
    console.log(uploadResult);
    return;
  }
  async uploadDefaultsFile2(userEmail: string) {
    const file1 = join(
      __dirname,
      '..',
      '..',
      '..',
      'assets',
      'default',
      'file2.pdf',
    );
    const fileContent = readFileSync(file1);
    const arrayBuffer = fileContent.buffer;

    // Create a new Blob from the ArrayBuffer
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const formData1 = new FormData();
    formData1.append('file', blob, 'file2.pdf');
    formData1.append('userName', userEmail);
    formData1.append(
      'fileName',
      'Reconstruction of the Apollo 11 Moon Landing Final Descent Trajectory - NASA',
    );
    formData1.append('parentFolderId', '0');
    console.log(formData1.get('file'));
    const uploadResult = await this.boxService.uploadDocument(formData1);
    console.log(uploadResult);
    return;
  }
}
