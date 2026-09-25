import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Shown when a fetch fails. The `onRetry` callback re-runs the exact
 * request that failed, so the user doesn't have to refresh the page.
 */
export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-500">
      <AlertTriangle className="w-12 h-12 text-danger-500" />
      <p className="text-base font-medium text-gray-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                     bg-brand-500 rounded-lg hover:bg-brand-600 active:scale-95
                     transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      )}
    </div>
  );
}
