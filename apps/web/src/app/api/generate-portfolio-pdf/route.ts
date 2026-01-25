import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { config } from "@/config";
import type { PortfolioData, PortfolioProject } from "@/types/portfolio";
import portfolioDataFallback from "@/data/portfolio.json";
import { createClient } from "@/lib/supabase/server";

async function getPortfolioData(): Promise<PortfolioData> {
  // TODO: API에서 가져오도록 복원 필요
  return portfolioDataFallback as PortfolioData;
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

const categoryLabels: Record<string, string> = {
  personal: "개인",
  team: "팀",
  club: "동아리",
};

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

function generatePortfolioHtml(data: PortfolioData): string {
  const { profile, skills, education, projects, clubs, awards, certifications, activities } = data;

  // hidden 또는 pdfHidden이 아닌 프로젝트만 필터링
  const visibleProjects = projects.filter((p) => !p.hidden && !p.pdfHidden);

  const renderSkills = () => {
    if (!skills) return "";
    return skillOrder
      .filter((key) => {
        const items = skills[key as keyof typeof skills];
        return items && items.length > 0;
      })
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

  const renderEducation = () => {
    if (!education || education.length === 0) return "";
    return `
      <div class="section">
        <div class="section-title"><div class="section-title-bar"></div><div class="section-title-text">학력</div></div>
        <div class="education-list">
          ${education
            .map(
              (edu) => `
            <div class="education-item">
              <div class="education-icon">E</div>
              <div class="education-content">
                <div class="education-school">${escapeHtml(edu.school)}</div>
                <div class="education-major">${escapeHtml(edu.major)}</div>
                <div class="education-period">${escapeHtml(edu.period)}</div>
                ${edu.description ? `<div class="education-description">${escapeHtml(edu.description)}</div>` : ""}
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
      <hr />
    `;
  };

  const renderProject = (project: PortfolioProject) => {
    const techStackHtml = project.techStack
      .map(
        (tech) =>
          `<span class="tech-tag"><span class="tech-dot"></span>${escapeHtml(tech)}</span>`
      )
      .join("");

    const tasksHtml = project.tasks
      .map(
        (task) =>
          `<div class="task-item"><span class="task-dot"></span><span>${escapeHtml(task)}</span></div>`
      )
      .join("");

    const impactHtml =
      project.impact && project.impact.length > 0
        ? `
        <div class="impact">
          <div class="impact-title">성과</div>
          ${project.impact.map((item) => `<div class="impact-item"><span class="impact-dot"></span><span>${escapeHtml(item)}</span></div>`).join("")}
        </div>
      `
        : "";

    const growthHtml =
      project.growthExperience && project.growthExperience.length > 0
        ? `
        <div class="growth">
          <div class="growth-title">성장 경험</div>
          ${project.growthExperience
            .map(
              (exp) => `
            <div class="growth-item">
              <div class="growth-item-title">${escapeHtml(exp.title)}</div>
              <div class="growth-item-content">${escapeHtml(exp.content)}</div>
            </div>
          `
            )
            .join("")}
        </div>
      `
        : "";

    const linksHtml =
      project.links && project.links.length > 0
        ? `<div class="project-links">${project.links.map((link) => `<a href="${escapeHtml(link.url)}" class="link-badge">${escapeHtml(link.label)}</a>`).join("")}</div>`
        : "";

    const imagesHtml =
      project.images && project.images.length > 0
        ? `
        <div class="screenshots">
          <div class="screenshots-title">스크린샷</div>
          <div class="screenshots-grid">
            ${project.images.map((img) => `<img src="${escapeHtml(img)}" class="screenshot-img" />`).join("")}
          </div>
        </div>
      `
        : "";

    return `
      <div class="project-card">
        <div class="project-header">
          <div class="project-meta">
            <span class="project-category">${escapeHtml(categoryLabels[project.category] || project.category)}</span>
            ${project.clubName ? `<span class="project-club">@ ${escapeHtml(project.clubName)}</span>` : ""}
          </div>
          <div class="project-name">${escapeHtml(project.name)}</div>
          <div class="project-info">
            <span class="project-period">개발기간: ${escapeHtml(project.period)}</span>
            <span class="project-role">${escapeHtml(project.role)}</span>
            ${project.teamSize ? `<span class="project-team">${project.teamSize}명</span>` : ""}
          </div>
          ${linksHtml}
          <div class="project-description">${escapeHtml(project.description)}</div>
          ${techStackHtml ? `<div class="tech-stack">${techStackHtml}</div>` : ""}
        </div>
        <div class="project-tasks">
          <div class="tasks-title">담당 업무</div>
          ${tasksHtml}
        </div>
        ${impactHtml}
        ${growthHtml}
        ${imagesHtml}
      </div>
    `;
  };

  const renderClubs = () => {
    if (!clubs || clubs.length === 0) return "";
    return `
      <div class="section">
        <div class="section-title"><div class="section-title-bar"></div><div class="section-title-text">동아리</div></div>
        ${clubs
          .map(
            (club) => `
          <div class="club-card">
            <div class="club-header">
              <span class="club-name">${escapeHtml(club.name)}</span>
              <span class="club-role">${escapeHtml(club.role)}</span>
            </div>
            <div class="club-period">${escapeHtml(club.period)}</div>
            <div class="club-description">${escapeHtml(club.description)}</div>
            ${
              club.activities && club.activities.length > 0
                ? `<div class="club-activities">${club.activities.map((a) => `<span class="activity-tag">${escapeHtml(a)}</span>`).join("")}</div>`
                : ""
            }
          </div>
        `
          )
          .join("")}
      </div>
      <hr />
    `;
  };

  const renderAwards = () => {
    if (!awards || awards.length === 0) return "";
    return `
      <div class="section">
        <div class="section-title"><div class="section-title-bar"></div><div class="section-title-text">수상</div></div>
        <div class="awards-grid">
          ${awards
            .map(
              (award) => `
            <div class="award-item">
              <div class="award-icon">A</div>
              <div class="award-content">
                <div class="award-name">${escapeHtml(award.name)}</div>
                <div class="award-prize">${escapeHtml(award.prize)}</div>
                <div class="award-date">${escapeHtml(award.date)}</div>
                ${award.description ? `<div class="award-description">${escapeHtml(award.description)}</div>` : ""}
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
      <hr />
    `;
  };

  const renderCertifications = () => {
    if (!certifications || certifications.length === 0) return "";
    return `
      <div class="section">
        <div class="section-title"><div class="section-title-bar"></div><div class="section-title-text">자격증</div></div>
        <div class="cert-container">
          ${certifications
            .map(
              (cert) => `
            <div class="cert-item">
              <span class="cert-icon">C</span>
              <div>
                <div class="cert-name">${escapeHtml(cert.name)}</div>
                <div class="cert-date">${escapeHtml(cert.date)}</div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
      <hr />
    `;
  };

  const renderActivities = () => {
    if (!activities || activities.length === 0) return "";
    return `
      <div class="section">
        <div class="section-title"><div class="section-title-bar"></div><div class="section-title-text">활동</div></div>
        ${activities
          .map(
            (activity) => `
          <div class="activity-item">
            <span class="activity-date">${escapeHtml(activity.date)}</span>
            <span class="activity-title">${escapeHtml(activity.title)}</span>
            ${activity.description ? `<span class="activity-desc">${escapeHtml(activity.description)}</span>` : ""}
          </div>
        `
          )
          .join("")}
      </div>
    `;
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
    body { font-family: 'Noto Sans KR', sans-serif; background: #fff; color: #111827; line-height: 1.6; font-size: 14px; }
    .container { max-width: 100%; margin: 0 auto; padding: 8px; }
    .section { margin-bottom: 24px; }
    .section-title { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
    .section-title-bar { width: 4px; height: 22px; background: linear-gradient(to bottom, #514EF6, #706FFA); border-radius: 4px; }
    .section-title-text { font-size: 18px; font-weight: 700; color: #111827; }
    hr { border: none; border-top: 1px solid #e0f2fe; margin: 24px 0; }

    /* Skills */
    .skill-row { display: flex; gap: 12px; margin-bottom: 8px; align-items: flex-start; }
    .skill-label { width: 130px; font-size: 12px; font-weight: 600; color: #111827; flex-shrink: 0; }
    .skill-tags { display: flex; flex-wrap: wrap; gap: 5px; }
    .skill-tag { border: 1px solid rgba(81, 78, 246, 0.2); background: rgba(81, 78, 246, 0.05); border-radius: 6px; padding: 3px 10px; font-size: 11px; color: #374151; }

    /* Profile */
    .profile { display: flex; gap: 20px; margin-bottom: 16px; align-items: flex-start; }
    .profile-photo { width: 110px; height: 110px; border-radius: 20px; object-fit: cover; flex-shrink: 0; }
    .profile-content { flex: 1; }
    .profile-header { margin-bottom: 8px; }
    .profile-name { font-size: 28px; font-weight: 700; color: #111827; margin-bottom: 2px; }
    .profile-title { font-size: 14px; font-weight: 500; color: rgba(81, 78, 246, 0.9); margin-bottom: 6px; }
    .profile-tagline { font-size: 13px; color: rgba(17, 24, 39, 0.7); line-height: 1.6; margin-bottom: 10px; }
    .profile-contacts { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
    .contact-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #6b7280; }
    .contact-icon { width: 18px; height: 18px; background: linear-gradient(135deg, #514EF6, #706FFA); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: 700; flex-shrink: 0; }
    .profile-intro-box { background: linear-gradient(135deg, #f8fafc, #f1f5f9); border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-top: 12px; }
    .profile-intro { font-size: 13px; color: rgba(17, 24, 39, 0.75); line-height: 1.8; white-space: pre-line; }

    /* Projects */
    .projects-grid { display: flex; flex-direction: column; gap: 16px; }
    .project-card { padding: 16px; page-break-inside: avoid; }
    .project-header { padding-bottom: 12px; margin-bottom: 12px; }
    .project-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .project-category { background: linear-gradient(135deg, #514EF6, #706FFA); color: white; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; }
    .project-club { font-size: 12px; color: #6b7280; }
    .project-name { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 6px; }
    .project-info { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; font-size: 12px; color: #6b7280; margin-bottom: 8px; }
    .project-period { font-weight: 500; color: rgba(81, 78, 246, 0.8); }
    .project-role { font-weight: 600; color: #111827; }
    .project-team { display: flex; align-items: center; gap: 4px; }
    .project-links { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
    .link-badge { border: 1px solid rgba(81, 78, 246, 0.3); background: linear-gradient(135deg, rgba(81, 78, 246, 0.1), rgba(81, 78, 246, 0.05)); color: #514EF6; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-decoration: none; }
    .project-description { font-size: 12px; color: #6b7280; line-height: 1.6; margin-bottom: 10px; }
    .tech-stack { display: flex; flex-wrap: wrap; gap: 4px; }
    .tech-tag { display: inline-flex; align-items: center; gap: 4px; border: 1px solid rgba(81, 78, 246, 0.2); border-radius: 12px; padding: 2px 8px; font-size: 10px; font-weight: 500; color: #374151; background: linear-gradient(to right, rgba(81, 78, 246, 0.1), rgba(81, 78, 246, 0.02)); }
    .tech-dot { width: 4px; height: 4px; border-radius: 50%; background: linear-gradient(135deg, #514EF6, #706FFA); }

    /* Tasks */
    .project-tasks { margin-top: 12px; }
    .tasks-title { font-size: 12px; font-weight: 700; color: #111827; margin-bottom: 8px; }
    .task-item { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: #6b7280; margin-bottom: 4px; line-height: 1.5; }
    .task-dot { width: 4px; height: 4px; background: linear-gradient(135deg, #514EF6, rgba(81, 78, 246, 0.4)); border-radius: 50%; margin-top: 6px; flex-shrink: 0; }

    /* Impact */
    .impact { margin-top: 12px; background: linear-gradient(to right, rgba(81, 78, 246, 0.12), rgba(81, 78, 246, 0.06), transparent); border: 1px solid rgba(81, 78, 246, 0.2); border-radius: 8px; padding: 12px; }
    .impact-title { font-size: 12px; font-weight: 700; color: #514EF6; margin-bottom: 6px; }
    .impact-item { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 4px; }
    .impact-dot { width: 5px; height: 5px; background: linear-gradient(135deg, #514EF6, #706FFA); border-radius: 50%; margin-top: 5px; flex-shrink: 0; }

    /* Growth */
    .growth { margin-top: 12px; }
    .growth-title { font-size: 12px; font-weight: 700; color: #d97706; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
    .growth-title::before { content: ''; width: 14px; height: 14px; background: linear-gradient(135deg, #f59e0b, #fbbf24); border-radius: 50%; flex-shrink: 0; }
    .growth-item { background: linear-gradient(to right, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.05), transparent); border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 8px; padding: 10px; margin-bottom: 8px; }
    .growth-item-title { font-size: 12px; font-weight: 600; color: #b45309; margin-bottom: 4px; }
    .growth-item-content { font-size: 11px; color: #6b7280; line-height: 1.6; }

    /* Screenshots */
    .screenshots { margin-top: 12px; }
    .screenshots-title { font-size: 12px; font-weight: 700; color: #111827; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
    .screenshots-title::before { content: ''; width: 14px; height: 14px; background: linear-gradient(135deg, #0ea5e9, #38bdf8); border-radius: 4px; flex-shrink: 0; }
    .screenshots-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .screenshot-img { width: 100%; border-radius: 6px; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }

    /* Clubs */
    .club-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 10px; }
    .club-header { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
    .club-name { font-size: 14px; font-weight: 700; color: #111827; }
    .club-role { font-size: 12px; color: #514EF6; font-weight: 500; }
    .club-period { font-size: 11px; color: #6b7280; margin-bottom: 6px; }
    .club-description { font-size: 12px; color: #6b7280; line-height: 1.5; margin-bottom: 6px; }
    .club-activities { display: flex; flex-wrap: wrap; gap: 4px; }
    .activity-tag { background: #f3f4f6; border-radius: 4px; padding: 2px 8px; font-size: 10px; color: #374151; }

    /* Education */
    .education-list { display: flex; flex-direction: column; gap: 10px; }
    .education-item { display: flex; gap: 12px; align-items: flex-start; }
    .education-icon { width: 32px; height: 32px; background: linear-gradient(135deg, #514EF6, #706FFA); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 700; flex-shrink: 0; }
    .education-content { flex: 1; }
    .education-school { font-size: 14px; font-weight: 600; color: #111827; }
    .education-major { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .education-period { font-size: 11px; color: #514EF6; font-weight: 500; margin-top: 2px; }
    .education-description { font-size: 11px; color: #6b7280; margin-top: 4px; }

    /* Awards */
    .awards-grid { display: flex; flex-direction: column; gap: 8px; }
    .award-item { display: flex; gap: 10px; border: 1px solid rgba(81, 78, 246, 0.2); border-radius: 8px; padding: 10px; }
    .award-icon { width: 28px; height: 28px; background: linear-gradient(135deg, #514EF6, #706FFA); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 700; flex-shrink: 0; }
    .award-name { font-size: 13px; font-weight: 600; color: #111827; }
    .award-prize { font-size: 12px; font-weight: 500; color: #514EF6; }
    .award-date { font-size: 11px; color: #6b7280; }
    .award-description { font-size: 11px; color: #6b7280; margin-top: 4px; }

    /* Certifications */
    .cert-container { display: flex; flex-wrap: wrap; gap: 8px; }
    .cert-item { display: flex; align-items: center; gap: 8px; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 12px; }
    .cert-icon { width: 20px; height: 20px; background: linear-gradient(135deg, #514EF6, #706FFA); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: 700; flex-shrink: 0; }
    .cert-name { font-size: 12px; font-weight: 500; color: #111827; }
    .cert-date { font-size: 11px; color: #6b7280; }

    /* Activities */
    .activity-item { display: flex; align-items: baseline; gap: 10px; margin-bottom: 6px; font-size: 12px; }
    .activity-date { color: #6b7280; flex-shrink: 0; width: 70px; }
    .activity-title { font-weight: 500; color: #111827; }
    .activity-desc { color: #6b7280; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .project-card { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="profile">
      ${profile.photo ? `<img src="${escapeHtml(profile.photo)}" class="profile-photo" />` : ""}
      <div class="profile-content">
        <div class="profile-header">
          <div class="profile-name">${escapeHtml(profile.name || "")}</div>
          ${profile.title ? `<div class="profile-title">${escapeHtml(profile.title)}</div>` : ""}
        </div>
        ${profile.tagline ? `<div class="profile-tagline">${escapeHtml(profile.tagline)}</div>` : ""}
        <div class="profile-contacts">
          ${profile.email ? `<div class="contact-item"><span class="contact-icon">@</span> ${escapeHtml(profile.email)}</div>` : ""}
          ${profile.github ? `<div class="contact-item"><span class="contact-icon">G</span> ${escapeHtml(profile.github)}</div>` : ""}
          ${profile.blog ? `<div class="contact-item"><span class="contact-icon">B</span> ${escapeHtml(profile.blog)}</div>` : ""}
        </div>
      </div>
    </div>
    ${profile.introduction ? `<div class="profile-intro-box"><div class="profile-intro">${escapeHtml(profile.introduction)}</div></div>` : ""}

    ${skills ? `
    <hr />
    <div class="section">
      <div class="section-title"><div class="section-title-bar"></div><div class="section-title-text">보유 기술</div></div>
      ${renderSkills()}
    </div>
    ` : ""}
    <hr />

    <div class="section">
      <div class="section-title"><div class="section-title-bar"></div><div class="section-title-text">프로젝트</div></div>
      <div class="projects-grid">
        ${visibleProjects.map(renderProject).join("")}
      </div>
    </div>
    <hr />

    ${renderAwards()}
    ${renderClubs()}
    ${renderActivities()}
    ${renderEducation()}
    ${renderCertifications()}
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

// 로컬 개발 환경에서 Chrome 경로 찾기
async function getLocalChromePath(): Promise<string | null> {
  const paths = [
    // macOS
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    // Linux
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    // Windows
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ];

  for (const p of paths) {
    try {
      const fs = await import("fs");
      if (fs.existsSync(p)) {
        return p;
      }
    } catch {
      continue;
    }
  }
  return null;
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

    // 포트폴리오 데이터 가져오기
    const data = await getPortfolioData();

    // 환경에 따라 Chromium 설정 분기
    const isVercel = process.env.VERCEL === "1";
    let executablePath: string;
    let launchArgs: string[];

    console.log("PDF 생성 환경:", { isVercel, NODE_ENV: process.env.NODE_ENV });

    if (isVercel) {
      // Vercel 환경: @sparticuz/chromium 사용
      executablePath = await chromium.executablePath();
      launchArgs = [...chromium.args, "--font-render-hinting=none"];
      console.log("Vercel Chromium 경로:", executablePath);
    } else {
      // 로컬 개발: 시스템 Chrome 사용
      const localPath = await getLocalChromePath();
      console.log("로컬 Chrome 경로:", localPath);
      if (!localPath) {
        return NextResponse.json(
          { error: "로컬에 Chrome이 설치되어 있지 않습니다. Chrome을 설치해주세요." },
          { status: 500 }
        );
      }
      executablePath = localPath;
      launchArgs = [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--font-render-hinting=none",
      ];
    }

    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: launchArgs,
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
    const html = generatePortfolioHtml(data);
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // 폰트 및 이미지 로딩 대기
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => document.readyState === "complete", {
      timeout: 30000,
    });

    // PDF 생성
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      timeout: 30000,
      margin: {
        top: "12mm",
        right: "12mm",
        bottom: "12mm",
        left: "12mm",
      },
      preferCSSPageSize: false,
    });

    // 파일명을 profile.name에서 동적 생성 (빈 값일 경우 기본값 사용)
    const profileName = data.profile.name?.trim() || "unknown";
    const filename = `포트폴리오_${profileName}.pdf`;
    const encodedFilename = encodeURIComponent(filename);

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="portfolio.pdf"; filename*=UTF-8''${encodedFilename}`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
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
