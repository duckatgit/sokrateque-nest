import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class renameFile {
  @ApiProperty({
    description: 'the id of the file you want to rename',
    example: '0',
  })
  @IsNotEmpty()
  fileId: string;

  @ApiProperty({
    description: 'the new name that you wnat to use in the file',
    example: '0',
  })
  @IsNotEmpty()
  newName: string;
}
