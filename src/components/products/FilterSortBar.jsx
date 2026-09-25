import { SlidersHorizontal } from 'lucide-react';
import { VALID_SORT_FIELDS } from '../../utils/urlParams';

export default function FilterSortBar({
  categories,
  category,
  onCategoryChange,
  sortBy,
  order,
  onSortChange,
  onOrderChange,
  searchActive,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          disabled={searchActive}
          title={searchActive ? 'Clear search to filter by category' : 'Filter by category'}
          className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-white border border-gray-200
                     rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300
                     focus:border-brand-400 cursor-pointer
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        {searchActive && (
          <p className="absolute -bottom-5 left-0 text-[11px] text-amber-600 whitespace-nowrap">
            Clear search to filter
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <SlidersHorizontal className="w-4 h-4 text-gray-400" />
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="appearance-none pl-2 pr-7 py-2.5 text-sm bg-white border border-gray-200
                     rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300
                     focus:border-brand-400 cursor-pointer"
        >
          <option value="">Default Sort</option>
          {VALID_SORT_FIELDS.map((field) => (
            <option key={field} value={field}>
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {sortBy && (
        <button
          onClick={() => onOrderChange(order === 'asc' ? 'desc' : 'asc')}
          className="px-3 py-2.5 text-sm font-medium border border-gray-200 rounded-lg
                     bg-white hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
          title={`Sort ${order === 'asc' ? 'ascending' : 'descending'} — click to toggle`}
        >
          {order === 'asc' ? '↑ Asc' : '↓ Desc'}
        </button>
      )}
    </div>
  );
}
