<template>
  <div class="page">
    <h2 class="page-title">{{ t("myBookings") }}</h2>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>{{ t("loadingBookings") }}</p>
    </div>

    <!-- Error -->
    <p v-if="error" class="error">{{ error }}</p>

    <!-- Booking List -->
    <div v-if="bookings.length" class="booking-list">
      <div v-for="b in bookings" :key="b.bookingId" class="booking-card">

        <!-- Header -->
        <div class="card-header">
          <h3 class="title">{{ b.assetName }}</h3>
          <span class="status-tag" :class="b.status">{{ t(b.status) }}</span>
        </div>

        <!-- Main Info -->
        <div class="info-section">
          <p>
            <i class="fa-solid fa-user"></i>
            <b>{{ t("merchant") }}:</b> {{ b.merchant.name }} ({{ b.merchant.phone }})
          </p>

          <p>
            <i class="fa-solid fa-building"></i>
            <b>{{ t("numberOfProperty") }}:</b> {{ b.numberOfProperty }}
          </p>

          <p>
            <i class="fa-solid fa-clock"></i>
            <b>{{ t("duration") }}:</b>
            {{ formatDate(b.startDate) }} → {{ formatDate(b.endDate) }}
          </p>

          <p>
            <i class="fa-solid fa-money-bill"></i>
            <b>{{ t("totalPrice") }}:</b> {{ b.totalPrice }}
          </p>
        </div>

        <!-- Payment Upload -->
        <div class="upload-section">
          <label><i class="fa-solid fa-upload"></i> {{ t("uploadProof") }}</label>
          <input type="file" @change="e => uploadProof(e, b.bookingId)" />
        </div>

        <!-- Expand Button -->
        <button class="toggle-btn" @click="toggleDetails(b)">
          {{ b.showDetails ? t("hideDetails") : t("viewDetails") }}
        </button>

        <!-- Expanded Details -->
        <transition name="fade">
          <div v-if="b.showDetails" class="details-section">

            <p><b>ID:</b> {{ b.bookingId }}</p>

            <p>
              <b>{{ t("merchant") }} Email:</b> {{ b.merchant.email }}
            </p>

            <p>
              <b>{{ t("duration") }}:</b> {{ formatDate(b.startDate) }} →
              {{ formatDate(b.endDate) }}
            </p>

            <p><b>{{ t("status") }}:</b> {{ b.status }}</p>

            <!-- Property Images -->
            <div v-if="b.imageUrls?.length" class="image-gallery">
              <p><b>{{ t("propertyImages") }}:</b></p>
              <div class="image-row">
                <img
                  v-for="img in b.imageUrls"
                  :key="img"
                  :src="formatImage(img)"
                  class="thumb"
                />
              </div>
            </div>

            <!-- Payment Proof -->
            <div v-if="b.paymentProofPath" class="image-gallery">
              <p><b>{{ t("paymentProof") }}:</b></p>
              <img :src="formatImage(b.paymentProofPath)" class="thumb" />
            </div>

          </div>
        </transition>

      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!loading && !error" class="empty-state">
      <p>{{ t("noBookings") }}</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import axios from "axios";

const { t } = useI18n();

const API_URL = "https://lmgtech-4.onrender.com";
const token = localStorage.getItem("token");

const bookings = ref([]);
const loading = ref(false);
const error = ref("");

async function getMyBookings() {
  loading.value = true;

  const lang = localStorage.getItem("lang") || "en";

  try {
    const res = await axios.get(`${API_URL}/customer/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { lang },
    });

    bookings.value = res.data.bookings.map((b) => ({
      ...b,
      showDetails: false,
    }));
  } catch (err) {
    error.value = err.response?.data?.message || t("loadFailed");
  } finally {
    loading.value = false;
  }
}

function toggleDetails(booking) {
  booking.showDetails = !booking.showDetails;
}

async function uploadProof(event, bookingId) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const formData = new FormData();
    formData.append("paymentProof", file);

    const res = await axios.post(
      `${API_URL}/customer/bookings/${bookingId}/payment-proof`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    alert(res.data.message || t("uploadSuccess"));
    getMyBookings();
  } catch (err) {
    alert(err.response?.data?.message || t("uploadFailed"));
  }
}

function formatImage(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}/${path}`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString();
}

onMounted(getMyBookings);
</script>

<style scoped>
/* PAGE */
.page {
  padding: 24px;
  background: #f4f6f9;
  min-height: 100vh;
}

/* TITLE */
.page-title {
  text-align: center;
  font-size: 26px;
  color: #1e3a8a;
  margin-bottom: 20px;
}

/* BOOKING GRID */
.booking-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

/* BOOKING CARD */
.booking-card {
  background: white;
  padding: 18px;
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  transition: 0.25s ease;
}

.booking-card:hover {
  transform: translateY(-4px);
}

/* HEADER */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

/* STATUS TAG COLORS */
.status-tag {
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: bold;
  text-transform: capitalize;
}

.status-tag.Approved {
  background: #d1fae5;
  color: #065f46;
}

.status-tag.Pending {
  background: #fef3c7;
  color: #92400e;
}

.status-tag.Rejected {
  background: #fee2e2;
  color: #991b1b;
}

/* MAIN INFO */
.info-section p {
  margin: 6px 0;
  font-size: 14px;
}

.info-section i {
  color: #2563eb;
  margin-right: 6px;
}

/* TOGGLE BUTTON */
.toggle-btn {
  margin-top: 12px;
  width: 100%;
  padding: 10px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s;
}

.toggle-btn:hover {
  background: #1e40af;
}

/* DETAILS SECTION */
.details-section {
  margin-top: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
  border-left: 4px solid #2563eb;
  animation: fadeIn 0.3s ease;
}

/* IMAGE GALLERY */
.image-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.thumb {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #ddd;
}

/* EMPTY STATE */
.empty-state {
  text-align: center;
  color: #6b7280;
}

/* LOADING */
.loading {
  text-align: center;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 4px solid #cbd5e1;
  border-top-color: #2563eb;
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* FADE ANIMATION */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* MOBILE */
@media (max-width: 480px) {
  .booking-card {
    padding: 14px;
  }

  .thumb {
    width: 120px;
    height: 120px;
  }

  .page-title {
    font-size: 22px;
  }
}
</style>
