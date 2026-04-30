<template>
  <div id="app">
    <div class="public-wrap">

      <!-- ===== TOPBAR ===== -->
      <header class="public-topbar" ref="topbarEl">
        <div class="topbar-left">
          <div class="brand-mark">LMG</div>
          <div class="brand-copy">
            <div class="brand-title">Architectural Rentals</div>
            <div class="brand-subtitle">Customer Portal</div>
          </div>
        </div>

        <div class="public-topbar-center">
          <div class="title">{{ t("welcome") }}</div>
        </div>

        <!-- RIGHT SIDE -->
        <div class="topbar-right" ref="dropdownArea">

          <!-- ACTIONS (About / Contact) -->
          <div class="topbar-actions">
            <button class="action" @click="aboutOpen = true">{{ t('about') || 'About' }}</button>
            <button class="action" @click="contactOpen = true">{{ t('contact') || 'Contact' }}</button>
          </div>

          <!-- PROFILE ICON -->
          <div class="profile-icon" @click="toggleMenu">
            <span>👤</span>
          </div>

          <!-- DROPDOWN -->
          <transition name="fade-slide">
            <div v-if="menuOpen" class="dropdown-menu">

              <!-- USER INFO -->
              <div class="user-info">
                <strong>{{ isAuthenticated ? userName : t("guest") }}</strong>
              </div>

              <!-- LOGIN (only if NOT authenticated) -->
              <button v-if="!isAuthenticated" @click="goToLogin">
                {{ t("login") }}
              </button>

              <!-- LOGOUT (only if authenticated & token valid) -->
              <button v-if="isAuthenticated" @click="handleLogout">
                {{ t("logout") }}
              </button>

              <!-- LANGUAGE -->
              <select v-model="selectedLang" @change="changeLang">
                <option value="en">English</option>
                <option value="am">አማርኛ</option>
                <option value="om">Afaan Oromoo</option>
              </select>

            </div>
          </transition>

        </div>
      </header>

      <!-- MODALS -->
      <AboutModal v-model="aboutOpen" />
      <ContactModal v-model="contactOpen" />

      <!-- MAIN -->
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
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { authToken, isAuthenticated, userName, logout } from "./authState.js";
import AboutModal from "./components/AboutModal.vue";
import ContactModal from "./components/ContactModal.vue";

// --------------------------
// FIXED TOPBAR SPACING
// --------------------------
const topbarEl = ref(null);
let topbarResizeObserver;

const syncTopbarHeightVar = () => {
  const el = topbarEl.value;
  if (!el) return;
  const height = Math.ceil(el.getBoundingClientRect().height);
  document.documentElement.style.setProperty("--app-topbar-h", `${height}px`);
};

// --------------------------
// Router & i18n
// --------------------------
const router = useRouter();
const { t, locale } = useI18n();

// --------------------------
// LANGUAGE
// --------------------------
const selectedLang = ref(localStorage.getItem("lang") || "en");
locale.value = selectedLang.value;

const changeLang = () => {
  locale.value = selectedLang.value;
  localStorage.setItem("lang", selectedLang.value);
  menuOpen.value = false;
};

watch(locale, (lang) => localStorage.setItem("lang", lang));

// --------------------------
// DROPDOWN
// --------------------------
const menuOpen = ref(false);
const dropdownArea = ref(null);

// Modals
const aboutOpen = ref(false);
const contactOpen = ref(false);

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const handleClickOutside = (e) => {
  if (dropdownArea.value && !dropdownArea.value.contains(e.target)) {
    menuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);

  // Keep layout padding in sync with the fixed header height
  syncTopbarHeightVar();
  if (window.ResizeObserver && topbarEl.value) {
    topbarResizeObserver = new ResizeObserver(() => syncTopbarHeightVar());
    topbarResizeObserver.observe(topbarEl.value);
  } else {
    window.addEventListener("resize", syncTopbarHeightVar);
  }

  // Sync auth state for deployed SPA
  if (authToken.value) {
    // Ensure auto logout is scheduled
    // This is already handled in authState.js
  }
});

// Clean up
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);

  if (topbarResizeObserver) {
    topbarResizeObserver.disconnect();
    topbarResizeObserver = undefined;
  }
  window.removeEventListener("resize", syncTopbarHeightVar);
});

// --------------------------
// LOGOUT ACTION
// --------------------------
const handleLogout = () => {
  logout(); // reactive logout
  menuOpen.value = false;
  router.push("/login");
};

// --------------------------
// GO TO LOGIN
// --------------------------
const goToLogin = () => {
  menuOpen.value = false;
  router.push("/login");
};

// --------------------------
// CROSS-TAB SYNC
// --------------------------
window.addEventListener("storage", (event) => {
  if (event.key === "token" || event.key === "user") {
    // reactive state in authState.js updates automatically
    // dropdown buttons will reflect current auth state
  }
});
</script>


<style>
/* ===== PAGE WRAPPER ===== */
.public-wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 90% 0%, rgba(11, 106, 110, 0.08), transparent 45%),
    radial-gradient(circle at 5% 20%, rgba(245, 158, 11, 0.08), transparent 38%),
    var(--bg);
}

/* ===== TOPBAR ===== */
.public-topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 76px;
  background: #0b6a6e;
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  border-bottom: 1px solid var(--line);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  z-index: 1000;
  backdrop-filter: blur(10px);
  overflow: visible !important;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--brand), #0f766e);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  letter-spacing: 0.08em;
  box-shadow: 0 12px 24px rgba(11, 106, 110, 0.25);
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-title {
  font-weight: 700;
  font-size: 15px;
  color: #f8fafc;
}

.brand-subtitle {
  font-size: 12px;
  color: rgba(248, 250, 252, 0.78);
  letter-spacing: 0.02em;
}

/* Center title */
.public-topbar-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(248, 250, 252, 0.78);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* RIGHT AREA */
.topbar-right {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: visible !important;
  z-index: 2000;
  padding-right: 12px;
}

.topbar-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-right: 10px;
}

.topbar-actions .action {
  background: #ffffff;
  color:black;
  border: 1px solid var(--line);
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: 0.2s ease;
}

.topbar-actions .action:hover {
  background:  rgba(200, 215, 216, 0.87);
  border-color: rgba(213, 230, 230, 0.92);
}

/* PROFILE ICON */
.profile-icon {
  width: 42px;
  height: 42px;
  background: #0f172a;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.18);
  overflow: visible;
  margin-right: 20px;
}

.profile-icon span {
  display: block;
  line-height: 1;
  transform: translateY(0);
}

.dropdown-menu {
  position: absolute;
  top: 56px;
  right: 0;
  width: 200px;
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18);
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: visible !important;
}

/* User */
.user-info {
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
  color: #0f172a;
}

/* Buttons */
.dropdown-menu button {
  padding: 8px 10px;
  border-radius: 8px;
  border: none;
  background: #0b6a6e;
  color: white;
  cursor: pointer;
  font-weight: 600;
}

.dropdown-menu button:hover {
  background: #07525a;
}

/* Language selector */
.dropdown-menu select {
  padding: 6px 8px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.public-main {
  padding: calc(28px + var(--app-topbar-h, 76px)) 24px 80px;
}

/* Footer */
.public-footer {
  background: #0f172a;
  color: #f8fafc;
  text-align: center;
  padding: 18px 0;
  margin-top: auto;
  font-size: 13px;
}

@media (max-width: 900px) {
  .public-topbar-center {
    display: none;
  }
}

@media (max-width: 640px) {
  .public-topbar {
    height: auto;
    padding: 14px 18px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .topbar-actions {
    display: none;
  }
}

/* Animations */
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
