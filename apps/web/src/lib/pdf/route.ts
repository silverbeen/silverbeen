import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { createClient } from '@/lib/supabase/server';
import { buildContentDisposition } from './filename';

const PAGE_TIMEOUT_MS = 30000;

interface PdfRouteOptions<T> {
  /** PDF에 렌더링할 데이터 조회 (실패 시 폴백 데이터를 반환하도록 구현) */
  getData: () => Promise<T>;
  /** 데이터를 HTML 문서로 변환 */
  buildHtml: (data: T) => string;
  /** A4 페이지 여백 (예: '15mm') */
  margin: string;
  /** 다운로드 파일명 (UTF-8) */
  getFilename: (data: T) => string;
  /** 비ASCII 파일명을 지원하지 않는 클라이언트용 파일명 */
  asciiFilename: string;
}

// 에러 메시지 안전하게 추출
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return '알 수 없는 오류';
}

// 로컬 개발 환경에서 Chrome 경로 찾기
async function getLocalChromePath(): Promise<string | null> {
  const paths = [
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    // Linux
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    // Windows
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];

  const fs = await import('fs');
  return paths.find((p) => fs.existsSync(p)) ?? null;
}

// 환경에 따라 Chromium 실행 설정 분기
async function getLaunchConfig(): Promise<{ executablePath: string; args: string[] } | null> {
  if (process.env.VERCEL === '1') {
    // Vercel 환경: @sparticuz/chromium 사용
    return {
      executablePath: await chromium.executablePath(),
      args: [...chromium.args, '--font-render-hinting=none'],
    };
  }

  // 로컬 개발: 시스템 Chrome 사용
  const localPath = await getLocalChromePath();
  if (!localPath) return null;
  return {
    executablePath: localPath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--font-render-hinting=none',
    ],
  };
}

async function isAuthenticated(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user !== null;
}

/**
 * 로그인 사용자만 호출 가능한 PDF 생성 POST 핸들러.
 * 데이터 조회 → HTML 생성 → headless Chrome으로 A4 PDF 렌더링 → 첨부 파일 응답
 */
export function createPdfRouteHandler<T>({
  getData,
  buildHtml,
  margin,
  getFilename,
  asciiFilename,
}: PdfRouteOptions<T>) {
  return async function POST() {
    let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

    try {
      // 인증 확인 (Supabase 환경변수 누락 시 createClient가 throw → 500)
      if (!(await isAuthenticated())) {
        return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
      }

      const data = await getData();

      const launchConfig = await getLaunchConfig();
      if (!launchConfig) {
        return NextResponse.json(
          { error: '로컬에 Chrome이 설치되어 있지 않습니다. Chrome을 설치해주세요.' },
          { status: 500 },
        );
      }

      browser = await puppeteer.launch({ ...launchConfig, headless: true });

      const page = await browser.newPage();
      page.setDefaultTimeout(PAGE_TIMEOUT_MS);
      page.setDefaultNavigationTimeout(PAGE_TIMEOUT_MS);
      await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });

      await page.setContent(buildHtml(data), {
        waitUntil: 'networkidle0',
        timeout: PAGE_TIMEOUT_MS,
      });

      // 폰트 및 이미지 로딩 대기
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => document.readyState === 'complete', {
        timeout: PAGE_TIMEOUT_MS,
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        timeout: PAGE_TIMEOUT_MS,
        margin: { top: margin, right: margin, bottom: margin, left: margin },
        preferCSSPageSize: false,
      });

      return new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': buildContentDisposition(asciiFilename, getFilename(data)),
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });
    } catch (error) {
      console.error('PDF 생성 오류:', error);

      const errorMessage =
        process.env.NODE_ENV === 'development'
          ? getErrorMessage(error)
          : 'PDF 생성 중 오류가 발생했습니다';

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    } finally {
      // 리소스 정리 보장
      if (browser) {
        await browser.close().catch(console.error);
      }
    }
  };
}

/** promise가 ms 안에 끝나지 않으면 reject */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/** 파일명에 쓸 프로필 이름 (빈 값이면 'unknown') */
export function profileFilenamePart(name: string | undefined): string {
  return name?.trim() || 'unknown';
}
