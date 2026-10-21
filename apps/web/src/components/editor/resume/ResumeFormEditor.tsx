'use client';

import type { ResumeData } from '@silverbeen/types';
import { User, Code2, Briefcase, GraduationCap, Award, Medal, FileText } from 'lucide-react';
import { resumeSchema } from '@/schemas/resume';
import {
  SectionedFormEditor,
  type FormSection,
  type SectionedFormEditorProps,
} from '../SectionedFormEditor';
import { ProfileEditor } from './ProfileEditor';
import { SkillsEditor } from './SkillsEditor';
import { CareerSummaryEditor } from './CareerSummaryEditor';
import { ExperienceEditor } from './experience/ExperienceEditor';
import { EducationEditor } from './EducationEditor';
import { CertificationEditor } from './CertificationEditor';
import { AwardEditor } from './AwardEditor';

const sections: FormSection<ResumeData>[] = [
  {
    key: 'profile',
    label: '기본 정보',
    icon: <User className="h-4 w-4" />,
    render: ({ data, update, errors }) => (
      <ProfileEditor data={data.profile} onChange={(v) => update('profile', v)} errors={errors} />
    ),
  },
  {
    key: 'skills',
    label: '기술 스택',
    icon: <Code2 className="h-4 w-4" />,
    render: ({ data, update }) => (
      <SkillsEditor data={data.skills} onChange={(v) => update('skills', v)} />
    ),
  },
  {
    key: 'careerSummary',
    label: '경력',
    icon: <Briefcase className="h-4 w-4" />,
    render: ({ data, update }) => (
      <CareerSummaryEditor
        data={data.careerSummary ?? []}
        onChange={(v) => update('careerSummary', v)}
      />
    ),
  },
  {
    key: 'experience',
    label: '프로젝트',
    icon: <FileText className="h-4 w-4" />,
    render: ({ data, update }) => (
      <ExperienceEditor data={data.experience} onChange={(v) => update('experience', v)} />
    ),
  },
  {
    key: 'education',
    label: '학력',
    icon: <GraduationCap className="h-4 w-4" />,
    render: ({ data, update }) => (
      <EducationEditor data={data.education} onChange={(v) => update('education', v)} />
    ),
  },
  {
    key: 'certifications',
    label: '자격증',
    icon: <Award className="h-4 w-4" />,
    render: ({ data, update }) => (
      <CertificationEditor
        data={data.certifications}
        onChange={(v) => update('certifications', v)}
      />
    ),
  },
  {
    key: 'awards',
    label: '수상',
    icon: <Medal className="h-4 w-4" />,
    render: ({ data, update }) => (
      <AwardEditor data={data.awards} onChange={(v) => update('awards', v)} />
    ),
  },
];

type ResumeFormEditorProps = Omit<
  SectionedFormEditorProps<ResumeData>,
  'schema' | 'sections' | 'title'
> & { title?: string };

export function ResumeFormEditor({ title = '이력서 편집', ...props }: ResumeFormEditorProps) {
  return <SectionedFormEditor {...props} title={title} schema={resumeSchema} sections={sections} />;
}
