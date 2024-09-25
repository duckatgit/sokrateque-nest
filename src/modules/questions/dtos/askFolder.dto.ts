import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AskFolder {
  @ApiProperty({
    description:
      'the id of the folder in which you are wantnting to search. this will only look at files present in the folder will not go for the folder inside this folder',
    example: '0',
  })
  @IsNotEmpty()
  folderId: string;

  @ApiProperty({
    description: 'the question that you want to ask the folder',
    example: 'can you provide me a summary',
  })
  @IsNotEmpty()
  question: string;
}
