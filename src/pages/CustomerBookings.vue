<template>
  <div class="page">
    <div class="page-header">
      <div class="header-copy">
        <p class="breadcrumb">Home / {{ t("myBookings") }}</p>
        <h1>{{ t("myBookings") }}</h1>
        <p class="header-subtitle">
          {{ t("manageYourBookingsDescription") || "Review upcoming reservations, payments and booking details in one place." }}
        </p>
      </div>

      <div class="header-actions">
        <div class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            @keyup.enter="applySearch"
            placeholder="Search by property, merchant or status"
          />
          <button type="button" @click="applySearch">🔍</button>
        </div>
      </div>
    </div>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="selectedTab = tab.value"
        :class="['tab-button', { active: selectedTab === tab.value }]"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>{{ t("loadingBookings") }}</p>
    </div>

    <p v-if="error" class="error-message">{{ error }}</p>

    <div v-if="filteredBookings.length" class="booking-list">
      <article v-for="b in filteredBookings" :key="b.bookingId" class="booking-card">
        <div class="card-top">
          <div class="card-heading">
            <p class="booking-label">{{ b.status || t("booking") }}</p>
            <h3>{{ b.assetName }}</h3>
            <p class="booking-subtitle">
              {{ t("merchant") }}: {{ b.merchant?.name || "N/A" }}
              <span class="merchant-phone">({{ b.merchant?.phone || "-" }})</span>
            </p>
          </div>

          <span class="status-pill" :class="statusClass(b.status)">
            {{ b.status }}
          </span>
        </div>

        <div class="card-body">
          <div class="booking-image">
            <img :src="formatImage(b.imageUrls?.[0]) || defaultImage" alt="Booking image" />
          </div>

          <div class="booking-details">
            <div class="detail-row">
              <span>{{ t("numberOfProperty") }}:</span>
              <strong>{{ b.numberOfProperty || "-" }}</strong>
            </div>
            <div class="detail-row">
              <span>{{ t("duration") }}:</span>
              <strong>{{ formatDateTime(b.startDate) }} → {{ formatDateTime(b.endDate) }}</strong>
            </div>
            <div class="detail-row">
              <span>{{ t("totalPrice") }}:</span>
              <strong>{{ b.totalPrice || "-" }}</strong>
            </div>
            <div class="detail-row">
              <span>{{ t("paymentStatus") || "Payment" }}:</span>
              <strong>{{ b.paymentStatus }}</strong>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <div class="payment-block">
            <a
              v-if="b.paymentStatus === 'UNPAID' && b.checkoutUrl"
              :href="b.checkoutUrl"
              target="_blank"
              class="pay-btn"
            >
              {{ t("payNow") || "Pay Now" }} - {{ b.totalPrice }}
            </a>
            <div v-if="b.paymentStatus === 'UNPAID' && b.expiresAt" class="expires">
              {{ t("expiresAt") }}: {{ formatDateTime(b.expiresAt) }}
            </div>
            <div v-else-if="b.paymentStatus === 'PAID'" class="paid">
              {{ t("paymentCompleted") || "Payment completed" }}
            </div>
          </div>

          <button class="details-btn" @click="toggleDetails(b)">
            {{ b.showDetails ? t("hideDetails") : t("viewDetails") }}
          </button>
        </div>

        <transition name="fade">
          <div v-if="b.showDetails" class="details-panel">
            <div class="details-grid">
              <div>
                <p><strong>{{ t("bookingId") || "Booking ID" }}:</strong> {{ b.bookingId }}</p>
                <p><strong>{{ t("merchantEmail") }}:</strong> {{ b.merchant?.email || "-" }}</p>
                <p><strong>{{ t("status") }}:</strong> {{ b.status }}</p>
              </div>
              <div>
                <p><strong>{{ t("startDate") || "Start" }}:</strong> {{ formatDateTime(b.startDate) }}</p>
                <p><strong>{{ t("endDate") || "End" }}:</strong> {{ formatDateTime(b.endDate) }}</p>
              </div>
            </div>

            <div v-if="b.imageUrls?.length" class="image-gallery">
              <p class="gallery-title">{{ t("propertyImages") || "Property images" }}</p>
              <div class="image-row">
                <img v-for="img in b.imageUrls" :key="img" :src="formatImage(img)" class="thumb" />
              </div>
            </div>

            <div v-if="b.paymentProofPath" class="image-gallery">
              <p class="gallery-title">{{ t("paymentProof") }}</p>
              <img :src="formatImage(b.paymentProofPath)" class="thumb" />
            </div>
          </div>
        </transition>
      </article>
    </div>

    <div v-else-if="!loading && !error" class="empty-state">
      <p>{{ t("noBookings") }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import axios from "axios";

const { t } = useI18n();
const API_URL = "https://lmgtech-4.onrender.com";
const token = localStorage.getItem("token");

const bookings = ref([]);
const loading = ref(false);
const error = ref("");
const searchQuery = ref("");
const selectedTab = ref("ALL");
const tabs = [
  { value: "ALL", label: t("allBookings") || "All Bookings" },
  { value: "PENDING", label: t("pending") || "Pending" },
  { value: "CONFIRMED", label: t("confirmed") || "Confirmed" },
  { value: "COMPLETED", label: t("completed") || "Completed" },
];
const defaultImage = "/images/default-property.png";

const filteredBookings = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return bookings.value.filter((b) => {
    const status = String(b.status || "").toUpperCase();
    const statusMatch =
      selectedTab.value === "ALL" || status === selectedTab.value;

    if (!statusMatch) return false;

    if (!query) return true;

    return [
      b.assetName,
      b.merchant?.name,
      b.merchant?.email,
      b.status,
      b.totalPrice,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });
});

