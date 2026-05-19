import { describe, expect, it } from '@jest/globals';
import 'reflect-metadata';
import { CompareShoppingListsUseCase } from './application/use-cases/compare-shopping-lists.use-case';
import { SearchShoppingListsUseCase } from './application/use-cases/search-shopping-lists.use-case';
import { CreateShoppingListUseCase } from './application/use-cases/create-shopping-list.use-case';
import { DeleteShoppingListUseCase } from './application/use-cases/delete-shopping-list.use-case';
import { GetShoppingListByIdUseCase } from './application/use-cases/get-shopping-list-by-id.use-case';
import { UpdateShoppingListUseCase } from './application/use-cases/update-shopping-list.use-case';
import { SHOPPING_LIST_REPOSITORY } from './domain/interfaces/repositories/shopping-list.repository.interface';
import { ShoppingListsController } from './infrastructure/controllers/shopping-lists.controller';
import { TypeOrmShoppingListRepository } from './infrastructure/persistence/repositories/typeorm-shopping-list.repository';
import { ShoppingListsModule } from './shopping-lists.module';

describe('ShoppingListsModule metadata', () => {
  it('declara controller del modulo', () => {
    const controllers = Reflect.getMetadata(
      'controllers',
      ShoppingListsModule,
    ) as unknown[];

    expect(controllers).toContain(ShoppingListsController);
  });

  it('registra provider del repositorio + use cases alineados al spec', () => {
    const providers = Reflect.getMetadata(
      'providers',
      ShoppingListsModule,
    ) as unknown[];

    expect(providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          provide: SHOPPING_LIST_REPOSITORY,
          useClass: TypeOrmShoppingListRepository,
        }),
        CreateShoppingListUseCase,
        GetShoppingListByIdUseCase,
        UpdateShoppingListUseCase,
        DeleteShoppingListUseCase,
        CompareShoppingListsUseCase,
        SearchShoppingListsUseCase,
      ]),
    );
  });

  it('exporta el token del repositorio', () => {
    const exportsMetadata = Reflect.getMetadata(
      'exports',
      ShoppingListsModule,
    ) as unknown[];

    expect(exportsMetadata).toContain(SHOPPING_LIST_REPOSITORY);
  });
});
