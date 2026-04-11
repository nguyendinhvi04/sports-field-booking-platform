<template>
  <div class="bg-white shadow-sm vdp-panel-container">
    <div v-if="reviews.length > 0" class="vdp-rv-summary px-4 pt-4 pb-3 border-bottom">
      <div class="row align-items-center g-4">
        <div class="col-auto">
          <div class="text-center" style="min-width:90px">
            <div class="vdp-rv-score__num">{{ avgRating.toFixed(1) }}</div>
            <div class="d-flex justify-content-center gap-1 my-1">
              <span v-for="s in 5" :key="s" style="font-size:17px;" :style="{color:s<=Math.round(avgRating)?'#f59e0b':'#e2e8f0'}">★</span>
            </div>
            <div class="text-muted small">{{ reviews.length }} đánh giá</div>
          </div>
        </div>
        <div class="col">
          <div v-for="star in [5,4,3,2,1]" :key="star" class="d-flex align-items-center gap-2 mb-1">
            <span class="text-muted small fw-semibold" style="width:14px;text-align:right;flex-shrink:0">{{ star }}</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" style="flex-shrink:0"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <div class="vdp-rv-bar flex-grow-1"><div class="vdp-rv-bar__fill" :style="{width:ratingPercent(star)+'%'}"></div></div>
            <span class="text-muted small" style="width:22px;flex-shrink:0;text-align:right">{{ ratingCount(star) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 pt-4 pb-4 border-bottom">
      <div v-if="reviewAuthState === 'idle'">
        <h6 class="fw-black mb-1" style="font-size:15px">Viết đánh giá của bạn</h6>
        <p class="text-muted small mb-3">Chỉ khách hàng đã đặt sân tại đây mới có thể đánh giá.</p>
        <div class="vdp-rv-auth-box p-4 rounded-3">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="vdp-rv-auth-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div>
              <div class="fw-bold small">Xác thực lịch sử đặt sân</div>
              <div class="text-muted" style="font-size:12px">Nhập số điện thoại bạn đã dùng khi đặt sân</div>
            </div>
          </div>
          <div class="d-flex gap-2">
            <input v-model="authPhone" type="tel" class="form-control form-control-sm flex-grow-1" placeholder="Nhập số điện thoại đã đặt sân..." @keyup.enter="checkBookingHistory"/>
            <button class="btn btn-success btn-sm fw-bold px-3" :disabled="!authPhone" @click="checkBookingHistory">Xác nhận</button>
          </div>
        </div>
      </div>

      <div v-else-if="reviewAuthState === 'verified'">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <h6 class="fw-black mb-0" style="font-size:15px">Viết đánh giá của bạn</h6>
          <div class="vdp-rv-verified-badge d-flex align-items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Đã xác thực · {{ authPhone }}
            <button class="vdp-rv-verified-reset" @click="resetAuth" title="Đổi số khác">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label small fw-bold mb-2">Chất lượng sân <span class="text-danger">*</span></label>
          <div class="d-flex align-items-center gap-1">
            <button v-for="s in 5" :key="s" class="vdp-star-btn" :class="{'vdp-star-btn--filled':s<=(reviewHover||reviewForm.rating)}" @mouseenter="reviewHover=s" @mouseleave="reviewHover=0" @click="reviewForm.rating=s">★</button>
            <span class="ms-2 small fw-bold" :style="{color:reviewForm.rating?'#f59e0b':'#94a3b8'}">{{ ['','Tệ','Không tốt','Bình thường','Tốt','Xuất sắc 🎉'][reviewForm.rating||0]||'Chọn số sao' }}</span>
          </div>
        </div>
        <div class="row g-2 mb-2">
          <div class="col-md-6">
            <label class="form-label small fw-bold mb-1">Họ tên <span class="text-danger">*</span></label>
            <input v-model="reviewForm.author" type="text" class="form-control form-control-sm" placeholder="Nguyễn Văn A"/>
          </div>
          <div class="col-md-6">
            <label class="form-label small fw-bold mb-1">Tiêu đề <span class="text-muted fw-normal">(tuỳ chọn)</span></label>
            <input v-model="reviewForm.title" type="text" class="form-control form-control-sm" placeholder="Sân đẹp, dịch vụ tốt..."/>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label small fw-bold mb-1">Nội dung <span class="text-danger">*</span></label>
            <textarea v-model="reviewForm.content" class="form-control form-control-sm" rows="3" placeholder="Chia sẻ trải nghiệm về chất lượng sân, dịch vụ, mặt cỏ..."></textarea>
        </div>
        <div class="mb-4">
          <label class="form-label small fw-bold mb-2">Đính kèm hình ảnh <span class="text-muted fw-normal">(tối đa 5 ảnh)</span></label>
          <div class="d-flex flex-wrap gap-2 align-items-center">
            <div v-for="(img,i) in reviewForm.images" :key="i" class="vdp-rv-imgprev position-relative rounded-3 overflow-hidden flex-shrink-0" style="width:76px;height:76px;">
              <img :src="img" style="width:100%;height:100%;object-fit:cover;display:block;"/>
              <button class="vdp-rv-imgprev__rm" @click="removeReviewImage(i)">×</button>
            </div>
            <label v-if="reviewForm.images.length<5" class="vdp-rv-addimg d-flex flex-column align-items-center justify-content-center rounded-3 flex-shrink-0" style="width:76px;height:76px;cursor:pointer;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/><line x1="14" y1="8" x2="14" y2="14"/><line x1="11" y1="11" x2="17" y2="11"/></svg>
              <span style="font-size:10px;color:#94a3b8;margin-top:4px;font-weight:600">Thêm ảnh</span>
              <input type="file" accept="image/*" multiple class="d-none" @change="handleReviewImages"/>
            </label>
          </div>
        </div>
        <div class="d-flex justify-content-end">
          <button class="btn btn-success fw-bold px-5" :disabled="!reviewForm.rating||!reviewForm.author||!reviewForm.content" @click="submitReview">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="me-2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Gửi đánh giá
          </button>
        </div>
      </div>

      <div v-else-if="reviewAuthState === 'denied'">
        <div class="vdp-rv-locked-box p-4 rounded-3 text-center">
          <div class="vdp-rv-locked-icon mx-auto mb-3">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>
          </div>
          <h6 class="fw-black mb-1">Bạn chưa có lịch sử đặt sân</h6>
          <p class="text-muted small mb-3">Số điện thoại <strong>{{ authPhone }}</strong> chưa từng đặt sân tại đây.<br>Chỉ khách hàng đã đặt sân mới được để lại đánh giá.</p>
          <div class="d-flex gap-2 justify-content-center flex-wrap">
            <button class="btn btn-success btn-sm fw-bold px-4" @click="$emit('switch-to-booking')">Đặt sân ngay →</button>
            <button class="btn btn-outline-secondary btn-sm" @click="resetAuth">Thử số khác</button>
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 py-4">
      <div v-if="reviews.length===0" class="text-center py-5 text-muted">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" class="d-block mx-auto mb-3"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <p class="mb-0 fw-semibold">Chưa có đánh giá nào.</p>
        <p class="small mt-1">Hãy là người đầu tiên chia sẻ trải nghiệm!</p>
      </div>
      <div v-else>
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h6 class="fw-black mb-0">{{ reviews.length }} đánh giá</h6>
          <select class="form-select form-select-sm w-auto" v-model="reviewSort" style="font-size:12px;border-radius:8px;border-color:#e2e8f0;font-weight:600">
            <option value="newest">Mới nhất</option>
            <option value="highest">Điểm cao nhất</option>
            <option value="lowest">Điểm thấp nhất</option>
          </select>
        </div>
        <div v-for="rv in sortedReviews" :key="rv.id" class="vdp-rv-card mb-3 p-4 rounded-3">
          <div class="d-flex align-items-start gap-3">
            <div class="vdp-rv-avatar flex-shrink-0">{{ rv.author.charAt(0).toUpperCase() }}</div>
            <div class="flex-grow-1" style="min-width:0">
              <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
                <div class="d-flex align-items-center gap-2 flex-wrap">
                  <span class="fw-bold small">{{ rv.author }}</span>
                  <span class="vdp-rv-verified-tag">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Đã đặt sân
                  </span>
                  <span class="text-muted small">· {{ rv.date }}</span>
                </div>
                <div class="d-flex gap-1">
                  <span v-for="s in 5" :key="s" style="font-size:15px;" :style="{color:s<=rv.rating?'#f59e0b':'#e2e8f0'}">★</span>
                </div>
              </div>
              <div v-if="rv.title" class="fw-semibold mb-1" style="font-size:13.5px;color:#0f172a">{{ rv.title }}</div>
              <p class="text-muted mb-2" style="font-size:13px;line-height:1.7">{{ rv.content }}</p>
              <div v-if="rv.images&&rv.images.length" class="d-flex flex-wrap gap-2 mt-2 mb-2">
                <div v-for="(img,i) in rv.images" :key="i" class="vdp-rv-photo rounded-3 overflow-hidden" @click="openLightbox(rv.images,i)">
                  <img :src="img" style="width:100%;height:100%;object-fit:cover;display:block;"/>
                </div>
              </div>
              <button class="vdp-rv-like-btn" @click="likeReview(rv)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                Hữu ích{{ rv.likes>0?` (${rv.likes})`:'' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VenueReviewTab',
  data() {
    return {
      reviewAuthState: 'idle',
      authPhone: '',
      bookedPhones: [],
      reviewHover: 0,
      reviewSort: 'newest',
      reviewForm: { rating: 0, author: '', title: '', content: '', images: [] },
      reviews: []
    }
  },
  computed: {
    avgRating() { return this.reviews.length?this.reviews.reduce((s,r)=>s+r.rating,0)/this.reviews.length:0; },
    sortedReviews() {
      const r=[...this.reviews];
      if(this.reviewSort==='highest')r.sort((a,b)=>b.rating-a.rating);
      else if(this.reviewSort==='lowest')r.sort((a,b)=>a.rating-b.rating);
      else r.sort((a,b)=>b.id-a.id);
      return r;
    }
  },
  methods: {
    checkBookingHistory() {
      const phone = this.authPhone.trim().replace(/\s/g,'');
      if(!phone) return;
      const normalize = p => p.replace(/[\s\-\.]/g,'');
      const matched = this.bookedPhones.some(p => normalize(p) === normalize(phone));
      this.reviewAuthState = matched ? 'verified' : 'denied';
    },
    resetAuth() { this.reviewAuthState='idle'; this.authPhone=''; },
    ratingCount(star)   { return this.reviews.filter(r=>r.rating===star).length; },
    ratingPercent(star) { return this.reviews.length?Math.round((this.ratingCount(star)/this.reviews.length)*100):0; },
    handleReviewImages(e) {
      const files=Array.from(e.target.files).slice(0,5-this.reviewForm.images.length);
      files.forEach(f=>{const reader=new FileReader();reader.onload=ev=>{if(this.reviewForm.images.length<5)this.reviewForm.images.push(ev.target.result);};reader.readAsDataURL(f);});
      e.target.value='';
    },
    removeReviewImage(i) { this.reviewForm.images.splice(i,1); },
    submitReview() {
      if(!this.reviewForm.rating||!this.reviewForm.author||!this.reviewForm.content)return;
      const now=new Date();
      this.reviews.unshift({id:Date.now(),author:this.reviewForm.author,rating:this.reviewForm.rating,title:this.reviewForm.title||null,content:this.reviewForm.content,images:[...this.reviewForm.images],date:`${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`,likes:0});
      this.reviewForm={rating:0,author:'',title:'',content:'',images:[]};
      this.reviewAuthState='idle';
      this.authPhone='';
    },
    likeReview(rv) { rv.likes++; },
    openLightbox(images,index) { 
        this.$emit('open-lightbox', {images, index});
    }
  }
}
</script>
