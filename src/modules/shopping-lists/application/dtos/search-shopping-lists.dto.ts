import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ShoppingListType } from '../../domain/enums/shopping-list-type.enum';

export class SearchShoppingListsFiltersDto {
  @ApiPropertyOptional({ enum: ShoppingListType })
  @IsOptional()
  @IsEnum(ShoppingListType)
  listType?: ShoppingListType;

  @ApiPropertyOptional({ example: 'Supermercado Central', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  storeName?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  scheduledDateFrom?: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  scheduledDateTo?: string;
}

export class SearchShoppingListsDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ type: SearchShoppingListsFiltersDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SearchShoppingListsFiltersDto)
  filters?: SearchShoppingListsFiltersDto;
}
