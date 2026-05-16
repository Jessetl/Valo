import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RecoverPasswordDto {
  @ApiProperty({ example: 'jane.doe@kashy.app' })
  @IsEmail()
  email!: string;
}
