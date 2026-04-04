import axios from "axios";

const API_BASE_URL = "https://lmgtech-4.onrender.com/customer"; // Your NestJS API

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// ===========================================================
// 🔄 Automatically attach language + token for every request
// ===========================================================
api.interceptors.request.use((config) => {
  const lang = localStorage.getItem("lang") || "en";
  const token = localStorage.getItem("token");

  config.headers = config.headers || {};
  config.headers["Accept-Language"] = lang; // 👈 Multi-language support

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

// ===========================================================
// ✅ REGISTER CUSTOMER (supports multi-language)
// ===========================================================
export async function registerCustomer(formData) {
  try {
    const response = await api.post("/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error.response?.data || error;
  }
}

export async function registerCustomerJson(payload) {
  try {
    const response = await api.post("/register", payload);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error.response?.data || error;
  }
}

// ===========================================================
// ✅ LOGIN CUSTOMER (supports multi-language)
// ===========================================================
export async function loginCustomer(payload) {
  try {
    const response = await api.post("/login", payload);
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error.response?.data || error;
  }
}

// ===========================================================
// 🚪 LOGOUT CUSTOMER
// ===========================================================
export function logoutCustomer() {
  localStorage.removeItem("token");
  localStorage.removeItem("customer");
}
