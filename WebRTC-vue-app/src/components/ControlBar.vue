<template>
  <div
    class="flex z-50 xl:w-[400px] md:py-1 gap-6 items-center absolute bottom-2 left-1/2 -translate-x-1/2 mx-auto bg-black rounded-xl"
  >
    <div class="flex-1 flex gap-4 justify-end">
      <ToggleDeviceBtn
        iconOn="fa-solid fa-microphone"
        iconOff="fa-solid fa-microphone-slash"
        :isOn="isMicrophoneOn"
        @click="emit('toggle-microphone')"
      />
      <ToggleDeviceBtn
        iconOn="fa-solid fa-video"
        iconOff="fa-solid fa-video-slash"
        :isOn="isCameraOn"
        @click="emit('toggle-camera')"
      />
    </div>
    <button
      @click="emit('hang-up')"
      class="flex justify-center items-center w-10 h-10 rounded-full bg-red-600"
    >
      <IconPhoneHangup
        style="font-size: 1.5rem; color: white; margin-top: 2px"
      />
    </button>
    <div class="flex-1 flex gap-4">
      <button
        class="flex justify-center items-center w-9 h-9"
        @click="emit('share-screen')"
      >
        <MonitorShare
          style="font-size: 1.25rem; color: white; margin-top: 3px"
        />
      </button>
      <ToggleDeviceBtn
        icon="fa-solid fa-message"
        classes="pt-1"
        :iconColor="isChatOpen ? 'text-blue-300' : 'text-white'"
        @click="emit('toggle-chat')"
      />
    </div>
  </div>
</template>

<script setup>
import ToggleDeviceBtn from './ToggleDeviceBtn.vue';
import IconPhoneHangup from '~icons/mdi/phone-hangup';
import MonitorShare from '~icons/mdi/monitor-screenshot';

defineProps({
  isMicrophoneOn: {
    type: Boolean,
    required: true,
  },
  isCameraOn: {
    type: Boolean,
    required: true,
  },
  isChatOpen: {
    type: Boolean,
    required: true,
  },
});
const emit = defineEmits([
  'toggle-microphone',
  'toggle-camera',
  'toggle-chat',
  'share-screen',
  'hang-up',
]);
</script>

<style lang="scss" scoped></style>
