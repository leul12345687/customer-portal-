<template>
  <div class="register-page">
    <div class="register-card">
      <h2>{{ t("register.title") }}</h2>
      <p class="subtitle">{{ t("register.subtitle") }}</p>

      <form @submit.prevent="handleRegister" enctype="multipart/form-data" class="register-form">
        
        <!-- Full Name -->
        <div class="group">
          <label class="label">{{ t("register.fullName") }}</label>
          <input v-model="form.fullName" type="text" :placeholder="t('register.fullNamePlaceholder')" class="input" required />
        </div>

        <!-- Email -->
        <div class="group">
          <label class="label">{{ t("register.email") }}</label>
          <input v-model="form.email" type="email" :placeholder="t('register.emailPlaceholder')" class="input" required />
        </div>

        <!-- Password -->
        <div class="group md:col-span-2">
          <label class="label">{{ t("register.password") }}</label>
          <div class="password-wrapper">
            <input :type="showPassword ? 'text' : 'password'" v-model="form.password" :placeholder="t('register.passwordPlaceholder')" class="input" required />
            <button type="button" class="toggle-btn" @click="togglePassword">
              {{ showPassword ? t('register.hide') : t('register.show') }}
            </button>
          </div>
        </div>

        <!-- Phone -->
        <div class="group">
          <label class="label">{{ t("register.phone") }}</label>
          <input v-model="form.phonenumber" type="number" :placeholder="t('register.phonePlaceholder')" class="input" required />
        </div>

        <!-- Account Number -->
        <div class="group">
          <label class="label">{{ t("register.accountNumber") }}</label>
          <input v-model="form.acountnumber" type="number" :placeholder="t('register.accountNumberPlaceholder')" class="input" required />
        </div>

        <!-- Address -->
        <div class="group md:col-span-2">
          <label class="label">{{ t("register.address") }}</label>
          <input v-model="form.address" type="text" :placeholder="t('register.addressPlaceholder')" class="input" required />
        </div>

        <!-- Profile Picture -->
        <div class="group md:col-span-2">
          <label class="label">{{ t("register.profilePicture") }}</label>
          <input type="file" @change="handleFileUpload" accept="image/*" class="file-input" required />
        </div>

        <!-- Submit Button -->
        <div class="col-span-2 text-center mt-4">
          <button type="submit" :disabled="loading" class="submit-btn">
            <span v-if="loading">{{ t("register.loading") }}</span>
            <span v-else>{{ t("register.submit") }}</span>
          </button>

          <p v-if="message" class="success-msg">{{ message }}</p>
          <p v-if="error" class="error-msg">{{ error }}</p>
        </div>
      </form>

      <div class="login-redirect">
        {{ t("register.alreadyHaveAccount") }}
        <router-link to="/login" class="login-link">{{ t("register.loginHere") }}</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { registerCustomer } from "../services/customerService.js";

const { t, locale } = useI18n();

const form = ref({
  fullName: "",
  email: "",
  password: "",
  phonenumber: "",
  acountnumber: "",
  address: "",
});

const file = ref(null);
const loading = ref(false);
const message = ref("");
const error = ref("");
const showPassword = ref(false);

function handleFileUpload(e) {
  file.value = e.target.files[0];
}

function togglePassword() {
  showPassword.value = !showPassword.value;
}

async function handleRegister() {
  loading.value = true;
  message.value = "";
  error.value = "";

  try {
    const formData = new FormData();
    Object.entries(form.value).forEach(([key, value]) => formData.append(key, value));

    // IMPORTANT: NestJS expects "profilePictureFile"
    if (file.value) formData.append("profilePictureFile", file.value);

    const lang = locale.value; // am | en | or | etc
    const res = await registerCustomer(formData, lang);

    message.value = res.message; // message already in multilingual response

    // Reset Form
    form.value = { fullName: "", email: "", password: "", phonenumber: "", acountnumber: "", address: "" };
    file.value = null;

  } catch (err) {
    error.value = err?.message || t("register.failed");
  } finally {
    loading.value = false;
  }
}
</script>


<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to bottom right, #eff6ff, #ffffff, #dbeafe);
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 3xl;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-blur: 10px;
  padding: 2.5rem;
  border-radius: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}
.register-card:hover {
  box-shadow: 0 25px 50px rgba(59, 130, 246, 0.3);
}

h2 {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e40af;
  margin-bottom: 0.5rem;
}

.subtitle {
  text-align: center;
  color: #6b7280;
  margin-bottom: 2rem;
}

.register-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}
@media (min-width: 768px) {
  .register-form {
    grid-template-columns: repeat(2, 1fr);
  }
}

.input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 1rem;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  background-color: white;
  transition: 0.3s;
}
.input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.password-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 1rem;
  overflow: hidden;
  transition: 0.3s;
}
.password-wrapper:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}
.password-wrapper input {
  flex: 1;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  border-radius: 0;
}
.toggle-btn {
  background: none;
  border: none;
  color: #2563eb;
  font-weight: 600;
  cursor: pointer;
  padding: 0 1rem;
  transition: 0.2s;
}
.toggle-btn:hover {
  background-color: #eff6ff;
}

.file-input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 1rem;
  padding: 0.75rem;
  background-color: #f9fafb;
  cursor: pointer;
  transition: 0.3s;
}
.file-input:hover {
  background-color: #f3f4f6;
}

.submit-btn {
  background: linear-gradient(to right, #2563eb, #1e40af);
  color: white;
  font-weight: 600;
  padding: 0.75rem 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
  transition: all 0.3s;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.4);
}
.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.success-msg {
  color: #16a34a;
  font-weight: 500;
  text-align: center;
}
.error-msg {
  color: #dc2626;
  font-weight: 500;
  text-align: center;
}

.login-redirect {
  text-align: center;
  margin-top: 1.5rem;
  color: #6b7280;
}
.login-link {
  color: #2563eb;
  font-weight: 600;
  margin-left: 0.25rem;
}
.login-link:hover {
  text-decoration: underline;
}
</style>
