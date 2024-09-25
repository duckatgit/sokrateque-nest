import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LargeFileTesting {
  @ApiProperty({
    description: 'insturcitons regarding chunking',
    example: 'chunking instructions',
  })
  @IsNotEmpty()
  PrimaryPrompt: string;

  @ApiProperty({
    description: 'the actual prompt that should be asked to chat gpt',
    example: 'what is javascript',
  })
  @IsNotEmpty()
  SecondaryPrompt: string;

  @ApiProperty({
    description: 'special word that will signify the end',
    example: 'end of the ',
  })
  @IsNotEmpty()
  keyWord: string;

  @ApiProperty({
    description: 'id of the file to analyze. try to use large files',
    example: '1516638592143',
  })
  @IsNotEmpty()
  fileId: string;
}
