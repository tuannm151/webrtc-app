<template>
  <div class="flex w-full">
    <UserAvatar
      v-if="!sending"
      :user-name="message.user?.userName || 'Ẩn danh'"
      :avatar-bg="message.user?.avatarBg || 'bg-red-500'"
      size-class="w-10 h-10"
      text-size="text-sm"
      classes="self-end"
    />
    <div
      class="flex flex-1 flex-col gap-2 overflow-hidden"
      :class="[sending ? 'ml-14' : 'ml-4']"
    >
      <div
        class="flex gap-2 items-center"
        :class="[sending ? 'justify-end' : '']"
      >
        <span class="text-sm text-white font-medium leading-none">{{
          sending ? 'Bạn' : message.user?.userName
        }}</span>
        <span
          class="text-[11px] font-medium text-gray-400 leading-none mt-[1px]"
          >{{ convertTimestampToLocalTime(message.timestamp) }}</span
        >
      </div>
      <div
        class="flex flex-col gap-2 overflow-hidden"
        :class="[
          sending
            ? 'text-[#0b332b] font-semibold items-end'
            : 'text-white items-start',
        ]"
      >
        <p
          v-for="(msg, index) in message.msgs"
          :key="index"
          class="px-5 py-2 text-sm rounded-xl break-words max-w-full"
          :class="[
            sending
              ? 'bg-[#04c295]'
              : 'bg-slate-600 rounded-tl-xl rounded-r-xl rounded-bl-sm',
          ]"
        >
          {{ msg }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import UserAvatar from '@/components/UserAvatar.vue';
import { convertTimestampToLocalTime } from '@/utils/convertUtils.js';
defineProps({
  message: {
    type: Object,
    required: true,
  },
  sending: {
    type: Boolean,
    required: true,
  },
});
</script>

<style lang="scss" scoped></style>
