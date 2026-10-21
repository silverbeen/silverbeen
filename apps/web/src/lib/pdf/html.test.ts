import { describe, expect, it } from 'vitest';
import type { Skills } from '@silverbeen/types';
import { baseCss, escapeHtml, primaryAlpha, renderSkillsHtml, sectionTitleHtml } from './html';

const emptySkills: Skills = {
  languages: [],
  stateManagement: [],
  libraries: [],
  tools: [],
  collaboration: [],
  integrations: [],
};

describe('escapeHtml', () => {
  it('HTML 특수문자를 이스케이프한다', () => {
    expect(escapeHtml(`<a href="x">Tom & 'Jerry'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;',
    );
  });

  it('특수문자가 없으면 그대로 반환한다', () => {
    expect(escapeHtml('이력서 2024')).toBe('이력서 2024');
  });
});

describe('renderSkillsHtml', () => {
  it('skills가 없으면 빈 문자열', () => {
    expect(renderSkillsHtml(undefined)).toBe('');
  });

  it('빈 카테고리는 생략하고 정해진 순서와 라벨로 렌더링한다', () => {
    const html = renderSkillsHtml({
      ...emptySkills,
      tools: ['Git'],
      languages: ['TypeScript', 'React'],
    });

    expect(html.match(/class="skill-row"/g)).toHaveLength(2);
    expect(html.indexOf('Core')).toBeLessThan(html.indexOf('개발 도구 &amp; CI/CD'));
    expect(html).toContain('<span class="skill-tag">TypeScript</span>');
    expect(html).not.toContain('상태 관리');
  });

  it('스킬 이름을 이스케이프한다', () => {
    const html = renderSkillsHtml({ ...emptySkills, testing: ['<script>'] });
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });
});

describe('sectionTitleHtml', () => {
  it('제목을 이스케이프하고 추가 HTML을 붙인다', () => {
    const html = sectionTitleHtml('수상 & 기타', '<span>x</span>');
    expect(html).toContain('<div class="section-title-text">수상 &amp; 기타</div><span>x</span>');
  });
});

describe('baseCss', () => {
  it('폰트 URL과 폰트 크기를 반영한다', () => {
    const css = baseCss({
      fontBaseUrl: 'https://example.com',
      bodyFontSize: 15,
      sectionTitleFontSize: 19,
    });
    expect(css).toContain("url('https://example.com/fonts/NotoSansKR-Regular.ttf')");
    expect(css).toContain('font-size: 15px;');
    expect(css).toContain('.section-title-text { font-size: 19px;');
  });
});

describe('primaryAlpha', () => {
  it('메인 컬러의 rgba 문자열을 만든다', () => {
    expect(primaryAlpha(0.2)).toBe('rgba(81, 78, 246, 0.2)');
  });
});
