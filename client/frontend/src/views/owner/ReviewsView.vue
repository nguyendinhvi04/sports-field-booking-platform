<template>
  <div class="reviews-page">
    <!-- Header Section: Total Rating -->
    <header class="reviews-header card-3d">
      <div class="rating-info">
        <h1 class="page-title">Đánh giá từ khách hàng</h1>
        <p class="subtitle text-muted">Những phản hồi thực tế từ cộng đồng người chơi</p>
        
        <div class="rating-summary">
          <div class="rating-number">4.8</div>
          <div class="rating-stars">
            <div class="stars-outer">
              <span class="material-icons">star</span>
              <span class="material-icons">star</span>
              <span class="material-icons">star</span>
              <span class="material-icons">star</span>
              <span class="material-icons">star_half</span>
            </div>
            <p class="total-reviews">Dựa trên 382 đánh giá</p>
          </div>
        </div>
      </div>

      <div class="rating-distribution">
        <div v-for="i in 5" :key="i" class="rating-bar-row">
          <span class="star-label">{{ 6 - i }} <span class="material-icons">star</span></span>
          <div class="progress-container">
            <div class="progress-bar" :style="{ width: [85, 10, 3, 2, 0][i-1] + '%' }"></div>
          </div>
          <span class="count-label">{{ [324, 38, 12, 8, 0][i-1] }}</span>
        </div>
      </div>
    </header>

    <!-- Filters Section -->
    <div class="filters-row card-3d">
      <div class="filter-group">
        <button v-for="f in ratingFilters" :key="f.label" 
          class="filter-pill" :class="{ active: currentFilter === f.value }"
          @click="currentFilter = f.value">
          {{ f.label }}
          <span v-if="f.count" class="badge">{{ f.count }}</span>
        </button>
      </div>
      <div class="sort-group">
        <select class="sort-select">
          <option>Mới nhất</option>
          <option>Cũ nhất</option>
          <option>Xếp hạng cao nhất</option>
          <option>Xếp hạng thấp nhất</option>
        </select>
      </div>
    </div>

    <!-- Reviews List -->
    <div class="reviews-list">
      <div v-for="review in filteredReviews" :key="review.id" class="review-card card-3d">
        <div class="review-user-info">
          <div class="user-avatar gradient-avatar">
            {{ review.user.charAt(0) }}
          </div>
          <div class="user-details">
            <h3 class="user-name">{{ review.user }}</h3>
            <div class="review-meta">
              <span class="review-date">{{ review.date }}</span>
              <span class="club-tag">{{ review.club }}</span>
            </div>
          </div>
          <div class="review-rating-stars">
            <span v-for="s in 5" :key="s" class="material-icons" :class="{ active: s <= review.rating }">
              {{ s <= review.rating ? 'star' : 'star_outline' }}
            </span>
          </div>
        </div>

        <div class="review-content">
          <p>{{ review.comment }}</p>
        </div>

        <div v-if="review.images.length" class="review-images">
          <div v-for="(img, idx) in review.images" :key="idx" class="img-wrapper">
             <img :src="img" alt="Review Image">
          </div>
        </div>

        <div class="review-actions">
          <button class="action-btn reply-btn">
            <span class="material-icons">reply</span> Trả lời
          </button>
          <button class="action-btn report-btn">
            <span class="material-icons">flag</span> Báo cáo
          </button>
          <div class="like-counter">
            <span class="material-icons">thumb_up_off_alt</span>
            <span>{{ review.likes }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OwnerReviewsView',
  data() {
    return {
      currentFilter: 'all',
      ratingFilters: [
        { label: 'Tất cả', value: 'all', count: 382 },
        { label: '5 ★', value: 5, count: 324 },
        { label: '4 ★', value: 4, count: 38 },
        { label: '3 ★', value: 3, count: 12 },
        { label: '2 ★', value: 2, count: 8 },
        { label: '1 ★', value: 1, count: 0 },
      ],
      reviews: [
        {
          id: 1,
          user: 'Nguyễn Thanh Tùng',
          date: '15/03/2026',
          club: 'Sân bóng Bách Khoa',
          rating: 5,
          comment: 'Sân rất đẹp, cỏ mới, đèn sáng ổn. Nhân viên nhiệt tình, có chỗ gửi xe rộng rãi. Sẽ còn quay lại.',
          likes: 12,
          images: [
            'https://media.vov.vn/sites/default/files/styles/large/public/2021-05/san%20bong.jpg',
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_X3qR9XG_J5j3_p_7r_N_m_T_X_Q_X_Q_X_Q&s'
          ]
        },
        {
          id: 2,
          user: 'Lê Hoàng Hải',
          date: '12/03/2026',
          club: 'Cụm sân cỏ nhân tạo – A',
          rating: 4,
          comment: 'Chất lượng sân tốt nhưng giá hơi cao vào giờ cao điểm. Mong có thêm nhiều khuyến mãi cho khách quen.',
          likes: 5,
          images: []
        },
        {
          id: 3,
          user: 'Trần Minh Quân',
          date: '10/03/2026',
          club: 'Sân bóng Bách Khoa',
          rating: 5,
          comment: 'Dịch vụ tuyệt vời, thủ tục đặt sân nhanh gọn qua app. Ưng nhất là hệ thống tưới nước làm mát sân vào mùa hè.',
          likes: 8,
          images: [
            'https://songnam.com.vn/wp-content/uploads/2020/07/chieu-sang-san-bong-da-4.jpg'
          ]
        }
      ]
    }
  },
  computed: {
    filteredReviews() {
      if (this.currentFilter === 'all') return this.reviews;
      return this.reviews.filter(r => r.rating === this.currentFilter);
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');

.reviews-page {
  font-family: 'DM Sans', sans-serif;
  color: #1e293b;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-3d {
  background: #ffffff;
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-3d:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.08);
}

/* ── Header ────────────────────────────────────────────────── */
.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.rating-summary {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 24px;
}

.rating-number {
  font-size: 56px;
  font-weight: 800;
  color: #16a34a;
  line-height: 1;
}

.stars-outer {
  color: #fbbf24;
  display: flex;
  gap: 2px;
}

.stars-outer .material-icons { font-size: 24px; }

.total-reviews {
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
  font-weight: 500;
}

.rating-distribution {
  flex: 1;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.star-label {
  font-size: 13px;
  font-weight: 600;
  width: 32px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.star-label .material-icons { font-size: 14px; color: #fbbf24; }

.progress-container {
  flex: 1;
  height: 8px;
  background: #f1f5f9;
  border-radius: 100px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #16a34a;
  border-radius: 100px;
}

.count-label {
  font-size: 13px;
  color: #64748b;
  width: 32px;
  text-align: right;
}

/* ── Filters ────────────────────────────────────────────────── */
.filters-row {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-group {
  display: flex;
  gap: 8px;
}

.filter-pill {
  padding: 8px 16px;
  border-radius: 100px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.filter-pill:hover { background: #f8fafc; border-color: #cbd5e1; }
.filter-pill.active {
  background: #16a34a;
  color: #fff;
  border-color: #16a34a;
}

.badge {
  background: rgba(0,0,0,0.1);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}

.sort-select {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  font-weight: 500;
  outline: none;
}

/* ── Review Cards ─────────────────────────────────────────── */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.gradient-avatar {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: linear-gradient(135deg, #16a34a, #22c55e);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);
}

.user-details { flex: 1; }
.user-name { font-size: 16px; font-weight: 700; margin: 0; }
.review-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #64748b;
  margin-top: 2px;
}

.club-tag {
  background: #f1f5f9;
  padding: 0 8px;
  border-radius: 4px;
  font-weight: 600;
  color: #475569;
}

.review-rating-stars { display: flex; gap: 2px; }
.review-rating-stars .material-icons { font-size: 18px; color: #e2e8f0; }
.review-rating-stars .material-icons.active { color: #fbbf24; }

.review-content { font-size: 15px; line-height: 1.6; color: #475569; }

.review-images {
  display: flex;
  gap: 12px;
}

.img-wrapper {
  width: 120px;
  height: 90px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.img-wrapper img { width: 100%; height: 100%; object-fit: cover; }

.review-actions {
  border-top: 1px solid #f1f5f9;
  padding-top: 16px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.action-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

.action-btn:hover { background: #f8fafc; color: #16a34a; }
.action-btn .material-icons { font-size: 18px; }

.like-counter {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}

.like-counter .material-icons { font-size: 18px; color: #16a34a; }

@media (max-width: 768px) {
  .reviews-header { flex-direction: column; align-items: flex-start; }
  .rating-distribution { max-width: 100%; }
  .filters-row { flex-direction: column; gap: 16px; align-items: flex-start; }
}
</style>
