<template>
  <form
    class="filters-form"
    role="search"
    aria-label="Lọc sân thể thao"
    @submit.prevent
  >
    <!-- ── Filter header ── -->
    <div class="filters-header">
      <h3 class="filters-title">Bộ lọc</h3>
      <button
        v-if="activeCount > 0"
        type="button"
        class="clear-all-btn"
        @click="clearAll"
        :aria-label="`Xóa tất cả ${activeCount} bộ lọc`"
      >
        Xóa tất cả
        <span class="clear-badge" aria-hidden="true">{{ activeCount }}</span>
      </button>
    </div>

    <!-- ══ SPORT SELECTOR ══ -->
    <fieldset class="filter-group" v-if="sportOptions && sportOptions.length">
      <legend class="filter-legend">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
        Môn thể thao
      </legend>
      <div class="sport-grid">
        <label
          v-for="opt in sportOptions"
          :key="opt.value"
          class="sport-chip"
          :class="{ active: modelValue.sport === opt.value }"
        >
          <input
            type="radio"
            name="sport"
            :value="opt.value"
            :checked="modelValue.sport === opt.value"
            class="sr-only"
            @change="updateField('sport', opt.value)"
          />
          {{ opt.label }}
        </label>
      </div>
    </fieldset>

    <!-- ══ BOOKING METHOD ══ -->
    <fieldset class="filter-group">
      <legend class="filter-legend">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Phương thức đặt chỗ
        <button type="button" class="info-btn" title="Các loại hình đặt sân" aria-label="Thông tin về phương thức đặt chỗ">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        </button>
      </legend>
      <label
        v-for="opt in bookingOptions"
        :key="opt.value"
        class="filter-checkbox"
        :class="{ checked: modelValue.booking.includes(opt.value) }"
      >
        <input
          type="checkbox"
          :value="opt.value"
          :checked="modelValue.booking.includes(opt.value)"
          @change="toggleArray('booking', opt.value)"
          :aria-label="opt.label"
        />
        <span class="checkmark" aria-hidden="true"></span>
        <span class="check-label">{{ opt.label }}</span>
      </label>
    </fieldset>

    <!-- ══ SEARCH BY DATE ══ -->
    <fieldset class="filter-group">
      <legend class="filter-legend">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Tìm theo ngày / giờ
      </legend>

      <label class="filter-checkbox" :class="{ checked: modelValue.byDate }">
        <input
          type="checkbox"
          :checked="modelValue.byDate"
          @change="updateField('byDate', $event.target.checked)"
        />
        <span class="checkmark" aria-hidden="true"></span>
        <span class="check-label">Chọn ngày cụ thể</span>
      </label>

      <transition name="expand">
        <div v-if="modelValue.byDate" class="date-pickers">
          <label class="date-field">
            <span class="date-label">Ngày</span>
            <input
              type="date"
              class="date-input"
              :value="modelValue.date"
              :min="today"
              @change="updateField('date', $event.target.value)"
              aria-label="Chọn ngày"
            />
          </label>
          <label class="date-field">
            <span class="date-label">Giờ bắt đầu</span>
            <input
              type="time"
              class="date-input"
              :value="modelValue.startTime"
              @change="updateField('startTime', $event.target.value)"
              aria-label="Giờ bắt đầu"
            />
          </label>
        </div>
      </transition>
    </fieldset>

    <!-- ══ RADIUS ══ -->
    <fieldset class="filter-group">
      <legend class="filter-legend">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Bán kính tìm kiếm
      </legend>

      <!-- Visual slider -->
      <div class="radius-slider-wrap">
        <input
          type="range"
          class="radius-slider"
          :min="radiusMin"
          :max="radiusMax"
          :value="modelValue.radius"
          @input="updateField('radius', $event.target.value)"
          :aria-label="`Bán kính ${modelValue.radius} km`"
          :aria-valuenow="modelValue.radius"
          :aria-valuemin="radiusMin"
          :aria-valuemax="radiusMax"
        />
        <div class="radius-labels">
          <span>{{ radiusMin }} km</span>
          <strong class="radius-val">{{ modelValue.radius }} km</strong>
          <span>{{ radiusMax }} km</span>
        </div>
      </div>

      <!-- Quick presets -->
      <div class="radius-presets" role="group" aria-label="Khoảng cách nhanh">
        <button
          v-for="opt in radiusOptions"
          :key="opt.value"
          type="button"
          class="preset-btn"
          :class="{ active: modelValue.radius === opt.value }"
          :aria-pressed="(modelValue.radius === opt.value).toString()"
          @click="updateField('radius', opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </fieldset>

    <!-- ══ FORMAT ══ -->
    <fieldset class="filter-group">
      <legend class="filter-legend">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
        Hình thức sân
      </legend>
      <div class="toggle-group" role="group">
        <label
          v-for="opt in formatOptions"
          :key="opt.value"
          class="toggle-chip"
          :class="{ active: modelValue.format.includes(opt.value) }"
        >
          <input
            type="checkbox"
            :value="opt.value"
            :checked="modelValue.format.includes(opt.value)"
            class="sr-only"
            @change="toggleArray('format', opt.value)"
          />
          {{ opt.label }}
        </label>
      </div>
    </fieldset>

    <!-- ══ SURFACE ══ -->
    <fieldset class="filter-group">
      <legend class="filter-legend">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        Bề mặt sân
      </legend>
      <label
        v-for="opt in surfaceOptions"
        :key="opt.value"
        class="filter-checkbox"
        :class="{ checked: modelValue.surface.includes(opt.value) }"
      >
        <input
          type="checkbox"
          :value="opt.value"
          :checked="modelValue.surface.includes(opt.value)"
          @change="toggleArray('surface', opt.value)"
        />
        <span class="checkmark" aria-hidden="true"></span>
        <span class="check-label">{{ opt.label }}</span>
      </label>
    </fieldset>

    <!-- ══ FACILITY ══ -->
    <fieldset class="filter-group">
      <legend class="filter-legend">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
        Tiện ích
      </legend>
      <label
        v-for="opt in facilityOptions"
        :key="opt.value"
        class="filter-checkbox"
        :class="{ checked: modelValue.facility.includes(opt.value) }"
      >
        <input
          type="checkbox"
          :value="opt.value"
          :checked="modelValue.facility.includes(opt.value)"
          @change="toggleArray('facility', opt.value)"
        />
        <span class="checkmark" aria-hidden="true"></span>
        <span class="check-label">{{ opt.label }}</span>
      </label>
    </fieldset>

    <!-- ── Active filters summary ── -->
    <div v-if="activeCount > 0" class="active-filters-summary" aria-live="polite" aria-label="Bộ lọc đang áp dụng">
      <div class="active-chips">
        <span
          v-for="chip in activeChips"
          :key="chip.key"
          class="active-chip"
        >
          {{ chip.label }}
          <button
            type="button"
            class="chip-remove"
            @click="removeFilter(chip)"
            :aria-label="`Xóa bộ lọc ${chip.label}`"
          >×</button>
        </span>
      </div>
    </div>

    <!-- ── Apply button (mobile) ── -->
    <button type="button" class="apply-btn" @click="$emit('apply')">
      Áp dụng
      <span v-if="activeCount > 0">({{ activeCount }})</span>
    </button>
  </form>
