import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateShoppingItemDto {
  @ApiPropertyOptional({
    description:
      'UUID del item existente. Si viene, se actualiza. Si no, se crea uno nuevo. ' +
      'Items existentes no incluidos en el array se eliminan.',
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ example: 'Pan campesino' })
  @IsString()
  @MaxLength(255)
  productName!: string;

  @ApiProperty({ example: 'Panaderia' })
  @IsString()
  @MaxLength(80)
  category!: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10_000)
  quantity?: number;

  @ApiProperty({ example: 12.5 })
  @IsNumber()
  @Min(0.01)
  @Max(10_000_000)
  unitPriceLocal!: number;

  @ApiPropertyOptional({ example: 0.32 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(10_000_000)
  unitPriceUsd?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isChecked?: boolean;
}
