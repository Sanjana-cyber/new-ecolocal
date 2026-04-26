import axios from "axios";

const API = "http://localhost:5000/api/upload";

export const uploadImage = async (fileData, token) => {
  const { data } = await axios.post(API, fileData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return data; // Returns the URL path string
};
