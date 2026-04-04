import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as admin from 'firebase-admin';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { AuthUser } from './auth.types';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);

      const user = await this.findOrCreateUser(decodedToken);
      (request as Request & { user: AuthUser }).user = user;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async findOrCreateUser(
    decodedToken: admin.auth.DecodedIdToken,
  ): Promise<AuthUser> {
    let user = await this.prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      select: {
        id: true,
        firebaseUid: true,
        email: true,
        displayName: true,
        role: true,
        householdId: true,
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          firebaseUid: decodedToken.uid,
          email: decodedToken.email || `${decodedToken.uid}@firebase.user`,
          displayName: decodedToken.name || null,
          avatarUrl: decodedToken.picture || null,
        },
        select: {
          id: true,
          firebaseUid: true,
          email: true,
          displayName: true,
          role: true,
          householdId: true,
        },
      });
    }

    return user;
  }
}
