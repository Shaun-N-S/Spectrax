import axios from 'axios';
import  toast  from 'react-hot-toast'; // Assuming you're using react-toastify

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 403 Forbidden error
    if (error.response?.status === 403) {
      toast.error('Your account has been temporarly restricted. Please contact support.', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // If the error is not 401 or the request was for refresh token, reject immediately
    if (error.response?.status !== 401 || originalRequest.url === '/refresh-token') {
      return Promise.reject(error);
    }

    // If the request has already been retried, reject it
    if (originalRequest._retry) {
      // If we're on the login page, don't try to refresh
      if (window.location.pathname === '/login') {
        return Promise.reject(error);
      }
      // Redirect to login for other pages
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          return axiosInstance(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axiosInstance.get('/refresh-token');
      isRefreshing = false;
      processQueue(null, response.data.token);
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      processQueue(refreshError, null);
      
      // Only redirect to login if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;