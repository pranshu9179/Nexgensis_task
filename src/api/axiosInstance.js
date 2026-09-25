import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://dummyjson.com',
  headers: { 'Content-Type': 'application/json' },
});

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

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('username');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred.';

    error.message = message;
    return Promise.reject(error);
  }
);

export default axiosInstance;
