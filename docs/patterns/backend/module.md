# NestJS 모듈 패턴

새 API 모듈 생성 시 이 가이드를 따라 4개 파일을 생성합니다.

## 파일 구조
```
apps/api/src/{entity}/
├── {entity}.module.ts
├── {entity}.controller.ts
├── {entity}.service.ts
├── dto/
│   ├── create-{entity}.dto.ts
│   ├── update-{entity}.dto.ts
│   └── index.ts
└── index.ts
```

---

## 1. 모듈 (entity.module.ts)

```typescript
import { Module } from '@nestjs/common';
import { EntityController } from './entity.controller';
import { EntityService } from './entity.service';

@Module({
  controllers: [EntityController],
  providers: [EntityService],
  exports: [EntityService],
})
export class EntityModule {}
```

**app.module.ts에 등록:**
```typescript
import { EntityModule } from './entity/entity.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    EntityModule,  // 추가
  ],
})
export class AppModule {}
```

---

## 2. 컨트롤러 (entity.controller.ts)

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EntityService } from './entity.service';
import { CreateEntityDto, UpdateEntityDto } from './dto';
import { SupabaseGuard } from '../auth/guards/supabase.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/decorators/current-user.decorator';

@Controller('entities')
export class EntityController {
  constructor(private readonly entityService: EntityService) {}

  // GET /entities?page=1&limit=10&sortBy=createdAt&order=desc
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: string,
  ) {
    return this.entityService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      sortBy: sortBy as 'createdAt' | 'title',
      order: order as 'asc' | 'desc',
    });
  }

  // GET /entities/admin (인증 필요)
  @Get('admin')
  @UseGuards(SupabaseGuard, AdminGuard)
  async findAllAdmin(@CurrentUser() user: AuthUser) {
    return this.entityService.findAllAdmin(user.id);
  }

  // GET /entities/:idOrSlug
  @Get(':idOrSlug')
  async findByIdOrSlug(@Param('idOrSlug') idOrSlug: string) {
    const id = parseInt(idOrSlug, 10);
    if (!isNaN(id)) {
      return this.entityService.findById(id);
    }
    return this.entityService.findBySlug(idOrSlug);
  }

  // POST /entities (인증 필요)
  @Post()
  @UseGuards(SupabaseGuard, AdminGuard)
  async create(
    @CurrentUser() user: AuthUser,
    @Body() createEntityDto: CreateEntityDto,
  ) {
    return this.entityService.create(user.id, createEntityDto);
  }

  // PUT /entities/:id (인증 필요)
  @Put(':id')
  @UseGuards(SupabaseGuard, AdminGuard)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() updateEntityDto: UpdateEntityDto,
  ) {
    return this.entityService.update(parseInt(id, 10), user.id, updateEntityDto);
  }

  // DELETE /entities/:id (인증 필요)
  @Delete(':id')
  @UseGuards(SupabaseGuard, AdminGuard)
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.entityService.delete(parseInt(id, 10), user.id);
  }
}
```

---

## 3. 서비스 (entity.service.ts)

```typescript
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEntityDto, UpdateEntityDto } from './dto';

@Injectable()
export class EntityService {
  constructor(private readonly prisma: PrismaService) {}

