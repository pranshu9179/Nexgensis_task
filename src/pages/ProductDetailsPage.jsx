import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../api/productsApi';
import { ArrowLeft, Star, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import Loader from '../components/ui/Loader';
import ErrorState from '../components/ui/ErrorState';

/**
 * Product details page — `/products/:id`.
 *
 * Fetches the full product object including `images[]` and `reviews[]`.
 * An invalid id renders a dedicated Not Found view rather than crashing.
 */
export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  function fetchProduct(signal) {
    setLoading(true);
    setError(null);
    setNotFound(false);

    getProductById(id, signal)
      .then((data) => {
        setProduct(data);
        setActiveImageIndex(0);
      })
      .catch((err) => {
        if (err.code === 'ERR_CANCELED') return;
        // DummyJSON returns a 404-like error for invalid IDs — show Not Found
        if (err.response?.status === 404 || err.message?.toLowerCase().includes('not found')) {
          setNotFound(true);
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const controller = new AbortController();
    fetchProduct(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Loader />;

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="text-6xl">🔍</div>
        <h2 className="text-xl font-semibold text-gray-800">Product Not Found</h2>
        <p className="text-sm text-gray-500">
          No product with ID <code className="font-mono text-brand-600">{id}</code> exists.
        </p>
        <Link
          to="/products"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                     bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => fetchProduct()} />;
  }

  if (!product) return null;

  // Handle both images[] array and single thumbnail property
  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.thumbnail
        ? [product.thumbnail]
        : [];

  return (
    <div className="space-y-8">
      {/* ── Back link ── */}
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600
                   transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Image gallery ── */}
        <div className="space-y-3">
          {/* Main image */}
          <div className="relative aspect-square bg-white rounded-2xl border border-gray-200
                          overflow-hidden shadow-sm">
            {images.length > 0 && (
              <img
                src={images[activeImageIndex]}
                alt={`${product.title} — image ${activeImageIndex + 1}`}
                className="w-full h-full object-contain p-4"
              />
            )}

            {/* Image navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80
                             shadow-md hover:bg-white text-gray-600 cursor-pointer transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80
                             shadow-md hover:bg-white text-gray-600 cursor-pointer transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2
                              transition-colors cursor-pointer
                              ${idx === activeImageIndex
                                ? 'border-brand-500 ring-2 ring-brand-200'
                                : 'border-gray-200 hover:border-gray-300'
                              }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product info ── */}
        <div className="space-y-6">
          <div>
            <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full
                             bg-brand-50 text-brand-700 capitalize mb-2">
              {product.category}
            </span>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{product.title}</h1>
            {product.brand && (
              <p className="text-sm text-gray-500 mt-1">by {product.brand}</p>
            )}
          </div>

          {/* Price + rating */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            {product.discountPercentage > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold text-success-500 bg-green-50
                               rounded-full">
                -{product.discountPercentage.toFixed(0)}%
              </span>
            )}
            <span className="flex items-center gap-1 text-amber-600">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{product.rating?.toFixed(1)}</span>
            </span>
          </div>

          {/* Stock + metadata */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoCard label="Stock" value={product.stock} />
            <InfoCard label="SKU" value={product.sku || '—'} />
            <InfoCard label="Min. Order" value={product.minimumOrderQuantity || 1} />
            <InfoCard label="Warranty" value={product.warrantyInformation || '—'} />
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Edit link */}
          <Link
            to={`/products/${product.id}/edit`}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold
                       text-white bg-brand-500 rounded-xl hover:bg-brand-600
                       active:scale-[0.98] transition-all shadow-md shadow-brand-500/20"
          >
            <Pencil className="w-4 h-4" />
            Edit Product
          </Link>
        </div>
      </div>

      {/* ── Reviews section ── */}
      {product.reviews?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">
            Reviews ({product.reviews.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.reviews.map((review, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-gray-200 p-4 space-y-2
                           hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800 text-sm">
                    {review.reviewerName}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-amber-600">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {review.rating}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
                {review.date && (
                  <p className="text-xs text-gray-400">
                    {new Date(review.date).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Small info card used in the product metadata grid.
 */
function InfoCard({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  );
}
