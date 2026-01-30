# 페이지 생성 패턴

## 파일 위치
```
apps/web/src/app/{route}/page.tsx           # 페이지
apps/web/src/app/{route}/loading.tsx        # 로딩 UI
apps/web/src/app/{route}/error.tsx          # 에러 UI
apps/web/src/app/{route}/not-found.tsx      # 404 UI
apps/web/src/app/{route}/layout.tsx         # 레이아웃 (선택)
```

## 동적 라우트
```
apps/web/src/app/blog/[id]/page.tsx         # /blog/123
apps/web/src/app/blog/[slug]/page.tsx       # /blog/my-post
```

## 관련 문서

| 상황 | 참조 파일 |
|------|----------|
| Server/Client 컴포넌트 페이지 | [page-component.md](./page-component.md) |
| 스켈레톤 UI | [page-skeleton.md](./page-skeleton.md) |
| 에러/로딩 처리 | [page-error.md](./page-error.md) |
| 어드민 페이지 | [page-admin.md](./page-admin.md) |

---

## 체크리스트

- [ ] Server vs Client Component 결정
- [ ] generateMetadata로 SEO 처리
- [ ] Suspense + 스켈레톤 적용
- [ ] loading.tsx 추가
- [ ] error.tsx 추가 (필요시)
- [ ] not-found.tsx 추가 (동적 라우트)
- [ ] 반응형 레이아웃
- [ ] **어드민 페이지인 경우: 대시보드 메인에 메뉴 추가**
