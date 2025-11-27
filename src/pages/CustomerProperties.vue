<template>
  <div class="properties-page">

    <!-- ================= BACK BUTTON ================= -->
    <div v-if="!showCategories" class="back-container">
      <button class="back-btn" @click="goBack">
        ← {{ t("back") }}
      </button>
    </div>

    <!-- ================= SELECTED CATEGORY TITLE ================= -->
    <h3
      v-if="selectedCategoryLabel && (showProperties || showCustomCategories)"
      class="selected-category-title"
    >
      {{ selectedCategoryLabel }}
    </h3>

    <!-- ================= MAIN CATEGORY SELECTION ================= -->
    <section v-if="showCategories" class="category-section">
      <h2>{{ t("selectPropertiesByCategory")}}</h2>

      <div class="category-buttons">
        <button
          v-for="cat in categories"
          :key="cat.value"
          @click="selectCategory(cat.value)"
        >
          {{ cat.label }}
        </button>
      </div>
    </section>

    <!-- ================= CUSTOM CATEGORY (OTHER) ================= -->
    <section v-if="showCustomCategories" class="category-section">
      <h2>{{ t("selectCustomCategory") }}</h2>

      <div
        v-if="customCategories.length"
        class="custom-category-buttons"
      >
        <button
          v-for="custom in customCategories"
          :key="custom"
          @click="selectCustomCategory(custom)"
        >
          {{ custom }}
        </button>
      </div>

      <p v-else class="no-custom-category">
        {{ t("noCustomCategoryFound") }}
      </p>
    </section>

    <!-- ================= PROPERTIES LIST ================= -->
    <section v-if="showProperties">

      <!-- Loading -->
      <div v-if="loading" class="loading-section">
        <div class="spinner"></div>
        <p>{{ t("loadingProperties") }}</p>
      </div>

      <!-- Error -->
      <p v-if="error" class="error">
        {{ error }}
      </p>

      <!-- Property Cards -->
      <div
        v-if="!loading && properties.length"
        class="property-list"
      >
        <article
          v-for="(property, index) in properties"
          :key="property._id || index"
          class="property-card"
        >
          <!-- Image -->
          <img
            v-if="property.imageUrls?.length"
            :src="property.imageUrls[0]"
            class="property-img"
            alt="Property image"
          />

          <div v-else class="no-image">
            {{ t("noImage") }}
          </div>

          <!-- Property Info -->
          <h3>{{ property.name }}</h3>
          <p class="desc">{{ property.description }}</p>

          <p>
            <strong>{{ t("numberOfProperty") }}:</strong>
            {{ property.numberOfProperty }}
          </p>

          <p>
            <strong>{{ t("category") }}:</strong>
            {{ property.category }}
          </p>

          <!-- Actions -->
          <div class="btn-group">
            <button class="book-btn" @click="bookNow(property)">
              {{ t("bookNow") }}
            </button>

            <button class="detail-btn" @click="toggleDetails(index)">
              {{ expanded[index] ? t("hideDetails") : t("viewDetails") }}
            </button>
          </div>

          <!-- DETAILS -->
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
        </article>
      </div>

      <!-- No Results -->
      <p
        v-if="!loading && !properties.length && !error"
        class="no-results"
      >
        {{ t("noPropertiesFound") }}
      </p>
    </section>

    <!-- ================= LOGIN PROMPT ================= -->
    <transition name="prompt-fade">
      <div v-if="showLoginPrompt" class="login-prompt-overlay">
        <div class="message-box">
          <span class="close-btn" @click="showLoginPrompt = false">
            &times;
          </span>

          <h3>{{ t("loginRequiredTitle") }}</h3>
          <p>{{ t("loginRequiredMessage") }}</p>

          <button
            class="redirect-btn"
            @click="goToLoginAndClearPrompt"
          >
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

/* =====================================================
   UI STATES
===================================================== */
const showCategories = ref(true);
const showCustomCategories = ref(false);
const showProperties = ref(false);
const showLoginPrompt = ref(false);

/* =====================================================
   DATA STATES
===================================================== */
const categories = [
  { value: "EventSupply", label: "Event Supply" },
  { value: "ConstructionEquipment", label: "Construction Equipment" },
  { value: "HealthcareMedical", label: "Healthcare & Medical" },
  { value: "Other", label: "Other" },
];

const category = ref("");
const selectedCustomCategory = ref(""); // ⭐ NEW
const properties = ref([]);
const allOtherProperties = ref([]);
const customCategories = ref([]);

const loading = ref(false);
const error = ref("");
const expanded = ref({});

/* =====================================================
   SELECTED CATEGORY TITLE (FOR UI)
===================================================== */
const selectedCategoryLabel = computed(() => {
  if (selectedCustomCategory.value) {
    return selectedCustomCategory.value;
  }

  const found = categories.find(
    (c) => c.value === category.value
  );
  return found ? found.label : "";
});

