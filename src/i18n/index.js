import { createI18n } from "vue-i18n";
import en from "./en.json";
import am from "./am.json";
import om from "./om.json";
import api from "../services/api.js"; // axios instance

const messages = { en, am, om };

// Load saved language or default to English
const savedLang = localStorage.getItem("lang") || "en";

const i18n = createI18n({
  legacy: false,
  locale: savedLang,
  fallbackLocale: "en",
  messages,
});

// Sync axios Accept-Language header with current locale
api.defaults.headers.common["Accept-Language"] = savedLang;

// Helper to change language dynamically
export function setLanguage(lang) {
  i18n.global.locale.value = lang;
  localStorage.setItem("lang", lang);
  api.defaults.headers.common["Accept-Language"] = lang;
}

export default i18n;
