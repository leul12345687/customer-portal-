<template>
  <div class="properties-page">

    <!-- =========================
       SCREEN 1: CATEGORY LIST
    ========================== -->
    <div v-if="showCategories">
      <h2>{{ t("Select availableProperties by category") }}</h2>

      <div class="category-buttons">
        <button
          v-for="cat in categories"
          :key="cat.value"
          @click="selectCategory(cat.value)"
        >
          {{ cat.label }}
        </button>
      </div>
    </div>

    <!-- =========================
       SCREEN 2: PROPERTIES PAGE
    ========================== -->
    <div v-else>

      <!-- Back Button -->
      <div class="back-btn" @click="goBack">
        ← {{ t("back") }}
      </div>

      <h2>{{ selectedCategoryLabel }}</h2>

      <!-- Loading -->
      <div v-if="loading" class="loading-section">
        <div class="spinner"></div>
        <p>{{ t("loadingProperties") }}</p>
      </div>

      <!-- Error -->
      <p v-if="error" class="error">{{ error }}</p>

      <!-- Properties List -->
      <div v-if="!loading && properties.length" class="property-list">
        <div
          v-for="(property, index) in properties"
          :key="property._id || index"
          class="property-card"
        >
          <!-- Image -->
          <img
            v-if="property.imageUrls?.length"
            :src="property.imageUrls[0]"
            class="property-img"
          />

          <div v-else class="no-image">No Image</div>

          <h3>{{ property.name }}</h3>
          <p class="desc">{{ property.description }}</p>

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

          <!-- Details -->
          <transition name="fade">
            <div v-if="expanded[index]" class="details">
              <h4>{{ t("merchantInfo") }}</h4>
              <p><strong>{{ t("merchantName") }}:</strong> {{ property.merchant.name }}</p>
              <p><strong>{{ t("merchantEmail") }}:</strong> {{ property.merchant.email }}</p>

              <h4>{{ t("rentalDetails") }}</h4>
              <ul>
                <li>Per Day: {{ property.rentalPrice.perDay }}</li>
              </ul>

              <h4>{{ t("bookings") }}</h4>
              <ul v-if="property.bookings?.length">
                <li v-for="(b, i) in property.bookings" :key="i">
                  {{ formatDateTime(b.startDate) }} → {{ formatDateTime(b.endDate) }}
                </li>
              </ul>
              <p v-else>{{ t("noBookings") }}</p>
            </div>
          </transition>
        </div>
      </div>

      <!-- No Results -->
      <p
        v-if="!loading && !properties.length && !error"
        class="no-results"
      >
        {{ t("noPropertiesFound") }}
      </p>
    </div>

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
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { getPropertiesByCategory } from "../services/propertyService.js";

const { t } = useI18n();
const router = useRouter();

// CATEGORY DATA
const categories = [
  { value: "EventSupply", label: "Event Supply" },
  { value: "ConstructionEquipment", label: "Construction Equipment" },
  { value: "HealthcareMedical", label: "Healthcare & Medical" },
  { value: "Other", label: "Other" },
];

// STATES
const showCategories = ref(true);   // NEW → controls screen 1 / screen 2
const category = ref("");
const properties = ref([]);
const loading = ref(false);
const error = ref("");
const expanded = ref({});
const showLoginPrompt = ref(false);

// Label for title
const selectedCategoryLabel = computed(() => {
  return categories.find(c => c.value === category.value)?.label || "";
});

// Select Category → show properties page
async function selectCategory(cat) {
  category.value = cat;
  showCategories.value = false;   // hide category page
  await fetchProperties();
}

// Go Back to category page
function goBack() {
  showCategories.value = true;
  properties.value = [];
  expanded.value = {};
}

// Fetch properties
async function fetchProperties() {
  loading.value = true;
  error.value = "";
  properties.value = [];

  try {
    const lang = localStorage.getItem("lang") || "en";
    const data = await getPropertiesByCategory(category.value, lang);
    properties.value = data.properties || [];
  } catch (err) {
    error.value = err.response?.data?.message || t("failedToLoadProperties");
  } finally {
    loading.value = false;
  }
}

// Toggle Details
function toggleDetails(index) {
  expanded.value[index] = !expanded.value[index];
  expanded.value = { ...expanded.value };
}

// Login Redirect
function goToLoginAndClearPrompt() {
  showLoginPrompt.value = false;
  router.push("/login");
}

// Book Now
function bookNow(property) {
  const token = localStorage.getItem("token");

  if (!token) {
    showLoginPrompt.value = true;

    sessionStorage.setItem(
      "pendingBooking",
      JSON.stringify({
        assetName: property.name,
        merchantEmail: property.merchant.email,
        numberOfProperty: property.numberOfProperty,
        merchantAccount: property.merchant.acountnumber,
      })
    );
    return;
  }

  router.push({
    path: "/app/booking",
    query: {
      assetName: property.name,
      merchantEmail: property.merchant.email,
      numberOfProperty: property.numberOfProperty,
      merchantAccount: property.merchant.acountnumber,
    },
  });
}

// Format datetime
function formatDateTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  background: white;
  padding: 18px;
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  border: 2px solid black;
  transition: 0.25s ease;
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


.back-btn {
  font-size: 18px;
  margin-bottom: 12px;
  cursor: pointer;
  color: #1e3a8a;
  font-weight: 600;
}
.back-btn:hover {
  text-decoration: underline;
}
</style>
