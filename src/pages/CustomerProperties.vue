<template>
  <div class="properties-page">

    <!-- ================= BACK ARROW ================= -->
    <div v-if="!showCategories" class="back-container">
      <button class="back-btn" @click="goBack">
        ← {{ t("back") }}
      </button>
    </div>

    <!-- ================= CATEGORY PAGE ================= -->
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

    <!-- ================= PROPERTIES PAGE ================= -->
    <div v-if="!showCategories">

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

          <!-- Property Information -->
          <h3>{{ property.name }}</h3>
          <p class="desc">{{ property.description }}</p>
          <p><strong>{{ t("numberOfProperty") }}:</strong> {{ property.numberOfProperty }}</p>
          <p><strong>{{ t("category") }}:</strong> {{ property.category }}</p>

          <!-- Buttons -->
          <div class="btn-group">
            <button class="book-btn" @click="bookNow(property)">
              {{ t("bookNow") }}
            </button>

            <button class="detail-btn" @click="toggleDetails(index)">
              {{ expanded[index] ? t("hideDetails") : t("viewDetails") }}
            </button>
          </div>

          <!-- DETAILS SECTION -->
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
                  {{ t("from") }} {{ formatDateTime(b.startDate) }}
                  {{ t("to") }} {{ formatDateTime(b.endDate) }}
                  — {{ b.numberOfProperty }} {{ t("booked") }}
                  ({{ b.status }})
                </li>
              </ul>

              <p v-else>{{ t("noBookings") }}</p>
            </div>
          </transition>
        </div>
      </div>

      <!-- No Results -->
      <p v-if="!loading && !properties.length && !error" class="no-results">
        {{ t("noPropertiesFound") }}
      </p>
    </div>

    <!-- LOGIN PROMPT -->
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

/* ===== NEW ADDED ===== */
const showCategories = ref(true);

/* ===== EXISTING STATES ===== */
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


/* ===== FUNCTIONS ===== */

async function selectCategory(cat) {
  category.value = cat;
  showCategories.value = false;
  await fetchProperties();
}

function goBack() {
  showCategories.value = true;
  category.value = "";
  properties.value = [];
  expanded.value = {};
}

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

function toggleDetails(index) {
  expanded.value[index] = !expanded.value[index];
}

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

function goToLoginAndClearPrompt() {
  showLoginPrompt.value = false;
  router.push("/login");
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
</script>

<style scoped>
/* ===== BACK BUTTON ===== */
.back-container {
  margin-bottom: 15px;
}
.back-btn {
  background: #1e3a8a;
  color: white;
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}
.back-btn:hover {
  background: #162f6b;
}

/* ===== PAGE BASE ===== */
.properties-page {
  padding: 10px;
  background: white;
  min-height: 100vh;
}
h2 {
  text-align: center;
  color: #1e3a8a;
  margin-bottom: 20px;
}

/* ===== CATEGORY BUTTONS ===== */
.category-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}
.category-buttons button {
  padding: 14px 20px;
  border: 2px solid #1e3a8a;
  color: #1e3a8a;
  background: white;
  font-weight: bold;
  border-radius: 10px;
  cursor: pointer;
}
.category-buttons button:hover {
  background: #1e3a8a;
  color: white;
}

/* ===== PROPERTY CARDS ===== */
.property-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 20px;
}

.property-card {
  background: white;
  border: 2px solid black;
  padding: 15px;
  border-radius: 14px;
}

.property-img {
  width: 100%;
  height: 200px;
  border-radius: 10px;
  object-fit: cover;
}

.no-image {
  height: 200px;
  background: #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
}
.desc {
  color: #555;
}

/* ===== BUTTONS ===== */
.btn-group {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.book-btn {
  flex: 1;
  background: #10b981;
  color: white;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
}
.detail-btn {
  flex: 1;
  background: #1e3a8a;
  color: white;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
}

/* ===== DETAILS ===== */
.details {
  background: #f3f4f6;
  padding: 10px;
  border-radius: 8px;
  margin-top: 10px;
}

/* ===== LOGIN PROMPT ===== */
.login-prompt-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}
.message-box {
  background: white;
  padding: 28px;
  border-radius: 12px;
  text-align: center;
  position: relative;
}
.redirect-btn {
  background: #2563eb;
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
}

.close-btn {
  position: absolute;
  right: 15px;
  top: 10px;
  cursor: pointer;
}
</style>
