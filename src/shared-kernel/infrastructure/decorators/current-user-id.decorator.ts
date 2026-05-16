import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthUser } from '../guards/jwt-auth.guard';

export const CurrentUserId = createParamDecorator<undefined, string>(
  (_data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    const userId = request.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Invalid token payload: missing userId');
    }
    return userId;
  },
);
