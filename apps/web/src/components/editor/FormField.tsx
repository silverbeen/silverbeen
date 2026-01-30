'use client';

import {
  type ReactNode,
  useRef,
  useEffect,
  type TextareaHTMLAttributes,
} from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  description?: string;
  children: ReactNode;
}

export function FormField({
  label,
  error,
  required,
  description,
  children,
}: FormFieldProps) {
  // label이 비어있으면 라벨 영역 숨김
  if (!label) {
    return (
      <div className="space-y-1.5">
        {children}
        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && (
          <span className="text-xs text-red-500 font-normal">필수</span>
        )}
      </label>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
          {description}
        </p>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
          {error}
        </p>
      )}
    </div>
  );
}

// 공통 입력 스타일 - 개선된 버전
export const inputClassName =
  'w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200';

export const textareaClassName =
  'w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-gray-300 dark:hover:border-gray-500 resize-none transition-all duration-200';

// AutoTextarea 컴포넌트 - 자동 높이 조절
interface AutoTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'style'> {
  minRows?: number;
  maxRows?: number;
}

export function AutoTextarea({
  minRows = 3,
  maxRows = 10,
  value,
  onChange,
  className = '',
  ...props
}: AutoTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // 일시적으로 높이를 auto로 설정하여 scrollHeight 계산
    textarea.style.height = 'auto';

    // 라인 높이 계산 (대략적인 값)
    const lineHeight = 24;
    const minHeight = minRows * lineHeight + 24; // padding 포함
    const maxHeight = maxRows * lineHeight + 24;

    const newHeight = Math.min(
      Math.max(textarea.scrollHeight, minHeight),
      maxHeight
    );
    textarea.style.height = `${newHeight}px`;
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      className={`${textareaClassName} overflow-y-auto ${className}`}
      style={{ minHeight: `${minRows * 24 + 24}px` }}
      {...props}
    />
  );
}
