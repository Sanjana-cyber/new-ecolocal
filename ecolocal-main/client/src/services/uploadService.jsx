import axios from "axios";

import API_URL from '../config/api.js';
const API = `${API_URL}/api/upload`;

export const uploadImage = async (fileData, token) => {
  const { data } = await axios.post(API, fileData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return data; // Returns the URL path string
};
