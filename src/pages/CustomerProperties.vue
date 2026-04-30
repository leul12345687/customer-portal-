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
          <p class="hero-label">Customer Portal</p>
          <div class="hero-actions">
            <button type="button" class="btn hero-btn btn-primary" @click="focusSearch">
              Browse catalog
            </button>
            <button type="button" class="btn hero-btn btn-ghost" @click="scrollToFeatured">
              View featured
            </button>
          </div>
          <div class="hero-stats">
            <div class="stat">
              <div class="stat-value">{{ activeListings }}</div>
              <div class="stat-label">Active listings</div>
            </div>
          </div>
        </div>

      </div>

      <div class="hero-search">
        <div class="search-hero-wrapper">
          <span class="search-icon" aria-hidden="true">🔍</span>
          <input
            ref="searchInput"
            type="text"
            v-model="searchCategory"
            placeholder="Search all properties..."
            aria-label="Search categories"
            class="search-hero-input"
          />
        </div>
      </div>

      <!-- Loading categories -->
      <div v-if="loadingCategories" class="loading-section">
        <div class="spinner"></div>
        <p>{{ t("loadingCategories") }}</p>
      </div>

      <!-- Error -->
      <p v-if="categoryError" class="error">{{ categoryError }}</p>

      <div class="section-head" ref="featuredAnchor">
        <div>
          <p class="section-label">Browse categories</p>
          <h3 class="section-title">{{ t("selectPropertiesByCategory") }}</h3>
        </div>
      </div>

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
                <span>{{ property.location || "Location not specified" }}</span>
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
                <span class="price-value">{{ property.rentalPrice.perMonth }}</span>
              </div>
              <div class="price-item" v-if="property.rentalPrice?.perDay">
                <span class="price-label">Daily</span>
                <span class="price-value">{{ property.rentalPrice.perDay }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="property-actions">
              <button type="button" class="btn btn-primary" @click="bookNow(property)">
                <i class="icon-book"></i>
                {{ t("bookNow") }}
              </button>
              <button
                type="button"
                class="btn btn-secondary"
                @click="toggleDetails(index)"
                :aria-expanded="!!expanded[index]"
              >
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
                    <span class="price-amount">{{ property.rentalPrice.perHour }}</span>
                  </div>
                  <div class="price-row" v-if="property.rentalPrice?.perDay">
                    <span class="price-type">Per Day:</span>
                    <span class="price-amount">{{ property.rentalPrice.perDay }}</span>
                  </div>
                  <div class="price-row" v-if="property.rentalPrice?.perWeek">
                    <span class="price-type">Per Week:</span>
                    <span class="price-amount">{{ property.rentalPrice.perWeek }}</span>
                  </div>
                  <div class="price-row" v-if="property.rentalPrice?.perMonth">
                    <span class="price-type">Per Month:</span>
                    <span class="price-amount">{{ property.rentalPrice.perMonth }}</span>
                  </div>
                  <div class="price-row" v-if="property.rentalPrice?.perYear">
                    <span class="price-type">Per Year:</span>
                    <span class="price-amount">{{ property.rentalPrice.perYear }}</span>
                  </div>
                </div>
              </div>

              <div class="expanded-section">
                <h4 class="section-title">{{ t("bookings") }}</h4>
                <div class="bookings-list" v-if="property.bookings?.length">
                  <div v-for="(booking, i) in property.bookings" :key="i" class="booking-item">
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
import { ref, computed, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { getPropertiesByCategory, getCategories } from "../services/propertyService.js";
import heroImage from "../image/newwww.png";

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
const allProperties = ref([]);
const defaultImage = "/images/default-property.png";
const categoryImages = ref({});
const totalActiveListings = ref(0);

/* =====================================================
   SEARCH FORM STATE
===================================================== */
const searchForm = ref({
  name: "",
  rentalPricePerMonth: null,
  location: "",
});

const searchCategory = ref("");
const searchInput = ref(null);
const featuredAnchor = ref(null);

const filteredCategories = computed(() => {
  const filter = searchCategory.value.trim().toLowerCase();
  return filter
    ? categories.value.filter((cat) => cat.toLowerCase().includes(filter))
    : categories.value;
});

const activeListings = computed(() => totalActiveListings.value || 0);

function categoryIcon(categoryName) {
  const name = (categoryName || "").toLowerCase();
  if (name.includes("construction") || name.includes("equipment")) return "🚧";
  if (name.includes("irrigation") || name.includes("water")) return "💧";
  if (name.includes("real") || name.includes("estate") || name.includes("property")) return "🏠";
  if (name.includes("medical") || name.includes("health")) return "🏥";
  return "🏢";
}

function focusSearch() {
  nextTick(() => searchInput.value?.focus());
}

function scrollToFeatured() {
  if (featuredAnchor.value) {
    featuredAnchor.value.scrollIntoView({ behavior: "smooth", block: "start" });
  }
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

  const counts = await Promise.all(
    cats.map(async (cat) => {
      try {
        const res = await getPropertiesByCategory(cat);
        const img = res.properties?.[0]?.imageUrls?.[0] || defaultImage;
        categoryImages.value[cat] = img;
        return res.properties?.length || 0;
      } catch (e) {
        categoryImages.value[cat] = defaultImage;
        return 0;
      }
    })
  );

  totalActiveListings.value = counts.reduce((sum, count) => sum + count, 0);
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
    allProperties.value = [...properties.value];
  } catch (err) {
    error.value = err.response?.data?.message || t("failedToLoadProperties");
  } finally {
    loading.value = false;
  }
}

/* =====================================================
   SEARCH / FILTER PROPERTIES
===================================================== */
function applySearch() {
  const name = searchForm.value.name?.trim().toLowerCase();
  const location = searchForm.value.location?.trim().toLowerCase();
  const rentalPrice = searchForm.value.rentalPricePerMonth;

  properties.value = allProperties.value.filter((property) => {
    if (name && !property.name?.toLowerCase().includes(name)) {
      return false;
    }

    if (location && !property.location?.toLowerCase().includes(location)) {
      return false;
    }

    if (rentalPrice != null && rentalPrice !== "") {
      const price = Number(property.rentalPrice?.perMonth);
      if (isNaN(price) || price > rentalPrice) {
        return false;
      }
    }

    return true;
  });
}

function resetSearch() {
  searchForm.value = {
    name: "",
    rentalPricePerMonth: null,
    location: "",
  };

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
  padding: 32px 20px 72px;
  min-height: 100vh;
  max-width: 1180px;
  margin: 0 auto;
  color: #0f172a;
}

/* ================= BACK BUTTON ================= */
.back-container {
  margin-bottom: 18px;
}

.back-btn {
  background: #0b6a6e;
  color: white;
  padding: 10px 18px;
  border-radius: 999px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
  box-shadow: 0 10px 24px rgba(11, 106, 110, 0.22);
}

.back-btn:hover {
  background: #07525a;
}

/* ================= CATEGORY HERO ================= */
.category-section {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.category-hero {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 32px;
  align-items: center;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hero-label {
  margin: 0;
  color: #0b6a6e;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.hero-title {
  font-size: 38px;
  line-height: 1.1;
  margin: 0;
  color: #0f172a;
}

.hero-subtitle {
  font-size: 15px;
  color: #475569;
  line-height: 1.8;
  margin: 0;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-btn {
  padding: 10px 18px;
  border-radius: 999px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: #0b6a6e;
  color: #ffffff;
  box-shadow: 0 12px 26px rgba(11, 106, 110, 0.25);
}

.btn-primary:hover {
  background: #07525a;
}

.btn-ghost {
  background: #ffffff;
  color: #0f172a;
  border: 1px solid #e2e8f0;
}

.btn-ghost:hover {
  border-color: rgba(11, 106, 110, 0.3);
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  padding-top: 8px;
}

.stat {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 4px;
}


/* ================= SEARCH ================= */
.hero-search {
  display: flex;
  justify-content: flex-start;
}

.search-hero-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #94a3b8;
}

.search-hero-input {
  width: 100%;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 16px 18px 16px 48px;
  font-size: 15px;
  color: #0f172a;
  background: #ffffff;
  outline: none;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
}

.search-hero-input:focus {
  border-color: rgba(11, 106, 110, 0.6);
  box-shadow: 0 0 0 3px rgba(11, 106, 110, 0.12);
}

/* ================= SECTION HEAD ================= */
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.section-label {
  margin: 0 0 6px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #64748b;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.section-note {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  max-width: 320px;
  text-align: right;
}

/* ================= CATEGORY GRID ================= */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 22px;
}

.category-box {
  background: #ffffff;
  border-radius: 18px;
  padding: 22px;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 20px 36px rgba(15, 23, 42, 0.08);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.category-box:hover {
  transform: translateY(-4px);
  box-shadow: 0 30px 40px rgba(15, 23, 42, 0.14);
}

.category-icon {
  width: 96px;
  height: 86px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: #f1f5f9;
  overflow: hidden;
}

.category-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-emoji {
  font-size: 40px;
}

.category-box h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #0f172a;
}

.category-meta {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #0b6a6e;
}

/* ================= SELECTED CATEGORY TITLE ================= */
.selected-category-title {
  text-align: center;
  margin: 8px auto 18px;
  font-size: 16px;
  font-weight: 700;
  color: #0b6a6e;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

/* ================= PROPERTY GRID ================= */
.property-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 320px));
  gap: 24px;
  margin-top: 20px;
  align-items: stretch;
  justify-content: center;
}

