import axios from 'axios';
import { toast } from 'react-hot-toast';

const baseURL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5002/api/'
    : 'https://minilessonsacademy.onrender.com/api/';
// const baseURL = 'https://minilessonsacademy.onrender.com/api/'

const api = axios.create({
  baseURL,
  timeout: 10000, 
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// List of endpoints where we should suppress toast notifications
const noToastEndpoints = [
  // Course-related endpoints
  'course-creator/updateCourse',
  'course-creator/getCourses',
  'course-creator/addCourse',
  'course-creator/deleteCourse',
  
  // Book-related endpoints - added for book editor
  'book-creator/getBookById',
  'book-creator/step-1',
  'book-creator/step-3',
  'book-creator/step-5',
  
  // Quiz-related endpoints
  'generate-quiz',
  
  // Cover image endpoints that have their own toast handling
  'generate-cover',
  
  // Image editing/generation endpoints
  'generate-image',
  'edit-image',
  
  // Any endpoint that ends with /book to catch all book update operations
  '/book',
];

// Helper to determine if toast notifications should be suppressed
const shouldSuppressToast = (url: string) => {
  // First check for direct includes matches
  const directMatch = noToastEndpoints.some(endpoint => {
    // If endpoint doesn't contain a special character, do a simple includes check
    if (!endpoint.includes('/') || endpoint.startsWith('/')) {
      return url.includes(endpoint);
    }
    return false;
  });
  
  if (directMatch) return true;
  
  // Then check for endpoints that should match at the end of the URL
  const endsWith = noToastEndpoints
    .filter(endpoint => endpoint.startsWith('/'))
    .some(endpoint => {
      const endpointWithoutSlash = endpoint.substring(1); // Remove leading slash
      return url.endsWith(endpointWithoutSlash);
    });
    
  return endsWith;
};

const apiService = {
  get: async (url: string, params?: any) => {
    try {
      const response = await api.get(url, { params });
      
      // Show success toast only for non-suppressed endpoints
      if (!shouldSuppressToast(url)) {
        // toast.success(response?.data?.message || 'Data loaded successfully!');
      }
      
      return response.data;
    } catch (error: any) {
      // Enhanced error message with request URL for better debugging
      const errorMessage = error?.response?.data?.message || 'Error fetching data';
      toast.error(`${errorMessage} (${url.split('/').pop()})`);
      throw error;
    }
  },

  post: async (url: string, data: any, params?: any, timeout?: any) => {
    try {
      // For AI operations that might take longer, use a longer timeout
      const config: any = { params, timeout: timeout || {} };
      if (url.includes('generate') || url.includes('ai')) {
        config.timeout = 60000; // 1 minute timeout for AI operations
      }
      
      const response = await api.post(url, data, config);
      
      // Show success toast only for non-suppressed endpoints
      if (!shouldSuppressToast(url)) {
        const successMsg = response?.data?.message || 
                          (url.includes('create') ? 'Created successfully!' : 'Success!');
        toast.success(successMsg);
      }
      
      return response.data;
    } catch (error: any) {
      // Enhanced error handling with more context
      const errorMessage = error?.response?.data?.message || 'Error submitting data';
      toast.error(`${errorMessage} (${url.split('/').pop()})`);
      throw error;
    }
  },

  put: async (url: string, data: any) => {
    try {
      const response = await api.put(url, data);
      
      // Show success toast only for non-suppressed endpoints
      if (!shouldSuppressToast(url)) {
        const successMsg = response?.data?.message || 'Updated successfully!';
        toast.success(successMsg);
      }
      
      return response.data;
    } catch (error: any) {
      // Enhanced error handling with more context
      const errorMessage = error?.response?.data?.message || 'Error updating data';
      toast.error(`${errorMessage} (${url.split('/').pop()})`);
      throw error;
    }
  },

  delete: async (url: string) => {
    try {
      const response = await api.delete(url);
      
      // Show success toast only for non-suppressed endpoints
      if (!shouldSuppressToast(url)) {
        toast.success(response?.data?.message || 'Deleted successfully!');
      }
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error deleting';
      toast.error(`${errorMessage} (${url.split('/').pop()})`);
      throw error;
    }
  },
  
  // Simplified file upload without progress tracking
  upload: async (url: string, formData: FormData) => {
    try {
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Show success toast only for non-suppressed endpoints
      if (!shouldSuppressToast(url)) {
        toast.success(response?.data?.message || 'File uploaded successfully!');
      }
      
      return response.data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error uploading file');
      throw error;
    }
  }
};

export default apiService;