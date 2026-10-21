import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { mapPrismaError } from './prisma-exception.filter';

const prismaError = (code: string, meta?: Record<string, unknown>) =>
  new Prisma.PrismaClientKnownRequestError('prisma error', { code, clientVersion: 'test', meta });

describe('mapPrismaError', () => {
  it('maps P2002 to 409 ConflictException containing "already exists"', () => {
    const result = mapPrismaError(prismaError('P2002', { target: ['name'] }));
    expect(result).toBeInstanceOf(ConflictException);
    expect(result?.getStatus()).toBe(409);
    expect(result?.message).toContain('already exists');
  });

  it('maps P2025 to 404 NotFoundException', () => {
    const result = mapPrismaError(prismaError('P2025'));
    expect(result).toBeInstanceOf(NotFoundException);
    expect(result?.getStatus()).toBe(404);
  });

  it('maps P2003 to 400 BadRequestException', () => {
    const result = mapPrismaError(prismaError('P2003'));
    expect(result).toBeInstanceOf(BadRequestException);
    expect(result?.getStatus()).toBe(400);
  });

  it('returns null for unmapped codes', () => {
    expect(mapPrismaError(prismaError('P1001'))).toBeNull();
  });
});
