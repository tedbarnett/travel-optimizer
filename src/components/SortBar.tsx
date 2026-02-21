import type { SortField } from '../types';

interface Props {
  sortField: SortField;
  onSortChange: (field: SortField) => void;
  resultCount: number;
  totalCount: number;
}

const sortOptions: { value: SortField; label: string }[] = [
  { value: 'effective_cost', label: 'Effective Cost' },
  { value: 'price', label: 'Price' },
  { value: 'duration', label: 'Duration' },
  { value: 'departure', label: 'Departure Time' },
];

export default function SortBar({ sortField, onSortChange, resultCount, totalCount }: Props) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-gray-600">
        {resultCount === totalCount
          ? `${resultCount} flights`
          : `${resultCount} of ${totalCount} flights`}
      </span>
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-500 mr-1">Sort by:</span>
        {sortOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              sortField === opt.value
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
