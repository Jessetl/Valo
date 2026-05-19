import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CompareShoppingListsDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  listAId!: string;

  @ApiProperty({ example: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210' })
  @IsUUID()
  listBId!: string;
}
