import { ref, computed } from "vue";

// --------------------------
// Safe JSON parse
// --------------------------
function safeJSONParse(value) {
  try {
    if (!value || value === "undefined") return null;
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// --------------------------
// Decode JWT safely
// --------------------------
function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

// --------------------------
// Reactive state
// --------------------------
export const authToken = ref(localStorage.getItem("token"));
export const user = ref(safeJSONParse(localStorage.getItem("user")));

let logoutTimer = null;

// --------------------------
// Computed values
// --------------------------
export const isAuthenticated = computed(() => {
  if (!authToken.value) return false;

  const decoded = decodeToken(authToken.value);
  if (!decoded?.exp) return false;

  return decoded.exp * 1000 > Date.now();
});

export const userName = computed(() => user.value?.name || "Guest");

// --------------------------
// Auto logout handling
// --------------------------
function scheduleAutoLogout(token) {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return;

  const expiresInMs = decoded.exp * 1000 - Date.now();

  if (logoutTimer) clearTimeout(logoutTimer);

  if (expiresInMs > 0) {
    logoutTimer = setTimeout(logout, expiresInMs);
  } else {
    logout();
  }
}

// --------------------------
// Login / Logout actions
// --------------------------
export function login(token, userData) {
  authToken.value = token;
  user.value = userData;

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(userData));

  scheduleAutoLogout(token);
}

export function logout() {
  authToken.value = null;
  user.value = null;

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  if (logoutTimer) {
    clearTimeout(logoutTimer);
    logoutTimer = null;
  }
}

// --------------------------
// Sync auth state on app load
// --------------------------
function syncAuthState() {
  const token = localStorage.getItem("token");
  const userData = safeJSONParse(localStorage.getItem("user"));

  authToken.value = token || null;
  user.value = userData;

  if (token) scheduleAutoLogout(token);
}

syncAuthState();

// --------------------------
// Cross-tab sync (SAFE)
// --------------------------
window.addEventListener("storage", (event) => {
  if (event.key === "token") {
    authToken.value = event.newValue || null;
  }

  if (event.key === "user") {
    user.value = safeJSONParse(event.newValue);
  }
});
