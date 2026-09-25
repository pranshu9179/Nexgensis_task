import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Catch-all 404 page for unmatched routes.
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="text-7xl mb-4">🚀</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-6 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/products"
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold
                   text-white bg-brand-500 rounded-xl hover:bg-brand-600
                   active:scale-[0.98] transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>
    </div>
  );
}
