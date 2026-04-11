<template>
  <div class="checkout-page">
    <LoadingView v-if="isProcessing" />

    <!-- HEADER BREADCRUMB -->
    <div class="chk-header">
      <div class="container">
        <div class="d-flex align-items-center gap-2 chk-breadcrumb">
          <button class="chk-back-btn" @click="$router.back()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span class="text-muted small">Đặt sân</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span class="small fw-bold text-dark">Thanh toán</span>
        </div>
        <div class="chk-progress mt-3">
          <div class="chk-step chk-step--done">
            <div class="chk-step__circle">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span>Chọn sân</span>
          </div>
          <div class="chk-step__line chk-step__line--done"></div>
          <div class="chk-step chk-step--active">
            <div class="chk-step__circle">2</div>
            <span>Thanh toán</span>
          </div>
          <div class="chk-step__line"></div>
          <div class="chk-step">
            <div class="chk-step__circle">3</div>
            <span>Xác nhận</span>
          </div>
        </div>
      </div>
    </div>

    <div class="container chk-main">

      <!-- SUCCESS SCREEN -->
      <transition name="fade">
        <div v-if="bookingSuccess" class="chk-success">
          <div class="chk-success__card">
            <div :class="['chk-success__anim', { 'chk-success__anim--confirmed': paymentConfirmed }]">
              <div class="chk-success__ring"></div>
              <div class="chk-success__icon">
                <svg v-if="paymentConfirmed || !['bank', 'momo'].includes(payMethod)" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <svg v-else width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
            </div>
            <h2 class="fw-black mt-4 mb-1">
              <template v-if="paymentConfirmed">Thanh toán thành công! 🎉</template>
              <template v-else-if="['bank', 'momo'].includes(payMethod)">Đang chờ admin kiểm tra! ⏳</template>
              <template v-else>Đặt sân thành công! 🎉</template>
            </h2>
            <p class="text-muted mb-4">
              <template v-if="paymentConfirmed">
                Thanh toán đã được xác nhận. Đơn đặt sân đã hoàn tất. Thông tin đã được gửi đến <strong>{{ bookingInfo.phone }}</strong>.
              </template>
              <template v-else-if="['bank', 'momo'].includes(payMethod)">
                Vui lòng chờ admin kiểm tra và xác nhận thanh toán. Chỉ khi thanh toán thành công, đơn đặt sân mới được ghi nhận. Cập nhật sẽ được thông báo qua <strong>{{ bookingInfo.phone }}</strong>.
              </template>
              <template v-else>
                Đơn đặt sân đã được xác nhận. Thông tin đã được gửi đến <strong>{{ bookingInfo.phone }}</strong>.
              </template>
            </p>
            <div class="chk-success__code">
              <span class="text-muted small">Mã đặt sân</span>
              <strong class="fs-4">{{ bookingCode }}</strong>
            </div>
            <div class="chk-success__summary mt-4 text-start">
              <div class="d-flex justify-content-between py-2 border-bottom"><span class="text-muted small">Sân</span><span class="fw-bold small">{{ bookingInfo.venue_name }}</span></div>
              <div class="d-flex justify-content-between py-2 border-bottom"><span class="text-muted small">Loại sân</span><span class="fw-bold small">{{ courtNamesSummary }}</span></div>
              <div class="d-flex justify-content-between py-2 border-bottom"><span class="text-muted small">Ngày</span><span class="fw-bold small">{{ formattedDate }}</span></div>
              <div class="d-flex justify-content-between py-2 border-bottom"><span class="text-muted small">Khung giờ</span><span class="fw-bold small" style="text-align:right;max-width:60%">{{ slotsSummary }}</span></div>
              <div class="d-flex justify-content-between py-2"><span class="text-muted small">Tổng tiền</span><span class="fw-black text-success">{{ formatPrice(bookingInfo.total) }} đ</span></div>
            </div>
            <div class="d-flex gap-3 mt-4 flex-wrap justify-content-center">
              <button class="btn btn-success fw-bold px-4" @click="$router.push('/')">Về trang chủ</button>
              <button class="btn btn-outline-secondary fw-bold px-4" @click="printConfirmation">In xác nhận</button>
            </div>
          </div>
        </div>
      </transition>

      <!-- MAIN CHECKOUT -->
      <div v-if="!bookingSuccess" class="row g-4">

        <!-- LEFT -->
        <div class="col-lg-7">

          <!-- THÔNG TIN ĐẶT SÂN -->
          <div class="chk-card mb-4">
            <div class="chk-card__header">
              <div class="chk-card__icon chk-card__icon--green">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <span>Thông tin đặt sân</span>
              <!-- Badge số sân -->
              <span v-if="bookingInfo.courts.length > 1" class="ms-auto badge bg-success rounded-pill" style="font-size:11px">{{ bookingInfo.courts.length }} sân</span>
            </div>
            <div class="chk-card__body">
              <div class="chk-booking-banner">
                <div class="chk-booking-banner__left">
                  <div class="chk-booking-banner__venue">{{ bookingInfo.venue_name }}</div>
                  <!-- Hiển thị tất cả sân đã đặt -->
                  <div class="d-flex flex-wrap gap-2 mb-2">
                    <div v-for="court in bookingInfo.courts" :key="court.id" class="chk-booking-banner__court">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/></svg>
                      {{ court.name }}
                    </div>
                  </div>
                  <div class="chk-booking-banner__meta">
                    <span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {{ formattedDate }}
                    </span>
                    <span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {{ parsedSlots.length }} khung giờ
                    </span>
                  </div>
                </div>
                <div class="chk-booking-banner__badge">⚽</div>
              </div>

              <!-- Chi tiết khung giờ — group theo từng sân -->
              <div v-if="parsedSlots.length" class="mt-3">
                <div class="chk-slots-title">Chi tiết khung giờ</div>
                <template v-for="court in bookingInfo.courts" :key="court.id">
                  <div v-if="slotsByCourt(court.id).length">
                    <!-- Header tên sân -->
                    <div class="chk-court-label mt-2 mb-1">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/></svg>
                      {{ court.name }}
                    </div>
                    <div class="chk-slots-list">
                      <div v-for="(slot, i) in slotsByCourt(court.id)" :key="i" class="chk-slot-row">
                        <div class="chk-slot-row__time">{{ slot.time }}</div>
                        <div class="chk-slot-row__price">{{ formatPrice(slot.price) }} đ</div>
                      </div>
                      <!-- Subtotal sân này -->
                      <div class="chk-slot-row chk-slot-row--subtotal">
                        <div class="chk-slot-row__time text-muted" style="font-size:11px">Cộng {{ court.name }}</div>
                        <div class="chk-slot-row__price" style="font-size:12px">{{ formatPrice(courtSubtotal(court.id)) }} đ</div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>

              <!-- Dịch vụ thêm -->
              <div v-if="parsedServices.length" class="mt-3">
                <div class="chk-slots-title">Dịch vụ thêm</div>
                <div class="chk-slots-list">
                  <div v-for="svc in parsedServices" :key="svc.id" class="chk-slot-row">
                    <div class="chk-slot-row__time">{{ svc.name }}</div>
                    <div class="chk-slot-row__price">{{ formatPrice(svc.price) }} đ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- THÔNG TIN KHÁCH HÀNG — READ-ONLY -->
          <div class="chk-card mb-4">
            <div class="chk-card__header">
              <div class="chk-card__icon chk-card__icon--blue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <span>Thông tin khách hàng</span>
              <div class="chk-readonly-badge ms-auto">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Không thể chỉnh sửa
              </div>
            </div>
            <div class="chk-card__body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="chk-label">Họ và tên</label>
                  <div class="chk-readonly-field">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>{{ bookingInfo.name || '—' }}</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="chk-label">Số điện thoại</label>
                  <div class="chk-readonly-field">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.22 6.22l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>
                    <span>{{ bookingInfo.phone || '—' }}</span>
                  </div>
                </div>
                <div v-if="bookingInfo.email" class="col-md-6">
                  <label class="chk-label">Email</label>
                  <div class="chk-readonly-field">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <span>{{ bookingInfo.email }}</span>
                  </div>
                </div>
                <div v-if="bookingInfo.note" class="col-md-6">
                  <label class="chk-label">Ghi chú</label>
                  <div class="chk-readonly-field">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span>{{ bookingInfo.note }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- PHƯƠNG THỨC THANH TOÁN -->
          <div class="chk-card mb-4">
            <div class="chk-card__header">
              <div class="chk-card__icon chk-card__icon--purple">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </div>
              <span>Phương thức thanh toán</span>
            </div>
            <div class="chk-card__body">
              <div class="chk-pay-methods">

                <!-- Chuyển khoản ngân hàng -->
                <div :class="['chk-pay-method', {active: payMethod==='bank'}]" @click="payMethod='bank'">
                  <div class="chk-pay-method__radio"><div class="chk-radio-dot" v-if="payMethod==='bank'"></div></div>
                  <div class="chk-pay-method__icon" style="background:#eff6ff">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1.8"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M8 10v11M12 10v11M16 10v11M20 10v11"/></svg>
                  </div>
                  <div class="flex-grow-1">
                    <div class="fw-bold small">Chuyển khoản ngân hàng</div>
                    <div class="text-muted" style="font-size:11px">VietcomBank, BIDV, Techcombank...</div>
                  </div>
                  <span class="chk-pay-badge chk-pay-badge--blue">Phổ biến</span>
                </div>
                <transition name="slide-down">
                  <div v-if="payMethod==='bank'" class="chk-pay-detail">
                    <div class="chk-bank-qr-wrap">
                      <div class="chk-bank-qr">
                        <svg viewBox="0 0 200 200" width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                          <rect width="200" height="200" fill="white"/>
                          <rect x="10" y="10" width="60" height="60" rx="4" fill="none" stroke="#0f172a" stroke-width="7"/>
                          <rect x="25" y="25" width="30" height="30" rx="2" fill="#0f172a"/>
                          <rect x="130" y="10" width="60" height="60" rx="4" fill="none" stroke="#0f172a" stroke-width="7"/>
                          <rect x="145" y="25" width="30" height="30" rx="2" fill="#0f172a"/>
                          <rect x="10" y="130" width="60" height="60" rx="4" fill="none" stroke="#0f172a" stroke-width="7"/>
                          <rect x="25" y="145" width="30" height="30" rx="2" fill="#0f172a"/>
                          <rect x="90" y="10" width="10" height="10" fill="#0f172a"/><rect x="105" y="10" width="10" height="10" fill="#0f172a"/>
                          <rect x="90" y="25" width="10" height="10" fill="#0f172a"/><rect x="105" y="40" width="10" height="10" fill="#0f172a"/>
                          <rect x="10" y="90" width="10" height="10" fill="#0f172a"/><rect x="25" y="90" width="10" height="10" fill="#0f172a"/>
                          <rect x="55" y="90" width="10" height="10" fill="#0f172a"/>
                          <rect x="90" y="90" width="10" height="10" fill="#0f172a"/><rect x="105" y="90" width="10" height="10" fill="#0f172a"/>
                          <rect x="120" y="90" width="10" height="10" fill="#0f172a"/><rect x="150" y="90" width="10" height="10" fill="#0f172a"/>
                          <rect x="165" y="90" width="10" height="10" fill="#0f172a"/><rect x="180" y="90" width="10" height="10" fill="#0f172a"/>
                          <rect x="90" y="105" width="10" height="10" fill="#0f172a"/><rect x="120" y="105" width="10" height="10" fill="#0f172a"/>
                          <rect x="90" y="120" width="10" height="10" fill="#0f172a"/><rect x="105" y="120" width="10" height="10" fill="#0f172a"/>
                          <rect x="135" y="120" width="10" height="10" fill="#0f172a"/><rect x="165" y="120" width="10" height="10" fill="#0f172a"/>
                          <rect x="90" y="135" width="10" height="10" fill="#0f172a"/><rect x="120" y="135" width="10" height="10" fill="#0f172a"/>
                          <rect x="90" y="150" width="10" height="10" fill="#0f172a"/><rect x="105" y="150" width="10" height="10" fill="#0f172a"/>
                          <rect x="135" y="150" width="10" height="10" fill="#0f172a"/>
                          <rect x="90" y="165" width="10" height="10" fill="#0f172a"/><rect x="120" y="165" width="10" height="10" fill="#0f172a"/>
                          <rect x="90" y="180" width="10" height="10" fill="#0f172a"/><rect x="150" y="180" width="10" height="10" fill="#0f172a"/>
                        </svg>
                        <div class="chk-bank-qr__label">Quét để chuyển khoản nhanh</div>
                      </div>
                      <div class="chk-bank-info">
                        <div class="chk-bank-row">
                          <span class="chk-bank-row__label">Ngân hàng</span>
                          <span class="chk-bank-row__value fw-bold">VietcomBank</span>
                        </div>
                        <div class="chk-bank-row">
                          <span class="chk-bank-row__label">Tên TK</span>
                          <span class="chk-bank-row__value fw-bold">CTY TNHH THÀNH PHÁT</span>
                        </div>
                        <div class="chk-bank-row">
                          <span class="chk-bank-row__label">Số TK</span>
                          <div class="d-flex align-items-center gap-2">
                            <span class="chk-bank-row__value fw-black" style="letter-spacing:1px">1023 9876 5432</span>
                            <button class="chk-copy-btn" @click="copyText('102398765432','acc')" :class="{copied: copiedField==='acc'}">
                              <svg v-if="copiedField!=='acc'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                              <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                            </button>
                          </div>
                        </div>
                        <div class="chk-bank-row chk-bank-row--highlight">
                          <span class="chk-bank-row__label">Nội dung CK</span>
                          <div class="d-flex align-items-center gap-2">
                            <span class="chk-bank-row__value fw-black text-success">{{ transferContent }}</span>
                            <button class="chk-copy-btn" @click="copyText(transferContent,'content')" :class="{copied: copiedField==='content'}">
                              <svg v-if="copiedField!=='content'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                              <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                            </button>
                          </div>
                        </div>
                        <div class="chk-bank-row">
                          <span class="chk-bank-row__label">Số tiền</span>
                          <span class="chk-bank-row__value fw-black text-success fs-6">{{ formatPrice(bookingInfo.total) }} đ</span>
                        </div>
                      </div>
                    </div>
                    <div class="chk-note chk-note--amber mt-3">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      Vui lòng chuyển khoản trong vòng <strong>5 phút</strong>. Sân sẽ được xác nhận sau khi nhận được thanh toán.
                    </div>
                  </div>
                </transition>

                <!-- MoMo -->
                <div :class="['chk-pay-method', {active: payMethod==='momo'}]" @click="payMethod='momo'">
                  <div class="chk-pay-method__radio"><div class="chk-radio-dot" v-if="payMethod==='momo'"></div></div>
                  <div class="chk-pay-method__icon" style="background:#fdf2f8">
                    <svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#ae2070"/><text x="12" y="16.5" text-anchor="middle" fill="white" font-size="8" font-weight="bold" font-family="sans-serif">MoMo</text></svg>
                  </div>
                  <div class="flex-grow-1">
                    <div class="fw-bold small">Ví MoMo</div>
                    <div class="text-muted" style="font-size:11px">Thanh toán qua ứng dụng MoMo</div>
                  </div>
                  <span class="chk-pay-badge chk-pay-badge--pink">Nhanh nhất</span>
                </div>
                <transition name="slide-down">
                  <div v-if="payMethod==='momo'" class="chk-pay-detail chk-pay-detail--momo">
                    <div style="font-size:44px;line-height:1;margin-bottom:10px">📱</div>
                    <p class="fw-bold mb-1">Thanh toán tự động qua MoMo</p>
                    <p class="text-muted small mb-3">Bạn sẽ được chuyển đến ứng dụng MoMo để hoàn tất thanh toán an toàn.</p>
                    <div class="chk-momo-amount">{{ formatPrice(bookingInfo.total) }} đ</div>
                    <div class="chk-note chk-note--pink mt-3" style="border-color:#fbcfe8;background:#fff1f2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#be185d" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      Xác nhận tức thì sau khi thanh toán thành công.
                    </div>
                  </div>
                </transition>

                <!-- VNPAY -->
                <div :class="['chk-pay-method', {active: payMethod==='vnpay'}]" @click="payMethod='vnpay'">
                  <div class="chk-pay-method__radio"><div class="chk-radio-dot" v-if="payMethod==='vnpay'"></div></div>
                  <div class="chk-pay-method__icon" style="background:#fff7ed">
                    <svg width="22" height="22" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#e03131"/><text x="12" y="15.5" text-anchor="middle" fill="white" font-size="6.5" font-weight="bold" font-family="sans-serif">VNPay</text></svg>
                  </div>
                  <div class="flex-grow-1">
                    <div class="fw-bold small">VNPAY-QR</div>
                    <div class="text-muted" style="font-size:11px">Quét mã qua app ngân hàng bất kỳ</div>
                  </div>
                </div>
                <transition name="slide-down">
                  <div v-if="payMethod==='vnpay'" class="chk-pay-detail">
                    <div class="d-flex align-items-center gap-4 flex-wrap">
                      <div class="text-center flex-shrink-0">
                        <svg viewBox="0 0 160 160" width="110" height="110" xmlns="http://www.w3.org/2000/svg">
                          <rect width="160" height="160" fill="white" rx="8"/>
                          <rect x="8" y="8" width="48" height="48" rx="4" fill="none" stroke="#e03131" stroke-width="6"/>
                          <rect x="20" y="20" width="24" height="24" rx="2" fill="#e03131"/>
                          <rect x="104" y="8" width="48" height="48" rx="4" fill="none" stroke="#e03131" stroke-width="6"/>
                          <rect x="116" y="20" width="24" height="24" rx="2" fill="#e03131"/>
                          <rect x="8" y="104" width="48" height="48" rx="4" fill="none" stroke="#e03131" stroke-width="6"/>
                          <rect x="20" y="116" width="24" height="24" rx="2" fill="#e03131"/>
                          <rect x="72" y="8" width="8" height="8" fill="#e03131"/><rect x="84" y="8" width="8" height="8" fill="#e03131"/>
                          <rect x="72" y="20" width="8" height="8" fill="#e03131"/>
                          <rect x="72" y="72" width="8" height="8" fill="#e03131"/><rect x="84" y="72" width="8" height="8" fill="#e03131"/>
                          <rect x="96" y="72" width="8" height="8" fill="#e03131"/><rect x="108" y="72" width="8" height="8" fill="#e03131"/>
                          <rect x="120" y="72" width="8" height="8" fill="#e03131"/><rect x="144" y="72" width="8" height="8" fill="#e03131"/>
                          <rect x="72" y="84" width="8" height="8" fill="#e03131"/><rect x="96" y="84" width="8" height="8" fill="#e03131"/>
                          <rect x="72" y="96" width="8" height="8" fill="#e03131"/><rect x="84" y="96" width="8" height="8" fill="#e03131"/>
                          <rect x="96" y="96" width="8" height="8" fill="#e03131"/><rect x="120" y="96" width="8" height="8" fill="#e03131"/>
                          <rect x="72" y="108" width="8" height="8" fill="#e03131"/><rect x="108" y="108" width="8" height="8" fill="#e03131"/>
                          <rect x="72" y="120" width="8" height="8" fill="#e03131"/><rect x="120" y="120" width="8" height="8" fill="#e03131"/>
                          <rect x="72" y="132" width="8" height="8" fill="#e03131"/><rect x="96" y="132" width="8" height="8" fill="#e03131"/>
                          <rect x="72" y="144" width="8" height="8" fill="#e03131"/><rect x="84" y="144" width="8" height="8" fill="#e03131"/>
                        </svg>
                        <div style="font-size:10px;color:#94a3b8;font-weight:600;margin-top:4px">Quét mã VNPAY-QR</div>
                      </div>
                      <div class="flex-grow-1">
                        <p class="fw-bold small mb-2">Hướng dẫn thanh toán</p>
                        <ol class="text-muted small ps-3 mb-0" style="line-height:2.1">
                          <li>Mở app ngân hàng bất kỳ hỗ trợ VNPAY</li>
                          <li>Chọn <strong>Quét mã QR</strong></li>
                          <li>Quét mã và xác nhận số tiền</li>
                          <li>Nhập mã PIN / xác thực sinh trắc học</li>
                        </ol>
                        <div class="chk-note chk-note--red mt-2">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                          Số tiền: <strong>{{ formatPrice(bookingInfo.total) }} đ</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </transition>

                <!-- Thẻ quốc tế (Stripe) -->
                <div :class="['chk-pay-method', {active: payMethod==='card'}]" @click="payMethod='card'">
                  <div class="chk-pay-method__radio"><div class="chk-radio-dot" v-if="payMethod==='card'"></div></div>
                  <div class="chk-pay-method__icon" style="background:#f5f3ff">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="1.8"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  </div>
                  <div class="flex-grow-1">
                    <div class="fw-bold small">Thẻ quốc tế</div>
                    <div class="d-flex align-items-center gap-2 mt-1">
                      <span class="chk-card-logo chk-card-logo--visa">VISA</span>
                      <span class="chk-card-logo chk-card-logo--mc">MC</span>
                      <span class="chk-card-logo chk-card-logo--jcb">JCB</span>
                    </div>
                  </div>
                  <span class="chk-pay-badge" style="background:#ede9fe;color:#7c3aed">Secure</span>
                </div>
                <transition name="slide-down">
                  <div v-if="payMethod==='card'" class="chk-pay-detail">
                    <div class="text-center py-2">
                      <div style="font-size:44px;line-height:1;margin-bottom:12px"></div>
                      <p class="fw-bold mb-1">Thanh toán an toàn qua Stripe</p>
                      <p class="text-muted small mb-3">Bạn sẽ được chuyển đến trang thanh toán bảo mật của Stripe để nhập thông tin thẻ.</p>
                      <div class="d-flex align-items-center justify-content-center gap-2 mb-3">
                        <span class="chk-card-logo chk-card-logo--visa" style="font-size:11px;padding:3px 8px">VISA</span>
                        <span class="chk-card-logo chk-card-logo--mc" style="font-size:11px;padding:3px 8px">Mastercard</span>
                        <span class="chk-card-logo chk-card-logo--jcb" style="font-size:11px;padding:3px 8px">JCB</span>
                        <span style="background:#f1f5f9;border-radius:4px;padding:3px 8px;font-size:11px;font-weight:600;color:#64748b">AMEX</span>
                      </div>
                      <div class="chk-momo-amount">{{ formatPrice(bookingInfo.total) }} đ</div>
                      <div class="chk-note mt-3" style="border-color:#e9d5ff;background:#faf5ff">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        Thông tin thẻ được mã hoá SSL 256-bit bởi Stripe. Chúng tôi không lưu trữ dữ liệu thẻ.
                      </div>
                    </div>
                  </div>
                </transition>

                <!-- Tiền mặt -->
                <div :class="['chk-pay-method', {active: payMethod==='cash'}]" @click="payMethod='cash'">
                  <div class="chk-pay-method__radio"><div class="chk-radio-dot" v-if="payMethod==='cash'"></div></div>
                  <div class="chk-pay-method__icon" style="background:#f0fdf4">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M2 10h2M20 10h2M2 14h2M20 14h2"/></svg>
                  </div>
                  <div class="flex-grow-1">
                    <div class="fw-bold small">Thanh toán tiền mặt tại sân</div>
                    <div class="text-muted" style="font-size:11px">Thanh toán khi đến sân</div>
                  </div>
                  <span class="chk-pay-badge chk-pay-badge--gray">Đơn giản</span>
                </div>
                <transition name="slide-down">
                  <div v-if="payMethod==='cash'" class="chk-pay-detail chk-pay-detail--cash">
                    <div class="d-flex align-items-start gap-3">
                      <div style="font-size:34px;flex-shrink:0">💵</div>
                      <div>
                        <p class="fw-bold small mb-1">Hướng dẫn thanh toán tiền mặt</p>
                        <ul class="text-muted small mb-0 ps-3" style="line-height:2.1">
                          <li>Sân sẽ giữ lịch trong <strong>5 phút</strong></li>
                          <li>Đến sân và báo mã đặt sân cho nhân viên</li>
                          <li>Thanh toán đủ số tiền: <strong class="text-success">{{ formatPrice(bookingInfo.total) }} đ</strong></li>
                          <li>Nhận biên nhận và vào sân thi đấu</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </transition>

              </div>
            </div>
          </div>

          <!-- ĐỒNG Ý -->
          <div class="chk-card mb-4">
            <div class="chk-card__body">
              <label class="chk-checkbox-wrap" @click="agreed=!agreed">
                <div :class="['chk-checkbox', {checked: agreed}]">
                  <svg v-if="agreed" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span class="small text-muted">Tôi đồng ý với <a href="#" class="text-success fw-bold text-decoration-none">Điều khoản dịch vụ</a> và <a href="#" class="text-success fw-bold text-decoration-none">Chính sách hoàn tiền</a> của sân bóng.</span>
              </label>
            </div>
          </div>

        </div>

        <!-- RIGHT: Summary sidebar -->
        <div class="col-lg-5">
          <div class="sticky-top" style="top:20px">

            <div class="chk-card mb-3">
              <div class="chk-card__header">
                <div class="chk-card__icon chk-card__icon--amber">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <span>Chi tiết đơn hàng</span>
              </div>
              <div class="chk-card__body">
                <!-- Breakdown từng sân -->
                <template v-for="court in bookingInfo.courts" :key="court.id">
                  <div v-if="slotsByCourt(court.id).length">
                    <div class="chk-sum-court-label">{{ court.name }}</div>
                    <div class="chk-sum-row">
                      <span>{{ slotsByCourt(court.id).length }} khung giờ</span>
                      <span>{{ formatPrice(courtSubtotal(court.id)) }} đ</span>
                    </div>
                  </div>
                </template>

                <div v-if="serviceTotal > 0" class="chk-sum-row mt-1">
                  <span>Dịch vụ thêm ({{ parsedServices.length }})</span>
                  <span>{{ formatPrice(serviceTotal) }} đ</span>
                </div>
                <div class="chk-duration-badge mt-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Thời lượng: <strong>{{ totalDuration }}</strong>
                </div>
                <div class="chk-divider mt-2"></div>
                
                <!-- Voucher Section -->
                <div class="mb-2">
                  <div class="chk-sum-row clickable" @click="showVoucherInput = !showVoucherInput" style="cursor: pointer; color: #198754; font-weight: 700; font-size: 13px">
                    <span class="d-flex align-items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 4h22v16H1z"/><path d="M1 10h22M1 14h22"/><path d="M7 4v16"/><path d="M17 4v16"/></svg>
                      {{ discount > 0 ? 'Đã áp dụng mã giảm giá' : 'Bạn có mã giảm giá?' }}
                    </span>
                    <svg :style="showVoucherInput ? 'transform:rotate(180deg)' : ''" style="transition:0.2s" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                  
                  <div v-if="showVoucherInput" class="mt-2">
                    <div class="input-group input-group-sm" style="border-radius: 8px; overflow: hidden; border: 1.5px solid #e2e8f0">
                      <input v-model="voucherInput" type="text" class="form-control border-0 shadow-none ps-2 fw-bold" placeholder="Nhập mã..." style="font-size: 13px">
                      <button class="btn btn-success border-0 fw-bold px-3" @click="applyVoucher" :disabled="!voucherInput" style="font-size: 11px">GỬI</button>
                    </div>
                    <div v-if="voucherError" class="text-danger small fw-bold mt-1" style="font-size: 11px">{{ voucherErrorMessage }}</div>
                    <div v-if="discount > 0" class="text-success small fw-bold mt-1 d-flex justify-content-between" style="font-size: 11px">
                      <span>Giảm giá:</span>
                      <span>-{{ formatPrice(discount) }} đ</span>
                    </div>
                  </div>
                </div>

                <div v-if="discount > 0" class="chk-divider mb-2"></div>
                <div class="chk-sum-row chk-sum-row--total">
                  <span>Tổng thanh toán</span>
                  <span class="text-success">{{ formatPrice(finalCalculatedTotal) }} đ</span>
                </div>
              </div>
            </div>

            <!-- Timer 5 phút -->
            <div class="chk-timer mb-3" :class="{'chk-timer--urgent': timerSeconds < 60}">
              <div class="chk-timer__icon">⏱</div>
              <div class="flex-grow-1">
                <div class="chk-timer__label">Thời gian giữ sân</div>
                <div class="chk-timer__time">{{ timerDisplay }}</div>
                <div class="chk-timer__sub" :class="timerSeconds < 60 ? 'text-danger' : 'text-muted'">
                  {{ timerSeconds < 60 ? 'Sắp hết hạn!' : 'Hoàn thành trước khi hết giờ' }}
                </div>
              </div>
              <div class="chk-timer__ring">
                <svg viewBox="0 0 36 36" width="48" height="48">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" stroke-width="3"/>
                  <circle cx="18" cy="18" r="15.9" fill="none"
                    :stroke="timerSeconds < 60 ? '#ef4444' : timerSeconds < 150 ? '#f59e0b' : '#22c55e'"
                    stroke-width="3" stroke-dasharray="100"
                    :stroke-dashoffset="100 - timerPercent"
                    stroke-linecap="round" transform="rotate(-90 18 18)"
                    style="transition:stroke-dashoffset 1s linear,stroke .5s"/>
                </svg>
              </div>
            </div>

            <!-- Error Banner -->
            <div v-if="errorMessage" class="alert alert-danger mb-3 p-2 text-center" style="font-size: 13px; font-weight: 600; border-radius: 8px; color: #b91c1c; background-color: #fef2f2; border: 1px solid #f87171;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="me-1" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ errorMessage }}
            </div>

            <button
              class="chk-cta-btn"
              :class="{'chk-cta-btn--disabled': !canSubmit, 'chk-cta-btn--loading': isProcessing}"
              :disabled="!canSubmit || isProcessing"
              @click="handleCheckout"
            >
              <span v-if="!isProcessing" class="d-flex align-items-center justify-content-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Xác nhận & Thanh toán
              </span>
              <span v-else class="d-flex align-items-center justify-content-center gap-2">
                <span class="chk-spinner"></span>
                Đang xử lý...
              </span>
            </button>
            <p v-if="!agreed" class="text-center text-muted mt-2 mb-0" style="font-size:11px">Vui lòng đồng ý với điều khoản dịch vụ</p>
            <p v-if="payMethod==='card' && !isCardValid" class="text-center text-muted mt-2 mb-0" style="font-size:11px">Vui lòng điền đầy đủ thông tin thẻ</p>
            <p class="text-center text-muted mt-2 mb-0" style="font-size:11px">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Thanh toán được mã hoá SSL 256-bit
            </p>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { bookingService } from '@/services/booking.service.js';
import { socketService } from '@/services/socket.service.js';
import { voucherService } from '@/services/voucher.service.js';
import LoadingView from "@/components/common/LoadingView.vue";
import '@/assets/checkout.css';

export default {
  name: 'CheckoutView',
  components: { LoadingView },

  data() {
    return {
      payMethod: 'bank',
      agreed: false,
      isProcessing: false,
      bookingSuccess: false,
      bookingCode: '',
      copiedField: '',
      cardFlipped: false,
      cardForm: { number: '', expiry: '', cvc: '', holder: '' },
      timerSeconds: 300,
      timerInterval: null,
      errorMessage: '',
      paymentConfirmed: false,
      currentBookingId: null,
      pollingInterval: null,
      showVoucherInput: false,
      voucherInput: '',
      discount: 0,
      voucherError: false,
      voucherErrorMessage: '',
      bookingInfo: {
        club_id: '',
        club_slug: '',
        venue_name: '',
        courts: [],
        date: new Date().toISOString().split('T')[0],
        slots: '[]',
        time_slot_ids: '[]',
        services: '[]',
        total: 0,
        name: '',
        phone: '',
        email: '',
        note: '',
        voucher_code: '',
        base_total: 0, // Lưu giá trước giảm để tính lại nếu cần
      },
    };
  },

  computed: {
    parsedSlots() {
      try { return JSON.parse(this.bookingInfo.slots); } catch { return []; }
    },
    finalCalculatedTotal() {
      const base = this.bookingInfo.base_total || this.bookingInfo.total;
      return Math.max(0, base - this.discount);
    },

    parsedServices() {
      try {
        return JSON.parse(this.bookingInfo.services);
      } catch { return []; }
    },

    // ── FIX: tên tất cả sân gộp lại ──
    courtNamesSummary() {
      if (!this.bookingInfo.courts.length) return '—';
      return this.bookingInfo.courts.map(c => c.name).join(', ');
    },

    formattedDate() {
      if (!this.bookingInfo.date) return '';
      const [y, m, d] = this.bookingInfo.date.split('-');
      return `${d}/${m}/${y}`;
    },

    // ── FIX: slotsSummary group theo từng sân ──
    slotsSummary() {
      if (!this.parsedSlots.length) return '—';
      const byCourtMap = {};
      this.parsedSlots.forEach(s => {
        const key = s.courtName || s.courtId || 'Sân';
        if (!byCourtMap[key]) byCourtMap[key] = [];
        byCourtMap[key].push(s);
      });
      return Object.entries(byCourtMap).map(([courtName, slots]) => {
        const sorted = [...slots].sort((a, b) =>
          this.parseHour(a.time.split(' – ')[0]) - this.parseHour(b.time.split(' – ')[0])
        );
        const start = sorted[0].time.split(' – ')[0];
        const end   = sorted[sorted.length - 1].time.split(' – ')[1];
        return `${courtName}: ${start}–${end}`;
      }).join(' | ');
    },

    courtTotal()   { return this.parsedSlots.reduce((s, sl) => s + sl.price, 0); },
    serviceTotal() { return this.parsedServices.reduce((s, svc) => s + svc.price, 0); },

    totalDuration() {
      const mins = this.parsedSlots.length * 30;
      return mins >= 60
        ? `${Math.floor(mins / 60)} tiếng${mins % 60 ? ' ' + mins % 60 + 'p' : ''}`
        : `${mins} phút`;
    },

    transferContent() {
      return `DATSANH ${(this.bookingInfo.phone || '').replace(/\s/g, '') || 'SOPHONE'}`;
    },

    timerDisplay() {
      return `${String(Math.floor(this.timerSeconds / 60)).padStart(2, '0')}:${String(this.timerSeconds % 60).padStart(2, '0')}`;
    },
    timerPercent() { return Math.round((this.timerSeconds / 300) * 100); },

    formattedCardNumber() {
      if (!this.cardForm.number) return '•••• •••• •••• ••••';
      return this.cardForm.number.padEnd(16, '•').replace(/(.{4})/g, '$1 ').trim();
    },

    detectedCardType() {
      const n = this.cardForm.number.replace(/\s/g, '');
      if (/^4/.test(n))      return 'VISA';
      if (/^5[1-5]/.test(n)) return 'MC';
      if (/^3[47]/.test(n))  return 'AMEX';
      if (/^35/.test(n))     return 'JCB';
      return '';
    },

    isCardValid() {
      return this.cardForm.number.replace(/\s/g, '').length >= 16
        && this.cardForm.expiry.length === 5
        && this.cardForm.cvc.length >= 3
        && this.cardForm.holder.trim().length > 0;
    },

    canSubmit() {
      if (!this.agreed) return false;
      return true;
    },
  },

  async created() {
    this.checkAuth();
    
    let q = { ...this.$route.query };

    // Nếu URL không có dữ liệu (trống trơn), thử lấy từ sessionStorage
    if (!q.club_id && !q.success) {
      const stored = sessionStorage.getItem('pending_booking');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          q = { ...q, ...data };
        } catch (e) {
          console.error("Lỗi khi phục hồi dữ liệu từ sessionStorage:", e);
        }
      }
    }

    if (q.success === '1' && q.session_id) {
      // Stripe redirect back – verify the session
      this.isProcessing = true;
      this.bookingSuccess = true;
      try {
        const verifyRes = await bookingService.verifyStripeSession(q.session_id);
        if (verifyRes?.data?.bookingId) {
          this.bookingCode = verifyRes.data.bookingId;
          this.loadBookingFromServer(verifyRes.data.bookingId);
          this.startStatusPolling(verifyRes.data.bookingId);
        }
      } catch (err) {
        console.error("Stripe verify error:", err);
        this.errorMessage = "Không thể xác minh thanh toán thẻ. Vui lòng liên hệ hỗ trợ.";
        this.bookingSuccess = false;
      } finally {
        this.isProcessing = false;
      }
      sessionStorage.removeItem('pending_booking');
      return;
    }

    if (q.success === '1' && q.code) {
      this.bookingCode = q.code;
      this.bookingSuccess = true;
      this.loadBookingFromServer(q.code);
      this.startStatusPolling(q.code);
      // Xoá dữ liệu tạm sau khi đã checkout thành công (hoặc chờ xử lý)
      sessionStorage.removeItem('pending_booking');
      return;
    }

    // Freeze data vào state cục bộ
    this.bookingInfo = {
      club_id: q.club_id || '',
      club_slug: q.club_slug || '',
      venue_name: q.venue_name || '',
      courts: (() => { try { return typeof q.courts === 'string' ? JSON.parse(q.courts) : (q.courts || []); } catch { return []; } })(),
      date: q.date || new Date().toISOString().split('T')[0],
      slots: typeof q.slots === 'string' ? q.slots : JSON.stringify(q.slots || []),
      booking_slots: typeof q.booking_slots === 'string' ? q.booking_slots : JSON.stringify(q.booking_slots || []),
      time_slot_ids: typeof q.time_slot_ids === 'string' ? q.time_slot_ids : JSON.stringify(q.time_slot_ids || []),
      services: typeof q.services === 'string' ? q.services : JSON.stringify(q.services || []),
      total: Number(q.total) || 0,
      name: q.name || '',
      phone: q.phone || '',
      email: q.email || '',
      note: q.note || '',
      voucher_code: q.voucher_code || '',
    };

    // Lưu lại base_total để tính toán voucher
    this.bookingInfo.base_total = this.bookingInfo.total;

    // Tự động điền voucher nếu đã chọn ở trang trước
    if (this.bookingInfo.voucher_code) {
        this.voucherInput = this.bookingInfo.voucher_code;
        this.applyVoucher(); // Tự động áp dụng để tính toán lại discount
    }

    this.bookingCode = 'TP' + Date.now().toString(36).toUpperCase().slice(-6);
    this.startTimer();
  },
  beforeUnmount() {
    clearInterval(this.timerInterval);
    this.stopStatusPolling();
    // Dọn dẹp kết nối Socket khi rời trang
    if (this.currentBookingId) {
      socketService.offBookingStatusChanged();
      socketService.leaveBooking(this.currentBookingId);
      socketService.disconnect();
    }
  },

  methods: {
    checkAuth() {
      const token = localStorage.getItem("token");
      if (!token) {
        // Redirect to login if not logged in
        this.$router.push(`/auth/login?redirect=${encodeURIComponent(this.$route.fullPath)}`);
      }
    },

    formatPrice(v) { return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(v); },
    parseHour(t)   { const [h, m] = t.split(':').map(Number); return h + m / 60; },

    // ── FIX: lọc slots theo courtId ──
    slotsByCourt(courtId) {
      return this.parsedSlots.filter(s => s.courtId === courtId);
    },

    // ── FIX: subtotal từng sân ──
    courtSubtotal(courtId) {
      return this.slotsByCourt(courtId).reduce((s, sl) => s + sl.price, 0);
    },

    copyText(text, field) {
      navigator.clipboard?.writeText(text).catch(() => {});
      this.copiedField = field;
      setTimeout(() => { this.copiedField = ''; }, 2000);
    },

    startTimer() {
      this.timerInterval = setInterval(async () => {
        if (this.timerSeconds > 0) {
          this.timerSeconds--;
        } else {
          clearInterval(this.timerInterval);
          // Only cancel if there's a booking code and payment hasn't been confirmed
          if (this.bookingCode && !this.paymentConfirmed) {
            try {
              // Call API to release booking
              await bookingService.cancelBooking(this.bookingCode);
              
              // Disconnect from socket
              if (this.currentBookingId) {
                socketService.leaveBooking(this.currentBookingId);
                socketService.disconnect();
              }
            } catch (err) {
              console.error("Lỗi khi hủy booking hết hạn:", err);
            }
          }
          
          alert("Thời gian giữ sân đã hết hạn. Bạn sẽ được chuyển về trang sân bóng.");
          
          // Redirect back to venue or home
          const backUrl = this.bookingInfo.club_slug ? `/venue/${this.bookingInfo.club_slug}` : '/';
          this.$router.push(backUrl);
        }
      }, 1000);
    },

    formatCardNumber(e) {
      let v = e.target.value.replace(/\D/g, '').slice(0, 16);
      this.cardForm.number = v.replace(/(.{4})/g, '$1 ').trim();
    },

    formatExpiry(e) {
      let v = e.target.value.replace(/\D/g, '').slice(0, 4);
      if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
      this.cardForm.expiry = v;
    },

    async handleCheckout() {
      this.isProcessing = true;
      this.errorMessage = '';
      
      try {
        const paymentMap = {
          'bank': 'BANK_TRANSFER',
          'momo': 'MOMO',
          'vnpay': 'VNPAY',
          'card': 'CREDIT_CARD',
          'cash': 'CASH',
        };

        const payload = {
          clubId: this.bookingInfo.club_id,
          slots: (() => {
            try {
              return typeof this.bookingInfo.booking_slots === 'string' 
                ? JSON.parse(this.bookingInfo.booking_slots) 
                : (this.bookingInfo.booking_slots || []);
            } catch { return []; }
          })(),
          bookerName: this.bookingInfo.name,
          bookerPhone: this.bookingInfo.phone,
          bookerEmail: this.bookingInfo.email || undefined,
          note: this.bookingInfo.note || undefined,
          voucherCode: this.voucherInput.trim().toUpperCase() || undefined,
          paymentMethod: paymentMap[this.payMethod] || 'VNPAY',
          serviceIds: (() => {
            try {
              const svcs = typeof this.bookingInfo.services === 'string' 
                ? JSON.parse(this.bookingInfo.services) 
                : (this.bookingInfo.services || []);
              return svcs.map(s => s.id);
            } catch { return []; }
          })(),
        };

        const res = await bookingService.createBooking(payload);
        
        if (res && res.data) {
          this.bookingCode = res.data.booking.bookingCode;
          
          // Redirect to payment gateway if applicable
          if (res.data.paymentUrl) {
            window.location.href = res.data.paymentUrl;
          } else {
            // Khóa timer và đổi trạng thái
            this.bookingSuccess = true;
            clearInterval(this.timerInterval);

            // Lưu bookingId và kết nối Socket để lắng nghe khi owner xác nhận thanh toán
            if (res.data.booking?.id) {
              this.currentBookingId = res.data.booking.id;
              this.connectBookingSocket(res.data.booking.id);
              this.startStatusPolling(this.bookingCode);
            }
            
            // Cập nhật lại thanh địa chỉ URL để xóa toàn bộ rác (slots, courts...)
            this.$router.replace({ 
              path: '/checkout', 
              query: { 
                success: '1', 
                code: this.bookingCode,
                club_slug: this.bookingInfo.club_slug
              } 
            });
          }
        }
      } catch (err) {
        console.error("Checkout error:", err);
        this.errorMessage = err.response?.data?.message || err.message || "Đã xảy ra lỗi khi tạo đơn đặt sân. Vui lòng thử lại.";
      } finally {
        this.isProcessing = false;
      }
    },

    async applyVoucher() {
      if (!this.voucherInput.trim()) return;
      this.voucherError = false;
      this.voucherErrorMessage = '';
      
      const code = this.voucherInput.trim().toUpperCase();
      const clubId = this.bookingInfo.club_id;
      const baseAmount = this.courtSubtotalAll() + this.serviceTotal;

      try {
        const res = await voucherService.validateVoucher(code, clubId, baseAmount);
        if (res && res.data) {
          const v = res.data;
          if (v.type === 'PERCENTAGE') {
            let disc = baseAmount * (v.value / 100);
            if (v.maxDiscountAmount && disc > v.maxDiscountAmount) disc = v.maxDiscountAmount;
            this.discount = disc;
          } else {
            this.discount = v.value;
          }
          this.bookingInfo.voucher_code = code;
          this.showVoucherInput = true;
        }
      } catch (err) {
        console.error("Voucher validation error:", err);
        this.voucherError = true;
        this.voucherErrorMessage = err.response?.data?.message || "Mã không hợp lệ";
        this.discount = 0;
        this.bookingInfo.voucher_code = '';
      }
    },

    courtSubtotalAll() {
      return this.bookingInfo.courts.reduce((sum, c) => sum + this.courtSubtotal(c.id), 0);
    },

    printConfirmation() { window.print(); },

    connectBookingSocket(bookingId) {
      socketService.connect();
      socketService.joinBooking(bookingId);
      socketService.onBookingStatusChanged((data) => {
        console.log('📡 Booking status changed:', data);
        if (data.status === 'CONFIRMED' || data.status === 'COMPLETED') {
          this.paymentConfirmed = true;
          this.stopStatusPolling();
        }
      });
    },
    startStatusPolling(code) {
      this.stopStatusPolling(); // Clear existing if any
      this.pollingInterval = setInterval(() => {
        if (!this.paymentConfirmed) {
          console.log("🔄 Polling booking status for code:", code);
          this.loadBookingFromServer(code);
        } else {
          this.stopStatusPolling();
        }
      }, 3000);
    },

    stopStatusPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    },

    async loadBookingFromServer(bookingCode) {
      try {
        const res = await bookingService.getBookingByCode(bookingCode);
        if (res && res.data) {
          const b = res.data;

          // Map payment method cho hiển thị
          const payMap = { BANK_TRANSFER: 'bank', MOMO: 'momo', VNPAY: 'vnpay', CREDIT_CARD: 'card', CASH: 'cash' };
          this.payMethod = payMap[b.payment?.method] || 'bank';

          // Kiểm tra trạng thái đã xác nhận chưa
          if (b.status === 'CONFIRMED' || b.status === 'COMPLETED') {
            this.paymentConfirmed = true;
            this.stopStatusPolling();
          }

          // Tái tạo thông tin sân & slots từ dữ liệu server
          const courtMap = {};
          const slots = b.items.map(item => {
            const court = item.timeSlot.court;
            const courtId = item.timeSlot.courtId;
            if (!courtMap[courtId]) courtMap[courtId] = { id: courtId, name: court.name };

            const start = new Date(item.timeSlot.startTime);
            const end = new Date(item.timeSlot.endTime);
            return {
              courtId,
              courtName: court.name,
              time: `${start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
              price: Number(item.price),
            };
          });

          const firstSlot = b.items[0]?.timeSlot;
          const bookingDate = firstSlot ? new Date(firstSlot.startTime).toISOString().split('T')[0] : '';

          this.bookingInfo = {
            club_id: b.clubId || '',
            club_slug: b.club?.slug || '',
            venue_name: b.club?.name || '',
            courts: Object.values(courtMap),
            date: bookingDate,
            slots: JSON.stringify(slots),
            time_slot_ids: '[]',
            services: '[]',
            total: Number(b.finalAmount),
            name: b.bookerName,
            phone: b.bookerPhone,
            email: b.bookerEmail || '',
            note: b.note || '',
            voucher_code: '',
          };

          // Cập nhật lại timer dựa trên thời gian tạo đơn (giả sử hold 5 phút = 300s)
          if (b.status === 'WAITING_PAYMENT' && b.createdAt) {
            const elapsed = Math.floor((Date.now() - new Date(b.createdAt).getTime()) / 1000);
            this.timerSeconds = Math.max(0, 300 - elapsed);
          }

          // Kết nối socket để tiếp tục lắng nghe trạng thái
          if (b.id && !this.paymentConfirmed) {
            this.currentBookingId = b.id;
            this.connectBookingSocket(b.id);
          }
        }
      } catch (err) {
        console.error('Không thể tải thông tin booking:', err);
      }
    },
  },
};
</script>




