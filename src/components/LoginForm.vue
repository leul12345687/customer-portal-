<template>
  <div class="login-page">
    <div class="login-card">
      <h2>{{ t("login") }}</h2>

      
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Email -->
        <div class="form-group">
          <label>{{ t("email") }}</label>
          <input
            v-model="form.email"
            type="email"
            :placeholder="t('emailPlaceholder')"
            required
          />
        </div>

        <!-- Password -->
        <div class="form-group">
          <label>{{ t("password") }}</label>
          <div class="password-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="form.password"
              :placeholder="t('passwordPlaceholder')"
              required
            />
            <button type="button" class="toggle-btn" @click="togglePassword">
              {{ showPassword ? t('hide') : t('show') }}
            </button>
          </div>
        </div>

        <!-- Submit -->
        <button type="submit" :disabled="loading" class="login-btn">
          {{ loading ? t("loggingIn") : t("login") }}
        </button>

        <!-- Messages -->
        <p v-if="message" class="success-msg">{{ message }}</p>
        <p v-if="error" class="error-msg">{{ error }}</p>
      </form>

      <!-- Register Link -->
      <div class="register-link">
        <p>
          {{ t("noAccount") }}
          <router-link to="/register">{{ t("createAccount") }}</router-link>
        </p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { loginCustomer } from "../services/customerService.js";
// ✅ Import reactive authState
import { login as authLogin } from "../authState.js";

// --------------------------
// i18n setup
// --------------------------
const { t, locale } = useI18n();
const router = useRouter();

// --------------------------
// Form state
// --------------------------
const form = ref({ email: "", password: "" });
const loading = ref(false);
const message = ref("");
const error = ref("");
const showPassword = ref(false);

// --------------------------
// Language management
// --------------------------
const currentLang = ref(localStorage.getItem("lang") || "en");

onMounted(() => {
  locale.value = currentLang.value; // Ensure UI reflects current language
});

function changeLang() {
  localStorage.setItem("lang", currentLang.value);
  locale.value = currentLang.value;
}

// --------------------------
// Toggle password visibility
// --------------------------
function togglePassword() {
  showPassword.value = !showPassword.value;
}

// --------------------------
// Handle login
// --------------------------
async function handleLogin() {
  loading.value = true;
  message.value = "";
  error.value = "";

  try {
    const lang = localStorage.getItem("lang") || "en";
    const res = await loginCustomer(form.value, lang);

    if (!res?.token) {
      error.value = res?.message || t("invalidCredentials");
      return;
    }

    // ✅ 1. Persist auth FIRST
    authLogin(res.token, res.user);

    // ✅ 2. Force token flush (important on slow Wi-Fi)
    await new Promise((r) => setTimeout(r, 100));

    message.value = res.message;

    // ✅ 3. Booking redirect (soft)
    const pending = sessionStorage.getItem("pendingBooking");
    if (pending) {
      const bookingData = JSON.parse(pending);
      sessionStorage.removeItem("pendingBooking");

      setTimeout(() => {
        window.location.href =
          "/#/app/booking?" + new URLSearchParams(bookingData).toString();
      }, 300);

      return;
    }

    // ✅ 4. DASHBOARD — HARD GUARANTEED REDIRECT
    setTimeout(() => {
      window.location.href = "/#/app/dashboard";
    }, 300);

  } catch (err) {
    error.value =
      err.response?.data?.message || err.message || t("loginFailed");
  } finally {
    loading.value = false;
  }
}

</script>


<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f3f4f6;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 40px;
  border-radius: 18px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

h2 {
  text-align: center;
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 15px;
  color: #111827;
}

.lang-selector {
  text-align: center;
  margin-bottom: 20px;
}

.lang-selector select {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
}

.password-wrapper {
  display: flex;
  align-items: center;
  border-radius: 10px;
  border: 1px solid #d1d5db;
}

.password-wrapper input {
  flex: 1;
  border: none;
  border-radius: 10px;
  padding: 12px;
}

.toggle-btn {
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  font-weight: 600;
  padding: 0 12px;
}

.login-btn {
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s;
}

.login-btn:disabled {
  background-color: gray;
  cursor: not-allowed;
}

.login-btn:hover:not(:disabled) {
  background-color: #1e40af;
}

.success-msg {
  color: #16a34a;
  text-align: center;
  font-weight: 500;
}

.error-msg {
  color: #dc2626;
  text-align: center;
  font-weight: 500;
}

.register-link {
  text-align: center;
  margin-top: 24px;
}

.register-link a {
  color: #2563eb;
  font-weight: 600;
}
</style>
