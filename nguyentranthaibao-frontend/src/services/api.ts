


import axios from "axios";
import Cookies from "js-cookie";

export const IMAGE_BASE = "http://localhost:8000";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  // uu tiên localStorage
  let token = localStorage.getItem("token");

  // fallback cookie (phòng tru?ng h?p reload)
  if (!token) {
    token = Cookies.get("admin_token") || null;
  }

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error.response?.data || error)
);

export default api;