import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Base URL - Update this to match your backend server

// Dynamic base URL based on platform and environment variables
const getBaseURL = () => {
  // Check if environment variable is set
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Use your local IP address for mobile devices to connect to your development machine
  const LOCAL_IP = '192.168.1.5';
  
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  } else if (Platform.OS === 'android') {
    // For Android emulator, you can use 10.0.2.2 or your local IP
    // For physical Android device, use your local IP
    return `http://${LOCAL_IP}:5000/api`;
  } else {
    // For iOS simulator and physical iOS device, use your local IP
    return `http://${LOCAL_IP}:5000/api`;
  }
};

const BASE_URL = getBaseURL();

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  // Note: We don't set a default Content-Type here because it interferes with FormData uploads
  // Each request will set its own Content-Type as needed
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@houseway_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[API] Request to:', config.url, '- Token present:', !!token);
      } else {
        console.warn('[API] No token found in AsyncStorage for request:', config.url);
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - could trigger logout here
      console.log('Unauthorized access - token may be expired');
    }
    
    // Return the error response data if available, otherwise the error
    return Promise.reject(error.response?.data || error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }, { headers: { 'Content-Type': 'application/json' } }),
  
  register: (userData) => 
    api.post('/auth/register-client', userData, { headers: { 'Content-Type': 'application/json' } }),
  
  registerEmployee: (userData) => 
    api.post('/auth/register-employee', userData, { headers: { 'Content-Type': 'application/json' } }),
  
  registerVendor: (userData) => 
    api.post('/auth/register-vendor', userData, { headers: { 'Content-Type': 'application/json' } }),
  
  getProfile: () => 
    api.get('/auth/profile'),
  
  updateProfile: (userData) => 
    api.put('/auth/profile', userData, { headers: { 'Content-Type': 'application/json' } }),
  
  changePassword: (passwordData) =>
    api.put('/auth/change-password', passwordData, { headers: { 'Content-Type': 'application/json' } }),

  uploadProfilePhoto: (formData) =>
    api.post('/auth/upload-profile-photo', formData, {
      headers: {
        // Don't set Content-Type manually for FormData - let axios handle it
        // This ensures proper boundary is set for multipart/form-data
      },
    }),

  removeProfilePhoto: () =>
    api.delete('/auth/remove-profile-photo'),
};

// Service Requests API
export const serviceRequestsAPI = {
  getServiceRequests: (params = {}) =>
    api.get('/service-requests', { params }),

  createServiceRequest: (requestData) =>
    api.post('/service-requests', requestData, { headers: { 'Content-Type': 'application/json' } }),

  getServiceRequest: (id) =>
    api.get(`/service-requests/${id}`),

  assignVendor: (id, vendorId) =>
    api.put(`/service-requests/${id}/assign`, { vendorId }, { headers: { 'Content-Type': 'application/json' } }),

  updateStatus: (id, status) =>
    api.put(`/service-requests/${id}/status`, { status }, { headers: { 'Content-Type': 'application/json' } }),

  addCommunication: (id, message, isInternal = false) =>
    api.post(`/service-requests/${id}/communication`, { message, isInternal }, { headers: { 'Content-Type': 'application/json' } }),
};

// Users API endpoints
export const usersAPI = {
  getUsers: (params = {}) => 
    api.get('/users', { params }),
  
  getUserById: (id) => 
    api.get(`/users/${id}`),
  
  updateUserStatus: (id, isActive) => 
    api.put(`/users/${id}/status`, { isActive }, { headers: { 'Content-Type': 'application/json' } }),
  
  deleteUser: (id) => 
    api.delete(`/users/${id}`),
  
  getUsersByRole: (role) => 
    api.get(`/users/role/${role}`),
};

