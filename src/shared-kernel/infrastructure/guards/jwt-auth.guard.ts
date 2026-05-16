import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PUBLIC_KEY } from '../decorators/public.decorator';

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

interface JwtCustomPayload {
  sub: string;
  email: string;
  role: string;
}

type AuthenticatedRequest = Request & {
  user?: AuthUser;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const __PUBLIC__ = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (__PUBLIC__) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authHeader = this.getAuthorizationHeader(request);
    const token = this.extractBearerToken(authHeader);

    if (!token) {
      throw new UnauthorizedException(
        'Falta o es invalido el encabezado de autorizacion',
      );
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<JwtCustomPayload>(token);

      request.user = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      } satisfies AuthUser;

      return true;
    } catch {
      throw new UnauthorizedException('Token invalido o expirado');
    }
  }

  private getAuthorizationHeader(request: Request): string | undefined {
    const header = (request.headers as Record<string, unknown>).authorization;

    if (typeof header === 'string') {
      return header;
    }

    if (Array.isArray(header)) {
      const firstValue: unknown = header[0];
      return typeof firstValue === 'string' ? firstValue : undefined;
    }

    return undefined;
  }

  private extractBearerToken(authorization?: string): string | undefined {
    if (!authorization) {
      return undefined;
    }

    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return undefined;
    }

    return token;
  }
}
