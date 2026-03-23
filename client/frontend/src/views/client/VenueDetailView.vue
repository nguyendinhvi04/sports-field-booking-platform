<template>
  <div class="vdp">

    <!-- HERO -->
    <section class="vdp-hero" :style="{ backgroundImage:`url(${venue.image})` }">
      <div class="vdp-hero__overlay"></div>
      <div class="container position-relative z-2 pb-5">
        <span class="badge bg-success rounded-pill mb-2">⚽ Bóng đá</span>
        <h1 class="fw-black text-white fs-2 mb-2">{{ venue.name }}</h1>
        <p class="text-white opacity-75 d-flex align-items-center gap-2 mb-3">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {{ venue.address }}
        </p>
        <div class="d-inline-flex gap-4 px-4 py-2 rounded-3 border border-white border-opacity-25" style="background:rgba(255,255,255,.13);backdrop-filter:blur(8px)">
          <div v-for="(s,i) in [{v:venue.courts.length,l:'Sân'},{v:'5.0 ★',l:'Đánh giá'},{v:'05:00',l:'Mở cửa'}]" :key="i" class="d-flex align-items-center gap-3">
            <div v-if="i" class="vdp-sep"></div>
            <div class="text-center text-white">
              <div class="fw-bold fs-5">{{ s.v }}</div>
              <div class="small opacity-75">{{ s.l }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MAIN -->
    <div class="container vdp-main">

      <!-- TABS -->
      <ul class="nav vdp-tabs mb-0">
        <li v-for="t in tabs" :key="t.id" class="nav-item">
          <button :class="['nav-link vdp-tab', {active: activeTab===t.id}]" @click="activeTab=t.id">
            <span v-html="t.icon"></span>{{ t.label }}
          </button>
        </li>
      </ul>

      <!-- BOOKING TAB -->
      <div v-if="activeTab==='booking'" class="row g-4 bg-white rounded-0 rounded-bottom-3 shadow-sm p-4">

        <!-- LEFT -->
        <div class="col-lg-8">

          <!-- Step 1 -->
          <div class="vdp-step border-bottom pb-4 mb-4">
            <div class="d-flex align-items-start gap-3 mb-3">
              <div class="vdp-snum">1</div>
              <div><div class="fw-bold fs-6 text-dark">Chọn sân</div><div class="text-muted small">Chọn loại sân phù hợp với nhu cầu của bạn</div></div>
            </div>
            <div class="d-flex flex-wrap gap-3">
              <div v-for="c in venue.courts" :key="c.id"
                :class="['vdp-court-card d-flex align-items-center gap-3 p-3 rounded-3 border-2 border', selectedCourtId===c.id ? 'border-success bg-success-subtle' : 'border-light-subtle']"
                @click="selectCourt(c.id)" style="min-width:175px;cursor:pointer">
                <div :class="['p-2 rounded-2', selectedCourtId===c.id ? 'bg-success text-white' : 'bg-success-subtle text-success']">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/></svg>
                </div>
                <div class="flex-grow-1">
                  <div class="fw-bold small">{{ c.name }}</div>
                  <div class="text-muted" style="font-size:12px">{{ formatPrice(c.basePrice) }} đ/30 phút</div>
                </div>
                <div v-if="selectedCourtId===c.id" class="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style="width:20px;height:20px;flex-shrink:0">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="vdp-step border-bottom pb-4 mb-4">
            <div class="d-flex align-items-start gap-3 mb-3">
              <div class="vdp-snum">2</div>
              <div><div class="fw-bold fs-6 text-dark">Chọn ngày</div><div class="text-muted small">Chọn ngày bạn muốn đặt sân</div></div>
            </div>
            <div class="d-flex flex-wrap gap-2">
              <div v-for="(d,i) in nextSevenDays" :key="d.full"
                :class="['vdp-date-card d-flex flex-column align-items-center border-2 rounded-3 border', dateOffset===i ? 'bg-success text-white border-success shadow-sm' : 'border-light-subtle bg-white']"
                style="min-width:70px;padding:10px 14px;cursor:pointer"
                @click="dateOffset=i; selectedSlots=[]">
                <span style="font-size:10px;font-weight:700;text-transform:uppercase;opacity:.7">{{ d.dayName }}</span>
                <span style="font-size:22px;font-weight:900;line-height:1.1">{{ d.dayNumber }}</span>
                <span style="font-size:11px;font-weight:600;opacity:.7">Th.{{ d.month }}</span>
              </div>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="vdp-step border-bottom pb-4 mb-4">
            <div class="d-flex align-items-start gap-3 mb-3">
              <div class="vdp-snum">3</div>
              <div class="flex-grow-1"><div class="fw-bold fs-6 text-dark">Chọn khung giờ</div><div class="text-muted small">Có thể chọn nhiều khung giờ liên tiếp (mỗi ô = 30 phút)</div></div>
              <div class="btn-group btn-group-sm" role="group">
                <button :class="['btn', slotView==='grid' ? 'btn-success' : 'btn-outline-secondary']" @click="slotView='grid'">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> Lưới
                </button>
                <button :class="['btn', slotView==='timeline' ? 'btn-success' : 'btn-outline-secondary']" @click="slotView='timeline'">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg> Timeline
                </button>
              </div>
            </div>
            <div class="d-flex gap-3 mb-3">
              <span class="d-flex align-items-center gap-1 text-muted small"><span class="vdp-lgd" style="background:#fff;border:1.5px solid #d1d5db"></span>Còn trống</span>
              <span class="d-flex align-items-center gap-1 text-muted small"><span class="vdp-lgd bg-success"></span>Đang chọn</span>
              <span class="d-flex align-items-center gap-1 text-muted small"><span class="vdp-lgd" style="background:#fca5a5"></span>Đã đặt</span>
              <span class="d-flex align-items-center gap-1 text-muted small"><span class="vdp-lgd" style="background:#e2e8f0"></span>Không hoạt động</span>
            </div>

            <!-- Grid -->
            <div v-if="slotView==='grid'" class="row g-2">
              <div v-for="slot in filteredSlots" :key="slot.id" class="col-6 col-md-4 col-lg-3">
                <div :class="['vdp-slot-card rounded-3 p-3 h-100',
                  isSlotSelected(slot) ? 'bg-success text-white border-success' :
                  slot.status==='BOOKED' ? 'vdp-slot--booked' : 'bg-white border']"
                  style="border-width:2px!important;cursor:pointer" @click="toggleSlot(slot)">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-bold" style="font-size:12px">{{ slot.time }}</span>
                    <span v-if="slot.status==='BOOKED'" class="badge" style="background:#fee2e2;color:#dc2626;font-size:9px">Đã đặt</span>
                    <span v-else-if="isSlotSelected(slot)" class="badge bg-white bg-opacity-25 text-white" style="font-size:9px">Chọn</span>
                  </div>
                  <div style="font-size:11px;opacity:.8">{{ formatPrice(slot.price) }} đ</div>
                </div>
              </div>
            </div>

            <!-- Timeline -->
            <div v-if="slotView==='timeline'" class="vdp-tl">
              <div class="vdp-tl-scroll">
                <div class="vdp-tl-head d-flex" style="background:#1e293b;min-width:max-content">
                  <div class="vdp-tl-lbl"></div>
                  <div class="d-flex flex-grow-1">
                    <div v-for="h in tlHours" :key="h" class="vdp-tl-hcell text-white">{{ tlFmtHour(h) }}</div>
                  </div>
                </div>
                <div v-for="court in venue.courts" :key="court.id" class="vdp-tl-row d-flex">
                  <div class="vdp-tl-lbl vdp-tl-clbl fw-bold small">{{ court.name }}</div>
                  <div class="vdp-tl-body position-relative d-flex flex-grow-1">
                    <div v-for="h in tlHours" :key="h"
                      :class="['vdp-tl-cell',
                        isTlHourNoSlot(court.id, h) ? 'vdp-tl-cell--noslot' :
                        isTlHourBooked(court.id, h) ? 'vdp-tl-cell--booked' :
                        'vdp-tl-cell--free']"
                      @click="toggleTlHour(court.id, h)">
                    </div>
                    <div v-for="seg in getTlBookedSegs(court.id)" :key="`b${seg.start}`"
                      class="vdp-tl-block vdp-tl-block--bk position-absolute"
                      :style="tlBlockStyle(seg.start, seg.end)">Đã đặt</div>
                    <div v-for="seg in getTlSelectedSegs(court.id)" :key="`s${seg.start}`"
                      class="vdp-tl-block vdp-tl-block--sel position-absolute"
                      :style="tlBlockStyle(seg.start, seg.end)"
                      @click.stop="removeTlSegment(court.id, seg)">
                      {{ tlFmtHour(seg.start) }}–{{ tlFmtHour(seg.end) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4 -->
          <div class="vdp-step">
            <div class="d-flex align-items-start gap-3 mb-0" style="cursor:pointer" @click="svcOpen=!svcOpen">
              <div class="vdp-snum">4</div>
              <div class="flex-grow-1">
                <div class="fw-bold fs-6 text-dark d-flex align-items-center gap-2">
                  Dịch vụ thêm
                  <span class="badge bg-secondary bg-opacity-10 text-muted fw-normal" style="font-size:11px">Tuỳ chọn</span>
                </div>
                <div class="text-muted small">Nhấn để chọn dịch vụ đi kèm</div>
              </div>
              <svg :style="svcOpen ? 'transform:rotate(180deg)' : ''" style="transition:.25s;flex-shrink:0;color:#94a3b8" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div v-if="!svcOpen && selectedServices.length" class="d-flex flex-wrap gap-2 mt-2">
              <span v-for="sid in selectedServices" :key="sid" class="badge rounded-pill d-flex align-items-center gap-1" style="background:#dcfce7;color:#15803d;border:1px solid #bbf7d0;font-size:12px;font-weight:600;padding:4px 12px">
                {{ getServiceName(sid) }}
                <button @click.stop="toggleService(sid)" class="btn-close btn-close-sm ms-1" style="width:10px;height:10px"></button>
              </span>
            </div>
            <transition name="acc">
              <div v-if="svcOpen" class="mt-3">
                <div class="row g-2">
                  <div v-for="svc in services" :key="svc.id" class="col-12 col-md-6">
                    <div :class="['vdp-svc-card d-flex align-items-center gap-3 p-3 rounded-3 border-2 border', isServiceSelected(svc.id) ? 'border-success bg-success-subtle' : 'border-light-subtle bg-white']"
                      style="cursor:pointer" @click="toggleService(svc.id)">
                      <div :class="['p-2 rounded-2 d-flex', isServiceSelected(svc.id) ? 'bg-success text-white' : 'bg-success-subtle text-success']" v-html="svc.icon"></div>
                      <div class="flex-grow-1">
                        <div class="fw-bold small text-dark">{{ svc.name }}</div>
                        <div class="text-success fw-bold" style="font-size:12px">+{{ formatPrice(svc.price) }} đ</div>
                      </div>
                      <div :class="['rounded-circle border-2 border d-flex align-items-center justify-content-center', isServiceSelected(svc.id) ? 'bg-success border-success text-white' : 'border-secondary']" style="width:20px;height:20px;flex-shrink:0">
                        <svg v-if="isServiceSelected(svc.id)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="text-end mt-3">
                  <button class="btn btn-success btn-sm" @click="svcOpen=false">✓ Xong — {{ selectedServices.length }} dịch vụ đã chọn</button>
                </div>
              </div>
            </transition>
          </div>

        </div><!-- /LEFT -->

        <!-- SIDEBAR -->
        <div class="col-lg-4">
          <div class="vdp-sidebar card border-0 sticky-top" style="top:90px">
            <div class="card-header d-flex justify-content-between align-items-center py-3">
              <span class="fw-bold text-white">Chi tiết đặt sân</span>
              <span v-if="selectedSlots.length" class="badge bg-success rounded-pill">{{ mergedSlots.length }} khung giờ</span>
            </div>
            <div v-if="!selectedSlots.length" class="text-center py-5 text-muted">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.3" class="d-block mx-auto mb-3"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <small>Vui lòng chọn khung giờ bạn muốn đặt</small>
            </div>
            <div v-else class="card-body p-0">
              <div class="mx-3 mt-3 p-3 rounded-3" style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #bbf7d0">
                <div class="d-flex align-items-center gap-2 small fw-semibold mb-1">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {{ selectedDateFormatted }}
                </div>
                <div class="d-flex align-items-center gap-2 small fw-semibold">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/></svg>
                  {{ selectedCourtName }}
                </div>
              </div>
              <div class="px-3 mt-2">
                <div v-for="g in mergedSlots" :key="g.timeLabel" class="d-flex align-items-center gap-2 p-2 rounded-2 mb-1 vdp-slot-row">
                  <span class="flex-grow-1 small fw-semibold">{{ g.timeLabel }}</span>
                  <span class="fw-bold text-success small">{{ formatPrice(g.price) }} đ</span>
                  <button class="vdp-rm-btn" @click="g.slots.forEach(s => toggleSlot(s))">×</button>
                </div>
              </div>
              <div v-if="selectedServices.length" class="px-3 mt-2">
                <div class="text-uppercase fw-bold mb-1" style="font-size:10px;letter-spacing:.4px;color:#94a3b8">Dịch vụ thêm</div>
                <div v-for="sid in selectedServices" :key="sid" class="d-flex align-items-center gap-2 p-2 rounded-2 mb-1 vdp-slot-row">
                  <span class="flex-grow-1 small fw-semibold">{{ getServiceName(sid) }}</span>
                  <span class="fw-bold text-success small">{{ formatPrice(getServicePrice(sid)) }} đ</span>
                  <button class="vdp-rm-btn" @click="toggleService(sid)">×</button>
                </div>
              </div>
              <div class="px-3 mt-2">
                <div class="input-group input-group-sm">
                  <span class="input-group-text border-end-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  </span>
                  <input v-model="form.voucher" type="text" class="form-control border-start-0"
                    :class="voucherApplied ? 'is-valid' : voucherError ? 'is-invalid' : ''"
                    placeholder="Mã voucher giảm giá"/>
                  <button class="btn btn-dark btn-sm" :disabled="!form.voucher" @click="applyVoucher">Áp dụng</button>
                </div>
                <div v-if="voucherApplied" class="text-success small mt-1">✓ Giảm {{ formatPrice(discount) }} đ đã áp dụng!</div>
                <div v-if="voucherError" class="text-danger small mt-1">Mã không hợp lệ hoặc đã hết hạn</div>
              </div>
              <div class="px-3 mt-3">
                <div class="text-uppercase fw-bold mb-2" style="font-size:10px;letter-spacing:.5px;color:#94a3b8">Thông tin khách hàng</div>
                <div class="mb-2">
                  <label class="form-label small fw-bold mb-1">Họ và tên <span class="text-danger">*</span></label>
                  <input v-model="form.name" type="text" class="form-control form-control-sm" placeholder="Nguyễn Văn A"/>
                </div>
                <div class="mb-2">
                  <label class="form-label small fw-bold mb-1">Số điện thoại <span class="text-danger">*</span></label>
                  <input v-model="form.phone" type="tel" class="form-control form-control-sm" placeholder="0901 234 567"/>
                </div>
                <div class="mb-2">
                  <label class="form-label small fw-bold mb-1">Email</label>
                  <input v-model="form.email" type="email" class="form-control form-control-sm" placeholder="email@example.com"/>
                </div>
                <div class="mb-2">
                  <label class="form-label small fw-bold mb-1">Ghi chú</label>
                  <textarea v-model="form.note" class="form-control form-control-sm" rows="2" placeholder="Yêu cầu thêm..."></textarea>
                </div>
              </div>
              <div class="px-3 mt-2 pt-2 border-top">
                <div v-if="serviceTotal > 0" class="d-flex justify-content-between small text-muted py-1"><span>Tiền sân</span><span>{{ formatPrice(courtTotal) }} đ</span></div>
                <div v-if="serviceTotal > 0" class="d-flex justify-content-between small text-muted py-1"><span>Dịch vụ</span><span>{{ formatPrice(serviceTotal) }} đ</span></div>
                <div v-if="discount > 0" class="d-flex justify-content-between small py-1"><span class="text-muted">Giảm giá</span><span class="text-danger fw-bold">– {{ formatPrice(discount) }} đ</span></div>
                <div class="d-flex justify-content-between align-items-center pt-2 mt-1 border-top">
                  <span class="fw-bold">Tổng cộng</span>
                  <span class="fw-black text-success fs-5">{{ formatPrice(grandTotal) }} đ</span>
                </div>
              </div>
              <div class="p-3">
                <button class="btn btn-success w-100 fw-bold py-3" :disabled="!form.name || !form.phone" @click="handleBooking">✓ TIẾP TỤC ĐẶT SÂN</button>
                <p v-if="!form.name || !form.phone" class="text-danger text-center small mt-1 mb-0">Vui lòng điền họ tên và số điện thoại</p>
                <p class="text-muted text-center small mt-1 mb-0">Không áp dụng hoàn tiền sau khi xác nhận</p>
              </div>
            </div>
          </div>
        </div><!-- /SIDEBAR -->

      </div>

      <!-- INFO TAB -->
      <div v-if="activeTab==='info'" class="row g-4 bg-white rounded-bottom-3 shadow-sm p-4">
        <div class="col-lg-8">
          <h4 class="fw-black mb-3">Giới thiệu về {{ venue.name }}</h4>
          <p class="text-muted" style="line-height:1.8">{{ venue.description }}</p>
          <h5 class="fw-bold mt-4 mb-3">Tiện ích sân</h5>
          <div class="row g-2">
            <div v-for="a in venue.amenities" :key="a.id" class="col-6 d-flex align-items-center gap-2">
              <div class="bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center" style="width:26px;height:26px;flex-shrink:0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span class="small">{{ a.name }}</span>
            </div>
          </div>
          <h5 class="fw-bold mt-4 mb-3">Giờ mở cửa</h5>
          <div v-for="(d,i) in venue.openingHours" :key="d.day" :class="['d-flex justify-content-between px-3 py-2 rounded-2', i%2===1 ? 'bg-light' : '']">
            <span class="fw-semibold small">{{ d.day }}</span>
            <span class="fw-bold small" :class="d.isClosed ? 'text-danger' : 'text-success'">{{ d.isClosed ? 'Đóng cửa' : `${d.open} – ${d.close}` }}</span>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="vdp-sidebar card border-0">
            <div class="card-header py-3"><span class="fw-bold text-white">Đặt sân ngay</span></div>
            <div class="card-body"><button class="btn btn-success w-100 fw-bold" @click="activeTab='booking'">Chọn khung giờ →</button></div>
          </div>
        </div>
      </div>

      <!-- REVIEW TAB -->
      <div v-if="activeTab==='review'" class="bg-white rounded-bottom-3 shadow-sm p-5 text-center text-muted">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" class="d-block mx-auto mb-3"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <p>Chưa có đánh giá nào.</p>
      </div>

    </div>

    <!-- MODAL -->
    <transition name="fade">
      <div class="modal d-block vdp-modal-bg" v-if="showModal" @click.self="showModal=false">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content rounded-4 border-0 shadow-lg">
            <div class="modal-header border-0 pb-0"><button class="btn-close" @click="showModal=false"></button></div>
            <div class="modal-body px-4 pb-4">
              <div v-if="!bookingDone">
                <div class="bg-success-subtle text-success rounded-3 d-flex align-items-center justify-content-center mb-3" style="width:52px;height:52px">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <h5 class="fw-black mb-3">Xác nhận đặt sân</h5>
                <div class="bg-light rounded-3 p-3 mb-3" style="max-height:250px;overflow-y:auto">
                  <div v-for="(row,i) in modalRows" :key="i" class="d-flex justify-content-between small py-1 border-bottom border-light">
                    <span class="text-muted">{{ row.label }}</span>
                    <strong :style="row.color ? `color:${row.color}` : ''">{{ row.value }}</strong>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <span class="fw-bold">Tổng thanh toán</span>
                  <span class="fw-black text-success fs-4">{{ formatPrice(grandTotal) }} đ</span>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-outline-secondary flex-fill" @click="showModal=false">Hủy bỏ</button>
                  <button class="btn btn-success flex-fill fw-bold" @click="bookingDone=true">Xác nhận đặt sân</button>
                </div>
              </div>
              <div v-else class="text-center py-3">
                <div class="bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style="width:72px;height:72px;animation:pop .4s cubic-bezier(.175,.885,.32,1.275)">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h5 class="fw-black mb-2">Đặt sân thành công!</h5>
                <p class="text-muted">Xác nhận gửi đến <strong>{{ form.phone }}</strong>.<br>Hẹn gặp bạn tại sân!</p>
                <button class="btn btn-success w-100 fw-bold mt-2" @click="closeSuccess">Về trang chủ</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
export default {
  name: 'VenueDetailView',

  data() {
    return {
      activeTab: 'booking',
      showModal: false,
      bookingDone: false,
      dateOffset: 0,
      selectedCourtId: null,
      selectedSlots: [],
      selectedServices: [],
      svcOpen: false,
      slotView: 'grid',

      // Trục timeline: bước 0.5 = 30 phút, từ 05:00 đến 21:00
      tlHours: [
        5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5,
        10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5,
        14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5,
        18, 18.5, 19, 19.5, 20, 20.5, 21,
      ],

      voucherApplied: false,
      voucherError: false,
      discount: 0,
      form: { name: '', phone: '', email: '', note: '', voucher: '' },

      tabs: [
        { id: 'booking', label: 'Đặt sân',   icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
        { id: 'info',    label: 'Thông tin', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' },
        { id: 'review',  label: 'Đánh giá',  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
      ],

      services: [
        { id: 's1', name: 'Thuê đồ thi đấu',      price: 100000, icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/></svg>' },
        { id: 's2', name: 'Quay video/Livestream', price: 200000, icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>' },
        { id: 's3', name: 'Thuê giày bóng đá',     price:  50000, icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>' },
        { id: 's4', name: 'Nước uống (12 chai)',    price:  80000, icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/></svg>' },
        { id: 's5', name: 'Thuê trọng tài',         price: 150000, icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>' },
        { id: 's6', name: 'Thuê bóng đá',           price:  30000, icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 00-6.88 17.19L12 12l6.88 7.19A10 10 0 0012 2z"/></svg>' },
      ],

      venue: {
        name: 'Sân bóng đá cỏ nhân tạo Thành Phát',
        address: 'Số 2 Đ. Hoàng Minh Giám, Trung Hòa, Cầu Giấy, Hà Nội',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop',
        description: 'Sân bóng Thành Phát là một trong những cụm sân bóng cỏ nhân tạo chất lượng hàng đầu tại Hà Nội. Hệ thống sân được bảo trì định kỳ, chiếu sáng hiện đại.',
        amenities: [
          { id: 1, name: 'WiFi miễn phí' },
          { id: 2, name: 'Bãi đỗ xe ô tô' },
          { id: 3, name: 'Canteen & Đồ uống' },
          { id: 4, name: 'Phòng thay đồ' },
          { id: 5, name: 'Thuê giày & bóng' },
        ],
        courts: [
          { id: 'c1', name: 'Sân 7 – Số 1',   basePrice: 225000 },
          { id: 'c2', name: 'Sân 7 – Số 2',   basePrice: 225000 },
          { id: 'c3', name: 'Sân 11 – Chính', basePrice: 600000 },
        ],
        openingHours: [
          { day: 'Thứ Hai',  open: '05:00', close: '23:00', isClosed: false },
          { day: 'Thứ Ba',   open: '05:00', close: '23:00', isClosed: false },
          { day: 'Thứ Tư',   open: '05:00', close: '23:00', isClosed: false },
          { day: 'Thứ Năm',  open: '05:00', close: '23:00', isClosed: false },
          { day: 'Thứ Sáu',  open: '05:00', close: '23:00', isClosed: false },
          { day: 'Thứ Bảy',  open: '05:00', close: '24:00', isClosed: false },
          { day: 'Chủ Nhật', open: '05:00', close: '24:00', isClosed: false },
        ],
      },

      // allSlots: mỗi slot = 30 phút
      allSlots: {
        c1: [
          { id: 'c1-1',  time: '05:00 – 05:30', price: 150000, status: 'AVAILABLE' },
          { id: 'c1-2',  time: '05:30 – 06:00', price: 150000, status: 'AVAILABLE' },
          { id: 'c1-3',  time: '06:00 – 06:30', price: 175000, status: 'AVAILABLE' },
          { id: 'c1-4',  time: '06:30 – 07:00', price: 175000, status: 'AVAILABLE' },
          { id: 'c1-5',  time: '07:00 – 07:30', price: 225000, status: 'BOOKED'    },
          { id: 'c1-6',  time: '07:30 – 08:00', price: 225000, status: 'BOOKED'    },
          { id: 'c1-7',  time: '08:00 – 08:30', price: 200000, status: 'BOOKED'    },
          { id: 'c1-8',  time: '08:30 – 09:00', price: 200000, status: 'AVAILABLE' },
          { id: 'c1-9',  time: '09:00 – 09:30', price: 180000, status: 'AVAILABLE' },
          { id: 'c1-10', time: '09:30 – 10:00', price: 180000, status: 'AVAILABLE' },
          { id: 'c1-11', time: '16:00 – 16:30', price: 300000, status: 'AVAILABLE' },
          { id: 'c1-12', time: '16:30 – 17:00', price: 300000, status: 'AVAILABLE' },
          { id: 'c1-13', time: '17:00 – 17:30', price: 400000, status: 'AVAILABLE' },
          { id: 'c1-14', time: '17:30 – 18:00', price: 400000, status: 'AVAILABLE' },
          { id: 'c1-15', time: '18:00 – 18:30', price: 400000, status: 'AVAILABLE' },
          { id: 'c1-16', time: '18:30 – 19:00', price: 400000, status: 'BOOKED'    },
          { id: 'c1-17', time: '19:00 – 19:30', price: 400000, status: 'AVAILABLE' },
          { id: 'c1-18', time: '19:30 – 20:00', price: 400000, status: 'AVAILABLE' },
          { id: 'c1-19', time: '20:00 – 20:30', price: 250000, status: 'AVAILABLE' },
          { id: 'c1-20', time: '20:30 – 21:00', price: 250000, status: 'AVAILABLE' },
        ],
        c2: [
          { id: 'c2-1',  time: '05:00 – 05:30', price: 150000, status: 'AVAILABLE' },
          { id: 'c2-2',  time: '05:30 – 06:00', price: 150000, status: 'AVAILABLE' },
          { id: 'c2-3',  time: '06:00 – 06:30', price: 175000, status: 'AVAILABLE' },
          { id: 'c2-4',  time: '06:30 – 07:00', price: 175000, status: 'AVAILABLE' },
          { id: 'c2-5',  time: '07:00 – 07:30', price: 225000, status: 'AVAILABLE' },
          { id: 'c2-6',  time: '07:30 – 08:00', price: 225000, status: 'BOOKED'    },
          { id: 'c2-7',  time: '08:00 – 08:30', price: 200000, status: 'BOOKED'    },
          { id: 'c2-8',  time: '08:30 – 09:00', price: 200000, status: 'AVAILABLE' },
          { id: 'c2-9',  time: '09:00 – 09:30', price: 180000, status: 'AVAILABLE' },
          { id: 'c2-10', time: '09:30 – 10:00', price: 180000, status: 'AVAILABLE' },
          { id: 'c2-11', time: '16:00 – 16:30', price: 300000, status: 'AVAILABLE' },
          { id: 'c2-12', time: '16:30 – 17:00', price: 300000, status: 'BOOKED'    },
          { id: 'c2-13', time: '17:00 – 17:30', price: 400000, status: 'BOOKED'    },
          { id: 'c2-14', time: '17:30 – 18:00', price: 400000, status: 'AVAILABLE' },
          { id: 'c2-15', time: '18:00 – 18:30', price: 400000, status: 'AVAILABLE' },
          { id: 'c2-16', time: '18:30 – 19:00', price: 400000, status: 'AVAILABLE' },
          { id: 'c2-17', time: '19:00 – 19:30', price: 400000, status: 'AVAILABLE' },
          { id: 'c2-18', time: '19:30 – 20:00', price: 400000, status: 'BOOKED'    },
          { id: 'c2-19', time: '20:00 – 20:30', price: 250000, status: 'AVAILABLE' },
          { id: 'c2-20', time: '20:30 – 21:00', price: 250000, status: 'AVAILABLE' },
        ],
        c3: [
          { id: 'c3-1',  time: '06:00 – 06:30', price: 400000, status: 'AVAILABLE' },
          { id: 'c3-2',  time: '06:30 – 07:00', price: 400000, status: 'AVAILABLE' },
          { id: 'c3-3',  time: '07:00 – 07:30', price: 500000, status: 'BOOKED'    },
          { id: 'c3-4',  time: '07:30 – 08:00', price: 500000, status: 'BOOKED'    },
          { id: 'c3-5',  time: '15:00 – 15:30', price: 550000, status: 'AVAILABLE' },
          { id: 'c3-6',  time: '15:30 – 16:00', price: 550000, status: 'AVAILABLE' },
          { id: 'c3-7',  time: '16:00 – 16:30', price: 600000, status: 'AVAILABLE' },
          { id: 'c3-8',  time: '16:30 – 17:00', price: 600000, status: 'AVAILABLE' },
          { id: 'c3-9',  time: '17:00 – 17:30', price: 600000, status: 'BOOKED'    },
          { id: 'c3-10', time: '17:30 – 18:00', price: 600000, status: 'BOOKED'    },
          { id: 'c3-11', time: '18:00 – 18:30', price: 600000, status: 'AVAILABLE' },
          { id: 'c3-12', time: '18:30 – 19:00', price: 600000, status: 'AVAILABLE' },
          { id: 'c3-13', time: '19:00 – 19:30', price: 600000, status: 'AVAILABLE' },
          { id: 'c3-14', time: '19:30 – 20:00', price: 600000, status: 'AVAILABLE' },
          { id: 'c3-15', time: '20:00 – 20:30', price: 500000, status: 'AVAILABLE' },
          { id: 'c3-16', time: '20:30 – 21:00', price: 500000, status: 'AVAILABLE' },
        ],
      },

      validVouchers: { 'GIAM50K': 50000, 'WELCOME': 100000, 'VIP2026': 200000 },
    };
  },

  computed: {
    nextSevenDays() {
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const now = new Date();
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(now.getDate() + i);
        return {
          full: d.toISOString().split('T')[0],
          dayName: i === 0 ? 'HÔM NAY' : days[d.getDay()],
          dayNumber: d.getDate(),
          month: d.getMonth() + 1,
        };
      });
    },
    selectedDate() {
      return this.nextSevenDays[this.dateOffset]?.full || '';
    },
    selectedDateFormatted() {
      if (!this.selectedDate) return '';
      const [y, m, d] = this.selectedDate.split('-');
      return `${d}/${m}/${y}`;
    },
    selectedCourtName() {
      return this.venue.courts.find(c => c.id === this.selectedCourtId)?.name || '';
    },
    filteredSlots() {
      return this.allSlots[this.selectedCourtId] || [];
    },
    courtTotal() {
      return this.selectedSlots.reduce((s, sl) => s + sl.price, 0);
    },
    serviceTotal() {
      return this.selectedServices.reduce((s, id) => s + this.getServicePrice(id), 0);
    },
    grandTotal() {
      return Math.max(0, this.courtTotal + this.serviceTotal - this.discount);
    },
    // Gộp các slot liền kề thành đoạn: [5:00-5:30, 5:30-6:00] → [{time:'05:00 – 06:00', price:300000, slots:[...]}]
    mergedSlots() {
      if (!this.selectedSlots.length) return [];
      // Sắp xếp theo giờ bắt đầu
      const sorted = [...this.selectedSlots].sort((a, b) => this.slotStart(a) - this.slotStart(b));
      const groups = [];
      let cur = null;
      sorted.forEach(slot => {
        const start = this.slotStart(slot);
        const end   = this.slotEnd(slot);
        if (cur && Math.abs(cur.end - start) < 0.01) {
          // Liền kề → gộp vào nhóm hiện tại
          cur.end   = end;
          cur.price += slot.price;
          cur.slots.push(slot);
        } else {
          // Không liền kề → tạo nhóm mới
          if (cur) groups.push(cur);
          cur = { start, end, price: slot.price, slots: [slot] };
        }
      });
      if (cur) groups.push(cur);
      // Chuyển về dạng hiển thị
      return groups.map(g => ({
        timeLabel: `${this.tlFmtHour(g.start)} – ${this.tlFmtHour(g.end)}`,
        price: g.price,
        slots: g.slots,
      }));
    },
    modalRows() {
      const rows = [
        { label: 'Địa điểm',   value: this.venue.name },
        { label: 'Ngày',        value: this.selectedDateFormatted },
        { label: 'Sân',         value: this.selectedCourtName },
        { label: 'Khách hàng', value: this.form.name },
        { label: 'Điện thoại', value: this.form.phone },
        ...(this.form.email ? [{ label: 'Email', value: this.form.email }] : []),
        ...this.mergedSlots.map(g => ({ label: g.timeLabel, value: `${this.formatPrice(g.price)} đ`, color: '#16a34a' })),
        ...this.selectedServices.map(id => ({ label: this.getServiceName(id), value: `${this.formatPrice(this.getServicePrice(id))} đ`, color: '#16a34a' })),
      ];
      if (this.discount > 0) {
        rows.push({ label: 'Giảm giá', value: `– ${this.formatPrice(this.discount)} đ`, color: '#ef4444' });
      }
      return rows;
    },
  },

  created() {
    this.selectedCourtId = this.venue.courts[0].id;
  },

  methods: {
    // ── Tiện ích chung ────────────────────────────────────────────
    formatPrice(v) {
      return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(v);
    },
    getServiceName(id)  { return this.services.find(s => s.id === id)?.name  || ''; },
    getServicePrice(id) { return this.services.find(s => s.id === id)?.price || 0;  },

    // Parse "05:30" → 5.5  |  "17:00" → 17
    parseHour(timeStr) {
      const [h, m] = timeStr.split(':').map(Number);
      return h + m / 60;
    },
    slotStart(slot) { return this.parseHour(slot.time.split(' – ')[0]); },
    slotEnd(slot)   { return this.parseHour(slot.time.split(' – ')[1]); },

    // Format 5.5 → "05:30"  |  17 → "17:00"
    tlFmtHour(h) {
      const hh = Math.floor(h);
      const mm = (h % 1 === 0.5) ? '30' : '00';
      return `${String(hh).padStart(2, '0')}:${mm}`;
    },

    // ── Sân ──────────────────────────────────────────────────────
    selectCourt(id) {
      this.selectedCourtId = id;
      this.selectedSlots = [];
    },

    // ── Slot ─────────────────────────────────────────────────────
    isSlotSelected(slot) {
      return this.selectedSlots.some(x => x.id === slot.id);
    },
    toggleSlot(slot) {
      if (slot.status === 'BOOKED' || slot.status === 'LOCKED') return;
      const i = this.selectedSlots.findIndex(x => x.id === slot.id);
      if (i > -1) this.selectedSlots.splice(i, 1);
      else this.selectedSlots.push(slot);
    },

    // ── Dịch vụ ──────────────────────────────────────────────────
    isServiceSelected(id) { return this.selectedServices.includes(id); },
    toggleService(id) {
      const i = this.selectedServices.indexOf(id);
      if (i > -1) this.selectedServices.splice(i, 1);
      else this.selectedServices.push(id);
    },

    // ── Voucher ──────────────────────────────────────────────────
    applyVoucher() {
      const code = this.form.voucher.trim().toUpperCase();
      if (this.validVouchers[code]) {
        this.discount = this.validVouchers[code];
        this.voucherApplied = true;
        this.voucherError = false;
      } else {
        this.discount = 0;
        this.voucherApplied = false;
        this.voucherError = true;
      }
    },

    // ── Timeline ─────────────────────────────────────────────────

    // Tính left/width theo index cột → block khớp chính xác với ô header
    tlBlockStyle(start, end) {
      const total  = this.tlHours.length;
      const iStart = this.tlHours.indexOf(start);
      const iEnd   = this.tlHours.indexOf(end);
      // end=21.5 không có trong tlHours → dùng total (= hết cột cuối)
      const colEnd = iEnd === -1 ? total : iEnd;
      return {
        left:  `calc(${(iStart / total) * 100}% + 1px)`,
        width: `calc(${((colEnd - iStart) / total) * 100}% - 3px)`,
      };
    },

    // Các đoạn đã bị đặt (block đỏ)
    getTlBookedSegs(cid) {
      return (this.allSlots[cid] || [])
        .filter(s => s.status === 'BOOKED')
        .map(s => ({ start: this.slotStart(s), end: this.slotEnd(s) }));
    },

    // Gộp các slot đã chọn liên tiếp thành đoạn (block xanh)
    getTlSelectedSegs(cid) {
      const sel  = this.selectedSlots.filter(s => s.id.startsWith(cid));
      const segs = [];
      let cur    = null;
      sel.forEach(s => {
        const a = this.slotStart(s);
        const b = this.slotEnd(s);
        if (cur && cur.end === a) {
          cur.end = b;
        } else {
          if (cur) segs.push(cur);
          cur = { start: a, end: b };
        }
      });
      if (cur) segs.push(cur);
      return segs;
    },

    // Ô có slot nhưng đã bị đặt
    isTlHourBooked(cid, h) {
      return (this.allSlots[cid] || []).some(s =>
        s.status === 'BOOKED' &&
        h >= this.slotStart(s) && h < this.slotEnd(s)
      );
    },

    // Ô ngoài giờ hoạt động (không có slot nào)
    isTlHourNoSlot(cid, h) {
      const slots = this.allSlots[cid] || [];
      return !slots.some(s => h >= this.slotStart(s) && h < this.slotEnd(s));
    },

    // Click ô timeline → toggle slot
    toggleTlHour(cid, h) {
      // Bỏ qua nếu ô xám hoặc đỏ
      if (this.isTlHourNoSlot(cid, h) || this.isTlHourBooked(cid, h)) return;
      // Chuyển sang sân được click nếu khác sân hiện tại
      if (cid !== this.selectedCourtId) this.selectCourt(cid);
      const slot = (this.allSlots[cid] || []).find(s =>
        h >= this.slotStart(s) && h < this.slotEnd(s)
      );
      if (slot) this.toggleSlot(slot);
    },

    // Click block xanh → bỏ chọn cả đoạn
    removeTlSegment(cid, seg) {
      (this.allSlots[cid] || [])
        .filter(s => this.slotStart(s) >= seg.start && this.slotStart(s) < seg.end)
        .forEach(s => this.toggleSlot(s));
    },

    // ── Modal ────────────────────────────────────────────────────
    handleBooking() {
      this.bookingDone = false;
      this.showModal   = true;
    },
    closeSuccess() {
      this.showModal        = false;
      this.bookingDone      = false;
      this.selectedSlots    = [];
      this.selectedServices = [];
      this.discount         = 0;
      this.voucherApplied   = false;
      this.voucherError     = false;
      this.form = { name: '', phone: '', email: '', note: '', voucher: '' };
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');

.vdp {   font-family: 'Barlow Condensed', sans-serif; background: #f1f5f9; min-height: 100vh; }

/* ── Hero ── */
.vdp-hero { height: 400px; background-size: cover; background-position: center; position: relative; display: flex; align-items: flex-end; padding-bottom: 48px; }
.vdp-hero__overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.15) 70%); }
.vdp-sep { width: 1px; height: 28px; background: rgba(255,255,255,.3); }
.vdp-main { margin-top: -28px; position: relative; z-index: 5; padding-bottom: 80px; }

/* ── Tabs ── */
.vdp-tabs { gap: 3px; }
.vdp-tab { border: none;  font-family: 'Barlow Condensed', sans-serif;; font-weight: 700; font-size: 13.5px; color: #64748b; border-radius: 12px 12px 0 0; padding: 12px 24px; background: rgba(255,255,255,.85); backdrop-filter: blur(4px); transition: all .18s; }
.vdp-tab:hover  { background: white; color: #374151; }
.vdp-tab.active { color: #16a34a; border-bottom: 2.5px solid #16a34a; background: white; box-shadow: 0 -4px 12px rgba(0,0,0,.06); }

/* ── Step numbers ── */
.vdp-snum { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg,#16a34a,#15803d); color: #fff; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; box-shadow: 0 3px 10px rgba(22,163,74,.35); }

/* ── Cards ── */
.vdp-court-card, .vdp-date-card, .vdp-slot-card, .vdp-svc-card { transition: all .2s cubic-bezier(.2,.8,.4,1); box-shadow: 0 1px 3px rgba(0,0,0,.06); }
.vdp-court-card:hover, .vdp-svc-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(22,163,74,.15) !important; }
.vdp-date-card:hover  { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(22,163,74,.12) !important; }
.vdp-slot-card:hover:not(.vdp-slot--booked) { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(22,163,74,.15) !important; }
.vdp-lgd { width: 13px; height: 13px; border-radius: 3px; display: inline-block; flex-shrink: 0; }
.vdp-slot--booked { background: #fff5f5 !important; border-color: #fca5a5 !important; cursor: not-allowed !important; opacity: .85; }

/* ── Form ── */
.vdp .form-control,
.vdp .form-control-sm { border-color: #e2e8f0; border-radius: 10px !important;   font-family: 'Barlow Condensed', sans-serif; font-size: 13px; transition: border-color .15s, box-shadow .15s; }
.vdp .form-control:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,.1); }
.vdp .input-group-text { border-color: #e2e8f0; background: #f8fafc; }
.vdp .input-group > .form-control:not(:last-child) { border-radius: 10px 0 0 10px !important; }
.vdp .input-group > :last-child { border-radius: 0 10px 10px 0 !important; }

/* ── Buttons ── */
.vdp .btn-success { background: linear-gradient(135deg,#16a34a,#15803d); border: none;   font-family: 'Barlow Condensed', sans-serif; font-weight: 700; border-radius: 10px; box-shadow: 0 3px 10px rgba(22,163,74,.3); transition: all .2s; }
.vdp .btn-success:hover:not(:disabled) { background: linear-gradient(135deg,#15803d,#14532d); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(22,163,74,.35); }
.vdp .btn-success:disabled { transform: none; box-shadow: none; opacity: .5; }
.vdp .btn-dark { background: #1e293b; border: none;   font-family: 'Barlow Condensed', sans-serif; font-weight: 700; border-radius: 10px; transition: all .18s; }
.vdp .btn-dark:hover:not(:disabled) { background: #16a34a; }
.vdp .btn-outline-secondary {   font-family: 'Barlow Condensed', sans-serif; font-weight: 600; border-radius: 10px; border-color: #e2e8f0; color: #64748b; }
.vdp .btn-outline-secondary:hover { background: #f8fafc; color: #374151; border-color: #cbd5e1; }
.vdp .btn-group .btn {   font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: 12px; padding: 6px 14px; }

/* ── Sidebar ── */
.vdp-sidebar { border-radius: 16px !important; box-shadow: 0 4px 24px rgba(0,0,0,.09), 0 1px 4px rgba(0,0,0,.05) !important; }
.vdp-sidebar .card-header { background: linear-gradient(135deg,#1e293b 0%,#0f172a 100%) !important; border-bottom: none; }
.vdp-slot-row { background: #f8fafc; border-radius: 10px; }
.vdp-slot-row:hover { background: #f1f5f9; }
.vdp-rm-btn { width: 22px; height: 22px; border-radius: 50%; background: #fee2e2; color: #ef4444; border: none; display: flex; align-items: center; justify-content: center; font-size: 15px; cursor: pointer; flex-shrink: 0; transition: background .15s; padding: 0; line-height: 1; }
.vdp-rm-btn:hover { background: #fecaca; }

/* ── Timeline ── */
.vdp-tl { overflow: hidden; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 4px rgba(0,0,0,.05); }
.vdp-tl-scroll { overflow-x: auto; scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
.vdp-tl-lbl { width: 88px; min-width: 88px; flex-shrink: 0; position: sticky; left: 0; z-index: 10; background: inherit; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; border-right: 1px solid rgba(255,255,255,.12); }
.vdp-tl-clbl { background: #f8fafc !important; color: #0f172a; border-right: 2px solid #cbd5e1 !important; height: 56px; }
.vdp-tl-hcell { flex: 1; min-width: 44px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; border-right: 1px solid rgba(255,255,255,.1); }
.vdp-tl-row { border-bottom: 1px solid #e2e8f0; min-width: max-content; }
.vdp-tl-row:last-child { border-bottom: none; }
.vdp-tl-body { height: 56px; }

/* 3 trạng thái ô */
.vdp-tl-cell { flex: 1; min-width: 44px; height: 100%; border-right: 1px solid #e9ecef; transition: background .1s; }
.vdp-tl-cell--free        { background: #fff;    cursor: pointer; }
.vdp-tl-cell--free:hover  { background: #dcfce7; }
.vdp-tl-cell--booked      { background: #fff5f5; cursor: not-allowed; }
.vdp-tl-cell--noslot      { background: #f1f5f9; cursor: not-allowed; }
.vdp-tl-row:nth-child(even) .vdp-tl-cell--free       { background: #fafafa; }
.vdp-tl-row:nth-child(even) .vdp-tl-cell--free:hover { background: #dcfce7; }
.vdp-tl-row:nth-child(even) .vdp-tl-cell--noslot     { background: #eaeff4; }

/* Block nổi trên timeline */
.vdp-tl-block { top: 7px; bottom: 7px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; padding: 0 8px; white-space: nowrap; z-index: 5; box-shadow: 0 2px 6px rgba(0,0,0,.12); }
.vdp-tl-block--bk  { background: linear-gradient(135deg,#f87171,#ef4444); color: #fff; cursor: not-allowed; }
.vdp-tl-block--sel { background: linear-gradient(135deg,#22c55e,#16a34a); color: #fff; cursor: pointer; }
.vdp-tl-block--sel:hover { filter: brightness(1.06); }

/* ── Modal ── */
.vdp-modal-bg { background: rgba(15,23,42,.7); backdrop-filter: blur(6px); }
.vdp .modal-content { border-radius: 20px !important; }

/* ── Transitions ── */
.acc-enter-active { transition: all .25s ease; }
.acc-leave-active { transition: all .2s ease; }
.acc-enter-from, .acc-leave-to { opacity: 0; transform: translateY(-8px); }
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes pop {
  from { transform: scale(.4); opacity: 0; }
  to   { transform: scale(1);  opacity: 1; }
}

::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
</style>