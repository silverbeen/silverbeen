import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  HttpException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';

/**
 * Prisma 에러 코드를 HTTP 예외로 변환 (매핑되지 않는 코드는 null)
 */
export function mapPrismaError(err: Prisma.PrismaClientKnownRequestError): HttpException | null {
  switch (err.code) {
    case 'P2002': {
      const target = err.meta?.target;
      const fields = Array.isArray(target) ? target.join(', ') : target;
      return new ConflictException(
        typeof fields === 'string' && fields
          ? `Resource with this ${fields} already exists`
          : 'Resource already exists',
      );
    }
    case 'P2025':
      return new NotFoundException('Resource not found');
    case 'P2003':
      return new BadRequestException('Related resource does not exist');
    default:
      return null;
  }
}

/**
 * 전역 Prisma 예외 필터
 * - P2002 → 409, P2025 → 404, P2003 → 400
 * - 그 외 Prisma 에러는 기본 처리(500)
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const httpException = mapPrismaError(exception);

    if (!httpException) {
      return super.catch(exception, host);
    }

    this.logger.warn(`Prisma ${exception.code} → ${httpException.getStatus()}`);
    return super.catch(httpException, host);
  }
}
