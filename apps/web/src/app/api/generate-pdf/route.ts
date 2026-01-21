import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { config } from "@/config";
import type { ResumeData, Experience } from "@/types/resume";
import resumeDataFallback from "@/data/resume.json";
import { createClient } from "@/lib/supabase/server";

async function getResumeData(): Promise<ResumeData> {
  try {
    const response = await fetch(`${config.apiBaseUrl}/resume`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("API Error");
    return response.json();
  } catch (error) {
    console.error("Failed to fetch resume data:", error);
    return resumeDataFallback as ResumeData;
  }
}

function calculateDuration(startDate: string, endDate?: string): string {
  const parseYearMonth = (dateStr: string) => {
    const [year, month] = dateStr.split(".").map(Number);
    return new Date(year, month - 1);
  };

  const start = parseYearMonth(startDate);
  const end = endDate ? parseYearMonth(endDate) : new Date();

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years === 0 && months === 0) return "1개월";
  if (years > 0 && months > 0) return `${years}년 ${months}개월`;
  if (years > 0) return `${years}년`;
  return `${months}개월`;
}

function formatPeriod(startDate: string, endDate?: string): string {
  return endDate ? `${startDate} - ${endDate}` : `${startDate} - 재직중`;
}

// XSS 방지를 위한 HTML 이스케이프 헬퍼
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

