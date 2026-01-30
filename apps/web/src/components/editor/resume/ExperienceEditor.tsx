'use client';

import { useState } from 'react';
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

export function ExperienceEditor({ data, onChange }: ExperienceEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const handleAdd = () => {
    const newExp: Experience = {
      company: '',
      startDate: '',
      techStack: [],
      projects: [],
    };
    onChange([...data, newExp]);
    setExpandedIndex(data.length);
  };

  const handleRemove = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const handleUpdate = (index: number, updated: Experience) => {
    onChange(data.map((item, i) => (i === index ? updated : item)));
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary-500" />
            경력
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            경력 사항을 시간순으로 정리해주세요
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30"
        >
          <Plus className="h-4 w-4" />
          경력 추가
        </button>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50">
          <Building2 className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            경력을 추가해주세요
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
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
            getKey={(_, index) => `exp-${index}`}
            onReorder={onChange}
            renderItem={(exp, index) => (
              <ExperienceCard
                experience={exp}
                expanded={expandedIndex === index}
                onToggle={() =>
                  setExpandedIndex(expandedIndex === index ? null : index)
                }
                onChange={(updated) => handleUpdate(index, updated)}
                onRemove={() => handleRemove(index)}
              />
            )}
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
  const handleChange = <K extends keyof Experience>(
    key: K,
    value: Experience[K]
  ) => {
    onChange({ ...experience, [key]: value });
  };

  const handleAddProject = () => {
    const newProject: Project = {
      name: '',
      description: '',
      role: '',
      tasks: [],
    };
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
      experience.projects.filter((_, i) => i !== index)
    );
  };

  const projectCount = experience.projects.length;

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* 헤더 */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
            <Building2 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
              {experience.company || '새 경력'}
            </h4>
            <div className="flex items-center gap-3 mt-1">
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
            <span className="px-3 py-1 text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full">
              프로젝트 {projectCount}개
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div
            className={`p-2 rounded-lg transition-colors ${
              expanded
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'text-gray-400'
            }`}
          >
            {expanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      {expanded && (
        <div className="p-6 space-y-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          {/* 기본 정보 섹션 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary-500" />
              회사 정보
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-primary-500" />
                프로젝트
              </h5>
              <button
                type="button"
                onClick={handleAddProject}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                프로젝트 추가
              </button>
            </div>

            {experience.projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                <FolderOpen className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  프로젝트를 추가해주세요
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {experience.projects.map((project, index) => (
                  <ProjectCard
                    key={index}
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600"
    >
      {/* 드래그 핸들 */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 z-10 p-1 bg-black/50 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-3 w-3 text-white" />
      </div>
      <img
        src={url}
        alt={`Project ${index + 1}`}
        className="w-24 h-24 object-cover cursor-pointer"
        onClick={onPreview}
      />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors pointer-events-auto"
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
    })
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
      project.tasks.filter((_, i) => i !== index)
    );
  };

  const handleAddImage = (url: string) => {
    handleChange('images', [...(project.images || []), url]);
  };

  const handleRemoveImage = (index: number) => {
    handleChange(
      'images',
      (project.images || []).filter((_, i) => i !== index)
    );
  };

  const taskCount = project.tasks.length;
  const imageCount = project.images?.length || 0;

  return (
    <div className="border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <FolderOpen className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {project.name || '새 프로젝트'}
            </span>
            {(taskCount > 0 || imageCount > 0) && (
              <div className="flex items-center gap-2 mt-0.5">
                {taskCount > 0 && (
                  <span className="text-xs text-gray-400">업무 {taskCount}개</span>
                )}
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
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div
            className={`p-1.5 rounded-lg ${
              expanded ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-4 pt-0 space-y-4 border-t border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
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
          <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-primary-500" />
                주요 업무
              </label>
              <button
                type="button"
                onClick={handleAddTask}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                업무 추가
              </button>
            </div>
            {project.tasks.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center border border-dashed border-gray-200 dark:border-gray-600 rounded-lg">
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
          <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary-500" />
                이미지
                {project.images && project.images.length > 1 && (
                  <span className="text-xs font-normal text-gray-400">
                    (드래그하여 순서 변경)
                  </span>
                )}
              </label>
              <button
                type="button"
                onClick={() => setImageModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
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
              <p className="text-xs text-gray-400 py-4 text-center border border-dashed border-gray-200 dark:border-gray-600 rounded-lg">
                이미지를 추가해주세요
              </p>
            )}
          </div>

          <ImageUploadModal
            isOpen={imageModalOpen}
            onClose={() => setImageModalOpen(false)}
            onSelect={handleAddImage}
            folder="projects"
            title="프로젝트 이미지 업로드"
          />

          {/* 이미지 미리보기 모달 */}
          {previewImage && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
              onClick={() => setPreviewImage(null)}
            >
              <div className="relative max-w-4xl max-h-[90vh] p-4">
                <button
                  onClick={() => setPreviewImage(null)}
                  className="absolute -top-2 -right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <img
                  src={previewImage}
                  alt="Preview"
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
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
    <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 space-y-2">
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
          className="p-1 text-gray-400 hover:text-red-500 shrink-0"
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
