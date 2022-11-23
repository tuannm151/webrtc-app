<template>
  <VueFinalModal
    v-model="showModal"
    :drag="true"
    :click-to-close="false"
    content-class="modal-box py-0 px-0 max-w-full lg:max-w-5xl max-h-full h-full w-full xl:w-3/5 lg:h-4/5 flex overflow-hidden relative flex justify-center"
    classes="flex justify-center items-center"
  >
    <button @click="handleClose" class="text-xl absolute right-4 top-4">
      <IconClose />
    </button>

    <div
      class="w-60 flex-shrink-0 py-4 border-r border-r-base-content border-opacity-25"
    >
      <h2 class="text-2xl ml-8">Cài đặt</h2>
      <ul class="w-full flex flex-col text-lg mt-14 pr-4">
        <SettingItem
          @click="switchTab(SettingTab.Audio)"
          label="Âm thanh"
          :is-active="currentTab === SettingTab.Audio"
        >
          <template v-slot:icon><IconSpeaker /></template>
        </SettingItem>
        <SettingItem
          @click="switchTab(SettingTab.Video)"
          label="Video"
          :is-active="currentTab === SettingTab.Video"
        >
          <template v-slot:icon><IconVideo /></template>
        </SettingItem>

        <SettingItem
          @click="switchTab(SettingTab.Theme)"
          label="Giao diện"
          :is-active="currentTab === SettingTab.Theme"
        >
          <template v-slot:icon><IconTheme /></template>
        </SettingItem>
      </ul>
    </div>
    <div class="flex-1 p-10">
      <AudioSetting
        v-if="currentTab === SettingTab.Audio"
        :audio-inputs="audioInputs"
        :audio-outputs="audioOutputs"
        :isLoading="isLoading"
        :audio-stream="audioStream"
      />
      <VideoSetting
        v-if="currentTab === SettingTab.Video"
        :video-inputs="videoInputs"
        :is-loading="isLoading"
        :video-stream="videoStream"
        @select-device="selectDevice"
      />
    </div>
  </VueFinalModal>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { VueFinalModal } from 'vue-final-modal';
import IconSpeaker from '~icons/mdi/speaker';
import IconVideo from '~icons/mdi/video';
import IconClose from '~icons/mdi/close-circle';
import SettingItem from './SettingItem.vue';
import IconTheme from '~icons/mdi/cookie-edit';
import AudioSetting from './AudioSetting.vue';
import useMedia from '../../hooks/useMedia';
import { SettingTab } from '@/enums/AppEnum';
import { useMediaStore } from '../../store/mediaStore';
import VideoSetting from './VideoSetting.vue';
import { DeviceType, MediaType } from '../../enums/MediaEnum';

const selectDevice = (type, value) => {
  if (type === DeviceType.VideoInput) {
    mediaStore.videoInputDevice = value;
    closeStream({ type: MediaType.Video });
    getStream({
      video: {
        deviceId: value,
      },
    });
  }
};

const showModal = ref(true);
const {
  audioInputs,
  audioOutputs,
  videoInputs,
  videoStream,
  audioStream,
  isLoading,
  closeStream,
  getStream,
} = useMedia({ init: false });

const mediaStore = useMediaStore();
const currentTab = ref(SettingTab.Audio);

const switchTab = async (tab) => {
  if (currentTab.value === tab) return;
  if (tab === SettingTab.Video) {
    getStream({
      video: {
        deviceId: mediaStore.videoInputDevice,
      },
    });
  }
  if (currentTab.value === SettingTab.Video) {
    closeStream({ type: MediaType.Video });
  }
  currentTab.value = tab;
};

const emit = defineEmits(['close']);

const handleClose = () => {
  emit('close');
};

onMounted(async () => {
  await getStream({
    audio: {
      deviceId: mediaStore.audioInputDevice,
    },
  });
});
</script>

<style lang="scss" scoped></style>
