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
      <AudioSetting v-if="currentTab === SettingTab.Audio" />
      <VideoSetting v-if="currentTab === SettingTab.Video" />
    </div>
  </VueFinalModal>
</template>

<script setup>
import { ref } from 'vue';
import { VueFinalModal } from 'vue-final-modal';
import IconSpeaker from '~icons/mdi/speaker';
import IconVideo from '~icons/mdi/video';
import IconClose from '~icons/mdi/close-circle';
import SettingItem from './SettingItem.vue';
import IconTheme from '~icons/mdi/cookie-edit';
import AudioSetting from './AudioSetting.vue';
import { SettingTab } from '@/enums/AppEnum';
import VideoSetting from './VideoSetting.vue';

const showModal = ref(true);

const currentTab = ref(SettingTab.Audio);

const switchTab = async (tab) => {
  if (currentTab.value === tab) return;
  currentTab.value = tab;
};

const emit = defineEmits(['close']);

const handleClose = () => {
  emit('close');
};
</script>

<style lang="scss" scoped></style>
