<template>
  <div class="absolute left-0 top-0 w-full h-full" :class="classes"></div>
</template>

<script setup>
defineProps({
  classes: {
    type: String,
    required: false,
    default: '',
  },
});
</script>
