<template>
  <div class="vdp">
    <LoadingView v-if="venueLoading || slotsLoading" />

    <!-- E. SKELETON LOADING -->
    <div v-if="venueLoading" class="min-vh-100 placeholder-glow" style="pointer-events: none">
      <div class="placeholder w-100" style="height: 400px; background: #e2e8f0; border-radius: 0 0 24px 24px"></div>
      <div class="container" style="margin-top: -30px; position: relative; z-index: 5">
        <div class="row g-4">
          <div class="col-lg-8"><div class="placeholder w-100 rounded-4" style="height: 600px; background: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.05)"></div></div>
          <div class="col-lg-4"><div class="placeholder w-100 rounded-4" style="height: 500px; background: #ffffff; border: 1px solid #e2e8f0"></div></div>
        </div>
      </div>
    </div>

    <!-- MAIN APP CONTENT -->
    <div v-else>
      <!-- HERO -->
      <VenueHero :venue="venue" />

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
      <div v-if="activeTab==='booking'" class="row g-4 bg-white shadow-sm p-4 vdp-panel-container">
        <div class="col-lg-8">

          <!-- ═══ Step 1: Chọn sân (MULTI-SELECT) ═══ -->
          <div class="vdp-step border-bottom pb-4 mb-4">
            <div class="d-flex align-items-start gap-3 mb-3">
              <div class="vdp-snum">1</div>
              <div>
                <div class="fw-bold fs-6 text-dark">Chọn sân</div>
                <div class="text-muted small">Có thể chọn nhiều sân để đặt cùng lúc</div>
              </div>
              <!-- Badge tổng số sân đang chọn -->
              <!-- <div v-if="selectedCourtIds.length" class="ms-auto">
                <span class="badge bg-success rounded-pill">{{ selectedCourtIds.length }} sân đã chọn</span>
              </div> -->
            </div>
            <div class="d-flex flex-wrap gap-3">
              <div v-for="c in venue.courts" :key="c.id"
                :class="['vdp-court-card d-flex align-items-center gap-3 p-3 rounded-3 border-2 border', isCourtSelected(c.id) ? 'border-success bg-success-subtle' : 'border-light-subtle']"
                @click="toggleCourt(c.id)" style="min-width:175px;cursor:pointer">
                <div :class="['p-2 rounded-2', isCourtSelected(c.id) ? 'bg-success text-white' : 'bg-success-subtle text-success']">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/></svg>
                </div>
                <div class="flex-grow-1">
                  <div class="fw-bold small">{{ c.name }}</div>
                  <div class="text-muted" style="font-size:12px">{{ formatPrice(c.basePrice) }} đ/30 phút</div>
                </div>
                <!-- Checkbox style indicator -->
                <div :class="['rounded-circle border-2 border d-flex align-items-center justify-content-center flex-shrink-0', isCourtSelected(c.id) ? 'bg-success border-success text-white' : 'border-secondary bg-white']" style="width:22px;height:22px;">
                  <svg v-if="isCourtSelected(c.id)" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>
            </div>
          </div>

          <!-- ═══ Step 2: Chọn ngày ═══ -->
          <div class="vdp-step border-bottom pb-4 mb-4">
            <div class="d-flex align-items-start gap-3 mb-3">
              <div class="vdp-snum">2</div>
              <div><div class="fw-bold fs-6 text-dark">Chọn ngày</div><div class="text-muted small">Tất cả sân đã chọn sẽ đặt cùng ngày này</div></div>
            </div>
            <!-- C. Date Picker Horizon with HTML Custom Input -->
            <div class="d-flex gap-2" style="overflow-x: auto; padding-bottom: 8px; scrollbar-width: none;">
              <div v-for="(d,i) in nextSevenDays" :key="d.full"
                :class="['vdp-date-card d-flex flex-column align-items-center border-2 rounded-3 border flex-shrink-0', dateOffset===i ? 'bg-success text-white border-success shadow-sm' : 'border-light-subtle bg-white']"
                style="min-width:70px;padding:10px 14px;cursor:pointer"
                @click="dateOffset=i; clearAllSlots()">
                <span style="font-size:10px;font-weight:700;text-transform:uppercase;opacity:.7">{{ d.dayName }}</span>
                <span style="font-size:22px;font-weight:900;line-height:1.1">{{ d.dayNumber }}</span>
                <span style="font-size:11px;font-weight:600;opacity:.7">Th.{{ d.month }}</span>
              </div>
              
              <!-- Nút Chọn Ngày Khác (Datepicker) -->
              <div class="position-relative vdp-date-card d-flex flex-column align-items-center justify-content-center border-2 rounded-3 border bg-white flex-shrink-0" 
                   style="min-width:70px;padding:10px 14px;cursor:pointer;border-color: #e2e8f0;overflow:hidden"
                   @click="$refs.customDateInput.showPicker()">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" class="mb-1" stroke="#94a3b8" stroke-width="2.3"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span class="mt-1" style="font-size:10px;font-weight:700;color:#94a3b8">NGÀY KHÁC</span>
                <!-- input[date] được gọi popup qua refs -->
                <input type="date" ref="customDateInput" v-model="customDate" @change="dateOffset=0" class="position-absolute opacity-0" style="width:1px;height:1px;bottom:0;right:0;pointer-events:none;"/>
              </div>
            </div>
          </div>

          <!-- ═══ Step 3: Chọn khung giờ ═══ -->
          <div class="vdp-step border-bottom pb-4 mb-4">
            <div class="d-flex align-items-start gap-3 mb-3">
              <div class="vdp-snum">3</div>
              <div class="flex-grow-1"><div class="fw-bold fs-6 text-dark">Chọn khung giờ</div><div class="text-muted small">Chọn khung giờ cho từng sân đã chọn</div></div>
              <!-- Nút chuyển đổi (Grid vs Timeline) được khôi phục -->
              <div class="btn-group btn-group-sm" role="group">
                <button :class="['btn px-3 fw-bold', slotView==='grid' ? 'btn-success' : 'btn-outline-secondary bg-white']" @click="slotView='grid'">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> Lưới
                </button>
                <button :class="['btn px-3 fw-bold', slotView==='timeline' ? 'btn-success' : 'btn-outline-secondary bg-white']" @click="slotView='timeline'">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg> Timeline
                </button>
              </div>
            </div>

            <!-- Không có sân nào được chọn (Empty State) -->
            <div v-if="selectedCourtIds.length === 0" class="text-center py-5 rounded-4 mt-2" style="background:#f8fafc;border:2px dashed #cbd5e1">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" class="d-block mx-auto mb-2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/></svg>
              <p class="text-muted fw-bold mb-0">Vui lòng chọn sân ở bước 1 trước</p>
            </div>

            <template v-else>
              <!-- Legend Khôi Phục -->
              <div class="d-flex gap-3 mb-3 flex-wrap">
                <span class="d-flex align-items-center gap-1 text-muted small fw-semibold"><span class="vdp-lgd rounded-2 shadow-sm" style="background:#fff;border:1.5px solid #d1d5db"></span>Còn trống</span>
                <span class="d-flex align-items-center gap-1 text-muted small fw-semibold"><span class="vdp-lgd bg-success rounded-2 shadow-sm"></span>Đang chọn</span>
                <span class="d-flex align-items-center gap-1 text-muted small fw-semibold"><span class="vdp-lgd rounded-2 shadow-sm" style="background:#fca5a5;border:1px solid #f87171"></span>Đã đặt</span>
                <span class="d-flex align-items-center gap-1 text-muted small fw-semibold"><span class="vdp-lgd rounded-2 shadow-sm" style="background:#e2e8f0;border:1px solid #cbd5e1"></span>Hết hạn / Không hoạt động</span>
              </div>

              <!-- ── GRID VIEW ── -->
              <div v-if="slotView==='grid'" class="mt-3">
                <!-- Tab switcher cho từng sân đã chọn -->
                <div class="d-flex gap-2 mb-3 flex-wrap">
                  <button v-for="cid in selectedCourtIds" :key="cid"
                    :class="['btn btn-sm d-flex align-items-center gap-2 fw-bold px-3', activeEditCourtId===cid ? 'btn-success' : 'btn-outline-success bg-white']"
                    @click="activeEditCourtId=cid">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/></svg>
                    {{ getCourtName(cid) }}
                    <!-- Badge lượng slot -->
                    <span v-if="(selectedSlotsByCourtId[cid]||[]).length" class="badge rounded-pill ms-1" :class="activeEditCourtId===cid ? 'bg-white text-success' : 'bg-success text-white'" style="font-size:10px; margin-right: -4px">
                      {{ (selectedSlotsByCourtId[cid]||[]).length }}
                    </span>
                  </button>
                </div>

                <!-- Grid slots cho sân đang active -->
                <div class="row g-2">
                  <div v-for="slot in gridSlotsForActiveCourt" :key="slot.id" class="col-6 col-md-4 col-lg-3">
                    <div :class="['vdp-slot-card rounded-4 p-3 h-100 position-relative overflow-hidden',
                      isSlotSelected(activeEditCourtId, slot) ? 'bg-success text-white border-success shadow-sm' :
                      slot.status === 'BOOKED' ? (slot.bookingStatus === 'WAITING_PAYMENT' ? 'vdp-slot--pending' : 'vdp-slot--booked') :
                      isExpired(slot) ? 'vdp-slot--expired' :
                      'bg-white border-light-subtle shadow-sm']"
                      :style="isExpired(slot) ? 'cursor: not-allowed; opacity: 0.6;' : 'cursor:pointer'"
                      @click="toggleSlot(activeEditCourtId, slot)">
                      <div class="d-flex justify-content-between align-items-center mb-1 relative z-2">
                        <span class="fw-black" style="font-size:14px; letter-spacing: 0.5px">{{ slot.time }}</span>
                        <span v-if="slot.status==='BOOKED'" class="badge" 
                              :style="slot.bookingStatus==='WAITING_PAYMENT' ? 'background:#fee2e2;color:#dc2626;border:1px solid #fca5a5' : 'background:#f1f5f9;color:#64748b;border:1px solid #e2e8f0'" 
                              style="font-size:10px">
                          {{ slot.bookingStatus === 'WAITING_PAYMENT' ? 'Chờ thanh toán' : 'Đã đặt' }}
                        </span>
                        <span v-else-if="isExpired(slot)" class="badge bg-secondary text-white" style="font-size:10px; background: #94a3b8 !important">Hết hạn</span>
                        <span v-else-if="isSlotSelected(activeEditCourtId, slot)" class="badge bg-white text-success shadow-sm" style="font-size:10px">Đã chọn</span>
                      </div>
                      <div class="fw-bold z-2 position-relative" style="font-size:12px; opacity:0.9">{{ formatPrice(slot.price) }} đ</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ── TIMELINE VIEW ── -->
              <div v-if="slotView==='timeline'" class="vdp-tl mt-3">
                <div class="vdp-tl-scroll">
                  <!-- Header: Hours -->
                  <div class="vdp-tl-header d-flex">
                    <div class="vdp-tl-corner"></div>
                    <div class="vdp-tl-hours d-flex">
                      <div v-for="h in tlHours" :key="h" class="vdp-tl-hour">
                        <span v-if="h % 1 === 0">{{ tlFmtHour(h) }}</span>
                        <div :class="['vdp-tl-tic', h % 1 === 0 ? 'vdp-tl-tic--major' : 'vdp-tl-tic--minor']"></div>
                      </div>
                    </div>
                  </div>

                  <!-- Rows: Courts -->
                  <div class="vdp-tl-rows">
                    <div v-for="court in selectedCourts" :key="court.id" class="vdp-tl-row d-flex">
                      <div class="vdp-tl-court-info">
                        <div class="vdp-tl-court-name">{{ court.name }}</div>
                        <div class="vdp-tl-court-price">{{ formatPrice(court.basePrice) }} đ</div>
                      </div>
                      <div class="vdp-tl-slots position-relative d-flex">
                        <!-- Background Grid -->
                        <div v-for="h in tlHours" :key="h" 
                          :class="['vdp-tl-slot', 
                            isTlHourNoSlot(court.id,h) ? 'vdp-tl-slot--disabled' : 
                            isTlHourBooked(court.id,h) ? 'vdp-tl-slot--booked' : 
                            isTlHourExpired(court.id,h) ? 'vdp-tl-slot--expired' : 'vdp-tl-slot--available']"
                          :style="isTlHourExpired(court.id,h) ? 'cursor: not-allowed' : 'cursor:pointer'"
                          @click="toggleTlHour(court.id,h)">
                        </div>

                        <!-- Booked Segments (Occupied) -->
                        <div v-for="seg in getTlBookedSegs(court.id)" :key="`b${seg.start}`"
                          class="vdp-tl-segment vdp-tl-segment--booked position-absolute"
                          :style="tlBlockStyle(seg.start,seg.end)">
                          <span class="vdp-tl-segment-label">Đã đặt</span>
                        </div>

                        <!-- Selected Segments (User choice) -->
                        <div v-for="seg in getTlSelectedSegs(court.id)" :key="`s${seg.start}`"
                          class="vdp-tl-segment vdp-tl-segment--selected position-absolute"
                          :style="tlBlockStyle(seg.start,seg.end)"
                          @click.stop="removeTlSegment(court.id,seg)">
                          <div class="vdp-tl-segment-content">
                            <span class="vdp-tl-segment-time">{{ tlFmtHour(seg.start) }} – {{ tlFmtHour(seg.end) }}</span>
                            <button class="vdp-tl-segment-close">×</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- ═══ Step 4: Dịch vụ thêm ═══ -->
          <div class="vdp-step">
            <div class="d-flex align-items-start gap-3 mb-0" style="cursor:pointer" @click="svcOpen=!svcOpen">
              <div class="vdp-snum">4</div>
              <div class="flex-grow-1">
                <div class="fw-bold fs-6 text-dark d-flex align-items-center gap-2">Dịch vụ thêm<span class="badge bg-secondary bg-opacity-10 text-muted fw-normal" style="font-size:11px">Tuỳ chọn</span></div>
                <div class="text-muted small">Nhấn để chọn dịch vụ đi kèm</div>
              </div>
              <svg :style="svcOpen?'transform:rotate(180deg)':''" style="transition:.25s;flex-shrink:0;color:#94a3b8" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div v-if="!svcOpen && selectedServices.length" class="d-flex flex-wrap gap-2 mt-2">
              <span v-for="sid in selectedServices" :key="sid" class="badge rounded-pill d-flex align-items-center gap-1" style="background:#dcfce7;color:#15803d;border:1px solid #bbf7d0;font-size:12px;font-weight:600;padding:4px 12px">
                {{ getServiceName(sid) }}
                <span v-if="getServicePrice(sid) > 0" class="ms-1" style="opacity:0.8">(+{{ formatPrice(getServicePrice(sid)) }})</span>
                <button @click.stop="toggleService(sid)" class="btn-close btn-close-sm ms-1" style="width:10px;height:10px"></button>
              </span>
            </div>
            <transition name="acc">
              <div v-if="svcOpen" class="mt-3">
                <div class="row g-2">
                  <div v-for="svc in services" :key="svc.id" class="col-12 col-md-6">
                    <div :class="['vdp-svc-card d-flex align-items-center gap-3 p-3 rounded-3 border-2 border', isServiceSelected(svc.id)?'border-success bg-success-subtle':'border-light-subtle bg-white']" style="cursor:pointer" @click="toggleService(svc.id)">
                      <div :class="['p-2 rounded-2 d-flex', isServiceSelected(svc.id)?'bg-success text-white':'bg-success-subtle text-success']" v-html="svc.icon"></div>
                      <div class="flex-grow-1">
                        <div class="fw-bold small text-dark">{{ svc.name }}</div>
                        <div v-if="svc.price > 0" class="text-success fw-bold" style="font-size:12px">+{{ formatPrice(svc.price) }} đ</div>
                        <div v-else class="text-muted" style="font-size:11px; font-style: italic;">Miễn phí</div>
                      </div>
                      <div :class="['rounded-circle border-2 border d-flex align-items-center justify-content-center', isServiceSelected(svc.id)?'bg-success border-success text-white':'border-secondary']" style="width:20px;height:20px;flex-shrink:0">
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
        </div>

        <!-- ═══ SIDEBAR ═══ -->
        <div class="col-lg-4">
          <div class="vdp-sidebar card border-0 sticky-top" style="top:90px; background: #ffffff;">
            <div class="card-header d-flex justify-content-between align-items-center py-3 px-4">
              <span class="fw-black text-white fs-5" style="letter-spacing: 0.5px">Chi tiết đặt sân</span>
              <span v-if="totalSelectedSlotsCount" class="badge rounded-pill" style="background: rgba(255,255,255,0.2); backdrop-filter: blur(4px); font-size: 13px; font-weight: 700;">{{ selectedCourtIds.length }} sân</span>
            </div>

            <!-- Empty state -->
            <div v-if="!totalSelectedSlotsCount" class="text-center py-5 text-muted">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.3" class="d-block mx-auto mb-3"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <small class="fw-semibold" style="font-size: 14px">Vui lòng chọn sân và khung giờ bạn muốn đặt</small>
            </div>

            <div v-else class="card-body p-0">
              <!-- Ngày chọn -->
              <div class="mx-4 mt-4 mb-3 p-3 d-flex align-items-center gap-3" style="background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:12px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.01)">
                <div style="width:42px; height:42px; border-radius:10px; background:#198754; color:#fff; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow: 0 2px 6px rgba(22,163,74,0.15)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div class="fw-black text-dark fs-5">{{ selectedDateFormatted }}</div>
              </div>

              <!-- Breakdown theo từng sân -->
              <div class="px-4 mt-2">
                <div v-for="cid in selectedCourtIds" :key="cid" class="mb-3">
                  <template v-if="(selectedSlotsByCourtId[cid]||[]).length">
                    <!-- Header sân -->
                    <div class="d-flex align-items-center gap-2 mb-2">
                      <div class="bg-success text-white px-3 py-1 d-flex align-items-center gap-1 shadow-sm" style="font-size:12px;font-weight:700; border-radius: 10px">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/></svg>
                        {{ getCourtName(cid) }}
                      </div>
                    </div>
                    <!-- Các slot của sân này (merged) -->
                    <div class="border rounded-4 p-2 bg-white shadow-sm" style="border: 1.5px solid #e2e8f0 !important; border-radius: 12px !important">
                      <div v-for="g in mergedSlotsByCourt(cid)" :key="g.timeLabel" class="d-flex align-items-center gap-2 p-2 rounded-3 mb-1 vdp-slot-row">
                        <span class="flex-grow-1 fw-bold text-dark fs-6">{{ g.timeLabel }}</span>
                        <span class="fw-bold text-success" style="font-size:15px">{{ formatPrice(g.price) }} đ</span>
                        <button class="vdp-rm-btn shadow-sm" @click="g.slots.forEach(s => toggleSlot(cid, s))">×</button>
                      </div>
                      <!-- Subtotal sân này -->
                      <div class="d-flex justify-content-between px-2 pt-2 border-top mt-1">
                        <span class="text-muted fw-bold" style="font-size:12px; letter-spacing: 0.5px">Cộng {{ getCourtName(cid) }}</span>
                        <span class="fw-black text-dark" style="font-size:14px">{{ formatPrice(courtTotalByCourt(cid)) }} đ</span>
                      </div>
                    </div>
                  </template>
                </div>
              </div>

              <!-- Dịch vụ thêm -->
              <div v-if="selectedServices.length" class="px-4 mt-3">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <div style="width: 4px; height: 16px; background: #64748b; border-radius: 4px"></div>
                  <div class="text-uppercase fw-black" style="font-size:12px;letter-spacing:1px;color:#0f172a">Dịch vụ đi kèm</div>
                </div>
                <div class="border rounded-4 p-2 bg-white shadow-sm" style="border: 1.5px solid #e2e8f0 !important; border-radius: 12px !important">
                  <div v-for="sid in selectedServices" :key="sid" class="d-flex align-items-center gap-2 p-2 rounded-3 mb-1 vdp-slot-row">
                    <span class="flex-grow-1 small fw-bold text-dark">{{ getServiceName(sid) }}</span>
                    <span v-if="getServicePrice(sid) > 0" class="fw-bold text-success small">{{ formatPrice(getServicePrice(sid)) }} đ</span>
                    <button class="vdp-rm-btn shadow-sm" @click="toggleService(sid)">×</button>
                  </div>
                </div>
              </div>

              <!-- Voucher -->
              <div class="px-4 mt-4">
                <div class="input-group" style="border-radius:12px; border: 1.5px solid #e2e8f0; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.04)">
                  <span class="input-group-text border-0 bg-white ps-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  </span>
                  <input v-model="form.voucher" type="text" class="form-control border-0 shadow-none ps-2 fw-bold" :class="voucherApplied?'is-valid':voucherError?'is-invalid':''" placeholder="Mã voucher giảm giá" style="font-size: 14px; color: #1e293b"/>
                  <button class="btn btn-success fw-bold px-3 transition border-0" :disabled="!form.voucher" @click="applyVoucher" style="font-size:13px; letter-spacing: 0.5px; border-radius: 0">DÙNG</button>
                </div>
                <div v-if="voucherApplied" class="text-success fw-bold small mt-2 d-flex align-items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                  Đã áp dụng – Giảm {{ formatPrice(discount) }} đ
                </div>
                <div v-if="voucherError" class="text-danger fw-bold small mt-2">{{ voucherErrorMessage }}</div>
              </div>

              <!-- Thông tin khách hàng -->
              <div class="px-4 mt-4 mb-2">
                <div class="d-flex align-items-center gap-2 mb-3">
                  <div style="width: 4px; height: 16px; background: #16a34a; border-radius: 4px"></div>
                  <div class="text-uppercase fw-black" style="font-size:13px;letter-spacing:1px;color:#0f172a">Thông tin người đặt</div>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold mb-1 text-dark">Họ và tên <span class="text-danger">*</span></label>
                  <input v-model="form.fullname" type="text" class="form-control py-2 shadow-sm" style="border-radius:12px; font-weight:600; border: 1.5px solid #e2e8f0" placeholder="..."/>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold mb-1 text-dark">Số điện thoại <span class="text-danger">*</span></label>
                  <input v-model="form.phone" type="tel" class="form-control py-2 shadow-sm" style="border-radius:12px; font-weight:600; border: 1.5px solid #e2e8f0" placeholder="..."/>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold mb-1 text-dark">Email <span class="text-muted fw-normal">(Không bắt buộc)</span></label>
                  <input v-model="form.email" type="email" class="form-control py-2 shadow-sm" style="border-radius:12px; font-weight:600; border: 1.5px solid #e2e8f0" placeholder="..."/>
                </div>
                <div class="mb-0">
                  <label class="form-label small fw-bold mb-1 text-dark">Ghi chú yêu cầu <span class="text-muted fw-normal">(Tuỳ chọn)</span></label>
                  <textarea v-model="form.note" class="form-control py-2 shadow-sm" style="border-radius:12px; font-weight:600; border: 1.5px solid #e2e8f0" rows="2" placeholder="..."></textarea>
                </div>
              </div>

              <!-- Tổng cộng -->
              <div class="p-4 mt-4" style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius: 0 0 16px 16px; border-top: 1px solid #e2e8f0;">
                <div v-if="serviceTotal>0" class="d-flex justify-content-between fw-bold text-muted py-1" style="font-size:14px"><span>Tiền sân ({{ selectedCourtIds.length }} sân)</span><span>{{ formatPrice(courtTotal) }} đ</span></div>
                <div v-if="serviceTotal>0" class="d-flex justify-content-between fw-bold text-muted py-1" style="font-size:14px"><span>Dịch vụ thêm</span><span>{{ formatPrice(serviceTotal) }} đ</span></div>
                <div v-if="discount>0" class="d-flex justify-content-between fw-bold py-1" style="font-size:14px"><span class="text-muted">Giảm giá voucher</span><span class="text-danger fw-black">– {{ formatPrice(discount) }} đ</span></div>
                
                <div class="d-flex justify-content-between align-items-end pt-3 mt-2 border-top border-2">
                  <span class="fw-black text-dark text-uppercase" style="letter-spacing: 0.5px">Tổng cộng</span>
                  <span class="fw-black text-success" style="font-size:26px; line-height: 1">{{ formatPrice(grandTotal) }} đ</span>
                </div>

                <button class="btn btn-success w-100 fw-black shadow px-4 py-3 mt-4 d-flex align-items-center justify-content-center gap-2" style="font-size:16px; border-radius:12px; letter-spacing:1px" :disabled="!form.fullname||!form.phone" @click="handleBooking">
                  XÁC NHẬN ĐẶT SÂN
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
                <div v-if="!form.fullname||!form.phone" class="text-danger text-center mt-3 fw-bold" style="font-size:13px;">Vui lòng điền họ tên và số điện thoại!</div>
                <div class="text-muted text-center mt-2 fw-semibold" style="font-size:12px; opacity:0.8;">Bằng việc xác nhận, bạn đồng ý với chính sách hoàn hủy.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- INFO TAB -->
      <VenueInfoTab 
        v-if="activeTab==='info'"
        :venue="venue" 
        :venue-images="venueImages"
        @switch-to-booking="activeTab='booking'"
      />

      <!-- REVIEW TAB -->
      <VenueReviewTab 
        v-if="activeTab==='review'"
        @switch-to-booking="activeTab='booking'"
        @open-lightbox="({images, index}) => openLightbox(images, index)"
      />

    </div>

    <!-- A. STICKY BOTTOM BAR FOR MOBILE -->
    <div v-if="activeTab==='booking' && !venueLoading" class="vdp-mobile-bar d-lg-none position-fixed bottom-0 start-0 w-100 bg-white shadow-lg p-3 d-flex justify-content-between align-items-center" style="z-index: 1050; border-top: 1px solid #e2e8f0; border-radius: 20px 20px 0 0; padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;">
      <div>
        <div class="text-muted fw-bold text-uppercase" style="font-size: 11px; letter-spacing: 0.5px">Tổng cộng giỏ</div>
        <div class="fw-black text-success fs-4 lh-1 mt-1">{{ formatPrice(grandTotal) }} đ</div>
      </div>
      <button class="btn btn-success fw-bold px-4 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2" :disabled="!form.fullname||!form.phone||totalSelectedSlotsCount===0" @click="handleBooking" style="font-size: 15px">
        ĐẶT SÂN
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
    </div>

    </div> <!-- Đóng v-else của Loading -->

    <!-- LIGHTBOX -->
    <transition name="fade">
      <div v-if="lightbox.show" class="vdp-lightbox" @click.self="lightbox.show=false">
        <button class="vdp-lightbox__close" @click="lightbox.show=false"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        <button class="vdp-lightbox__nav vdp-lightbox__nav--prev" @click="lightbox.index=(lightbox.index-1+lightbox.images.length)%lightbox.images.length"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>
        <transition name="gfade" mode="out-in"><img :key="lightbox.index" :src="lightbox.images[lightbox.index]" class="vdp-lightbox__img"/></transition>
        <button class="vdp-lightbox__nav vdp-lightbox__nav--next" @click="lightbox.index=(lightbox.index+1)%lightbox.images.length"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>
        <div class="vdp-lightbox__counter">{{ lightbox.index+1 }} / {{ lightbox.images.length }}</div>
      </div>
    </transition>
  </div>
