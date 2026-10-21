import type { ResumeData, Experience } from '@silverbeen/types';
import { config } from '@/config';
import resumeDataFallback from '@/data/resume.json';
import { resumeApi } from '@/lib/api/resume';
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
import { calculateDuration, calculateTotalExperience, formatPeriod } from '@/utils/date';

async function getResumeData(): Promise<ResumeData> {
  try {
    return await withTimeout(resumeApi.getResume({ revalidate: 0 }), 5000);
  } catch (error) {
    console.error('Failed to fetch resume data:', error);
    return resumeDataFallback as ResumeData;
  }
}

function generateResumeHtml(data: ResumeData): string {
  const { profile, skills, careerSummary, experience, education, certifications, awards } = data;

  const renderProject = (project: Experience['projects'][number]) => {
    const techStackHtml =
      project.techStack
        ?.map((tech) => {
          const techName = typeof tech === 'string' ? tech : tech.items.join(', ');
          return `<span class="tech-tag"><span class="tech-dot"></span>${escapeHtml(techName)}</span>`;
        })
        .join('') || '';

    const tasksHtml = project.tasks
      .map(
        (task) => `
          <div class="task">
            <div class="task-title">
              <div class="task-icon"><div class="task-icon-dot"></div></div>
              <span>${escapeHtml(task.title)}</span>
            </div>
            <div class="task-list">
              ${task.items.map((item) => `<div class="task-item"><span class="task-item-dot"></span><span>${escapeHtml(item)}</span></div>`).join('')}
            </div>
          </div>
        `,
      )
      .join('');

    const impactHtml = project.impact?.length
      ? `
        <div class="impact">
          <div class="impact-title">Impact</div>
          ${project.impact.map((item) => `<div class="impact-item"><span class="impact-dot"></span><span>${escapeHtml(item)}</span></div>`).join('')}
        </div>
      `
      : '';

    const linksHtml = project.links?.length
      ? `<div class="project-links">${project.links.map((link) => `<a href="${escapeHtml(link.url)}" class="link-badge">${escapeHtml(link.label)}</a>`).join('')}</div>`
      : '';

    const imagesHtml = project.images?.length
      ? `
        <div class="screenshots">
          <div class="screenshots-title">Screenshots</div>
          <div class="screenshots-grid${project.images.length === 1 ? ' screenshots-grid-single' : ''}">
            ${project.images.map((img) => `<img src="${escapeHtml(img)}" class="screenshot-img" />`).join('')}
          </div>
        </div>
      `
      : '';

    return `
      <div class="project-card">
        <div class="project-header">
          <div class="project-name">${escapeHtml(project.name)}</div>
          ${project.period ? `<div class="project-period">${escapeHtml(project.period)}</div>` : ''}
          ${linksHtml}
          <div class="project-description">${escapeHtml(project.description)}</div>
          <div class="project-role">${escapeHtml(project.role)}</div>
          ${techStackHtml ? `<div class="tech-stack">${techStackHtml}</div>` : ''}
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
        const period = formatPeriod(exp.startDate, exp.endDate);

        const techStackHtml = exp.techStack
          .map(
            (stack) => `
              <div class="exp-tech-row">
                <span class="exp-tech-label">${escapeHtml(stack.category)}</span>
                <span class="exp-tech-items">${stack.items.map((item) => escapeHtml(item)).join(', ')}</span>
              </div>
            `,
          )
          .join('');

        const projectsHtml = exp.projects.map(renderProject).join('');

        return `
          <div class="experience-card">
            <div class="company-header">
              <span class="company-name">${escapeHtml(exp.company)}</span>
            </div>
            <div class="company-period">${escapeHtml(period)}${exp.description ? ` · ${escapeHtml(exp.description)}` : ''}</div>
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
      .join('');
  };

  const renderEducation = () => {
    return education
      .map(
        (edu) => `
          <div class="education-item">
            <div class="education-icon">E</div>
            <div class="education-content">
              <div class="education-school">${escapeHtml(edu.school)}</div>
              <div class="education-detail">${escapeHtml(edu.major)} · ${escapeHtml(edu.period)}</div>
              ${edu.description ? `<div class="education-detail">${escapeHtml(edu.description)}</div>` : ''}
            </div>
          </div>
        `,
      )
      .join('');
  };

  const renderCertifications = () => {
    return certifications
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
      .join('');
  };

  const renderAwards = () => {
    return awards
      .map(
        (award) => `
          <div class="award-item">
            <div class="award-icon">A</div>
            <div class="award-content">
              <div class="award-header">
                <span class="award-date">${escapeHtml(award.date)}</span>
                <span class="award-title">${escapeHtml(award.title)}</span>
                ${award.link ? `<a href="${escapeHtml(award.link)}" class="award-link">${escapeHtml(award.linkLabel || '링크')}</a>` : ''}
              </div>
              ${award.description ? `<div class="award-description">${escapeHtml(award.description)}</div>` : ''}
            </div>
          </div>
        `,
      )
      .join('');
  };

  const totalExperience = careerSummary ? calculateTotalExperience(careerSummary) : '';

  const renderCareerSummary = () => {
    if (!careerSummary || careerSummary.length === 0) return '';

    // 회사명에서 첫 글자 추출 (괄호나 특수문자 제외)
    const getCompanyInitial = (company: string): string => {
      const cleanName = company.replace(/^\(주\)\s*/, '').trim();
      return cleanName.charAt(0).toUpperCase();
    };

    return careerSummary
      .map((career) => {
        const duration = calculateDuration(career.startDate, career.endDate);
        const period = formatPeriod(career.startDate, career.endDate);
        const initial = getCompanyInitial(career.company);

        return `
          <div class="career-item">
            <div class="career-icon">${escapeHtml(initial)}</div>
            <div class="career-content">
              <div class="career-header">
                <span class="career-company">${escapeHtml(career.company)}</span>
                <span class="career-duration">${escapeHtml(duration)}</span>
              </div>
              <div class="career-detail">${escapeHtml(career.position)} · ${escapeHtml(period)}</div>
              ${career.description ? `<div class="career-description">${escapeHtml(career.description)}</div>` : ''}
            </div>
          </div>
        `;
      })
      .join('');
  };

  const css = `${baseCss({ fontBaseUrl: config.siteUrl, bodyFontSize: 15, sectionTitleFontSize: 19 })}
    .profile { display: flex; gap: 24px; }
    .profile-content { flex: 1; }
    .profile-greeting { font-size: 37px; font-weight: 700; color: #111827; margin-bottom: 6px; }
    .profile-greeting .dot { color: ${P}; }
    .profile-tagline { font-size: 16px; font-weight: 500; color: rgba(17, 24, 39, 0.9); margin-bottom: 12px; }
    .profile-intro { font-size: 14px; color: rgba(17, 24, 39, 0.7); line-height: 1.7; margin-bottom: 12px; white-space: pre-line; }
    .profile-contacts { display: flex; flex-direction: column; gap: 5px; font-size: 13px; color: #6b7280; }
    .profile-contact { display: flex; align-items: center; gap: 6px; }
    .contact-icon { width: 18px; height: 18px; background: ${P}; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: 700; flex-shrink: 0; }
    .profile-photo { width: 130px; height: 170px; border-radius: 8px; object-fit: cover; }
    .skill-row { display: flex; gap: 12px; margin-bottom: 8px; align-items: flex-start; }
    .skill-label { width: 130px; font-size: 13px; font-weight: 600; color: #111827; flex-shrink: 0; }
    .skill-tags { display: flex; flex-wrap: wrap; gap: 5px; }
    .skill-tag { background: #f3f4f6; border-radius: 4px; padding: 3px 10px; font-size: 12px; color: #374151; }
    .career-item { display: flex; gap: 12px; margin-bottom: 12px; }
    .career-icon { width: 36px; height: 36px; background: ${P}; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: white; font-size: 14px; font-weight: 700; }
    .career-content { flex: 1; }
    .career-header { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
    .career-company { font-size: 15px; font-weight: 700; color: #111827; }
    .career-duration { background: ${P}; color: white; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
    .career-detail { font-size: 13px; color: #6b7280; }
    .career-description { font-size: 13px; color: #6b7280; margin-top: 4px; }
    .career-total { font-size: 14px; font-weight: 500; color: #6b7280; margin-left: 8px; }
    .experience-card { margin-bottom: 20px; }
    .company-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .company-name { font-size: 17px; font-weight: 700; color: #111827; }
    .company-duration { background: ${P}; color: white; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .company-period { font-size: 13px; color: #6b7280; margin-bottom: 12px; }
    .exp-tech-stack { margin-bottom: 12px; }
    .exp-tech-title { font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 6px; }
    .exp-tech-row { display: flex; gap: 10px; font-size: 13px; margin-bottom: 3px; }
    .exp-tech-label { width: 80px; color: #6b7280; flex-shrink: 0; }
    .exp-tech-items { color: #111827; }
    .projects-title { font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 10px; }
    .project-card { border: 1px solid ${primaryAlpha(0.2)}; border-radius: 12px; padding: 16px; margin-bottom: 20px; background: #ffffff; }
    .project-header { border-bottom: 1px solid ${primaryAlpha(0.1)}; padding-bottom: 12px; margin-bottom: 12px; }
    .project-name { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 4px; }
    .project-period { font-size: 12px; font-weight: 500; color: ${primaryAlpha(0.8)}; margin-bottom: 8px; }
    .project-links { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
    .link-badge { border: 1px solid ${primaryAlpha(0.3)}; background: ${primaryAlpha(0.08)}; color: ${P}; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-decoration: none; }
    .project-description { font-size: 13px; color: #6b7280; line-height: 1.6; margin-bottom: 10px; }
    .project-role { display: inline-block; background: ${primaryAlpha(0.1)}; border: 1px solid ${primaryAlpha(0.2)}; border-radius: 6px; padding: 3px 12px; font-size: 12px; font-weight: 600; color: #111827; }
    .tech-stack { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
    .tech-tag { display: inline-flex; align-items: center; gap: 4px; border: 1px solid ${primaryAlpha(0.2)}; border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 500; color: #374151; background: ${primaryAlpha(0.06)}; }
    .tech-dot { width: 5px; height: 5px; border-radius: 50%; background: ${P}; }
    .task { margin-top: 12px; }
    .task-title { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 8px; }
    .task-icon { width: 18px; height: 18px; background: ${P}; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
    .task-icon-dot { width: 5px; height: 5px; background: white; border-radius: 50%; }
    .task-list { margin-left: 26px; border-left: 2px solid ${primaryAlpha(0.2)}; padding-left: 14px; }
    .task-item { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #6b7280; margin-bottom: 5px; line-height: 1.6; }
    .task-item-dot { width: 5px; height: 5px; background: ${P}; border-radius: 50%; margin-top: 7px; flex-shrink: 0; }
    .impact { margin-top: 12px; background: ${primaryAlpha(0.08)}; border: 1px solid ${primaryAlpha(0.2)}; border-radius: 10px; padding: 14px; }
    .impact-title { font-size: 13px; font-weight: 700; color: ${P}; margin-bottom: 8px; }
    .impact-item { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; font-weight: 500; color: #111827; margin-bottom: 5px; }
    .impact-dot { width: 6px; height: 6px; background: ${P}; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
    .screenshots { margin-top: 8px; }
    .screenshots-title { font-size: 12px; font-weight: 700; color: #111827; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
    .screenshots-title::before { content: ''; width: 14px; height: 14px; background: #0ea5e9; border-radius: 3px; }
    .screenshots-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .screenshot-img { width: 100%; max-height: 260px; object-fit: cover; object-position: top; border-radius: 4px; border: 1px solid #e5e7eb; }
    .education-item { display: flex; gap: 12px; margin-bottom: 12px; }
    .education-icon { width: 36px; height: 36px; background: ${P}; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: white; font-size: 14px; font-weight: 700; }
    .education-school { font-size: 14px; font-weight: 600; color: #111827; }
    .education-detail { font-size: 13px; color: #6b7280; margin-top: 2px; }
    .cert-container { display: flex; flex-wrap: wrap; gap: 10px; }
    .cert-item { display: flex; align-items: center; gap: 10px; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 14px; background: #ffffff; }
    .cert-icon { width: 24px; height: 24px; background: ${P}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: 700; flex-shrink: 0; }
    .cert-name { font-size: 13px; font-weight: 500; color: #111827; }
    .cert-date { font-size: 12px; color: #6b7280; }
    .award-item { display: flex; gap: 12px; border: 1px solid ${primaryAlpha(0.2)}; border-radius: 6px; padding: 14px; margin-bottom: 10px; background: #ffffff; }
    .award-icon { width: 36px; height: 36px; background: ${P}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: 700; flex-shrink: 0; }
    .award-content { flex: 1; }
    .award-header { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .award-date { font-size: 12px; color: #6b7280; }
    .award-title { font-size: 14px; font-weight: 600; color: #111827; }
    .award-link { font-size: 12px; color: ${P}; text-decoration: none; }
    .award-description { font-size: 13px; color: #6b7280; margin-top: 4px; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .task { break-inside: avoid; } }`;

  return htmlDocument(
    css,
    `
    <div class="section profile">
      <div class="profile-content">
        ${profile.greeting ? `<div class="profile-greeting">${escapeHtml(profile.greeting).replace('.', '<span class="dot">.</span>')}</div>` : ''}
        ${profile.tagline ? `<div class="profile-tagline">${escapeHtml(profile.tagline)}</div>` : ''}
        ${profile.introduction ? `<div class="profile-intro">${escapeHtml(profile.introduction)}</div>` : ''}
        <div class="profile-contacts">
          ${profile.phone ? `<div class="profile-contact"><span class="contact-icon">T</span> ${escapeHtml(profile.phone)}</div>` : ''}
          ${profile.email ? `<div class="profile-contact"><span class="contact-icon">@</span> ${escapeHtml(profile.email)}</div>` : ''}
          ${profile.github ? `<div class="profile-contact"><span class="contact-icon">G</span> ${escapeHtml(profile.github)}</div>` : ''}
          ${profile.blog ? `<div class="profile-contact"><span class="contact-icon">B</span> ${escapeHtml(profile.blog)}</div>` : ''}
          ${profile.linkedin ? `<div class="profile-contact"><span class="contact-icon">L</span> ${escapeHtml(profile.linkedin)}</div>` : ''}
        </div>
      </div>
      ${profile.photo ? `<img src="${escapeHtml(profile.photo)}" class="profile-photo" />` : ''}
    </div>
    <hr />
    <div class="section">
      ${sectionTitleHtml('보유 기술')}
      ${renderSkillsHtml(skills)}
    </div>
    ${
      careerSummary && careerSummary.length > 0
        ? `
    <hr />
    <div class="section">
      ${sectionTitleHtml('경력', totalExperience ? `<span class="career-total">총 ${escapeHtml(totalExperience)}</span>` : '')}
      ${renderCareerSummary()}
    </div>
    `
        : ''
    }
    <hr />
    <div class="section">
      ${sectionTitleHtml('프로젝트')}
      ${renderExperience()}
    </div>
    <hr />
    <div class="section">
      ${sectionTitleHtml('학력')}
      ${renderEducation()}
    </div>
    <hr />
    <div class="section">
      ${sectionTitleHtml('자격증')}
      <div class="cert-container">${renderCertifications()}</div>
    </div>
    <hr />
    <div class="section">
      ${sectionTitleHtml('수상 및 기타')}
      ${renderAwards()}
    </div>`,
  );
}

export const POST = createPdfRouteHandler({
  getData: getResumeData,
  buildHtml: generateResumeHtml,
  margin: '15mm',
  getFilename: (data) => `이력서_${profileFilenamePart(data.profile.name)}.pdf`,
  asciiFilename: 'resume.pdf',
});
