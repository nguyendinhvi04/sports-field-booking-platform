import { createRouter, createWebHistory } from "vue-router";

const routes = [
  // Page Client
  {
    path: "/",
    name: "home",
    component: () => import("../views/client/HomeView.vue"),
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

  // Page Admin
  {
    path: "/admin",
    name: "admin-home",
    component: () => import("../views/admin/HomeView.vue"),
    meta: { layout: "admin" },
  },

  // Page Owner
  {
    path: "/owner",
    name: "owner-home",
    component: () => import("../views/owner/HomeView.vue"),
    meta: { layout: "owner" },
  },
  {
    path: "/dashboard/owner",
    name: "owner-dashboard",
    component: () => import("../views/owner/DashboardView.vue"),
    meta: { layout: "owner" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
