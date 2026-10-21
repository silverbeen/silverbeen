import type { PortfolioData, PortfolioProject } from '@silverbeen/types';
import { config } from '@/config';
import { PROJECT_CATEGORY_LABELS } from '@/constants/portfolio';
import portfolioDataFallback from '@/data/portfolio.json';
import { portfolioApi } from '@/lib/api/portfolio';
import {
  PDF_PRIMARY as P,
  baseCss,
  escapeHtml,
  htmlDocument,
  primaryAlpha,
  renderSkillsHtml,
  sectionTitleHtml,
} from '@/lib/pdf/html';
import { createPdfRouteHandler, profileFilenamePart, withTimeout } from '@/lib/pdf/route';

async function getPortfolioData(): Promise<PortfolioData> {
  try {
    return await withTimeout(portfolioApi.getPortfolio({ revalidate: 0 }), 5000);
  } catch (error) {
    console.warn('API error, using fallback data:', error);
    return portfolioDataFallback as PortfolioData;
  }
}

function generatePortfolioHtml(data: PortfolioData): string {
  const { profile, skills, education, projects, clubs, awards, certifications, activities } = data;

  // hidden 또는 pdfHidden이 아닌 프로젝트만 필터링
  const visibleProjects = projects.filter((p) => !p.hidden && !p.pdfHidden);

  const renderEducation = () => {
    if (!education || education.length === 0) return '';
    return `
      <div class="section">
        ${sectionTitleHtml('학력')}
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
                ${edu.description ? `<div class="education-description">${escapeHtml(edu.description)}</div>` : ''}
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
      <hr />
    `;
  };

  const renderProject = (project: PortfolioProject) => {
    const techStackHtml = project.techStack
      .map(
        (tech) => `<span class="tech-tag"><span class="tech-dot"></span>${escapeHtml(tech)}</span>`,
      )
      .join('');

    const tasksHtml = project.tasks
      .map(
        (task) =>
          `<div class="task-item"><span class="task-dot"></span><span>${escapeHtml(task)}</span></div>`,
      )
      .join('');

    const impactHtml =
      project.impact && project.impact.length > 0
        ? `
        <div class="impact">
          <div class="impact-title">성과</div>
          ${project.impact.map((item) => `<div class="impact-item"><span class="impact-dot"></span><span>${escapeHtml(item)}</span></div>`).join('')}
        </div>
      `
        : '';

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
          `,
            )
            .join('')}
        </div>
      `
        : '';

    const linksHtml =
      project.links && project.links.length > 0
        ? `<div class="project-links">${project.links.map((link) => `<a href="${escapeHtml(link.url)}" class="link-badge">${escapeHtml(link.label)}</a>`).join('')}</div>`
        : '';

    const imagesHtml =
      project.images && project.images.length > 0
        ? `
        <div class="screenshots">
          <div class="screenshots-title">스크린샷</div>
          <div class="screenshots-grid${project.images.length === 1 ? ' screenshots-grid-single' : ''}">
            ${project.images.map((img) => `<img src="${escapeHtml(img)}" class="screenshot-img" />`).join('')}
          </div>
        </div>
      `
        : '';

    return `
      <div class="project-card">
        <div class="project-header">
          <div class="project-meta">
            <span class="project-category">${escapeHtml(PROJECT_CATEGORY_LABELS[project.category]?.shortLabel ?? project.category)}</span>
            ${project.clubName ? `<span class="project-club">@ ${escapeHtml(project.clubName)}</span>` : ''}
          </div>
          <div class="project-name">${escapeHtml(project.name)}</div>
          <div class="project-info">
            <span class="project-period">개발기간: ${escapeHtml(project.period)}</span>
            <span class="project-role">${escapeHtml(project.role)}</span>
            ${project.teamSize ? `<span class="project-team">${project.teamSize}명</span>` : ''}
          </div>
          ${linksHtml}
          <div class="project-description">${escapeHtml(project.description)}</div>
          ${techStackHtml ? `<div class="tech-stack">${techStackHtml}</div>` : ''}
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
    if (!clubs || clubs.length === 0) return '';
    return `
      <div class="section">
        ${sectionTitleHtml('동아리')}
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
                ? `<div class="club-activities">${club.activities.map((a) => `<span class="activity-tag">${escapeHtml(a)}</span>`).join('')}</div>`
                : ''
            }
          </div>
        `,
          )
          .join('')}
      </div>
      <hr />
    `;
  };

  const renderAwards = () => {
    if (!awards || awards.length === 0) return '';
    return `
      <div class="section">
        ${sectionTitleHtml('수상')}
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
                ${award.description ? `<div class="award-description">${escapeHtml(award.description)}</div>` : ''}
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
      <hr />
    `;
  };

  const renderCertifications = () => {
    if (!certifications || certifications.length === 0) return '';
    return `
      <div class="section">
        ${sectionTitleHtml('자격증')}
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
          `,
            )
            .join('')}
        </div>
      </div>
      <hr />
    `;
  };

  const renderActivities = () => {
    if (!activities || activities.length === 0) return '';
    return `
      <div class="section">
        ${sectionTitleHtml('활동')}
        ${activities
          .map(
            (activity) => `
          <div class="activity-item">
            <span class="activity-date">${escapeHtml(activity.date)}</span>
            <span class="activity-title">${escapeHtml(activity.title)}</span>
            ${activity.description ? `<span class="activity-desc">${escapeHtml(activity.description)}</span>` : ''}
          </div>
        `,
          )
          .join('')}
      </div>
    `;
  };

  const css = `${baseCss({ fontBaseUrl: config.siteUrl, bodyFontSize: 14, sectionTitleFontSize: 18 })}

    /* Skills */
    .skill-row { display: flex; gap: 12px; margin-bottom: 8px; align-items: flex-start; }
    .skill-label { width: 130px; font-size: 12px; font-weight: 600; color: #111827; flex-shrink: 0; }
    .skill-tags { display: flex; flex-wrap: wrap; gap: 5px; }
    .skill-tag { border: 1px solid ${primaryAlpha(0.2)}; background: ${primaryAlpha(0.05)}; border-radius: 6px; padding: 3px 10px; font-size: 11px; color: #374151; }

    /* Profile */
    .profile { display: flex; gap: 20px; margin-bottom: 16px; align-items: flex-start; }
    .profile-photo { width: 110px; height: 110px; border-radius: 20px; object-fit: cover; flex-shrink: 0; }
    .profile-content { flex: 1; }
    .profile-header { margin-bottom: 8px; }
    .profile-name { font-size: 28px; font-weight: 700; color: #111827; margin-bottom: 2px; }
    .profile-title { font-size: 14px; font-weight: 500; color: ${primaryAlpha(0.9)}; margin-bottom: 6px; }
    .profile-tagline { font-size: 13px; color: rgba(17, 24, 39, 0.7); line-height: 1.6; margin-bottom: 10px; }
    .profile-contacts { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
    .contact-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #6b7280; }
    .contact-icon { width: 18px; height: 18px; background: ${P}; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: 700; flex-shrink: 0; }
    .profile-intro-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-top: 12px; }
    .profile-intro { font-size: 13px; color: rgba(17, 24, 39, 0.75); line-height: 1.8; white-space: pre-line; }

    /* Projects */
    .projects-grid { display: flex; flex-direction: column; gap: 16px; }
    .project-card { padding: 16px; page-break-inside: avoid; }
    .project-header { padding-bottom: 12px; margin-bottom: 12px; }
    .project-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .project-category { background: ${P}; color: white; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; }
    .project-club { font-size: 12px; color: #6b7280; }
    .project-name { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 6px; }
    .project-info { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; font-size: 12px; color: #6b7280; margin-bottom: 8px; }
    .project-period { font-weight: 500; color: ${primaryAlpha(0.8)}; }
    .project-role { font-weight: 600; color: #111827; }
    .project-team { display: flex; align-items: center; gap: 4px; }
    .project-links { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
    .link-badge { border: 1px solid ${primaryAlpha(0.3)}; background: ${primaryAlpha(0.08)}; color: ${P}; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-decoration: none; }
    .project-description { font-size: 12px; color: #6b7280; line-height: 1.6; margin-bottom: 10px; }
    .tech-stack { display: flex; flex-wrap: wrap; gap: 4px; }
    .tech-tag { display: inline-flex; align-items: center; gap: 4px; border: 1px solid ${primaryAlpha(0.2)}; border-radius: 12px; padding: 2px 8px; font-size: 10px; font-weight: 500; color: #374151; background: ${primaryAlpha(0.06)}; }
    .tech-dot { width: 4px; height: 4px; border-radius: 50%; background: ${P}; }

    /* Tasks */
    .project-tasks { margin-top: 12px; }
    .tasks-title { font-size: 12px; font-weight: 700; color: #111827; margin-bottom: 8px; }
    .task-item { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: #6b7280; margin-bottom: 4px; line-height: 1.5; }
    .task-dot { width: 4px; height: 4px; background: ${P}; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }

    /* Impact */
    .impact { margin-top: 12px; background: ${primaryAlpha(0.08)}; border: 1px solid ${primaryAlpha(0.2)}; border-radius: 8px; padding: 12px; }
    .impact-title { font-size: 12px; font-weight: 700; color: ${P}; margin-bottom: 6px; }
    .impact-item { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; font-weight: 500; color: #111827; margin-bottom: 4px; }
    .impact-dot { width: 5px; height: 5px; background: ${P}; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }

    /* Growth - 실 서비스 색상과 통일 (amber-50/orange-50 그라데이션) */
    .growth { margin-top: 12px; }
    .growth-title { font-size: 12px; font-weight: 700; color: #b45309; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
    .growth-title::before { content: ''; width: 14px; height: 14px; background: #f59e0b; border-radius: 50%; flex-shrink: 0; }
    .growth-item { background: linear-gradient(to bottom right, rgba(255, 251, 235, 0.5), rgba(255, 247, 237, 0.3)); border: 1px solid rgba(252, 211, 77, 0.5); border-radius: 12px; padding: 12px; margin-bottom: 8px; }
    .growth-item-title { font-size: 12px; font-weight: 600; color: #b45309; margin-bottom: 4px; }
    .growth-item-content { font-size: 11px; color: rgba(17, 24, 39, 0.8); line-height: 1.6; }

    /* Screenshots */
    .screenshots { margin-top: 12px; }
    .screenshots-title { font-size: 12px; font-weight: 700; color: #111827; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
    .screenshots-title::before { content: ''; width: 14px; height: 14px; background: #0ea5e9; border-radius: 4px; flex-shrink: 0; }
    .screenshots-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .screenshots-grid-single { grid-template-columns: 1fr; }
    .screenshot-img { width: 100%; border-radius: 6px; border: 1px solid #e5e7eb; }

    /* Clubs */
    .club-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 10px; }
    .club-header { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
    .club-name { font-size: 14px; font-weight: 700; color: #111827; }
    .club-role { font-size: 12px; color: ${P}; font-weight: 500; }
    .club-period { font-size: 11px; color: #6b7280; margin-bottom: 6px; }
    .club-description { font-size: 12px; color: #6b7280; line-height: 1.5; margin-bottom: 6px; }
    .club-activities { display: flex; flex-wrap: wrap; gap: 4px; }
    .activity-tag { background: #f3f4f6; border-radius: 4px; padding: 2px 8px; font-size: 10px; color: #374151; }

    /* Education */
    .education-list { display: flex; flex-direction: column; gap: 10px; }
    .education-item { display: flex; gap: 12px; align-items: flex-start; }
    .education-icon { width: 32px; height: 32px; background: ${P}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 700; flex-shrink: 0; }
    .education-content { flex: 1; }
    .education-school { font-size: 14px; font-weight: 600; color: #111827; }
    .education-major { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .education-period { font-size: 11px; color: ${P}; font-weight: 500; margin-top: 2px; }
    .education-description { font-size: 11px; color: #6b7280; margin-top: 4px; }

    /* Awards */
    .awards-grid { display: flex; flex-direction: column; gap: 8px; }
    .award-item { display: flex; gap: 10px; border: 1px solid ${primaryAlpha(0.2)}; border-radius: 8px; padding: 10px; }
    .award-icon { width: 28px; height: 28px; background: ${P}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 700; flex-shrink: 0; }
    .award-name { font-size: 13px; font-weight: 600; color: #111827; }
    .award-prize { font-size: 12px; font-weight: 500; color: ${P}; }
    .award-date { font-size: 11px; color: #6b7280; }
    .award-description { font-size: 11px; color: #6b7280; margin-top: 4px; }

    /* Certifications */
    .cert-container { display: flex; flex-wrap: wrap; gap: 8px; }
    .cert-item { display: flex; align-items: center; gap: 8px; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 12px; }
    .cert-icon { width: 20px; height: 20px; background: ${P}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: 700; flex-shrink: 0; }
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
    }`;

  return htmlDocument(
    css,
    `
    <div class="profile">
      ${profile.photo ? `<img src="${escapeHtml(profile.photo)}" class="profile-photo" />` : ''}
      <div class="profile-content">
        <div class="profile-header">
          <div class="profile-name">${escapeHtml(profile.name || '')}</div>
          ${profile.title ? `<div class="profile-title">${escapeHtml(profile.title)}</div>` : ''}
        </div>
        ${profile.tagline ? `<div class="profile-tagline">${escapeHtml(profile.tagline)}</div>` : ''}
        <div class="profile-contacts">
          ${profile.email ? `<div class="contact-item"><span class="contact-icon">@</span> ${escapeHtml(profile.email)}</div>` : ''}
          ${profile.github ? `<div class="contact-item"><span class="contact-icon">G</span> ${escapeHtml(profile.github)}</div>` : ''}
          ${profile.blog ? `<div class="contact-item"><span class="contact-icon">B</span> ${escapeHtml(profile.blog)}</div>` : ''}
          ${profile.linkedin ? `<div class="contact-item"><span class="contact-icon">L</span> ${escapeHtml(profile.linkedin)}</div>` : ''}
        </div>
      </div>
    </div>
    ${profile.introduction ? `<div class="profile-intro-box"><div class="profile-intro">${escapeHtml(profile.introduction)}</div></div>` : ''}

    ${
      skills
        ? `
    <hr />
    <div class="section">
      ${sectionTitleHtml('보유 기술')}
      ${renderSkillsHtml(skills)}
    </div>
    `
        : ''
    }
    <hr />

    <div class="section">
      ${sectionTitleHtml('프로젝트')}
      <div class="projects-grid">
        ${visibleProjects.map(renderProject).join('')}
      </div>
    </div>
    <hr />

    ${renderAwards()}
    ${renderClubs()}
    ${renderActivities()}
    ${renderEducation()}
    ${renderCertifications()}`,
  );
}

export const POST = createPdfRouteHandler({
  getData: getPortfolioData,
  buildHtml: generatePortfolioHtml,
  margin: '12mm',
  getFilename: (data) => `포트폴리오_${profileFilenamePart(data.profile.name)}.pdf`,
  asciiFilename: 'portfolio.pdf',
});
