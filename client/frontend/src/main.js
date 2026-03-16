import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import AuthLayout from './layouts/AuthLayout.vue'
import ClientLayout from './layouts/ClientLayout.vue'
import AdminLayout from './layouts/AdminLayout.vue'

const app = createApp(App)
app.use(router)
app.component("default-layout", ClientLayout);
app.component("admin-layout", AdminLayout);
app.component("nocore-layout", AuthLayout);
app.mount("#app")
