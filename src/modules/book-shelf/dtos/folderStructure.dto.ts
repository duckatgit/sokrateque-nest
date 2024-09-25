import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FolderStructure {
  @ApiProperty({
    description: 'the name of the folder that you are going to create',
    example: 'new folder',
  })
  @IsNotEmpty()
  folderName: string;

  @ApiProperty({
    description:
      'the id of the folder in which you are going to create the folder',
    example: '0',
  })
  @IsNotEmpty()
  parentFolderId: string;
}
