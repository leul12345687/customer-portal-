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
/* ==== GLOBAL RESPONSIVE & MOBILE-FIRST STYLING ==== */

.booking-wrapper {
  width: 100%;
  min-height: 100vh;

  display: flex;
  justify-content: center;
  align-items: flex-start;

  padding: 20px 16px;
  background-color: #f2f4f7;
  box-sizing: border-box;
}

/* ===== FORM CARD ===== */

.booking-card {
  width: 100%;
  max-width: 480px;

  background: white;
  padding: 24px;

  border-radius: 18px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);

  animation: fadeIn 0.3s ease-out;
}

.booking-card h2 {
  font-size: 20px;
  color: #1f2a44;
  font-weight: 700;
  margin-bottom: 18px;
}

/* ==== FORM ==== */

.booking-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 6px;
  font-weight: 600;
  color: #374151;
}

.form-group input,
.form-group select {
  padding: 12px;
  border-radius: 10px;

  background: #ffffff;
  border: 1px solid #c7d1e0;

  font-size: 15px;
  transition: 0.25s ease-in-out;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  outline: none;
}

/* ==== RESPONSIVE ROW ==== */

.form-row {
  display: flex;
  gap: 14px;
}

/* Mobile: stack fields */
@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
  }
}

/* Desktop: 50/50 split */
.half {
  flex: 1;
}

/* ==== BUTTON ==== */

button {
  padding: 14px;

  background: #2563eb;
  border: none;
  border-radius: 10px;

  color: white;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;

  transition: background 0.25s;
}

button:hover {
  background: #1d4ed8;
}

button:disabled {
  background: #93a4c1;
  cursor: not-allowed;
}

/* ==== MESSAGES ==== */

.success-msg {
  color: #10b981;
  margin-top: 10px;
  font-weight: 600;
}

.error-msg {
  color: #dc2626;
  margin-top: 10px;
  font-weight: 600;
}

/* Fade animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>