function generateResumeHtml(data: ResumeData): string {
  const { profile, skills, experience, education, certifications, awards } =
    data;

  const skillLabels: Record<string, string> = {
    languages: "Core",
    stateManagement: "상태 관리",
    libraries: "모노레포 & 라이브러리",
    tools: "개발 도구 & CI/CD",
    collaboration: "협업",
    integrations: "연동",
    infrastructure: "인프라",
    testing: "테스트",
  };

  const skillOrder = [
    "languages",
    "stateManagement",
    "libraries",
    "tools",
    "collaboration",
    "integrations",
    "infrastructure",
    "testing",
  ];

  const renderSkills = () => {
    return skillOrder
      .filter((key) => skills[key as keyof typeof skills]?.length)
      .map((key) => {
        const items = skills[key as keyof typeof skills] as string[];
        return `
          <div class="skill-row">
            <span class="skill-label">${escapeHtml(skillLabels[key])}</span>
            <div class="skill-tags">
              ${items.map((skill) => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join("")}
            </div>
          </div>
        `;
      })
      .join("");
  };

  const renderProject = (project: Experience["projects"][number]) => {
    const techStackHtml =
      project.techStack
        ?.map((tech) => {
          const techName =
            typeof tech === "string" ? tech : tech.items.join(", ");
          return `<span class="tech-tag"><span class="tech-dot"></span>${escapeHtml(techName)}</span>`;
        })
        .join("") || "";

    const tasksHtml = project.tasks
      .map(
        (task) => `
          <div class="task">
            <div class="task-title">
              <div class="task-icon"><div class="task-icon-dot"></div></div>
              <span>${escapeHtml(task.title)}</span>
            </div>
            <div class="task-list">
              ${task.items.map((item) => `<div class="task-item"><span class="task-item-dot"></span><span>${escapeHtml(item)}</span></div>`).join("")}
            </div>
          </div>
        `
      )
      .join("");

    const impactHtml = project.impact?.length
      ? `
        <div class="impact">
          <div class="impact-title">Impact</div>
          ${project.impact.map((item) => `<div class="impact-item"><span class="impact-dot"></span><span>${escapeHtml(item)}</span></div>`).join("")}
        </div>
      `
      : "";

    const linksHtml = project.links?.length
      ? `<div class="project-links">${project.links.map((link) => `<a href="${escapeHtml(link.url)}" class="link-badge">${escapeHtml(link.label)}</a>`).join("")}</div>`
      : "";

    const imagesHtml = project.images?.length
      ? `
        <div class="screenshots">
          <div class="screenshots-title">Screenshots</div>
          <div class="screenshots-grid">
            ${project.images.map((img) => `<img src="${escapeHtml(img)}" class="screenshot-img" />`).join("")}
          </div>
        </div>
      `
      : "";

    return `
      <div class="project-card">
        <div class="project-header">
          <div class="project-name">${escapeHtml(project.name)}</div>
          ${project.period ? `<div class="project-period">${escapeHtml(project.period)}</div>` : ""}
          ${linksHtml}
          <div class="project-description">${escapeHtml(project.description)}</div>
          <div class="project-role">${escapeHtml(project.role)}</div>
          ${techStackHtml ? `<div class="tech-stack">${techStackHtml}</div>` : ""}
        </div>
        ${tasksHtml}
        ${impactHtml}
        ${imagesHtml}
      </div>
    `;
  };

  const renderExperience = () => {
    return experience
      .map((exp) => {
        const duration = calculateDuration(exp.startDate, exp.endDate);
        const period = formatPeriod(exp.startDate, exp.endDate);

        const techStackHtml = exp.techStack
          .map(
            (stack) => `
              <div class="exp-tech-row">
                <span class="exp-tech-label">${escapeHtml(stack.category)}</span>
                <span class="exp-tech-items">${stack.items.map((item) => escapeHtml(item)).join(", ")}</span>
              </div>
            `
          )
          .join("");

        const projectsHtml = exp.projects.map(renderProject).join("");

        return `
          <div class="experience-card">
            <div class="company-header">
              <span class="company-name">${escapeHtml(exp.company)}</span>
              <span class="company-duration">${escapeHtml(duration)}</span>
            </div>
            <div class="company-period">${escapeHtml(period)}${exp.description ? ` · ${escapeHtml(exp.description)}` : ""}</div>
            <div class="exp-tech-stack">
              <div class="exp-tech-title">기술 스택</div>
              ${techStackHtml}
            </div>
            <div class="projects-section">
              <div class="projects-title">프로젝트</div>
              ${projectsHtml}
            </div>
          </div>
        `;
      })
      .join("");
  };

  const renderEducation = () => {
    return education
      .map(
        (edu) => `
          <div class="education-item">
            <div class="education-icon">🎓</div>
            <div class="education-content">
              <div class="education-school">${escapeHtml(edu.school)}</div>
              <div class="education-detail">${escapeHtml(edu.major)} · ${escapeHtml(edu.period)}</div>
              ${edu.description ? `<div class="education-detail">${escapeHtml(edu.description)}</div>` : ""}
            </div>
          </div>
        `
      )
      .join("");
  };

  const renderCertifications = () => {
    return certifications
      .map(
        (cert) => `
          <div class="cert-item">
            <span class="cert-icon">🏆</span>
            <div>
              <div class="cert-name">${escapeHtml(cert.name)}</div>
              <div class="cert-date">${escapeHtml(cert.date)}</div>
            </div>
          </div>
        `
      )
      .join("");
  };

  const renderAwards = () => {
    return awards
      .map(
        (award) => `
          <div class="award-item">
            <div class="award-icon">🏅</div>
            <div class="award-content">
              <div class="award-header">
                <span class="award-date">${escapeHtml(award.date)}</span>
                <span class="award-title">${escapeHtml(award.title)}</span>
                ${award.link ? `<a href="${escapeHtml(award.link)}" class="award-link">${escapeHtml(award.linkLabel || "링크")}</a>` : ""}
              </div>
              ${award.description ? `<div class="award-description">${escapeHtml(award.description)}</div>` : ""}
            </div>
          </div>
        `
      )
      .join("");
  };

  // 로컬 폰트 URL 생성
  const fontBaseUrl = config.siteUrl;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
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
    body { font-family: 'Noto Sans KR', sans-serif; background: #fff; color: #111827; line-height: 1.6; font-size: 15px; }
    .container { max-width: 100%; margin: 0 auto; padding: 8px; }
    .section { margin-bottom: 24px; }
    .section-title { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
    .section-title-bar { width: 4px; height: 22px; background: linear-gradient(to bottom, #514EF6, #706FFA); border-radius: 4px; }
    .section-title-text { font-size: 19px; font-weight: 700; color: #111827; }
    hr { border: none; border-top: 1px solid #e0f2fe; margin: 24px 0; }
    .profile { display: flex; gap: 24px; }
    .profile-content { flex: 1; }
    .profile-greeting { font-size: 37px; font-weight: 700; color: #111827; margin-bottom: 6px; }
    .profile-greeting .dot { color: #514EF6; }
    .profile-tagline { font-size: 16px; font-weight: 500; color: rgba(17, 24, 39, 0.9); margin-bottom: 12px; }
    .profile-intro { font-size: 14px; color: rgba(17, 24, 39, 0.7); line-height: 1.7; margin-bottom: 12px; white-space: pre-line; }
    .profile-contacts { display: flex; flex-direction: column; gap: 5px; font-size: 13px; color: #6b7280; }
    .profile-contact { display: flex; align-items: center; gap: 6px; }
    .profile-photo { width: 130px; height: 170px; border-radius: 8px; object-fit: cover; box-shadow: 0 10px 25px -5px rgba(81, 78, 246, 0.15); }
    .skill-row { display: flex; gap: 12px; margin-bottom: 8px; align-items: flex-start; }
    .skill-label { width: 130px; font-size: 13px; font-weight: 600; color: #111827; flex-shrink: 0; }
    .skill-tags { display: flex; flex-wrap: wrap; gap: 5px; }
    .skill-tag { background: linear-gradient(135deg, #f3f4f6, #e5e7eb); border-radius: 4px; padding: 3px 10px; font-size: 12px; color: #374151; }
    .experience-card { margin-bottom: 20px; }
    .company-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .company-name { font-size: 17px; font-weight: 700; color: #111827; }
    .company-duration { background: linear-gradient(135deg, #514EF6, #706FFA); color: white; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; box-shadow: 0 2px 8px rgba(81, 78, 246, 0.3); }
    .company-period { font-size: 13px; color: #6b7280; margin-bottom: 12px; }
    .exp-tech-stack { margin-bottom: 12px; }
    .exp-tech-title { font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 6px; }
    .exp-tech-row { display: flex; gap: 10px; font-size: 13px; margin-bottom: 3px; }
    .exp-tech-label { width: 80px; color: #6b7280; flex-shrink: 0; }
    .exp-tech-items { color: #111827; }
    .projects-title { font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 10px; }
    .project-card { border: 1px solid rgba(81, 78, 246, 0.2); border-radius: 12px; padding: 16px; margin-bottom: 12px; background: linear-gradient(to bottom right, #ffffff, #ffffff, rgba(81, 78, 246, 0.03)); box-shadow: 0 4px 15px -3px rgba(81, 78, 246, 0.08); }
    .project-header { border-bottom: 1px solid rgba(81, 78, 246, 0.1); padding-bottom: 12px; margin-bottom: 12px; }
    .project-name { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 4px; }
    .project-period { font-size: 12px; font-weight: 500; color: rgba(81, 78, 246, 0.8); margin-bottom: 8px; }
    .project-links { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
    .link-badge { border: 1px solid rgba(81, 78, 246, 0.3); background: linear-gradient(135deg, rgba(81, 78, 246, 0.1), rgba(81, 78, 246, 0.05)); color: #514EF6; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-decoration: none; }
    .project-description { font-size: 13px; color: #6b7280; line-height: 1.6; margin-bottom: 10px; }
    .project-role { display: inline-block; background: linear-gradient(to right, rgba(81, 78, 246, 0.15), rgba(81, 78, 246, 0.05)); border: 1px solid rgba(81, 78, 246, 0.2); border-radius: 6px; padding: 3px 12px; font-size: 12px; font-weight: 600; color: #111827; }
    .tech-stack { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
    .tech-tag { display: inline-flex; align-items: center; gap: 4px; border: 1px solid rgba(81, 78, 246, 0.2); border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 500; color: #374151; background: linear-gradient(to right, rgba(81, 78, 246, 0.1), rgba(81, 78, 246, 0.02)); }
    .tech-dot { width: 5px; height: 5px; border-radius: 50%; background: linear-gradient(135deg, #514EF6, #706FFA); }
    .task { margin-top: 12px; }
    .task-title { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 8px; }
    .task-icon { width: 18px; height: 18px; background: linear-gradient(135deg, #514EF6, #706FFA); border-radius: 4px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(81, 78, 246, 0.3); }
    .task-icon-dot { width: 5px; height: 5px; background: white; border-radius: 50%; }
    .task-list { margin-left: 26px; border-left: 2px solid rgba(81, 78, 246, 0.2); padding-left: 14px; }
    .task-item { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #6b7280; margin-bottom: 5px; line-height: 1.6; }
    .task-item-dot { width: 5px; height: 5px; background: linear-gradient(135deg, #514EF6, rgba(81, 78, 246, 0.4)); border-radius: 50%; margin-top: 7px; flex-shrink: 0; }
    .impact { margin-top: 12px; background: linear-gradient(to right, rgba(81, 78, 246, 0.15), rgba(81, 78, 246, 0.08), transparent); border: 1px solid rgba(81, 78, 246, 0.2); border-radius: 10px; padding: 14px; }
    .impact-title { font-size: 13px; font-weight: 700; color: #514EF6; margin-bottom: 8px; }
    .impact-item { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; font-weight: 500; color: #111827; margin-bottom: 5px; }
    .impact-dot { width: 6px; height: 6px; background: linear-gradient(135deg, #514EF6, #706FFA); border-radius: 50%; margin-top: 5px; flex-shrink: 0; box-shadow: 0 2px 4px rgba(81, 78, 246, 0.3); }
    .screenshots { margin-top: 12px; }
    .screenshots-title { font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
    .screenshots-title::before { content: ''; width: 18px; height: 18px; background: linear-gradient(135deg, #0ea5e9, #38bdf8); border-radius: 4px; box-shadow: 0 2px 6px rgba(14, 165, 233, 0.3); }
    .screenshots-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .screenshot-img { width: 100%; border-radius: 6px; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
    .education-item { display: flex; gap: 12px; margin-bottom: 12px; }
    .education-icon { width: 36px; height: 36px; background: linear-gradient(135deg, #f3f4f6, #e5e7eb); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
    .education-school { font-size: 14px; font-weight: 600; color: #111827; }
    .education-detail { font-size: 13px; color: #6b7280; margin-top: 2px; }
    .cert-container { display: flex; flex-wrap: wrap; gap: 10px; }
    .cert-item { display: flex; align-items: center; gap: 10px; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 14px; background: linear-gradient(135deg, #ffffff, #fafafa); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); }
    .cert-icon { font-size: 17px; color: #514EF6; }
    .cert-name { font-size: 13px; font-weight: 500; color: #111827; }
    .cert-date { font-size: 12px; color: #6b7280; }
    .award-item { display: flex; gap: 12px; border: 1px solid rgba(81, 78, 246, 0.2); border-radius: 6px; padding: 14px; margin-bottom: 10px; background: linear-gradient(135deg, #ffffff, rgba(81, 78, 246, 0.02)); box-shadow: 0 2px 8px rgba(81, 78, 246, 0.06); }
    .award-icon { width: 36px; height: 36px; background: linear-gradient(135deg, #f3f4f6, #e5e7eb); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
    .award-content { flex: 1; }
    .award-header { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .award-date { font-size: 12px; color: #6b7280; }
    .award-title { font-size: 14px; font-weight: 600; color: #111827; }
    .award-link { font-size: 12px; color: #514EF6; text-decoration: none; }
    .award-description { font-size: 13px; color: #6b7280; margin-top: 4px; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .task { break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="section profile">
      <div class="profile-content">
        ${profile.greeting ? `<div class="profile-greeting">${escapeHtml(profile.greeting).replace(".", '<span class="dot">.</span>')}</div>` : ""}
        ${profile.tagline ? `<div class="profile-tagline">${escapeHtml(profile.tagline)}</div>` : ""}
        ${profile.introduction ? `<div class="profile-intro">${escapeHtml(profile.introduction)}</div>` : ""}
        <div class="profile-contacts">
          ${profile.phone ? `<div class="profile-contact"><span>📞</span> ${escapeHtml(profile.phone)}</div>` : ""}
          <div class="profile-contact"><span>✉️</span> ${escapeHtml(profile.email)}</div>
          <div class="profile-contact"><span>🔗</span> ${escapeHtml(profile.github)}</div>
          <div class="profile-contact"><span>📝</span> ${escapeHtml(profile.blog)}</div>
        </div>
      </div>
      ${profile.photo ? `<img src="${escapeHtml(profile.photo)}" class="profile-photo" />` : ""}
    </div>
    <hr />
    <div class="section">
      <div class="section-title"><div class="section-title-bar"></div><div class="section-title-text">보유 기술</div></div>
      ${renderSkills()}
    </div>
    <hr />
    <div class="section">
      <div class="section-title"><div class="section-title-bar"></div><div class="section-title-text">경력</div></div>
      ${renderExperience()}
    </div>
    <hr />
    <div class="section">
      <div class="section-title"><div class="section-title-bar"></div><div class="section-title-text">학력</div></div>
      ${renderEducation()}
    </div>
    <hr />
    <div class="section">
      <div class="section-title"><div class="section-title-bar"></div><div class="section-title-text">자격증</div></div>
      <div class="cert-container">${renderCertifications()}</div>
    </div>
    <hr />
    <div class="section">
      <div class="section-title"><div class="section-title-bar"></div><div class="section-title-text">수상 및 기타</div></div>
      ${renderAwards()}
    </div>
  </div>
</body>
</html>`;
}

// 에러 메시지 안전하게 추출
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "알 수 없는 오류";
}

export async function POST() {
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

  try {
    // 인증 확인
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      );
    }

    // 서버에서 이력서 데이터 가져오기
    const data = await getResumeData();

    // 서버리스 환경에서 Chromium 실행 경로 설정
    const executablePath = await chromium.executablePath();

    browser = await puppeteer.launch({
      executablePath,
      headless: chromium.headless,
      args: [
        ...chromium.args,
        "--font-render-hinting=none",
      ],
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    // 뷰포트 설정
    await page.setViewport({
      width: 1200,
      height: 800,
      deviceScaleFactor: 2,
    });

    // HTML 생성 및 로드
    const html = generateResumeHtml(data);
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // 폰트 및 이미지 로딩 대기
    await page.evaluate(() => document.fonts.ready);
    // 페이지 로드 완료까지 대기 (setTimeout 대신 더 견고한 방식)
    await page.waitForFunction(() => document.readyState === "complete", {
      timeout: 30000,
    });

    // PDF 생성
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      timeout: 30000,
      margin: {
        top: "15mm",
        right: "15mm",
        bottom: "15mm",
        left: "15mm",
      },
      preferCSSPageSize: false,
    });

    // 파일명을 profile.name에서 동적 생성
    const filename = `이력서_${data.profile.name}.pdf`;
    const encodedFilename = encodeURIComponent(filename);

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume.pdf"; filename*=UTF-8''${encodedFilename}`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("PDF 생성 오류:", error);

    const isDev = process.env.NODE_ENV === "development";
    const errorMessage = isDev
      ? getErrorMessage(error)
      : "PDF 생성 중 오류가 발생했습니다";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    // 리소스 정리 보장
    if (browser) {
      await browser.close().catch(console.error);
    }
  }
}
