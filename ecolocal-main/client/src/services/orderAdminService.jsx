import axios from 'axios';

const API = 'http://localhost:5000/api/admin';
const auth = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

// 📦 GET all orders (admin)
export const getAdminOrders = async (params = {}, token) => {
  const { data } = await axios.get(`${API}/orders`, { params, ...auth(token) });
  return data;
};

// 🔄 Update order status
export const updateAdminOrderStatus = async (id, status, token) => {
  const { data } = await axios.put(`${API}/orders/${id}/status`, { status }, auth(token));
  return data;
};

// ❌ Delete order
export const deleteAdminOrder = async (id, token) => {
  const { data } = await axios.delete(`${API}/orders/${id}`, auth(token));
  return data;
};
