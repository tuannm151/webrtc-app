<template>
  <VueFinalModal
    v-model="showModal"
    :drag="true"
    :click-to-close="false"
    content-class="modal-box h-full lg:max-h-[400px] aspect-4/3 overflow-hidden relative flex flex-col p-10 gap-5"
    classes="flex justify-center items-center"
  >
    <button @click="handleClose" class="text-xl absolute right-4 top-4">
      <IconClose />
    </button>

    <div class="form-control w-full">
      <label class="label" for="room-name">
        <span class="label-text text-base">Tên phòng</span>
      </label>
      <input
        id="room-name"
        type="text"
        placeholder="Nhập tên phòng..."
        class="input input-bordered w-full max-w-xs"
        v-model="name"
      />
    </div>
    <div class="form-control w-full">
      <label class="label" for="room-pw">
        <span class="label-text text-base">Nhập mật khẩu (nếu có)</span>
      </label>
      <input
        id="room-pw"
        type="text"
        placeholder="Nhập mật khẩu hoặc để trống..."
        class="input input-bordered w-full max-w-xs"
        v-model="password"
      />
    </div>
    <div class="mt-auto w-full flex justify-end">
      <button
        @click="handleCreateRoom"
        class="btn border-2 btn-outline btn-warning w-full max-w-[150px]"
      >
        Xác nhận
      </button>
    </div>
  </VueFinalModal>
</template>

<script setup>
import { ref } from 'vue';
import IconClose from '~icons/mdi/close-circle';
import { VueFinalModal } from 'vue-final-modal';
import { useToast } from 'vue-toastification';

const showModal = ref(true);
const emit = defineEmits(['close', 'submit']);
const toastOptions = {
  showCloseButtonOnHover: true,
  closeButton: false,
  timeout: 3000,
  icon: true,
  hideProgressBar: true,
};
const toast = useToast(toastOptions);
const name = ref('');
const password = ref('');

const handleCreateRoom = () => {
  if (!name.value.trim()) {
    name.value.focus();
    toast.error('Tên phòng không được để trống');
    return;
  }
  emit('submit', { name: name.value, password: password.value });
};

const handleClose = () => {
  emit('close');
};
</script>

<style lang="scss" scoped></style>
