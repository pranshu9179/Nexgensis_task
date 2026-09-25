import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { useProductsQuery } from '../hooks/useProductsQuery';
import { getCategories, deleteProduct } from '../api/productsApi';
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

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const page = parsePositiveInt(searchParams.get('page'), 1);
  const pageSize = parsePageSize(searchParams.get('pageSize'));
  const sortBy = parseSortBy(searchParams.get('sortBy'));
  const order = parseOrder(searchParams.get('order'));
  const category = searchParams.get('category') || '';

  const [rawQuery, setRawQuery] = useState(searchParams.get('q') || '');
  const debouncedQuery = useDebounce(rawQuery, 400);

  const [categories, setCategories] = useState([]);
  const [localOverrides, setLocalOverrides] = useState({
    added: [],
    edited: [],
    deleted: [],
  });

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

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getCategories(controller.signal)
      .then(setCategories)
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const currentQ = searchParams.get('q') || '';
    if (debouncedQuery === currentQ) return;

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (debouncedQuery) {
        next.set('q', debouncedQuery);
        next.delete('category');
      } else {
        next.delete('q');
      }
      next.set('page', '1');
      return next;
    });
  }, [debouncedQuery, searchParams, setSearchParams]);

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

  const [retryKey, setRetryKey] = useState(0);

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
      next.set('page', '1');
      return next;
    });
  }

  function handleCategoryChange(slug) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (slug) {
        next.set('category', slug);
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

  async function handleDeleteConfirm() {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      setLocalOverrides((prev) => ({
        ...prev,
        deleted: [...prev.deleted, deleteTarget.id],
      }));
      setDeleteTarget(null);
    } catch {
    } finally {
      setIsDeleting(false);
    }
  }

  function handleRetry() {
    setRetryKey((k) => k + 1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse, search, and manage your product catalog.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={rawQuery}
          onChange={setRawQuery}
          disabled={!!category}
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

      <DeleteConfirmModal
        product={deleteTarget}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
