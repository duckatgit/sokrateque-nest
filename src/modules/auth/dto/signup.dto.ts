import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class SignupDto {
  @ApiProperty({
    description: 'enter your first name',
    example: 'John',
  })
  @IsNotEmpty()
  firstName?: string;

  @ApiProperty({
    description: 'enter your last name',
    example: 'doe',
  })
  @IsNotEmpty()
  lastName?: string;

  @ApiProperty({
    description:
      'enter the name of the country like india/america/pakistan/....',
    example: 'america',
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
    description: 'minimum 8 characters and maximum of 24 characters',
    example: 'password123',
  })
  @IsNotEmpty()
  @Length(8, 24)
  password?: string;

  otp?: string;
}
