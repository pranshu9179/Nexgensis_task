export function validateTitle(value) {
  const trimmed = (value || '').trim();
  if (!trimmed) return 'Title is required.';
  if (trimmed.length < 3) return 'Title must be at least 3 characters.';
  return '';
}

export function validatePrice(value) {
  const num = Number(value);
  if (value === '' || value === null || value === undefined) return 'Price is required.';
  if (isNaN(num) || num <= 0) return 'Price must be greater than 0.';
  return '';
}

export function validateStock(value) {
  const num = Number(value);
  if (value === '' || value === null || value === undefined) return 'Stock is required.';
  if (!Number.isInteger(num) || num < 0) return 'Stock must be a non-negative integer.';
  return '';
}

export function validateCategory(value) {
  if (!value || !value.trim()) return 'Category is required.';
  return '';
}

export function validateProductForm({ title, price, stock, category }) {
  return {
    title: validateTitle(title),
    price: validatePrice(price),
    stock: validateStock(stock),
    category: validateCategory(category),
  };
}

export function hasErrors(errors) {
  return Object.values(errors).some((msg) => msg !== '');
}
