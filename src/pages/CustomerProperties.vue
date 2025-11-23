<template>
  <div class="properties-page">
    <h2>{{ t("Select availableProperties by category") }}</h2>

    <!-- Category Buttons -->
    <div class="category-buttons">
      <button
        v-for="cat in categories"
        :key="cat.value"
        :class="{ active: category === cat.value }"
        @click="selectCategory(cat.value)"
        :disabled="loading && category === cat.value"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-section">
      <div class="spinner"></div>
      <p>{{ t("loadingProperties") }}</p>
    </div>

    <!-- Error -->
    <p v-if="error" class="error">{{ error }}</p>

    <!-- Properties Grid -->
    <div v-if="!loading && properties.length" class="property-list">
      <div
        v-for="(property, index) in properties"
        :key="index"
        class="property-card"
      >
        <!-- Image -->
        <img
          v-if="property.imageUrls?.length"
          :src="property.imageUrls[0]"
          alt="property"
          class="property-img"
        />
        <div v-else class="no-image">No Image</div>

        <!-- Property Info -->
        <h3>{{ property.name }}</h3>
        <p class="desc">{{ property.description }}</p>
        <p><strong>{{ t("numberOfProperty") }}:</strong> {{ property.numberOfProperty }}</p>
        <p><strong>{{ t("category") }}:</strong> {{ property.category }}</p>

        <!-- Action Buttons -->
        <div class="btn-group">
          <button class="book-btn" @click="bookNow(property)">
            {{ t("bookNow") }}
          </button>
          <button class="detail-btn" @click="toggleDetails(index)">
            {{ expanded[index] ? t("hideDetails") : t("viewDetails") }}
          </button>
        </div>

        <!-- Details Section -->
        <transition name="fade">
          <div v-if="expanded[index]" class="details">
            <h4>{{ t("merchantInfo") }}</h4>
            <p><strong>{{ t("merchantName") }}:</strong> {{ property.merchant.name }}</p>
            <p><strong>{{ t("merchantEmail") }}:</strong> {{ property.merchant.email }}</p>
            <p><strong>{{ t("merchantPhone") }}:</strong> {{ property.merchant.phone }}</p>
            <p><strong>{{ t("businessName") }}:</strong> {{ property.merchant.businessName }}</p>
            <p><strong>{{ t("accountNumber") }}:</strong> {{ property.merchant.acountnumber }}</p>

            <h4>{{ t("rentalDetails") }}</h4>
            <ul>
              <li><strong>Per Hour:</strong> {{ property.rentalPrice.perHour }}</li>
              <li><strong>Per Day:</strong> {{ property.rentalPrice.perDay }}</li>
              <li><strong>Per Week:</strong> {{ property.rentalPrice.perWeek }}</li>
              <li><strong>Per Month:</strong> {{ property.rentalPrice.perMonth }}</li>
              <li><strong>Per Year:</strong> {{ property.rentalPrice.perYear }}</li>
            </ul>

            <h4>{{ t("bookings") }}</h4>
            <ul v-if="property.bookings?.length">
              <li v-for="(b, i) in property.bookings" :key="i">
                {{ t("from") }} {{ formatDate(b.startDate) }} {{ t("to") }} {{ formatDate(b.endDate) }} — {{ b.numberOfProperty }} {{ t("booked") }} ({{ b.status }})
              </li>
            </ul>
            <p v-else>{{ t("noBookings") }}</p>
          </div>
        </transition>
      </div>
    </div>

    <!-- No Properties -->
    <p v-if="!loading && !properties.length && !error" class="no-results">
      {{ t("noPropertiesFound") }}
    </p>

    <!-- Login Prompt -->
    <transition name="prompt-fade">
      <div v-if="showLoginPrompt" class="login-prompt-overlay">
        <div class="message-box">
          <span class="close-btn" @click="showLoginPrompt = false">&times;</span>
          <h3>{{ t("loginRequiredTitle") }}</h3>
          <p>{{ t("loginRequiredMessage") }}</p>
          <button @click="goToLoginAndClearPrompt" class="redirect-btn">
            {{ t("loginOrRegister") }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { getPropertiesByCategory } from "../services/propertyService.js";

const { t } = useI18n();
const router = useRouter();

const categories = [
  { value: "EventSupply", label: "Event Supply" },
  { value: "ConstructionEquipment", label: "Construction Equipment" },
  { value: "HealthcareMedical", label: "Healthcare & Medical" },
  { value: "Other", label: "Other" },
];

const category = ref("");
const properties = ref([]);
const loading = ref(false);
const error = ref("");
const expanded = ref({});
const showLoginPrompt = ref(false);

// Navigation
const goToLogin = () => router.push("/login");

// Category selection
async function selectCategory(cat) {
  category.value = cat;
  await fetchProperties();
}

// Fetch properties
async function fetchProperties() {
  const lang = localStorage.getItem("lang") || "en";
  loading.value = true;
  error.value = "";
  properties.value = [];

  try {
    const data = await getPropertiesByCategory(category.value, lang);
    properties.value = data.properties || [];
  } catch (err) {
    error.value = err.response?.data?.message || t("failedToLoadProperties");
  } finally {
    loading.value = false;
  }
}

// Toggle property details
function toggleDetails(index) {
  expanded.value[index] = !expanded.value[index];
}

// Login prompt handler
function goToLoginAndClearPrompt() {
  showLoginPrompt.value = false;
  goToLogin();
}

function bookNow(property) {
  const token = localStorage.getItem("token");

  // If NOT logged in → store pending booking and redirect to login
  if (!token) {
    showLoginPrompt.value = true;

    sessionStorage.setItem(
      "pendingBooking",
      JSON.stringify({
        assetName: property.name,
        merchantEmail: property.merchant.email,
        numberOfProperty: property.numberOfProperty, // new
        merchantAccount: property.merchant.acountnumber // new
      })
    );

    return;
  }

  // IF LOGGED IN → navigate directly to booking page with autofill
  router.push({
    path: "/app/booking",
    query: {
      assetName: property.name,
      merchantEmail: property.merchant.email,
      numberOfProperty: property.numberOfProperty,
      merchantAccount: property.merchant.acountnumber
    },
  });
}


// Format dates
function formatDate(date) {
  return new Date(date).toLocaleDateString();
}
</script>

<style scoped>
/* ========== Page Layout ========== */
.properties-page {
  padding: 10px;
  background: white;
  min-height: 100vh;
}
h2 {
  font-size: 26px;
  color: #1e3a8a;
  text-align: center;
  margin-bottom: 24px;
}

/* ===== Category Buttons ===== */
.category-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
}
.category-buttons button {
  background-color: #ffffff;
  color: #1e3a8a;
  font-weight: 700;
  border: 2px solid #1e3a8a;
  padding: 15px 25px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
  text-align: center;
}
.category-buttons button.active,
.category-buttons button:hover {
  background-color: #1e3a8a;
  color: #ffffff;
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

/* ===== Loading ===== */
.loading-section {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  margin: 20px 0;
  color: #1e3a8a;
  font-weight: 500;
}
.spinner {
  width: 22px;
  height: 22px;
  border: 3px solid #dbeafe;
  border-top-color: #1e3a8a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== Property Cards ===== */
.property-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.property-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.property-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
}
.property-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
}
.no-image {
  height: 200px;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: #6b7280;
  font-weight: 500;
}
h3 {
  margin: 12px 0 6px;
  color: #111827;
  font-size: 20px;
}
.desc {
  color: #4b5563;
  font-size: 14px;
  margin-bottom: 8px;
}

