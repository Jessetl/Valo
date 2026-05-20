import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../../shared-kernel/infrastructure/decorators/public.decorator';
import { GetCurrentExchangeRateUseCase } from '../../application/use-cases/get-current-exchange-rate.use-case';
import { ExchangeRateResponseDto } from '../../application/dtos/exchange-rate-response.dto';
import { ApiErrorResponse } from '../../../../shared-kernel/application/responses/api-response.dto';

@ApiTags('Exchange Rates')
@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(
    private readonly getCurrentExchangeRate: GetCurrentExchangeRateUseCase,
  ) {}

  @Public()
  @Get('current')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener tasa de cambio VES/USD vigente',
    description:
      'Endpoint publico. Consume DolarAPI (Venezuela oficial) con cache TTL configurable via DOLARAPI_CACHE_TTL.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tasa de cambio actual',
    type: ExchangeRateResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'Servicio de tasa de cambio no disponible',
    type: ApiErrorResponse,
  })
  getCurrent(): Promise<ExchangeRateResponseDto> {
    return this.getCurrentExchangeRate.execute();
  }
}
