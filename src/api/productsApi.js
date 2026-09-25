import axiosInstance from './axiosInstance';

/**
 * Fetch a paginated list of all products.
 * `signal` lets the caller abort this request via an AbortController.
 */
export async function getProducts({ limit, skip, sortBy, order, signal } = {}) {
  const params = { limit, skip };
  if (sortBy) {
    params.sortBy = sortBy;
    params.order = order || 'asc';
  }
  const response = await axiosInstance.get('/products', { params, signal });
  return response.data; // { products, total, skip, limit }
}

/**
 * Search products by keyword.  Same paginated response shape.
 */
export async function searchProducts({ q, limit, skip, sortBy, order, signal } = {}) {
  const params = { q, limit, skip };
  if (sortBy) {
    params.sortBy = sortBy;
    params.order = order || 'asc';
  }
  const response = await axiosInstance.get('/products/search', { params, signal });
  return response.data;
}

/**
 * Fetch the list of product categories.
 * Returns an array of objects: { slug, name, url }.
 */
export async function getCategories(signal) {
  const response = await axiosInstance.get('/products/categories', { signal });
  return response.data;
}

/**
 * Fetch products filtered by category slug.
 * DummyJSON uses `/products/category/{slug}` for this.
 */
export async function getProductsByCategory({ slug, limit, skip, sortBy, order, signal } = {}) {
  const params = { limit, skip };
  if (sortBy) {
    params.sortBy = sortBy;
    params.order = order || 'asc';
  }
  const response = await axiosInstance.get(`/products/category/${slug}`, { params, signal });
  return response.data;
}

/**
 * Fetch a single product by its id.
 */
export async function getProductById(id, signal) {
  const response = await axiosInstance.get(`/products/${id}`, { signal });
  return response.data;
}

/**
 * Create a new product (DummyJSON returns a realistic object but doesn't
 * actually persist it — see NOTES.md for why we do a local-state overlay).
 */
export async function addProduct(data) {
  const response = await axiosInstance.post('/products/add', data);
  return response.data;
}

/**
 * Update an existing product by id.
 * Using PUT to send the full updated object.
 */
export async function updateProduct(id, data) {
  const response = await axiosInstance.put(`/products/${id}`, data);
  return response.data;
}

/**
 * Delete a product by id.
 * Returns the product with `isDeleted: true, deletedOn: <timestamp>`.
 */
export async function deleteProduct(id) {
  const response = await axiosInstance.delete(`/products/${id}`);
  return response.data;
}
