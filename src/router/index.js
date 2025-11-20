// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

// Import pages
import LoginPage from "../pages/LoginPage.vue";
import RegisterPage from "../pages/RegisterPage.vue";
import BookingPage from "../pages/BookingPage.vue";
import DashboardPage from "../pages/DashboardPage.vue";
import CustomerProfile from "../pages/CustomerProfile.vue";
import MyBookingsPage from "../pages/CustomerBookings.vue";
import AllBookingsPage from "../pages/AllBookings.vue";
import PropertyPage from "../pages/CustomerProperties.vue";
import DashboardLayout from "../layout/DashboardLayout.vue";

const routes = [
  // 🏠 Public home page (Property list)
  { path: "/", name: "Home", component: PropertyPage },

  // 🔐 Auth routes
  { path: "/login", name: "Login", component: LoginPage },
  { path: "/register", name: "Register", component: RegisterPage },

  // 👤 Protected customer portal
  {
    path: "/app",
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "dashboard", name: "Dashboard", component: DashboardPage },
      { path: "booking", name: "Booking", component: BookingPage },
      { path: "property", name: "Property", component: PropertyPage },
      { path: "profile", name: "Profile", component: CustomerProfile },
      { path: "my-bookings", name: "MyBookings", component: MyBookingsPage },
      { path: "all-bookings", name: "AllBookings", component: AllBookingsPage },
    ],
  },

  // 🧭 Catch all unknown paths
  { path: "/:catchAll(.*)", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 🔒 Route guard for authentication
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  if (to.meta.requiresAuth && !token) next("/login");
  else if ((to.path === "/login" || to.path === "/register") && token)
    next("/app/dashboard");
  else next();
});

export default router;
