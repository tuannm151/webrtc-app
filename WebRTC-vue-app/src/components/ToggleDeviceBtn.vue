<template>
  <button
    class="border-2 border-white rounded-full w-10 h-10 flex justify-center items-center"
    :class="[isOn ? '' : 'bg-red-600 border-red-500', classes ? classes : '']"
  >
    <FontAwesomeIcon
      :icon="isOn ? iconOn : iconOff"
      class="text-white"
      :class="[size]"
    />
  </button>
</template>

<script setup>
defineProps({
  iconOn: {
    type: String,
    required: true,
  },
  iconOff: {
    type: String,
    required: true,
  },
  isOn: {
    type: Boolean,
    required: true,
  },
  size: {
    type: String,
    default: 'text-xl',
  },
  classes: {
    type: String,
    default: '',
  },
});
</script>

<style lang="scss" scoped></style>
