<template>
  <div class="properties-page">

    <!-- ================= BACK BUTTON ================= -->
    <div v-if="showProperties" class="back-container" role="navigation" aria-label="Back navigation">
      <button type="button" class="back-btn" @click="goBack" aria-label="Back">
        ← {{ t("back") }}
      </button>
    </div>

    <!-- ================= CATEGORY LIST ================= -->
    <section v-if="showCategories" class="category-section">
      <div class="category-hero">
        <div class="hero-copy">
       
          <h4>{{ t("selectPropertiesByCategory") }}</h4>
         
        </div>

        <div class="hero-search">
          <div class="search-hero-wrapper">
            <span class="search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              v-model="searchCategory"
              placeholder="Search all properties..."
              aria-label="Search categories"
              class="search-hero-input"
            />
          </div>
        </div>
      </div>

      <!-- Loading categories -->
      <div v-if="loadingCategories" class="loading-section">
        <div class="spinner"></div>
        <p>{{ t("loadingCategories") }}</p>
      </div>

      <!-- Error -->
      <p v-if="categoryError" class="error">{{ categoryError }}</p>

      <!-- Category Cards -->
      <div v-if="!loadingCategories && filteredCategories.length" class="category-grid">
        <div
          v-for="cat in filteredCategories"
          :key="cat"
          class="category-box"
          @click="selectCategory(cat)"
        >
          <div class="category-icon">
            <img
              v-if="categoryImages[cat]"
              :src="categoryImages[cat]"
              :alt="cat + ' image'"
              loading="lazy"
            />
            <div v-else class="category-emoji">{{ categoryIcon(cat) }}</div>
          </div>
          <h3>{{ cat }}</h3>
          <span class="category-meta">{{ t("seeListings") || "View Listings" }}</span>
        </div>
      </div>

      <!-- No Categories -->
      <p v-if="!loadingCategories && !filteredCategories.length" class="no-results">
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

          <label class="sr-only" for="search-name">Name</label>
          <input
            id="search-name"
            type="text"
            v-model="searchForm.name"
            placeholder="Name"
            aria-label="Property name"
          />

          <label class="sr-only" for="search-price">Max rental price per month</label>
          <input
            id="search-price"
            type="number"
            v-model.number="searchForm.rentalPricePerMonth"
            placeholder="Max Rental Price per Month"
            min="0"
            aria-label="Maximum rental price per month"
          />

          <label class="sr-only" for="search-location">Location</label>
          <input
            id="search-location"
            type="text"
            v-model="searchForm.location"
            placeholder="Location"
            aria-label="Location"
          />

          <button type="button" @click="applySearch">{{ t("search") }}</button>
          <button type="button" @click="resetSearch">{{ t("reset") }}</button>

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
      <div v-if="!loading && properties.length" class="property-grid">
        <article
          v-for="(property, index) in properties"
          :key="property._id || index"
          class="property-card"
        >
          <!-- Property Image -->
          <div class="property-image-container">
            <img
              :src="property.imageUrls?.[0] || defaultImage"
              class="property-image"
              alt="Property image"
              loading="lazy"
            />
            <div class="property-overlay">
              <span class="property-category">{{ property.category }}</span>
            </div>
          </div>

          <!-- Property Content -->
          <div class="property-content">
            <h3 class="property-title">{{ property.name }}</h3>
            <p class="property-description">{{ property.description }}</p>

            <div class="property-details">
              <div class="detail-item">
                <i class="icon-location"></i>
                <span>{{ property.location || 'Location not specified' }}</span>
              </div>
              <div class="detail-item">
                <i class="icon-units"></i>
                <span>{{ property.numberOfProperty }} units available</span>
              </div>
            </div>

            <!-- Pricing Section -->
            <div class="property-pricing">
              <div class="price-item" v-if="property.rentalPrice?.perMonth">
                <span class="price-label">Monthly</span>
                <span class="price-value">${{ property.rentalPrice.perMonth }}</span>
              </div>
              <div class="price-item" v-if="property.rentalPrice?.perDay">
                <span class="price-label">Daily</span>
                <span class="price-value">${{ property.rentalPrice.perDay }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="property-actions">
              <button type="button" class="btn btn-primary" @click="bookNow(property)">
                <i class="icon-book"></i>
                {{ t("bookNow") }}
              </button>
              <button type="button" class="btn btn-secondary" @click="toggleDetails(index)" :aria-expanded="!!expanded[index]">
                <i class="icon-details"></i>
                {{ expanded[index] ? t("hideDetails") : t("viewDetails") }}
              </button>
            </div>
          </div>

          <!-- Expanded Details -->
          <transition name="slide-down">
            <div v-if="expanded[index]" class="property-expanded">
              <div class="expanded-section">
                <h4 class="section-title">{{ t("merchantInfo") }}</h4>
                <div class="merchant-info">
                  <div class="info-row">
                    <span class="info-label">{{ t("merchantName") }}:</span>
                    <span class="info-value">{{ property.merchant?.name || "N/A" }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">{{ t("merchantEmail") }}:</span>
                    <span class="info-value">{{ property.merchant?.email || "N/A" }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">{{ t("merchantPhone") }}:</span>
                    <span class="info-value">{{ property.merchant?.phone || "N/A" }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">{{ t("businessName") }}:</span>
                    <span class="info-value">{{ property.merchant?.businessName || "N/A" }}</span>
                  </div>
                </div>
              </div>

              <div class="expanded-section">
                <h4 class="section-title">{{ t("rentalDetails") }}</h4>
                <div class="rental-prices">
                  <div class="price-row" v-if="property.rentalPrice?.perHour">
                    <span class="price-type">Per Hour:</span>
                    <span class="price-amount">${{ property.rentalPrice.perHour }}</span>
                  </div>
                  <div class="price-row" v-if="property.rentalPrice?.perDay">
                    <span class="price-type">Per Day:</span>
                    <span class="price-amount">${{ property.rentalPrice.perDay }}</span>
                  </div>
                  <div class="price-row" v-if="property.rentalPrice?.perWeek">
                    <span class="price-type">Per Week:</span>
                    <span class="price-amount">${{ property.rentalPrice.perWeek }}</span>
                  </div>
                  <div class="price-row" v-if="property.rentalPrice?.perMonth">
                    <span class="price-type">Per Month:</span>
                    <span class="price-amount">${{ property.rentalPrice.perMonth }}</span>
                  </div>
                  <div class="price-row" v-if="property.rentalPrice?.perYear">
                    <span class="price-type">Per Year:</span>
                    <span class="price-amount">${{ property.rentalPrice.perYear }}</span>
                  </div>
                </div>
              </div>

              <div class="expanded-section">
                <h4 class="section-title">{{ t("bookings") }}</h4>
                <div class="bookings-list" v-if="property.bookings?.length">
                  <div
                    v-for="(booking, i) in property.bookings"
                    :key="i"
                    class="booking-item"
                  >
                    <div class="booking-dates">
                      {{ formatDateTime(booking.startDate) }} - {{ formatDateTime(booking.endDate) }}
                    </div>
                    <div class="booking-details">
                      {{ booking.numberOfProperty }} {{ t("booked") }}
                      <span class="booking-status" :class="`status-${booking.status.toLowerCase()}`">
                        {{ booking.status }}
                      </span>
                    </div>
                  </div>
                </div>
                <p v-else class="no-bookings">{{ t("noBookings") }}</p>
              </div>
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
const categoryImages = ref({});

/* =====================================================
   SEARCH FORM STATE
===================================================== */
const searchForm = ref({
  name: "",
  rentalPricePerMonth: null,
  location: "",
});

const searchCategory = ref("");

const filteredCategories = computed(() => {
  const filter = searchCategory.value.trim().toLowerCase();
  return filter
    ? categories.value.filter((cat) => cat.toLowerCase().includes(filter))
    : categories.value;
});

function categoryIcon(category) {
  const name = (category || "").toLowerCase();
  if (name.includes("construction") || name.includes("equipment")) return "🚧";
  if (name.includes("irrigation") || name.includes("water")) return "💧";
  if (name.includes("real") || name.includes("estate") || name.includes("property")) return "🏠";
  if (name.includes("medical") || name.includes("health")) return "🏥";
  return "🏢";
}

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
    // load representative images for categories
    await loadCategoryImages();
  } catch (err) {
    categoryError.value = t("failedToLoadCategories");
  } finally {
    loadingCategories.value = false;
  }
}

async function loadCategoryImages() {
  const cats = categories.value || [];
  if (!cats.length) return;

  await Promise.all(
    cats.map(async (cat) => {
      try {
        const res = await getPropertiesByCategory(cat);
        const img = res.properties?.[0]?.imageUrls?.[0] || defaultImage;
        categoryImages.value[cat] = img;
      } catch (e) {
        categoryImages.value[cat] = defaultImage;
      }
    })
  );
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
  padding: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  min-height: 100vh;
  max-width: 1180px;
  margin: 24px auto;
  font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  color: #0f172a;
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
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

/* ================= CATEGORY CARD ================= */
.category-box {
  background: #ffffff;
  border-radius: 14px;
  padding: 28px 22px 24px 22px;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 18px 40px rgba(18, 38, 81, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  border: 1px solid rgba(203, 213, 225, 0.6);
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.category-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 26px 50px rgba(18, 38, 81, 0.12);
  border-color: rgba(96, 165, 250, 0.35);
}

.category-icon {
  width: 92px;
  height: 92px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #f0f9ff 0%, #eef2ff 100%);
  font-size: 44px;
  margin-bottom: 18px;
}

.category-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
}

.category-emoji {
  font-size: 40px;
}

.category-box h3 {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.1;
}

.category-meta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  padding: 8px 16px;
  border-radius: 999px;
  background: linear-gradient(180deg, #0f6570 0%, #155e63 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  margin-top: 14px;
  box-shadow: 0 6px 18px rgba(16, 78, 84, 0.08);
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-box:active {
  transform: scale(0.98);
}

.category-hero {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 24px;
  align-items: center;
  padding: 24px 0 12px;
}

.hero-copy {
  max-width: 720px;
}

.hero-label {
  margin: 0 0 10px;
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-copy h2 {
  font-size: 34px;
  line-height: 1.1;
  color: #0f172a;
  margin: 0 0 12px;
}

.hero-subtitle {
  color: #475569;
  font-size: 15px;
  line-height: 1.8;
  max-width: 680px;
}

.hero-search {
  display: flex;
  justify-content: flex-end;
}

.hero-search input {
  width: 100%;
  max-width: 780px;
  border-radius: 12px;
  border: 1px solid #e6edf0;
  padding: 18px 20px 18px 48px;
  font-size: 16px;
  color: #0f172a;
  background: #ffffff;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.12s ease;
  box-shadow: 0 10px 30px rgba(15, 46, 51, 0.06);
}


.search-hero-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 28px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #94a3b8;
}

.search-hero-input::placeholder {
  color: #9aa6af;
}

.hero-search input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

/* Focus states for accessibility */
button:focus,
input:focus,
select:focus,
textarea:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  border-color: #2563eb;
}

@media (max-width: 860px) {
  .category-hero {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .hero-search {
    justify-content: stretch;
  }
}

/* Mobile / small tablet adjustments */
@media (max-width: 720px) {
  .search-hero-input {
    max-width: 100%;
    padding-left: 44px;
    padding-right: 20px;
  }

  .search-icon {
    left: 18px;
  }

  .category-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .category-box {
    min-height: 160px;
    padding: 20px;
    border-radius: 12px;
  }

  .category-icon {
    margin: 0 auto 14px;
    width: 72px;
    height: 72px;
    font-size: 36px;
  }

  .category-meta {
    width: 92%;
    margin: 14px auto 0;
  }

  .hero-copy h2 {
    font-size: 26px;
  }
}

@media (max-width: 480px) {
  .search-hero-input {
    padding-left: 42px;
    font-size: 15px;
  }

  .property-grid {
    grid-template-columns: 1fr;
  }

  .property-image-container {
    height: 180px;
  }

  .property-content {
    padding: 14px;
  }

  .property-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .category-icon {
    width: 64px;
    height: 64px;
    font-size: 28px;
  }

  .category-box {
    padding: 14px;
  }
}

@media (max-width: 600px) {
  .category-grid {
    grid-template-columns: 1fr;
  }

  .hero-copy h2 {
    font-size: 28px;
  }
}

/* ================= PROPERTY GRID ================= */
.property-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 20px;
}

/* ================= PROPERTY CARD ================= */
.property-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.property-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

/* ================= PROPERTY IMAGE ================= */
.property-image-container {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.property-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.property-card:hover .property-image {
  transform: scale(1.05);
}

.property-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
}

.property-category {
  background: rgba(255, 255, 255, 0.9);
  color: #1e3a8a;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Small visual polish for badges */
.property-category {
  backdrop-filter: blur(6px);
  box-shadow: 0 6px 18px rgba(16, 24, 40, 0.06);
}

/* ================= PROPERTY CONTENT ================= */
.property-content {
  padding: 20px;
}

.property-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e3a8a;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.property-description {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ================= PROPERTY DETAILS ================= */
.property-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4b5563;
}

.icon-location::before,
.icon-units::before {
  content: "📍";
  font-size: 16px;
}

.icon-units::before {
  content: "🏢";
}

/* ================= PROPERTY PRICING ================= */
.property-pricing {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.price-item {
  flex: 1;
  text-align: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.price-label {
  display: block;
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.price-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #059669;
}

/* ================= PROPERTY ACTIONS ================= */
.property-actions {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 2px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.icon-book::before,
.icon-details::before {
  font-size: 16px;
}

.icon-book::before {
  content: "📅";
}

.icon-details::before {
  content: "ℹ️";
}

/* ================= EXPANDED DETAILS ================= */
.property-expanded {
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}

.expanded-section {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.expanded-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e3a8a;
  margin: 0 0 12px 0;
}

/* ================= MERCHANT INFO ================= */
.merchant-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.info-value {
  color: #6b7280;
  font-size: 14px;
}

/* ================= RENTAL PRICES ================= */
.rental-prices {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.price-type {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.price-amount {
  font-weight: 600;
  color: #059669;
  font-size: 14px;
}

/* ================= BOOKINGS ================= */
.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.booking-item {
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.booking-dates {
  font-weight: 500;
  color: #1e3a8a;
  font-size: 14px;
  margin-bottom: 4px;
}

.booking-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #6b7280;
}

.booking-status {
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-confirmed {
  background: #dcfce7;
  color: #166534;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.no-bookings {
  color: #9ca3af;
  font-style: italic;
  margin: 0;
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
.sr-only {
  position: absolute !important;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap;
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