/* ===== Buttons ===== */
.btn-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
.book-btn,
.detail-btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  color: #fff;
  transition: all 0.25s ease;
}
.book-btn {
  background: #10b981;
}
.book-btn:hover {
  background: #059669;
  transform: scale(1.05);
}
.detail-btn {
  background: #3b82f6;
}
.detail-btn:hover {
  background: #2563eb;
  transform: scale(1.05);
}

/* ===== Details Section ===== */
.details {
  background: #f3f4f6;
  padding: 12px;
  border-radius: 10px;
  margin-top: 10px;
}
.details h4 {
  color: #1e3a8a;
  margin-bottom: 6px;
}
.details ul {
  padding-left: 20px;
  margin-bottom: 6px;
}

/* ===== Transitions ===== */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* ===== Error & No Results ===== */
.error {
  color: #ef4444;
  font-weight: 500;
  text-align: center;
}
.no-results {
  color: #6b7280;
  text-align: center;
  margin-top: 20px;
}

/* ===== Login Prompt Overlay ===== */
.login-prompt-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.message-box {
  background: #fff;
  padding: 28px;
  border-radius: 12px;
  text-align: center;
  max-width: 400px;
  position: relative;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}
.message-box h3 {
  margin-top: 0;
  font-size: 20px;
  color: #ef4444;
}
.message-box p {
  margin-bottom: 20px;
  color: #333;
}
.redirect-btn {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.redirect-btn:hover {
  background: #1e40af;
}
.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}
.prompt-fade-enter-active,
.prompt-fade-leave-active {
  transition: opacity 0.3s ease;
}
.prompt-fade-enter-from,
.prompt-fade-leave-to {
  opacity: 0;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .property-list {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
  .category-buttons button {
    padding: 12px 16px;
    min-width: 140px;
    font-size: 14px;
  }
  .property-img, .no-image { height: 160px; }
}
@media (max-width: 480px) {
  h2 { font-size: 22px; }
  .property-img, .no-image { height: 140px; }
  .book-btn, .detail-btn { padding: 8px 12px; font-size: 14px; }
}
</style>
