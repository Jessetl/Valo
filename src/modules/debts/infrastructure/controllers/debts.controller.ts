import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../../shared-kernel/infrastructure/decorators/current-user.decorator';
import { ParseUUIDPipe } from '../../../../shared-kernel/infrastructure/pipes/parse-uuid.pipe';
import type { FirebaseUser } from '../../../../shared-kernel/infrastructure/guards/firebase-auth.guard';
import { UserIdentityResolver } from '../../../../shared-kernel/infrastructure/services/user-identity-resolver.service';
import { CreateDebtUseCase } from '../../application/use-cases/create-debt.use-case';
import { GetDebtsUseCase } from '../../application/use-cases/get-debts.use-case';
import { GetDebtByIdUseCase } from '../../application/use-cases/get-debt-by-id.use-case';
import { UpdateDebtUseCase } from '../../application/use-cases/update-debt.use-case';
import { DeleteDebtUseCase } from '../../application/use-cases/delete-debt.use-case';
import { PayDebtUseCase } from '../../application/use-cases/pay-debt.use-case';
import { CreateDebtDto } from '../../application/dtos/create-debt.dto';
import { UpdateDebtDto } from '../../application/dtos/update-debt.dto';
import { ListDebtsQueryDto } from '../../application/dtos/list-debts-query.dto';
import { DebtResponseDto } from '../../application/dtos/debt-response.dto';
import { DeleteDebtResponseDto } from '../../application/dtos/delete-debt-response.dto';

@ApiTags('Debts')
@ApiBearerAuth('firebase-token')
@Controller('debts')
export class DebtsController {
  constructor(
    private readonly createDebt: CreateDebtUseCase,
    private readonly getDebts: GetDebtsUseCase,
    private readonly getDebtById: GetDebtByIdUseCase,
    private readonly updateDebt: UpdateDebtUseCase,
    private readonly deleteDebt: DeleteDebtUseCase,
    private readonly payDebt: PayDebtUseCase,
    private readonly userIdentityResolver: UserIdentityResolver,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear deuda o cobro',
    description:
      'Crea una nueva deuda (is_collection=false) o cobro (is_collection=true) en USD. ' +
      'El interes se calcula automaticamente como amount_usd * (interest_rate_pct / 100).',
  })
  @ApiResponse({
    status: 201,
    description: 'Deuda/cobro creado exitosamente',
    type: DebtResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada invalidos' })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  async create(
    @CurrentUser() firebaseUser: FirebaseUser,
    @Body() dto: CreateDebtDto,
  ) {
    const userId = await this.userIdentityResolver.resolve(firebaseUser);
    return this.createDebt.execute({ userId, dto });
  }

  @Get()
  @ApiOperation({
    summary: 'Listar deudas/cobros del usuario',
    description:
      'Retorna todas las deudas del usuario con filtros opcionales por prioridad, tipo (deuda/cobro) y estado de pago.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de deudas/cobros del usuario',
    type: [DebtResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  async findAll(
    @CurrentUser() firebaseUser: FirebaseUser,
    @Query() query: ListDebtsQueryDto,
  ) {
    const userId = await this.userIdentityResolver.resolve(firebaseUser);
    return this.getDebts.execute({
      userId,
      priority: query.priority,
      isCollection: query.is_collection,
      isPaid: query.is_paid,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una deuda/cobro' })
  @ApiParam({
    name: 'id',
    description: 'UUID de la deuda/cobro',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle de la deuda/cobro',
    type: DebtResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  @ApiResponse({ status: 404, description: 'Deuda no encontrada' })
  async findOne(
    @CurrentUser() firebaseUser: FirebaseUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const userId = await this.userIdentityResolver.resolve(firebaseUser);
    return this.getDebtById.execute({ debtId: id, userId });
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Editar deuda/cobro',
    description:
      'Actualiza los campos de una deuda/cobro. El interes se recalcula automaticamente si cambia el monto o la tasa.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la deuda/cobro',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Deuda/cobro actualizado',
    type: DebtResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada invalidos' })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  @ApiResponse({ status: 404, description: 'Deuda no encontrada' })
  async update(
    @CurrentUser() firebaseUser: FirebaseUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDebtDto,
  ) {
    const userId = await this.userIdentityResolver.resolve(firebaseUser);
    return this.updateDebt.execute({ debtId: id, userId, dto });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar deuda/cobro' })
  @ApiParam({
    name: 'id',
    description: 'UUID de la deuda/cobro',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Deuda/cobro eliminado exitosamente',
    type: DeleteDebtResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  @ApiResponse({ status: 404, description: 'Deuda no encontrada' })
  async remove(
    @CurrentUser() firebaseUser: FirebaseUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const userId = await this.userIdentityResolver.resolve(firebaseUser);
    return this.deleteDebt.execute({ debtId: id, userId });
  }

  @Put(':id/pay')
  @ApiOperation({
    summary: 'Marcar deuda/cobro como pagada',
    description: 'Cambia el estado is_paid a true.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la deuda/cobro',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Deuda/cobro marcada como pagada',
    type: DebtResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  @ApiResponse({ status: 404, description: 'Deuda no encontrada' })
  async pay(
    @CurrentUser() firebaseUser: FirebaseUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const userId = await this.userIdentityResolver.resolve(firebaseUser);
    return this.payDebt.execute({ debtId: id, userId });
  }

}
