export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',

  // SEO 관련 설정
  siteName: 'Silverbeen',
  siteDescription: '개발 관련 글과 경험을 공유하는 기술 블로그',
  locale: 'ko_KR',

  // 저자 정보 (JSON-LD용)
  author: {
    name: '강은빈',
    email: 'kub9722@gmail.com',
    url: 'https://github.com/silverbeen',
  },

  // 기본 OG 이미지 (커버 이미지 없을 경우 대체용)
  defaultOgImage: '/og-default.png',
} as const;
