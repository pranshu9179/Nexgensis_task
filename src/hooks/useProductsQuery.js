import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { getProducts, searchProducts, getProductsByCategory } from '../api/productsApi';
import { pageToSkip,clampPage } from '../utils/urlParams';

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

  const fetchIdRef = useRef(0);

  const fetchProducts = useCallback(async (signal) => {
    const skip = pageToSkip(page, pageSize);
    const params = { limit: pageSize, skip, sortBy, order, signal };

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
        if (currentFetchId !== fetchIdRef.current) return;

        setProducts(data.products);
        setTotal(data.total);

        const totalPages = Math.max(1, Math.ceil(data.total / pageSize));
        if (page > totalPages) {
          onPageClamp?.(totalPages);
        }
      })
      .catch((err) => {
        if (axios.isCancel(err) || err.code === 'ERR_CANCELED') return;
        if (currentFetchId !== fetchIdRef.current) return;
        setError(err.message || 'Failed to load products.');
      })
      .finally(() => {
        if (currentFetchId === fetchIdRef.current) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [fetchProducts, page, pageSize, onPageClamp, retryKey]);

  const displayProducts = applyOverrides(products, localOverrides);

  return { products: displayProducts, total, loading, error };
}

function applyOverrides(products, overrides) {
  if (!overrides) return products;

  let result = [...products];

  if (overrides.deleted?.length) {
    result = result.filter((p) => !overrides.deleted.includes(p.id));
  }

  if (overrides.edited?.length) {
    for (const edited of overrides.edited) {
      const idx = result.findIndex((p) => p.id === edited.id);
      if (idx !== -1) {
        result[idx] = { ...result[idx], ...edited };
      }
    }
  }

  if (overrides.added?.length) {
    result = [...overrides.added, ...result];
  }

  return result;
}
