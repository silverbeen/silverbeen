'use client';

import { useState, useEffect, useRef } from 'react';
import type { Experience, Project, ProjectTask } from '@/types/resume';
import { FormField, inputClassName, AutoTextarea } from '../FormField';
import { StringArrayField } from '../ArrayField';
import { SortableList } from '../SortableList';
import { ImageUploadModal } from '@/components/ui';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Image as ImageIcon,
  Building2,
  Calendar,
  Briefcase,
  FolderOpen,
  ListTodo,
  GripVertical,
  X,
} from 'lucide-react';

interface ExperienceEditorProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

type ExperienceWithId = Experience & { _id: string };
type ProjectWithId = Project & { _id: string };

// 고유 ID 생성 함수
const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// 경력에 안정적인 ID 부여
const getExperienceId = (exp: Experience): string => {
  return (exp as ExperienceWithId)._id || '';
};

// 프로젝트에 안정적인 ID 부여
const getProjectId = (project: Project): string => {
  return (project as ProjectWithId)._id || '';
};

export function ExperienceEditor({ data, onChange }: ExperienceEditorProps) {
  const hasBackfilledIds = useRef(false);

  // ID가 없는 항목에 ID 부여하여 영속화
  useEffect(() => {
    if (hasBackfilledIds.current) return;

    let needsUpdate = false;
    const updatedData = data.map((exp) => {
      let updated = exp;

      // Experience에 ID 부여
      if (!(exp as ExperienceWithId)._id) {
        updated = { ...updated, _id: generateId() } as ExperienceWithId;
        needsUpdate = true;
      }

      // 내부 프로젝트에도 ID 부여
      if (exp.projects?.length) {
        const updatedProjects = exp.projects.map((p) => {
          if ((p as ProjectWithId)._id) return p;
          needsUpdate = true;
          return { ...p, _id: generateId() } as ProjectWithId;
        });
        if (needsUpdate) {
          updated = { ...updated, projects: updatedProjects };
        }
      }

      return updated;
    });

    if (needsUpdate) {
      hasBackfilledIds.current = true;
      onChange(updatedData);
    } else {
      hasBackfilledIds.current = true;
    }
  }, [data, onChange]);

  // 첫 번째 경력 ID를 초기 확장 상태로 설정
  const [expandedId, setExpandedId] = useState<string | null>(() =>
    data.length > 0 ? getExperienceId(data[0]) : null,
  );

  const handleAdd = () => {
    const newId = generateId();
    const newExp = {
      _id: newId,
      company: '',
      startDate: '',
      techStack: [],
      projects: [],
    } as Experience & { _id: string };
    onChange([...data, newExp]);
    setExpandedId(newId);
  };

  const handleRemove = (id: string) => {
    const index = data.findIndex((e) => getExperienceId(e) === id);
    if (index === -1) return;
    onChange(data.filter((_, i) => i !== index));
    if (expandedId === id) setExpandedId(null);
  };

  const handleUpdate = (id: string, updated: Experience) => {
    const index = data.findIndex((e) => getExperienceId(e) === id);
    if (index === -1) return;
    // ID를 유지하여 업데이트
    const updatedWithId = { ...updated, _id: id };
    onChange(data.map((item, i) => (i === index ? updatedWithId : item)));
  };

  const handleReorder = (reordered: Experience[]) => {
    onChange(reordered);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <Briefcase className="text-primary-500 h-5 w-5" />
            경력
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            경력 사항을 시간순으로 정리해주세요
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="bg-primary-500 hover:bg-primary-600 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          경력 추가
        </button>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-16 dark:border-gray-700 dark:bg-gray-800/50">
          <Building2 className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="font-medium text-gray-500 dark:text-gray-400">경력을 추가해주세요</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            회사 정보와 프로젝트를 상세히 기록할 수 있습니다
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">{data.length}개의 경력</span>
            <span>•</span>
            <span>드래그하여 순서 변경</span>
          </div>
          <SortableList
            items={data}
            getKey={(exp) => getExperienceId(exp)}
            onReorder={handleReorder}
            renderItem={(exp) => {
              const expId = getExperienceId(exp);
              return (
                <ExperienceCard
                  experience={exp}
                  expanded={expandedId === expId}
                  onToggle={() => setExpandedId(expandedId === expId ? null : expId)}
                  onChange={(updated) => handleUpdate(expId, updated)}
                  onRemove={() => handleRemove(expId)}
                />
              );
            }}
          />
        </div>
      )}
    </div>
  );
}

interface ExperienceCardProps {
  experience: Experience;
  expanded: boolean;
  onToggle: () => void;
  onChange: (experience: Experience) => void;
  onRemove: () => void;
}

