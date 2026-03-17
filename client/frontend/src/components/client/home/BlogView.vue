<template>
  <section class="blog-section">
    <div class="container">
      <div class="blog-section__header">
        <h2 class="blog-section__title">BLOG THỂ THAO</h2>
        <p class="blog-section__subtitle">Cập nhật những tin tức và bài viết mới nhất từ Playfinder.</p>
      </div>

      <div class="blog-grid">
        <article v-for="post in posts" :key="post.id" class="blog-card">
          <!-- Thumbnail -->
          <div class="blog-card__thumb">
            <img :src="post.image" :alt="post.title" class="blog-card__img" />
            <div class="blog-card__thumb-overlay">
              <div class="blog-card__thumb-label">
                <div class="thumb-logo">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#4ade80" stroke-width="2.5"/>
                    <path d="M8 12l3 3 5-5" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Playfinder</span>
                </div>
                <strong>Live Calendar</strong>
              </div>
              <!-- Decorative diagonal stripes -->
              <div class="thumb-stripes">
                <span></span><span></span>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div class="blog-card__body">
            <h3 class="blog-card__title">{{ post.title }}</h3>
            <div class="blog-card__underline"></div>
            <p class="blog-card__excerpt">{{ post.excerpt }}</p>
            <p class="blog-card__date">{{ post.date }}</p>
            <a href="#" class="blog-card__link">Đọc thêm</a>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'BlogSection',
  data() {
    return {
      posts: [
        {
          id: 1,
          title: 'Loại bỏ rào cản trong quá trình đặt chỗ: Thông tin chi tiết thông minh hơn, các dịch vụ bổ sung và phương thức thanh toán linh hoạt.',
          excerpt: 'Đặt chỗ các cơ sở thể thao trực tuyến chỉ trong vài giây với Lịch trực tiếp của chúng tôi — hiển thị tình trạng chỗ trống theo thời gian thực, đặt chỗ lặp lại và trải nghiệm liền mạch, trực quan.',
          date: 'Ngày 10 tháng 2 năm 2026',
          image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=340&fit=crop&crop=center',
        },
        {
          id: 2,
          title: 'Từ các trận đấu đơn lẻ đến các buổi tập hàng tuần: Sức mạnh của lịch đặt lịch thi đấu thể thao trực tiếp',
          excerpt: 'Đặt chỗ các cơ sở thể thao trực tuyến dễ dàng bằng Lịch trực tuyến của chúng tôi. Tận hưởng thông tin về tình trạng chỗ trống theo thời gian thực, đặt chỗ lặp lại và trải nghiệm đặt chỗ mượt mà, trực quan.',
          date: 'Ngày 29 tháng 1 năm 2026',
          image: 'https://images.unsplash.com/photo-1551958219-acbc595e97e9?w=600&h=340&fit=crop&crop=center',
        },
        {
          id: 3,
          title: 'Trải nghiệm đặt chỗ trực tuyến của bạn vừa được nâng cấp.',
          excerpt: 'Trải nghiệm quy trình đặt phòng trực tuyến mượt mà và linh hoạt hơn với các tính năng mới được hỗ trợ bởi Bookteq: đặt phòng lặp lại, thời gian thuê tùy chỉnh, phương thức thanh toán trả góp và hơn thế nữa.',
          date: 'Ngày 18 tháng 11 năm 2025',
          image: 'https://images.unsplash.com/photo-1434648957308-5e6a859697e8?w=600&h=340&fit=crop&crop=center',
        },
      ],
    }
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@700;800;900&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.blog-section {
  font-family: 'Barlow', sans-serif;
  background: #fff;
  padding: 80px 20px;
  width: 100%;
}

/* ─── HEADER ─── */
.blog-section__header {
  text-align: center;
  margin-bottom: 40px;
}

.blog-section__title {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 900;
  font-size: 26px;
  letter-spacing: 1.5px;
  color: #1a1a2e;
  margin-bottom: 10px;
}

.blog-section__subtitle {
  font-size: 15px;
  color: #555;
  font-weight: 400;
}

/* ─── GRID ─── */
.blog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

/* ─── CARD ─── */
.blog-card {
  display: flex;
  flex-direction: column;
}

/* Thumbnail */
.blog-card__thumb {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  background: #1e2a4a;
}

.blog-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0.45;
  transition: opacity 0.3s, transform 0.4s;
}

.blog-card:hover .blog-card__img {
  opacity: 0.35;
  transform: scale(1.04);
}

/* Overlay label */
.blog-card__thumb-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 18px 20px;
}

.blog-card__thumb-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 2;
}

.thumb-logo {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: rgba(255,255,255,0.85);
  font-weight: 500;
}

.blog-card__thumb-label strong {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: white;
  letter-spacing: 0.3px;
  line-height: 1.1;
}

/* Diagonal stripes top-right */
.thumb-stripes {
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 100%;
  display: flex;
  gap: 10px;
  padding-right: 8px;
  justify-content: flex-end;
  align-items: stretch;
  overflow: hidden;
}

.thumb-stripes span {
  display: block;
  width: 14px;
  background: rgba(74, 222, 128, 0.55);
  transform: skewX(-12deg);
}

.thumb-stripes span:first-child {
  background: rgba(74, 222, 128, 0.75);
}

/* ─── CARD BODY ─── */
.blog-card__body {
  padding-top: 18px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.blog-card__title {
  font-family: 'Barlow', sans-serif;
  font-weight: 700;
  font-size: 15px;
  color: #1e2a4a;
  line-height: 1.45;
  margin-bottom: 10px;
}

.blog-card__underline {
  width: 36px;
  height: 3px;
  background: #16a34a;
  border-radius: 2px;
  margin-bottom: 14px;
}

.blog-card__excerpt {
  font-size: 13.5px;
  color: #555;
  line-height: 1.65;
  margin-bottom: 16px;
  flex: 1;
}

.blog-card__date {
  font-size: 13px;
  color: #888;
  margin-bottom: 14px;
}

.blog-card__link {
  font-weight: 700;
  font-size: 14px;
  color: #16a34a;
  text-decoration: none;
  transition: color 0.2s;
  width: fit-content;
}

.blog-card__link:hover {
  color: #15803d;
  text-decoration: underline;
}

/* ─── RESPONSIVE ─── */
@media (max-width: 860px) {
  .blog-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 560px) {
  .blog-section { padding: 40px 16px 50px; }
  .blog-grid { grid-template-columns: 1fr; gap: 36px; }
  .blog-section__title { font-size: 20px; }
}
</style>