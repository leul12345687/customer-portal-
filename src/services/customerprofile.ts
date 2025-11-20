import axios from "axios";

const api = axios.create({
  baseURL:  "http://localhost:3000",
});

// 🔄 Automatically attach token + Accept-Language header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const lang = localStorage.getItem("lang") || "en";

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["Accept-Language"] = lang;
  return config;
});

export default api;