.property-card {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 20px 36px rgba(15, 23, 42, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  width: 100%;
  max-width: 320px;
}

.property-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 26px 44px rgba(15, 23, 42, 0.15);
}

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
  transform: scale(1.04);
}

.property-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
}

.property-category {
  background: rgba(255, 255, 255, 0.92);
  color: #0b6a6e;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
}

.property-content {
  padding: 20px;
}

.property-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.property-description {
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

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
  font-size: 13px;
  color: #475569;
}

.detail-item span {
  overflow-wrap: anywhere;
}

.detail-item::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #0b6a6e;
  display: inline-block;
}

.property-pricing {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.price-item {
  flex: 1;
  min-width: 140px;
  text-align: left;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.price-label {
  display: block;
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}

.price-value {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #0b6a6e;
}

.property-actions {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-secondary {
  background: white;
  color: #0f172a;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  border-color: rgba(11, 106, 110, 0.3);
}

/* ================= EXPANDED DETAILS ================= */
.property-expanded {
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.expanded-section {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.expanded-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #0b6a6e;
  margin: 0 0 12px 0;
}

.merchant-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #0f172a;
  font-size: 13px;
}

.info-value {
  color: #64748b;
  font-size: 13px;
  overflow-wrap: anywhere;
  text-align: right;
}

.rental-prices {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.price-type {
  font-weight: 600;
  color: #0f172a;
  font-size: 13px;
}

.price-amount {
  font-weight: 700;
  color: #0b6a6e;
  font-size: 13px;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.booking-item {
  padding: 12px;
  background: white;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.booking-dates {
  font-weight: 600;
  color: #0b6a6e;
  font-size: 13px;
  margin-bottom: 4px;
}

.booking-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 12px;
  color: #64748b;
}

.booking-status {
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
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

/* ================= SEARCH BAR ================= */
.search-bar {
  background: #ffffff;
  padding: 16px 18px;
  margin: 24px auto;
  border-radius: 18px;
  max-width: 980px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 18px 30px rgba(15, 23, 42, 0.08);
}

.search-bar h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.search-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.search-fields input {
  flex: 1;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 13px;
}

.search-fields button {
  background: #0b6a6e;
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s ease;
}

.search-fields button:hover {
  background: #07525a;
}

.search-fields button:last-child {
  background: #0f172a;
}

.search-fields button:last-child:hover {
  background: #111827;
}

/* ================= LOGIN PROMPT ================= */
.login-prompt-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
}

.message-box {
  background: white;
  padding: 28px;
  border-radius: 16px;
  text-align: center;
  position: relative;
  width: 90%;
  max-width: 360px;
  box-shadow: 0 30px 50px rgba(15, 23, 42, 0.25);
}

.redirect-btn {
  background: #0b6a6e;
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 999px;
  margin-top: 10px;
  cursor: pointer;
}

.redirect-btn:hover {
  background: #07525a;
}

.close-btn {
  position: absolute;
  right: 15px;
  top: 10px;
  cursor: pointer;
  font-size: 20px;
}

.sr-only {
  position: absolute !important;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap;
}

/* ================= MOBILE ================= */
@media (max-width: 980px) {
  .category-hero {
    grid-template-columns: 1fr;
  }

  .section-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-note {
    text-align: left;
  }
}

@media (max-width: 720px) {
  .properties-page {
    padding: 24px 14px 64px;
  }

  .hero-title {
    font-size: 28px;
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }

  .search-hero-input {
    padding-left: 42px;
  }

  .property-grid {
    grid-template-columns: 1fr;
  }

  .property-card {
    max-width: none;
  }

  .property-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .property-pricing {
    flex-direction: column;
  }

  .price-item {
    min-width: 0;
    width: 100%;
  }

  .info-row,
  .price-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-value {
    text-align: left;
  }
}

@media (max-width: 520px) {
  .search-fields {
    flex-direction: column;
  }

  .search-fields input,
  .search-fields button {
    width: 100%;
  }

  .property-image-container {
    height: 200px;
  }
}
</style>
