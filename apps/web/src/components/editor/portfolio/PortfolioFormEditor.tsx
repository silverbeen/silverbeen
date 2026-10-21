'use client';

import type { PortfolioData, Skills } from '@silverbeen/types';
import { User, Code2, GraduationCap, Users, FolderOpen } from 'lucide-react';
import { portfolioSchema } from '@/schemas/portfolio';
import {
  SectionedFormEditor,
  type FormSection,
  type SectionedFormEditorProps,
} from '../SectionedFormEditor';
import { ProfileEditor } from '../resume/ProfileEditor';
import { SkillsEditor } from '../resume/SkillsEditor';
import { EducationEditor } from '../resume/EducationEditor';
import { ClubEditor } from './ClubEditor';
import { ProjectEditor } from './ProjectEditor';

const emptySkills: Skills = {
  languages: [],
  stateManagement: [],
  libraries: [],
  tools: [],
  collaboration: [],
  integrations: [],
};

const sections: FormSection<PortfolioData>[] = [
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
      <SkillsEditor data={data.skills ?? emptySkills} onChange={(v) => update('skills', v)} />
    ),
  },
  {
    key: 'education',
    label: '학력',
    icon: <GraduationCap className="h-4 w-4" />,
    render: ({ data, update }) => (
      <EducationEditor data={data.education ?? []} onChange={(v) => update('education', v)} />
    ),
  },
  {
    key: 'clubs',
    label: '동아리',
    icon: <Users className="h-4 w-4" />,
    render: ({ data, update }) => (
      <ClubEditor data={data.clubs} onChange={(v) => update('clubs', v)} />
    ),
  },
  {
    key: 'projects',
    label: '프로젝트',
    icon: <FolderOpen className="h-4 w-4" />,
    render: ({ data, update }) => (
      <ProjectEditor data={data.projects} onChange={(v) => update('projects', v)} />
    ),
  },
];

type PortfolioFormEditorProps = Omit<
  SectionedFormEditorProps<PortfolioData>,
  'schema' | 'sections' | 'title'
> & { title?: string };

export function PortfolioFormEditor({
  title = '포트폴리오 편집',
  ...props
}: PortfolioFormEditorProps) {
  return (
    <SectionedFormEditor {...props} title={title} schema={portfolioSchema} sections={sections} />
  );
}