</template>

<script>
export default {
  name: "BookingFilters",

  props: {
    modelValue:      { type: Object,  required: true },
    bookingOptions:  { type: Array,   default: () => [] },
    formatOptions:   { type: Array,   default: () => [] },
    surfaceOptions:  { type: Array,   default: () => [] },
    radiusOptions:   { type: Array,   default: () => [] },
    facilityOptions: { type: Array,   default: () => [] },
    sportOptions:    { type: Array,   default: () => [] },
  },

  emits: ["update:modelValue", "clear", "apply"],

  data() {
    return {
      today:     new Date().toISOString().split("T")[0],
      radiusMin: "1",
      radiusMax: "50",
    };
  },

  computed: {
    activeCount() {
      let n = 0;
      const v = this.modelValue;
      if (v.booking?.length)  n += v.booking.length;
      if (v.format?.length)   n += v.format.length;
      if (v.surface?.length)  n += v.surface.length;
      if (v.facility?.length) n += v.facility.length;
      if (v.byDate)           n += 1;
      if (v.radius && v.radius !== "5") n += 1;
      return n;
    },

    // Build flat list of active filter chips for summary
    activeChips() {
      const chips = [];
      const v = this.modelValue;
      const findLabel = (opts, val) => opts.find(o => o.value === val)?.label || val;

      (v.booking  || []).forEach(val => chips.push({ key: `booking-${val}`,  field: "booking",  val, label: findLabel(this.bookingOptions, val) }));
      (v.format   || []).forEach(val => chips.push({ key: `format-${val}`,   field: "format",   val, label: findLabel(this.formatOptions, val) }));
      (v.surface  || []).forEach(val => chips.push({ key: `surface-${val}`,  field: "surface",  val, label: findLabel(this.surfaceOptions, val) }));
      (v.facility || []).forEach(val => chips.push({ key: `facility-${val}`, field: "facility", val, label: findLabel(this.facilityOptions, val) }));
      if (v.byDate)                    chips.push({ key: "byDate", field: "byDate", val: true, label: "Tìm theo ngày" });
      if (v.radius && v.radius !== "5") chips.push({ key: "radius", field: "radius", val: v.radius, label: `Bán kính ${v.radius} km` });
      return chips;
    },
  },

  methods: {
    // Toggle item in array field
    toggleArray(field, value) {
      const current = [...(this.modelValue[field] || [])];
      const idx = current.indexOf(value);
      if (idx === -1) current.push(value);
      else current.splice(idx, 1);
      this.$emit("update:modelValue", { ...this.modelValue, [field]: current });
    },

    // Set single value field
    updateField(field, value) {
      this.$emit("update:modelValue", { ...this.modelValue, [field]: value });
    },

    // Remove individual filter chip
    removeFilter({ field, val }) {
      if (field === "byDate") {
        this.updateField("byDate", false);
      } else if (field === "radius") {
        this.updateField("radius", "5");
      } else {
        const updated = (this.modelValue[field] || []).filter(v => v !== val);
        this.$emit("update:modelValue", { ...this.modelValue, [field]: updated });
      }
    },

    // Clear all filters
    clearAll() {
      this.$emit("update:modelValue", {
        sport:     this.modelValue.sport,
        booking:   [],
        byDate:    false,
        date:      null,
        startTime: null,
        format:    [],
        surface:   [],
        radius:    "5",
        facility:  [],
      });
      this.$emit("clear");
    },
  },
};
</script>

