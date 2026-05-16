import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiValidationFieldError {
  @ApiProperty({
    example: 'email',
    description: 'Nombre del campo que fallo la validacion',
  })
  field!: string;

  @ApiProperty({
    example: 'not-an-email',
    description: 'Valor recibido (puede ser null/undefined)',
    nullable: true,
  })
  value!: unknown;

  @ApiProperty({
    example: 'email must be an email',
    description: 'Mensaje legible del fallo de validacion',
  })
  error!: string;
}

export class ApiSuccessResponse<T> {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty()
  data!: T;

  @ApiProperty({ example: '2026-03-24T12:00:00.000Z' })
  timestamp!: string;
}

export class ApiErrorResponse {
  @ApiProperty({
    example: 'Not Found',
    description:
      'Etiqueta HTTP del status (ej. "Bad Request", "Unauthorized", "Not Found", "Conflict", "Unprocessable Entity").',
  })
  error!: string;

  @ApiProperty({
    example: 'El recurso solicitado no existe.',
    description:
      'Mensaje en espanol orientado al usuario final. En 422 puede acompanar el listado `fields`.',
  })
  message!: string;

  @ApiPropertyOptional({
    type: [ApiValidationFieldError],
    description:
      'Lista de errores por campo. Solo presente cuando la validacion (`422`) detecta uno o mas campos invalidos.',
  })
  fields?: ApiValidationFieldError[];
}

export class ApiPaginatedResponse<T> {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty()
  data!: T[];

  @ApiPropertyOptional()
  meta!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  @ApiProperty({ example: '2026-03-24T12:00:00.000Z' })
  timestamp!: string;
}
