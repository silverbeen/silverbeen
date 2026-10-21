'use client';

import type { ReactNode } from 'react';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useDndSensors } from '@/hooks/useDndSensors';
import { getItemId, moveItemById } from '@/utils/ids';

interface SortableItemProps {
  id: string;
  children: ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  // dnd-kit 동적 transform/transition은 인라인 스타일 허용
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2">
      <button
        type="button"
        aria-label="드래그하여 순서 변경"
        className="mt-2 shrink-0 cursor-grab p-1.5 text-gray-400 transition-colors hover:text-gray-600 active:cursor-grabbing dark:hover:text-gray-300"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1">{children}</div>
    </div>
  );
}

interface SortableListProps<T extends object> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  /** 항목의 안정적인 key (기본: `_id`, utils/ids 참고) */
  getKey?: (item: T) => string;
}

export function SortableList<T extends object>({
  items,
  onReorder,
  renderItem,
  getKey = getItemId,
}: SortableListProps<T>) {
  const sensors = useDndSensors();
  const keys = items.map(getKey);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    const reordered = moveItemById(items, String(active.id), String(over.id), getKey);
    if (reordered) onReorder(reordered);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={keys} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {items.map((item, index) => (
            <SortableItem key={keys[index]} id={keys[index]}>
              {renderItem(item, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
