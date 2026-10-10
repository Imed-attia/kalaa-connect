import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole, User } from '@kalaa-connect/shared';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Aucune restriction de rôle
    }

    const { user } = context.switchToHttp().getRequest<{ user: User }>();

    if (!user) {
      throw new ForbiddenException('Accès refusé : utilisateur non authentifié');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Accès refusé : le rôle '${user.role}' ne dispose pas des droits requis (${requiredRoles.join(', ')})`,
      );
    }

    return true;
  }
}
