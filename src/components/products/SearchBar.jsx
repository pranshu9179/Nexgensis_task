import { Search, X } from 'lucide-react';

/**
 * Controlled search input.
 *
 * The actual debouncing + API call happens in the parent (via useDebounce).
 * This component just renders the input and reports every keystroke upward
 * so the debounce logic has the raw, un-delayed value to work with.
 */
export default function SearchBar({ value, onChange, disabled = false }) {
  return (
    <div className="relative flex-1 min-w-0">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products…"
        disabled={disabled}
        className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-gray-200
                   rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300
                   focus:border-brand-400 placeholder:text-gray-400
                   disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {/* Clear button — only shows when there's text */}
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full
                     text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
