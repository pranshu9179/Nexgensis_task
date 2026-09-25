import axiosInstance from './axiosInstance';

export async function getProducts({ limit, skip, sortBy, order, signal } = {}) {
  const params = { limit, skip };
  if (sortBy) {
    params.sortBy = sortBy;
    params.order = order || 'asc';
  }
  const response = await axiosInstance.get('/products', { params, signal });
  return response.data;
}

export async function searchProducts({ q, limit, skip, sortBy, order, signal } = {}) {
  const params = { q, limit, skip };
  if (sortBy) {
    params.sortBy = sortBy;
    params.order = order || 'asc';
  }
  const response = await axiosInstance.get('/products/search', { params, signal });
  return response.data;
}

export async function getCategories(signal) {
  const response = await axiosInstance.get('/products/categories', { signal });
  return response.data;
}

export async function getProductsByCategory({ slug, limit, skip, sortBy, order, signal } = {}) {
  const params = { limit, skip };
  if (sortBy) {
    params.sortBy = sortBy;
    params.order = order || 'asc';
  }
  const response = await axiosInstance.get(`/products/category/${slug}`, { params, signal });
  return response.data;
}

export async function getProductById(id, signal) {
  const response = await axiosInstance.get(`/products/${id}`, { signal });
  return response.data;
}

export async function addProduct(data) {
  const response = await axiosInstance.post('/products/add', data);
  return response.data;
}

export async function updateProduct(id, data) {
  const response = await axiosInstance.put(`/products/${id}`, data);
  return response.data;
}

export async function deleteProduct(id) {
  const response = await axiosInstance.delete(`/products/${id}`);
  return response.data;
}
