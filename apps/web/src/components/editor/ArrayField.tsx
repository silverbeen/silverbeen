'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
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

interface ArrayFieldProps<T> {
  label: string;
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItem: (item: T, index: number) => ReactNode;
  addLabel?: string;
  emptyMessage?: string;
}

export function ArrayField<T>({
  label,
  items,
  onAdd,
  onRemove,
  renderItem,
  addLabel = '추가',
  emptyMessage = '항목이 없습니다.',
}: ArrayFieldProps<T>) {
  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1.5 px-2.5 py-1 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            {addLabel}
          </button>
        </div>
      )}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {emptyMessage}
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="mt-2 flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            {addLabel}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2 group">
              <div className="flex-1">{renderItem(item, index)}</div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                title="삭제"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 드래그 가능한 스킬 칩 컴포넌트
interface SortableSkillChipProps {
  id: string;
  skill: string;
  onRemove: () => void;
}

function SortableSkillChip({ id, skill, onRemove }: SortableSkillChipProps) {
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
      className={`
        inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium
        bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300
        border border-primary-200 dark:border-primary-800
        ${isDragging ? 'opacity-50 shadow-lg z-50' : ''}
        group
      `}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing text-primary-400 hover:text-primary-600 -ml-1"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <span>{skill}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 p-0.5 text-primary-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

// DnD 지원 스킬 배열 필드
interface StringArrayFieldProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}

export function StringArrayField({
  label,
  items,
  onChange,
  placeholder = '입력하세요',
  addLabel = '추가',
}: StringArrayFieldProps) {
  const [inputValue, setInputValue] = useState('');

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

  const handleAdd = () => {
    if (inputValue.trim()) {
      onChange([...items, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((_, i) => `skill-${i}` === active.id);
      const newIndex = items.findIndex((_, i) => `skill-${i}` === over.id);
      onChange(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {/* 스킬 칩 목록 (DnD) */}
      {items.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((_, i) => `skill-${i}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-wrap gap-2">
              {items.map((skill, index) => (
                <SortableSkillChip
                  key={`skill-${index}`}
                  id={`skill-${index}`}
                  skill={skill}
                  onRemove={() => handleRemove(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* 입력 필드 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 text-sm"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          기술명을 입력하고 Enter 또는 추가 버튼을 눌러주세요
        </p>
      )}
    </div>
  );
}
