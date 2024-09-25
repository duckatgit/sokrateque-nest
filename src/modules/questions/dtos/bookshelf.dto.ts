import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class BookShelf {
  @ApiProperty({
    description:
      'from which file should the questions be asked form (name of the file)',
    example: '1476494094038',
  })
  @IsNotEmpty()
  fileId: string;

  @ApiProperty({
    description: 'The question that should be asked to the file',
    example: 'summarize the goals',
  })
  @IsNotEmpty()
  question: string;
}
