<template>
  <div class="flex flex-col gap-8 mt-10">
    <div class="form-control w-full max-w-xs">
      <input
        type="text"
        placeholder="Nhập tên của bạn"
        class="input input-bordered w-full max-w-xs"
        v-model="userName"
      />
    </div>
    <button class="btn btn-outline btn-warning">Tạo phòng mới</button>
    <button @click="joinRoom" class="btn btn-outline btn-warning">
      Tham gia phòng
    </button>
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
    userStore.userName = userName.value || 'No name';
    // set user name to local storage
    localStorage.setItem('UserName', userName.value);
  } catch (error) {
    console.log(error);
  }
};
</script>

<style lang="scss" scoped></style>
