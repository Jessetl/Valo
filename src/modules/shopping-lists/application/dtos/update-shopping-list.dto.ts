import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ShoppingListType } from '../../domain/enums/shopping-list-type.enum';
import { UpdateShoppingItemDto } from './update-shopping-item.dto';

export class UpdateShoppingListDto {
  @ApiPropertyOptional({ example: 'Compra del mes' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'Automercado Plaza', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  storeName?: string | null;

  @ApiPropertyOptional({ enum: ShoppingListType })
  @IsOptional()
  @IsEnum(ShoppingListType)
  listType?: ShoppingListType;

  @ApiPropertyOptional({ example: 'VES' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currencyCode?: string;

  @ApiPropertyOptional({ example: 37.2 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(1_000_000)
  exchangeRateSnapshot?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  ivaEnabled?: boolean;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string | null;

  @ApiPropertyOptional({ example: 10.4806, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number | null;

  @ApiPropertyOptional({ example: -66.9036, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    type: [UpdateShoppingItemDto],
    description:
      'Items de la lista. Items con id se actualizan, sin id se crean. Items existentes no incluidos se eliminan.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => UpdateShoppingItemDto)
  items?: UpdateShoppingItemDto[];
}
