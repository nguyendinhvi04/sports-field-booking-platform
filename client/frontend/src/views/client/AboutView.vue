<template>
  <div class="about-page">
    <!-- Hero Section -->
    <div class="about-hero">
      <div class="container text-center hero-content">
        <h1 class="display-font hero-title">Về Sports Booking</h1>
        <p class="hero-subtitle">Nền tảng kết nối trực tuyến hiện đại dành cho cộng đồng thể thao. Dễ dàng, tiện lợi và chuyên nghiệp.</p>
      </div>
      <div class="hero-bg-overlay"></div>
    </div>
    <div class="container main-container py-5">
      <!-- Section 1: Dành cho người dùng -->
      <section class="benefit-section user-section">
        <div class="row align-items-center">
          <div class="col-lg-6 mb-5 mb-lg-0 text-content">
            <h2 class="section-title">Đối với Người Chơi Thể Thao</h2>
            <div class="title-underline"></div>
            <p class="section-desc">Sports Booking mang đến trải nghiệm tìm kiếm và đặt sân tiện lợi nhất, giúp bạn tiết kiệm thời gian và tận hưởng trọn vẹn niềm đam mê.</p>
            <ul class="benefit-list">
              <li>
                <div class="icon-box"><i class="bx bx-search"></i></div>
                <div class="list-content">
                  <h4>Tìm kiếm dễ dàng</h4>
                  <p>Tìm sân theo môn thể thao, vị trí, giờ giấc và mức giá mong muốn chỉ với vài thao tác vuốt chạm.</p>
                </div>
              </li>
              <li>
                <div class="icon-box"><i class="bx bx-calendar-check"></i></div>
                <div class="list-content">
                  <h4>Đặt sân nhanh chóng</h4>
                  <p>Xem lịch trống theo thời gian thực và tự động đặt ngiêng lập tức thay vì phải gọi điện phức tạp.</p>
                </div>
              </li>
              <li>
                <div class="icon-box"><i class="bx bx-credit-card-front"></i></div>
                <div class="list-content">
                  <h4>Thanh toán an toàn</h4>
                  <p>Hỗ trợ nhiều phương thức thanh toán trực tuyến, minh bạch, nhanh chóng và an toàn tuyệt đối.</p>
                </div>
              </li>
              <li>
                <div class="icon-box"><i class="bx bx-group"></i></div>
                <div class="list-content">
                  <h4>Kết nối cộng đồng</h4>
                  <p>Tìm bạn cùng chơi, đội đối thủ giao hữu và tham gia các giải đấu phong trào quanh bạn.</p>
                </div>
              </li>
            </ul>
          </div>
          <div class="col-lg-6 text-center image-col">
            <div class="image-wrapper">
              <img :src="playerImg" alt="Người chơi thể thao" class="img-fluid hero-img" />
              <div class="floating-card user-floating">
                <div class="floating-icon"><i class='bx bxs-star'></i></div>
                <div class="floating-text">
                  <span class="highlight">5.0</span>
                  <span class="label">Trải nghiệm đặt sân</span>
                </div>
              </div>
              <div class="image-backdrop"></div>
            </div>
          </div>
        </div>
      </section>

      <div class="section-divider-container">
        <hr class="section-divider" />
        <div class="divider-icon"><i class="bx bx-loader bx-spin"></i></div>
      </div>

      <!-- Section 2: Dành cho chủ sân -->
      <section class="benefit-section owner-section">
        <div class="row align-items-center flex-column-reverse flex-lg-row">
          <div class="col-lg-6 text-center image-col mb-5 mb-lg-0 mt-5 mt-lg-0">
            <div class="image-wrapper left-img-wrapper">
              <img :src="ownerImg" alt="Chủ sân" class="img-fluid hero-img" />
              <div class="floating-card owner-floating">
                <div class="floating-icon"><i class='bx bx-trending-up'></i></div>
                <div class="floating-text">
                  <span class="highlight">+45%</span>
                  <span class="label">Tăng trưởng doanh thu</span>
                </div>
              </div>
              <div class="image-backdrop backdrop-left"></div>
            </div>
          </div>
          <div class="col-lg-6 text-content">
            <h2 class="section-title">Đối với Chủ Cơ Sở</h2>
            <div class="title-underline owner-underline"></div>
            <p class="section-desc">Hệ thống quản lý chuyên nghiệp giúp tự động hoá vận hành sân thể thao, tiếp cận hàng ngàn khách hàng và quản lý tài chính hiệu quả.</p>
            
            <ul class="benefit-list">
              <li>
                <div class="icon-box owner-icon"><i class="bx bx-bar-chart-alt-2"></i></div>
                <div class="list-content">
                  <h4>Tối ưu hóa doanh thu</h4>
                  <p>Lấp đầy các khung giờ trống thông qua mạng lưới người dùng lớn đang có trên nền tảng của chúng tôi.</p>
                </div>
              </li>
              <li>
                <div class="icon-box owner-icon"><i class="bx bx-laptop"></i></div>
                <div class="list-content">
                  <h4>Quản lý toàn diện</h4>
                  <p>Hệ thống số hóa giúp xem lịch, kiểm soát lịch đặt, thống kê số liệu và tài chính nhanh chóng, chính xác.</p>
                </div>
              </li>
              <li>
                <div class="icon-box owner-icon"><i class="bx bx-user-circle"></i></div>
                <div class="list-content">
                  <h4>Chăm sóc khách hàng</h4>
                  <p>Quản lý tệp khách hàng quen thuộc thuận tiện hơn so với việc ghi chép sổ sách truyền thống.</p>
                </div>
              </li>
              <li>
                <div class="icon-box owner-icon"><i class="bx bx-buildings"></i></div>
                <div class="list-content">
                  <h4>Nâng tầm thương hiệu</h4>
                  <p>Tiếp thị hình ảnh doanh nghiệp trực tuyến, quản lý đánh giá từ người dùng để gia tăng uy tín.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
      
      <!-- Call to Action -->
      <section class="cta-section text-center">
         <div class="cta-content">
           <h2 class="display-font">Bạn Đã Sẵn Sàng Bắt Đầu?</h2>
           <p>Tham gia vào nền tảng thể thao hiện đại, tối ưu trải nghiệm và quản lý mọi thứ trong lòng bàn tay.</p>
           <div class="cta-buttons">
              <router-link to="/auth/register" class="btn-cta btn-primary-cta">Tạo Tài Khoản Khách</router-link>
              <router-link to="/auth/login" class="btn-cta btn-secondary-cta">Trở Thành Đối Tác</router-link>
           </div>
         </div>
      </section>
    </div>
  </div>
