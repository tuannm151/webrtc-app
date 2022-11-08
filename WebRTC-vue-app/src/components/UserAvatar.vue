<template>
  <div
    class="text-white font-medium rounded-full flex justify-center items-center"
    :class="[avatarBg ? avatarBg : 'bg-red-500', sizeClass, textSize, classes]"
  >
    {{ avatarName }}
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  userName: {
    type: String,
    required: true,
  },
  avatarBg: {
    type: String,
    required: false,
  },
  classes: {
    type: String,
    required: false,
    default: '',
  },
  sizeClass: {
    type: String,
    required: false,
    default: 'w-20 h-20',
  },
  textSize: {
    type: String,
    required: false,
    default: 'text-xl',
  },
  nameLength: {
    type: String,
    required: false,
    default: 'short',
  },
});

const avatarName = computed(() => {
  // remove all non-alphanumeric characters exccept spaces
  if (props.nameLength === 'full') {
    return props.userName;
  }
  const name = props.userName.replace(/[^a-zA-Z0-9 ]/g, '');
  // get short name max 3 characters
  const shortName = name
    .split(' ')
    .map((word) => word[0].toUpperCase())
    .join('')
    .substring(0, 3);
  return shortName;
});
</script>

<style lang="scss" scoped></style>
