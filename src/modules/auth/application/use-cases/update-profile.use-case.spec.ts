import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { UpdateProfileUseCase } from './update-profile.use-case';

describe('UpdateProfileUseCase', () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let useCase: UpdateProfileUseCase;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as never;
    useCase = new UpdateProfileUseCase(userRepository);
    userRepository.save.mockImplementation(async (u: User) => u);
  });

  it('lanza UserNotFoundException si user no existe', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'u-1',
        dto: { first_name: 'Jane' } as never,
      }),
    ).rejects.toBeInstanceOf(UserNotFoundException);
  });

  it('aplica patch parcial y preserva resto del perfil', async () => {
    const user = User.create(
      'u-1',
      'fb',
      'a@b.com',
      'VE',
      'OldFirst',
      'OldLast',
      'old-avatar',
    );
    userRepository.findById.mockResolvedValue(user);

    const result = await useCase.execute({
      userId: 'u-1',
      dto: { first_name: 'NewFirst', latitude: 10.5 } as never,
    });

    expect(result.first_name).toBe('NewFirst');
    expect(result.last_name).toBe('OldLast');
    expect(result.avatar_url).toBe('old-avatar');
    expect(result.latitude).toBe(10.5);
    expect(result.email).toBe('a@b.com');
  });

  it('permite limpiar campo con null explicito', async () => {
    const user = User.create(
      'u-1',
      'fb',
      'a@b.com',
      'VE',
      'Jane',
      'Doe',
      'avatar',
    );
    userRepository.findById.mockResolvedValue(user);

    const result = await useCase.execute({
      userId: 'u-1',
      dto: { avatar_url: null } as never,
    });

    expect(result.avatar_url).toBeNull();
    expect(result.first_name).toBe('Jane');
  });

  it('no modifica email aunque venga en dto (campo ignorado)', async () => {
    const user = User.create('u-1', 'fb', 'a@b.com', 'VE');
    userRepository.findById.mockResolvedValue(user);

    const result = await useCase.execute({
      userId: 'u-1',
      dto: { email: 'hacker@evil.com', first_name: 'Jane' } as never,
    });

    expect(result.email).toBe('a@b.com');
  });
});
