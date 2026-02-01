'use client';

import { useState } from 'react';
import type {
  PortfolioProject,
  GrowthExperience,
  ProjectCategory,
} from '@/types/portfolio';
import { FormField, inputClassName, AutoTextarea } from '../FormField';
import { StringArrayField } from '../ArrayField';
import { SortableList } from '../SortableList';
import { ImageUploadModal } from '@/components/ui';
import {
  SortableGrowthItem,
  SortableLinkItem,
  SortableImageItem,
} from './SortableItems';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Image as ImageIcon,
  FolderOpen,
  Calendar,
  UserCircle,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';

interface ProjectEditorProps {
  data: PortfolioProject[];
  onChange: (data: PortfolioProject[]) => void;
}

const categoryOptions: { value: ProjectCategory; label: string }[] = [
  { value: 'personal', label: '개인 프로젝트' },
  { value: 'team', label: '팀 프로젝트' },
  { value: 'club', label: '동아리 프로젝트' },
];

// 고유 ID 생성 함수
const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// 프로젝트에 ID 부여 (없는 경우)
const ensureProjectId = (project: PortfolioProject): PortfolioProject & { _id: string } => ({
  ...project,
  _id: (project as PortfolioProject & { _id?: string })._id || generateId(),
});

export function ProjectEditor({ data, onChange }: ProjectEditorProps) {
  // 데이터에 ID 부여
  const projectsWithIds = data.map(ensureProjectId);
  const [expandedId, setExpandedId] = useState<string | null>(
    projectsWithIds[0]?._id || null
  );

  const handleAdd = () => {
    const newId = generateId();
    const newProject = {
      _id: newId,
      name: '',
      category: 'personal' as const,
      period: '',
      description: '',
      role: '',
      techStack: [],
      tasks: [],
    };
    onChange([...data, newProject]);
    setExpandedId(newId);
  };

  const handleRemove = (id: string) => {
    const index = projectsWithIds.findIndex((p) => p._id === id);
    if (index === -1) return;
    onChange(data.filter((_, i) => i !== index));
    if (expandedId === id) setExpandedId(null);
  };

  const handleUpdate = (id: string, updated: PortfolioProject) => {
    const index = projectsWithIds.findIndex((p) => p._id === id);
    if (index === -1) return;
    onChange(data.map((item, i) => (i === index ? updated : item)));
  };

  const handleReorder = (reordered: PortfolioProject[]) => {
    onChange(reordered);
    // expandedId는 ID 기반이므로 순서 변경 시에도 유지됨
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary-500" />
            프로젝트
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            진행한 프로젝트를 추가해주세요
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30"
        >
          <Plus className="h-4 w-4" />
          프로젝트 추가
        </button>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50">
          <FolderOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            프로젝트를 추가해주세요
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            프로젝트 정보, 기술 스택, 성과 등을 입력할 수 있습니다
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">{data.length}개의 프로젝트</span>
            <span>•</span>
            <span>드래그하여 순서 변경</span>
          </div>
          <SortableList
            items={projectsWithIds}
            getKey={(project) => project._id}
            onReorder={handleReorder}
            renderItem={(project) => (
              <ProjectCard
                project={project}
                expanded={expandedId === project._id}
                onToggle={() =>
                  setExpandedId(expandedId === project._id ? null : project._id)
                }
                onChange={(updated) => handleUpdate(project._id, updated)}
                onRemove={() => handleRemove(project._id)}
              />
            )}
          />
        </div>
      )}
    </div>
  );
}

interface ProjectCardProps {
  project: PortfolioProject;
  expanded: boolean;
  onToggle: () => void;
  onChange: (project: PortfolioProject) => void;
  onRemove: () => void;
}

