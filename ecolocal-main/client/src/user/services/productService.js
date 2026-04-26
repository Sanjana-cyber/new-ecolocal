const BASE_URL = 'http://localhost:5000/api';

/**
 * Fetch products with optional filters
 * @param {Object} params - { keyword, category, minPrice, maxPrice, sort, page, limit }
 */
export const fetchProducts = async (params = {}) => {
  const query = new URLSearchParams();

  if (params.keyword)  query.append('keyword',  params.keyword);
  if (params.category) query.append('category', params.category);
  if (params.minPrice !== undefined && params.minPrice !== '') query.append('minPrice', params.minPrice);
  if (params.maxPrice !== undefined && params.maxPrice !== '') query.append('maxPrice', params.maxPrice);
  if (params.page)     query.append('page',     params.page);
  if (params.limit)    query.append('limit',    params.limit);
  if (params.featured) query.append('featured', params.featured);

  const res = await fetch(`${BASE_URL}/products?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json(); // { products, total, page, pages }
};

/**
 * Fetch single product by ID
 */
export const fetchProductById = async (id) => {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
};
