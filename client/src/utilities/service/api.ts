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

// List of API endpoints that should not trigger the global loader
const noLoaderEndpoints = [
  'book-creator/getBookChapter',  // Book chapter generation endpoint
  'book-creator/step-5'           // Book final step endpoint
];

// Helper to determine if loader should be skipped for this endpoint
const shouldSkipLoader = (url: string) => {
  return noLoaderEndpoints.some(endpoint => url.includes(endpoint));
};

// Helper to determine loader type and message based on URL
const getLoaderConfig = (url: string) => {
  // Skip loader for specific endpoints
  if (shouldSkipLoader(url)) {
    return {
      type: 'none' as const,
      message: '',
      skipLoader: true
    };
  }
  
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
    const loaderConfig = getLoaderConfig(url);
    
    // Only show loader if not in the skip list
    if (!loaderConfig.skipLoader) {
      showLoader(loaderConfig.type, loaderConfig.message);
    }
    
    try {
      const response = await api.get(url, { params });
      
      // For long operations, show a success message (but skip for no-loader endpoints)
      if (!loaderConfig.skipLoader && (loaderConfig.type === 'spinner' || loaderConfig.type === 'dots')) {
        toast.success(response?.data?.message || 'Data loaded successfully!');
      }
      
      return response.data;
    } catch (error: any) {
      // Enhanced error message with request URL for better debugging
      const errorMessage = error?.response?.data?.message || 'Error fetching data';
      toast.error(`${errorMessage} (${url.split('/').pop()})`);
      throw error;
    } finally {
      // Only hide loader if we showed it
      if (!loaderConfig.skipLoader) {
        hideLoader();
      }
    }
  },

  post: async (url: string, data: any, params?: any, timeout?: any) => {
    const loaderConfig = getLoaderConfig(url);
    
    // Only show loader if not in the skip list
    if (!loaderConfig.skipLoader) {
      showLoader(loaderConfig.type, loaderConfig.message);
    }
    
    try {
      // For AI operations that might take longer, use a longer timeout
      const config: any = { params, timeout: timeout || {} };
      if (url.includes('generate') || url.includes('ai')) {
        config.timeout = 60000; // 1 minute timeout for AI operations
      }
      
      const response = await api.post(url, data, config);
      
      // Use a clearer success message, but skip for no-loader endpoints
      if (!loaderConfig.skipLoader) {
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
    } finally {
      // Only hide loader if we showed it
      if (!loaderConfig.skipLoader) {
        hideLoader();
      }
    }
  },

  put: async (url: string, data: any) => {
    const loaderConfig = getLoaderConfig(url);
    
    // Only show loader if not in the skip list
    if (!loaderConfig.skipLoader) {
      showLoader(loaderConfig.type, loaderConfig.message);
    }
    
    try {
      const response = await api.put(url, data);
      
      // Use a clearer success message
      if (!loaderConfig.skipLoader) {
        const successMsg = response?.data?.message || 'Updated successfully!';
        toast.success(successMsg);
      }
      
      return response.data;
    } catch (error: any) {
      // Enhanced error handling with more context
      const errorMessage = error?.response?.data?.message || 'Error updating data';
      toast.error(`${errorMessage} (${url.split('/').pop()})`);
      throw error;
    } finally {
      // Only hide loader if we showed it
      if (!loaderConfig.skipLoader) {
        hideLoader();
      }
    }
  },

  delete: async (url: string) => {
    const loaderConfig = getLoaderConfig(url);
    
    // Only show loader if not in the skip list
    if (!loaderConfig.skipLoader) {
      showLoader('bar', 'Deleting...');
    }
    
    try {
      const response = await api.delete(url);
      
      if (!loaderConfig.skipLoader) {
        toast.success(response?.data?.message || 'Deleted successfully!');
      }
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Error deleting';
      toast.error(`${errorMessage} (${url.split('/').pop()})`);
      throw error;
    } finally {
      // Only hide loader if we showed it
      if (!loaderConfig.skipLoader) {
        hideLoader();
      }
    }
  },
  
  // Add a new method for file uploads with progress tracking
  upload: async (url: string, formData: FormData) => {
    const loaderConfig = getLoaderConfig(url);
    
    // Only show loader if not in the skip list
    if (!loaderConfig.skipLoader) {
      showLoader('spinner', 'Uploading file...');
    }
    
    try {
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (!loaderConfig.skipLoader) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 100)
            );
            updateLoaderProgress(percentCompleted);
          }
        }
      });
      
      if (!loaderConfig.skipLoader) {
        toast.success(response?.data?.message || 'File uploaded successfully!');
      }
      
      return response.data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error uploading file');
      throw error;
    } finally {
      // Only hide loader if we showed it
      if (!loaderConfig.skipLoader) {
        hideLoader();
      }
    }
  }
};

export default apiService;