import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '../guards/jwt-auth.guard';

type CurrentUserParam = keyof AuthUser | undefined;
type CurrentUserValue = AuthUser | AuthUser[keyof AuthUser] | undefined;

export const CurrentUser = createParamDecorator<
  CurrentUserParam,
  CurrentUserValue
>((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
  const user = request.user;

  return data ? user?.[data] : user;
});
