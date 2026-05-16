import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ example: 'jane.doe@kashy.app' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPass123', minLength: 8, maxLength: 64 })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  password!: string;

  @ApiPropertyOptional({ example: 'Jane' })
  @IsString()
  @MaxLength(80)
  @Expose({ name: 'first_name' })
  first_name!: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsString()
  @MaxLength(80)
  @Expose({ name: 'last_name' })
  last_name!: string;

  @ApiProperty({ example: 'VE', description: 'Codigo ISO 3166-1 alpha-2' })
  @IsString()
  @Length(2, 2)
  @Expose({ name: 'country_code' })
  country_code!: string;

  @ApiPropertyOptional({ example: 10.4806 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: -66.9036 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
