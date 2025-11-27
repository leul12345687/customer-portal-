// src/router/index.js
import { createRouter, createWebHashHistory } from "vue-router";

// Pages
import LoginPage from "../pages/LoginPage.vue";
import RegisterPage from "../pages/RegisterPage.vue";
import BookingPage from "../pages/BookingPage.vue";
import DashboardPage from "../pages/DashboardPage.vue";
import CustomerProfile from "../pages/CustomerProfile.vue";
import MyBookingsPage from "../pages/CustomerBookings.vue";
import AllBookingsPage from "../pages/AllBookings.vue";
import PropertyPage from "../pages/CustomerProperties.vue";
import DashboardLayout from "../layout/DashboardLayout.vue";

// ------------------------------------
// Routes
// ------------------------------------
const routes = [
  // 🌍 Public home
  {
    path: "/",
    name: "Home",
    component: PropertyPage,
  },

  // 🔐 Auth
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterPage,
  },

  // 🔒 Protected app
  {
    path: "/app",
    component: DashboardLayout,
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: DashboardPage,
        meta: { requiresAuth: true },
      },
      {
        path: "booking",
        name: "Booking",
        component: BookingPage,
        meta: { requiresAuth: true },
      },
      {
        path: "property",
        name: "Property",
        component: PropertyPage,
        meta: { requiresAuth: true },
      },
      {
        path: "profile",
        name: "Profile",
        component: CustomerProfile,
        meta: { requiresAuth: true },
      },
      {
        path: "my-bookings",
        name: "MyBookings",
        component: MyBookingsPage,
        meta: { requiresAuth: true },
      },
      {
        path: "all-bookings",
        name: "AllBookings",
        component: AllBookingsPage,
        meta: { requiresAuth: true },
      },
    ],
  },

  // 🧭 Catch-all
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

// ------------------------------------
// Router instance
// ------------------------------------
const router = createRouter({
  // ✅ HASH history = 100% safe on Render & all networks
  history: createWebHashHistory(),
  routes,
});

// ------------------------------------
// Auth Guard (SIMPLIFIED & SAFE)
// ------------------------------------
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  // Protect private routes
  if (to.meta.requiresAuth && !token) {
    return next("/login");
  }

  // Do NOT auto-redirect from /login here
  // (Login page controls navigation)
  next();
});

export default router;
