import { ref, computed, watch } from "vue";

function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export const authToken = ref(localStorage.getItem("token"));
export const user = ref(JSON.parse(localStorage.getItem("user") || "null"));

let logoutTimer = null;

/* ===============================
   AUTH STATE
================================ */
export const isAuthenticated = computed(() => {
  if (!authToken.value) return false;

  const decoded = decodeToken(authToken.value);
  if (!decoded?.exp) return false;

  const now = Math.floor(Date.now() / 1000);
  return decoded.exp > now;
});

export const userName = computed(() => user.value?.name || "User");

/* ===============================
   AUTO LOGOUT HANDLER
================================ */
function scheduleAutoLogout(token) {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return;

  const expiresInMs = decoded.exp * 1000 - Date.now();

  // Clear old timer
  if (logoutTimer) clearTimeout(logoutTimer);

  if (expiresInMs > 0) {
    logoutTimer = setTimeout(() => {
      logout();
    }, expiresInMs);
  } else {
    logout();
  }
}

/* ===============================
   ACTIONS
================================ */
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

/* ===============================
   SYNC ON APP LOAD
================================ */
watch(authToken, (token) => {
  if (token) {
    scheduleAutoLogout(token);
  }
});
