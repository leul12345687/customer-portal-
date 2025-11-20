import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";
import i18n from "./i18n/index.js"; // ✅ your localization setup
import { createPinia } from "pinia";
import api from "./services/api.js"; // ✅ import axios instance so interceptors run

const app = createApp(App);
app.use(router);
app.use(createPinia());
app.use(i18n);

// Optional: Log current language
console.log("Current language:", i18n.global.locale.value);

// Mount the app
app.mount("#app");
