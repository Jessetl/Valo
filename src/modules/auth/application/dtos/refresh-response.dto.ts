import { ApiProperty } from '@nestjs/swagger';

export class RefreshResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIs...',
    description: 'Nuevo JWT custom firmado por el backend (TTL 15 min)',
  })
  access_token!: string;

  @ApiProperty({ example: 900, description: 'TTL del JWT en segundos' })
  expires_in!: number;
}
