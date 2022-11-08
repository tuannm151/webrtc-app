<template>
  <div
    class="w-full aspect-4/3 flex flex-col gap-1 justify-center items-center bg-slate-800 py-3 md:py-4 cursor-pointer"
    :class="[classes, isActive ? 'border-2 border-blue-400' : '']"
  >
    <div class="flex-1 px-4" v-if="imgSrc">
      <img :src="imgSrc" class="w-full h-full object-cover" />
    </div>

    <FontAwesomeIcon
      v-if="!imgSrc && icon"
      :icon="icon"
      class="text-white text-2xl"
    />
    <div
      class="w-full text-white font-bold bg-slate-800 text-center text-xs leading-none"
    >
      {{ localShare ? 'Màn hình của bạn' : description }}
    </div>

    <button
      v-if="localShare"
      class="btn btn-xs text-[10px] bg-[#ff4444] hover:bg-[#ff1818]"
      @click="handleClickStopShare($event)"
    >
      Dừng chia sẻ
    </button>
  </div>
</template>

<script setup>
defineProps({
  imgSrc: {
    type: String,
    required: false,
  },
  icon: {
    type: String,
    required: false,
  },
  classes: {
    type: String,
    required: false,
    default: '',
  },
  description: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  localShare: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emit = defineEmits(['stop-share']);

const handleClickStopShare = (e) => {
  e.stopPropagation();
  emit('stop-share');
};
</script>

<style lang="scss" scoped></style>
