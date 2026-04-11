<template>
  <div class="container py-4">
    <h3 class="mb-4">🔥 Bảng tin cộng đồng</h3>

    <!-- CREATE POST -->
    <div class="card p-3 mb-4 shadow-sm">
      <textarea
        v-model="newPost.content"
        class="form-control mb-2"
        placeholder="Bạn muốn chia sẻ gì..."
      ></textarea>

      <select v-model="newPost.type" class="form-control mb-2">
        <option value="user">Khách hàng</option>
        <option value="owner">Chủ sân</option>
        <option value="system">Hệ thống</option>
      </select>

      <button class="btn btn-primary" @click="createPost">
        Đăng bài
      </button>
    </div>

    <!-- LIST POSTS -->
    <div v-for="post in posts" :key="post.id" class="card p-3 mb-3 shadow-sm">
      <div class="d-flex justify-content-between">
        <div>
          <h6 class="mb-1">
            {{ getAuthor(post.type) }}
            <span class="badge bg-secondary ms-2">
              {{ post.type }}
            </span>
          </h6>
          <small class="text-muted">{{ post.time }}</small>
        </div>
      </div>

      <p class="mt-2">{{ post.content }}</p>

      <!-- ACTION -->
      <div class="d-flex gap-3">
        <button class="btn btn-sm btn-outline-primary" @click="likePost(post)">
          👍 {{ post.likes }}
        </button>
        <button class="btn btn-sm btn-outline-secondary" @click="toggleComment(post)">
          💬 Bình luận
        </button>
      </div>

      <!-- COMMENTS -->
      <div v-if="post.showComment" class="mt-2">
        <input
          v-model="post.newComment"
          class="form-control mb-2"
          placeholder="Viết bình luận..."
        />
        <button class="btn btn-sm btn-success" @click="addComment(post)">
          Gửi
        </button>

        <div v-for="(c, i) in post.comments" :key="i" class="mt-2">
          <small>💬 {{ c }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PostFeedView",

  data() {
    return {
      newPost: {
        content: "",
        type: "user",
      },

      posts: [
        {
          id: 1,
          type: "owner",
          content: "Sân Thành Phát giảm giá 20% tối nay!",
          time: "5 phút trước",
          likes: 10,
          comments: [],
          showComment: false,
          newComment: "",
        },
        {
          id: 2,
          type: "user",
          content: "Cần 3 người đá sân 7 lúc 18h tại Đà Nẵng!",
          time: "10 phút trước",
          likes: 5,
          comments: [],
          showComment: false,
          newComment: "",
        },
      ],
    };
  },

  methods: {
    getAuthor(type) {
      if (type === "owner") return "🏢 Chủ sân";
      if (type === "system") return "⚙️ Hệ thống";
      return "👤 Người dùng";
    },

    createPost() {
      if (!this.newPost.content) return;

      this.posts.unshift({
        id: Date.now(),
        type: this.newPost.type,
        content: this.newPost.content,
        time: "Vừa xong",
        likes: 0,
        comments: [],
        showComment: false,
        newComment: "",
      });

      this.newPost.content = "";
    },

    likePost(post) {
      post.likes++;
    },

    toggleComment(post) {
      post.showComment = !post.showComment;
    },

    addComment(post) {
      if (!post.newComment) return;
      post.comments.push(post.newComment);
      post.newComment = "";
    },
  },
};
</script>

<style scoped>
.card {
  border-radius: 12px;
}
textarea {
  resize: none;
}
</style>