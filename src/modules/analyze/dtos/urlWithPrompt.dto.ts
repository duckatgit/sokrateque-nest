import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UrlPrompt {
  @ApiProperty({
    description: 'url of the page you want to analyze',
    example: 'https://react.dev/',
  })
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: 'url of the page you want to analyze',
    example: 'https://react.dev/',
  })
  @IsNotEmpty()
  prompt: string;
}