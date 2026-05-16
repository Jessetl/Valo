import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { GetUserByIdUseCase } from './get-user-by-id.use-case';

describe('GetUserByIdUseCase', () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let useCase: GetUserByIdUseCase;

  beforeEach(() => {
    userRepository = { findById: jest.fn() } as never;
    useCase = new GetUserByIdUseCase(userRepository);
  });

  it('lanza UserNotFoundException si no existe', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('u-1')).rejects.toBeInstanceOf(
      UserNotFoundException,
    );
  });

  it('mapea entidad a UserResponseDto', async () => {
    const user = User.create('u-1', 'fb', 'a@b.com', 'VE', 'Jane', 'Doe');
    userRepository.findById.mockResolvedValue(user);

    const result = await useCase.execute('u-1');

    expect(result).toMatchObject({
      id: 'u-1',
      email: 'a@b.com',
      first_name: 'Jane',
      last_name: 'Doe',
      country_code: 'VE',
    });
  });
});
