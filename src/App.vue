<template>
  <div id="app">
    <div class="public-wrap">

      <!-- ===== Topbar ===== -->
      <header class="public-topbar">
        <div class="public-topbar-center">
          <div class="title">{{ t("availableProperties") }}</div>
        </div>

        <div class="public-topbar-right">
          <button class="login-btn" @click="goToLogin">{{ t("login") }}</button>

          <select v-model="selectedLang" @change="changeLang" class="lang-select">
            <option value="en">English</option>
            <option value="am">አማርኛ</option>
            <option value="om">Afaan Oromoo</option>
          </select>
        </div>
      </header>

      <!-- ===== Main Content ===== -->
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

const selectedLang = ref(localStorage.getItem("lang") || "en");
locale.value = selectedLang.value;

const changeLang = () => {
  locale.value = selectedLang.value;
  localStorage.setItem("lang", selectedLang.value);
};

const goToLogin = () => router.push("/login");

watch(locale, (lang) => localStorage.setItem("lang", lang));
</script>

<style>
/* ===== Global Layout ===== */
.public-wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: white; /* 🚀 CLEAN FULL WHITE */
}

/* ===== Topbar ===== */
.public-topbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 90px;
  background: #0c5b6fff; /* Same theme as dashboard */
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

/* ===== Topbar Right Controls ===== */
.public-topbar-right {
  position: absolute;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.login-btn {
  background: white;
  color: #0c5b6fff;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s ease;
}

.login-btn:hover {
  background: #e3efe4;
}

.lang-select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  background: white;
  color: #111827;
}

/* ===== Main Area ===== */
.public-main {
  margin-top: 90px; /* Avoid overlap with topbar */
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

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .public-topbar {
    flex-direction: column;
    height: auto;
    padding: 10px;
    text-align: center;
  }

  .public-topbar-center {
    position: static;
    transform: none;
    margin-bottom: 8px;
  }

  .public-topbar-right {
    position: static;
  }

  .public-main {
    margin-top: 120px;
  }
}
</style>
