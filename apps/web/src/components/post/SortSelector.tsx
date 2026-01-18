'use client';

export type SortByType = 'createdAt' | 'viewCount' | 'title';
export type OrderType = 'asc' | 'desc';

interface SortSelectorProps {
  sortBy: SortByType;
  order: OrderType;
  onSortChange: (sortBy: SortByType, order: OrderType) => void;
}

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: '최신순' },
  { value: 'createdAt-asc', label: '오래된순' },
  { value: 'viewCount-desc', label: '조회순' },
  { value: 'title-asc', label: '제목순' },
] as const;

export function SortSelector({ sortBy, order, onSortChange }: SortSelectorProps) {
  const currentValue = `${sortBy}-${order}`;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSortBy, newOrder] = e.target.value.split('-') as [SortByType, OrderType];
    onSortChange(newSortBy, newOrder);
  };

  return (
    <div className="relative">
      <select
        value={currentValue}
        onChange={handleChange}
        className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
