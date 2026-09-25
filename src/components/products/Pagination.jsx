import { ChevronLeft, ChevronRight } from 'lucide-react';
import { VALID_PAGE_SIZES } from '../../utils/urlParams';

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const skip = (page - 1) * pageSize;
  const showingStart = total === 0 ? 0 : skip + 1;
  const showingEnd = Math.min(skip + pageSize, total);

  const pageButtons = buildPageButtons(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span>
          Showing <span className="font-medium text-gray-700">{showingStart}–{showingEnd}</span> of{' '}
          <span className="font-medium text-gray-700">{total}</span>
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="appearance-none px-2 py-1 text-sm border border-gray-200 rounded-md
                     bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 cursor-pointer"
        >
          {VALID_PAGE_SIZES.map((size) => (
            <option key={size} value={size}>{size} / page</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30
                     disabled:cursor-not-allowed cursor-pointer transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageButtons.map((item, idx) =>
          item === '...' ? (
            <span key={`dots-${idx}`} className="px-2 py-1 text-sm text-gray-400 select-none">
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={`min-w-[36px] h-9 px-2 text-sm font-medium rounded-lg transition-colors cursor-pointer
                ${
                  item === page
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              {item}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30
                     disabled:cursor-not-allowed cursor-pointer transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function buildPageButtons(current, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set([1, totalPages, current - 1, current, current + 1]);

  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push('...');
    }
    result.push(sorted[i]);
  }

  return result;
}
