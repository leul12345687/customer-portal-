<template>
  <div class="booking-wrapper">
    <div class="booking-card">

      <!-- ========================= -->
      <!-- BOOKING FORM -->
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
      <!-- PAYMENT INFO -->
      <!-- ========================= -->
      <template v-else>
        <h2>Payment Required</h2>

        <div class="payment-box">

          <p><b>Total Amount:</b> {{ paymentInfo.grossAmount }} ETB</p>
          <p><b>Net Amount:</b> {{ paymentInfo.netAmount }} ETB</p>
          <p><b>VAT ({{ (paymentInfo.vatRate ?? 0) * 100 }}%):</b> {{ paymentInfo.vatAmount }} ETB</p>

          <hr />

          <!-- Bank info fallback -->
          <div v-if="!paymentInfo.checkoutUrl">
            <p><b>Bank:</b> Commercial Bank of Ethiopia</p>
            <p><b>Account Number:</b> {{ paymentInfo.accountNumber }}</p>
            <p><b>Payment Reference:</b> {{ paymentInfo.paymentReference }}</p>
            <p><b>Pay Before:</b> {{ formatDate(paymentInfo.expiresAt) }}</p>
          </div>

          <!-- ✅ Pay Button -->
          <div v-else>
            <button @click="goToCheckout" class="pay-btn">
              Pay Now
            </button>
          </div>

          <hr />

          <p>{{ paymentInfo.message }}</p>

          <p class="warning" v-if="!paymentInfo.checkoutUrl">
            Use the exact payment reference. Booking expires if unpaid.
          </p>
        </div>
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

// ✅ Holds booking + payment info after creation
const paymentInfo = ref(null);

// Prefill from route query
onMounted(() => {
  const { assetName, merchantEmail } = route.query;
  if (assetName) form.value.assetName = assetName;
  if (merchantEmail) form.value.merchantEmail = merchantEmail;
});

// Auto adjust end date based on interval
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

// Handle booking submission
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

    // ✅ Call backend to create booking
    const res = await createBooking(payload, token, lang);

    // Save returned booking/payment info
    paymentInfo.value = res;
    message.value = t("bookingSuccess");
  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.message || t("bookingFailed");
  } finally {
    loading.value = false;
  }
}

// Navigate to Chapa checkout page
function goToCheckout() {
  if (paymentInfo.value?.checkoutUrl) {
    window.location.href = paymentInfo.value.checkoutUrl;
  } else {
    error.value = "Payment URL not available.";
  }
}

// Format dates
function formatDate(date) {
  return date ? new Date(date).toLocaleString() : "";
}
</script>

<style scoped>
/* ===============================
   PAGE WRAPPER (MOBILE FIRST)
================================ */
.booking-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 16px;
  background: #f1f5f9;
}

/* ===============================
   BOOKING CARD
================================ */
.booking-card {
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  padding: 20px;
  border-radius: 18px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
}

/* ===============================
   FORM
================================ */
.booking-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Rows stack by default (mobile) */
.form-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Inputs */
input,
select {
  width: 100%;
  padding: 14px 12px;
  border-radius: 10px;
  border: 1px solid #c7d1e0;
  font-size: 15px;
  outline: none;
  background: #ffffff;
  transition: border 0.2s, box-shadow 0.2s;
}

input:focus,
select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

/* ===============================
   BUTTONS
================================ */
button {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  border: none;
  transition: background 0.2s ease, transform 0.1s ease;
}

/* Form Submit */
.booking-form button {
  background: #2563eb;
  color: #ffffff;
}

.booking-form button:hover {
  background: #1e40af;
}

.booking-form button:active {
  transform: scale(0.97);
}

/* Pay Button (checkout) */
.pay-btn {
  background: #10b981; /* green */
  color: #ffffff;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
  margin-top: 12px;
}

.pay-btn:hover {
  background: #059669;
}

.pay-btn:active {
  transform: scale(0.97);
}

/* ===============================
   PAYMENT BOX
================================ */
.payment-box {
  border: 2px dashed #2563eb;
  padding: 16px;
  border-radius: 14px;
  background: #f8fafc;
  text-align: center;
  margin-top: 16px;
}

.payment-box a {
  color: #2563eb;
  text-decoration: underline;
}

.payment-box a:hover {
  color: #1e40af;
}

/* Reference code */
.reference {
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 1.2px;
  margin-top: 8px;
  color: #1e3a8a;
}

/* ===============================
   MESSAGES
================================ */
.success-msg {
  color: #10b981;
  font-weight: 600;
  margin-top: 12px;
  text-align: center;
}

.error-msg {
  color: #dc2626;
  font-weight: 600;
  text-align: center;
}

.info {
  margin-top: 10px;
  font-size: 14px;
  color: #374151;
  text-align: center;
}

.warning {
  color: #b45309;
  font-weight: 500;
  font-size: 14px;
  margin-top: 8px;
}

/* ===============================
   TABLET & DESKTOP (>= 640px)
================================ */
@media (min-width: 640px) {
  .booking-card {
    padding: 24px;
  }

  /* Side-by-side fields on larger screens */
  .form-row {
    flex-direction: row;
  }

  .half {
    flex: 1;
  }
}

/* ===============================
   LARGE DESKTOP (>= 1024px)
================================ */
@media (min-width: 1024px) {
  .booking-wrapper {
    align-items: center;
  }
}
</style>
