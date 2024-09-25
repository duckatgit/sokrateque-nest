import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class googleAnalysis {
  @ApiProperty({
    description: 'id of the document to analyze',
    example: 'document id',
  })
  @IsNotEmpty()
  fileId: string;

  @ApiProperty({
    description: 'the question that you want to ask the folder',
    example: 'can you provide me a summary',
  })
  @IsNotEmpty()
  contnet: string;
}
