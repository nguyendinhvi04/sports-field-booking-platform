import { reactive } from 'vue';

export const loadingStore = reactive({
  isLoading: false,
  apiCount: 0,
  show() {
    this.apiCount++;
    this.isLoading = true;
  },
  hide() {
    this.apiCount--;
    if (this.apiCount <= 0) {
      this.apiCount = 0;
      this.isLoading = false;
    }
  }
});
