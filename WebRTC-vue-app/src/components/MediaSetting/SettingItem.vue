<template>
  <li class="overflow-hidden flex relative gap-4 items-center rounded-r-full">
    <div v-if="isActive" class="absolute w-full h-full bg-accent -z-10" />

    <button
      class="flex gap-4 px-6 py-4 items-center w-full"
      :class="[isActive ? 'text-accent-content' : '']"
    >
      <slot name="icon" />
      {{ label }}
    </button>
  </li>
</template>

<script setup>
defineProps({
  isActive: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
});
</script>

<style lang="scss" scoped></style>
