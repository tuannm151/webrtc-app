<template>
  <div class="form-control w-full max-w-[250px] md:max-w-xs" :class="classes">
    <label v-if="label" class="label">
      <span class="label-text font-bold">{{ label }}</span>
    </label>
    <select class="select border-opacity-50" @change="selectHandler($event)">
      <option v-if="isLoading">Đang tải ...</option>
      <option v-if="!isLoading && options.length === 0" value="0">
        Không tìm thấy thiết bị
      </option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
  },
  options: {
    type: Array,
    required: true,
  },
  defaultValue: {
    type: String,
    required: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  classes: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['select']);
const selectHandler = (event) => {
  console.log(event.target.value);
  emit('select', event.target.value);
};
</script>

<style lang="scss" scoped></style>
