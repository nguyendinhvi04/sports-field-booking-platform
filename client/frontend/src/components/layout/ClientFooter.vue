<template>
  <footer class="bg-dark pt-5 pb-3 w-100">
    <div class="container">
      <div class="row">

        <!-- Giới thiệu -->
        <div class="col-md-4 text-white">
          <h5 class="text-white">Sports Field Booking</h5>
          <p class="text-white">
            Hệ thống đặt sân thể thao trực tuyến giúp bạn
            đặt sân bóng đá, cầu lông, tennis nhanh chóng và tiện lợi.
          </p>
        </div>

        <!-- Menu -->
        <div class="col-md-4 ">
          <h5 class="text-white">Menu</h5>
          <ul class="list-unstyled">
            <li><router-link to="/" class="text-white text-decoration-none">Trang chủ</router-link></li>
            <li><router-link to="/about" class="text-white text-decoration-none">Giới thiệu</router-link></li>
            <li><router-link to="/booking" class="text-white text-decoration-none">Đặt sân</router-link></li>
            <li><router-link to="/contact" class="text-white text-decoration-none">Tìm bạn/Bản đồ</router-link></li>
          </ul>
        </div>

        <!-- Liên hệ -->
        <div class="col-md-4 text-white">
          <h5 class="text-white">Liên hệ</h5>
          <p class="text-white">Email: support@sportsbooking.com</p>
          <p class="text-white">Phone: 0123 456 789</p>
          <p class="text-white">Đà Nẵng, Việt Nam</p>
        </div>

      </div>

      <hr class="bg-light">

      <div class="text-center">
        © 2026 Sports Field Booking Platform
      </div>
    </div>
  </footer>
</template>

<script>
export default {

}
</script>