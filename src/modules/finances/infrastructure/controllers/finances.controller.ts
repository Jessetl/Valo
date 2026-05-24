import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserId } from '../../../../shared-kernel/infrastructure/decorators/current-user-id.decorator';
import { ParseUUIDPipe } from '../../../../shared-kernel/infrastructure/pipes/parse-uuid.pipe';
import { CreateFinancialRecordUseCase } from '../../application/use-cases/create-financial-record.use-case';
import { UpdateFinancialRecordUseCase } from '../../application/use-cases/update-financial-record.use-case';
import { DeleteFinancialRecordUseCase } from '../../application/use-cases/delete-financial-record.use-case';
import { GetFinancialRecordByIdUseCase } from '../../application/use-cases/get-financial-record-by-id.use-case';
import { SearchFinancialRecordsUseCase } from '../../application/use-cases/search-financial-records.use-case';
import { GetFinancialSummaryUseCase } from '../../application/use-cases/get-financial-summary.use-case';
import { CreateFinancialRecordDto } from '../../application/dtos/create-financial-record.dto';
import { UpdateFinancialRecordDto } from '../../application/dtos/update-financial-record.dto';
import { SearchFinancialRecordsDto } from '../../application/dtos/search-financial-records.dto';
import { FinancialRecordResponseDto } from '../../application/dtos/financial-record-response.dto';
import { SearchFinancialRecordsResponseDto } from '../../application/dtos/search-financial-records-response.dto';
import { FinancialSummaryResponseDto } from '../../application/dtos/financial-summary-response.dto';
import { FinancialSummaryQueryDto } from '../../application/dtos/financial-summary-response.dto';
import {
  ApiErrorResponse,
  ApiValidationErrorResponse,
} from '../../../../shared-kernel/application/responses/api-response.dto';

@ApiTags('Finances')
@ApiBearerAuth('jwt')
@ApiHeader({ name: 'X-Device-Id', required: true })
@ApiHeader({ name: 'X-Device-Name', required: true })
@Controller('finances')
export class FinancesController {
  constructor(
    private readonly createRecord: CreateFinancialRecordUseCase,
    private readonly updateRecord: UpdateFinancialRecordUseCase,
    private readonly deleteRecord: DeleteFinancialRecordUseCase,
    private readonly getRecord: GetFinancialRecordByIdUseCase,
    private readonly searchRecords: SearchFinancialRecordsUseCase,
    private readonly getSummary: GetFinancialSummaryUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear registro financiero',
    description:
      'Crea ingreso o egreso. Si trae date, agenda automaticamente una notificacion 1 dia antes. Si isRecurring=true, el cron generara registros mensuales en recurrenceDay.',
  })
  @ApiResponse({
    status: 201,
    description: 'Registro creado',
    type: FinancialRecordResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos invalidos',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Token invalido o ausente',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 422,
    description: 'Validacion fallida',
    type: ApiValidationErrorResponse,
  })
  create(
    @CurrentUserId() userId: string,
    @Body() dto: CreateFinancialRecordDto,
  ): Promise<FinancialRecordResponseDto> {
    return this.createRecord.execute({ userId, dto });
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar registros financieros con filtros y paginacion',
    description:
      'Devuelve un resumen liviano de cada registro con el estado de su notificacion.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado',
    type: SearchFinancialRecordsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos invalidos',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Token invalido o ausente',
    type: ApiErrorResponse,
  })
  search(
    @CurrentUserId() userId: string,
    @Body() dto: SearchFinancialRecordsDto,
  ): Promise<SearchFinancialRecordsResponseDto> {
    return this.searchRecords.execute({ userId, dto });
  }

  @Get('summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resumen financiero mensual',
    description:
      'Totales del mes (ingresos, egresos, balance neto) y proximos 3 egresos por vencer.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen',
    type: FinancialSummaryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos invalidos',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Token invalido o ausente',
    type: ApiErrorResponse,
  })
  summary(
    @CurrentUserId() userId: string,
    @Query() query: FinancialSummaryQueryDto,
  ): Promise<FinancialSummaryResponseDto> {
    return this.getSummary.execute({
      userId,
      month: query.month,
      year: query.year,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener detalle de un registro financiero',
  })
  @ApiParam({ name: 'id', description: 'UUID del registro' })
  @ApiResponse({
    status: 200,
    description: 'Registro',
    type: FinancialRecordResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'UUID invalido',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Token invalido o ausente',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Registro no encontrado',
    type: ApiErrorResponse,
  })
  findOne(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<FinancialRecordResponseDto> {
    return this.getRecord.execute({ userId, recordId: id });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar registro financiero',
    description:
      'Actualizacion parcial. Si cambia date se reprograma la notificacion. Si date llega null se elimina la notificacion PENDING.',
  })
  @ApiParam({ name: 'id', description: 'UUID del registro' })
  @ApiResponse({
    status: 200,
    description: 'Registro actualizado',
    type: FinancialRecordResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos invalidos',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Token invalido o ausente',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Registro no encontrado',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 422,
    description: 'Validacion fallida',
    type: ApiValidationErrorResponse,
  })
  update(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFinancialRecordDto,
  ): Promise<FinancialRecordResponseDto> {
    return this.updateRecord.execute({ userId, recordId: id, dto });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar registro financiero',
    description:
      'Elimina el registro y todas sus notificaciones asociadas en una transaccion.',
  })
  @ApiParam({ name: 'id', description: 'UUID del registro' })
  @ApiResponse({ status: 204, description: 'Eliminado' })
  @ApiResponse({
    status: 400,
    description: 'UUID invalido',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Token invalido o ausente',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Registro no encontrado',
    type: ApiErrorResponse,
  })
  async remove(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.deleteRecord.execute({ userId, recordId: id });
  }
}
