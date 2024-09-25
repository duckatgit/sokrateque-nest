import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GLogin {
  @ApiProperty({
    description: 'google login data',
    example: '',
  })
  @IsNotEmpty()
  data: any;
}
