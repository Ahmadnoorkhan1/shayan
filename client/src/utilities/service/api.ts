import axios from 'axios';
import { toast } from 'react-hot-toast';

const baseURL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5002/api/'
    : 'https://minilessonsacademy.onrender.com/api/';

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

// Enhanced loader with context-aware messages and types
const showLoader = (type = 'bar', message = 'Loading...') => {
  localStorage.setItem('isLoading', 'true');
  localStorage.setItem('loadingMessage', message);
  localStorage.setItem('loaderType', type);
  localStorage.removeItem('loadingProgress'); // Reset progress
  
  // Dispatch custom event to notify the loader
  window.dispatchEvent(new Event('loadingStatusChanged'));
};

// Update progress for long operations
const updateLoaderProgress = (progress: number) => {
  localStorage.setItem('loadingProgress', progress.toString());
  window.dispatchEvent(new Event('loadingStatusChanged'));
};

// Hide loader
const hideLoader = () => {
  localStorage.setItem('isLoading', 'false');
  window.dispatchEvent(new Event('loadingStatusChanged'));
};

// Helper to determine loader type and message based on URL
const getLoaderConfig = (url: string) => {
  // AI generation operations - use spinner
  if (url.includes('generate') || url.includes('ai-') || url.includes('-ai')) {
    return { 
      type: 'spinner' as const, 
      message: 'Creating content with AI...'
    };
  }
  
  // Course operations - use spinner for most, bar for quick operations
  if (url.includes('course')) {
    if (url.includes('list') || url.includes('get')) {
      return { 
        type: 'bar' as const, 
        message: 'Loading courses...' 
      };
    }
    return { 
      type: 'spinner' as const, 
      message: 'Processing course data...'
    };
  }
  
  // Book operations
  if (url.includes('book')) {
    return { 
      type: 'spinner' as const, 
      message: 'Loading book content...'
    };
  }
  
  // Image operations
  if (url.includes('image')) {
    return { 
      type: 'dots' as const, 
      message: 'Processing images...'
    };
  }
  
  // Auth operations - quick bar
  if (url.includes('auth') || url.includes('login') || url.includes('register')) {
    return { 
      type: 'bar' as const, 
      message: 'Authenticating...'
    };
  }
  
  // Default for all other operations - simple bar
  return { 
    type: 'bar' as const, 
    message: 'Loading...'
  };
};

const apiService = {
  get: async (url: string, params?: any) => {
    const { type, message } = getLoaderConfig(url);
    showLoader(type, message);
    
    try {
      const response = await api.get(url, { params });
      
      // For long operations, show a success message
      if (type === 'spinner' || type === 'dots') {
        toast.success(response?.data?.message || 'Data loaded successfully!');
      }
      
      return response.data;
    } catch (error: any) {
      // Enhanced error message with request URL for better debugging
      const errorMessage = error?.response?.data?.message || 'Error fetching data';
      toast.error(`${errorMessage} (${url.split('/').pop()})`);
      throw error;
    } finally {
      hideLoader();
    }
  },

  post: async (url: string, data: any, params?: any, timeout?: any) => {
    const { type, message } = getLoaderConfig(url);
    showLoader(type, message);
    
    try {
      // For AI operations that might take longer, use a longer timeout
      const config: any = { params, timeout: timeout || {} };
      if (url.includes('generate') || url.includes('ai')) {
        config.timeout = 60000; // 1 minute timeout for AI operations
      }
      
      const response = await api.post(url, data, config);
      
      // Use a clearer success message
      const successMsg = response?.data?.message || 
                         (url.includes('create') ? 'Created successfully!' : 'Success!');
      toast.success(successMsg);
      
      return response.data;
    } catch (error: any) {
      // Enhanced error handling with more context
      const errorMessage = error?.response?.data?.message || 'Error submitting data';
      toast.error(`${errorMessage} (${url.split('/').pop()})`);
      throw error;
    } finally {
      hideLoader();
    }
  },

  put: async (url: string, data: any) => {
    const { type, message } = getLoaderConfig(url);
    showLoader(type, message);
    
    try {
      const response = await api.put(url, data);
      
      // Use a clearer success message
      const successMsg = response?.data?.message || 'Updated successfully!';
      toast.success(successMsg);
      
      return response.data;
    } catch (error: any) {
      // Enhanced error handling with more context
      const errorMessage = error?.response?.data?.message || 'Error updating data';
      toast.error(`${errorMessage} (${url.split('/').pop()})`);
      throw error;
    } finally {
      hideLoader();
    }
  },

  delete: async (url: string) => {
    // For delete operations, always use a bar loader with clear message
    showLoader('bar', 'Deleting...');
    
    try {
      const response = await api.delete(url);
      toast.success(response?.data?.message || 'Deleted successfully!');
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error deleting';
      toast.error(`${errorMessage} (${url.split('/').pop()})`);
      throw error;
    } finally {
      hideLoader();
    }
  },
  
  // Add a new method for file uploads with progress tracking
  upload: async (url: string, formData: FormData) => {
    showLoader('spinner', 'Uploading file...');
    
    try {
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 100)
          );
          updateLoaderProgress(percentCompleted);
        }
      });
      
      toast.success(response?.data?.message || 'File uploaded successfully!');
      return response.data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error uploading file');
      throw error;
    } finally {
      hideLoader();
    }
  }
};

export default apiService;