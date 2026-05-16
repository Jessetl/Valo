import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class LoginGoogleDto {
  @ApiProperty({
    description: 'idToken emitido por Google OAuth via Firebase Auth en el cliente',
    example: 'eyJhbGciOiJSUzI1NiIs...',
  })
  @IsString()
  @MinLength(10)
  @Expose({ name: 'google_id_token' })
  google_id_token!: string;
}
