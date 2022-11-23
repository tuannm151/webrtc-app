<template>
  <div class="flex gap-4 items-center" :class="classes">
    {{ label }}
    <input
      type="checkbox"
      class="toggle toggle-md border-2 toggle-success"
      :checked="isActive"
      @change="handleToggle"
    />
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  classes: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['toggle']);

const handleToggle = (event) => {
  emit('toggle', event.target.checked);
};
</script>

<style lang="scss" scoped></style>
