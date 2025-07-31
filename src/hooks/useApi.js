import { useState, useEffect } from 'react';
import ApiService from '../services/api';

export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

export const useProducts = () => {
  return useApi(() => ApiService.getProducts());
};

export const useSales = () => {
  return useApi(() => ApiService.getSales());
};

export const useCustomers = () => {
  return useApi(() => ApiService.getCustomers());
};

export const useSuppliers = () => {
  return useApi(() => ApiService.getSuppliers());
};

export const useExpenses = () => {
  return useApi(() => ApiService.getExpenses());
};

export const useLowStockProducts = () => {
  return useApi(() => ApiService.getLowStockProducts());
};