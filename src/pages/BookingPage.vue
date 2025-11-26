<template>
  <div class="booking-wrapper">
    <div class="booking-card">

      <!-- ========================= -->
      <!-- BOOKING FORM (UNCHANGED) -->
      <!-- ========================= -->
      <template v-if="!paymentInfo">
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

          <!-- Start / End -->
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

          <!-- Number -->
          <div class="form-group">
            <label>{{ t("numberOfProperty") }}</label>
            <input
              v-model.number="form.numberOfProperty"
              type="number"
              min="1"
              required
            />
          </div>

          <!-- Interval -->
          <div class="form-group">
            <label>{{ t("timeInterval") }}</label>
            <select
              v-model="form.timeInterval"
              required
              @change="autoAdjustEndDate"
            >
              <option value="hour">{{ t("hour") }}</option>
              <option value="day">{{ t("day") }}</option>
              <option value="week">{{ t("week") }}</option>
              <option value="month">{{ t("month") }}</option>
              <option value="year">{{ t("year") }}</option>
            </select>
          </div>

          <!-- Deposit -->
          <div class="form-group">
            <label>{{ t("securityDeposit") }}</label>
            <input
              v-model.number="form.securityDeposit"
              type="number"
              min="0"
              :placeholder="t('optionalDeposit')"
            />
          </div>

          <!-- Submit -->
          <button type="submit" :disabled="loading">
            {{ loading ? t("submitting") : t("submitBooking") }}
          </button>
        </form>

        <!-- Feedback -->
        <p v-if="message" class="success-msg">{{ message }}</p>
        <p v-if="error" class="error-msg">{{ error }}</p>
      </template>

      <!-- ========================= -->
      <!-- PAYMENT INFO (NEW) -->
      <!-- ========================= -->
      <template v-else>
        <h2>Payment Required</h2>

  <div class="payment-box">
  <p><b>Total Amount:</b> {{ paymentInfo.totalPrice }} ETB</p>
        <p><b>Net Amount:</b> {{ paymentInfo.netAmount }} ETB</p>
        <p><b>VAT ({{ paymentInfo.vatRate * 100 }}%):</b> {{ paymentInfo.vatAmount }} ETB</p>

        <hr />

        <p><b>Bank:</b> Commercial Bank of Ethiopia</p>
        <p><b>Account Number:</b> {{ paymentInfo.accountNumber }}</p>
        <p><b>Payment Reference:</b> {{ paymentInfo.paymentReference }}</p>
        <p><b>Pay Before:</b> {{ formatDate(paymentInfo.expiresAt) }}</p>

        <hr />

        <p>{{ paymentInfo.message }}</p>

        <p class="warning">
          Use the exact payment reference. Booking expires if unpaid.
        </p>


  
</div>


        <p class="success-msg">
          {{ paymentInfo.message }}
        </p>

        <p class="info">
          ⚠️ Use the exact reference when paying.  
          Booking will expire automatically if unpaid.
        </p>
      </template>

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

// ✅ NEW: payment response holder
const paymentInfo = ref(null);

// Prefill from route
onMounted(() => {
  const { assetName, merchantEmail } = route.query;
  if (assetName) form.value.assetName = assetName;
  if (merchantEmail) form.value.merchantEmail = merchantEmail;
});

// Auto adjust end date
function autoAdjustEndDate() {
  if (!form.value.startDate) return;

  const start = new Date(form.value.startDate);
  const end = new Date(start);

  switch (form.value.timeInterval) {
    case "hour": end.setHours(end.getHours() + 1); break;
    case "day": end.setDate(end.getDate() + 1); break;
    case "week": end.setDate(end.getDate() + 7); break;
    case "month": end.setMonth(end.getMonth() + 1); break;
    case "year": end.setFullYear(end.getFullYear() + 1); break;
  }

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

    const payload = {
      ...form.value,
      startDate: new Date(form.value.startDate).toISOString(),
      endDate: new Date(form.value.endDate).toISOString(),
    };

    // ✅ BACKEND RETURN USED
    const res = await createBooking(payload, token, lang);
    paymentInfo.value = res;
    console.log("paymentInfo", paymentInfo.value);
    message.value = t("bookingSuccess");

  } catch (err) {
    error.value = err.response?.data?.message || t("bookingFailed");
  } finally {
    loading.value = false;
  }
}

function formatDate(date) {
  return new Date(date).toLocaleString();
}
</script>

<style scoped>
/* === SAME STYLES + SMALL ADDITIONS === */

.booking-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 20px 16px;
}

.booking-card {
  width: 100%;
  max-width: 480px;
  background: white;
  padding: 24px;
  border-radius: 18px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
}

.booking-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-row {
  display: flex;
  gap: 14px;
}

.half {
  flex: 1;
}

input, select {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #c7d1e0;
}

button {
  padding: 14px;
  background: #2563eb;
  color: white;
  border-radius: 10px;
  font-weight: 600;
}

.payment-box {
  border: 2px dashed #2563eb;
  padding: 16px;
  border-radius: 12px;
  background: #f8fafc;
}

.reference {
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 1px;
}

.success-msg {
  color: #10b981;
  font-weight: 600;
  margin-top: 12px;
}

.error-msg {
  color: #dc2626;
  font-weight: 600;
}

.info {
  margin-top: 10px;
  font-size: 14px;
  color: #374151;
}
</style>