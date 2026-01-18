# Prisma 스키마 패턴

## 파일 위치
```
apps/api/prisma/schema.prisma
```

---

## 기본 모델 템플릿

```prisma
model Entity {
  // 1. 식별자
  id        Int      @id @default(autoincrement())  // 숫자 ID
  // 또는
  id        String   @id @default(uuid())           // UUID

  // 2. 작성자 (Supabase Auth)
  authorId  String   @map("author_id")

  // 3. 비즈니스 데이터
  title     String
  slug      String   @unique
  content   String

  // 4. 선택적 필드
  excerpt   String?
  coverImage String? @map("cover_image")

  // 5. 상태/메타
  published Boolean  @default(false)
  viewCount Int      @default(0) @map("view_count")

  // 6. 관계
  tags      Tag[]

  // 7. 타임스탬프
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // 8. 인덱스
  @@index([authorId])
  @@index([slug])
  @@index([published])

  // 9. 테이블 이름 (snake_case 복수형)
  @@map("entities")
}
```

---

## 네이밍 규칙

| 구분 | TypeScript | DB 컬럼 |
|------|-----------|---------|
| 필드명 | camelCase | snake_case (@map) |
| 테이블명 | PascalCase | snake_case (@@map) |

```prisma
model Post {
  authorId  String   @map("author_id")    // camelCase -> snake_case
  coverImage String? @map("cover_image")
  viewCount Int      @map("view_count")
  createdAt DateTime @map("created_at")
  updatedAt DateTime @map("updated_at")

  @@map("posts")  // 테이블명
}
```

---

## 관계 패턴

### 다대다 관계 (암묵적 조인 테이블)

```prisma
model Post {
  id    Int    @id @default(autoincrement())
  tags  Tag[]  // 다대다

  @@map("posts")
}

model Tag {
  id    String @id @default(uuid())
  name  String @unique
  posts Post[] // 역참조

  @@map("tags")
}
```

Prisma가 자동으로 `_PostToTag` 조인 테이블 생성.

### 일대다 관계

```prisma
model User {
  id    String @id @default(uuid())
  posts Post[] // 일대다

  @@map("users")
}

model Post {
  id       Int    @id @default(autoincrement())
  author   User   @relation(fields: [authorId], references: [id])
  authorId String @map("author_id")

  @@map("posts")
}
```

---

## 열거형 (Enum)

```prisma
enum Role {
  USER
  ADMIN
}

model User {
  id   String @id @default(uuid())
  role Role   @default(USER)

  @@map("users")
}
```

---

## JSON 필드

복잡한 구조의 데이터 저장 시 사용.

```prisma
model Resume {
  id      String @id @default("main")
  content Json   // 복잡한 객체

  @@map("resumes")
}
```

---

## 인덱스

자주 조회되는 필드에 인덱스 추가.

```prisma
model Post {
  // 필드들...

  @@index([authorId])   // 작성자별 조회
  @@index([slug])       // slug로 조회
  @@index([published])  // 발행 상태 필터
  @@index([createdAt])  // 정렬용

  @@map("posts")
}
```

### 복합 인덱스

```prisma
@@index([published, createdAt])  // 발행된 글을 날짜순 조회
```

---

## 실제 예시 (Post 모델)

```prisma
model Post {
  id         Int      @id @default(autoincrement())
  authorId   String   @map("author_id")
  title      String
  slug       String   @unique
  content    String
  excerpt    String?
  coverImage String?  @map("cover_image")
  published  Boolean  @default(false)
  viewCount  Int      @default(0) @map("view_count")
  tags       Tag[]
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@index([authorId])
  @@index([slug])
  @@index([published])
  @@map("posts")
}
```

---

## 스키마 변경 후 명령어

```bash
# 개발 환경에서 스키마 푸시
pnpm db:push

# 마이그레이션 생성 (프로덕션)
npx prisma migrate dev --name add_entity

# Prisma Studio 실행
pnpm db:studio

# 클라이언트 재생성
npx prisma generate
```

---

## 체크리스트

- [ ] 모델명 PascalCase, 테이블명 snake_case
- [ ] 필드명 camelCase, 컬럼명 snake_case (@map)
- [ ] createdAt, updatedAt 타임스탬프 추가
- [ ] 필요한 인덱스 추가
- [ ] 관계 정의 (양방향)
- [ ] pnpm db:push로 스키마 적용
