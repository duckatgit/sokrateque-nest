import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class askGoogleDocs {
  @ApiProperty({
    description:
      'the id of the file that you are askging this question to this is used for just as a reference',
    example: '0',
  })
  @IsNotEmpty()
  fileId: string;

  @ApiProperty({
    description: 'the question that you want to ask the folder',
    example: 'can you provide me a summary',
  })
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: 'the content that you wnat to ask the question from',
    example: 'can you provide me a summary',
  })
  @IsNotEmpty()
  contnet: string;
}
