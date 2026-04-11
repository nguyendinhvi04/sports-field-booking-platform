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
  path: "/checkout",
  name: "checkout",
  component: () => import("../views/client/CheckoutView.vue"),
  meta: { requiresAuth: true },
  },
    {
  path: "/order",
  name: "order",
  component: () => import("../views/client/OrderManagement.vue"),
  meta: { requiresAuth: true },
  },
   {
  path: "/friend",
  name: "friend",
  component: () => import("../views/client/FindFriend.vue"),
  meta: { requiresAuth: true },
  },
  {
  path: "/blog",
  name: "blog",
  component: () => import("../views/client/BlogView.vue"),
  meta: { requiresAuth: true },
  },
  {
    path: "/about",
    name: "about",
    component: () => import("../views/client/AboutView.vue"),
  },
  {
    path: "/map",
    name: "map",
    component: () => import("../views/client/MapView.vue"),
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
    name: "admin",
    component: () => import("../views/admin/dashboard/DashboardView.vue"),
    meta: { layout: "admin", requiresAuth: true, roles: ["ADMIN"] },
  },
  {
    path: "/admin/courts/:tab?",
    name: "admin-courts",
    component: () => import("../views/admin/views/CourtsAllView.vue"),
    meta: { layout: "admin", requiresAuth: true, roles: ["ADMIN"] },
  },
  {
    path: "/admin/owners",
    name: "admin-owners",
    component: () => import("../views/admin/views/ClubOwnersView.vue"),
    meta: { layout: "admin", requiresAuth: true, roles: ["ADMIN"] },
  },
  {
    path: "/admin/owners/kyc",
    name: "admin-owners-kyc",
    component: () => import("../views/admin/views/OwnersKycView.vue"),
    meta: { layout: "admin", requiresAuth: true, roles: ["ADMIN"] },
  },
  {
    path: "/admin/users",
    name: "admin-users",
    component: () => import("../views/admin/views/UsersManagementView.vue"),
    meta: { layout: "admin", requiresAuth: true, roles: ["ADMIN"] },
  },
  {
    path: "/admin/stats",
    name: "admin-stats",
    component: () => import("../views/admin/views/SystemStatsView.vue"),
    meta: { layout: "admin", requiresAuth: true, roles: ["ADMIN"] },
  },
  {
    path: "/admin/reports",
    name: "admin-reports",
    component: () => import("../views/admin/views/ReportsManagementView.vue"),
    meta: { layout: "admin", requiresAuth: true, roles: ["ADMIN"] },
  },
  {
    path: "/admin/permissions",
    name: "admin-permissions",
    component: () => import("../views/admin/views/PermissionsManagementView.vue"),
    meta: { layout: "admin", requiresAuth: true, roles: ["ADMIN"] },
  },
  // Placeholders for other admin routes to avoid 404s when navigating the sidebar
  {
    path: "/admin/:catchAll(.*)",
    name: "admin-placeholder",
    component: () => import("../views/admin/views/ClubOwnersView.vue"),
    meta: { layout: "admin", requiresAuth: true, roles: ["ADMIN"] },
  },

  // Page Owner
  {
    path: "/owner",
    name: "owner-home",
    component: () => import("../views/owner/HomeView.vue"),
    meta: { layout: "owner", requiresAuth: true, roles: ["OWNER"] },
  },
  {
    path: "/dashboard/owner",
    name: "owner-dashboard",
    component: () => import("../views/owner/DashboardView.vue"),
    meta: { layout: "owner", requiresAuth: true, roles: ["OWNER"] },
  },
  {
    path: "/owner/clubs",
    name: "owner-clubs",
    component: () => import("../views/owner/ClubsView.vue"),
    meta: { layout: "owner", requiresAuth: true, roles: ["OWNER"] },
  },
  {
    path: "/owner/courts",
    name: "owner-courts",
    component: () => import("../views/owner/CourtsView.vue"),
    meta: { layout: "owner", requiresAuth: true, roles: ["OWNER"] },
  },
  {
    path: "/owner/pricing",
    name: "owner-pricing",
    component: () => import("../views/owner/PricingView.vue"),
    meta: { layout: "owner", requiresAuth: true, roles: ["OWNER"] },
  },
  {
    path: "/owner/bookings",
    name: "owner-bookings",
    component: () => import("../views/owner/BookingsView.vue"),
    meta: { layout: "owner", requiresAuth: true, roles: ["OWNER"] },
  },
  {
    path: "/owner/finance",
    name: "owner-finance",
    component: () => import("../views/owner/FinanceView.vue"),
    meta: { layout: "owner", requiresAuth: true, roles: ["OWNER"] },
  },
  {
    path: "/owner/customers",
    name: "owner-customers",
    component: () => import("../views/owner/CustomersView.vue"),
    meta: { layout: "owner", requiresAuth: true, roles: ["OWNER"] },
  },
  {
    path: "/owner/reviews",
    name: "owner-reviews",
    component: () => import("../views/owner/ReviewsView.vue"),
    meta: { layout: "owner", requiresAuth: true, roles: ["OWNER"] },
  },
  {
    path: "/owner/vouchers",
    name: "owner-vouchers",
    component: () => import("../views/owner/VouchersView.vue"),
    meta: { layout: "owner", requiresAuth: true, roles: ["OWNER"] },
  },
  {
    path: "/owner/onboarding",
    name: "owner-onboarding",
    component: () => import("../views/owner/OwnerOnboardingView.vue"),
    meta: { layout: "nocore", requiresAuth: true, roles: ["OWNER"] }, // Dùng nocore để tập trung vào form, không hiện sidebar
  },
  {
    path: "/owner/settings",
    name: "owner-settings",
    component: () => import("../views/owner/SettingsView.vue"),
    meta: { layout: "owner", requiresAuth: true, roles: ["OWNER"] },
  },
  // Redirect missing routes to Home to avoid console warnings
  { path: "/contact", redirect: "/" },
  { path: "/features", redirect: "/" },
  { path: "/promotions", redirect: "/" },
  { path: "/play", redirect: "/" },
  { path: "/sports", redirect: "/" },
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
      return next({ path: "/owner" });
    }
    if (user && user.role === 'ADMIN') {
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
    const userRole = user.role ? user.role.toUpperCase() : null;
    const allowedRoles = to.meta.roles.map(r => r.toUpperCase());
    const isRoleValid = allowedRoles.includes(userRole);

    if (!isRoleValid) {
      if (userRole === 'OWNER') return next({ path: "/owner" });
      if (userRole === 'ADMIN') return next({ path: "/admin" });
      return next({ name: "home" });
    }
  }

  // 4. Cho phép tiếp tục đi tới Route yêu cầu
  next();
});

export default router;
