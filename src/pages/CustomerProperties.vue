<template>
  <div class="properties-page">

    <!-- ================= BACK BUTTON ================= -->
    <div v-if="showProperties" class="back-container">
      <button class="back-btn" @click="goBack">
        ← {{ t("back") }}
      </button>
    </div>

    <!-- ================= CATEGORY LIST ================= -->
    <section v-if="showCategories" class="category-section">
      <h2>{{ t("selectPropertiesByCategory") }}</h2>

      <!-- Loading categories -->
      <div v-if="loadingCategories" class="loading-section">
        <div class="spinner"></div>
        <p>{{ t("loadingCategories") }}</p>
      </div>

      <!-- Error -->
      <p v-if="categoryError" class="error">{{ categoryError }}</p>

      <!-- Category Boxes -->
      <div v-if="!loadingCategories && categories.length" class="category-grid">
        <div
          v-for="cat in categories"
          :key="cat"
          class="category-box"
          @click="selectCategory(cat)"
        >
          <h3>{{ cat }}</h3>
        </div>
      </div>

      <!-- No Categories -->
      <p v-if="!loadingCategories && !categories.length" class="no-results">
        {{ t("noCategoriesFound") }}
      </p>
    </section>

    <!-- ================= PROPERTIES LIST ================= -->
    <section v-if="showProperties">
      <h2 class="selected-category-title">{{ selectedCategoryLabel }}</h2>

      <!-- ================= SEARCH FORM ================= -->
      <div class="search-bar">
        <h3>{{ t("filterProperties") }}</h3>
        <div class="search-fields">

          <input
            type="text"
            v-model="searchForm.name"
            placeholder="Name"
          />

          <input
  type="number"
  v-model.number="searchForm.rentalPricePerMonth"
  placeholder="Max Rental Price per Month"
  min="0"
