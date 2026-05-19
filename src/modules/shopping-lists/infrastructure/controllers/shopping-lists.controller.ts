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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CurrentUserId } from '../../../../shared-kernel/infrastructure/decorators/current-user-id.decorator';
import { ParseUUIDPipe } from '../../../../shared-kernel/infrastructure/pipes/parse-uuid.pipe';
import { CreateShoppingListUseCase } from '../../application/use-cases/create-shopping-list.use-case';
import { GetShoppingListByIdUseCase } from '../../application/use-cases/get-shopping-list-by-id.use-case';
import { UpdateShoppingListUseCase } from '../../application/use-cases/update-shopping-list.use-case';
import { DeleteShoppingListUseCase } from '../../application/use-cases/delete-shopping-list.use-case';
import { CompareShoppingListsUseCase } from '../../application/use-cases/compare-shopping-lists.use-case';
import { SearchShoppingListsUseCase } from '../../application/use-cases/search-shopping-lists.use-case';
import { CreateShoppingListDto } from '../../application/dtos/create-shopping-list.dto';
import { UpdateShoppingListDto } from '../../application/dtos/update-shopping-list.dto';
import { SearchShoppingListsDto } from '../../application/dtos/search-shopping-lists.dto';
import { CompareShoppingListsDto } from '../../application/dtos/compare-shopping-lists.dto';
import { ShoppingListResponseDto } from '../../application/dtos/shopping-list-response.dto';
import { PaginatedShoppingListsResponseDto } from '../../application/dtos/paginated-shopping-lists-response.dto';
import { CompareShoppingListsResponseDto } from '../../application/dtos/compare-shopping-lists-response.dto';

@ApiTags('Shopping Lists')
@ApiBearerAuth('jwt')
@Controller('shopping-lists')
export class ShoppingListsController {
  constructor(
    private readonly createShoppingList: CreateShoppingListUseCase,
    private readonly getShoppingListById: GetShoppingListByIdUseCase,
    private readonly updateShoppingList: UpdateShoppingListUseCase,
    private readonly deleteShoppingList: DeleteShoppingListUseCase,
    private readonly compareShoppingLists: CompareShoppingListsUseCase,
    private readonly searchShoppingLists: SearchShoppingListsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear lista de compras con items opcionales' })
  @ApiResponse({
    status: 201,
    description: 'Lista creada exitosamente',
    type: ShoppingListResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada invalidos' })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  async create(
    @CurrentUserId() userId: string,
    @Body() dto: CreateShoppingListDto,
  ) {
    return this.createShoppingList.execute({ userId, dto });
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar listas con filtros + paginacion',
    description:
      'Devuelve resumen paginado por lista (sin items detallados). Filtros opcionales: listType, storeName (ILIKE), isActive, scheduledDateFrom/To.',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado',
    type: PaginatedShoppingListsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Filtros invalidos' })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  async search(
    @CurrentUserId() userId: string,
    @Body() dto: SearchShoppingListsDto,
  ) {
    return this.searchShoppingLists.execute({ userId, dto });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una lista de compras' })
  @ApiParam({
    name: 'id',
    description: 'UUID de la lista de compras',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista obtenida exitosamente',
    type: ShoppingListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  @ApiResponse({ status: 404, description: 'Lista no encontrada' })
  async findOne(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) listId: string,
  ) {
    return this.getShoppingListById.execute({ listId, userId });
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar lista y reemplazar items completos',
    description:
      'Actualiza campos parciales de la lista. El array `items` enviado SUSTITUYE completamente los anteriores: items con id se actualizan, items sin id se crean, items existentes no incluidos se eliminan. Todo en una sola transaccion.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la lista de compras',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista actualizada',
    type: ShoppingListResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos invalidos' })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  @ApiResponse({ status: 404, description: 'Lista no encontrada' })
  async update(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) listId: string,
    @Body() dto: UpdateShoppingListDto,
  ) {
    return this.updateShoppingList.execute({ listId, userId, dto });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar lista de compras y todos sus items' })
  @ApiParam({
    name: 'id',
    description: 'UUID de la lista de compras',
    type: String,
  })
  @ApiResponse({ status: 204, description: 'Lista eliminada' })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  @ApiResponse({ status: 404, description: 'Lista no encontrada' })
  async remove(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) listId: string,
  ): Promise<void> {
    await this.deleteShoppingList.execute({ listId, userId });
  }

  @Post('compare')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Comparar productos entre 2 listas',
    description:
      'Cruza items por product_name (case-insensitive, trim). Matched: con diff de precio y cheaper_in. Unmatched: agrupados por lista de origen. Summary: totales, savings absolutos y recommended.',
  })
  @ApiResponse({
    status: 200,
    description: 'Comparacion generada',
    type: CompareShoppingListsResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Parametros invalidos' })
  @ApiResponse({ status: 401, description: 'Token invalido o ausente' })
  @ApiResponse({ status: 404, description: 'Alguna lista no encontrada' })
  async compare(
    @CurrentUserId() userId: string,
    @Body() dto: CompareShoppingListsDto,
  ) {
    return this.compareShoppingLists.execute({ userId, dto });
  }
}
