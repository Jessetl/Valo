import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginGoogleDto {
  @ApiProperty({
    description:
      'idToken emitido por Google OAuth via Firebase Auth en el cliente',
    example: 'eyJhbGciOiJSUzI1NiIs...',
  })
  @IsString()
  @MinLength(10)
  googleIdToken!: string;
}
