<template>
  <button
    class="w-9 h-9 flex justify-center items-center"
    :class="[classes, iconColor]"
  >
    <FontAwesomeIcon :icon="iconClass" :class="[iconSize]" />
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  iconOn: {
    type: String,
    required: false,
  },
  iconOff: {
    type: String,
    required: false,
  },
  icon: {
    type: String,
    required: false,
  },
  isOn: {
    type: Boolean,
    required: false,
  },
  iconSize: {
    type: String,
    default: 'text-xl',
  },
  classes: {
    type: String,
    required: false,
    default: '',
  },
  iconColor: {
    type: String,
    required: false,
    default: 'text-white',
  },
});

const iconClass = computed(() => {
  if (props.icon) {
    return props.icon;
  }
  return props.isOn ? props.iconOn : props.iconOff;
});
</script>

<style lang="scss" scoped></style>
