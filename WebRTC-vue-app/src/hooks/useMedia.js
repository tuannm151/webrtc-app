import { onMounted, onUnmounted, ref } from 'vue';
import { MediaType } from '../enums/MediaEnum';

export default function useMedia({ init = false, closeOnInit = true }) {
  const audioInputs = ref([]);
  const audioOutputs = ref([]);
  const videoInputs = ref([]);
  const videoStream = ref(null);
  const audioStream = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const getDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    devices.forEach((device) => {
      const { deviceId } = device;
      switch (device.kind) {
        case 'audioinput':
          audioInputs.value.push({
            label: device.label || `Microphone ${audioInputs.value.length + 1}`,
            value: deviceId,
          });
          break;
        case 'audiooutput':
          audioOutputs.value.push({
            label: device.label || `Speaker ${audioOutputs.value.length + 1}`,
            value: deviceId,
          });
          break;
        case 'videoinput':
          videoInputs.value.push({
            label: device.label || `Camera ${videoInputs.value.length + 1}`,
            value: deviceId,
          });
          break;
      }
    });
  };
  const getStream = async (constraints) => {
    const newStream = await navigator.mediaDevices.getUserMedia(constraints);
    let newVideoStream = new MediaStream();
    let newAudioStream = new MediaStream();

    newStream.getTracks().forEach((track) => {
      if (track.kind === 'video') {
        newVideoStream.addTrack(track);
      }
      if (track.kind === 'audio') {
        newAudioStream.addTrack(track);
      }
    });
    if (newVideoStream.getTracks().length > 0) {
      videoStream.value = newVideoStream;
    }
    if (newAudioStream.getTracks().length > 0) {
      audioStream.value = newAudioStream;
    }

    return newStream;
  };

  const closeAudioStream = () => {
    if (audioStream.value) {
      audioStream.value.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };

  const closeVideoStream = () => {
    if (videoStream.value) {
      videoStream.value.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };

  const closeStream = ({ type } = {}) => {
    switch (type) {
      case MediaType.Audio:
        closeAudioStream();
        break;
      case MediaType.Video:
        closeVideoStream();
        break;
      default:
        closeAudioStream();
        closeVideoStream();
        break;
    }
  };
  onMounted(async () => {
    try {
      isLoading.value = true;
      if (init) {
        await getStream({ audio: true, video: true });
      }
      await getDevices();
      if (init && closeOnInit) {
        closeStream();
      }
    } catch (e) {
      console.error(e);
      error.value = e?.message || 'Error getting media devices';
    } finally {
      isLoading.value = false;
    }
  });
  onUnmounted(() => {
    closeStream();
  });
  return {
    audioInputs,
    audioOutputs,
    videoInputs,
    videoStream,
    audioStream,
    getDevices,
    getStream,
    closeStream,
    isLoading,
  };
}
