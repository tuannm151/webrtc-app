import { defineStore } from 'pinia';
import { ref } from 'vue';
export const useUserStore = defineStore('user', () => {
  // get name from local storage
  const userName = ref(localStorage.getItem('UserName') || 'Ẩn danh');
  return { userName };
});
