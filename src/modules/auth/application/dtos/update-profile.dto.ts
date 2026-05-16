import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Jane', maxLength: 80, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Expose({ name: 'first_name' })
  first_name?: string | null;

  @ApiPropertyOptional({ example: 'Doe', maxLength: 80, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Expose({ name: 'last_name' })
  last_name?: string | null;

  @ApiPropertyOptional({
    example: 'https://cdn.kashy.app/avatars/jane.png',
    nullable: true,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  @Expose({ name: 'avatar_url' })
  avatar_url?: string | null;

  @ApiPropertyOptional({ example: 'VE', description: 'ISO 3166-1 alpha-2' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  @Expose({ name: 'country_code' })
  country_code?: string;

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
}
