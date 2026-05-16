import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({
    example:
      'Usuario registrado. Revisa tu correo para verificar la cuenta antes de iniciar sesion.',
  })
  message!: string;

  @ApiProperty({ example: 'jane.doe@kashy.app' })
  email!: string;
}
