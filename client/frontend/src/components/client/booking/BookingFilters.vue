<template>
  <aside class="sidebar">
    <!-- Phương thức đặt chỗ -->
    <div class="filter-group">
      <h3 class="filter-title">
        Phương thức đặt chỗ
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </h3>
      <label v-for="opt in bookingOptions" :key="opt.value" class="filter-checkbox">
        <input
          type="checkbox"
          :value="opt.value"
          :checked="modelValue.booking.includes(opt.value)"
          @change="toggleFilter('booking', opt.value)"
        />
        <span class="checkmark"></span>
        {{ opt.label }}
      </label>
    </div>

    <!-- Tìm kiếm theo thời gian -->
    <div class="filter-group">
      <h3 class="filter-title">
        Tìm kiếm theo thời gian
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </h3>
      <label class="filter-checkbox">
        <input
          type="checkbox"
          :checked="modelValue.byDate"
          @change="updateFilter('byDate', $event.target.checked)"
        />
        <span class="checkmark"></span>
        Nhấp chuột để chọn ngày
      </label>
    </div>

    <!-- Định dạng -->
    <div class="filter-group">
      <h3 class="filter-title">Định dạng</h3>
      <label v-for="opt in formatOptions" :key="opt.value" class="filter-checkbox">
        <input
          type="checkbox"
          :value="opt.value"
          :checked="modelValue.format.includes(opt.value)"
          @change="toggleFilter('format', opt.value)"
        />
        <span class="checkmark"></span>
        {{ opt.label }}
      </label>
    </div>

    <!-- Bề mặt -->
    <div class="filter-group">
      <h3 class="filter-title">Bề mặt</h3>
      <label v-for="opt in surfaceOptions" :key="opt.value" class="filter-checkbox">
        <input
          type="checkbox"
          :value="opt.value"
          :checked="modelValue.surface.includes(opt.value)"
          @change="toggleFilter('surface', opt.value)"
        />
        <span class="checkmark"></span>
        {{ opt.label }}
      </label>
    </div>

    <!-- Bán kính -->
    <div class="filter-group">
      <h3 class="filter-title">Bán kính</h3>
      <label v-for="opt in radiusOptions" :key="opt.value" class="filter-radio">
        <input
          type="radio"
          name="radius"
          :value="opt.value"
          :checked="modelValue.radius === opt.value"
          @change="updateFilter('radius', opt.value)"
        />
        <span class="radiomark"></span>
        {{ opt.label }}
      </label>
    </div>

    <!-- Cơ sở -->
    <div class="filter-group">
      <h3 class="filter-title">Cơ sở</h3>
      <label v-for="opt in facilityOptions" :key="opt.value" class="filter-checkbox">
        <input
          type="checkbox"
          :value="opt.value"
          :checked="modelValue.facility.includes(opt.value)"
          @change="toggleFilter('facility', opt.value)"
        />
        <span class="checkmark"></span>
        {{ opt.label }}
      </label>
    </div>
  </aside>
</template>

<script>
export default {
  name: "BookingFilters",
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    bookingOptions: Array,
    formatOptions: Array,
    surfaceOptions: Array,
    radiusOptions: Array,
    facilityOptions: Array,
  },
  emits: ["update:modelValue"],
  methods: {
    updateFilter(key, value) {
      const newFilters = { ...this.modelValue, [key]: value };
      this.$emit("update:modelValue", newFilters);
    },
    toggleFilter(key, value) {
      const currentValues = [...this.modelValue[key]];
      const index = currentValues.indexOf(value);
      if (index > -1) {
        currentValues.splice(index, 1);
      } else {
        currentValues.push(value);
      }
      this.updateFilter(key, currentValues);
    },
  },
};
</script>

<style scoped>
.sidebar {
  background: white;
  border-radius: 6px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.filter-group {
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.filter-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 700;
  color: #222;
  margin-bottom: 10px;
}

.filter-checkbox,
.filter-radio {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #444;
  cursor: pointer;
  margin-bottom: 7px;
  line-height: 1.4;
}

.filter-checkbox input[type="checkbox"],
.filter-radio input[type="radio"] {
  display: none;
}

.checkmark,
.radiomark {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  border: 1.5px solid #aaa;
  border-radius: 2px;
  margin-top: 1px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.radiomark {
  border-radius: 50%;
}

.filter-checkbox input:checked + .checkmark {
  background: #16a34a;
  border-color: #16a34a;
}

.filter-checkbox input:checked + .checkmark::after {
  content: "";
  width: 8px;
  height: 5px;
  border-left: 2px solid white;
  border-bottom: 2px solid white;
  transform: rotate(-45deg) translateY(-1px);
  display: block;
}

.filter-radio input:checked + .radiomark {
  border-color: #16a34a;
}

.filter-radio input:checked + .radiomark::after {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #16a34a;
  display: block;
}
</style>
