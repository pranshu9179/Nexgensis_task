import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { getProducts, searchProducts, getProductsByCategory } from '../api/productsApi';
import { pageToSkip, clampPage } from '../utils/urlParams';

/**
 * Custom hook that manages the product list fetch lifecycle.
 *
 * It decides which API endpoint to call based on the current filters
 * (search query vs. category), handles pagination math, and — critically —
 * cancels in-flight requests whenever the inputs change so an older, slower
 * response never overwrites a newer one (the "race condition" fix).
 *
 * The `localOverrides` parameter is the mechanism for the fake-persistence
 * workaround: after an add/edit/delete, the calling page patches this array
 * to include the change, and this hook merges it into the fetched results.
 */
export function useProductsQuery({
  page,
  pageSize,
  query,
  category,
  sortBy,
  order,
  localOverrides,
  onPageClamp,
  retryKey = 0,
}) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track the latest fetch id so we can detect stale responses even
  // without AbortController (belt-and-suspenders with the abort below).
  const fetchIdRef = useRef(0);

  const fetchProducts = useCallback(async (signal) => {
    const skip = pageToSkip(page, pageSize);
    const params = { limit: pageSize, skip, sortBy, order, signal };

    // Decide which endpoint to use based on active filters.
    // Search and category are mutually exclusive (see NOTES.md).
    if (query) {
      return searchProducts({ ...params, q: query });
    }
    if (category) {
      return getProductsByCategory({ ...params, slug: category });
    }
    return getProducts(params);
  }, [page, pageSize, query, category, sortBy, order]);

  useEffect(() => {
    const controller = new AbortController();
    const currentFetchId = ++fetchIdRef.current;

    setLoading(true);
    setError(null);

    fetchProducts(controller.signal)
      .then((data) => {
        // Guard: if a newer fetch has already started, discard this result.
        if (currentFetchId !== fetchIdRef.current) return;

        setProducts(data.products);
        setTotal(data.total);

        // If the current page overshoots the real total (e.g. user typed
        // ?page=999), clamp it down and let the parent update the URL.
        const totalPages = Math.max(1, Math.ceil(data.total / pageSize));
        if (page > totalPages) {
          onPageClamp?.(totalPages);
        }
      })
      .catch((err) => {
        // Intentional cancellations are not errors — just ignore them.
        if (axios.isCancel(err) || err.code === 'ERR_CANCELED') return;
        if (currentFetchId !== fetchIdRef.current) return;
        setError(err.message || 'Failed to load products.');
      })
      .finally(() => {
        if (currentFetchId === fetchIdRef.current) {
          setLoading(false);
        }
      });

    // Cleanup: cancel this request if dependencies change or unmount.
    return () => controller.abort();
  }, [fetchProducts, page, pageSize, onPageClamp, retryKey]);

  // Apply local overrides (add/edit/delete) on top of fetched data.
  // This runs synchronously after every render, so changes appear instantly.
  const displayProducts = applyOverrides(products, localOverrides);

  return { products: displayProducts, total, loading, error };
}

/**
 * Merge local overrides into the fetched product list.
 *
 * - Added products are prepended (so they show up at the top).
 * - Edited products replace the matching id in-place.
 * - Deleted product ids are filtered out.
 *
 * This is the "local-state overlay" the assignment requires because
 * DummyJSON's mock endpoints don't actually persist changes.
 */
function applyOverrides(products, overrides) {
  if (!overrides) return products;

  let result = [...products];

  // Filter out deleted ids first
  if (overrides.deleted?.length) {
    result = result.filter((p) => !overrides.deleted.includes(p.id));
  }

  // Replace edited products in-place
  if (overrides.edited?.length) {
    for (const edited of overrides.edited) {
      const idx = result.findIndex((p) => p.id === edited.id);
      if (idx !== -1) {
        result[idx] = { ...result[idx], ...edited };
      }
    }
  }

  // Prepend added products
  if (overrides.added?.length) {
    result = [...overrides.added, ...result];
  }

  return result;
}
