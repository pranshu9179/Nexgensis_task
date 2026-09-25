import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2, Star } from 'lucide-react';

/**
 * Desktop product table (hidden below `md` breakpoint).
 *
 * Reads from the same `products` array as ProductCards — no separate fetch.
 * Each row links to the detail page and has edit/delete action buttons.
 */
export default function ProductTable({ products, onDelete, page = 1, pageSize = 10 }) {
  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80">
            <th className="text-center px-3 py-3 font-semibold text-gray-500 w-12">#</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-600">Price</th>
            <th className="text-center px-4 py-3 font-semibold text-gray-600">Rating</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-600">Stock</th>
            <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((product, index) => {
            const rowNumber = (page - 1) * pageSize + index + 1;
            return (
              <tr key={product.id} className="hover:bg-brand-50/40 transition-colors">
                {/* Numbering */}
                <td className="px-3 py-3 text-center text-xs font-semibold text-gray-400">
                  {rowNumber}
                </td>

                {/* Product: image + title */}
                <td className="px-4 py-3">
                  <Link
                    to={`/products/${product.id}`}
                    className="flex items-center gap-3 group"
                  >
                  <img
                    src={product.thumbnail || product.images?.[0]}
                    alt={product.title}
                    className="w-10 h-10 rounded-lg object-cover border border-gray-100
                               group-hover:ring-2 group-hover:ring-brand-200 transition-all"
                  />
                  <span className="font-medium text-gray-800 group-hover:text-brand-600 transition-colors">
                    {product.title}
                  </span>
                </Link>
              </td>

              {/* Category */}
              <td className="px-4 py-3">
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full
                                 bg-brand-50 text-brand-700 capitalize">
                  {product.category}
                </span>
              </td>

              {/* Price */}
              <td className="px-4 py-3 text-right font-semibold text-gray-700">
                ${Number(product.price || 0).toFixed(2)}
              </td>

              {/* Rating */}
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center gap-1 text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {product.rating ? Number(product.rating).toFixed(1) : '—'}
                </span>
              </td>

              {/* Stock */}
              <td className="px-4 py-3 text-right">
                <span className={`font-medium ${product.stock > 0 ? 'text-success-500' : 'text-danger-500'}`}>
                  {product.stock}
                </span>
              </td>

              {/* Actions */}
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-1">
                  <Link
                    to={`/products/${product.id}`}
                    className="p-2 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50
                               transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/products/${product.id}/edit`}
                    className="p-2 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50
                               transition-colors"
                    title="Edit product"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => onDelete(product)}
                    className="p-2 rounded-md text-gray-400 hover:text-danger-500 hover:bg-red-50
                               transition-colors cursor-pointer"
                    title="Delete product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
      </table>
    </div>
  );
}