<style scoped>
/* ── Variables ── */
.filters-form {
  --green:       #3dd56d;
  --green-dark:  #28b857;
  --green-light: rgba(61,213,109,.12);
  --text:        #111827;
  --muted:       #6b7280;
  --border:      #e5e7eb;
  --bg:          #f9fafb;
  --radius:      8px;

  font-family: "Barlow", sans-serif;
  font-size: 13.5px;
  color: var(--text);
}

/* ── Screen reader only ── */
.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); border: 0;
}

/* ── Filters header ── */
.filters-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; border-bottom: 1.5px solid var(--border);
}

.filters-title {
  font-family: "Barlow Condensed", sans-serif;
  font-size: 1rem; font-weight: 800;
  letter-spacing: 0.06em; text-transform: uppercase;
  margin: 0; color: var(--text);
}

.clear-all-btn {
  display: flex; align-items: center; gap: 5px;
  background: none; border: none; cursor: pointer;
  font-size: 12px; font-weight: 600; color: #dc2626;
  padding: 4px 6px; border-radius: 5px;
  transition: background .15s;
}
.clear-all-btn:hover { background: #fef2f2; }
.clear-badge {
  background: #dc2626; color: #fff; border-radius: 999px;
  width: 16px; height: 16px; display: flex;
  align-items: center; justify-content: center; font-size: 10px;
}

/* ── Filter groups ── */
.filter-group {
  border: none; margin: 0; padding: 0;
  border-bottom: 1px solid var(--border);
}

.filter-legend {
  width: 100%;
  display: flex; align-items: center; gap: 7px;
  padding: 13px 18px 10px;
  font-size: 11.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--muted); cursor: default;
}
.filter-legend svg {
  width: 13px; height: 13px;
  stroke: currentColor; fill: none; stroke-width: 2;
  flex-shrink: 0;
}

