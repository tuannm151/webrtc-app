<template>
  <div
    v-click-outside="handleClickOutside"
    class="pickerContainer z-50"
    :class="[isActive ? '' : 'hidden']"
  ></div>
</template>

<script setup>
import { createPicker } from 'picmo';
import { onMounted } from 'vue';

const props = defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['close-picker', 'select-emoji']);

const handleClickOutside = () => {
  if (!props.isActive) return;
  emit('close-picker');
};

const handleEmojiSelect = (e) => {
  emit('select-emoji', e);
};

onMounted(() => {
  const container = document.querySelector('.pickerContainer');
  const pck = createPicker({
    rootElement: container,
    emojiSize: '1.8em',
    theme: 'light',
    emojisPerRow: 7,
    showPreview: false,
  });
  pck.addEventListener('emoji:select', handleEmojiSelect);
});
</script>

<style lang="scss" scoped></style>
