import { User } from '../../domain/entities/user.entity';
import { UserResponseDto } from '../dtos/user-response.dto';

export class UserMapper {
  static toResponse(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.first_name = user.firstName;
    dto.last_name = user.lastName;
    dto.avatar_url = user.avatarUrl;
    dto.subscription_plan = user.subscriptionPlan;
    dto.country_code = user.countryCode;
    dto.latitude = user.latitude;
    dto.longitude = user.longitude;
    return dto;
  }
}
