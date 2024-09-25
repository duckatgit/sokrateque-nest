import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'make sure the value here is valid email',
    example: 'johndoe@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'minimum 8 characters and maximum of 24 characters',
    example: 'password123',
  })
  @IsNotEmpty()
  @Length(8, 24)
  password: string;
}
