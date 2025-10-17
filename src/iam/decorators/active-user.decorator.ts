import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { REQUEST_USER_KEY } from '../iam.constant';
import { ActiveUserData } from '../interfaces/active-user.interface';

export const ActiveUser = createParamDecorator(
  (field: keyof ActiveUserData | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest<Request>();
    const user = req[REQUEST_USER_KEY];
    return field ? user?.[field] : user;
  },
);
