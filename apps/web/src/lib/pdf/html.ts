import type { Skills } from '@silverbeen/types';
import { SKILL_LABELS, SKILL_ORDER } from '@/constants/skills';

/** PDF HTML에서 사용하는 메인 컬러 (Tailwind primary-500) */
export const PDF_PRIMARY = '#514EF6';

/** PDF_PRIMARY의 투명도 버전 */
export function primaryAlpha(alpha: number): string {
  return `rgba(81, 78, 246, ${alpha})`;
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** XSS 방지를 위한 HTML 이스케이프 */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

/** 기술 스택을 카테고리 순서대로 skill-row HTML로 렌더링 (빈 카테고리는 생략) */
export function renderSkillsHtml(skills: Skills | undefined): string {
  if (!skills) return '';
  return SKILL_ORDER.map((key) => {
    const items = skills[key];
    if (!items || items.length === 0) return '';
    return `
          <div class="skill-row">
            <span class="skill-label">${escapeHtml(SKILL_LABELS[key])}</span>
            <div class="skill-tags">
              ${items.map((skill) => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('')}
            </div>
          </div>
        `;
  }).join('');
}

/** 섹션 제목 HTML */
export function sectionTitleHtml(title: string, extra = ''): string {
  return `<div class="section-title"><div class="section-title-bar"></div><div class="section-title-text">${escapeHtml(title)}</div>${extra}</div>`;
}

interface BaseCssOptions {
  /** 폰트 파일을 제공하는 사이트 URL */
  fontBaseUrl: string;
  /** body 기본 폰트 크기(px) */
  bodyFontSize: number;
  /** 섹션 제목 폰트 크기(px) */
  sectionTitleFontSize: number;
}

/** 폰트(@font-face)와 공통 레이아웃 CSS */
export function baseCss({
  fontBaseUrl,
  bodyFontSize,
  sectionTitleFontSize,
}: BaseCssOptions): string {
  return `
    @font-face {
      font-family: 'Noto Sans KR';
      font-weight: 400;
      font-style: normal;
      src: url('${fontBaseUrl}/fonts/NotoSansKR-Regular.ttf') format('truetype');
    }
    @font-face {
      font-family: 'Noto Sans KR';
      font-weight: 700;
      font-style: normal;
      src: url('${fontBaseUrl}/fonts/NotoSansKR-Bold.ttf') format('truetype');
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Noto Sans KR', sans-serif; background: #fff; color: #111827; line-height: 1.6; font-size: ${bodyFontSize}px; }
    .container { max-width: 100%; margin: 0 auto; padding: 8px; }
    .section { margin-bottom: 24px; }
    .section-title { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
    .section-title-bar { width: 4px; height: 22px; background: ${PDF_PRIMARY}; border-radius: 4px; }
    .section-title-text { font-size: ${sectionTitleFontSize}px; font-weight: 700; color: #111827; }
    hr { border: none; border-top: 1px solid #e0f2fe; margin: 24px 0; }`;
}

/** 완성된 HTML 문서로 감싸기 */
export function htmlDocument(css: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${css}
  </style>
</head>
<body>
  <div class="container">${body}
  </div>
</body>
</html>`;
}
