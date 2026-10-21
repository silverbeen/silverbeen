'use client';

import type { PortfolioProject } from '@silverbeen/types';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Link as LinkIcon } from 'lucide-react';
import { SortableLinkItem } from '../SortableItems';
import { useDndSensors } from '@/hooks/useDndSensors';
import { getItemId, moveItemById, withId } from '@/utils/ids';

type ProjectLink = NonNullable<PortfolioProject['links']>[number];

interface ProjectLinksSectionProps {
  project: PortfolioProject;
  onChange: <K extends keyof PortfolioProject>(key: K, value: PortfolioProject[K]) => void;
}

export function ProjectLinksSection({ project, onChange }: ProjectLinksSectionProps) {
  const sensors = useDndSensors();
  const links = project.links ?? [];
  const ids = links.map(getItemId);

  const handleAdd = () => {
    onChange('links', [...links, withId<ProjectLink>({ label: '', url: '' })]);
  };

  const handleUpdate = (id: string, updated: ProjectLink) => {
    onChange(
      'links',
      links.map((link) => (getItemId(link) === id ? updated : link)),
    );
  };

  const handleRemove = (id: string) => {
    onChange(
      'links',
      links.filter((link) => getItemId(link) !== id),
    );
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    const reordered = moveItemById(links, String(active.id), String(over.id));
    if (reordered) onChange('links', reordered);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h5 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <LinkIcon className="text-primary-500 h-4 w-4" />
            링크
          </h5>
          {links.length > 1 && <span className="text-xs text-gray-400">드래그하여 순서 변경</span>}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          링크 추가
        </button>
      </div>
      {links.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-gray-200 py-4 text-center text-sm text-gray-400 dark:border-gray-600">
          GitHub, 배포 URL 등 관련 링크를 추가해주세요
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {links.map((link, index) => (
                <SortableLinkItem
                  key={ids[index]}
                  id={ids[index]}
                  link={link}
                  onUpdate={(updated) => handleUpdate(ids[index], updated)}
                  onRemove={() => handleRemove(ids[index])}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