.info-btn {
  margin-left: auto; background: none; border: none;
  color: var(--muted); cursor: pointer; padding: 0;
  display: flex; align-items: center;
}
.info-btn svg { width: 13px; height: 13px; stroke: currentColor; fill: none; stroke-width: 2; }
.info-btn:hover { color: var(--text); }

/* ── Sport grid ── */
.sport-grid {
  display: flex; flex-wrap: wrap; gap: 6px;
  padding: 2px 18px 14px;
}
.sport-chip {
  display: inline-flex; align-items: center;
  padding: 5px 12px; border-radius: 999px;
  border: 1.5px solid var(--border);
  font-size: 12px; font-weight: 600; cursor: pointer;
  transition: all .18s; color: var(--muted);
  background: #fff;
}
.sport-chip:hover { border-color: var(--green); color: var(--text); }
.sport-chip.active { background: var(--text); border-color: var(--text); color: #fff; }

/* ── Checkboxes ── */
.filter-checkbox {
  display: flex; align-items: center; gap: 9px;
  padding: 7px 18px;
  cursor: pointer;
  transition: background .12s;
}
.filter-checkbox:hover { background: var(--bg); }
.filter-checkbox input[type="checkbox"] {
  position: absolute; opacity: 0; width: 0; height: 0;
}

.checkmark {
  width: 16px; height: 16px; border-radius: 4px;
  border: 1.5px solid var(--border);
  background: #fff; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: all .18s;
}
.filter-checkbox input:checked + .checkmark {
  background: var(--green); border-color: var(--green);
}
.filter-checkbox input:checked + .checkmark::after {
  content: ""; display: block;
  width: 4px; height: 7px;
  border: 2px solid #fff;
  border-top: none; border-left: none;
  transform: rotate(45deg) translate(-1px, -1px);
}
.filter-checkbox:focus-within .checkmark {
  box-shadow: 0 0 0 3px var(--green-light);
}

.check-label { font-size: 13px; color: var(--text); line-height: 1.3; }
.filter-checkbox.checked .check-label { font-weight: 600; }

/* ── Date pickers ── */
.date-pickers {
  display: flex; flex-direction: column; gap: 8px;
  padding: 4px 18px 14px;
}
.date-field { display: flex; flex-direction: column; gap: 4px; }
.date-label { font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }
.date-input {
  border: 1.5px solid var(--border); border-radius: 7px;
  padding: 7px 10px; font-size: 13px; font-family: "Barlow", sans-serif;
  color: var(--text); background: #fff; outline: none;
  transition: border-color .18s;
}
.date-input:focus { border-color: var(--green); box-shadow: 0 0 0 3px var(--green-light); }

/* ── Radius slider ── */
.radius-slider-wrap { padding: 4px 18px 10px; }
.radius-slider {
  width: 100%; -webkit-appearance: none; height: 4px;
  border-radius: 2px; background: var(--border); outline: none;
  background: linear-gradient(
    to right,
    var(--green) 0%,
    var(--green) calc(var(--thumb-pct, 40%) ),
    var(--border) calc(var(--thumb-pct, 40%)),
    var(--border) 100%
  );
}
.radius-slider::-webkit-slider-thumb {
  -webkit-appearance: none; width: 18px; height: 18px;
  border-radius: 50%; background: var(--text);
  border: 3px solid #fff; box-shadow: 0 1px 6px rgba(0,0,0,.2);
  cursor: pointer; transition: transform .15s;
}
.radius-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
.radius-slider::-moz-range-thumb {
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--text); border: 3px solid #fff;
  box-shadow: 0 1px 6px rgba(0,0,0,.2); cursor: pointer;
}

