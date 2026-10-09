import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

/**
 * Maps every thrown exception to the same ApiError shape the frontend's
 * `types/index.ts` already declares ({ code, message, fieldErrors?, requestId }),
 * instead of Nest's default { statusCode, message, error } shape.
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const message =
      exception instanceof HttpException
        ? (() => {
            const r = exception.getResponse();
            return typeof r === 'string' ? r : (r as any).message || exception.message;
          })()
        : 'Unexpected server error.';
    const code =
      exception instanceof HttpException
        ? exception.constructor.name.replace('Exception', '').toUpperCase()
        : 'INTERNAL_ERROR';

    res.status(status).json({
      code,
      message: Array.isArray(message) ? message.join(' ') : message,
      requestId: `req_${Math.random().toString(36).slice(2, 10)}`,
    });
  }
}
