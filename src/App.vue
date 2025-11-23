<template> 
  <div id="app">
    <div class="public-wrap">

      <!-- ===== TOPBAR ===== -->
      <header class="public-topbar">

        <!-- Center Title -->
        <div class="public-topbar-center">
          <div class="title">{{ t("welcome") }}</div>
        </div>

        <!-- RIGHT SIDE (PROFILE + MENU) -->
        <div class="topbar-right" ref="dropdownArea">

          <!-- PROFILE ICON -->
          <div class="profile-icon" @click="toggleMenu">
            <span>👤</span>
          </div>

          <!-- Animated Dropdown -->
          <transition name="fade-slide">
            <div v-if="menuOpen" class="dropdown-menu">

              <!-- User Name -->
              <div class="user-info">
                <strong>{{ userName }}</strong>
              </div>

              <button @click="goToLogin">{{ t("login") }}</button>
              <button @click="logout">Logout</button>

              <select v-model="selectedLang" @change="changeLang">
                <option value="en">English</option>
                <option value="am">አማርኛ</option>
                <option value="om">Afaan Oromoo</option>
              </select>
            </div>
          </transition>

        </div>

      </header>

      <!-- MAIN CONTENT -->
      <main class="public-main">
        <RouterView />
      </main>

      <!-- FOOTER -->
      <footer class="public-footer">
        © {{ new Date().getFullYear() }} LMG Tech System — {{ t("rights") }}
      </footer>

    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const router = useRouter();
const { t, locale } = useI18n();

// User name from localStorage
const userName = ref("");
const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
userName.value = storedUser?.name || "Guest";

// Language state
const selectedLang = ref(localStorage.getItem("lang") || "en");
locale.value = selectedLang.value;

// Dropdown state
const menuOpen = ref(false);

// Reference for outside click
const dropdownArea = ref(null);

// Toggle dropdown open/close
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

// Close menu when clicking outside
const handleClickOutside = (event) => {
  if (dropdownArea.value && !dropdownArea.value.contains(event.target)) {
    menuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

// Navigation & Actions
const goToLogin = () => {
  menuOpen.value = false;
  router.push("/login");
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  menuOpen.value = false;
  router.push("/login");
};

const changeLang = () => {
  locale.value = selectedLang.value;
  localStorage.setItem("lang", selectedLang.value);
  menuOpen.value = false;
};

watch(locale, (lang) => localStorage.setItem("lang", lang));
</script>

<style>
/* ===== PAGE WRAPPER ===== */
.public-wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: white;
}

/* ===== TOPBAR ===== */
.public-topbar {
  position:fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 90px;
  background: #0c5b6fff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 0 25px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

/* Center title */
.public-topbar-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.title {
  font-size: 22px;
  font-weight: bold;
}
/* RIGHT SIDE AREA — FIXED */
.topbar-right {
  position: absolute;
  right: 20px;          /* ← not too close to the edge */
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;

  /* PREVENT CLIPPING */
  overflow: visible;
  z-index: 2000;
}

/* PROFILE ICON FIX */
.profile-icon {
  width: 42px;
  height: 42px;
  background: white;
  color: #0c5b6fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 22px;

  /* IMPORTANT FIX FOR CUTTING OFF */
  margin-right: 5px;   /* add small inner spacing */
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
}

/* Dropdown menu */
.dropdown-menu {
  margin-top: 10px;
  width: 180px;
  background: white;
  border-radius: 10px;
  padding: 12px;
  color: #111827;
  box-shadow: 0 4px 14px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* User name section */
.user-info {
  padding-bottom: 8px;
  border-bottom: 1px solid #ddd;
  font-size: 15px;
  color: #333;
}

/* Buttons */
.dropdown-menu button {
  padding: 8px 10px;
  border-radius: 6px;
  border: none;
  background: #0c5b6fff;
  color: white;
  cursor: pointer;
}

.dropdown-menu button:hover {
  background: #094652;
}

/* Language selector */
.dropdown-menu select {
  padding: 6px 8px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #ccc;
}

/* Main content spacing */
.public-main {
  margin-top: 110px;
  padding: 20px;
}

/* Footer */
.public-footer {
  background: #111827;
  color: white;
  text-align: center;
  padding: 12px 0;
  margin-top: auto;
}

/* ===== Animation for dropdown ===== */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
