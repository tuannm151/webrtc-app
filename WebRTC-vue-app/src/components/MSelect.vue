<template>
  <div class="form-control w-full max-w-[250px] md:max-w-xs" :class="classes">
    <label v-if="label" class="label">
      <span class="label-text font-bold">{{ label }}</span>
    </label>
    <select
      v-model="select"
      class="select border-opacity-50"
      @change="selectHandler($event)"
    >
      <option v-if="isLoading" value="">Đang tải ...</option>
      <option v-if="!isLoading && options.length === 0" value="">
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
import { ref, watchEffect } from 'vue';

const props = defineProps({
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
    default: undefined,
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

const select = ref(props.defaultValue || props.options?.[0]?.value || '');

watchEffect(() => {
  if (props.defaultValue) {
    select.value = props.defaultValue;
    return;
  }
  if (props.options?.[0]?.value) {
    select.value = props.options?.[0]?.value;
  }
});

const emit = defineEmits(['select']);
const selectHandler = (event) => {
  console.log('selectHandler', event.target.value);
  emit('select', event.target.value);
};
</script>

<style lang="scss" scoped></style>
