
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Nocore from './pages/wrapper/Nocore.vue'
import Default from './pages/wrapper/Clientcore.vue'
import Admin from './pages/wrapper/Admincore.vue'
const app = createApp(App)
app.use(router)
app.component("default-layout", Default);
app.component("admin-layout", Admin);
app.component("nocore-layout", Nocore);
app.mount("#app")
