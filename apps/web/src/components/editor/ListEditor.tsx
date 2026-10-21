'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Plus } from 'lucide-react';
import { SortableList } from './SortableList';
import { getItemId, withId } from '@/utils/ids';

export interface ListItemActions<T> {
  /** 항목의 안정적인 ID (`_id`) */
  id: string;
  index: number;
  update: (item: T) => void;
  remove: () => void;
}

interface ListEditorProps<T extends object> {
  items: T[];
  onChange: (items: T[]) => void;
  /** 새 항목 생성 (ID는 자동 부여) */
  createItem: () => T;
  title: string;
  description: string;
  icon: LucideIcon;
  /** 추가 버튼 라벨 (예: '수상 추가') */
  addLabel: string;
  /** 개수 표시 단위 (예: '수상' → '3개의 수상') */
  itemUnit: string;
  emptyTitle: string;
  emptyDescription: string;
  /** 새 항목이 추가된 직후 호출 (예: 새 항목 펼치기) */
  onAdded?: (id: string) => void;
  renderItem: (item: T, actions: ListItemActions<T>) => ReactNode;
}

/**
 * 헤더 + 빈 상태 + 드래그 정렬 리스트로 구성된 공통 배열 에디터.
 * 각 항목은 `_id`(utils/ids)로 식별하므로 순서 변경/삭제 시에도 key가 유지된다
 */
export function ListEditor<T extends object>({
  items,
  onChange,
  createItem,
  title,
  description,
  icon: Icon,
  addLabel,
  itemUnit,
  emptyTitle,
  emptyDescription,
  onAdded,
  renderItem,
}: ListEditorProps<T>) {
  const handleAdd = () => {
    const newItem = withId(createItem());
    onChange([...items, newItem]);
    onAdded?.(getItemId(newItem));
  };

  const handleUpdate = (id: string, updated: T) => {
    // 카드가 `_id` 없이 새 객체를 넘겨도 ID 유지
    onChange(items.map((item) => (getItemId(item) === id ? { ...updated, _id: id } : item)));
  };

  const handleRemove = (id: string) => {
    onChange(items.filter((item) => getItemId(item) !== id));
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <Icon className="text-primary-500 h-5 w-5" />
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="bg-primary-500 shadow-primary-500/25 hover:bg-primary-600 hover:shadow-primary-500/30 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-16 dark:border-gray-700 dark:bg-gray-800/50">
          <Icon className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="font-medium text-gray-500 dark:text-gray-400">{emptyTitle}</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">{emptyDescription}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">
              {items.length}개의 {itemUnit}
            </span>
            <span>•</span>
            <span>드래그하여 순서 변경</span>
          </div>
          <SortableList
            items={items}
            onReorder={onChange}
            renderItem={(item, index) => {
              const id = getItemId(item);
              return renderItem(item, {
                id,
                index,
                update: (updated) => handleUpdate(id, updated),
                remove: () => handleRemove(id),
              });
            }}
          />
        </div>
      )}
    </div>
  );
}
