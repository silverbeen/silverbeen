"use client";

import { forwardRef } from "react";
import type {
  ResumeData,
  Profile,
  Skills,
  Experience,
  Education,
  Certification,
  Award as AwardType,
} from "@/types/resume";
import { calculateDuration, formatPeriod } from "@/utils/date";

interface ResumePdfContentProps {
  data: ResumeData;
}

// 색상 상수
const PRIMARY = "#514EF6";
const GRAY_900 = "#111827";
const GRAY_800 = "#1f2937";
const GRAY_700 = "#374151";
const GRAY_600 = "#4b5563";
const GRAY_500 = "#6b7280";
const GRAY_200 = "#e5e7eb";
const GRAY_100 = "#f3f4f6";
const GRAY_50 = "#f9fafb";
const WHITE = "#ffffff";

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

const skillOrder: (keyof typeof skillLabels)[] = [
  "languages",
  "stateManagement",
  "libraries",
  "tools",
  "collaboration",
  "integrations",
  "infrastructure",
  "testing",
];

function PdfSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
      data-pdf-section
    >
      <div
        style={{
          height: "24px",
          width: "4px",
          borderRadius: "9999px",
          backgroundColor: PRIMARY,
        }}
      />
      <h2
        style={{
          fontSize: "20px",
          fontWeight: "700",
          color: GRAY_900,
          margin: 0,
          padding: 0,
          lineHeight: 1,
        }}
      >
        {children}
      </h2>
    </div>
  );
}

