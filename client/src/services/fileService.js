import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getFiles = () => axios.get(`${BASE_URL}/files`);

export const uploadFiles = (formData, onUploadProgress) =>
  axios.post(`${BASE_URL}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });

export const deleteFiles = (ids) =>
  axios.delete(`${BASE_URL}/files`, {
    data: { ids },
  });
