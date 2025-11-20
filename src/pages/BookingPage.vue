<template>
  <div class="booking-wrapper">
    <div class="booking-card">
      <h2>{{ t("bookingTitle") }}</h2>

      <form @submit.prevent="handleBooking" class="booking-form">
        <!-- Property Name -->
        <div class="form-group">
          <label>{{ t("propertyName") }}</label>
          <input
            v-model="form.assetName"
            type="text"
            :placeholder="t('enterProperty')"
            required
            readonly
          />
        </div>

        <!-- Merchant Email -->
        <div class="form-group">
          <label>{{ t("merchantEmail") }}</label>
          <input
            v-model="form.merchantEmail"
            type="email"
            placeholder="example@merchant.com"
            required
            readonly
          />
        </div>

        <!-- Start and End Date/Time -->
        <div class="form-row">
          <div class="form-group half">
            <label>{{ t("checkIn") }}</label>
            <input
              v-model="form.startDate"
              type="datetime-local"
              required
              @change="autoAdjustEndDate"
            />
          </div>

          <div class="form-group half">
            <label>{{ t("checkOut") }}</label>
            <input
              v-model="form.endDate"
              type="datetime-local"
              required
            />
          </div>
        </div>

        <!-- Number of Property -->
        <div class="form-group">
          <label>{{ t("numberOfProperty") }}</label>
          <input
            v-model.number="form.numberOfProperty"
            type="number"
            min="1"
            required
          />
        </div>

        <!-- Time Interval -->
        <div class="form-group">
          <label>{{ t("timeInterval") }}</label>
          <select v-model="form.timeInterval" required @change="autoAdjustEndDate">
            <option value="hour">{{ t("hour") }}</option>
            <option value="day">{{ t("day") }}</option>
            <option value="week">{{ t("week") }}</option>
            <option value="month">{{ t("month") }}</option>
            <option value="year">{{ t("year") }}</option>
          </select>
        </div>

        <!-- Security Deposit -->
        <div class="form-group">
          <label>{{ t("securityDeposit") }}</label>
          <input
            v-model.number="form.securityDeposit"
            type="number"
            min="0"
            :placeholder="t('optionalDeposit')"
          />
        </div>

        <!-- Submit Button -->
        <button type="submit" :disabled="loading">
          {{ loading ? t("submitting") : t("submitBooking") }}
        </button>
      </form>

      <!-- Feedback -->
      <p v-if="message" class="success-msg">{{ message }}</p>
      <p v-if="error" class="error-msg">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { createBooking } from "../services/bookingService.js";

const { t } = useI18n();
const route = useRoute();

const form = ref({
  assetName: "",
  merchantEmail: "",
  startDate: "",
  endDate: "",
  timeInterval: "hour",
  numberOfProperty: 1,
  securityDeposit: 0,
});

const message = ref("");
const error = ref("");
const loading = ref(false);

// Prefill form from property list
onMounted(() => {
  const { assetName, merchantEmail } = route.query;
  if (assetName) form.value.assetName = assetName;
  if (merchantEmail) form.value.merchantEmail = merchantEmail;
});

// Automatically adjust end date/time based on interval
function autoAdjustEndDate() {
  if (!form.value.startDate) return;

  const start = new Date(form.value.startDate);
  const end = new Date(start);

  switch (form.value.timeInterval) {
    case "hour":
      end.setHours(end.getHours() + 1);
      break;
    case "day":
      end.setDate(end.getDate() + 1);
      break;
    case "week":
      end.setDate(end.getDate() + 7);
      break;
    case "month":
      end.setMonth(end.getMonth() + 1);
      break;
    case "year":
      end.setFullYear(end.getFullYear() + 1);
      break;
  }

  // Format for datetime-local input
  form.value.endDate = end.toISOString().slice(0, 16);
}

async function handleBooking() {
  const token = localStorage.getItem("token");
  if (!token) {
    error.value = t("notLoggedIn");
    return;
  }

  if (new Date(form.value.endDate) <= new Date(form.value.startDate)) {
    error.value = t("invalidDateRange");
    return;
  }

  loading.value = true;
  message.value = "";
  error.value = "";

  try {
    const lang = localStorage.getItem("lang") || "en";

    // Convert dates to ISO for backend
    const payload = {
      ...form.value,
      startDate: new Date(form.value.startDate).toISOString(),
      endDate: new Date(form.value.endDate).toISOString(),
    };

    await createBooking(payload, token, lang);
    message.value = t("bookingSuccess");
  } catch (err) {
    console.error("Booking error:", err.response?.data || err.message);
    error.value = err.response?.data?.message || t("bookingFailed");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.booking-wrapper {
  width: 100%;
  min-height: 100vh;
  background-color: #f3f4f6;
  display: flex;
  /* ✅ CHANGE 1: Center horizontally */
  justify-content: center; 
  /* ✅ CHANGE 2: Keep it aligned to the top */
  align-items: flex-start; 
  
  /* Apply padding at the top/bottom for spacing */
  padding: 40px 20px; 
  box-sizing: border-box;
}

.booking-card {
  width: 100%;
  max-width: 500px; /* This ensures it stays within a reasonable size */
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.booking-card {
  width: 100%;
  max-width: 500px;
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.booking-card h2 {
  color: #1e3a8a;
  font-weight: 600;
  font-size: 22px;
  margin-bottom: 20px;
}

.booking-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 6px;
}

.form-group input,
.form-group select {
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #2563eb;
  outline: none;
}

.form-row {
  display: flex;
  gap: 12px;
}

.half {
  flex: 1;
}

button {
  padding: 12px;
  background-color: wheat;
  color: black;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: gray;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-msg {
  color: green;
  margin-top: 10px;
}

.error-msg {
  color: red;
  margin-top: 10px;
}
</style>
