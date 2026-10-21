'use client';

import { useState } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDndSensors } from '@/hooks/useDndSensors';
import { useStableIds } from '@/hooks/useStableIds';

// 드래그 가능한 칩 컴포넌트
interface SortableChipProps {
  id: string;
  value: string;
  onRemove: () => void;
}

function SortableChip({ id, value, onRemove }: SortableChipProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  // dnd-kit 동적 transform/transition은 인라인 스타일 허용
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-300 inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium ${
        isDragging ? 'z-50 opacity-50 shadow-lg' : ''
      }`}
    >
      <button
        type="button"
        aria-label="드래그하여 순서 변경"
        className="text-primary-400 hover:text-primary-600 -ml-1 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <span>{value}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${value} 삭제`}
        className="text-primary-400 ml-0.5 rounded p-0.5 transition-colors hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

// DnD 지원 문자열 배열 필드 (칩 형태)
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
  const sensors = useDndSensors();
  // 문자열에는 ID를 담을 수 없으므로 별도의 안정적인 key 목록 유지
  const { ids, move, remove } = useStableIds(items.length);

  const handleAdd = () => {
    const value = inputValue.trim();
    if (!value) return;
    onChange([...items, value]);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 한글 IME 조합 중 Enter는 무시
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index: number) => {
    remove(index);
    onChange(items.filter((_, i) => i !== index));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    move(oldIndex, newIndex);
    onChange(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {/* 칩 목록 (DnD) */}
      {items.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={rectSortingStrategy}>
            <div className="flex flex-wrap gap-2">
              {items.map((value, index) => (
                <SortableChip
                  key={ids[index]}
                  id={ids[index]}
                  value={value}
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
          className="focus:border-primary-500 focus:ring-primary-500/20 flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300 focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:hover:border-gray-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          className="bg-primary-500 hover:bg-primary-600 flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          내용을 입력하고 Enter 또는 추가 버튼을 눌러주세요
        </p>
      )}
    </div>
  );
}
