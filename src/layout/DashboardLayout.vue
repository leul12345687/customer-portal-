<template>
  <div class="layout">
    
    <!-- 📂 Sidebar -->
    <aside :class="['sidebar', { open: sidebarOpen }]">
      <div class="sidebar-brand">LMG</div>

      <nav class="nav">
        <RouterLink to="/app/dashboard" active-class="active-link">🏠 {{ t("dashboard") }}</RouterLink>
        <RouterLink to="/app/property" active-class="active-link">🏢 {{ t("listOfProperties") }}</RouterLink>
        <RouterLink to="/app/booking" active-class="active-link">📝 {{ t("createBooking") }}</RouterLink>
        <RouterLink to="/app/my-bookings" active-class="active-link">📋 {{ t("myBookings") }}</RouterLink>
        <RouterLink to="/app/all-bookings" active-class="active-link">🌍 {{ t("allBookings") }}</RouterLink>
        <RouterLink to="/app/profile" active-class="active-link">👤 {{ t("profile") }}</RouterLink>
      </nav>

      <!-- 🚪 Logout -->
      <button class="logout" @click="logout">🔓 {{ t("logout") }}</button>
    </aside>

    <!-- 📱 Mobile Sidebar Toggle -->
    <button class="menu-btn" @click="sidebarOpen = !sidebarOpen">
      ☰
    </button>

    <!-- 📑 Content Area -->
    <section class="content">
      <RouterView />
    </section>

  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const router = useRouter();
const { t } = useI18n();
const sidebarOpen = ref(false);

const logout = () => {
  localStorage.removeItem("token");
  router.push("/login");
};
</script>

<style scoped>
/* ===== Layout Container ===== */
/* ===== Layout Container ===== */
.layout {
  display: flex;
  min-height: 100vh;
  background: white;
  margin: 0;            /* 🚀 Prevents unwanted gap */
  padding: 0;           /* 🚀 Ensures sidebar touches left edge */
}

/* ===== Sidebar ===== */
.sidebar {
  width: 220px;
  background: #97b4e0ff;
  padding: 20px 10px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #0e7c6d;
  position: fixed;       /* 🚀 Ensures it starts from the very left */
  left: 0;
  top: 0;
  bottom: 0;
  transition: transform 0.3s ease;
  transform: translateX(0); /* Desktop visible */
}

.sidebar-brand {
  font-weight: 900;
  font-size: 22px;
  text-align: center;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav a {
  color: black;
  text-decoration: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 17px;
  transition: background 0.2s;
}

.nav a.active-link,
.nav a:hover {
  background: #0c5b6fff;
  color: white;
}

/* ===== Logout Button ===== */
.logout {
  margin-top: auto;
  padding: 12px;
  background: #efde44ff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}
.logout:hover {
  background: #dc5a26ff;
}

/* ===== Content Area ===== */
.content {
  flex: 1;
  background: white;
  padding: 20px;
  margin-left: 220px;     /* 🚀 Keeps content shifted next to sidebar in desktop */
  width: calc(100% - 220px);
}

/* ===== Mobile Toggle Button ===== */
.menu-btn {
  display: none;
  position: fixed;
  top: 15px;
  left: 15px;
  background: #0c5b6fff;
  color: white;
  padding: 10px 14px;
  border: none;
  border-radius: 6px;
  font-size: 20px;
  z-index: 2000;
}

/* ===== Mobile Responsive ===== */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%); /* hidden */
  }

  .sidebar.open {
    transform: translateX(0); /* slide in */
  }

  .content {
    margin-left: 0 !important;
    padding-top: 60px;
    width: 100%;
  }

  .menu-btn {
    display: block;
  }
}


</style>
