<template>
  <div
    class="mockup-window mt-10 rounded-xl bg-base-200 h-4/5 w-full md:w-4/5 m-4"
  >
    <div class="flex bg-base-100 h-full justify-center items-center">
      <div
        class="flex flex-col mb-10 gap-8 justify-center items-center w-full md:w-[270px] p-4"
      >
        <div class="form-control w-full max-w-xs">
          <input
            type="text"
            placeholder="Nhập tên của bạn"
            class="input border-2 input-bordered w-full max-w-xs"
            v-model="userName"
          />
        </div>
        <button class="btn border-2 btn-outline btn-warning w-full">
          Tạo phòng mới
        </button>
        <button
          @click="joinRoom"
          class="btn border-2 btn-outline btn-warning w-full"
        >
          Tham gia phòng
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/userStore';

const userName = ref(localStorage.getItem('UserName') || '');
const userStore = useUserStore();
const router = useRouter();

const joinRoom = () => {
  try {
    router.push('/room/123');
    // set user name to store
    userStore.userName = userName.value || 'Ẩn danh';
    // set user name to local storage
    localStorage.setItem('UserName', userName.value);
  } catch (error) {
    console.log(error);
  }
};
</script>

<style lang="scss" scoped></style>
