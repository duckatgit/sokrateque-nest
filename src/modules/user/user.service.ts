import {
  ForbiddenException,
  Injectable,
  // NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './schema/user.entity';
import { Repository } from 'typeorm';
import { UserDto } from 'src/modules/user/dtos/user.dto';
import * as bcrypt from 'bcrypt';
import { SignupDto } from '../auth/dto/signup.dto';
import { USER_ERROR } from 'src/core/messages';

interface DriveTokenInterface {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date?: number;
}

@Injectable()
export class UserService {
  /**
   * Constructor for the UserService class.
   * @param userRepository The repository for interacting with the User entity in the database.
   */
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  /**
   * Create a new user in the database.
   * @param userData The data for the new user.
   * @returns A promise that resolves to the newly created user.
   * @throws Error if there is an internal server error.
   */
  async create(userData: UserDto | SignupDto) {
    userData.password = await bcrypt.hash(userData.password, 10);
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  async createNoPassword(userData) {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  /**
   * Find all users in the database.
   * @returns A promise that resolves to an array of all users in the database.
   * @throws Error if there is an internal server error.
   */
  async findAll() {
    return await this.userRepository.find();
  }

  /**
   * Find a user by their email.
   * @param email The email of the user to find.
   * @returns A promise that resolves to the user if found, or null if not found.
   * @throws Error if there is an internal server error.
   */
  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email: email },
    });
  }
  /**
   * Find a user by their ID.
   * @param id The ID of the user to find.
   * @returns A promise that resolves to the user if found, or null if not found.
   * @throws Error if there is an internal server error.
   */
  async findById(id: number): Promise<User | null> {
    // Use the TypeORM repository to find a user by their ID
    return await this.userRepository.findOne({ where: { id: id } });
  }

  // async login(loginParams: LoginDto) {
  //   const userData = await this.userRepository.findOne({
  //     where: { email: loginParams.email },
  //   });
  //   const isMatch = await bcrypt.compare(
  //     loginParams.password,
  //     userData.password,
  //   );
  //   if (!isMatch) {
  //     throw new UnauthorizedException(SERVER_ERROR.internalError);
  //   }
  //   return isMatch;
  // }

  async update(id: number, userData: UserDto) {
    const userToUpdate = await this.userRepository.findOne({
      where: { id: id },
    });
    if (!userToUpdate) throw new NotFoundException(USER_ERROR.notFound);
    Object.keys(userData).forEach((field) => {
      userToUpdate[field] = userData[field];
    });
    return await this.userRepository.save(userToUpdate);
  }

  async delete(id: number) {
    return await this.userRepository.delete(id);
  }
  async changeLoginStatus(id: number, status: boolean) {
    const userToUpdate = await this.userRepository.findOne({
      where: { id: id },
    });
    if (!userToUpdate) throw new NotFoundException(USER_ERROR.notFound);
    userToUpdate.isLogged = status;
    const finalData = await this.userRepository.save(userToUpdate);
    return finalData;
  }
  async setLastLogin(id: number, newDate: Date) {
    const userToUpdate = await this.userRepository.findOne({
      where: { id: id },
    });
    if (!userToUpdate) throw new NotFoundException(USER_ERROR.notFound);
    userToUpdate.lastActivity = newDate;
    const finalData = await this.userRepository.save(userToUpdate);
    return finalData;
  }

  async resetPassword(id: number, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: id } });
    if (!user) throw new NotFoundException(USER_ERROR.notFound);
    user.password = await bcrypt.hash(newPassword, 10);
    return await this.userRepository.save(user);
  }

  async verifyUserOtp(otp: string) {
    const user = await this.userRepository.findOne({ where: { otp: otp } });
    if (!user) throw new NotFoundException(USER_ERROR.notFound);
    if (new Date(user.otp_expiry) <= new Date()) {
      return { status: false };
    }
    user.otp_expiry = null;
    user.otp = null;
    await this.userRepository.save(user);
    return { status: true, data: user };
  }
  async findByToken(token: string) {
    const user = await this.userRepository.findOne({ where: { otp: token } });
    if (!user) throw new NotFoundException(USER_ERROR.notFound);
    return user;
  }
  async findUserAndFiles(userId: number) {
    const id = userId;
    const userData = await this.userRepository.findOne({
      relations: ['book_shelf'],
      where: { id: id },
    });
    return userData;
  }
  async findUserHistory(userId: string) {
    const userData = await this.userRepository.findOne({
      relations: ['session'],
      where: { id: parseInt(userId) },
    });
    return userData;
  }
  async updateTimeSaved(userId: string, timeSaved: number) {
    const user = await this.userRepository.findOne({
      where: { id: parseInt(userId) },
    });
    user.total_time_saved += timeSaved;
    return await this.userRepository.save(user);
  }
  async setDriveTokens(data: DriveTokenInterface, userId: string) {
    const user = await this.findById(parseInt(userId));
    if (!user) throw new NotFoundException('user not found');
    user.drive_access = true;
    user.drive_access_token = data.access_token;
    user.drive_expairy_date = data.expiry_date;
    user.drive_refresh_token = data.refresh_token;
    user.drive_scope = data.scope;
    user.drive_token_type = data.token_type;
    return this.userRepository.save(user);
  }
  async getDriveTokens(userId: string) {
    const user = await this.findById(parseInt(userId));
    if (!user) throw new NotFoundException('user not found');
    if (!user.drive_access) throw new ForbiddenException('drive not connected');
    const today = new Date();
    const expary = new Date(user.drive_expairy_date);
    if (today < expary) throw new ForbiddenException('token expired');
    const data: DriveTokenInterface = {
      access_token: user.drive_access_token,
      // expiry_date: user.drive_expairy_date,
      refresh_token: user.drive_refresh_token,
      scope: user.drive_scope,
      token_type: user.drive_token_type,
    };
    return data;
  }

  async updateWelcomeCounter(count: number, userId: number) {
    const updated = await this.userRepository.findOne({
      where: { id: userId },
    });
    updated.welcomeCounter += count;

    return await this.userRepository.save(updated);
  }
}
