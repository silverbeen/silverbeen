'use client';

import type { GrowthExperience } from '@/types/portfolio';
import { inputClassName, AutoTextarea } from '../FormField';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Tag, Link as LinkIcon } from 'lucide-react';

// Sortable Growth Item 컴포넌트
interface SortableGrowthItemProps {
  id: string;
  growth: GrowthExperience;
  onUpdate: (growth: GrowthExperience) => void;
  onRemove: () => void;
}

export function SortableGrowthItem({
  id,
  growth,
  onUpdate,
  onRemove,
}: SortableGrowthItemProps) {
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 space-y-3 ${
        isDragging ? 'opacity-50 shadow-lg z-50' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="p-1.5 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <input
          type="text"
          value={growth.title}
          onChange={(e) => onUpdate({ ...growth, title: e.target.value })}
          className={inputClassName}
          placeholder="제목"
        />
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg shrink-0 transition-all"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <AutoTextarea
        value={growth.content}
        onChange={(e) => onUpdate({ ...growth, content: e.target.value })}
        placeholder="내용"
        minRows={2}
        maxRows={6}
      />
    </div>
  );
}

// Sortable Link Item 컴포넌트
interface SortableLinkItemProps {
  id: string;
  link: { label: string; url: string };
  onUpdate: (link: { label: string; url: string }) => void;
  onRemove: () => void;
}

export function SortableLinkItem({
  id,
  link,
  onUpdate,
  onRemove,
}: SortableLinkItemProps) {
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 ${
        isDragging ? 'opacity-50 shadow-lg z-50' : ''
      }`}
    >
      <button
        type="button"
        className="p-1.5 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={link.label}
            onChange={(e) => onUpdate({ ...link, label: e.target.value })}
            className={`${inputClassName} pl-10`}
            placeholder="GitHub, Demo, Figma 등"
          />
        </div>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="url"
            value={link.url}
            onChange={(e) => onUpdate({ ...link, url: e.target.value })}
            className={`${inputClassName} pl-10`}
            placeholder="https://github.com/..."
          />
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg shrink-0 transition-all"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// Sortable Image Item 컴포넌트
interface SortableImageItemProps {
  id: string;
  url: string;
  index: number;
  onRemove: () => void;
}

export function SortableImageItem({
  id,
  url,
  index,
  onRemove,
}: SortableImageItemProps) {
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 ${
        isDragging ? 'opacity-50 shadow-lg z-50' : ''
      }`}
    >
      <img
        src={url}
        alt={`Project ${index + 1}`}
        className="w-24 h-24 object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          type="button"
          className="pointer-events-auto p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="pointer-events-auto p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
