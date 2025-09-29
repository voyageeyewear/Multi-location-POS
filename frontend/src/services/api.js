import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
            refreshToken
          });

          const { accessToken } = response.data.data;
          
          // Update cookies
          Cookies.set('accessToken', accessToken, { expires: 1 });
          
          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API instance
export const authAPI = api;

// General API instance
export const apiClient = api;

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refreshToken: '/auth/refresh-token',
    profile: '/auth/profile',
    changePassword: '/auth/change-password',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  
  // Users
  users: {
    list: '/users',
    create: '/users',
    get: (id) => `/users/${id}`,
    update: (id) => `/users/${id}`,
    delete: (id) => `/users/${id}`,
    locations: (id) => `/users/${id}/locations`,
  },
  
  // Products
  products: {
    list: '/products',
    create: '/products',
    get: (id) => `/products/${id}`,
    update: (id) => `/products/${id}`,
    delete: (id) => `/products/${id}`,
    search: (query) => `/products/search/${query}`,
    inventory: (id) => `/products/${id}/inventory`,
    updateInventory: (id) => `/products/${id}/inventory`,
    bulkUpdate: '/products/bulk/update',
    import: '/products/import',
    export: (format) => `/products/export/${format}`,
  },
  
  // Locations
  locations: {
    list: '/locations',
    create: '/locations',
    get: (id) => `/locations/${id}`,
    update: (id) => `/locations/${id}`,
    delete: (id) => `/locations/${id}`,
    stats: (id) => `/locations/${id}/stats`,
    users: (id) => `/locations/${id}/users`,
  },
  
  // Sales
  sales: {
    list: '/sales',
    create: '/sales',
    get: (id) => `/sales/${id}`,
    update: (id) => `/sales/${id}`,
    cancel: (id) => `/sales/${id}/cancel`,
    refund: (id) => `/sales/${id}/refund`,
    receipt: (id) => `/sales/${id}/receipt`,
    byLocation: (locationId) => `/sales/location/${locationId}`,
    stats: {
      overview: '/sales/stats/overview',
      dateRange: '/sales/stats/date-range',
      topProducts: '/sales/stats/top-products',
      byLocation: '/sales/stats/by-location',
    },
  },
  
  // Reports
  reports: {
    list: '/reports',
    create: '/reports',
    get: (id) => `/reports/${id}`,
    delete: (id) => `/reports/${id}`,
    download: (id) => `/reports/${id}/download`,
    templates: '/reports/templates/list',
    dashboard: '/reports/dashboard/overview',
    sales: '/reports/sales/summary',
    inventory: '/reports/inventory/summary',
    customers: '/reports/customers/summary',
    financial: '/reports/financial/summary',
    export: (type, format) => `/reports/export/${type}/${format}`,
  },
  
  // Companies
  companies: {
    list: '/companies',
    create: '/companies',
    get: (id) => `/companies/${id}`,
    update: (id) => `/companies/${id}`,
    delete: (id) => `/companies/${id}`,
    stats: (id) => `/companies/${id}/stats`,
    users: (id) => `/companies/${id}/users`,
    locations: (id) => `/companies/${id}/locations`,
    settings: (id) => `/companies/${id}/settings`,
  },
  
  // Roles
  roles: {
    list: '/roles',
    create: '/roles',
    get: (id) => `/roles/${id}`,
    update: (id) => `/roles/${id}`,
    delete: (id) => `/roles/${id}`,
    templates: '/roles/templates/permissions',
    users: (id) => `/roles/${id}/users`,
  },
};

// Helper functions
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || 'An error occurred',
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error. Please check your connection.',
      status: 0
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0
    };
  }
};

export default api;
