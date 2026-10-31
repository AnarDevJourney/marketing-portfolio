import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface AuthAdmin {
  id: string;
  email: string;
}

export const CurrentAdmin = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthAdmin =>
    ctx.switchToHttp().getRequest<Request>().user as AuthAdmin,
);
