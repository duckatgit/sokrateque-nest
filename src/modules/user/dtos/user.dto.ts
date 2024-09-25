import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';

export class UserDto {
  @ApiProperty({
    description: 'make sure the value here is valid email',
    example: 'john',
  })
  @IsNotEmpty()
  firstName?: string;

  @ApiProperty({
    description: 'make sure the value here is valid email',
    example: 'doe',
  })
  @IsNotEmpty()
  lastName?: string;

  @ApiProperty({
    description: 'make sure the value here is valid email',
    example: 'india',
  })
  @IsNotEmpty()
  country?: string;

  @ApiProperty({
    description: 'make sure the value here is valid email',
    example: 'johndoe@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'make sure the value here is valid email',
    example: 'password',
  })
  @IsNotEmpty()
  password?: string;

  user_image?: string;

  user_role?: string;

  userType?: string;

  otp_expiry?: Date;

  otp?: string;

  sokrates_permission?: string;

  subscriptionID?: string;

  stripe_subscription_id?: string;

  lastActivity?: Date;

  researcher_points?: number;

  sessions_total?: number;

  isLogged?: boolean;

  on_trial?: string;

  trial_period?: string;

  answerSource?: string;

  isDeleted?: boolean;

  sheerIdVerification?: string;

  sheerIdStatus?: string;

  questionAnswerSource?: string;

  stripeCustomerId?: string;

  isActive?: boolean;

  g_access_token?: string;

  termsAndPolicies?: boolean;

  createdAt?: Date;

  updatedAt?: Date;
}
