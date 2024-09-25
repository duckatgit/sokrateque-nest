import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AskUrl {
  @ApiProperty({
    description: 'the url of the website that you want to ask questions about',
    example: 'https://www.javatpoint.com/javascript-tutorial',
  })
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: 'the question you wnat to ask',
    example: 'what is javascript',
  })
  @IsNotEmpty()
  question: string;
}