</template>

<script>
import playerImg from '@/assets/assets/images/about/player1.jpg';
import ownerImg from '@/assets/assets/images/about/owner1.jpg';

export default {
  name: "AboutView",
  data() {
    return {
      playerImg,
      ownerImg
    };
  },
  mounted() {
    window.scrollTo(0, 0);
  }
};
</script>

<style scoped>
.about-page {
  background-color: var(--bg);
  min-height: 100vh;
  padding-bottom: 60px;
}

/* Hero Section */
.about-hero {
  position: relative;
  background-image: url('https://images.unsplash.com/photo-1518605368461-1ee7e54c8fe0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80');
  background-size: cover;
  background-position: center;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 160, 133, 0.7) 100%);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  color: white;
  animation: fadeInDown 0.8s ease-out;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  letter-spacing: 1px;
  text-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.hero-subtitle {
  font-size: 1.25rem;
  max-width: 700px;
  margin: 0 auto;
  opacity: 0.9;
  font-weight: 400;
  line-height: 1.6;
}

/* Typography & Titles */
.section-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 15px;
  font-family: var(--heading-font, 'Barlow Condensed', sans-serif);
}

.title-underline {
  width: 60px;
  height: 4px;
  background-color: #3b82f6; /* User color */
  border-radius: 2px;
  margin-bottom: 25px;
}

.owner-underline {
  background-color: #10b981; /* Owner color */
}

.section-desc {
  font-size: 1.1rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 30px;
}