async function getMyBookings() {
  loading.value = true;
  const lang = localStorage.getItem("lang") || "en";
  try {
    const res = await axios.get(`${API_URL}/customer/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { lang },
    });
    bookings.value = res.data.bookings.map((b) => ({ ...b, showDetails: false }));
  } catch (err) {
    error.value = err.response?.data?.message || t("loadFailed");
  } finally {
    loading.value = false;
  }
}

function applySearch() {
  // Computed list updates automatically from searchQuery.
}

function toggleDetails(booking) {
  booking.showDetails = !booking.showDetails;
}

function formatImage(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}/${path}`;
}

function formatDateTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "pending") return "pending";
  if (normalized === "confirmed") return "confirmed";
  if (normalized === "completed") return "completed";
  if (normalized === "approved") return "confirmed";
  if (normalized === "rejected") return "rejected";
  return "default";
}

onMounted(getMyBookings);
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #eef7fb;
  color: #17233d;
  font-family: "Inter", sans-serif;
  padding-bottom: 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  background: linear-gradient(180deg, #15596f 0%, #1c7f9b 100%);
  color: white;
  border-radius: 24px;
  padding: 28px 30px;
  margin: 24px 20px 16px;
  box-shadow: 0 16px 40px rgba(14, 65, 85, 0.18);
}

.header-copy {
  max-width: 720px;
}

.breadcrumb {
  margin: 0 0 8px;
  font-size: 14px;
  opacity: 0.9;
}

.page-header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.header-subtitle {
  margin: 12px 0 0;
  color: rgba(255, 255, 255, 0.92);
  max-width: 620px;
  line-height: 1.8;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
}

.search-box {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 360px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 14px;
  overflow: hidden;
}

.search-box input {
  width: 100%;
  border: none;
  outline: none;
  color: white;
  padding: 12px 16px;
  background: transparent;
  font-size: 14px;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.75);
}

.search-box button {
  border: none;
  background: rgba(255, 255, 255, 0.18);
  color: white;
  width: 52px;
  display: grid;
  place-items: center;
  cursor: pointer;
  font-size: 18px;
}

.tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding: 0 20px;
  margin-bottom: 18px;
}

.tab-button {
  border: 1px solid #cbd5e1;
  background: white;
  color: #1f2937;
  padding: 12px 18px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button.active {
  background: #1c7f9b;
  color: white;
  border-color: transparent;
  box-shadow: 0 6px 20px rgba(28, 127, 155, 0.16);
}

.booking-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
  padding: 0 20px;
}

.booking-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 16px 40px rgba(17, 64, 88, 0.08);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 24px 16px;
}

.card-heading {
  min-width: 0;
}

.booking-label {
  margin: 0 0 10px;
  display: inline-flex;
  background: #eff6ff;
  color: #2563eb;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.card-top h3 {
  margin: 0;
  font-size: 22px;
  line-height: 1.2;
  color: #0f172a;
}

.booking-subtitle {
  margin: 10px 0 0;
  font-size: 14px;
  color: #475569;
}

.merchant-phone {
  color: #6b7280;
}

.status-pill {
  padding: 10px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  text-transform: capitalize;
  white-space: nowrap;
}

.status-pill.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-pill.confirmed,
.status-pill.approved {
  background: #d1fae5;
  color: #065f46;
}

.status-pill.completed {
  background: #dbeafe;
  color: #1e3a8a;
}

.status-pill.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.status-pill.default {
  background: #e2e8f0;
  color: #334155;
}

.card-body {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 18px;
  padding: 0 24px 20px;
  align-items: center;
}

.booking-image {
  min-height: 140px;
  background: #f8fafc;
  border-radius: 20px;
  overflow: hidden;
  display: grid;
  place-items: center;
}

.booking-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.booking-details {
  display: grid;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  font-size: 14px;
}

.detail-row span {
  color: #475569;
}

.detail-row strong {
  color: #0f172a;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 0 24px 24px;
  flex-wrap: wrap;
}

.payment-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 240px;
}

.pay-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 18px;
  background: linear-gradient(135deg, #059669, #16a34a);
  color: white;
  border-radius: 14px;
  text-decoration: none;
  font-weight: 700;
}

.pay-btn:hover {
  opacity: 0.95;
}

.paid {
  font-weight: 700;
  color: #0f5132;
}

.expires {
  color: #b91c1c;
  font-size: 13px;
}

.details-btn {
  padding: 12px 18px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #0f172a;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s ease;
}

.details-btn:hover {
  background: #f8fafc;
}

.details-panel {
  padding: 20px 24px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: grid;
  gap: 18px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.details-grid p {
  margin: 0 0 10px;
  font-size: 14px;
  color: #334155;
}

.gallery-title {
  margin: 0 0 10px;
  font-weight: 700;
  color: #0f172a;
}

.image-gallery {
  display: grid;
  gap: 12px;
}

.image-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.thumb {
  width: 120px;
  height: 100px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.empty-state {
  text-align: center;
  color: #475569;
  padding: 40px 20px;
  font-size: 16px;
}

.loading {
  text-align: center;
  padding: 30px 20px;
}

.error-message {
  color: #b91c1c;
  padding: 0 20px 20px;
  font-weight: 600;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 900px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: stretch;
  }

  .card-body {
    grid-template-columns: 1fr;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .page-header {
    margin: 16px 12px 12px;
    padding: 22px 18px;
    border-radius: 20px;
  }

  .tabs {
    padding: 0 12px;
  }

  .booking-list {
    padding: 0 12px;
  }

  .booking-card {
    border-radius: 20px;
  }

  .booking-image {
    min-height: 140px;
  }

  .thumb {
    width: 100px;
    height: 80px;
  }
}
</style>
