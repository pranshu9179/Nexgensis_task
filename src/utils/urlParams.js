const VALID_SORT_FIELDS = ['price', 'rating', 'title'];
const VALID_ORDERS = ['asc', 'desc'];
const VALID_PAGE_SIZES = [10, 20, 50];

export function parsePositiveInt(raw, fallback) {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

export function clampPage(page, total, pageSize) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return Math.min(page, totalPages);
}

export function pageToSkip(page, pageSize) {
  return (page - 1) * pageSize;
}

export function parseSortBy(raw) {
  return VALID_SORT_FIELDS.includes(raw) ? raw : '';
}

export function parseOrder(raw) {
  return VALID_ORDERS.includes(raw) ? raw : 'asc';
}

export function parsePageSize(raw) {
  const n = Number(raw);
  return VALID_PAGE_SIZES.includes(n) ? n : 10;
}

export { VALID_SORT_FIELDS, VALID_ORDERS, VALID_PAGE_SIZES };
