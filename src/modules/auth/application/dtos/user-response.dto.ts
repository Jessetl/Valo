import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionPlan } from '../../domain/entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'jane.doe@kashy.app' })
  email!: string;

  @ApiPropertyOptional({ example: 'Jane', nullable: true })
  first_name!: string | null;

  @ApiPropertyOptional({ example: 'Doe', nullable: true })
  last_name!: string | null;

  @ApiPropertyOptional({
    example: 'https://cdn.kashy.app/avatars/jane.png',
    nullable: true,
  })
  avatar_url!: string | null;

  @ApiProperty({ enum: SubscriptionPlan, example: SubscriptionPlan.FREE })
  subscription_plan!: SubscriptionPlan;

  @ApiProperty({ example: 'VE' })
  country_code!: string;

  @ApiPropertyOptional({ example: 10.4806, nullable: true })
  latitude!: number | null;

  @ApiPropertyOptional({ example: -66.9036, nullable: true })
  longitude!: number | null;
}
