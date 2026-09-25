import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { useProductsQuery } from '../hooks/useProductsQuery';
import { getCategories } from '../api/productsApi';
import { deleteProduct } from '../api/productsApi';
import {
  parsePositiveInt,
  parsePageSize,
  parseSortBy,
  parseOrder,
} from '../utils/urlParams';

import SearchBar from '../components/products/SearchBar';
import FilterSortBar from '../components/products/FilterSortBar';
import ProductTable from '../components/products/ProductTable';
import ProductCards from '../components/products/ProductCards';
import Pagination from '../components/products/Pagination';
import DeleteConfirmModal from '../components/products/DeleteConfirmModal';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

/**
 * Product list page — the main dashboard view.
 *
 * All filter/pagination state is driven by the URL query string so that
 * refreshes and shared links reproduce the exact same view.
 */
export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // ── Parse URL params defensively (bad values → safe defaults) ──
  const page = parsePositiveInt(searchParams.get('page'), 1);
  const pageSize = parsePageSize(searchParams.get('pageSize'));
  const sortBy = parseSortBy(searchParams.get('sortBy'));
  const order = parseOrder(searchParams.get('order'));
  const category = searchParams.get('category') || '';

  // The raw search input value (updates on every keystroke)
  const [rawQuery, setRawQuery] = useState(searchParams.get('q') || '');
  // The debounced value (updates after 400ms of quiet)
  const debouncedQuery = useDebounce(rawQuery, 400);

  // Categories for the filter dropdown
  const [categories, setCategories] = useState([]);

  // Local overrides for fake persistence (add/edit/delete).
  // Structured as { added: [], edited: [], deleted: [] }.
  const [localOverrides, setLocalOverrides] = useState({
    added: [],
    edited: [],
    deleted: [],
  });

  // Catch newly added or edited products passed back via router navigation state
  useEffect(() => {
    if (location.state?.addedProduct) {
      const newProduct = location.state.addedProduct;
      setLocalOverrides((prev) => ({
        ...prev,
        added: [newProduct, ...prev.added.filter((p) => p.id !== newProduct.id)],
      }));
      window.history.replaceState({}, document.title);
    } else if (location.state?.editedProduct) {
      const updatedProduct = location.state.editedProduct;
      setLocalOverrides((prev) => ({
        ...prev,
        edited: [
          ...prev.edited.filter((p) => p.id !== updatedProduct.id),
          updatedProduct,
        ],
      }));
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch categories once on mount ──
  useEffect(() => {
    const controller = new AbortController();
    getCategories(controller.signal)
      .then(setCategories)
      .catch(() => {}); // silently ignore — dropdown just stays at "All"
    return () => controller.abort();
  }, []);

  // ── Sync debounced query to URL ──
  // When the debounced search value changes, update `?q=` and reset to page 1.
  useEffect(() => {
    const currentQ = searchParams.get('q') || '';
    // Prevent redundant writes and unnecessary re-renders if query already matches URL
    if (debouncedQuery === currentQ) return;

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (debouncedQuery) {
        next.set('q', debouncedQuery);
        // Search is active → clear category (they're mutually exclusive)
        next.delete('category');
      } else {
        next.delete('q');
      }
      next.set('page', '1'); // new search = back to page 1
      return next;
    });
  }, [debouncedQuery, searchParams, setSearchParams]);

  // ── Callback for when the hook clamps an out-of-range page ──
  const handlePageClamp = useCallback(
    (clampedPage) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', String(clampedPage));
        return next;
      });
    },
    [setSearchParams]
  );

  // ── Core data hook ──
  // retryKey is incremented by handleRetry() to force a re-fetch on error
  const [retryKey, setRetryKey] = useState(0);

  // URL is the source of truth for what to fetch (Rule 2)
  const activeQuery = searchParams.get('q') || '';

  const { products, total, loading, error } = useProductsQuery({
    page,
    pageSize,
    query: activeQuery,
    category,
    sortBy,
    order,
    localOverrides,
    onPageClamp: handlePageClamp,
    retryKey,
  });

  // ── URL writers ──
  function updateParam(key, value) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      return next;
    });
  }

  function handlePageChange(newPage) {
    updateParam('page', String(newPage));
  }

  function handlePageSizeChange(newSize) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('pageSize', String(newSize));
      next.set('page', '1'); // changing page size resets to page 1
      return next;
    });
  }

  function handleCategoryChange(slug) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (slug) {
        next.set('category', slug);
        // Category active → clear search (they're mutually exclusive)
        next.delete('q');
        setRawQuery('');
      } else {
        next.delete('category');
      }
      next.set('page', '1');
      return next;
    });
  }

  function handleSortChange(field) {
    updateParam('sortBy', field);
    if (!field) updateParam('order', '');
  }

  function handleOrderChange(newOrder) {
    updateParam('order', newOrder);
  }

  // ── Delete flow ──
  async function handleDeleteConfirm() {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      // Optimistic local removal so the product disappears immediately
      setLocalOverrides((prev) => ({
        ...prev,
        deleted: [...prev.deleted, deleteTarget.id],
      }));
      setDeleteTarget(null);
    } catch {
      // If delete fails, keep the modal open so the user can retry
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Retry handler for ErrorState ──
  // Forces a re-fetch by incrementing the key. The actual re-fetch happens
  // because useProductsQuery includes retryKey in its dependencies.
  function handleRetry() {
    setRetryKey((k) => k + 1);
  }

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse, search, and manage your product catalog.
        </p>
      </div>

      {/* ── Search + filters ── */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={rawQuery}
          onChange={setRawQuery}
          disabled={!!category} // disabled when category filter is active
        />
        <FilterSortBar
          categories={categories}
          category={category}
          onCategoryChange={handleCategoryChange}
          sortBy={sortBy}
          order={order}
          onSortChange={handleSortChange}
          onOrderChange={handleOrderChange}
          searchActive={!!debouncedQuery}
        />
      </div>

      {/* ── Content area ── */}
      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorState message={error} onRetry={handleRetry} />
      ) : products.length === 0 ? (
        <EmptyState
          message={
            debouncedQuery
              ? `No products matching "${debouncedQuery}".`
              : category
                ? 'No products in this category.'
                : 'No products found.'
          }
        />
      ) : (
        <>
          {/* Both views render from the same array — only CSS controls visibility */}
          <ProductTable
            products={products}
            onDelete={setDeleteTarget}
            page={page}
            pageSize={pageSize}
          />
          <ProductCards
            products={products}
            onDelete={setDeleteTarget}
            page={page}
            pageSize={pageSize}
          />

          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

      {/* ── Delete confirmation modal ── */}
      <DeleteConfirmModal
        product={deleteTarget}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