  // 목록 조회 (페이지네이션)
  async findAll(options?: {
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'title';
    order?: 'asc' | 'desc';
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = options?.sortBy || 'createdAt';
    const order = options?.order || 'desc';

    const where = { published: true };

    const [items, total] = await Promise.all([
      this.prisma.entity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: { tags: true },
      }),
      this.prisma.entity.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 관리자 목록 조회
  async findAllAdmin(authorId: string) {
    return this.prisma.entity.findMany({
      where: { authorId },
      orderBy: { createdAt: 'desc' },
      include: { tags: true },
    });
  }

  // Slug로 조회
  async findBySlug(slug: string) {
    const item = await this.prisma.entity.findUnique({
      where: { slug },
      include: { tags: true },
    });

    if (!item) {
      throw new NotFoundException('Entity not found');
    }

    return item;
  }

  // ID로 조회
  async findById(id: number) {
    const item = await this.prisma.entity.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (!item) {
      throw new NotFoundException('Entity not found');
    }

    return item;
  }

  // 생성
  async create(authorId: string, createEntityDto: CreateEntityDto) {
    const { tagIds, ...data } = createEntityDto;

    return this.prisma.entity.create({
      data: {
        ...data,
        authorId,
        tags: tagIds?.length
          ? { connect: tagIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { tags: true },
    });
  }

  // 수정
  async update(id: number, authorId: string, updateEntityDto: UpdateEntityDto) {
    const item = await this.findById(id);

    // 권한 검증
    if (item.authorId !== authorId) {
      throw new ForbiddenException('You can only edit your own items');
    }

    const { tagIds, ...data } = updateEntityDto;

    return this.prisma.entity.update({
      where: { id },
      data: {
        ...data,
        tags: tagIds
          ? { set: [], connect: tagIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { tags: true },
    });
  }

  // 삭제
  async delete(id: number, authorId: string) {
    const item = await this.findById(id);

    // 권한 검증
    if (item.authorId !== authorId) {
      throw new ForbiddenException('You can only delete your own items');
    }

    return this.prisma.entity.delete({ where: { id } });
  }
}
```

---

## 4. DTO (dto/)

### create-entity.dto.ts

```typescript
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateEntityDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];
}
```

### update-entity.dto.ts

```typescript
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class UpdateEntityDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];
}
```

### index.ts (barrel export)

```typescript
export { CreateEntityDto } from './create-entity.dto';
export { UpdateEntityDto } from './update-entity.dto';
```

---

## 5. 모듈 barrel export (index.ts)

```typescript
export { EntityModule } from './entity.module';
export { EntityService } from './entity.service';
export { EntityController } from './entity.controller';
export * from './dto';
```

---

## 관계 데이터 패턴

### 다대다 관계 연결 (생성 시)
```typescript
tags: tagIds?.length
  ? { connect: tagIds.map((id) => ({ id })) }
  : undefined,
```

### 다대다 관계 교체 (수정 시)
```typescript
tags: tagIds
  ? { set: [], connect: tagIds.map((id) => ({ id })) }
  : undefined,
```

---

## 에러 처리 패턴

```typescript
// 404 Not Found
if (!item) {
  throw new NotFoundException('Entity not found');
}

// 403 Forbidden
if (item.authorId !== authorId) {
  throw new ForbiddenException('You can only edit your own items');
}
```

---

## 로깅

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class EntityService {
  private readonly logger = new Logger(EntityService.name);

  async create(...) {
    this.logger.log(`Creating entity: ${dto.title}`);
    // ...
  }
}
```

## 트랜잭션 (관계 변경)

Prisma의 `set` 연산자를 사용하면 기존 연결 해제와 새 연결을 단일 연산으로 처리할 수 있습니다:

```typescript
// 권장: 단일 update로 처리
await this.prisma.entity.update({
  where: { id },
  data: {
    tags: { set: tagIds.map(id => ({ id })) }
  }
});
```

명시적 트랜잭션이 필요한 경우 (여러 모델 동시 수정 등):

```typescript
await this.prisma.$transaction(async (tx) => {
  await tx.entity.update({ where: { id }, data: { status: 'processing' } });
  await tx.relatedEntity.create({ data: { entityId: id, ... } });
});
```

## 체크리스트

- [ ] 모듈 생성 및 app.module.ts에 등록
- [ ] 컨트롤러에 CRUD 엔드포인트 구현
- [ ] 서비스에 비즈니스 로직 구현
- [ ] DTO에 class-validator 데코레이터 적용
- [ ] barrel export 추가 (index.ts)
- [ ] 인증이 필요한 엔드포인트에 가드 적용
- [ ] 주요 작업에 로깅 추가
