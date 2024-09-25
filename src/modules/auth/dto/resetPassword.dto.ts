import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, Length } from 'class-validator';

export class ResetPassword {
  @ApiProperty({
    description:
      'enter the otp that you recived form you email (123456 is test otp)',
    example: '123456',
  })
  @IsNotEmpty()
  @IsEmail()
  otp: string;

  @ApiProperty({
    description: 'minimum 8 characters and maximum of 24 characters',
    example: 'password123',
  })
  @IsNotEmpty()
  @Length(8, 24)
  password: string;
}
