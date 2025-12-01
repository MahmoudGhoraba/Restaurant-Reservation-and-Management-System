import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * CatchAsync Interceptor
 * Automatically catches and forwards async errors to the global exception filter
 * This is the NestJS equivalent of the Express catchAsync utility
 */
@Injectable()
export class CatchAsyncInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Forward error to exception filter
        throw error;
      })
    );
  }
}
