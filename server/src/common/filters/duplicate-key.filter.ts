import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import type { Response } from 'express';

interface MongoDuplicateKeyError {
  code: number;
  keyValue?: Record<string, unknown>;
}

const isDuplicateKey = (err: unknown): err is MongoDuplicateKeyError =>
  typeof err === 'object' &&
  err !== null &&
  (err as { code?: unknown }).code === 11000;

/** Turns MongoDB unique-index violations (E11000) into 409 responses. */
@Catch()
export class DuplicateKeyFilter extends BaseExceptionFilter {
  catch(err: unknown, host: ArgumentsHost) {
    if (!isDuplicateKey(err)) return super.catch(err, host);
    const fields = Object.keys(err.keyValue ?? {});
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(HttpStatus.CONFLICT)
      .json({
        statusCode: HttpStatus.CONFLICT,
        message: `${fields.join(', ') || 'Value'} already exists`,
        fields,
      });
  }
}
