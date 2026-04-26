import { useState, useEffect, useCallback } from 'react';
import { fetchProducts } from '../services/productService';

const useProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [params, setParams] = useState(initialParams);

  const load = useCallback(async (p = params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts(p);
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(params);
  }, [params]);

  const updateParams = (newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  };

  const resetParams = () => {
    setParams(initialParams);
  };

  return { products, loading, error, total, pages, params, updateParams, resetParams, reload: load };
};

export default useProducts;
