<template>
    <div class="header-wrapper">
        <TopAdmin></TopAdmin>
        <MenuAdmin></MenuAdmin>
    </div>
    <div id="content" class="main-content">
        <div class="layout-px-spacing">
            <router-view></router-view>
            
        </div>
    </div>
    <BotAdmin></BotAdmin>
</template>
<script>
import MenuAdmin from '../components/MenuAdmin.vue';
import TopAdmin from '../components/TopAdmin.vue';
import BotAdmin from '../components/BotAdmin.vue';

import '../../assets/assets/js/libs/jquery-3.1.1.min.js';
// import '../../assets/assets/js/loader.js';
// import '../../assets/bootstrap/js/popper.min.js';
import '../../assets/bootstrap/js/bootstrap.min.js';
// import '../../assets/plugins/perfect-scrollbar/perfect-scrollbar.min.js';
import '../../assets/assets/js/app.js';
import '../../assets/assets/js/custom.js';
import '../../assets/plugins/apex/apexcharts.min.js';
import '../../assets/assets/js/dashboard/dash_1.js';
export default {
    name: 'app',
    components: {
        MenuAdmin,
        TopAdmin,
        BotAdmin,
    },
}
</script>
<style>
@import '../../assets/assets/css/loader.css';
@import '../../assets/bootstrap/css/bootstrap.min.css';
@import '../../assets/assets/css/plugins.css';
@import '../../assets/plugins/apex/apexcharts.css';
@import '../../assets/assets/css/dashboard/dash_1.css';
@import url('https://fonts.googleapis.com/css?family=Quicksand:400,500,600,700&display=swap');
/* @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"); */
</style>