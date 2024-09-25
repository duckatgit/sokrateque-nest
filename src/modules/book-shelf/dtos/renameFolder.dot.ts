import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class renameFolder {
  @ApiProperty({
    description: 'the id of the folder you want to rename',
    example: '0',
  })
  @IsNotEmpty()
  folderId: string;

  @ApiProperty({
    description: 'the new name that you wnat to use in the folder',
    example: '0',
  })
  @IsNotEmpty()
  newName: string;
}
