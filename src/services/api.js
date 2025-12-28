// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://lmgtech-9v5x.onrender.com",
  withCredentials: true, // required for cookies if any
});

// Automatically attach JWT + language
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // must be customer JWT
    const lang = localStorage.getItem("lang") || "en";

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No token found in localStorage");
    }

    config.headers["Accept-Language"] = lang;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
