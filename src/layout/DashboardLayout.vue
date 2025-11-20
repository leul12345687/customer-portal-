<template>
  <div class="layout">
    <!-- 🧭 Top Bar -->
    <header class="topbar">
      <div class="center">
        <div class="brand">{{ t("welcome") }}</div>
      </div>

      <div class="right">
        <!-- 🚪 Logout Button -->
        <button class="logout" @click="logout">{{ t("logout") }}</button>

        <!-- 🌐 Language Selector -->
        <label for="lang-dash" class="sr-only">{{ t("selectLanguage") }}</label>
        <select v-model="locale" @change="changeLang" class="lang-select">
          <option value="en">English</option>
          <option value="am">አማርኛ</option>
          <option value="om">Afaan Oromoo</option>
        </select>
      </div>
    </header>

    <div class="main-area">
      <!-- 📂 Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-brand">LMG</div>
        <nav class="nav">
          <RouterLink to="/app/dashboard" active-class="active-link">
            🏠 {{ t("dashboard") }}
          </RouterLink>
          <RouterLink to="/app/property" active-class="active-link">
            🏢 {{ t("listOfProperties") }}
          </RouterLink>
          <RouterLink to="/app/booking" active-class="active-link">
            📝 {{ t("createBooking") }}
          </RouterLink>
          <RouterLink to="/app/my-bookings" active-class="active-link">
            📋 {{ t("myBookings") }}
          </RouterLink>
          <RouterLink to="/app/all-bookings" active-class="active-link">
            🌍 {{ t("allBookings") }}
          </RouterLink>
          <RouterLink to="/app/profile" active-class="active-link">
            👤 {{ t("profile") }}
          </RouterLink>
        </nav>
      </aside>

      <!-- 📑 Main Content -->
      <section class="content">
        <RouterView />
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import api from "../services/api.js"; // Axios instance

const router = useRouter();
const { t, locale } = useI18n();
const isLoading = ref(false);

// ✅ Complete list of backend endpoints (multilingual refetch)
const endpoints = [
  // Customer endpoints
  "/customer/all",
  "/customer/register",
  "properties/category/:catagory",
  "/customer/login",
  "/customer/:id",

  // Property endpoints
  "/property/all",

  // Booking endpoints
  "/booking/all",

  // Lease endpoints
  "/lease/all",

  // Payment endpoints
  "/payment/all",
];

// 🔄 Function to refetch all backend endpoints
const refetchCoreData = async () => {
  isLoading.value = true;
  try {
    const fetches = endpoints.map(ep => {
      const url = ep.includes(":id") ? ep.replace(":id", "sampleId") : ep;
      return api.get(url).catch(err => {
        console.warn(`❌ Failed to fetch ${url}:`, err.message);
        return null;
      });
    });
    const results = await Promise.all(fetches);
    console.log("🌐 Refetched all multilingual data:", results);
  } catch (err) {
    console.error("❌ Language-based refetch failed:", err);
  } finally {
    isLoading.value = false;
  }
};

// ✅ Load saved language and refetch all data
onMounted(async () => {
  const savedLang = localStorage.getItem("lang") || "en";
  locale.value = savedLang;
  api.defaults.headers.common["Accept-Language"] = savedLang;
  await refetchCoreData();
});

// 🚪 Logout handler
const logout = () => {
  localStorage.removeItem("token");
  router.push("/login");
};

// 🌐 Handle language change
const changeLang = async () => {
  localStorage.setItem("lang", locale.value);
  api.defaults.headers.common["Accept-Language"] = locale.value;
  await refetchCoreData();
};

// 🛡 Axios response interceptor for multilingual messages
api.interceptors.response.use(
  (response) => {
    if (response.data?.message) {
      console.log("✅ Translated message:", response.data.message);
    }
    return response;
  },
  (error) => {
    const errMsg = error.response?.data?.message || t("somethingWentWrong");
    console.error("❌", errMsg);
    return Promise.reject(error);
  }
);

// 🔄 Watch locale changes reactively
watch(locale, async (newLang) => {
  api.defaults.headers.common["Accept-Language"] = newLang;
  await refetchCoreData();
});
</script>

<style scoped>
/* ===== Layout ===== */
.layout { min-height: 100vh; display: flex; flex-direction: column; background: #ffffff; }

/* ===== Topbar ===== */
.topbar { position: fixed; top: 0; left: 0; width: 100%; height: 100px; background: #0c5b6fff; color:white; display: flex; align-items: center; justify-content: center; padding: 0 20px; z-index: 1000; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15); }
.topbar .center { position: absolute; left: 50%; transform: translateX(-50%); text-align: center; }
.brand { font-weight: 700; font-size: 18px; }

/* ===== Right Controls ===== */
.topbar .right { position: absolute; right: 12px; display: flex; align-items: center; gap: 10px; }
.logout { background: #efde44ff; color:black; border: none; padding: 7px 12px; border-radius: 8px; cursor: pointer; transition: background 0.2s; font-weight: 600; }
.logout:hover { background: #dc5a26ff; }
.lang-select { padding: 6px 10px; border-radius: 6px; border: 1px solid #d1d5db; font-size: 14px; background: white; color: #111827; }

/* ===== Main Area ===== */
.main-area { display: flex; width: 100%; margin-top: 5px; min-height: calc(100vh - 80px); }

/* ===== Sidebar ===== */
.sidebar { position: fixed; top: 80px; left: 0; bottom: 0; width: 200px; background: #97b4e0ff; padding: 0px; display: flex; flex-direction: column; border-right: 1px solid #0e7c6d; overflow-y: auto; color: black; }
.sidebar-brand { font-weight: 800; font-size: 20px; text-align: center; margin-bottom: 24px; color: black; }
.nav { 
  display: flex; 
  flex-direction: column; 
  gap: 10px; 
}

.nav a { 
  color: black; 
  text-decoration: none; 
  padding: 10px; 
  border-radius: 6px; 
  font-weight: 700; 
  transition: background 0.2s; 
  
  /* ✅ ADD/CHANGE THIS LINE FOR LARGER FONT SIZE */
  font-size: 18px; /* Changed from default to 18px for noticeable size increase */
}
.nav a.active-link, .nav a:hover { background: #0c5b6fff; color: white; }

/* ===== Main Content ===== */
.content { margin-left: 200px; padding: 0px; width: calc(100% - 200px); background: #ffffff; min-height: calc(100vh - 80px); }

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .sidebar { width: 160px; font-size: 14px; }
  .content { margin-left: 160px; padding: 16px; }
  .topbar { flex-direction: column; height: auto; padding: 10px; }
  .topbar .right { position: static; margin-top: 8px; }
}

/* Accessibility */
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
</style>
