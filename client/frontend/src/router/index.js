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
  {
    path: "/about",
    name: "about",
    component: () => import("../views/client/AboutView.vue"),
  },

  // Auth Group
  {
    path: "/auth/login",
    name: "login",
    component: () => import("../views/auth/LoginView.vue"),
    meta: { layout: "nocore" },
  },
  {
    path: "/auth/register",
    name: "register",
    component: () => import("../views/auth/RegisterView.vue"),
    meta: { layout: "nocore" },
  },
  {
    path: "/auth/forgot-password",
    name: "forgot-password",
    component: () => import("../views/auth/ForgotPasswordView.vue"),
    meta: { layout: "nocore" },
  },
  {
    path: "/auth/reset-password",
    name: "reset-password",
    component: () => import("../views/auth/ResetPasswordView.vue"),
    meta: { layout: "nocore" },
  },

  // Page Admin
  {
    path: "/admin",
    name: "admin-home",
    component: () => import("../views/admin/HomeView.vue"),
    meta: { layout: "admin", requiresAuth: true, roles: ["OWNER", "ADMIN"] },
  },

  // Page Owner
  {
    path: "/owner",
    name: "owner-home",
    component: () => import("../views/owner/HomeView.vue"),
    meta: { layout: "owner", requiresAuth: true, roles: ["OWNER", "ADMIN"] },
  },
  {
    path: "/dashboard/owner",
    name: "owner-dashboard",
    component: () => import("../views/owner/DashboardView.vue"),
    meta: { layout: "owner", requiresAuth: true, roles: ["OWNER", "ADMIN"] },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Middleware - Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  let user = null;
  
  if (token) {
    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      user = null;
    }
  }

  // 1. Nếu đã đăng nhập mà cố tình vào trang auth (login, register...)
  if (token && (to.name === "login" || to.name === "register" || to.name === "forgot-password")) {
    if (user && user.role === 'OWNER') {
      return next({ path: "/admin" });
    }
    return next({ name: "home" });
  }

  // 2. Chặn nếu vào route cần đăng nhập (requiresAuth) mà chưa có token
  if (to.meta.requiresAuth && !token) {
    return next({ name: "login", query: { redirect: to.fullPath } });
  }

  // 3. Phân quyền Role-based Access Control (RBAC) nếu route có yêu cầu roles cụ thể
  if (to.meta.requiresAuth && token && user && to.meta.roles) {
    const isRoleValid = to.meta.roles.includes(user.role);
    if (!isRoleValid) {
      alert("Bạn không có quyền truy cập trang này!");
      // Nếu là OWNER đang nhập nhầm thì trả về admin, còn USER trả về home
      if (user.role === 'OWNER') {
        return next({ path: "/admin" });
      }
      return next({ name: "home" });
    }
  }

  // 4. Cho phép tiếp tục đi tới Route yêu cầu
  next();
});

export default router;
