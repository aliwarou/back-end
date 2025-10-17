import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { REQUEST_USER_KEY } from 'src/iam/iam.constant';
import { RoleEnum } from '../../authentification/enums/role.enum';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';
import { ROLE_KEY } from '../decorators/role.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const user: ActiveUserData = req?.[REQUEST_USER_KEY];
    console.log(user);

    if (!user) return true;

    const roles = this.reflector.getAllAndMerge<RoleEnum[]>(ROLE_KEY, [
      context.getClass(),
      context.getHandler(),
    ]);
    console.log(roles);

    if (roles.length == 0) return true;
    return roles.some((role) => user.role.name == role);
  }
}
