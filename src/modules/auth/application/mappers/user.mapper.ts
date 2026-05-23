import { User } from '../../domain/entities/user.entity';
import { UserResponseDto } from '../dtos/user-response.dto';

export class UserMapper {
  static toResponse(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.avatarUrl = user.avatarUrl;
    dto.subscriptionPlan = user.subscriptionPlan;
    dto.countryCode = user.countryCode;
    dto.latitude = user.latitude;
    dto.longitude = user.longitude;
    return dto;
  }
}
