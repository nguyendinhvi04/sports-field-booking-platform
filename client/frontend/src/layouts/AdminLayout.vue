<template>
    <div class="header-wrapper">
        <AdminHeader></AdminHeader>
        <AdminSidebar></AdminSidebar>
    </div>
    <div id="content" class="main-content">
        <div class="layout-px-spacing">
            <router-view></router-view>
            
        </div>
    </div>
    <AdminFooter></AdminFooter>
</template>
<script>
import AdminHeader from '../components/layout/AdminHeader.vue';
import AdminFooter from '../components/layout/AdminFooter.vue';
import AdminSidebar from '../components/layout/AdminSidebar.vue';

import '../assets/assets/js/libs/jquery-3.1.1.min.js';
// import '../assets/assets/js/loader.js';
// import '../assets/bootstrap/js/popper.min.js';
import '../assets/bootstrap/js/bootstrap.min.js';
// import '../assets/plugins/perfect-scrollbar/perfect-scrollbar.min.js';
import '../assets/assets/js/app.js';
import '../assets/assets/js/custom.js';
import '../assets/plugins/apex/apexcharts.min.js';
import '../assets/assets/js/dashboard/dash_1.js';
export default {
    name: 'AdminLayout',
    components: {
        AdminHeader,
        AdminFooter,
        AdminSidebar,
    },
}
</script>
<style>
@import '../assets/assets/css/loader.css';
@import '../assets/bootstrap/css/bootstrap.min.css';
@import '../assets/assets/css/plugins.css';
@import '../assets/plugins/apex/apexcharts.css';
@import '../assets/assets/css/dashboard/dash_1.css';
/* @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"); */
</style>