</template>

<script>
import '@/assets/vdp.css'
import { clubService } from '@/services/club.service.js';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { voucherService } from '@/services/voucher.service.js';

import VenueHero from '@/components/client/venue/VenueHero.vue';
import VenueInfoTab from '@/components/client/venue/VenueInfoTab.vue';
import VenueReviewTab from '@/components/client/venue/VenueReviewTab.vue';
import LoadingView from '@/components/common/LoadingView.vue';
import { socketService } from '@/services/socket.service.js';
import { authService } from '@/services/auth.service.js';

export default {
  name: 'VenueDetailView',
  components: {
    VenueHero,
    VenueInfoTab,
    VenueReviewTab,
    LoadingView
  },
  data() {
    return {
      activeTab: 'booking',
      dateOffset: 0,
      customDate: null, // Component lịch thật (mặc định trống)

      // ── MULTI-COURT SELECTION ────────────────────────────────────
      // Danh sách id các sân đang được chọn (thay cho selectedCourtId đơn)
      selectedCourtIds: [],
      // Map { courtId: [slot, slot, ...] } — slot đã chọn theo từng sân
      selectedSlotsByCourtId: {},
      // Sân đang được hiển thị/edit trong Grid view
      activeEditCourtId: null,

      selectedServices: [],
      svcOpen: false,
      slotView: 'grid',

      // ── Gallery ──────────────────────────────────────────────────
      galleryIndex: 0,
      venueImages: [],

      // ── Loading state ─────────────────────────────────────────────
      venueLoading: true,
      slotsLoading: false,

      lightbox: { show: false, images: [], index: 0 },      tlHours: [5,5.5,6,6.5,7,7.5,8,8.5,9,9.5,10,10.5,11,11.5,12,12.5,13,13.5,14,14.5,15,15.5,16,16.5,17,17.5,18,18.5,19,19.5,20,20.5,21],
      voucherApplied: false,
      voucherError: false,
      voucherErrorMessage: '',
      discount: 0,
      form: { fullname:'', phone:'', email:'', note:'', voucher:'' },

      tabs: [
        { id:'booking', label:'Đặt sân',   icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
        { id:'info',    label:'Thông tin', icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' },
        { id:'review',  label:'Đánh giá',  icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
      ],

      services: [],

      // ── Venue data (fetched from API) ──────────────────────────
      clubId: '',
      venueSlug: '',
      venue: {
        name: '',
        address: '',
        image: '',
        description: '',
        amenities: [],
        courts: [],
        openingHours: [],
      },

      // ── Slots (fetched from API per date) ─────────────────────
      allSlots: {},

    };
  },

  async created() {
    // 1. Tải thông tin người dùng từ localStorage nếu có
    const savedInfo = localStorage.getItem('user_booking_info');
    if (savedInfo) {
      try {
        const info = JSON.parse(savedInfo);
        this.form.fullname = info.fullname || '';
        this.form.phone = info.phone || '';
        this.form.email = info.email || '';
      } catch (e) {
        console.error("Lỗi khi tải thông tin người dùng từ localStorage:", e);
      }
    }

    // 2. Lấy thông tin từ API nếu đã đăng nhập và thiếu thông tin (tên/sđt)
    const token = localStorage.getItem('token');
    if (token && (!this.form.fullname || !this.form.phone)) {
      await this.fetchUserProfile();
    }
  },

  watch: {
    dateOffset() {
      // Khi đổi ngày → fetch lại slots + reset selection
      const resetSlots = {};
      this.selectedCourtIds.forEach(id => { resetSlots[id] = []; });
      this.selectedSlotsByCourtId = { ...resetSlots };
      this.fetchSlots();
    },
    // Lưu thông tin người dùng vào localStorage khi có thay đổi
    'form.fullname'(val) { this.saveUserInfo(); },
    'form.phone'(val) { this.saveUserInfo(); },
    'form.email'(val) { this.saveUserInfo(); },
  },

  async mounted() {
    this.venueSlug = this.$route.params.id;
    if (this.venueSlug) {
      await this.fetchVenueData();
      await this.fetchSlots();

      // Initialize real-time updates
      if (this.clubId) {
        socketService.connect();
        socketService.joinVenue(this.clubId);
        socketService.onBookingUpdate((data) => {
          // If anyone booked any slot in this club, refresh the slot availability
          console.log("Real-time update received, refreshing slots...");
          this.fetchSlots();
          
          // Optional: Show a small toast if you want
          // toast.info("Có người vừa đặt sân, lịch thi đấu đã được cập nhật!");
        });
      }
    }
  },

  beforeUnmount() {
    if (this.clubId) {
      socketService.leaveVenue(this.clubId);
      socketService.disconnect();
    }
  },

  computed: {
    nextSevenDays() {
      const days = ['CN','T2','T3','T4','T5','T6','T7'];
      const baseDate = this.customDate ? new Date(this.customDate) : new Date();
      return Array.from({length: 7}, (_, i) => {
        const d = new Date(baseDate.getTime());
        d.setDate(baseDate.getDate() + i);
        // Custom UTC formatting via standard locale for stability
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return {
          full: `${y}-${m}-${day}`,
          dayName: (i === 0 && !this.customDate) ? 'HÔM NAY' : days[d.getDay()],
          dayNumber: day,
          month: m
        };
      });
    },
    selectedDate()          { return this.nextSevenDays[this.dateOffset]?.full||''; },
    selectedDateFormatted() { if(!this.selectedDate)return''; const[y,m,d]=this.selectedDate.split('-'); return`${d}/${m}/${y}`; },

    // Các court object đang được chọn
    selectedCourts() {
      return this.venue.courts.filter(c => this.selectedCourtIds.includes(c.id));
    },

    // Slots hiển thị trong grid cho sân đang active
    gridSlotsForActiveCourt() {
      return this.allSlots[this.activeEditCourtId] || [];
    },

    // Tổng số slot đã chọn trên tất cả sân
    totalSelectedSlotsCount() {
      return Object.values(this.selectedSlotsByCourtId).reduce((sum, slots) => sum + slots.length, 0);
    },

    // Tổng tiền sân (tất cả sân)
    courtTotal() {
      return Object.entries(this.selectedSlotsByCourtId).reduce((sum, [, slots]) => {
        return sum + slots.reduce((s, sl) => s + sl.price, 0);
      }, 0);
    },

    serviceTotal() { return this.selectedServices.reduce((s,id)=>s+this.getServicePrice(id),0); },
    grandTotal()   { return Math.max(0, this.courtTotal + this.serviceTotal - this.discount); },
  },

  methods: {
    async fetchVenueData() {
      try {
        this.venueLoading = true;
        const res = await clubService.getClubBySlug(this.venueSlug);
        if (res.data && res.data.data) {
          const apiClub = res.data.data;
          this.clubId = apiClub.id;
          
          this.venue = {
            name: apiClub.name || '',
            address: `${apiClub.address}, ${apiClub.ward ? apiClub.ward + ', ' : ''}${apiClub.district}, ${apiClub.city}`,
            image: apiClub.coverImageUrl || '',
            description: apiClub.description || '',
            amenities: apiClub.amenities?.map(a => ({
              id: a.amenity.id, 
              name: a.amenity.name, 
              icon: a.amenity.icon,
              price: Number(a.price || 0)
            })) || [],
            courts: apiClub.courts?.map(c => ({
              id: c.id, 
              name: c.name, 
              basePrice: c.pricings?.[0]?.pricePerHour ? Number(c.pricings[0].pricePerHour) : 0
            })) || [],
            openingHours: apiClub.openingHours?.map(h => {
              const days = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];
              const open = new Date(h.openTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
              const close = new Date(h.closeTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
              return {
                day: days[h.dayOfWeek],
                open,
                close,
                isClosed: h.isClosed
              }
            }) || []
          };

          // Sử dụng chính danh sách amenities làm các dịch vụ/tiện ích có thể chọn ở Step 4
          this.services = [...this.venue.amenities];
          
          // Set venueImages if empty
          if (this.venueImages.length === 0 && apiClub.images) {
            this.venueImages = apiClub.images.map(img => ({
              url: img.url,
              caption: img.caption || 'Hình ảnh sân'
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching venue:", err);
      } finally {
        this.venueLoading = false;
      }
    },

    async fetchSlots() {
      if (!this.venueSlug || !this.selectedDate) return;
      try {
        this.slotsLoading = true;
        const res = await clubService.getSlotsByClub(this.venueSlug, this.selectedDate);
        if (res.data && res.data.data) {
          const courtsData = res.data.data.courts || [];
          const newAllSlots = {};
          
          courtsData.forEach(court => {
            newAllSlots[court.id] = court.slots.map(slot => ({
              id: slot.id,
              time: slot.time,
              startTime: slot.startTime,
              price: slot.price,
              status: slot.status
            }));
          });
          
          this.allSlots = newAllSlots;
          
          // Cập nhật selectedCourtIds nếu chưa có (chọn sân đầu tiên làm default)
          if (this.venue.courts && this.venue.courts.length > 0 && this.selectedCourtIds.length === 0) {
              const defaultCourtId = this.venue.courts[0].id;
              this.toggleCourt(defaultCourtId);
          }
        }
      } catch (err) {
        console.error("Error fetching slots:", err);
      } finally {
        this.slotsLoading = false;
        
        // Sau khi fetch xong, check xem có slot nào user đang chọn mà bị người khác book mất không
        this.checkAndRemoveBookedSlots();
      }
    },

    checkAndRemoveBookedSlots() {
      let removedAny = false;
      const updatedSelectedSlots = { ...this.selectedSlotsByCourtId };

      Object.keys(updatedSelectedSlots).forEach(courtId => {
        const selectedForCourt = updatedSelectedSlots[courtId] || [];
        const availableSlotsForCourt = this.allSlots[courtId] || [];

        const stillAvailable = selectedForCourt.filter(selectedSlot => {
          const currentSlot = availableSlotsForCourt.find(s => s.id === selectedSlot.id);
          // Nếu slot ko tìm thấy hoặc status ko phải AVAILABLE thì coi như bị mất
          const isLost = !currentSlot || currentSlot.status !== 'AVAILABLE';
          if (isLost) removedAny = true;
          return !isLost;
        });

        updatedSelectedSlots[courtId] = stillAvailable;
      });

      if (removedAny) {
        this.selectedSlotsByCourtId = updatedSelectedSlots;
        toast.warning("Một số khung giờ bạn đang chọn vừa được người khác đặt. Vui lòng kiểm tra lại!", { 
          position: 'top-center',
          autoClose: 5000 
        });
      }
    },

    formatPrice(v)      { return new Intl.NumberFormat('vi-VN',{maximumFractionDigits:0}).format(v); },
    getCourtName(id)    { return this.venue.courts.find(c=>c.id===id)?.name||''; },
    getServiceName(id)  { return this.services.find(s=>s.id===id)?.name||''; },
    getServicePrice(id) { return this.services.find(s=>s.id===id)?.price||0; },
    parseHour(t)        { const[h,m]=t.split(':').map(Number);return h+m/60; },
    slotStart(slot)     { return this.parseHour(slot.time.split(' – ')[0]); },
    slotEnd(slot)       { return this.parseHour(slot.time.split(' – ')[1]); },
    tlFmtHour(h)        { return`${String(Math.floor(h)).padStart(2,'0')}:${h%1===0.5?'30':'00'}`; },

    isExpired(slot) {
      if (!this.selectedDate) return false;
      
      const now = new Date();
      const [year, month, day] = this.selectedDate.split('-').map(Number);
      const slotDate = new Date(year, month - 1, day);
      
      // Nếu là ngày trong quá khứ -> Hết hạn hết
      if (slotDate.toDateString() !== now.toDateString()) {
        return slotDate < now && slotDate.toDateString() !== now.toDateString();
      }
      
      // Nếu là hôm nay -> So sánh giờ
      const startTimeStr = slot.time.split(' – ')[0]; // E.g. "15:00"
      const [h, m] = startTimeStr.split(':').map(Number);
      
      const slotStartTime = new Date(year, month - 1, day, h, m);
      return now > slotStartTime;
    },

    // ── MULTI-COURT SELECTION ────────────────────────────────────
    isCourtSelected(id) { return this.selectedCourtIds.includes(id); },

    toggleCourt(id) {
      const i = this.selectedCourtIds.indexOf(id);
      if (i > -1) {
        // Bỏ chọn sân → xoá slot của sân đó
        this.selectedCourtIds.splice(i, 1);
        const newSlots = { ...this.selectedSlotsByCourtId };
        delete newSlots[id];
        this.selectedSlotsByCourtId = newSlots;
        
        // Nếu activeEditCourtId bị xoá → chuyển sang sân đầu tiên còn lại
        if (this.activeEditCourtId === id) {
          this.activeEditCourtId = this.selectedCourtIds[0] || null;
        }
      } else {
        // Thêm sân
        this.selectedCourtIds.push(id);
        if (!this.selectedSlotsByCourtId[id]) {
          this.selectedSlotsByCourtId = { ...this.selectedSlotsByCourtId, [id]: [] };
        }
        // Auto-focus vào sân mới chọn
        this.activeEditCourtId = id;
      }
    },

    clearAllSlots() {
      const reset = {};
      this.selectedCourtIds.forEach(id => { reset[id] = []; });
      this.selectedSlotsByCourtId = reset;
    },

    // ── SLOT SELECTION (theo courtId) ────────────────────────────
    isSlotSelected(courtId, slot) {
      return (this.selectedSlotsByCourtId[courtId] || []).some(x => x.id === slot.id);
    },

    toggleSlot(courtId, slot) {
      if (slot.status === 'BOOKED' || slot.status === 'LOCKED' || this.isExpired(slot)) return;
      
      const currentSlots = this.selectedSlotsByCourtId[courtId] || [];
      const slots = [...currentSlots];
      
      const i = slots.findIndex(x => x.id === slot.id);
      if (i > -1) slots.splice(i, 1);
      else slots.push(slot);
      
      // Force UI reactivity via new object reference
      this.selectedSlotsByCourtId = { 
        ...this.selectedSlotsByCourtId, 
        [courtId]: slots 
      };
    },

    // Tổng tiền cho 1 sân cụ thể
    courtTotalByCourt(courtId) {
      return (this.selectedSlotsByCourtId[courtId] || []).reduce((s, sl) => s + sl.price, 0);
    },

    // Merge các slot liên tiếp của 1 sân thành các segment (giống mergedSlots cũ)
    mergedSlotsByCourt(courtId) {
      const slots = this.selectedSlotsByCourtId[courtId] || [];
      if (!slots.length) return [];
      const sorted = [...slots].sort((a, b) => this.slotStart(a) - this.slotStart(b));
      const groups = []; let cur = null;
      sorted.forEach(slot => {
        const start = this.slotStart(slot), end = this.slotEnd(slot);
        if (cur && Math.abs(cur.end - start) < 0.01) { cur.end = end; cur.price += slot.price; cur.slots.push(slot); }
        else { if (cur) groups.push(cur); cur = { start, end, price: slot.price, slots: [slot] }; }
      });
      if (cur) groups.push(cur);
      return groups.map(g => ({ timeLabel: `${this.tlFmtHour(g.start)} – ${this.tlFmtHour(g.end)}`, price: g.price, slots: g.slots }));
    },

    isServiceSelected(id){ return this.selectedServices.includes(id); },
    toggleService(id)    { const i=this.selectedServices.indexOf(id);if(i>-1)this.selectedServices.splice(i,1);else this.selectedServices.push(id); },

    async applyVoucher() {
      if (!this.form.voucher.trim()) return;
      this.voucherError = false;
      this.voucherApplied = false;
      this.voucherErrorMessage = '';
      
      const code = this.form.voucher.trim().toUpperCase();
      const clubId = this.clubId;
      const orderAmount = this.courtTotal + this.serviceTotal;

      try {
        const res = await voucherService.validateVoucher(code, clubId, orderAmount);
        if (res && res.data) {
          const v = res.data;
          // Calculate discount if type is PERCENTAGE vs FIXED
          if (v.type === 'PERCENTAGE') {
            let disc = orderAmount * (v.value / 100);
            if (v.maxDiscountAmount && disc > v.maxDiscountAmount) disc = v.maxDiscountAmount;
            this.discount = disc;
          } else {
            this.discount = v.value;
          }
          this.voucherApplied = true;
          toast.success("Áp dụng mã giảm giá thành công!");
        }
      } catch (err) {
        console.error("Voucher error:", err);
        this.voucherError = true;
        this.voucherErrorMessage = err.response?.data?.message || "Mã giảm giá không hợp lệ";
        this.discount = 0;
      }
    },

    openLightbox(images,index) { this.lightbox={show:true,images,index}; },

    // ── Timeline ─────────────────────────────────────────────────
    tlBlockStyle(start,end) { const total=this.tlHours.length,iStart=this.tlHours.indexOf(start),iEnd=this.tlHours.indexOf(end),colEnd=iEnd===-1?total:iEnd;return{left:`calc(${(iStart/total)*100}% + 1px)`,width:`calc(${((colEnd-iStart)/total)*100}% - 3px)`}; },
    getTlBookedSegs(cid) { return(this.allSlots[cid]||[]).filter(s=>s.status==='BOOKED').map(s=>({start:this.slotStart(s),end:this.slotEnd(s)})); },
    getTlSelectedSegs(cid) {
      const sel = this.selectedSlotsByCourtId[cid] || [];
      const segs = []; let cur = null;
      [...sel].sort((a,b)=>this.slotStart(a)-this.slotStart(b)).forEach(s=>{
        const a=this.slotStart(s),b=this.slotEnd(s);
        if(cur&&cur.end===a){cur.end=b;}else{if(cur)segs.push(cur);cur={start:a,end:b};}
      });
      if(cur)segs.push(cur);
      return segs;
    },
    isTlHourBooked(cid,h) { return(this.allSlots[cid]||[]).some(s=>s.status==='BOOKED'&&h>=this.slotStart(s)&&h<this.slotEnd(s)); },
    isTlHourExpired(cid,h) {
      if(!this.selectedDate) return false;
      const now = new Date();
      const [year, month, day] = this.selectedDate.split('-').map(Number);
      const slotDate = new Date(year, month - 1, day);
      if (slotDate.toDateString() !== now.toDateString()) return slotDate < now;
      
      return h < (now.getHours() + now.getMinutes()/60);
    },
    isTlHourNoSlot(cid,h) { return!(this.allSlots[cid]||[]).some(s=>h>=this.slotStart(s)&&h<this.slotEnd(s)); },
    toggleTlHour(cid,h) {
      if(this.isTlHourNoSlot(cid,h)||this.isTlHourBooked(cid,h))return;
      const slot=(this.allSlots[cid]||[]).find(s=>h>=this.slotStart(s)&&h<this.slotEnd(s));
      if(slot) this.toggleSlot(cid, slot);
    },
    removeTlSegment(cid,seg) {
      (this.allSlots[cid]||[]).filter(s=>this.slotStart(s)>=seg.start&&this.slotStart(s)<seg.end).forEach(s=>this.toggleSlot(cid, s));
    },

    // ── Booking ──────────────────────────────────────────────────
    handleBooking() {
      if (!this.totalSelectedSlotsCount) {
        toast.error("Vui lòng chọn ít nhất 1 khung giờ!", { position: 'top-center' });
        return;
      }
      
      // Gom tất cả slot của các sân thành 1 array flat để truyền sang checkout
      const allSelectedSlots = Object.entries(this.selectedSlotsByCourtId).flatMap(([courtId, slots]) =>
        slots.map(s => ({ ...s, courtId, courtName: this.getCourtName(courtId) }))
      );
      
      // Chuyển đổi sang format slots: { courtId, startTime } cho Hybrid logic
      const slots = allSelectedSlots.map(s => ({
        courtId: s.courtId,
        startTime: s.startTime
      }));

      // Gom services đầy đủ (id, name, price) thay vì chỉ gửi IDs
      const selectedServicesData = this.selectedServices.map(sid => {
        const svc = this.services.find(s => s.id === sid);
        return svc ? { id: svc.id, name: svc.name, price: svc.price } : null;
      }).filter(Boolean);

      const bookingData = {
        club_id: this.clubId,
        club_slug: this.venueSlug, // use current slug
        venue_name: this.venue.name,
        courts: JSON.stringify(this.selectedCourtIds.map(id => ({ id, name: this.getCourtName(id) }))),
        date: this.selectedDate,
        slots: JSON.stringify(allSelectedSlots),
        booking_slots: JSON.stringify(slots),
        services: JSON.stringify(selectedServicesData),
        total: this.grandTotal,
        name: this.form.fullname,
        phone: this.form.phone,
        email: this.form.email,
        note: this.form.note,
        voucher_code: this.voucherApplied ? this.form.voucher.trim().toUpperCase() : '',
      };

      sessionStorage.setItem('pending_booking', JSON.stringify(bookingData));
      this.$router.push({ path: "/checkout" });
    },

    saveUserInfo() {
      localStorage.setItem('user_booking_info', JSON.stringify({
        fullname: this.form.fullname,
        phone: this.form.phone,
        email: this.form.email
      }));
    },

    async fetchUserProfile() {
      try {
        const res = await authService.getMe();
        if (res.data && res.data.data) {
          const u = res.data.data;
          // Chỉ ghi đè nếu trường đó đang trống (ưu tiên thông tin thủ công/localStorage)
          if (!this.form.fullname) this.form.fullname = u.fullName || u.name || '';
          if (!this.form.phone) this.form.phone = u.phone || '';
          if (!this.form.email) this.form.email = u.email || '';
          this.saveUserInfo();
        }
      } catch (err) {
        console.log("Lỗi fetchUserProfile (có thể do token hết hạn):", err);
      }
    },
  },
};
</script>