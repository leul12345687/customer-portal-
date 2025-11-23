<template>
  <div id="app">
    <div class="public-wrap">

      <!-- ===== Topbar ===== -->
      <header class="public-topbar">
        <div class="public-topbar-center">
          <div class="title">{{ t("welcome") }}</div>
        </div>

        <!-- ===== Profile Icon Dropdown ===== -->
        <div class="profile-container">
          <div class="profile-icon" @click="toggleMenu">
            <span>👤</span>
          </div>

          <!-- Dropdown -->
          <div v-if="menuOpen" class="dropdown-menu">
            <button @click="goToLogin">{{ t("login") }}</button>
            <button @click="logout">Logout</button>

            <select v-model="selectedLang" @change="changeLang">
              <option value="en">English</option>
              <option value="am">አማርኛ</option>
              <option value="om">Afaan Oromoo</option>
            </select>
          </div>
        </div>
      </header>

      <!-- ===== Main Content ===== -->
      <main class="public-main">
        <RouterView />
      </main>

      <!-- ===== Footer ===== -->
      <footer class="public-footer">
        © {{ new Date().getFullYear() }} LMG Tech System — {{ t("rights") }}
      </footer>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const router = useRouter();
const { t, locale } = useI18n();

const selectedLang = ref(localStorage.getItem("lang") || "en");
locale.value = selectedLang.value;

const menuOpen = ref(false);

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const goToLogin = () => {
  menuOpen.value = false;
  router.push("/login");
};

const logout = () => {
  localStorage.removeItem("token");     // remove auth token
  localStorage.removeItem("user");      // optional: remove stored user data
  menuOpen.value = false;               // close menu
  router.push("/login");                // redirect to login
};

const changeLang = () => {
  locale.value = selectedLang.value;
  localStorage.setItem("lang", selectedLang.value);
  menuOpen.value = false; // close dropdown after selecting language
};

watch(locale, (lang) => localStorage.setItem("lang", lang));
</script>

<style>
/* ===== Global Layout ===== */
.public-wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: white;
}

/* ===== Topbar ===== */
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
  padding: 0 20px;
  z-index: 1000;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.public-topbar-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.title {
  font-weight: 700;
  font-size: 20px;
}

/* ===== Profile Icon ===== */
.profile-container {
  position: absolute;
  right: 20px;       /* EXACT 20px from the right side */
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-icon {
  width: 40px;
  height: 40px;
  background: white;
  color: #0c5b6fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

/* ===== Dropdown ===== */
.dropdown-menu {
  position: absolute;
  top: 50px;
  right: 0;
  width: 150px;
  background: white;
  color: #111827;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dropdown-menu button {
  padding: 8px 10px;
  border-radius: 6px;
  background: #0c5b6fff;
  color: white;
  border: none;
  cursor: pointer;
}

.dropdown-menu select {
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

/* ===== Main Area ===== */
.public-main {
  margin-top: 90px;
  padding: 20px;
  width: 100%;
}

/* ===== Footer ===== */
.public-footer {
  background: #111827;
  color: white;
  text-align: center;
  padding: 12px 0;
  margin-top: auto;
}
</style>
