import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class QuestionSummary {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
    },
    required: true,
    description: 'Array of files to upload',
    example: [
      'react is a library',
      'react is made by face book',
      'react is not a framework',
    ],
  })
  @IsNotEmpty()
  answers: Array<string>;

  @ApiProperty({
    description: 'question for the answers to be summarized',
    example: 'what is react',
  })
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: 'id of the question',
    example: '1',
  })
  @IsNotEmpty()
  questionId: string;
}
