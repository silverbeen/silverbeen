'use client';

import { useState } from 'react';
import type { Project, ProjectTask } from '@silverbeen/types';
import { ChevronDown, ChevronUp, FolderOpen, ListTodo, Plus, Trash2 } from 'lucide-react';
import { FormField, inputClassName, AutoTextarea } from '../../FormField';
import { SortableImageList } from '../../SortableImageList';
import { TaskEditor } from './TaskEditor';
import { getItemId, withId } from '@/utils/ids';

interface ExperienceProjectCardProps {
  project: Project;
  onChange: (project: Project) => void;
  onRemove: () => void;
}

export function ExperienceProjectCard({ project, onChange, onRemove }: ExperienceProjectCardProps) {
  const [expanded, setExpanded] = useState(true);

  const handleChange = <K extends keyof Project>(key: K, value: Project[K]) => {
    onChange({ ...project, [key]: value });
  };

  const handleAddTask = () => {
    handleChange('tasks', [...project.tasks, withId<ProjectTask>({ title: '', items: [] })]);
  };

  const handleUpdateTask = (id: string, task: ProjectTask) => {
    handleChange(
      'tasks',
      project.tasks.map((t) => (getItemId(t) === id ? task : t)),
    );
  };

  const handleRemoveTask = (id: string) => {
    handleChange(
      'tasks',
      project.tasks.filter((t) => getItemId(t) !== id),
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
                {project.tasks.map((task) => {
                  const taskId = getItemId(task);
                  return (
                    <TaskEditor
                      key={taskId}
                      task={task}
                      onChange={(t) => handleUpdateTask(taskId, t)}
                      onRemove={() => handleRemoveTask(taskId)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* 이미지 */}
          <SortableImageList
            images={project.images ?? []}
            onChange={(images) => handleChange('images', images)}
            folder="resume"
            uploadTitle="경력 이미지 업로드"
            previewLabel={project.name || '프로젝트'}
            className="border-t border-gray-100 pt-3 dark:border-gray-700"
          />
        </div>
      )}
    </div>
  );
}
