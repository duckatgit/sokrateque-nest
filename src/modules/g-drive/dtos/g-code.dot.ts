import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GCode {
  @ApiProperty({
    description: 'google login data',
    example: '',
  })
  @IsNotEmpty()
  code: string;
}
