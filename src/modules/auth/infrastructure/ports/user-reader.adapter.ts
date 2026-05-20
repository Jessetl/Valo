import { Inject, Injectable } from '@nestjs/common';
import type { IUserReader } from '../../../../shared-kernel/application/ports/user-reader.port';
import type { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/repositories/user.repository.interface';

@Injectable()
export class UserReaderAdapter implements IUserReader {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async existsById(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    return user !== null;
  }
}
