import { createRouter, createWebHistory } from "vue-router";

const routes = [
  // Route cho trang client
  {
    path: "/",
    component: () => import("../components/Client/Home/index.vue"),
  },
  {
    path: "/client/login",
    component: () => import("../components/Client/Login/index.vue"),
    meta: { layout: "nocore" },
  },
  {
    path: "/client/register",
    component: () => import("../components/Client/Register/index.vue"),
    meta: { layout: "nocore" },
  },
   {
    path: "/client/forgot-password",
    component: () => import("../components/Client/Forgot-Password/index.vue"),
    meta: { layout: "nocore" },
  },
  // Route cho trang admin
  {
    path: "/admin",
    component: () => import("../components/Admin/Home/index.vue"),
    meta: { layout: "admin" },
  },
  // Thêm các route khác
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