/* =====================================================
   CATEGORY SELECTION
===================================================== */
async function selectCategory(cat) {
  category.value = cat;
  selectedCustomCategory.value = "";
  showCategories.value = false;

  if (cat === "Other") {
    await loadCustomCategories();
  } else {
    showProperties.value = true;
    await fetchProperties(cat);
  }
}

/* =====================================================
   LOAD NORMAL CATEGORIES
===================================================== */
async function fetchProperties(cat) {
  loading.value = true;
  error.value = "";
  properties.value = [];

  try {
    const lang = localStorage.getItem("lang") || "en";
    const res = await getPropertiesByCategory(cat, lang);
    properties.value = res.properties || [];
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      t("failedToLoadProperties");
  } finally {
    loading.value = false;
  }
}

/* =====================================================
   LOAD CUSTOM CATEGORIES (OTHER)
===================================================== */
async function loadCustomCategories() {
  loading.value = true;
  showCustomCategories.value = true;
  showProperties.value = false;
  error.value = "";

  try {
    const lang = localStorage.getItem("lang") || "en";
    const res = await getPropertiesByCategory("Other", lang);
    allOtherProperties.value = res.properties || [];

    const set = new Set();
    allOtherProperties.value.forEach((p) => {
      if (p.customCategory) set.add(p.customCategory);
    });

    customCategories.value = [...set];
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      t("failedToLoadProperties");
  } finally {
    loading.value = false;
  }
}

/* =====================================================
   SELECT CUSTOM CATEGORY
===================================================== */
function selectCustomCategory(customCat) {
  selectedCustomCategory.value = customCat;

  properties.value = allOtherProperties.value.filter(
    (p) => p.customCategory === customCat
  );

  showCustomCategories.value = false;
  showProperties.value = true;
}

/* =====================================================
   NAVIGATION
===================================================== */
function goBack() {
  showCategories.value = true;
  showCustomCategories.value = false;
  showProperties.value = false;

  category.value = "";
  selectedCustomCategory.value = "";
  properties.value = [];
  expanded.value = {};
  error.value = "";
}

/* =====================================================
   PROPERTY DETAILS
===================================================== */
function toggleDetails(index) {
  expanded.value[index] = !expanded.value[index];
}

/* =====================================================
   BOOKING
===================================================== */
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

/* =====================================================
   UTIL
===================================================== */
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

/* ===== SELECTED CATEGORY TITLE ===== */
.selected-category-title {
  text-align: center;
  margin: 8px auto 18px;
  font-size: 18px;
  font-weight: 700;
  color: #1e3a8a;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  max-width: 90%;
}

/* subtle divider for clarity */
.selected-category-title::after {
  content: "";
  display: block;
  width: 60px;
  height: 3px;
  background: #1e3a8a;
  margin: 6px auto 0;
  border-radius: 2px;
}

/* ===== MOBILE OPTIMIZATION ===== */
@media (max-width: 480px) {
  .selected-category-title {
    font-size: 16px;
    margin-bottom: 14px;
  }
}

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
}/* ===== CATEGORY BUTTONS (RESPONSIVE) ===== */
.category-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 12px;
  padding: 10px;
  max-width: 480px;
  margin: 0 auto;
}

.category-buttons button {
  aspect-ratio: 1 / 1; /* always square */
  width: 100%;
  border: 2px solid #1e3a8a;
  background: #ffffff;
  color: #1e3a8a;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  font-size: 14px;
  line-height: 1.2;
  padding: 6px;

  transition: all 0.2s ease;
}

.category-buttons button:hover {
  background: #1e3a8a;
  color: #ffffff;
  transform: translateY(-2px);
}

.category-buttons button:active {
  transform: scale(0.96);
}
/* ===== CUSTOM CATEGORY BUTTONS ===== */
.custom-category-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 10px;
  padding: 10px;
  max-width: 420px;
  margin: 0 auto;
}

.custom-category-buttons button {
  aspect-ratio: 1 / 1;
  width: 100%;
  border: 2px dashed #0f766e;
  background: #ecfdf5;
  color: #0f766e;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 12px;
  padding: 4px;

  transition: all 0.2s ease;
}

.custom-category-buttons button:hover {
  background: #0f766e;
  color: #ffffff;
}

.custom-category-buttons button:active {
  transform: scale(0.95);
}


/* ===== NO CUSTOM CATEGORY MESSAGE ===== */
.no-custom-category {
  text-align: center;
  color: #6b7280;
  font-style: italic;
  margin-top: 20px;
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
  background: rgba(0, 0, 0, 0.7);
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
