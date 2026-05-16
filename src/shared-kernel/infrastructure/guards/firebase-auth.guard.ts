import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as admin from 'firebase-admin';
import type { Request } from 'express';
import { PUBLIC_KEY } from '../decorators/public.decorator';
import { FIREBASE_ADMIN } from '../firebase/firebase-admin.provider';

export interface FirebaseUser {
  uid: string;
  email?: string;
}

type AuthenticatedRequest = Request & {
  user?: FirebaseUser;
};

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(FIREBASE_ADMIN) private readonly firebaseAdmin: typeof admin,
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
      const decodedToken = await this.firebaseAdmin.auth().verifyIdToken(token);

      request.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
      } satisfies FirebaseUser;

      return true;
    } catch {
      throw new UnauthorizedException('Token de Firebase invalido o expirado');
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