// Projects API endpoints
export const projectsAPI = {
  getProjects: (params = {}) => 
    api.get('/projects', { params }),
  
  getProjectById: (id) => 
    api.get(`/projects/${id}`),
  
  createProject: (projectData) => 
    api.post('/projects', projectData, { headers: { 'Content-Type': 'application/json' } }),
  
  updateProject: (id, projectData) => 
    api.put(`/projects/${id}`, projectData, { headers: { 'Content-Type': 'application/json' } }),
  
  deleteProject: (id) => 
    api.delete(`/projects/${id}`),
  
  assignEmployee: (id, employeeId) => 
    api.put(`/projects/${id}/assign-employee`, { employeeId }, { headers: { 'Content-Type': 'application/json' } }),
  
  assignVendor: (id, vendorId) => 
    api.put(`/projects/${id}/assign-vendor`, { vendorId }, { headers: { 'Content-Type': 'application/json' } }),
  
  updateProgress: (id, progressData) => 
    api.put(`/projects/${id}/progress`, progressData, { headers: { 'Content-Type': 'application/json' } }),
  
  uploadDocuments: (id, formData) => 
    api.post(`/projects/${id}/upload-documents`, formData, {
      headers: {
        // Don't set Content-Type manually for FormData - let axios handle it
        // This ensures proper boundary is set for multipart/form-data
      },
    }),
  
  uploadImages: (id, formData) => 
    api.post(`/projects/${id}/upload-images`, formData, {
      headers: {
        // Don't set Content-Type manually for FormData - let axios handle it
        // This ensures proper boundary is set for multipart/form-data
      },
    }),
};

// timelineData.js
export const timelineSteps = [
  {
    id: 1,
    title: "Initial Consultation",
    subtitle: "Completed",
    status: "done",
  },
  {
    id: 2,
    title: "Design Development",
    subtitle: "In Progress",
    status: "in-progress",
    progress: 60, // percentage
  },
  {
    id: 3,
    title: "Material Selection",
    subtitle: "Vendor: Modern Furnishings",
    status: "pending",
  },
  {
    id: 4,
    title: "Construction & Installation",
    subtitle: "Vendor: Elite Builders",
    status: "pending",
  },
  {
    id: 5,
    title: "Final Walkthrough",
    subtitle: "Scheduled",
    status: "pending",
  },
];

// Material Requests API endpoints
export const materialRequestsAPI = {
  getMaterialRequests: (params = {}) => 
    api.get('/material-requests', { params }),
  
  getAvailableRequests: (params = {}) => 
    api.get('/material-requests', { params: { ...params, available: 'true' } }),
  
  getMaterialRequestById: (id) => 
    api.get(`/material-requests/${id}`),
  
  createMaterialRequest: (requestData) => 
    api.post('/material-requests', requestData),
  
  acceptMaterialRequest: (id) => 
    api.post(`/material-requests/${id}/accept`),
  
  approveMaterialRequest: (id, comments) => 
    api.put(`/material-requests/${id}/approve`, { comments }),
  
  rejectMaterialRequest: (id, comments) => 
    api.put(`/material-requests/${id}/reject`, { comments }),
  
  assignVendor: (id, vendorId) => 
    api.put(`/material-requests/${id}/assign-vendor`, { vendorId }),
  
  addNote: (id, content) => 
    api.post(`/material-requests/${id}/notes`, { content }),
  
  getByProject: (projectId) => 
    api.get(`/material-requests/project/${projectId}`),
};

// Quotations API endpoints
export const quotationsAPI = {
  getQuotations: (params = {}) => 
    api.get('/quotations', { params }),
  
  getQuotationById: (id) => 
    api.get(`/quotations/${id}`),
  
  createQuotation: (quotationData) => 
    api.post('/quotations', quotationData, { headers: { 'Content-Type': 'application/json' } }),
  
  submitQuotation: (id) => 
    api.put(`/quotations/${id}/submit`, {}, { headers: { 'Content-Type': 'application/json' } }),
  
  approveQuotation: (id, comments, rating) => 
    api.put(`/quotations/${id}/approve`, { comments, rating }, { headers: { 'Content-Type': 'application/json' } }),
  
  rejectQuotation: (id, comments) => 
    api.put(`/quotations/${id}/reject`, { comments }, { headers: { 'Content-Type': 'application/json' } }),
  
  updateStatus: (id, status, comments) => 
    api.put(`/quotations/${id}/status`, { status, comments }, { headers: { 'Content-Type': 'application/json' } }),
  
  uploadAttachments: (id, formData) => 
    api.post(`/quotations/${id}/upload-attachments`, formData, {
      headers: {
        // Don't set Content-Type manually for FormData - let axios handle it
        // This ensures proper boundary is set for multipart/form-data
      },
    }),
  
  getByMaterialRequest: (materialRequestId) => 
    api.get(`/quotations/material-request/${materialRequestId}`),
  
  getMyQuotations: (params = {}) => 
    api.get('/quotations/vendor/my-quotations', { params }),
  
  getPendingReview: () => 
    api.get('/quotations/pending-review'),
  
  addNote: (id, content) => 
    api.post(`/quotations/${id}/notes`, { content }, { headers: { 'Content-Type': 'application/json' } }),
  
  updateQuotation: (id, quotationData) => 
    api.put(`/quotations/${id}`, quotationData, { headers: { 'Content-Type': 'application/json' } }),
};

