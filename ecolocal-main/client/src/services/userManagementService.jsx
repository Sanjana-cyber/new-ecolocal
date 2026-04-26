import axios from 'axios';

const API = 'http://localhost:5000/api/admin';

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// 👥 GET all users (with order/booking counts)
export const getAllUsers = async (token) => {
  const { data } = await axios.get(`${API}/users`, authHeader(token));
  return data;
};

// 🔄 Change user role
export const changeUserRole = async (id, role, token) => {
  const { data } = await axios.put(
    `${API}/users/${id}/role`,
    { role },
    authHeader(token)
  );
  return data;
};

// 📦 Get orders for a user
export const getUserOrders = async (id, token) => {
  const { data } = await axios.get(`${API}/users/${id}/orders`, authHeader(token));
  return data;
};

// 📅 Get bookings for a user
export const getUserBookings = async (id, token) => {
  const { data } = await axios.get(`${API}/users/${id}/bookings`, authHeader(token));
  return data;
};
