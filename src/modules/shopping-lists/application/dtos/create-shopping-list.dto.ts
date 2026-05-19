import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
import { CreateShoppingItemDto } from './create-shopping-item.dto';

export class CreateShoppingListDto {
  @ApiProperty({ example: 'Compra semanal' })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ example: 'Supermercado Central', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  storeName?: string | null;

  @ApiProperty({ enum: ShoppingListType, example: ShoppingListType.TEMPLATE })
  @IsEnum(ShoppingListType)
  listType!: ShoppingListType;

  @ApiProperty({ example: 'VE', description: 'ISO 3166-1 alpha-2' })
  @IsString()
  @Length(2, 2)
  countryCode!: string;

  @ApiProperty({ example: 'VES', description: 'ISO 4217 currency code' })
  @IsString()
  @Length(3, 3)
  currencyCode!: string;

  @ApiProperty({
    example: 36.5,
    description: 'Tasa VES/USD vigente al crear la lista',
  })
  @IsNumber()
  @Min(0.01)
  @Max(1_000_000)
  exchangeRateSnapshot!: number;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  ivaEnabled?: boolean;

  @ApiPropertyOptional({
    example: '2026-04-15T18:00:00.000Z',
    nullable: true,
  })
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

  @ApiPropertyOptional({ type: [CreateShoppingItemDto], default: [] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => CreateShoppingItemDto)
  items?: CreateShoppingItemDto[];
}
