# 어드민 페이지 패턴

## 주의사항

**중요**: `/admin/*` 경로에 새 관리 페이지를 추가할 때는 반드시 **어드민 대시보드 메인 페이지**에도 해당 메뉴를 추가해야 합니다.

---

## 메뉴 추가 위치

`apps/web/src/app/admin/page.tsx`의 `menuItems` 배열에 추가:

```typescript
import { IconName } from 'lucide-react';

const menuItems = [
  // 기존 메뉴들...
  {
    href: '/admin/새경로',
    title: '메뉴 제목',
    description: '메뉴 설명',
    icon: IconName,
    color: 'text-색상-500',
    bgColor: 'bg-색상-100 dark:bg-색상-900/30',
  },
];
```

---

## 사용 가능한 색상

| 색상 | text 클래스 | bg 클래스 |
|------|-------------|-----------|
| blue | text-blue-500 | bg-blue-100 dark:bg-blue-900/30 |
| purple | text-purple-500 | bg-purple-100 dark:bg-purple-900/30 |
| green | text-green-500 | bg-green-100 dark:bg-green-900/30 |
| orange | text-orange-500 | bg-orange-100 dark:bg-orange-900/30 |
| cyan | text-cyan-500 | bg-cyan-100 dark:bg-cyan-900/30 |
| pink | text-pink-500 | bg-pink-100 dark:bg-pink-900/30 |
| gray | text-gray-500 | bg-gray-100 dark:bg-gray-700 |

---

## 어드민 페이지 기본 구조

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AdminNewPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                페이지 제목
              </h1>
            </div>
            {/* 액션 버튼들 */}
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 내용 */}
      </main>
    </div>
  );
}
```

---

## 체크리스트

- [ ] 페이지 생성 (`/admin/새경로/page.tsx`)
- [ ] **대시보드 메인에 메뉴 추가** (`/admin/page.tsx`)
- [ ] 뒤로가기 버튼 (ArrowLeft → /admin)
- [ ] 일관된 헤더 스타일
- [ ] 로딩/에러 상태 처리