.radius-labels {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 6px; font-size: 11.5px; color: var(--muted);
}
.radius-val { font-family: "Barlow Condensed", sans-serif; font-size: 1.05rem; font-weight: 800; color: var(--text); }

.radius-presets {
  display: flex; flex-wrap: wrap; gap: 5px;
  padding: 0 18px 14px;
}
.preset-btn {
  background: #fff; border: 1.5px solid var(--border);
  border-radius: 999px; padding: 4px 11px;
  font-size: 11.5px; font-weight: 600; color: var(--muted);
  cursor: pointer; transition: all .15s;
}
.preset-btn:hover { border-color: var(--green); color: var(--text); }
.preset-btn.active { background: var(--green); border-color: var(--green); color: #fff; }

/* ── Toggle chips (format) ── */
.toggle-group { display: flex; gap: 7px; padding: 4px 18px 14px; flex-wrap: wrap; }
.toggle-chip {
  display: inline-flex; align-items: center;
  padding: 6px 14px; border-radius: 8px;
  border: 1.5px solid var(--border);
  font-size: 12.5px; font-weight: 600; cursor: pointer;
  transition: all .18s; color: var(--muted);
  background: #fff;
}
.toggle-chip:hover { border-color: var(--green); color: var(--text); }
.toggle-chip.active { background: var(--green-light); border-color: var(--green); color: #166534; }
.toggle-chip input { position: absolute; opacity: 0; }

/* ── Active filters summary ── */
.active-filters-summary {
  padding: 12px 18px;
  border-top: 1px dashed var(--border);
  background: #fafafa;
}
.active-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.active-chip {
  display: inline-flex; align-items: center; gap: 5px;
  background: var(--green-light); color: #166534;
  border-radius: 999px; padding: 4px 8px 4px 11px;
  font-size: 11.5px; font-weight: 600;
  border: 1px solid rgba(61,213,109,.3);
}
.chip-remove {
  width: 14px; height: 14px; border-radius: 50%;
  background: rgba(22,163,74,.2); border: none;
  color: #166534; font-size: 11px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  line-height: 1; padding: 0; transition: background .15s;
}
.chip-remove:hover { background: rgba(22,163,74,.4); }

/* ── Apply button (visible on mobile) ── */
.apply-btn {
  display: none; width: calc(100% - 36px);
  margin: 14px 18px; padding: 12px;
  background: var(--text); color: #fff; border: none;
  border-radius: 9px; font-family: "Barlow Condensed", sans-serif;
  font-size: 1rem; font-weight: 800; letter-spacing: 0.06em;
  text-transform: uppercase; cursor: pointer;
  transition: background .2s;
}
.apply-btn:hover { background: #1f2937; }

/* ── Expand transition ── */
.expand-enter-active, .expand-leave-active { transition: all .28s ease; overflow: hidden; }
.expand-enter-from, .expand-leave-to { max-height: 0; opacity: 0; }
.expand-enter-to, .expand-leave-from { max-height: 200px; opacity: 1; }

/* ── Mobile ── */
@media (max-width: 900px) {
  .apply-btn { display: block; }
}
</style>