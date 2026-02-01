'use client';

import { useEffect, useRef } from 'react';
import type { PortfolioProject } from '@/types/portfolio';
import { SortableLinkItem } from '../SortableItems';
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
import { Plus, Link as LinkIcon } from 'lucide-react';

// 링크에 ID를 포함한 타입
type LinkWithId = { id: string; label: string; url: string };

// 고유 ID 생성 함수
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// 링크 ID 가져오기
const getLinkId = (link: { label: string; url: string }): string => {
  return (link as LinkWithId).id || '';
};

interface ProjectLinksSectionProps {
  project: PortfolioProject;
  onChange: <K extends keyof PortfolioProject>(
    key: K,
    value: PortfolioProject[K]
  ) => void;
}

export function ProjectLinksSection({
  project,
  onChange,
}: ProjectLinksSectionProps) {
  const hasBackfilledIds = useRef(false);

  // ID가 없는 링크에 ID 부여하여 영속화
  useEffect(() => {
    if (hasBackfilledIds.current) return;
    if (!project.links?.length) {
      hasBackfilledIds.current = true;
      return;
    }

    const needsBackfill = project.links.some(
      (link) => !(link as LinkWithId).id
    );

    if (needsBackfill) {
      const updatedLinks = project.links.map((link) => {
        if ((link as LinkWithId).id) return link;
        return { ...link, id: generateId() };
      });
      hasBackfilledIds.current = true;
      onChange('links', updatedLinks);
    } else {
      hasBackfilledIds.current = true;
    }
  }, [project.links, onChange]);

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

  const handleAddLink = () => {
    const newLink = { id: generateId(), label: '', url: '' };
    onChange('links', [...(project.links || []), newLink]);
  };

  const handleUpdateLink = (
    id: string,
    updated: { label: string; url: string }
  ) => {
    const newLinks = (project.links || []).map((link) =>
      getLinkId(link) === id ? { ...updated, id } : link
    );
    onChange('links', newLinks);
  };

  const handleRemoveLink = (id: string) => {
    onChange(
      'links',
      (project.links || []).filter((link) => getLinkId(link) !== id)
    );
  };

  const handleLinkDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const links = project.links || [];
      const oldIndex = links.findIndex(
        (link) => getLinkId(link) === active.id
      );
      const newIndex = links.findIndex((link) => getLinkId(link) === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onChange('links', arrayMove(links, oldIndex, newIndex));
      }
    }
  };

  return (
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
          onClick={handleAddLink}
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
            items={(project.links || []).map((link) => getLinkId(link))}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {(project.links || []).map((link) => {
                const linkId = getLinkId(link);
                return (
                  <SortableLinkItem
                    key={linkId}
                    id={linkId}
                    link={link}
                    onUpdate={(updated) => handleUpdateLink(linkId, updated)}
                    onRemove={() => handleRemoveLink(linkId)}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
