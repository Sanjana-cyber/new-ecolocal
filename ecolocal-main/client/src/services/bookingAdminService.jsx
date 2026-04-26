import axios from 'axios';

const API = 'http://localhost:5000/api/admin';
const auth = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

// 📅 GET all bookings (admin)
export const getAdminBookings = async (params = {}, token) => {
  const { data } = await axios.get(`${API}/bookings`, { params, ...auth(token) });
  return data;
};

// 🔄 Update booking status
export const updateAdminBookingStatus = async (id, status, token) => {
  const { data } = await axios.put(`${API}/bookings/${id}/status`, { status }, auth(token));
  return data;
};

// ❌ Delete booking
export const deleteAdminBooking = async (id, token) => {
  const { data } = await axios.delete(`${API}/bookings/${id}`, auth(token));
  return data;
};
