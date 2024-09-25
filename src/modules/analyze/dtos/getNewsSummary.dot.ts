import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class NewsSummary {
  @ApiProperty({
    description: '',
    example: 'thi is the heading',
  })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '',
    example: 'discription of the file',
  })
  @IsNotEmpty()
  discription: string;
}