function ProjectCard({
  project,
  expanded,
  onToggle,
  onChange,
  onRemove,
}: ProjectCardProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleChange = <K extends keyof PortfolioProject>(
    key: K,
    value: PortfolioProject[K]
  ) => {
    onChange({ ...project, [key]: value });
  };

  const handleAddGrowth = () => {
    const newGrowth: GrowthExperience = { title: '', content: '' };
    handleChange('growthExperience', [
      ...(project.growthExperience || []),
      newGrowth,
    ]);
  };

  const handleUpdateGrowth = (index: number, growth: GrowthExperience) => {
    const newGrowths = [...(project.growthExperience || [])];
    newGrowths[index] = growth;
    handleChange('growthExperience', newGrowths);
  };

  const handleRemoveGrowth = (index: number) => {
    handleChange(
      'growthExperience',
      (project.growthExperience || []).filter((_, i) => i !== index)
    );
  };

  const handleGrowthDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const growths = project.growthExperience || [];
      const oldIndex = growths.findIndex(
        (_, i) => `growth-${i}` === active.id
      );
      const newIndex = growths.findIndex((_, i) => `growth-${i}` === over.id);
      handleChange('growthExperience', arrayMove(growths, oldIndex, newIndex));
    }
  };

  const handleLinkDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const links = project.links || [];
      const oldIndex = links.findIndex((_, i) => `link-${i}` === active.id);
      const newIndex = links.findIndex((_, i) => `link-${i}` === over.id);
      handleChange('links', arrayMove(links, oldIndex, newIndex));
    }
  };

  const handleImageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const images = project.images || [];
      const oldIndex = images.findIndex((_, i) => `image-${i}` === active.id);
      const newIndex = images.findIndex((_, i) => `image-${i}` === over.id);
      handleChange('images', arrayMove(images, oldIndex, newIndex));
    }
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
  const linkCount = project.links?.length || 0;

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* 헤더 */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
            <FolderOpen className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                {project.name || '새 프로젝트'}
              </h4>
              <span className="px-2.5 py-0.5 text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full">
                {
                  categoryOptions.find((c) => c.value === project.category)
                    ?.label
                }
              </span>
              {project.hidden && (
                <span className="px-2.5 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
                  숨김
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>{project.period || '기간 미입력'}</span>
              </div>
              {(taskCount > 0 || imageCount > 0 || linkCount > 0) && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  {taskCount > 0 && (
                    <span className="text-xs text-gray-400">
                      작업 {taskCount}개
                    </span>
                  )}
                  {linkCount > 0 && (
                    <span className="text-xs text-gray-400">
                      링크 {linkCount}개
                    </span>
                  )}
                  {imageCount > 0 && (
                    <span className="text-xs text-gray-400">
                      이미지 {imageCount}개
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
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
              <FolderOpen className="h-4 w-4 text-primary-500" />
              프로젝트 정보
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="프로젝트명" required>
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={inputClassName}
                  placeholder="프로젝트명"
                />
              </FormField>

              <FormField label="카테고리" required>
                <select
                  value={project.category}
                  onChange={(e) =>
                    handleChange('category', e.target.value as ProjectCategory)
                  }
                  className={inputClassName}
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="기간" required>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={project.period}
                    onChange={(e) => handleChange('period', e.target.value)}
                    className={`${inputClassName} pl-10`}
                    placeholder="2023.01 ~ 2023.06"
                  />
                </div>
              </FormField>

              <FormField label="역할" required>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={project.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className={`${inputClassName} pl-10`}
                    placeholder="프론트엔드 개발"
                  />
                </div>
              </FormField>

              {project.category === 'club' && (
                <FormField label="동아리명">
                  <input
                    type="text"
                    value={project.clubName || ''}
                    onChange={(e) => handleChange('clubName', e.target.value)}
                    className={inputClassName}
                    placeholder="동아리명"
                  />
                </FormField>
              )}

              {project.category !== 'personal' && (
                <FormField label="팀 인원">
                  <input
                    type="number"
                    value={project.teamSize || ''}
                    onChange={(e) =>
                      handleChange(
                        'teamSize',
                        parseInt(e.target.value) || undefined
                      )
                    }
                    className={inputClassName}
                    placeholder="4"
                    min={1}
                  />
                </FormField>
              )}
            </div>

            <div className="mt-4">
              <FormField label="설명" required>
                <AutoTextarea
                  value={project.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="프로젝트에 대한 설명"
                  minRows={3}
                  maxRows={8}
                />
              </FormField>
            </div>
          </div>

          {/* 기술 스택 및 작업 섹션 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 space-y-4">
            <StringArrayField
              label="기술 스택"
              items={project.techStack}
              onChange={(items) => handleChange('techStack', items)}
              placeholder="React, TypeScript 등"
              addLabel="기술 추가"
            />

            <StringArrayField
              label="주요 작업"
              items={project.tasks}
              onChange={(items) => handleChange('tasks', items)}
              placeholder="작업 내용 입력"
              addLabel="작업 추가"
            />

            <StringArrayField
              label="성과"
              items={project.impact || []}
              onChange={(items) => handleChange('impact', items)}
              placeholder="성과 입력"
              addLabel="성과 추가"
            />
          </div>

          {/* 성장 경험 섹션 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary-500" />
                  성장 경험
                </h5>
                {(project.growthExperience || []).length > 1 && (
                  <span className="text-xs text-gray-400">
                    드래그하여 순서 변경
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleAddGrowth}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                추가
              </button>
            </div>
            {(project.growthExperience || []).length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl">
                성장 경험을 추가해주세요
              </p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleGrowthDragEnd}
              >
                <SortableContext
                  items={(project.growthExperience || []).map(
                    (_, i) => `growth-${i}`
                  )}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {(project.growthExperience || []).map((growth, index) => (
                      <SortableGrowthItem
                        key={`growth-${index}`}
                        id={`growth-${index}`}
                        growth={growth}
                        onUpdate={(updated) => handleUpdateGrowth(index, updated)}
                        onRemove={() => handleRemoveGrowth(index)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* 링크 섹션 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-primary-500" />
                  링크
                </h5>
                {(project.links || []).length > 1 && (
                  <span className="text-xs text-gray-400">
                    드래그하여 순서 변경
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() =>
                  handleChange('links', [
                    ...(project.links || []),
                    { label: '', url: '' },
                  ])
                }
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                링크 추가
              </button>
            </div>
            {(project.links || []).length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl">
                GitHub, 배포 URL 등 관련 링크를 추가해주세요
              </p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleLinkDragEnd}
              >
                <SortableContext
                  items={(project.links || []).map((_, i) => `link-${i}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {(project.links || []).map((link, index) => (
                      <SortableLinkItem
                        key={`link-${index}`}
                        id={`link-${index}`}
                        link={link}
                        onUpdate={(updated) => {
                          const newLinks = [...(project.links || [])];
                          newLinks[index] = updated;
                          handleChange('links', newLinks);
                        }}
                        onRemove={() =>
                          handleChange(
                            'links',
                            (project.links || []).filter((_, i) => i !== index)
                          )
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* 이미지 섹션 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary-500" />
                  이미지
                </h5>
                {(project.images || []).length > 1 && (
                  <span className="text-xs text-gray-400">
                    드래그하여 순서 변경
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setImageModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
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
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl">
                이미지를 추가해주세요
              </p>
            )}
          </div>

          {/* 표시 옵션 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              표시 옵션
            </h5>
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={project.hidden || false}
                  onChange={(e) => handleChange('hidden', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  숨기기
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={project.pdfHidden || false}
                  onChange={(e) => handleChange('pdfHidden', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  PDF에서 숨기기
                </span>
              </label>
            </div>
          </div>

          <ImageUploadModal
            isOpen={imageModalOpen}
            onClose={() => setImageModalOpen(false)}
            onSelect={handleAddImage}
            folder="portfolio"
            title="포트폴리오 이미지 업로드"
          />
        </div>
      )}
    </div>
  );
}