function PdfProfileSection({ profile }: { profile: Profile }) {
  return (
    <section
      data-pdf-section
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "32px",
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {profile.greeting && (
            <h1
              style={{
                fontSize: "50px",
                fontWeight: "700",
                color: GRAY_900,
                margin: 0,
                padding: 0,
                lineHeight: 1.2,
              }}
            >
              {profile.greeting}
            </h1>
          )}
          {profile.tagline && (
            <p
              style={{
                fontSize: "18px",
                fontWeight: "500",
                color: GRAY_800,
                margin: 0,
                padding: 0,
              }}
            >
              {profile.tagline}
            </p>
          )}
        </div>

        {profile.introduction && (
          <div style={{ maxWidth: "672px" }}>
            {profile.introduction.split("\n\n").map((paragraph, idx) => (
              <p
                key={idx}
                style={{
                  fontSize: "15px",
                  lineHeight: 1.6,
                  color: GRAY_600,
                  margin: 0,
                  padding: 0,
                  marginBottom: "12px",
                  whiteSpace: "pre-line",
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px" }}>
          {profile.phone && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: GRAY_600, margin: 0, padding: 0 }}>
              <span>📞</span>
              <span style={{ margin: 0, padding: 0 }}>{profile.phone}</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: GRAY_600, margin: 0, padding: 0 }}>
            <span>✉️</span>
            <span style={{ margin: 0, padding: 0 }}>{profile.email}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: GRAY_600, margin: 0, padding: 0 }}>
            <span>💻</span>
            <span style={{ margin: 0, padding: 0 }}>{profile.github}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: GRAY_600, margin: 0, padding: 0 }}>
            <span>📝</span>
            <span style={{ margin: 0, padding: 0 }}>{profile.blog}</span>
          </div>
        </div>
      </div>
      {profile.photo && (
        <div
          style={{
            width: "192px",
            height: "256px",
            flexShrink: 0,
            overflow: "hidden",
            borderRadius: "8px",
            backgroundColor: GRAY_100,
          }}
        >
          <img
            src={profile.photo}
            alt={profile.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
    </section>
  );
}

function PdfSkillsSection({ skills }: { skills: Skills }) {
  return (
    <section data-pdf-section>
      <PdfSectionTitle>보유 기술</PdfSectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {skillOrder.map((key) => {
          const items = skills[key as keyof Skills];
          if (!items || items.length === 0) return null;
          return (
            <div
              key={key}
              style={{ display: "flex", flexDirection: "row", gap: "12px", alignItems: "flex-start" }}
            >
              <span
                style={{
                  minWidth: "140px",
                  flexShrink: 0,
                  fontSize: "14px",
                  fontWeight: "500",
                  color: GRAY_900,
                  margin: 0,
                  padding: 0,
                }}
              >
                {skillLabels[key]}
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {items.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      borderRadius: "6px",
                      backgroundColor: GRAY_100,
                      padding: "2px 8px",
                      fontSize: "14px",
                      color: GRAY_700,
                      margin: 0,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PdfProjectCard({ project }: { project: Experience["projects"][number] }) {
  return (
    <div
      data-pdf-section
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "16px",
        border: `1px solid ${PRIMARY}33`,
        backgroundColor: WHITE,
        padding: "24px",
        marginBottom: "16px",
        pageBreakInside: "avoid",
      }}
    >
      {/* 프로젝트 헤더 */}
      <div
        style={{
          marginBottom: "24px",
          borderBottom: `1px solid ${PRIMARY}1a`,
          paddingBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <h5
              style={{
                fontSize: "20px",
                fontWeight: "700",
                letterSpacing: "-0.025em",
                color: GRAY_900,
                margin: 0,
                padding: 0,
              }}
            >
              {project.name}
            </h5>
            {project.period && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: "500",
                  color: `${PRIMARY}cc`,
                  margin: 0,
                  padding: 0,
                }}
              >
                <span
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    backgroundColor: `${PRIMARY}99`,
                  }}
                />
                {project.period}
              </span>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {project.links?.map((link) => (
              <span
                key={link.url}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  borderRadius: "9999px",
                  border: `1px solid ${PRIMARY}4d`,
                  backgroundColor: `${PRIMARY}1a`,
                  padding: "6px 16px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: PRIMARY,
                  margin: 0,
                }}
              >
                {link.label} 🔗
              </span>
            ))}
          </div>
        </div>
        <p
          style={{
            marginTop: "16px",
            marginBottom: 0,
            whiteSpace: "pre-line",
            fontSize: "14px",
            lineHeight: 1.6,
            color: GRAY_600,
            padding: 0,
          }}
        >
          {project.description}
        </p>
        <div style={{ marginTop: "12px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: "8px",
              background: `linear-gradient(to right, ${PRIMARY}26, ${PRIMARY}0d)`,
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: "600",
              color: GRAY_900,
              border: `1px solid ${PRIMARY}33`,
              margin: 0,
            }}
          >
            {project.role}
          </span>
        </div>
        {project.techStack && project.techStack.length > 0 && (
          <div style={{ marginTop: "16px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {project.techStack.map((tech, index) => {
              const techName = typeof tech === "string" ? tech : tech.items.join(", ");
              const techKey = typeof tech === "string" ? tech : `${tech.category}-${index}`;
              return (
                <span
                  key={techKey}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    borderRadius: "9999px",
                    border: `1px solid ${PRIMARY}33`,
                    background: `linear-gradient(to right, ${PRIMARY}1a, ${PRIMARY}0d, transparent)`,
                    padding: "4px 10px",
                    fontSize: "12px",
                    fontWeight: "500",
                    color: GRAY_700,
                    margin: 0,
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: `${PRIMARY}99`,
                    }}
                  />
                  {techName}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* 주요 업무 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {project.tasks.map((task) => (
          <div key={task.title}>
            <h6
              style={{
                marginBottom: "12px",
                marginTop: 0,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "14px",
                fontWeight: "700",
                color: GRAY_900,
                padding: 0,
              }}
            >
              <span
                style={{
                  display: "flex",
                  width: "20px",
                  height: "20px",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "6px",
                  background: `linear-gradient(to bottom right, ${PRIMARY}, ${PRIMARY}b3)`,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: WHITE,
                  }}
                />
              </span>
              {task.title}
            </h6>
            <ul
              style={{
                marginLeft: "28px",
                marginTop: 0,
                marginBottom: 0,
                marginRight: 0,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                borderLeft: `2px solid ${PRIMARY}33`,
                paddingLeft: "14px",
                paddingTop: 0,
                paddingBottom: 0,
                paddingRight: 0,
                listStyle: "none",
              }}
            >
              {task.items.map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    position: "relative",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    color: GRAY_600,
                    padding: 0,
                    margin: 0,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "-18px",
                      top: "8px",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: `${PRIMARY}66`,
                    }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Impact 섹션 */}
      {project.impact && project.impact.length > 0 && (
        <div
          style={{
            position: "relative",
            marginTop: "24px",
            overflow: "hidden",
            borderRadius: "12px",
            background: `linear-gradient(to right, ${PRIMARY}26, ${PRIMARY}1a, transparent)`,
            padding: "20px",
            border: `1px solid ${PRIMARY}33`,
          }}
        >
          <h6
            style={{
              position: "relative",
              marginBottom: "12px",
              marginTop: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: "700",
              color: PRIMARY,
              padding: 0,
            }}
          >
            🔥 Impact
          </h6>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            {project.impact.map((item, idx) => (
              <li
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: GRAY_900,
                  padding: 0,
                  margin: 0,
                }}
              >
                <span
                  style={{
                    marginTop: "6px",
                    width: "8px",
                    height: "8px",
                    flexShrink: 0,
                    borderRadius: "50%",
                    background: `linear-gradient(to bottom right, ${PRIMARY}, ${PRIMARY}99)`,
                  }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 이미지 - PDF용으로 크게 표시 */}
      {project.images && project.images.length > 0 && (
        <div style={{ marginTop: "24px" }} data-pdf-section>
          <h6
            style={{
              marginBottom: "12px",
              marginTop: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: "700",
              color: GRAY_900,
              padding: 0,
            }}
          >
            📸 Screenshots
          </h6>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {project.images.map((image, idx) => (
              <div
                key={idx}
                style={{
                  position: "relative",
                  width: "100%",
                  overflow: "hidden",
                  borderRadius: "8px",
                  border: `1px solid ${GRAY_200}`,
                  backgroundColor: GRAY_50,
                }}
                data-pdf-section
              >
                <img
                  src={image}
                  alt={`${project.name} screenshot ${idx + 1}`}
                  style={{ width: "100%", height: "auto", objectFit: "contain", maxHeight: "500px" }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PdfExperienceSection({ experience }: { experience: Experience[] }) {
  return (
    <section data-pdf-section>
      <PdfSectionTitle>경력</PdfSectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
        {experience.map((exp) => {
          const companySlug = exp.company.replace(/[^a-zA-Z0-9가-힣]/g, "-").toLowerCase();
          const companyKey = `${companySlug}-${exp.startDate}`;
          const duration = calculateDuration(exp.startDate, exp.endDate);
          const period = formatPeriod(exp.startDate, exp.endDate);

          return (
            <div key={companyKey} data-pdf-section>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: GRAY_900,
                        margin: 0,
                        padding: 0,
                      }}
                    >
                      {exp.company}
                    </h3>
                    <span
                      style={{
                        borderRadius: "9999px",
                        backgroundColor: PRIMARY,
                        padding: "2px 12px",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: WHITE,
                        margin: 0,
                      }}
                    >
                      {duration}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                      color: GRAY_500,
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    <span style={{ margin: 0, padding: 0 }}>{period}</span>
                    {exp.description && (
                      <>
                        <span style={{ margin: 0, padding: 0 }}>·</span>
                        <span style={{ margin: 0, padding: 0 }}>{exp.description}</span>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: GRAY_900,
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    기술 스택
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {exp.techStack.map((stack) => (
                      <div key={stack.category} style={{ display: "flex", gap: "8px", fontSize: "14px" }}>
                        <span style={{ minWidth: "80px", flexShrink: 0, color: GRAY_500, margin: 0, padding: 0 }}>
                          {stack.category}
                        </span>
                        <span style={{ color: GRAY_900, margin: 0, padding: 0 }}>{stack.items.join(", ")}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: GRAY_900,
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    프로젝트
                  </h4>
                  {exp.projects.map((project) => (
                    <PdfProjectCard key={project.name} project={project} />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PdfEducationSection({ education }: { education: Education[] }) {
  return (
    <section data-pdf-section>
      <PdfSectionTitle>학력</PdfSectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {education.map((edu) => (
          <div
            key={`${edu.school}-${edu.major}-${edu.period}`}
            style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}
          >
            <div
              style={{
                display: "flex",
                width: "40px",
                height: "40px",
                flexShrink: 0,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                backgroundColor: GRAY_100,
                fontSize: "20px",
              }}
            >
              🎓
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <h3 style={{ fontWeight: "600", color: GRAY_900, margin: 0, padding: 0 }}>{edu.school}</h3>
              <p style={{ fontSize: "14px", color: GRAY_500, margin: 0, padding: 0 }}>
                {edu.major} · {edu.period}
              </p>
              {edu.description && (
                <p style={{ marginTop: "4px", fontSize: "14px", color: GRAY_500, marginBottom: 0, padding: 0 }}>
                  {edu.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PdfCertificationSection({ certifications }: { certifications: Certification[] }) {
  return (
    <section data-pdf-section>
      <PdfSectionTitle>자격증</PdfSectionTitle>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        {certifications.map((cert) => (
          <div
            key={cert.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              borderRadius: "8px",
              border: `1px solid ${GRAY_200}`,
              backgroundColor: WHITE,
              padding: "12px 16px",
            }}
          >
            <span style={{ fontSize: "20px" }}>🏆</span>
            <div>
              <p style={{ fontWeight: "500", color: GRAY_900, margin: 0, padding: 0 }}>{cert.name}</p>
              <p style={{ fontSize: "12px", color: GRAY_500, margin: 0, padding: 0 }}>{cert.date}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PdfAwardSection({ awards }: { awards: AwardType[] }) {
  return (
    <section data-pdf-section>
      <PdfSectionTitle>수상 및 기타</PdfSectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {awards.map((award) => (
          <div
            key={`${award.date}-${award.title}`}
            style={{
              display: "flex",
              gap: "16px",
              borderRadius: "8px",
              border: `1px solid ${PRIMARY}33`,
              backgroundColor: WHITE,
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "40px",
                height: "40px",
                flexShrink: 0,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                backgroundColor: GRAY_100,
                fontSize: "20px",
              }}
            >
              🏅
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "14px", color: GRAY_500, margin: 0, padding: 0 }}>{award.date}</span>
                <h3 style={{ fontWeight: "600", color: GRAY_900, margin: 0, padding: 0 }}>{award.title}</h3>
                {award.link && (
                  <span style={{ fontSize: "12px", color: PRIMARY, margin: 0, padding: 0 }}>
                    {award.linkLabel || "링크"} 🔗
                  </span>
                )}
              </div>
              {award.description && (
                <p style={{ fontSize: "14px", color: GRAY_500, margin: 0, padding: 0 }}>{award.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export const ResumePdfContent = forwardRef<HTMLDivElement, ResumePdfContentProps>(
  function ResumePdfContent({ data }, ref) {
    return (
      <div
        ref={ref}
        data-pdf-content
        style={{
          width: "800px",
          padding: "40px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          backgroundColor: WHITE,
          color: GRAY_900,
          lineHeight: 1.5,
          margin: 0,
          boxSizing: "border-box",
          WebkitFontSmoothing: "antialiased",
          textRendering: "optimizeLegibility",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
          <PdfProfileSection profile={data.profile} />
          <hr style={{ border: "none", borderTop: `1px solid ${GRAY_200}`, margin: 0, padding: 0 }} />
          <PdfSkillsSection skills={data.skills} />
          <hr style={{ border: "none", borderTop: `1px solid ${GRAY_200}`, margin: 0, padding: 0 }} />
          <PdfExperienceSection experience={data.experience} />
          <hr style={{ border: "none", borderTop: `1px solid ${GRAY_200}`, margin: 0, padding: 0 }} />
          <PdfEducationSection education={data.education} />
          <hr style={{ border: "none", borderTop: `1px solid ${GRAY_200}`, margin: 0, padding: 0 }} />
          <PdfCertificationSection certifications={data.certifications} />
          <hr style={{ border: "none", borderTop: `1px solid ${GRAY_200}`, margin: 0, padding: 0 }} />
          <PdfAwardSection awards={data.awards} />
        </div>
      </div>
    );
  }
);
