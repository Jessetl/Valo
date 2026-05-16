import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIs...',
    description: 'JWT custom firmado por el backend (TTL 15 min)',
  })
  access_token!: string;

  @ApiProperty({ example: 900, description: 'TTL del JWT en segundos' })
  expires_in!: number;

  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;
}
