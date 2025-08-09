// lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://mandaya-award-api-production.up.railway.app",
  headers: {
    "Content-Type": "application/json",
  },
});

// Fix: Ensure headers object exists before modifying it
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers || {}; // ✅ make sure headers is not undefined
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
