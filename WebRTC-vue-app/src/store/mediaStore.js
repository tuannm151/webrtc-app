import { defineStore } from 'pinia';
import { ref } from 'vue';
export const useMediaStore = defineStore('media', () => {
  const audioInputDevice = ref(null);
  const audioOutputDevice = ref(null);
  const videoInputDevice = ref(null);

  const audioSetting = ref({
    noiseSuppression: true,
    echoCancellation: true,
    autoGainControl: false,
  });
  const selectDevice = (kind, value) => {
    switch (kind) {
      case 'audioinput':
        audioInputDevice.value = value;
        break;
      case 'audiooutput':
        audioOutputDevice.value = value;
        break;
      case 'videoinput':
        videoInputDevice.value = value;
        break;
    }
  };
  const changeAudioSetting = (setting) => {
    audioSetting.value = {
      ...audioSetting.value,
      ...setting,
    };
  };
  return {
    audioInputDevice,
    audioOutputDevice,
    videoInputDevice,
    selectDevice,
    audioSetting,
    changeAudioSetting,
  };
});