function ExperienceCard({
  experience,
  expanded,
  onToggle,
  onChange,
  onRemove,
}: ExperienceCardProps) {
  const handleChange = <K extends keyof Experience>(key: K, value: Experience[K]) => {
    onChange({ ...experience, [key]: value });
  };

  const handleAddProject = () => {
    const newProject = {
      _id: generateId(),
      name: '',
      description: '',
      role: '',
      tasks: [],
    } as ProjectWithId;
    handleChange('projects', [...experience.projects, newProject]);
  };

  const handleUpdateProject = (index: number, project: Project) => {
    const newProjects = [...experience.projects];
    newProjects[index] = project;
    handleChange('projects', newProjects);
  };

  const handleRemoveProject = (index: number) => {
    handleChange(
      'projects',
      experience.projects.filter((_, i) => i !== index),
    );
  };

  const projectCount = experience.projects.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs transition-shadow hover:shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* 헤더 */}
      <div
        className="flex cursor-pointer items-center justify-between p-5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
        onClick={onToggle}
      >
        <div className="flex flex-1 items-center gap-4">
          <div className="bg-primary-100 dark:bg-primary-900/30 rounded-xl p-3">
            <Building2 className="text-primary-600 dark:text-primary-400 h-6 w-6" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              {experience.company || '새 경력'}
            </h4>
            <div className="mt-1 flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {experience.startDate || '시작일'}
                  {experience.endDate ? ` ~ ${experience.endDate}` : ' ~ 현재'}
                </span>
              </div>
              {experience.position && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {experience.position}
                  </span>
                </>
              )}
            </div>
          </div>
          {projectCount > 0 && (
            <span className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full px-3 py-1 text-xs font-medium">
              프로젝트 {projectCount}개
            </span>
          )}
        </div>
        <div className="ml-4 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="rounded-lg p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div
            className={`rounded-lg p-2 transition-colors ${
              expanded
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'text-gray-400'
            }`}
          >
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      {expanded && (
        <div className="space-y-6 border-t border-gray-200 bg-gray-50/50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
          {/* 기본 정보 섹션 */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h5 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Building2 className="text-primary-500 h-4 w-4" />
              회사 정보
            </h5>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="회사명" required>
                <input
                  type="text"
                  value={experience.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  className={inputClassName}
                  placeholder="회사명"
                />
              </FormField>

              <FormField label="직책">
                <input
                  type="text"
                  value={experience.position || ''}
                  onChange={(e) => handleChange('position', e.target.value)}
                  className={inputClassName}
                  placeholder="프론트엔드 개발자"
                />
              </FormField>

              <FormField label="시작일" required>
                <input
                  type="text"
                  value={experience.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className={inputClassName}
                  placeholder="2023.01"
                />
              </FormField>

              <FormField label="종료일">
                <input
                  type="text"
                  value={experience.endDate || ''}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className={inputClassName}
                  placeholder="2024.01 (비우면 '현재')"
                />
              </FormField>
            </div>

            <div className="mt-4">
              <FormField label="설명">
                <AutoTextarea
                  value={experience.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="회사 또는 직무에 대한 간단한 설명"
                  minRows={2}
                  maxRows={6}
                />
              </FormField>
            </div>
          </div>

          {/* 프로젝트 섹션 */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h5 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <FolderOpen className="text-primary-500 h-4 w-4" />
                프로젝트
              </h5>
              <button
                type="button"
                onClick={handleAddProject}
                className="text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
              >
                <Plus className="h-4 w-4" />
                프로젝트 추가
              </button>
            </div>

            {experience.projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-10 dark:border-gray-700 dark:bg-gray-800/50">
                <FolderOpen className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">프로젝트를 추가해주세요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {experience.projects.map((project, index) => (
                  <ProjectCard
                    key={getProjectId(project) || index}
                    project={project}
                    onChange={(p) => handleUpdateProject(index, p)}
                    onRemove={() => handleRemoveProject(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Sortable Image Item for DnD
interface SortableImageItemProps {
  id: string;
  url: string;
  index: number;
  onRemove: () => void;
  onPreview: () => void;
}

function SortableImageItem({ id, url, index, onRemove, onPreview }: SortableImageItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-600"
    >
      {/* 드래그 핸들 */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 z-10 cursor-grab rounded bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="h-3 w-3 text-white" />
      </div>
      <img
        src={url}
        alt={`Project ${index + 1}`}
        className="h-24 w-24 cursor-pointer object-cover"
        onClick={onPreview}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="pointer-events-auto rounded-lg bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  onChange: (project: Project) => void;
  onRemove: () => void;
}

function ProjectCard({ project, onChange, onRemove }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // DnD sensors for images
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleChange = <K extends keyof Project>(key: K, value: Project[K]) => {
    onChange({ ...project, [key]: value });
  };

  // Image DnD handler
  const handleImageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const images = project.images || [];
      const oldIndex = images.findIndex((_, i) => `image-${i}` === active.id);
      const newIndex = images.findIndex((_, i) => `image-${i}` === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        handleChange('images', arrayMove(images, oldIndex, newIndex));
      }
    }
  };

  const handleAddTask = () => {
    const newTask: ProjectTask = { title: '', items: [] };
    handleChange('tasks', [...project.tasks, newTask]);
  };

  const handleUpdateTask = (index: number, task: ProjectTask) => {
    const newTasks = [...project.tasks];
    newTasks[index] = task;
    handleChange('tasks', newTasks);
  };

  const handleRemoveTask = (index: number) => {
    handleChange(
      'tasks',
      project.tasks.filter((_, i) => i !== index),
    );
  };

  const handleAddImage = (url: string) => {
    handleChange('images', [...(project.images || []), url]);
  };

  const handleRemoveImage = (index: number) => {
    handleChange(
      'images',
      (project.images || []).filter((_, i) => i !== index),
    );
  };

  const taskCount = project.tasks.length;
  const imageCount = project.images?.length || 0;

  return (
    <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800">
      <div
        className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-1 items-center gap-3">
          <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
            <FolderOpen className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {project.name || '새 프로젝트'}
            </span>
            {(taskCount > 0 || imageCount > 0) && (
              <div className="mt-0.5 flex items-center gap-2">
                {taskCount > 0 && <span className="text-xs text-gray-400">업무 {taskCount}개</span>}
                {imageCount > 0 && (
                  <span className="text-xs text-gray-400">이미지 {imageCount}개</span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className={`rounded-lg p-1.5 ${expanded ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="space-y-4 border-t border-gray-200 p-4 pt-0 dark:border-gray-600">
          <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">
            <FormField label="프로젝트명" required>
              <input
                type="text"
                value={project.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={inputClassName}
                placeholder="프로젝트명"
              />
            </FormField>

            <FormField label="기간">
              <input
                type="text"
                value={project.period || ''}
                onChange={(e) => handleChange('period', e.target.value)}
                className={inputClassName}
                placeholder="2023.01 ~ 2023.06"
              />
            </FormField>
          </div>

          <FormField label="역할" required>
            <input
              type="text"
              value={project.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className={inputClassName}
              placeholder="프론트엔드 개발"
            />
          </FormField>

          <FormField label="설명" required>
            <AutoTextarea
              value={project.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="프로젝트에 대한 간단한 설명"
              minRows={2}
              maxRows={6}
            />
          </FormField>

          {/* 주요 업무 */}
          <div className="space-y-3 border-t border-gray-100 pt-3 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <ListTodo className="text-primary-500 h-4 w-4" />
                주요 업무
              </label>
              <button
                type="button"
                onClick={handleAddTask}
                className="text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                업무 추가
              </button>
            </div>
            {project.tasks.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-200 py-4 text-center text-xs text-gray-400 dark:border-gray-600">
                업무를 추가해주세요
              </p>
            ) : (
              <div className="space-y-2">
                {project.tasks.map((task, index) => (
                  <TaskEditor
                    key={index}
                    task={task}
                    onChange={(t) => handleUpdateTask(index, t)}
                    onRemove={() => handleRemoveTask(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 이미지 */}
          <div className="space-y-3 border-t border-gray-100 pt-3 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <ImageIcon className="text-primary-500 h-4 w-4" />
                이미지
                {project.images && project.images.length > 1 && (
                  <span className="text-xs font-normal text-gray-400">(드래그하여 순서 변경)</span>
                )}
              </label>
              <button
                type="button"
                onClick={() => setImageModalOpen(true)}
                className="text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                이미지 추가
              </button>
            </div>
            {project.images && project.images.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleImageDragEnd}
              >
                <SortableContext
                  items={(project.images || []).map((_, i) => `image-${i}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-wrap gap-3">
                    {project.images.map((url, index) => (
                      <SortableImageItem
                        key={`image-${index}`}
                        id={`image-${index}`}
                        url={url}
                        index={index}
                        onRemove={() => handleRemoveImage(index)}
                        onPreview={() => setPreviewImage(url)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <p className="rounded-lg border border-dashed border-gray-200 py-4 text-center text-xs text-gray-400 dark:border-gray-600">
                이미지를 추가해주세요
              </p>
            )}
          </div>

          <ImageUploadModal
            isOpen={imageModalOpen}
            onClose={() => setImageModalOpen(false)}
            onSelect={handleAddImage}
            folder="resume"
            title="경력 이미지 업로드"
          />

          {/* 이미지 미리보기 모달 */}
          {previewImage && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
              onClick={() => setPreviewImage(null)}
            >
              <div className="relative max-h-[90vh] max-w-4xl p-4">
                <button
                  onClick={() => setPreviewImage(null)}
                  className="absolute -top-2 -right-2 rounded-full bg-white p-2 shadow-lg transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <img
                  src={previewImage}
                  alt="Preview"
                  className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface TaskEditorProps {
  task: ProjectTask;
  onChange: (task: ProjectTask) => void;
  onRemove: () => void;
}

function TaskEditor({ task, onChange, onRemove }: TaskEditorProps) {
  return (
    <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-800">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={task.title}
          onChange={(e) => onChange({ ...task, title: e.target.value })}
          className={`${inputClassName} text-sm`}
          placeholder="업무 제목"
        />
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 p-1 text-gray-400 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <StringArrayField
        label="상세 내용"
        items={task.items}
        onChange={(items) => onChange({ ...task, items })}
        placeholder="상세 내용 입력"
        addLabel="추가"
      />
    </div>
  );
}
