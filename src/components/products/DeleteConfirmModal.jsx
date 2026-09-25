import { AlertTriangle, Loader2, X } from 'lucide-react';

/**
 * Custom delete confirmation modal.
 *
 * Uses a `<dialog>`-style overlay instead of the browser's native `confirm()`
 * as required by the assignment. Fits small screens without horizontal scroll.
 */
export default function DeleteConfirmModal({ product, isDeleting, onConfirm, onCancel }) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4
                      animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400
                     hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto">
          <AlertTriangle className="w-6 h-6 text-danger-500" />
        </div>

        {/* Message */}
        <div className="text-center space-y-1">
          <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
          <p className="text-sm text-gray-500">
            Delete <span className="font-medium text-gray-700">"{product.title}"</span>?
            This can't be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100
                       rounded-lg hover:bg-gray-200 transition-colors cursor-pointer
                       disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium
                       text-white bg-danger-500 rounded-lg hover:bg-danger-600
                       transition-colors cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting…
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
