import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class moveFile {
  @ApiProperty({
    description: 'the id of the file to move',
    example: '0',
  })
  @IsNotEmpty()
  fileId: string;

  @ApiProperty({
    description: 'the id of the folder to move to',
    example: '0',
  })
  @IsNotEmpty()
  folderId: string;
}
