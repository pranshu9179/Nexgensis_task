import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2, Star } from 'lucide-react';

/**
 * Mobile card view for products (shown below `md` breakpoint).
 *
 * Uses the same `products` array as ProductTable — no double-fetch.
 * Each card is a full-width stack with the same six data fields.
 */
export default function ProductCards({ products, onDelete }) {
  return (
    <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden
                     hover:shadow-md transition-shadow"
        >
          {/* Product image */}
          <Link to={`/products/${product.id}`}>
            <img
              src={product.thumbnail || product.images?.[0]}
              alt={product.title}
              className="w-full h-40 object-cover"
            />
          </Link>

          <div className="p-4 space-y-3">
            {/* Title + category */}
            <div>
              <Link
                to={`/products/${product.id}`}
                className="text-base font-semibold text-gray-800 hover:text-brand-600
                           transition-colors line-clamp-1"
              >
                {product.title}
              </Link>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full
                               bg-brand-50 text-brand-700 capitalize">
                {product.category}
              </span>
            </div>

            {/* Stats row: price, rating, stock */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-gray-800 text-lg">
                ${Number(product.price || 0).toFixed(2)}
              </span>
              <span className="inline-flex items-center gap-1 text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {product.rating ? Number(product.rating).toFixed(1) : '—'}
              </span>
              <span className={`font-medium ${product.stock > 0 ? 'text-success-500' : 'text-danger-500'}`}>
                {product.stock} in stock
              </span>
            </div>

            {/* Action buttons — sized for touch targets (≥ 44px) */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <Link
                to={`/products/${product.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm
                           font-medium text-brand-600 bg-brand-50 rounded-lg
                           hover:bg-brand-100 transition-colors"
              >
                <Eye className="w-4 h-4" />
                View
              </Link>
              <Link
                to={`/products/${product.id}/edit`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm
                           font-medium text-gray-600 bg-gray-50 rounded-lg
                           hover:bg-gray-100 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Link>
              <button
                onClick={() => onDelete(product)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm
                           font-medium text-danger-500 bg-red-50 rounded-lg
                           hover:bg-red-100 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
