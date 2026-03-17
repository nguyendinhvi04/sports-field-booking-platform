<template>
  <section class="cities-section">
    <div class="cities-section__header">
      <h2 class="cities-section__title">TÌM KIẾM TRÒ CHƠI CỦA BẠN</h2>
      <p class="cities-section__subtitle">
        Tìm các cơ sở thể thao từ sân bóng đá đến sân tennis tại nhiều thành phố trên khắp Việt Nam.
      </p>
    </div>

    <div class="cities-grid">
      <div v-for="city in cities" :key="city.id" class="city-card">
        <div class="city-card__image-wrap">
          <img :src="city.image" :alt="city.name" class="city-card__image" />
          <div class="city-card__tint"></div>
        </div>
        <div class="city-card__body">
          <h3 class="city-card__name">{{ city.title }}</h3>
          <div class="city-card__underline"></div>
          <button class="city-card__btn" @click="explore(city)">
            TÌM CÁC CƠ SỞ THỂ THAO
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CitiesSection',
  data() {
    return {
      cities: [
        {
          id: 1,
          title: 'CƠ SỞ THỂ THAO HÀ NỘI',
          name: 'Hà Nội',
          image: 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=600&h=420&fit=crop&crop=center',
        },
        {
          id: 2,
          title: 'CÁC CƠ SỞ THỂ THAO HỒ CHÍ MINH',
          name: 'Hồ Chí Minh',
          image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=420&fit=crop&crop=center',
        },
        {
          id: 3,
          title: 'CÁC CƠ SỞ THỂ THAO ĐÀ NẴNG',
          name: 'Đà Nẵng',
          image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&h=420&fit=crop&crop=center',
        },
      ],
    }
  },
  methods: {
    explore(city) {
      alert(`Tìm cơ sở thể thao tại ${city.name}`)
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@700;800;900&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.cities-section {
  font-family: 'Barlow';
  background: var(--bg);
  padding: 60px 40px 70px;
  max-width: 1200px;
  margin: 0 auto;
}

/* ─── HEADER ─── */
.cities-section__header {
  text-align: center;
  margin-bottom: 40px;
}

.cities-section__title {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 900;
  font-size: 26px;
  letter-spacing: 1.5px;
  color: #1a1a2e;
  margin-bottom: 12px;
}

.cities-section__subtitle {
  font-size: 15px;
  color: #555;
  font-weight: 400;
  max-width: 620px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ─── GRID ─── */
.cities-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

/* ─── CARD ─── */
.city-card {
  display: flex;
  flex-direction: column;
}

.city-card__image-wrap {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  aspect-ratio: 4 / 3;
}

.city-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.city-card:hover .city-card__image {
  transform: scale(1.04);
}

/* Green tint overlay */
.city-card__tint {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(22, 163, 74, 0.42) 0%,
    rgba(180, 140, 20, 0.28) 60%,
    rgba(80, 100, 20, 0.35) 100%
  );
  mix-blend-mode: multiply;
  pointer-events: none;
}

/* ─── CARD BODY ─── */
.city-card__body {
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.city-card__name {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  font-size: 17px;
  letter-spacing: 1px;
  color: #1a1a2e;
  margin-bottom: 8px;
  line-height: 1.25;
}

.city-card__underline {
  width: 36px;
  height: 3px;
  background: #16a34a;
  border-radius: 2px;
  margin-bottom: 18px;
}

.city-card__btn {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.city-card__btn:hover {
  background: #15803d;
}

.city-card__btn:active {
  transform: scale(0.98);
}

/* ─── RESPONSIVE ─── */
@media (max-width: 860px) {
  .cities-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .cities-section {
    padding: 40px 16px 50px;
  }

  .cities-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .cities-section__title {
    font-size: 20px;
  }
}
</style>