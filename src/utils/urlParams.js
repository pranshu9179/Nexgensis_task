/**
 * URL parameter parsing & clamping helpers.
 *
 * Every public function here is "defensive" — it returns a safe default
 * for missing, empty, or nonsense input so callers never have to worry
 * about NaN or negative values reaching an API call.
 */

const VALID_SORT_FIELDS = ['price', 'rating', 'title'];
const VALID_ORDERS = ['asc', 'desc'];
const VALID_PAGE_SIZES = [10, 20, 50];

/**
 * Parse a query-string value into a positive integer, or return `fallback`.
 * Covers `null`, `""`, `"abc"`, `"-3"`, `"2.5"`, etc.
 */
export function parsePositiveInt(raw, fallback) {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

/**
 * Ensure `page` doesn't exceed the real last page once we know `total`.
 * If `total` is 0 (empty result set), totalPages is 1 to avoid page=0.
 */
export function clampPage(page, total, pageSize) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return Math.min(page, totalPages);
}

/**
 * Calculate `skip` for the DummyJSON API from a 1-based page number.
 */
export function pageToSkip(page, pageSize) {
  return (page - 1) * pageSize;
}

/**
 * Validate `sortBy` against the whitelist; return `''` if invalid so we
 * simply omit the param from the API call (= server default order).
 */
export function parseSortBy(raw) {
  return VALID_SORT_FIELDS.includes(raw) ? raw : '';
}

/**
 * Validate `order`; falls back to `'asc'` when a sortBy is active.
 */
export function parseOrder(raw) {
  return VALID_ORDERS.includes(raw) ? raw : 'asc';
}

/**
 * Validate `pageSize` against the allowed set.
 */
export function parsePageSize(raw) {
  const n = Number(raw);
  return VALID_PAGE_SIZES.includes(n) ? n : 10;
}

export { VALID_SORT_FIELDS, VALID_ORDERS, VALID_PAGE_SIZES };
