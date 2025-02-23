import axios from 'axios';
import { toast } from 'react-hot-toast';

// Determine base URL dynamically
const baseURL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5002/api/'
    : 'http://dev.minilessonsacademy.com/api/';

// Create an axios instance
const api = axios.create({
  baseURL,
  timeout: 10000, // Optional: Set a timeout for requests
});

// Axios Request Interceptor (Optional)
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

// API service functions
const apiService = {
  get: async (url: string, params: any) => {
    // const toastId = toast.loading('Loading data...');
    try {
      const response = await api.get(url, { params });
      // toast.success(response.data.message, { id: toastId });
      return response.data;
    } catch (error: any) {
      // toast.error(error?.response?.data?.message || 'Error fetching data', { id: toastId });
      throw error;
    }
  },

  post: async (url: string, data: any, params?: any, timeout?: any) => {
    const toastId = toast.loading('Submitting data...');
    try {
      const response = await api.post(url, data, { params, timeout: timeout || {} });
      toast.success(response.data.message, { id: toastId });
      return response.data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error submitting data', { id: toastId });
      throw error;
    }
  },

  put: async (url: string, data: any) => {
    const toastId = toast.loading('Updating data...');
    try {
      const response = await api.put(url, data);
      toast.success(response?.data?.message || 'Data updated successfully!', { id: toastId });
      return response.data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error updating data', { id: toastId });
      throw error;
    }
  },

  delete: async (url: string) => {
    const toastId = toast.loading('Deleting data...');
    try {
      const response = await api.delete(url);
      toast.success('Data deleted successfully!', { id: toastId });
      return response.data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error deleting data', { id: toastId });
      throw error;
    }
  },
};

export default apiService;
