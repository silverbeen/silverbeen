import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/** 싱글톤 JSON 레코드의 고정 ID */
export const SINGLETON_ID = 'main';

type ContentRecord = { content: Prisma.JsonValue };

/**
 * id + content(JSON) 구조의 Prisma 모델 delegate (Resume, Portfolio)
 */
export interface SingletonContentDelegate {
  findUnique(args: {
    where: { id: string };
    select: { content: true };
  }): PromiseLike<ContentRecord | null>;
  upsert(args: {
    where: { id: string };
    update: { content: Prisma.InputJsonValue };
    create: { id: string; content: Prisma.InputJsonValue };
    select: { content: true };
  }): PromiseLike<ContentRecord>;
}

/**
 * 단일 레코드(id = 'main')에 JSON content를 저장하는 모델용 공통 저장소
 * GET/PUT 모두 content만 반환
 */
export class SingletonContentStore {
  constructor(
    private readonly delegate: SingletonContentDelegate,
    private readonly entityName: string,
  ) {}

  async get(): Promise<Prisma.JsonValue> {
    const record = await this.delegate.findUnique({
      where: { id: SINGLETON_ID },
      select: { content: true },
    });

    if (!record) {
      throw new NotFoundException(`${this.entityName} not found`);
    }

    return record.content;
  }

  async update(content: Prisma.InputJsonObject): Promise<Prisma.JsonValue> {
    const record = await this.delegate.upsert({
      where: { id: SINGLETON_ID },
      update: { content },
      create: { id: SINGLETON_ID, content },
      select: { content: true },
    });

    return record.content;
  }
}
