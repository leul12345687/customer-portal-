// src/services/customerService.js
import axios from "axios";

// -------------------------
// Base API configuration
// -------------------------
const API_BASE_URL = "https://lmgtech-4.onrender.com/customer"; // Adjust to your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// -------------------------
// Helper: Get current language header
// -------------------------
function getLangHeader(lang) {
  const selectedLang = lang || localStorage.getItem("lang") || "en";
  return { "Accept-Language": selectedLang };
}

// -------------------------
// Helper: Get token header
// -------------------------
function getAuthHeader(lang) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");
  return {
    Authorization: `Bearer ${token}`,
    ...getLangHeader(lang),
  };
}

// ===========================================================
// REGISTER CUSTOMER
// ===========================================================
export async function registerCustomer(formData, lang) {
  try {
    const response = await api.post("/register", formData, {
      headers: {
        ...getLangHeader(lang),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error.response?.data || error;
  }
}

// ===========================================================
// LOGIN CUSTOMER
// ===========================================================
export async function loginCustomer(payload, lang) {
  try {
    const response = await api.post("/login", payload, {
      headers: getLangHeader(lang),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

// ===========================================================
// LOGOUT CUSTOMER (FRONTEND ONLY)
// ===========================================================
export function logoutCustomer() {
  localStorage.removeItem("token");
  localStorage.removeItem("customer");
}

// ===========================================================
// GET CUSTOMER PROFILE
// ===========================================================
export async function getCustomerProfile(lang) {
  try {
    const response = await api.get("/profile", {
      headers: getAuthHeader(lang),
    });
    return response.data;
  } catch (error) {
    console.error("Get profile error:", error);
    throw error.response?.data || error;
  }
}

// ===========================================================
// UPDATE CUSTOMER PROFILE
// ===========================================================
export async function updateCustomerProfile(updateData, lang) {
  try {
    const response = await api.patch("/profile", updateData, {
      headers: getAuthHeader(lang),
    });
    return response.data;
  } catch (error) {
    console.error("Update profile error:", error);
    throw error.response?.data || error;
  }
}

// ===========================================================
// Example: Fetch available properties (optional)
// ===========================================================
export async function getAvailableProperties(lang) {
  try {
    const response = await api.get("/properties", {
      headers: getLangHeader(lang),
    });
    return response.data;
  } catch (error) {
    console.error("Fetch properties error:", error);
    throw error.response?.data || error;
  }
}
