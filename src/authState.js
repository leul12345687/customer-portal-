import { ref, computed, watch } from "vue";

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
export const user = ref(JSON.parse(localStorage.getItem("user") || "null"));

let logoutTimer = null;

// --------------------------
// Computed values
// --------------------------
export const isAuthenticated = computed(() => {
  if (!authToken.value) return false;

  const decoded = decodeToken(authToken.value);
  if (!decoded?.exp) return false;

  const now = Date.now();
  return decoded.exp * 1000 > now;
});

export const userName = computed(() => user.value?.name || "Guest");

// --------------------------
// Auto logout handling
// --------------------------
function scheduleAutoLogout(token) {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return;

  const expiresInMs = decoded.exp * 1000 - Date.now();

  // Clear previous timer
  if (logoutTimer) clearTimeout(logoutTimer);

  if (expiresInMs > 0) {
    logoutTimer = setTimeout(() => {
      logout();
    }, expiresInMs);
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
// Sync auth state on page load (supports deployed SPA)
// --------------------------
function syncAuthState() {
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("user") || "null");

  authToken.value = token;
  user.value = userData;

  if (token) scheduleAutoLogout(token);
}

// Initial sync on app start
syncAuthState();

// --------------------------
// Listen to localStorage changes across tabs/windows
// --------------------------
window.addEventListener("storage", (event) => {
  if (event.key === "token") {
    authToken.value = event.newValue;
  }
  if (event.key === "user") {
    user.value = JSON.parse(event.newValue || "null");
  }
});
