const BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Create order from cart
 * @param {Object} payload - { shippingAddress, paymentMethod }
 */
export const createOrder = async (payload) => {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to create order');
  }
  return res.json();
};

/**
 * Get current user's orders
 */
export const getMyOrders = async () => {
  const res = await fetch(`${BASE_URL}/orders`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
};