/>

          <input
            type="text"
            v-model="searchForm.location"
            placeholder="Location"
          />

          <button @click="applySearch">{{ t("search") }}</button>
          <button @click="resetSearch">{{ t("reset") }}</button>

        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-section">
        <div class="spinner"></div>
        <p>{{ t("loadingProperties") }}</p>
      </div>

      <!-- Error -->
      <p v-if="error" class="error">{{ error }}</p>

      <!-- Property Cards -->
      <div v-if="!loading && properties.length" class="property-list">
        <article
          v-for="(property, index) in properties"
          :key="property._id || index"
          class="property-card"
        >
          <!-- Image -->
          <img
            :src="property.imageUrls?.[0] || defaultImage"
            class="property-img"
            alt="Property image"
          />

          <!-- Property Info -->
          <h3>{{ property.name }}</h3>
          <p class="desc">{{ property.description }}</p>
          <p><strong>{{ t("numberOfProperty") }}:</strong> {{ property.numberOfProperty }}</p>
          <p><strong>{{ t("category") }}:</strong> {{ property.category }}</p>

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
              <p><strong>{{ t("merchantName") }}:</strong> {{ property.merchant?.name || "N/A" }}</p>
              <p><strong>{{ t("merchantEmail") }}:</strong> {{ property.merchant?.email || "N/A" }}</p>
              <p><strong>{{ t("merchantPhone") }}:</strong> {{ property.merchant?.phone || "N/A" }}</p>
              <p><strong>{{ t("businessName") }}:</strong> {{ property.merchant?.businessName || "N/A" }}</p>
              <p><strong>{{ t("accountNumber") }}:</strong> {{ property.merchant?.acountnumber || "N/A" }}</p>

              <h4>{{ t("rentalDetails") }}</h4>
              <ul>
                <li><strong>Per Hour:</strong> {{ property.rentalPrice?.perHour || "-" }}</li>
                <li><strong>Per Day:</strong> {{ property.rentalPrice?.perDay || "-" }}</li>
                <li><strong>Per Week:</strong> {{ property.rentalPrice?.perWeek || "-" }}</li>
                <li><strong>Per Month:</strong> {{ property.rentalPrice?.perMonth || "-" }}</li>
                <li><strong>Per Year:</strong> {{ property.rentalPrice?.perYear || "-" }}</li>
              </ul>

              <h4>{{ t("bookings") }}</h4>
              <ul v-if="property.bookings?.length">
                <li v-for="(b, i) in property.bookings" :key="i">
                  {{ t("from") }} {{ formatDateTime(b.startDate) }}
                  {{ t("to") }} {{ formatDateTime(b.endDate) }}
                  — {{ b.numberOfProperty }} {{ t("booked") }}
                  <span class="booking-status">({{ b.status }})</span>
                </li>
              </ul>
              <p v-else>{{ t("noBookings") }}</p>
            </div>
          </transition>
        </article>
      </div>

      <!-- No Properties -->
      <p v-if="!loading && !properties.length && !error" class="no-results">
        {{ t("noPropertiesFound") }}
      </p>
    </section>

    <!-- ================= LOGIN PROMPT ================= -->
    <transition name="prompt-fade">
      <div v-if="showLoginPrompt" class="login-prompt-overlay">
        <div class="message-box">
          <span class="close-btn" @click="showLoginPrompt = false">&times;</span>
          <h3>{{ t("loginRequiredTitle") }}</h3>
          <p>{{ t("loginRequiredMessage") }}</p>
          <button class="redirect-btn" @click="goToLoginAndClearPrompt">
            {{ t("loginOrRegister") }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { getPropertiesByCategory, getCategories } from "../services/propertyService.js";

const { t } = useI18n();
const router = useRouter();

/* =====================================================
   UI STATES
===================================================== */
const showCategories = ref(true);
const showProperties = ref(false);
const showLoginPrompt = ref(false);
const loadingCategories = ref(false);
const categoryError = ref("");
const loading = ref(false);
const error = ref("");
const expanded = ref({});

/* =====================================================
   DATA STATES
===================================================== */
const categories = ref([]);
const category = ref("");
const properties = ref([]);
const allProperties = ref([]); // Keep original fetched list for reset
const defaultImage = "/images/default-property.png"; // fallback image

/* =====================================================
   SEARCH FORM STATE
===================================================== */
const searchForm = ref({
  name: "",
  rentalPricePerMonth: null,
  location: "",
});

/* =====================================================
   SELECTED CATEGORY TITLE
===================================================== */
const selectedCategoryLabel = computed(() => category.value);

/* =====================================================
   FETCH CATEGORIES FROM BACKEND
===================================================== */
async function loadCategories() {
  loadingCategories.value = true;
  categoryError.value = "";
  try {
    const res = await getCategories();
    categories.value = res.categories || [];
  } catch (err) {
    categoryError.value = t("failedToLoadCategories");
  } finally {
    loadingCategories.value = false;
  }
}

/* =====================================================
   CATEGORY SELECTION
===================================================== */
async function selectCategory(cat) {
  category.value = cat;
  showCategories.value = false;
  showProperties.value = true;
  await fetchProperties(cat);
}

/* =====================================================
   FETCH PROPERTIES FOR SELECTED CATEGORY
===================================================== */
async function fetchProperties(cat) {
  loading.value = true;
  error.value = "";
  properties.value = [];
  allProperties.value = [];

  try {
    const lang = localStorage.getItem("lang") || "en";
    const res = await getPropertiesByCategory(cat, lang);
    properties.value = res.properties || [];
    allProperties.value = [...properties.value]; // Save original list for search/reset
  } catch (err) {
    error.value = err.response?.data?.message || t("failedToLoadProperties");
  } finally {
    loading.value = false;
  }
}
/* =====================================================
   SEARCH / FILTER PROPERTIES (FINAL FIXED VERSION)
===================================================== */

function applySearch() {
  const name = searchForm.value.name?.trim().toLowerCase();
  const location = searchForm.value.location?.trim().toLowerCase();
  const rentalPrice = searchForm.value.rentalPricePerMonth;

  properties.value = allProperties.value.filter((property) => {

    // ===== NAME FILTER =====
    if (name && !property.name?.toLowerCase().includes(name)) {
      return false;
    }

    // ===== LOCATION FILTER =====
    if (location && !property.location?.toLowerCase().includes(location)) {
      return false;
    }

    // ===== PRICE FILTER (MATCHES BACKEND STRUCTURE) =====
    if (rentalPrice != null && rentalPrice !== "") {
      const price = Number(property.rentalPrice?.perMonth);

      // If no price or invalid → exclude
      if (isNaN(price) || price > rentalPrice) {
        return false;
      }
    }

    // ✅ PASSES ALL ACTIVE FILTERS
    return true;
  });
}   function resetSearch() {
  // Reset form inputs
  searchForm.value = {
    name: "",
    rentalPricePerMonth: null,
    location: "",
  };

  // Restore original full list
  properties.value = [...allProperties.value];
}

/* =====================================================
   BACK NAVIGATION
===================================================== */
function goBack() {
  showCategories.value = true;
  showProperties.value = false;
  category.value = "";
  properties.value = [];
  allProperties.value = [];
  expanded.value = {};
  error.value = "";
  searchForm.value = {
    name: "",
    rentalPricePerMonth: null,
    location: "",
  };
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

  const bookingData = {
    assetName: property.name,
    merchantEmail: property.merchant?.email || "",
  };

  if (!token) {
    sessionStorage.setItem("pendingBooking", JSON.stringify(bookingData));
    showLoginPrompt.value = true;
    return;
  }

  router.push({
    path: "/app/booking",
    query: bookingData,
  });
}

/* =====================================================
   LOGIN PROMPT
===================================================== */
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

/* =====================================================
   LOAD CATEGORIES ON MOUNT
===================================================== */
onMounted(() => {
  loadCategories();
});
</script>

<style scoped>

/* ================= PAGE BASE ================= */
.properties-page {
  padding: 12px;
  background: white;
  min-height: 100vh;
  max-width: 1100px;
  margin: auto;
}

h2 {
  text-align: center;
  color: #1e3a8a;
  margin-bottom: 20px;
}

/* ================= BACK BUTTON ================= */
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
  transition: 0.2s ease;
}

