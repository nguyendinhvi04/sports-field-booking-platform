<template>
  <div class="container py-4">
    <h3 class="mb-4">⚽ Tìm bạn đá bóng</h3>

    <div class="row">
      <!-- FILTER -->
      <div class="col-md-3">
        <div class="card p-3">
          <h5>Bộ lọc</h5>

          <input v-model="filters.keyword" class="form-control mb-2" placeholder="Tìm sân..." />

          <select v-model="filters.level" class="form-control mb-2">
            <option value="">Trình độ</option>
            <option value="beginner">Mới chơi</option>
            <option value="intermediate">Trung bình</option>
            <option value="pro">Chuyên nghiệp</option>
          </select>

          <input type="date" v-model="filters.date" class="form-control mb-2" />

          <button class="btn btn-primary w-100" @click="applyFilter">
            Lọc
          </button>
        </div>
      </div>

      <!-- LIST -->
      <div class="col-md-9">
        <div v-if="filteredMatches.length">
          <div
            v-for="match in filteredMatches"
            :key="match.id"
            class="card p-3 mb-3 shadow-sm"
          >
            <div class="d-flex justify-content-between">
              <div>
                <h5>{{ match.title }}</h5>
                <p class="mb-1">📍 {{ match.location }}</p>
                <p class="mb-1">📅 {{ match.date }} - {{ match.time }}</p>
                <p class="mb-1">👤 {{ match.joined }}/{{ match.total }} người</p>
                <p class="mb-1">🔥 {{ match.level }}</p>
              </div>

              <div class="text-end">
                <button
                  class="btn btn-success"
                  :disabled="match.joined >= match.total"
                  @click="joinMatch(match)"
                >
                  {{ match.joined >= match.total ? "Đã đủ" : "Tham gia" }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center text-muted">
          Không tìm thấy kèo phù hợp
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "FindPlayersView",

  data() {
    return {
      filters: {
        keyword: "",
        level: "",
        date: "",
      },

      matches: [
        {
          id: 1,
          title: "Kèo sân 7 cần thêm người",
          location: "Đà Nẵng",
          date: "2026-03-28",
          time: "18:00 - 19:30",
          joined: 10,
          total: 14,
          level: "intermediate",
        },
        {
          id: 2,
          title: "Kèo giao lưu nhẹ",
          location: "Đà Nẵng",
          date: "2026-03-28",
          time: "20:00 - 21:30",
          joined: 8,
          total: 10,
          level: "beginner",
        },
      ],

      filteredMatches: [],
    };
  },

  created() {
    this.filteredMatches = this.matches;
  },

  methods: {
    applyFilter() {
      this.filteredMatches = this.matches.filter((m) => {
        return (
          (!this.filters.keyword ||
            m.location.toLowerCase().includes(this.filters.keyword.toLowerCase())) &&
          (!this.filters.level || m.level === this.filters.level) &&
          (!this.filters.date || m.date === this.filters.date)
        );
      });
    },

    joinMatch(match) {
      if (match.joined < match.total) {
        match.joined++;
        alert("Tham gia thành công!");
      }
    },
  },
};
</script>

<style scoped>
.card {
  border-radius: 12px;
}
</style>