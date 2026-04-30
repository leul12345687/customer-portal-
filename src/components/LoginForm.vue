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

        <!-- OR divider -->
        <div class="or-divider">{{ t("or") }}</div>

        <!-- Google login -->
        <button type="button" class="google-btn" @click="handleGoogleLogin">
          {{ t("loginWithGoogle") }}
        </button>

        <!-- Messages -->
        <p v-if="message" class="success-msg">{{ message }}</p>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <p v-if="googleError" class="error-msg">{{ googleError }}</p>
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
import { useI18n } from "vue-i18n";
import { loginCustomer } from "../services/customerService.js";
import { login as authLogin } from "../authState.js";

const { t, locale } = useI18n();

const form = ref({ email: "", password: "" });
const loading = ref(false);
const message = ref("");
const error = ref("");
const googleError = ref("");
const showPassword = ref(false);
const currentGoogleAction = ref("");
const googleSdkLoaded = ref(false);
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
const currentLang = ref(localStorage.getItem("lang") || "en");

onMounted(() => {
  locale.value = currentLang.value;
});

function changeLang() {
  localStorage.setItem("lang", currentLang.value);
  locale.value = currentLang.value;
}

function togglePassword() {
  showPassword.value = !showPassword.value;
}

function loadGoogleSdk() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      googleSdkLoaded.value = true;
      return resolve();
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleSdkLoaded.value = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load Google SDK"));
    document.head.appendChild(script);
  });
}

function initGoogleSdk() {
  if (!googleSdkLoaded.value || !window.google?.accounts?.id) return;

  window.google.accounts.id.initialize({
    client_id: googleClientId,
    callback: handleGoogleCredentialResponse,
    auto_select: false,
  });
}

function promptGoogleSignIn() {
  if (!googleClientId || googleClientId === "YOUR_GOOGLE_CLIENT_ID") {
    googleError.value = t("googleAuthUrlMissing");
    return;
  }

  if (!googleSdkLoaded.value) {
    loadGoogleSdk()
      .then(() => {
        initGoogleSdk();
        window.google.accounts.id.prompt();
      })
      .catch((err) => {
        console.error(err);
        googleError.value = t("googleSdkLoadFailed");
      });
    return;
  }

  initGoogleSdk();
  window.google.accounts.id.prompt();
}

async function handleGoogleCredentialResponse(response) {
  if (!response?.credential) {
    googleError.value = t("googleAuthFailed");
    loading.value = false;
    return;
  }

  const credentials = {
    googleToken: response.credential,
    provider: "google",
  };

  try {
    loading.value = true;
    error.value = "";
    const lang = localStorage.getItem("lang") || "en";
    const res = await loginCustomer(credentials, lang);

    if (!res?.token) {
      googleError.value = res?.message || t("invalidCredentials");
      return;
    }

    authLogin(res.token, res.customer);
    message.value = res.message;

    const pending = sessionStorage.getItem("pendingBooking");
    if (pending) {
      const bookingData = JSON.parse(pending);
      sessionStorage.removeItem("pendingBooking");

      setTimeout(() => {
        window.location.href = "/#/app/booking?" + new URLSearchParams(bookingData).toString();
      }, 300);
      return;
    }

    setTimeout(() => {
      window.location.href = "/#/app/dashboard";
    }, 300);
  } catch (err) {
    googleError.value = err.response?.data?.message || err.message || t("googleLoginFailed");
  } finally {
    loading.value = false;
  }
}

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

    authLogin(res.token, res.customer);
    await new Promise((r) => setTimeout(r, 100));
    message.value = res.message;

    const pending = sessionStorage.getItem("pendingBooking");
    if (pending) {
      const bookingData = JSON.parse(pending);
      sessionStorage.removeItem("pendingBooking");

      setTimeout(() => {
        window.location.href = "/#/app/booking?" + new URLSearchParams(bookingData).toString();
      }, 300);
      return;
    }

    setTimeout(() => {
      window.location.href = "/#/app/dashboard";
    }, 300);
  } catch (err) {
    error.value = err.response?.data?.message || err.message || t("loginFailed");
  } finally {
    loading.value = false;
  }
}

function handleGoogleLogin() {
  googleError.value = "";
  currentGoogleAction.value = "login";
  promptGoogleSignIn();
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

  .or-divider {
    margin: 8px 0;
    text-align: center;
    color: #6b7280;
    font-weight: 600;
  }

  .google-btn {
    background-color: #4285f4;
    color: white;
    border: none;
    border-radius: 10px;
    padding: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.25s ease;
  }

  .google-btn:hover {
    background-color: #3367d6;
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