.back-btn:hover {
  background: #162f6b;
}

/* ================= SELECTED CATEGORY TITLE ================= */
.selected-category-title {
  text-align: center;
  margin: 8px auto 18px;
  font-size: 18px;
  font-weight: 700;
  color: #7a8a1e;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  max-width: 90%;
}

.selected-category-title::after {
  content: "";
  display: block;
  width: 60px;
  height: 3px;
  background: #a9ac12;
  margin: 6px auto 0;
  border-radius: 2px;
}
/* ================= CATEGORY GRID ================= */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

/* ================= CATEGORY CARD ================= */
.category-box {
  background: #aebdb03f;
  border-radius: 16px;
  padding: 25px 15px;
  text-align: center;
  cursor: pointer;

  /* Soft shadow */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);

  /* Smooth animation */
  transition: all 0.3s ease;

  /* Subtle border */
  border: 1px solid #f1f1f138;
}

/* Hover effect */
.category-box:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
  border-color: #3b82f6;
}

/* Text */
.category-box h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e3a8a;
  margin: 0;
}

/* Optional subtle icon space */
.category-box::before {
  
  display: block;
  font-size: 28px;
  margin-bottom: 10px;
}
.category-box:active {
  transform: scale(0.96);
}

/* ================= PROPERTY LIST ================= */
.property-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 20px;
}

/* ================= PROPERTY CARD ================= */
.property-card {
  background: white;
  border: 2px solid #e5e7eb;
  padding: 15px;
  border-radius: 14px;
  transition: 0.2s ease;
}

.property-card:hover {
  box-shadow: 0 8px 18px rgba(0,0,0,0.08);
}

/* ================= PROPERTY IMAGE ================= */
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

/* ================= DESCRIPTION ================= */
.desc {
  color: #555;
  margin: 6px 0;
}

/* ================= BUTTON GROUP ================= */
.btn-group {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

/* ================= BOOK BUTTON ================= */
.book-btn {
  flex: 1;
  background: #10b981;
  color: white;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  border: none;
  font-weight: 600;
  transition: 0.2s ease;
}

.book-btn:hover {
  background: #059669;
}

/* ================= DETAIL BUTTON ================= */
.detail-btn {
  flex: 1;
  background: #1e3a8a;
  color: white;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  border: none;
  font-weight: 600;
  transition: 0.2s ease;
}

.detail-btn:hover {
  background: #162f6b;
}

/* ================= PROPERTY DETAILS ================= */
.details {
  background: #f3f4f6;
  padding: 12px;
  border-radius: 8px;
  margin-top: 10px;
  font-size: 14px;
}

/* ================= LOGIN PROMPT ================= */
.login-prompt-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}
/* ================= SEARCH BAR ================= */
.search-bar {
  background: #f9fafb;
  padding: 12px 16px;
  margin: 20px auto;
  border-radius: 10px;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid #e5e7eb;
}

.search-bar h3 {
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e3a8a;
}

.search-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.search-fields input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
}

.search-fields button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s ease;
}

.search-fields button:hover {
  background: #1d4ed8;
}

.search-fields button:last-child {
  background: #6b7280;
}

.search-fields button:last-child:hover {
  background: #4b5563;
}

/* ================= MOBILE OPTIMIZATION FOR SEARCH ================= */
@media (max-width: 480px) {
  .search-fields {
    flex-direction: column;
  }

  .search-fields input,
  .search-fields button {
    width: 100%;
  }
}
.message-box {
  background: white;
  padding: 28px;
  border-radius: 12px;
  text-align: center;
  position: relative;
  width: 90%;
  max-width: 350px;
}

.redirect-btn {
  background: #2563eb;
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  margin-top: 10px;
  cursor: pointer;
}

.redirect-btn:hover {
  background: #1d4ed8;
}

.close-btn {
  position: absolute;
  right: 15px;
  top: 10px;
  cursor: pointer;
  font-size: 20px;
}

/* ================= MOBILE OPTIMIZATION ================= */
@media (max-width: 480px) {

  .selected-category-title {
    font-size: 16px;
    margin-bottom: 14px;
  }

  .property-img {
    height: 180px;
  }

  .category-box {
    font-size: 13px;
    padding: 14px 8px;
  }

}

</style>