/* Benefits List */
.benefit-section {
  padding: 60px 0;
}

.benefit-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.benefit-list li {
  display: flex;
  align-items: flex-start;
  margin-bottom: 25px;
  transition: transform 0.3s ease;
}

.benefit-list li:hover {
  transform: translateX(5px);
}

.icon-box {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
  margin-right: 20px;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.05);
}

.owner-icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.05);
}

.list-content h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
  margin-top: 0;
}

.list-content p {
  font-size: 0.95rem;
  color: #64748b;
  margin-bottom: 0;
  line-height: 1.5;
}

/* Images and Decor */
.image-wrapper {
  position: relative;
  border-radius: 20px;
  padding: 15px;
  z-index: 10;
}

.hero-img {
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  position: relative;
  z-index: 2;
  transition: transform 0.4s ease;
}

.image-wrapper:hover .hero-img {
  transform: translateY(-5px);
}

.image-backdrop {
  position: absolute;
  top: 0;
  right: 0;
  width: 80%;
  height: 100%;
  border-radius: 20px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  z-index: 1;
  transform: translate(20px, 20px);
}

.backdrop-left {
  left: 0;
  right: auto;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  transform: translate(-20px, 20px);
}

.floating-card {
  position: absolute;
  bottom: 20px;
  left: -20px;
  background: white;
  padding: 12px 20px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 3;
  animation: float 4s ease-in-out infinite;
}

.owner-floating {
  bottom: 40px;
  left: auto;
  right: -20px;
  animation: float 4s ease-in-out infinite 1s;
}

.floating-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.user-floating .floating-icon {
  background: #fef08a;
  color: #ca8a04;
}

.owner-floating .floating-icon {
  background: #d1fae5;
  color: #059669;
}

.floating-text {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.floating-text .highlight {
  font-weight: 800;
  font-size: 1.1rem;
  color: #1e293b;
}

.floating-text .label {
  font-size: 0.8rem;
  color: #64748b;
  white-space: nowrap;
}

/* Divder */
.section-divider-container {
  position: relative;
  margin: 30px 0;
}

.section-divider {
  border-top: 1px solid #e2e8f0;
  margin: 0;
}

.divider-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #f8fafc;
  padding: 0 20px;
  color: #cbd5e1;
  font-size: 24px;
}

/* CTA Section */
.cta-section {
  margin-top: 70px;
  padding: 60px 20px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 24px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
}

.cta-section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(255,255,255,0) 70%);
  z-index: 1;
}

.cta-content {
  position: relative;
  z-index: 2;
}

.cta-section h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 15px;
  color: white;
}

.cta-section p {
  font-size: 1.15rem;
  color: #94a3b8;
  max-width: 600px;
  margin: 0 auto 35px auto;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-cta {
  padding: 12px 30px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-block;
}

.btn-primary-cta {
  background: #3b82f6;
  color: white;
  border: 2px solid #3b82f6;
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
}

.btn-primary-cta:hover {
  background: #2563eb;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(59, 130, 246, 0.4);
}

.btn-secondary-cta {
  background: transparent;
  color: white;
  border: 2px solid #64748b;
}

.btn-secondary-cta:hover {
  border-color: #10b981;
  color: #10b981;
}

/* Animations */
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsiveness */
@media (max-width: 991px) {
  .hero-title { font-size: 2.8rem; }
  .floating-card { padding: 10px 15px; }
  .floating-text .highlight { font-size: 1rem; }
  .image-backdrop { display: none; }
}

@media (max-width: 768px) {
  .about-hero { height: 300px; }
  .hero-title { font-size: 2.2rem; }
  .hero-subtitle { font-size: 1rem; }
  .section-title { font-size: 1.8rem; }
  .cta-section { padding: 40px 20px; }
  .cta-section h2 { font-size: 2rem; }
  .cta-buttons { flex-direction: column; width: 100%; max-width: 300px; margin: 0 auto; gap: 15px; }
  .btn-cta { width: 100%; text-align: center; }
  .floating-card { display: none; } /* Hide floating cards on small screens for cleaner look */
}
</style>
