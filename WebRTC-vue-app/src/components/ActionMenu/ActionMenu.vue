<template>
  <div class="w-48 bg-gray-900 z-40 rounded-md py-2" :class="classes">
    <ul class="w-full text-sm text-white leading-none font-medium">
      <li
        class="flex items-center gap-2 hover:bg-slate-800 cursor-pointer pl-4 py-3"
        @click="selectAction('setting')"
      >
        <div class="w-6 h-6 flex justify-center items-center"><IconCog /></div>
        Cài đặt
      </li>
      <li
        class="flex items-center gap-2 hover:bg-slate-800 cursor-pointer pl-4 py-3"
        @click="selectAction('fullscreen')"
      >
        <div class="w-6 h-6 flex justify-center items-center text-lg">
          <IconFullScreen />
        </div>
        Toàn màn hình
      </li>
    </ul>
  </div>
</template>

<script setup>
import IconCog from '~icons/mdi/cog';
import IconFullScreen from '~icons/mdi/fullscreen';

const emit = defineEmits(['on-action']);

const selectAction = (action) => {
  emit('on-action', action);
};

defineProps({
  classes: {
    type: String,
    required: false,
    default: '',
  },
});
</script>

<style lang="scss" scoped></style>
