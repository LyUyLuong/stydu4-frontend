import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/env';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const method = config.method?.toLowerCase();
    const isGetRequest = method === 'get';
    
    // List of public endpoints that don't need authentication (only for GET requests)
    const publicEndpoints = [
      '/tests/types',
      '/part-tests',
    ];
    
    // Check if this is a public endpoint
    // Only GET requests to these endpoints are public, other methods require auth
    const isPublicEndpoint = isGetRequest && (
      publicEndpoints.some(endpoint =>
        config.url?.startsWith(endpoint)
      ) || config.url === '/tests/search' // ✅ Exact match for /tests/search (not /tests/search-with-specification)
      || config.url?.match(/^\/tests\/[a-f0-9-]+$/) // Only GET /tests/{uuid} is public
    );
    
    // Only add token if NOT a public endpoint
    if (!isPublicEndpoint) {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Request with token to:', config.url);
      } else {
        console.log('Request without token to:', config.url, '(auth required but no token)');
      }
    } else {
      console.log('Public request to:', config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const method = originalRequest.method?.toLowerCase();
    const isGetRequest = method === 'get';

    // List of public endpoints that don't require authentication (only for GET requests)
    const publicEndpoints = [
      '/tests/types',
      '/part-tests',
    ];
    
    // Check if the request is to a public endpoint
    // Only GET requests to these endpoints are public, other methods require auth
    const isPublicEndpoint = isGetRequest && (
      publicEndpoints.some(endpoint =>
        originalRequest.url?.startsWith(endpoint)
      ) || originalRequest.url === '/tests/search' // ✅ Exact match for /tests/search (not /tests/search-with-specification)
      || originalRequest.url?.match(/^\/tests\/[a-f0-9-]+$/) // Only GET /tests/{uuid} is public
    );

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If it's a public endpoint, just return the error without redirecting
      if (isPublicEndpoint) {
        console.log('401 on public endpoint, continuing without auth');
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          // No refresh token, redirect to login
          console.error('No refresh token available');
          localStorage.removeItem('access_token');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        console.log('Attempting to refresh token...');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          token: refreshToken,
        });

        const { token, refreshToken: newRefreshToken } = response.data.result;
        localStorage.setItem('access_token', token);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        console.log('Token refreshed successfully');
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
