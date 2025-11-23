import axios from "axios";

const api = axios.create({
  baseURL: "https://lmgtech-4.onrender.com",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
