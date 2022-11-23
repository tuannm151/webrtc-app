<template>
  <div
    class="flex justify-center items-center w-full h-full text-base-content overflow-hidden"
  >
    <TheBackground classes="bg-base-300" />
    <slot />
  </div>
</template>

<script setup>
import TheBackground from './Utils/TheBackground.vue';
</script>

<style lang="scss" scoped></style>
