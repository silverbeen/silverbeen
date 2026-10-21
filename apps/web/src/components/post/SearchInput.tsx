'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = '검색어를 입력하세요...' }: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [lastEmitted, setLastEmitted] = useState(value);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 외부(URL 뒤로가기 등)에서 value가 바뀐 경우에만 입력값 동기화.
  // 내가 보낸 값이 반영된 경우는 그 사이 추가 입력을 덮어쓰지 않도록 건너뜀
  if (value !== prevValue) {
    setPrevValue(value);
    if (value !== lastEmitted) {
      setInputValue(value);
      setLastEmitted(value);
    }
  }

  const emit = (newValue: string) => {
    setLastEmitted(newValue);
    onChange(newValue);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (newValue: string) => {
    setInputValue(newValue);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      emit(newValue.trim());
    }, 300);
  };

  const handleClear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setInputValue('');
    emit('');
  };

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        aria-label="블로그 검색"
        className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-10 text-sm text-gray-700 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:placeholder-gray-500"
      />
      {inputValue && (
        <button
          onClick={handleClear}
          aria-label="검색어 지우기"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
