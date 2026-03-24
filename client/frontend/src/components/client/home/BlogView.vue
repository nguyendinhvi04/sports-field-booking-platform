<template>
  <section class="blog-section">
    <div class="blog-section__header">
      <h2 class="blog-section__title" data-aos="fade-up">BLOG THỂ THAO</h2>
      <p class="blog-section__subtitle" data-aos="fade-up" data-aos-delay="100">Cập nhật những tin tức và bài viết mới nhất từ Playfinder.</p>
    </div>

    <div class="blog-slider-wrapper">
      <div class="blog-slider">
        <!-- We double the posts to create a seamless loop effect if using animation, 
             or just use a single set for a standard slider. 
             Since the user asked for "movement", we'll provide a horizontal scrollable view 
             that feels dynamic. -->
        <article v-for="(post, index) in allPosts" :key="`${post.id}-${index}`" class="blog-card">
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
        {
          id: 4,
          title: 'Nâng cao hiệu suất tập luyện với các bài tập bổ trợ hàng tuần.',
          excerpt: 'Khám phá các phương pháp tập luyện mới nhất từ các chuyên gia thể thao để nâng cao sức bền và sự dẻo dai của bạn.',
          date: 'Ngày 05 tháng 03 năm 2026',
          image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=340&fit=crop&crop=center',
        },
        {
          id: 5,
          title: 'Công nghệ trong quản lý sân vận động: Tương lai của ngành thể thao.',
          excerpt: 'Làm thế nào AI và IoT đang thay đổi cách chúng ta quản lý và vận hành các cơ sở thể thao hiện đại.',
          date: 'Ngày 25 tháng 02 năm 2026',
          image: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=600&h=340&fit=crop&crop=center',
        },
      ],
    }
  },
  computed: {
    allPosts() {
      // Return a doubled list to ensure there's enough content to scroll/move
      return [...this.posts, ...this.posts];
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@700;800;900&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.blog-section {
  font-family: 'Barlow', sans-serif;
  background: #fff;
  padding: 80px 0;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ─── HEADER ─── */
.blog-section__header {
  text-align: center;
  margin-bottom: 50px;
  padding: 0 20px;
}

.blog-section__title {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 900;
  font-size: 32px;
  letter-spacing: 1.5px;
  color: #1a1a2e;
  margin-bottom: 12px;
  text-transform: uppercase;
}

.blog-section__subtitle {
  font-size: 16px;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ─── SLIDER WRAPPER ─── */
.blog-slider-wrapper {
  width: 100%;
  position: relative;
  overflow: hidden;
  padding: 20px 0;
}

.blog-slider {
  display: flex;
  gap: 30px;
  width: max-content;
  animation: marquee 60s linear infinite;
  padding-left: 30px;
}

.blog-slider:hover {
  animation-play-state: paused;
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(calc(-50% - 15px)); }
}

/* ─── CARD ─── */
.blog-card {
  width: 380px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.blog-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: #16a34a33;
}

/* Thumbnail */
.blog-card__thumb {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  background: #1e2a4a;
}

.blog-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0.9;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.blog-card:hover .blog-card__img {
  transform: scale(1.1);
  opacity: 1;
}

/* Overlay label */
.blog-card__thumb-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 20px;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
}

.blog-card__thumb-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 2;
}

.thumb-logo {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #4ade80;
  font-weight: 600;
}

.blog-card__thumb-label strong {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: white;
  letter-spacing: 0.5px;
  line-height: 1.1;
}

/* Diagonal stripes top-right */
.thumb-stripes {
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100%;
  display: flex;
  gap: 12px;
  padding-right: 12px;
  justify-content: flex-end;
  align-items: stretch;
  overflow: hidden;
}

.thumb-stripes span {
  display: block;
  width: 16px;
  background: rgba(74, 222, 128, 0.4);
  transform: skewX(-15deg);
}

.thumb-stripes span:first-child {
  background: rgba(74, 222, 128, 0.6);
}

/* ─── CARD BODY ─── */
.blog-card__body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.blog-card__title {
  font-family: 'Barlow', sans-serif;
  font-weight: 700;
  font-size: 17px;
  color: #1e293b;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
  height: 3em;
}

.blog-card__underline {
  width: 40px;
  height: 4px;
  background: #16a34a;
  border-radius: 2px;
  margin-bottom: 16px;
}

.blog-card__excerpt {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 20px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-clamp: 3;
  overflow: hidden;
}

.blog-card__date {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.blog-card__date::before {
  content: "🕒";
  font-size: 12px;
}

.blog-card__link {
  font-weight: 700;
  font-size: 14px;
  color: #16a34a;
  text-decoration: none;
  transition: all 0.3s;
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 4px;
}

.blog-card__link:hover {
  color: #15803d;
  gap: 8px;
}

.blog-card__link::after {
  content: "→";
}

/* ─── RESPONSIVE ─── */
@media (max-width: 768px) {
  .blog-card { width: 320px; }
  .blog-section__title { font-size: 26px; }
  .blog-slider { animation-duration: 40s; }
}

@media (max-width: 480px) {
  .blog-card { width: 280px; }
  .blog-section { padding: 50px 0; }
  .blog-slider { gap: 20px; padding-left: 20px; }
}
</style>