import axios from "axios";

const API = "http://localhost:5000/api/services";

/**
 * 📦 GET ALL SERVICES (Search + Filter + Pagination)
 */
export const getServices = async (params = {}) => {
  const { data } = await axios.get(`${API}/all`, { params });
  return data;
};

/**
 * 🔍 GET SINGLE SERVICE BY ID
 */
export const getServiceById = async (id) => {
  const { data } = await axios.get(`${API}/${id}`);
  return data;
};

/**
 * ➕ ADD NEW SERVICE
 */
export const addService = async (serviceData, token) => {
  const { data } = await axios.post(`${API}/add`, serviceData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

/**
 * ✏️ UPDATE SERVICE
 */
export const updateService = async (id, serviceData, token) => {
  const { data } = await axios.put(`${API}/update/${id}`, serviceData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

/**
 * ❌ DELETE SERVICE
 */
export const deleteService = async (id, token) => {
  const { data } = await axios.delete(`${API}/delete/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};
