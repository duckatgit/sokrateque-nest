import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class VerifyEmail {
  @ApiProperty({
    description: 'make sure the value here is valid email',
    example: 'OobrLtl%qByutoA%&5sokqce',
  })
  @IsNotEmpty()
  token: string;
}
