import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errMsg = (e) =>
  e.response?.data?.message || (e.response ? "Request failed" : "Cannot reach the server");

export const money = (n) => "₹" + Number(n).toFixed(2).replace(/\.00$/, "");

export default api;
