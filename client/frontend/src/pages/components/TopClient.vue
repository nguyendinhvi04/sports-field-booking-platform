<template>
  <header>
    <nav
      class="navbar navbar-expand-lg navbar-dark py-0"
      style="background-color: #000957"
    >
      <a class="navbar-brand fs-4 fw-bold" href="#"
        ><span class="text-warning ms-3">SPORTS</span>Bookings</a
      >
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent1"
        aria-controls="navbarSupportedContent1"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent1">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0"></ul>
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <router-link to="/">
            <li class="nav-item">
              <a class="nav-link text-light fs-6" aria-current="page" href="#"
                >Trang Chủ</a
              >
            </li>
          </router-link>
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle text-light fs-6"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Sân đặt
            </a>
            <ul class="dropdown-menu">
              <router-link to="/san/dang-hoat-dong">
                <li>
                  <a class="dropdown-item" href="/san/dang-hoat-dong"
                    >Sân Đang Hoạt Động</a
                  >
                </li>
              </router-link>
              <router-link to="/san/sap-mo">
                <a class="dropdown-item" href="/san/sap-mo">Sân Sắp Mở</a>
              </router-link>
              <li></li>
            </ul>
          </li>
          <router-link to="/bai-viet">
            <li class="nav-item">
              <a class="nav-link text-light fs-6" href="/bai-viet">Bài Viết</a>
            </li>
          </router-link>
          <router-link to="/about">
            <li class="nav-item">
              <a class="nav-link text-light fs-6" href="/about">Về chúng tôi</a>
            </li>
          </router-link>
        </ul>
        <div class="dropdown my-3 me-5">
  <a
    class="d-flex align-items-center nav-link dropdown-toggle"
    href="#"
    role="button"
    data-bs-toggle="dropdown"
  >
    <img
      src="https://cdn-icons-png.flaticon.com/512/9187/9187604.png"
      class="user-img"
    />
  </a>

  <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0">

    <li>
      <router-link class="dropdown-item d-flex align-items-center" to="/client/register">
        <i class="bx bx-user me-2"></i> Đăng ký
      </router-link>
    </li>

    <li>
      <router-link class="dropdown-item d-flex align-items-center" to="/client/login">
        <i class="bx bx-log-in-circle me-2"></i> Đăng nhập
      </router-link>
    </li>

  </ul>
</div>
        <!-- <div class="dropdown my-3 me-5">
          <a
            class="d-flex align-items-center nav-link dropdown-toggle dropdown-toggle-nocaret"
            href="#"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/9187/9187604.png"
              class="user-img"
              style="height: 35px; object-fit: cover"
            />
          </a>
          <ul class="dropdown-menu">
            <router-link to="/client/dang-ky">
              <li>
                <a class="dropdown-item "
                  ><span><i class="bx bx-user me-1"  href="/client/dang-ky"></i> Đăng Ký</span></a
                >
              </li>
            </router-link>
            <router-link to="/client/dang-nhap">
              <li>
                <a class="dropdown-item"
                  ><i class="bx bx-log-in-circle " href="/client/dang-nhap"></i> <span>Đăng Nhập</span></a
                >
              </li>
            </router-link>
          </ul>
        </div> -->
      </div>
    </nav>
  </header>
</template>

<script>
export default {};
</script>

<style scoped>
header {
  width: 100vw !important;
  margin: 0 !important;
  padding: 0 !important;
}
.navbar {
  width: 100vw !important;
  margin: 0 !important;
  padding: 0 !important;
}
.navbar-brand {
  padding-left: 1rem !important;
}
.navbar-toggler {
  padding-right: 1rem !important;
}
</style>
