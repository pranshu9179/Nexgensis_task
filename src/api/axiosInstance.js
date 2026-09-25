import axios from 'axios';

/**
 * The single shared Axios instance for the entire app.
 *
 * WHY one instance: every request automatically gets the auth header
 * and centralized error handling via interceptors, so individual API
 * files never have to think about tokens or error normalization.
 */
const axiosInstance = axios.create({
  baseURL: 'https://dummyjson.com',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach the Bearer token ──
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: normalize errors & handle 401s ──
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Let intentional cancellations bubble up unchanged so callers
    // can distinguish "we cancelled this on purpose" from real errors.
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    // If the server says our token is invalid/expired, clear auth
    // state and bounce back to login. This is the one place where
    // auth cleanup happens on 401, so no other file needs to care.
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('username');
      // Use window.location rather than the router because this code
      // runs outside React's tree (it's an Axios interceptor).
      // Only redirect if not already on the login page to avoid interrupting inline error display.
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Normalize the error message: DummyJSON returns `{ message }` on
    // most errors, but we fall back to a generic string if it doesn't.
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred.';

    // Attach the friendly message so callers can just do `err.message`
    // without digging through response shapes.
    error.message = message;
    return Promise.reject(error);
  }
);

export default axiosInstance;
