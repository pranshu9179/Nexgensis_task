/**
 * Form-level validators for the product form.
 *
 * Each validator returns an error string or `''` (no error).
 * Keeping them as pure functions makes them easy to unit-test
 * and keeps the form component focused on rendering.
 */

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

/**
 * Run all validators at once and return an errors object.
 * Keys match form field names; values are error strings (empty = valid).
 */
export function validateProductForm({ title, price, stock, category }) {
  return {
    title: validateTitle(title),
    price: validatePrice(price),
    stock: validateStock(stock),
    category: validateCategory(category),
  };
}

/**
 * Returns `true` if the errors object contains any non-empty string.
 */
export function hasErrors(errors) {
  return Object.values(errors).some((msg) => msg !== '');
}
