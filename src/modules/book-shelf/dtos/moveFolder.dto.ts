import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class moveFolder {
  @ApiProperty({
    description: 'the id of the folder to move',
    example: '0',
  })
  @IsNotEmpty()
  folderId: string;

  @ApiProperty({
    description: 'the id of the folder to which to move',
    example: '0',
  })
  @IsNotEmpty()
  whereFolderId: string;
}