// Purchase Orders API endpoints
export const purchaseOrdersAPI = {
  getPurchaseOrders: (params = {}) => 
    api.get('/purchase-orders', { params }),
  
  getPurchaseOrderById: (id) => 
    api.get(`/purchase-orders/${id}`),
  
  createPurchaseOrder: (orderData) => 
    api.post('/purchase-orders', orderData, { headers: { 'Content-Type': 'application/json' } }),
  
  sendPurchaseOrder: (id) => 
    api.put(`/purchase-orders/${id}/send`, {}, { headers: { 'Content-Type': 'application/json' } }),
  
  acknowledgePurchaseOrder: (id) => 
    api.put(`/purchase-orders/${id}/acknowledge`, {}, { headers: { 'Content-Type': 'application/json' } }),
  
  recordDelivery: (id, deliveryData) => 
    api.post(`/purchase-orders/${id}/delivery`, deliveryData, { headers: { 'Content-Type': 'application/json' } }),
  
  getByProject: (projectId) => 
    api.get(`/purchase-orders/project/${projectId}`),
  
  getMyOrders: (params = {}) => 
    api.get('/purchase-orders/vendor/my-orders', { params }),
};

// Files API endpoints
export const filesAPI = {
  getFiles: (params = {}) =>
    api.get('/files', { params }),

  getFileById: (id) =>
    api.get(`/files/${id}`),

  uploadFile: (formData) =>
    api.post('/files/upload', formData, {
      headers: {
        // Don't set Content-Type manually for FormData - let axios handle it
        // This ensures proper boundary is set for multipart/form-data
      },
    }),

  downloadFile: (id) =>
    api.get(`/files/${id}/download`, { responseType: 'blob' }),

  deleteFile: (id) =>
    api.delete(`/files/${id}`),

  updateFileInfo: (id, fileData) =>
    api.put(`/files/${id}`, fileData, { headers: { 'Content-Type': 'application/json' } }),

  getByProject: (projectId) =>
    api.get(`/files/project/${projectId}`),

  getByCategory: (category) =>
    api.get(`/files/category/${category}`),
};

// Dashboard API endpoints
export const dashboardAPI = {
  getStats: () =>
    api.get('/dashboard/stats'),

  getClientStats: () =>
    api.get('/dashboard/client-stats'),

  getEmployeeStats: () =>
    api.get('/dashboard/employee-stats'),

  getVendorStats: () =>
    api.get('/dashboard/vendor-stats'),

  getOwnerStats: () =>
    api.get('/dashboard/owner-stats'),

  getRecentActivity: (limit = 10) =>
    api.get('/dashboard/recent-activity', { params: { limit } }),

  getProjectsOverview: () =>
    api.get('/dashboard/projects-overview'),

  getFinancialSummary: () =>
    api.get('/dashboard/financial-summary'),
};

// Work Status API endpoints
export const workStatusAPI = {
  createWorkStatus: (statusData) =>
    api.post('/work-status', statusData, { headers: { 'Content-Type': 'application/json' } }),

  updateWorkStatus: (id, statusData) =>
    api.put(`/work-status/${id}`, statusData, { headers: { 'Content-Type': 'application/json' } }),

  getWorkStatuses: (params = {}) =>
    api.get('/work-status', { params }),

  getWorkStatusById: (id) =>
    api.get(`/work-status/${id}`),
};

// Export the main api instance for custom requests
export default api;
