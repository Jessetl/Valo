import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../shared-kernel/application/use-case';
import type { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/repositories/user.repository.interface';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';

interface UpdateProfileInput {
  userId: string;
  dto: UpdateProfileDto;
}

@Injectable()
export class UpdateProfileUseCase
  implements UseCase<UpdateProfileInput, UserResponseDto>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: UpdateProfileInput): Promise<UserResponseDto> {
    const { userId, dto } = input;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    const updated = user.updateProfile({
      firstName: dto.first_name,
      lastName: dto.last_name,
      avatarUrl: dto.avatar_url,
      countryCode: dto.country_code,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });

    const saved = await this.userRepository.save(updated);
    return UserMapper.toResponse(saved);
  }
}
