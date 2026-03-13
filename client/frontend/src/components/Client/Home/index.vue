<template>
  <div>
    <!-- Hero Carousel -->
    <div id="carouselExampleCaptions" class="carousel slide">
      <div class="carousel-indicators">
        <button
          type="button"
          data-bs-target="#carouselExampleCaptions"
          data-bs-slide-to="0"
          class="active"
          aria-current="true"
          aria-label="Slide 1"
        ></button>
        <button
          type="button"
          data-bs-target="#carouselExampleCaptions"
          data-bs-slide-to="1"
          aria-label="Slide 2"
        ></button>
        <button
          type="button"
          data-bs-target="#carouselExampleCaptions"
          data-bs-slide-to="2"
          aria-label="Slide 3"
        ></button>
      </div>
      <div class="carousel-inner">
        <div class="carousel-item active">
          <img
            src="https://golfbooking.com.vn/images/slideshow/2026/02/13/original/z7531562292224_6d6a7e6283e06bcefe65f27652943f94_1770978712.webp"
            class="d-block w-100"
            alt="Sân bóng đá"
          />
        </div>
        <div class="carousel-item">
          <img
            src="https://golfbooking.com.vn/images/slideshow/2026/02/27/original/z7569511046253_0a3ea76709deb74d41ed2c087b572469_1772186728.webp"
            class="d-block w-100"
            alt="Sân tennis"
          />
          <!-- <div class="carousel-caption d-none d-md-block">
            <h5>Sân Tennis Chuyên Nghiệp</h5>
            <p>Trải nghiệm sân tennis với cơ sở vật chất hiện đại.</p>
            <a href="#" class="btn btn-warning">Khám Phá</a>
          </div> -->
        </div>
        <div class="carousel-item">
          <img
            src="https://golfbooking.com.vn/images/slideshow/2026/01/13/original/uu-dai-dac-quyen-intergolf-slice-web_1768300163.webp"
            class="d-block w-100"
            alt="Ưu đãi đặc biệt"
          />
          <!-- <div class="carousel-caption d-none d-md-block">
            <h5>Ưu Đãi Đặc Biệt</h5>
            <p>Giảm giá lên đến 30% cho lần đặt đầu tiên!</p>
            <a href="#" class="btn btn-warning">Nhận Ưu Đãi</a>
          </div> -->
        </div>
      </div>
      <button
        class="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExampleCaptions"
        data-bs-slide="prev"
      >
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button
        class="carousel-control-next"
        type="button"
        data-bs-target="#carouselExampleCaptions"
        data-bs-slide="next"
      >
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>

    <!-- Caption below carousel -->
    <div class="container mt-5">
      <div class="card shadow p-4 rounded-4">
        <!-- Tabs -->
        <ul class="nav nav-tabs mb-4">
          <li class="nav-item">
            <a class="nav-link">Sân bóng đá</a>
          </li>
          <li class="nav-item">
            <a class="nav-link">Sân bóng chuyền</a>
          </li>
          <li class="nav-item">
            <a class="nav-link">Sân golf</a>
          </li>
          <li class="nav-item">
            <a class="nav-link">Cầu lông</a>
          </li>
          <li class="nav-item">
            <a class="nav-link">Tennis</a>
          </li>
          <li class="nav-item">
            <a class="nav-link">Pickball</a>
          </li>
          <li class="nav-item">
            <a class="nav-link">Bóng rỗ</a>
          </li>
        </ul>

        <!-- Search -->
        <div class="row g-3">
          <!-- Địa điểm -->
          <div class="col-md-4">
            <input
              type="text"
              class="form-control form-control-lg"
              placeholder="Nhập tên sân hoặc khu vực"
            />
          </div>

          <!-- Ngày -->
          <div class="col-md-3">
            <input type="date" class="form-control form-control-lg" />
          </div>

          <!-- Giờ -->
          <div class="col-md-3">
            <input type="time" class="form-control form-control-lg" />
          </div>

          <!-- Button -->
          <div class="col-md-2 d-grid">
            <button class="btn btn-primary btn-lg">TÌM SÂN</button>
          </div>
        </div>
      </div>
    </div>

    <div class="container mt-4">
      <h4 class="mb-4 fw-bold">Sân gần bạn</h4>

      <div class="row">
        <template v-for="(value, index) in danhSachSan" :key="index">
          <div class="col-md-6 mb-4">
            <div class="card shadow-sm rounded-4 overflow-hidden">
              <!-- ảnh -->
              <div class="position-relative">
                <img
                  :src="value.hinh_anh"
                  class="w-100"
                  style="height: 180px; object-fit: cover"
                />

                <span
                  class="badge bg-success position-absolute top-0 start-0 m-2"
                >
                  Đơn ngày
                </span>
              </div>

              <!-- body -->
              <div class="card-body d-flex justify-content-between">
                <div>
                  <h5 class="fw-bold">
                    {{ value.ten }}
                  </h5>

                  <div class="text-muted small">
                    📍 {{ value.khoang_cach }}km
                    {{ value.dia_chi }}
                  </div>

                  <div class="text-muted small">⏰ {{ value.gio_mo }}</div>
                </div>

                <div class="text-end">
                  <div class="text-warning fw-bold">⭐ {{ value.rating }}</div>

                  <button class="btn btn-warning btn-sm mt-2">ĐẶT LỊCH</button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Services Section -->
    <section class="bg-light" style="margin-top: 50px">
      <div class="container">
        <h2 class="text-center mb-4">Dịch Vụ Của Chúng Tôi</h2>
        <div class="row">
          <div class="col-md-4 mb-4">
            <div class="card h-100 shadow-sm">
              <div class="card-body text-center">
                <i class="fas fa-futbol fa-3x text-primary mb-3"></i>
                <h5 class="card-title">Đặt Sân Bóng Đá</h5>
                <p class="card-text">
                  Đặt sân bóng đá dễ dàng với nhiều lựa chọn thời gian và địa
                  điểm.
                </p>
                <a href="#" class="btn btn-primary">Đặt Ngay</a>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-4">
            <div class="card h-100 shadow-sm">
              <div class="card-body text-center">
                <i class="fas fa-table-tennis fa-3x text-success mb-3"></i>
                <h5 class="card-title">Sân Tennis</h5>
                <p class="card-text">
                  Sân tennis chất lượng cao cho mọi cấp độ người chơi.
                </p>
                <a href="#" class="btn btn-success">Xem Chi Tiết</a>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-4">
            <div class="card h-100 shadow-sm">
              <div class="card-body text-center">
                <i class="fas fa-users fa-3x text-warning mb-3"></i>
                <h5 class="card-title">Đội Nóng</h5>
                <p class="card-text">
                  Tìm đối thủ hoặc tham gia đội bóng ngay lập tức.
                </p>
                <a href="#" class="btn btn-warning">Tham Gia</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  data() {
    return {
      danhSachSan: [
        {
          id: 1,
          ten: "Sân Cầu Lông Thanh Xuân",
          khoang_cach: 1.2,
          dia_chi: "Thanh Khê, Đà Nẵng",
          gio_mo: "05:00 - 22:00",
          rating: 4.6,
          hinh_anh: "https://golfbooking.com.vn/images/slideshow/2026/01/13/original/uu-dai-dac-quyen-intergolf-slice-web_1768300163.webp",
        },
        {
          id: 2,
          ten: "Sân Bóng Mini Hòa Xuân",
          khoang_cach: 2.1,
          dia_chi: "Cẩm Lệ, Đà Nẵng",
          gio_mo: "05:30 - 23:00",
          rating: 4.5,
          hinh_anh: "https://golfbooking.com.vn/images/slideshow/2026/02/27/original/z7569511046253_0a3ea76709deb74d41ed2c087b572469_1772186728.webp",
        },
        {
          id: 3,
          ten: "CLB Cầu Lông Tuyên Sơn",
          khoang_cach: 3.4,
          dia_chi: "Hải Châu, Đà Nẵng",
          gio_mo: "05:00 - 22:30",
          rating: 4.7,
          hinh_anh: "https://golfbooking.com.vn/images/slideshow/2026/02/13/original/z7531562292224_6d6a7e6283e06bcefe65f27652943f94_1770978712.webp",
        },
        {
          id: 4,
          ten: "Sân Tennis Sơn Trà",
          khoang_cach: 4.1,
          dia_chi: "Sơn Trà, Đà Nẵng",
          gio_mo: "06:00 - 21:30",
          rating: 4.3,
          hinh_anh: "https://picsum.photos/600/300?4",
        },
        {
          id: 5,
          ten: "Sân Bóng Phước Mỹ",
          khoang_cach: 2.7,
          dia_chi: "Sơn Trà, Đà Nẵng",
          gio_mo: "05:30 - 23:00",
          rating: 4.4,
          hinh_anh: "https://picsum.photos/600/300?5",
        },
        {
          id: 6,
          ten: "CLB Cầu Lông Hải Châu",
          khoang_cach: 1.9,
          dia_chi: "Hải Châu, Đà Nẵng",
          gio_mo: "05:00 - 22:00",
          rating: 4.8,
          hinh_anh: "https://picsum.photos/600/300?6",
        },
        {
          id: 7,
          ten: "Sân Bóng Mini Hòa Khánh",
          khoang_cach: 5.6,
          dia_chi: "Liên Chiểu, Đà Nẵng",
          gio_mo: "06:00 - 22:30",
          rating: 4.2,
          hinh_anh: "https://picsum.photos/600/300?7",
        },
        {
          id: 8,
          ten: "Sân Tennis Ngũ Hành Sơn",
          khoang_cach: 6.2,
          dia_chi: "Ngũ Hành Sơn, Đà Nẵng",
          gio_mo: "05:30 - 21:30",
          rating: 4.4,
          hinh_anh: "https://picsum.photos/600/300?8",
        },
        {
          id: 9,
          ten: "CLB Cầu Lông Đại Học",
          khoang_cach: 3.3,
          dia_chi: "Ngũ Hành Sơn, Đà Nẵng",
          gio_mo: "05:00 - 22:00",
          rating: 4.6,
          hinh_anh: "https://picsum.photos/600/300?9",
        },
        {
          id: 10,
          ten: "Sân Bóng Mini An Hải",
          khoang_cach: 2.5,
          dia_chi: "Sơn Trà, Đà Nẵng",
          gio_mo: "05:30 - 23:00",
          rating: 4.5,
          hinh_anh: "https://picsum.photos/600/300?10",
        },

        {
          id: 11,
          ten: "CLB Cầu Lông Thanh Bình",
          khoang_cach: 2.0,
          dia_chi: "Thanh Khê, Đà Nẵng",
          gio_mo: "05:00 - 22:00",
          rating: 4.3,
          hinh_anh: "https://picsum.photos/600/300?11",
        },
        {
          id: 12,
          ten: "Sân Tennis Hòa Cường",
          khoang_cach: 3.1,
          dia_chi: "Hải Châu, Đà Nẵng",
          gio_mo: "06:00 - 21:00",
          rating: 4.4,
          hinh_anh: "https://picsum.photos/600/300?12",
        },
        {
          id: 13,
          ten: "Sân Bóng Mini Hòa An",
          khoang_cach: 4.8,
          dia_chi: "Cẩm Lệ, Đà Nẵng",
          gio_mo: "05:30 - 23:00",
          rating: 4.2,
          hinh_anh: "https://picsum.photos/600/300?13",
        },
        {
          id: 14,
          ten: "CLB Cầu Lông Hòa Xuân",
          khoang_cach: 3.7,
          dia_chi: "Cẩm Lệ, Đà Nẵng",
          gio_mo: "05:00 - 22:30",
          rating: 4.6,
          hinh_anh: "https://picsum.photos/600/300?14",
        },
        {
          id: 15,
          ten: "Sân Tennis Mỹ An",
          khoang_cach: 2.9,
          dia_chi: "Ngũ Hành Sơn, Đà Nẵng",
          gio_mo: "06:00 - 21:00",
          rating: 4.3,
          hinh_anh: "https://picsum.photos/600/300?15",
        },
        {
          id: 16,
          ten: "Sân Bóng Mini Nam Việt Á",
          khoang_cach: 3.4,
          dia_chi: "Ngũ Hành Sơn, Đà Nẵng",
          gio_mo: "05:30 - 23:00",
          rating: 4.5,
          hinh_anh: "https://picsum.photos/600/300?16",
        },
        {
          id: 17,
          ten: "CLB Cầu Lông Hòa Khánh",
          khoang_cach: 6.1,
          dia_chi: "Liên Chiểu, Đà Nẵng",
          gio_mo: "05:00 - 22:00",
          rating: 4.4,
          hinh_anh: "https://picsum.photos/600/300?17",
        },
        {
          id: 18,
          ten: "Sân Tennis Liên Chiểu",
          khoang_cach: 7.0,
          dia_chi: "Liên Chiểu, Đà Nẵng",
          gio_mo: "06:00 - 21:30",
          rating: 4.1,
          hinh_anh: "https://picsum.photos/600/300?18",
        },
        {
          id: 19,
          ten: "Sân Bóng Mini Hòa Minh",
          khoang_cach: 5.9,
          dia_chi: "Liên Chiểu, Đà Nẵng",
          gio_mo: "05:30 - 22:30",
          rating: 4.2,
          hinh_anh: "https://picsum.photos/600/300?19",
        },
        {
          id: 20,
          ten: "CLB Cầu Lông An Khê",
          khoang_cach: 3.5,
          dia_chi: "Thanh Khê, Đà Nẵng",
          gio_mo: "05:00 - 22:00",
          rating: 4.6,
          hinh_anh: "https://picsum.photos/600/300?20",
        },

        {
          id: 21,
          ten: "Sân Tennis Thuận Phước",
          khoang_cach: 3.8,
          dia_chi: "Hải Châu, Đà Nẵng",
          gio_mo: "06:00 - 21:30",
          rating: 4.4,
          hinh_anh: "https://picsum.photos/600/300?21",
        },
        {
          id: 22,
          ten: "Sân Bóng Mini Hải Châu",
          khoang_cach: 1.7,
          dia_chi: "Hải Châu, Đà Nẵng",
          gio_mo: "05:30 - 23:00",
          rating: 4.5,
          hinh_anh: "https://picsum.photos/600/300?22",
        },
        {
          id: 23,
          ten: "CLB Cầu Lông Hòa Thọ",
          khoang_cach: 4.1,
          dia_chi: "Cẩm Lệ, Đà Nẵng",
          gio_mo: "05:00 - 22:00",
          rating: 4.3,
          hinh_anh: "https://picsum.photos/600/300?23",
        },
        {
          id: 24,
          ten: "Sân Tennis Hòa Phát",
          khoang_cach: 5.2,
          dia_chi: "Cẩm Lệ, Đà Nẵng",
          gio_mo: "06:00 - 21:30",
          rating: 4.2,
          hinh_anh: "https://picsum.photos/600/300?24",
        },
        {
          id: 25,
          ten: "Sân Bóng Mini Hòa Thọ",
          khoang_cach: 4.6,
          dia_chi: "Cẩm Lệ, Đà Nẵng",
          gio_mo: "05:30 - 23:00",
          rating: 4.4,
          hinh_anh: "https://picsum.photos/600/300?25",
        },
        {
          id: 26,
          ten: "CLB Cầu Lông Sơn Trà",
          khoang_cach: 2.4,
          dia_chi: "Sơn Trà, Đà Nẵng",
          gio_mo: "05:00 - 22:00",
          rating: 4.7,
          hinh_anh: "https://picsum.photos/600/300?26",
        },
        {
          id: 27,
          ten: "Sân Tennis Phước Mỹ",
          khoang_cach: 2.8,
          dia_chi: "Sơn Trà, Đà Nẵng",
          gio_mo: "06:00 - 21:30",
          rating: 4.3,
          hinh_anh: "https://picsum.photos/600/300?27",
        },
        {
          id: 28,
          ten: "Sân Bóng Mini Mân Thái",
          khoang_cach: 3.2,
          dia_chi: "Sơn Trà, Đà Nẵng",
          gio_mo: "05:30 - 23:00",
          rating: 4.4,
          hinh_anh: "https://picsum.photos/600/300?28",
        },
        {
          id: 29,
          ten: "CLB Cầu Lông Mỹ Khê",
          khoang_cach: 2.0,
          dia_chi: "Sơn Trà, Đà Nẵng",
          gio_mo: "05:00 - 22:00",
          rating: 4.6,
          hinh_anh: "https://picsum.photos/600/300?29",
        },
        {
          id: 30,
          ten: "Sân Tennis Mỹ Khê",
          khoang_cach: 2.1,
          dia_chi: "Sơn Trà, Đà Nẵng",
          gio_mo: "06:00 - 21:30",
          rating: 4.5,
          hinh_anh: "https://picsum.photos/600/300?30",
        },

        {
          id: 31,
          ten: "Sân Bóng Mini Khuê Trung",
          khoang_cach: 3.9,
          dia_chi: "Cẩm Lệ, Đà Nẵng",
          gio_mo: "05:30 - 23:00",
          rating: 4.3,
          hinh_anh: "https://picsum.photos/600/300?31",
        },
        {
          id: 32,
          ten: "CLB Cầu Lông Hòa Cường",
          khoang_cach: 2.6,
          dia_chi: "Hải Châu, Đà Nẵng",
          gio_mo: "05:00 - 22:00",
          rating: 4.7,
          hinh_anh: "https://picsum.photos/600/300?32",
        },
        {
          id: 33,
          ten: "Sân Tennis Hòa Xuân",
          khoang_cach: 4.0,
          dia_chi: "Cẩm Lệ, Đà Nẵng",
          gio_mo: "06:00 - 21:30",
          rating: 4.2,
          hinh_anh: "https://picsum.photos/600/300?33",
        },
        {
          id: 34,
          ten: "Sân Bóng Mini Hòa Phước",
          khoang_cach: 5.5,
          dia_chi: "Hòa Vang, Đà Nẵng",
          gio_mo: "05:30 - 23:00",
          rating: 4.4,
          hinh_anh: "https://picsum.photos/600/300?34",
        },
        {
          id: 35,
          ten: "CLB Cầu Lông Hòa Nhơn",
          khoang_cach: 8.0,
          dia_chi: "Hòa Vang, Đà Nẵng",
          gio_mo: "05:00 - 22:00",
          rating: 4.1,
          hinh_anh: "https://picsum.photos/600/300?35",
        },
        {
          id: 36,
          ten: "Sân Tennis Hòa Nhơn",
          khoang_cach: 8.4,
          dia_chi: "Hòa Vang, Đà Nẵng",
          gio_mo: "06:00 - 21:00",
          rating: 4.0,
          hinh_anh: "https://picsum.photos/600/300?36",
        },
        {
          id: 37,
          ten: "Sân Bóng Mini Hòa Liên",
          khoang_cach: 9.1,
          dia_chi: "Hòa Vang, Đà Nẵng",
          gio_mo: "05:30 - 22:30",
          rating: 4.2,
          hinh_anh: "https://picsum.photos/600/300?37",
        },
        {
          id: 38,
          ten: "CLB Cầu Lông Hòa Tiến",
          khoang_cach: 7.3,
          dia_chi: "Hòa Vang, Đà Nẵng",
          gio_mo: "05:00 - 22:00",
          rating: 4.3,
          hinh_anh: "https://picsum.photos/600/300?38",
        },
        {
          id: 39,
          ten: "Sân Tennis Hòa Châu",
          khoang_cach: 6.9,
          dia_chi: "Hòa Vang, Đà Nẵng",
          gio_mo: "06:00 - 21:30",
          rating: 4.2,
          hinh_anh: "https://picsum.photos/600/300?39",
        },
        {
          id: 40,
          ten: "Sân Bóng Mini Hòa Phong",
          khoang_cach: 10.1,
          dia_chi: "Hòa Vang, Đà Nẵng",
          gio_mo: "05:30 - 23:00",
          rating: 4.1,
          hinh_anh: "https://picsum.photos/600/300?40",
        },

        {
          id: 41,
          ten: "CLB Cầu Lông Hòa Bắc",
          khoang_cach: 12.2,
          dia_chi: "Hòa Vang, Đà Nẵng",
          gio_mo: "05:00 - 22:00",
          rating: 4.0,
          hinh_anh: "https://picsum.photos/600/300?41",
        },
        {
          id: 42,
          ten: "Sân Tennis Hòa Sơn",
          khoang_cach: 11.3,
          dia_chi: "Hòa Vang, Đà Nẵng",
          gio_mo: "06:00 - 21:00",
          rating: 4.2,
          hinh_anh: "https://picsum.photos/600/300?42",
        },
        {
          id: 43,
          ten: "Sân Bóng Mini Hòa Khương",
          khoang_cach: 10.5,
          dia_chi: "Hòa Vang, Đà Nẵng",
          gio_mo: "05:30 - 22:30",
          rating: 4.3,
          hinh_anh: "https://picsum.photos/600/300?43",
        },
        {
          id: 44,
          ten: "CLB Cầu Lông Hòa Phú",
          khoang_cach: 13.1,
          dia_chi: "Hòa Vang, Đà Nẵng",
          gio_mo: "05:00 - 22:00",
          rating: 4.1,
          hinh_anh: "https://picsum.photos/600/300?44",
        },
        {
          id: 45,
          ten: "Sân Tennis Hòa Ninh",
          khoang_cach: 14.4,
          dia_chi: "Hòa Vang, Đà Nẵng",
          gio_mo: "06:00 - 21:30",
          rating: 4.0,
          hinh_anh: "https://picsum.photos/600/300?45",
        },
        {
          id: 46,
          ten: "Sân Bóng Mini Hòa Phú",
          khoang_cach: 13.7,
          dia_chi: "Hòa Vang, Đà Nẵng",
          gio_mo: "05:30 - 22:30",
          rating: 4.2,
          hinh_anh: "https://picsum.photos/600/300?46",
        },
        {
          id: 47,
          ten: "CLB Cầu Lông Hòa Bắc 2",
          khoang_cach: 12.8,
          dia_chi: "Hòa Vang, Đà Nẵng",
          gio_mo: "05:00 - 22:00",
          rating: 4.1,
          hinh_anh: "https://picsum.photos/600/300?47",
        },
        {
          id: 48,
          ten: "Sân Tennis Hòa Phong",
          khoang_cach: 10.9,
          dia_chi: "Hòa Vang, Đà Nẵng",
          gio_mo: "06:00 - 21:00",
          rating: 4.2,
          hinh_anh: "https://picsum.photos/600/300?48",
        },
        {
          id: 49,
          ten: "Sân Bóng Mini Hòa Nhơn 2",
          khoang_cach: 8.9,
          dia_chi: "Hòa Vang, Đà Nẵng",
          gio_mo: "05:30 - 23:00",
          rating: 4.3,
          hinh_anh: "https://picsum.photos/600/300?49",
        },
        {
          id: 50,
          ten: "CLB Cầu Lông Trung Tâm",
          khoang_cach: 1.5,
          dia_chi: "Hải Châu, Đà Nẵng",
          gio_mo: "05:00 - 22:30",
          rating: 4.9,
          hinh_anh: "https://picsum.photos/600/300?50",
        },
      ],
    };
  },
};
</script>

<style scoped>
.carousel {
  height: 70vh;
  overflow: hidden;
}

.carousel-item img {
  height: 100%;
  object-fit: cover;
}

.carousel-caption {
  position: relative;
  width: auto;
  max-width: 520px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  text-align: center;
  margin: 20px auto;
}

.carousel-caption h5 {
  font-size: 2rem;
  font-weight: bold;
}

.carousel-caption p {
  font-size: 1.2rem;
}

.card {
  transition: transform 0.3s;
}

.card:hover {
  transform: translateY(-10px);
}

.card:hover {
  transform: translateY(-4px);
  transition: 0.2s;
}
</style>
