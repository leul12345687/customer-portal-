import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://lmgtech-4.onrender.com",
});

// ✅ Attach token and Accept-Language for every request
api.interceptors.request.use((config) => {
  const lang = localStorage.getItem("lang") || "en";
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers["Accept-Language"] = lang;
  return config;
});

// ✅ Intercept responses for showing messages
api.interceptors.response.use(
  (response) => {
    if (response.data?.message) {
      console.log("Success:", response.data.message); // replace with toast
    }
    return response;
  },
  (error) => {
    if (error.response?.data?.message) {
      console.log("Error:", error.response.data.message);
    } else {
      console.log("Error: Something went wrong");
    }
    return Promise.reject(error);
  }
);

export default api;
