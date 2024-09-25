import { ApiProperty } from '@nestjs/swagger';

export class Flowise {
  @ApiProperty({
    description: 'url of website',
    example: 'https://en.wikipedia.org/wiki/Shark',
  })
  url: string;

  @ApiProperty({
    description: 'make sure the value here is valid',
    example: 'what are sharks',
  })
  question: string;
}
