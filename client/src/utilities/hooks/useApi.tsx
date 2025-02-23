import { useState } from 'react';
import apiService from '../service/api';  // Import the API service

const useApi = (method:any, url:string, initialData = null) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (paramsOrData = {}) => {
    setLoading(true);
    setError(null);
    console.log('fetching data', paramsOrData)
    try {
      let result;
      switch (method.toLowerCase()) {
        case 'get':
          result = await apiService.get(url, paramsOrData);
          break;
        case 'post':
          result = await apiService.post(url, paramsOrData,{});
          break;
        case 'put':
          result = await apiService.put(url, paramsOrData);
          break;
        case 'delete':
          result = await apiService.delete(url);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      setData(result);
    } catch (err:any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData };
};

export default useApi;
