<template>
  <div
    class="flex z-50 md:py-1 gap-6 items-center absolute bottom-2 left-1/2 -translate-x-1/2 mx-auto bg-black rounded-xl px-6"
  >
    <div
      v-click-outside="toggleMenu"
      v-if="showMenu"
      class="absolute translate-y-[-100%] top-[-10px] right-0"
    >
      <ActionMenu @on-action="handleMenuAction" />
    </div>
    <div class="flex-1 flex gap-4 items-center justify-evenly">
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
      <ToggleDeviceBtn
        icon="fa-solid fa-message"
        classes="pt-1"
        :iconColor="isChatOpen ? 'text-blue-300' : 'text-white'"
        @click="emit('toggle-chat')"
      />
      <button
        class="flex justify-center items-center w-9 h-9 hover:border-2 hover:border-white hover:rounded-md"
        @click="emit('share-screen')"
      >
        <MonitorShare
          style="font-size: 1.25rem; color: white; margin-top: 3px"
        />
      </button>
      <button
        class="flex justify-center items-center w-9 h-9 hover:border-2 hover:border-white hover:rounded-md"
        @click="toggleMenu"
      >
        <IconMenu style="font-size: 1.25rem; color: white; margin-top: 3px" />
      </button>
    </div>

    <button
      @click="emit('hang-up')"
      class="flex justify-center items-center w-12 h-8 bg-red-600 rounded-lg"
    >
      <IconPhoneHangup style="font-size: 1.5rem; color: white" />
    </button>
  </div>
</template>

<script setup>
import ToggleDeviceBtn from './ToggleDeviceBtn.vue';
import IconPhoneHangup from '~icons/mdi/phone-hangup';
import MonitorShare from '~icons/mdi/monitor-screenshot';
import IconMenu from '~icons/mdi/dots-grid';
import ActionMenu from './ActionMenu/ActionMenu.vue';
import { ref } from 'vue';

const showMenu = ref(false);

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

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
  'setting',
  'fullscreen',
]);

const handleMenuAction = (action) => {
  showMenu.value = false;
  switch (action) {
    case 'setting':
      emit('setting');
      break;
    case 'fullscreen':
      emit('fullscreen');
      break;
    default:
      break;
  }
};
</script>

<style lang="scss" scoped></style>
