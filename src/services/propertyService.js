import axios from "axios";

const api = axios.create({
  baseURL: "https://lmgtech-4.onrender.com",
});

// 🔄 Automatically attach token + language to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const lang = localStorage.getItem("lang") || "en";

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Always send selected language
  config.params = config.params || {};
  config.params.lang = lang;

  return config;
});   
// =====================
// Fetch all categories
// =====================
export async function getCategories() {
  try {
    const res = await api.get("/customer/categories"); // use 'api' to include baseURL + interceptors
    // Expected response format: { categories: ["EventSupply","ConstructionEquipment","HealthcareMedical"] }
    return res.data;
  } catch (err) {
    console.error("❌ Failed to fetch categories:", err);
    throw err;
  }
}

// ✅ Get properties by category (multi-language supported)
export async function getPropertiesByCategory(category) {
  try {
    const response = await api.get("/customer/properties", {
      params: { category },
    });

    return response.data;
  } catch (error) {
    console.error("Property fetch error:", error);
    throw error;
  }
}
