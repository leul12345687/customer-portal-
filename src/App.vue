<template>
  <div id="app">
    <!-- ✅ Public Layout (Property List + Topbar) -->
    <div class="public-wrap">
      <header class="public-topbar">
        <!-- Centered Title -->
        <div class="public-topbar-center">
          <div class="title">{{ t("availableProperties") }}</div>
        </div>

        <!-- Right side: Login + Language -->
        <div class="public-topbar-right">
          <button class="login-btn" @click="goToLogin">{{ t("login") }}</button>
          <select v-model="selectedLang" @change="changeLang" class="lang-select">
            <option value="en">English</option>
            <option value="am">አማርኛ</option>
            <option value="om">Afaan Oromoo</option>
          </select>
        </div>
      </header>

      <!-- 🌍 Main content -->
      <main class="public-main">
        <RouterView />
      </main>

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

// 🌐 Reactive language selection
const selectedLang = ref(localStorage.getItem("lang") || "en");
locale.value = selectedLang.value;

// Update i18n and localStorage whenever user changes language
const changeLang = () => {
  locale.value = selectedLang.value; // update vue-i18n
  localStorage.setItem("lang", selectedLang.value); // persist selection
};

// Navigate to login page
const goToLogin = () => router.push("/login");

// Optional: watch locale changes and persist automatically
watch(locale, (newLang) => {
  localStorage.setItem("lang", newLang);
});
</script>

<style>
/* ===== Public Layout ===== */
.public-wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f3f4f6;
}

/* ===== Topbar ===== */
.public-topbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background: #20b2aa; /* blue-green */
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

/* Center title */
.public-topbar-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.title {
  font-weight: 700;
  font-size: 20px;
  text-align: center;
}

/* Right section */
.public-topbar-right {
  position: absolute;
  right: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Login button */
.login-btn {
  background: white;
  color: #20b2aa;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s ease;
}

.login-btn:hover {
  background: #e0f7f5;
}

/* Language dropdown */
.lang-select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  background: white;
  color: #111827;
}

/* ===== Main ===== */
.public-main {
  margin-top: 100px;
  padding: 24px;
}

/* ===== Footer ===== */
.public-footer {
  background: #111827;
  color: #fff;
  text-align: center;
  padding: 12px 0;
  margin-top: auto;
}
</style>
