import { createRouter, createWebHistory } from "vue-router";

const routes = [
  // Page Client
  {
    path: "/",
    name: "home",
    component: () => import("../views/client/HomeView.vue"),
  },
  {
    path: "/booking",
    name: "booking",
    component: () => import("../views/client/BookingView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/venue/:id",
    name: "venue-detail",
    component: () => import("../views/client/VenueDetailView.vue"),
    meta: { requiresAuth: true },
  },

  // Auth Group
  {
    path: "/client/login",
    name: "login",
    component: () => import("../views/auth/LoginView.vue"),
    meta: { layout: "nocore" },
  },
  {
    path: "/client/register",
    name: "register",
    component: () => import("../views/auth/RegisterView.vue"),
    meta: { layout: "nocore" },
  },
  {
    path: "/client/forgot-password",
    name: "forgot-password",
    component: () => import("../views/auth/ForgotPasswordView.vue"),
    meta: { layout: "nocore" },
  },
  {
    path: "/client/reset-password",
    name: "reset-password",
    component: () => import("../views/auth/ResetPasswordView.vue"),
    meta: { layout: "nocore" },
  },

  // Page Admin
  {
    path: "/admin",
    name: "admin-home",
    component: () => import("../views/admin/HomeView.vue"),
    meta: { layout: "admin", requiresAuth: true },
  },

  // Page Owner
  {
    path: "/owner",
    name: "owner-home",
    component: () => import("../views/owner/HomeView.vue"),
    meta: { layout: "owner", requiresAuth: true },
  },
  {
    path: "/dashboard/owner",
    name: "owner-dashboard",
    component: () => import("../views/owner/DashboardView.vue"),
    meta: { layout: "owner", requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  
  // Nếu đã đăng nhập mà cố vào trang login/register thì đẩy về trang chủ
  if (token && (to.name === "login" || to.name === "register")) {
    next({ name: "home" });
  } 
  // Nếu trang yêu cầu auth mà chưa có token thì đẩy về login
  else if (to.meta.requiresAuth && !token) {
    next({ name: "login" });
  } 
  else {
    next();
  }
});

export default router;
