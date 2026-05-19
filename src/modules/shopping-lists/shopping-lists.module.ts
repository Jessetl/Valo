import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingListOrmEntity } from './infrastructure/persistence/orm-entities/shopping-list.orm-entity';
import { ShoppingItemOrmEntity } from './infrastructure/persistence/orm-entities/shopping-item.orm-entity';
import { TypeOrmShoppingListRepository } from './infrastructure/persistence/repositories/typeorm-shopping-list.repository';
import { SHOPPING_LIST_REPOSITORY } from './domain/interfaces/repositories/shopping-list.repository.interface';
import { CreateShoppingListUseCase } from './application/use-cases/create-shopping-list.use-case';
import { GetShoppingListByIdUseCase } from './application/use-cases/get-shopping-list-by-id.use-case';
import { UpdateShoppingListUseCase } from './application/use-cases/update-shopping-list.use-case';
import { DeleteShoppingListUseCase } from './application/use-cases/delete-shopping-list.use-case';
import { CompareShoppingListsUseCase } from './application/use-cases/compare-shopping-lists.use-case';
import { SearchShoppingListsUseCase } from './application/use-cases/search-shopping-lists.use-case';
import { ShoppingListsController } from './infrastructure/controllers/shopping-lists.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShoppingListOrmEntity, ShoppingItemOrmEntity]),
    AuthModule,
  ],
  controllers: [ShoppingListsController],
  providers: [
    {
      provide: SHOPPING_LIST_REPOSITORY,
      useClass: TypeOrmShoppingListRepository,
    },
    CreateShoppingListUseCase,
    GetShoppingListByIdUseCase,
    UpdateShoppingListUseCase,
    DeleteShoppingListUseCase,
    CompareShoppingListsUseCase,
    SearchShoppingListsUseCase,
  ],
  exports: [SHOPPING_LIST_REPOSITORY],
})
export class ShoppingListsModule {}
