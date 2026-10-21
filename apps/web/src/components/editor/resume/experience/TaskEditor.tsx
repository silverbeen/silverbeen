'use client';

import type { ProjectTask } from '@silverbeen/types';
import { Trash2 } from 'lucide-react';
import { inputClassName } from '../../FormField';
import { StringArrayField } from '../../StringArrayField';

interface TaskEditorProps {
  task: ProjectTask;
  onChange: (task: ProjectTask) => void;
  onRemove: () => void;
}

export function TaskEditor({ task, onChange, onRemove }: TaskEditorProps) {
  return (
    <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-800">
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
          className="shrink-0 p-1 text-gray-400 hover:text-red-500"
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
