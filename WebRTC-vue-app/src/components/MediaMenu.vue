<template>
  <VueFinalModal
    v-model="showModal"
    :click-to-close="false"
    content-class="modal-box px-4 md:px-8 max-w-full lg:max-w-5xl max-h-full h-full w-full xl:w-3/5 lg:h-4/5 flex flex-col overflow-hidden flex justify-center"
    classes="flex justify-center items-center"
  >
    <div class="flex gap-4 items-center sm:mb-4 lg:mb-10">
      <FontAwesomeIcon icon="fa-solid fa-gear" class="text-2xl" />
      <h3 class="font-bold text-2xl mb-1">Lựa chọn thiết lập</h3>
    </div>
    <div class="flex flex-1 gap-2 flex-wrap">
      <div class="flex-1 flex-col gap-5">
        <div class="flex gap-2 md:gap-6 flex-col">
          <div class="flex flex-col gap-1 flex-1">
            <label class="text-md font-bold ml-14">Microphone</label>
            <div class="flex gap-4 items-center">
              <FontAwesomeIcon
                icon="fa-solid fa-microphone"
                class="text-xl w-10"
              />
              <MSelect
                :options="audioInputs"
                @select="(value) => selectDevice(DeviceType.AudioInput, value)"
                :isLoading="isLoading"
              />
            </div>
          </div>
          <div class="flex flex-col gap-1 flex-1">
            <label class="text-md font-bold ml-14">Speaker</label>
            <div class="flex gap-4 items-center">
              <FontAwesomeIcon
                icon="fa-solid fa-volume-up"
                class="text-xl w-10"
              />
              <MSelect
                :options="audioOutputs"
                @select="(value) => selectDevice(DeviceType.AudioOutput, value)"
                :isLoading="isLoading"
              />
            </div>
          </div>
          <div class="flex flex-col gap-1 flex-1">
            <label class="text-md font-bold ml-14">Camera</label>
            <div class="flex gap-4 items-center">
              <FontAwesomeIcon icon="fa-solid fa-video" class="text-xl w-10" />
              <MSelect
                :options="videoInputs"
                @select="(value) => selectDevice(DeviceType.VideoInput, value)"
                :isLoading="isLoading"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col flex-1 gap-2 min-w-[320px] items-center">
        <div class="relative">
          <video
            ref="localVideo"
            class="w-full aspect-4/3 object-cover rounded-lg"
            poster="../assets/black_image.jpg"
            autoplay
            muted
          ></video>
          <div
            v-if="isLoading || error"
            class="absolute text-lg font-bold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            {{
              isLoading
                ? 'Đang tải...'
                : error
                ? 'Có lỗi đầu vào. Vui lòng kiểm tra thiết bị'
                : ''
            }}
          </div>
          <canvas
            ref="canvas"
            class="absolute w-16 h-10 bottom-2 left-2"
          ></canvas>
          <audio :src-object.prop.camel="audioStream" muted autoplay></audio>
          <div
            class="absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-1/2 mx-auto"
          >
            <div class="flex gap-4 items-center">
              <ToggleDeviceBtn
                iconOn="fa-solid fa-microphone"
                iconOff="fa-solid fa-microphone-slash"
                :isOn="isMicrophoneOn"
                @click="toggleMicrophone"
                size="text-lg"
              />
              <ToggleDeviceBtn
                iconOn="fa-solid fa-video"
                iconOff="fa-solid fa-video-slash"
                :isOn="isCameraOn"
                @click="toggleCamera"
                size="text-lg"
              />
            </div>
          </div>
        </div>
        <button
          class="self-start btn btn-ghost btn-sm gap-2"
          @click="playAudioHandler"
        >
          <FontAwesomeIcon icon="fa-solid fa-volume-up" class="text-xl w-10" />
          Test Audio
        </button>
        <audio ref="testAudio"></audio>
      </div>
    </div>
    <div class="modal-action">
      <div class="flex gap-10">
        <button class="btn btn-warning" @click="onStartHandler">
          Bắt đầu tham gia
        </button>
      </div>
    </div>
  </VueFinalModal>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { VueFinalModal } from 'vue-final-modal';
import { useMediaStore } from '../store/mediaStore';
import { DeviceType } from '@/enums/MediaEnum';
import MSelect from './MSelect.vue';
import ToggleDeviceBtn from './ToggleDeviceBtn.vue';
import sound from '../assets/test_sound.mp3';
import useMedia from '../hooks/useMedia';
import { MediaType } from '../enums/MediaEnum';

const {
  audioInputs,
  audioOutputs,
  videoInputs,
  audioStream,
  closeStream,
  isLoading,
  getStream,
} = useMedia({ init: true });
const mediaStore = useMediaStore();
const showModal = ref(true);
const isCameraOn = ref(false);
const isMicrophoneOn = ref(false);
const error = ref(null);
const canvas = ref(null);
const testAudio = ref(null);
const localVideo = ref(null);

const emit = defineEmits(['start']);

const onStartHandler = () => {
  if (isLoading.value) {
    return;
  }
  emit('start');
};
console.log('rerun');

const playAudioHandler = () => {
  if (!mediaStore.audioOutputDevice) return;
  testAudio.value.src = sound;
  testAudio.value.setSinkId(mediaStore.audioOutputDevice);
  testAudio.value.play();
};

let reqFrame = null;
const visualizeAudioStream = () => {
  // visualize audio stream in circular shape
  const audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();
  const source = audioCtx.createMediaStreamSource(audioStream.value);
  source.connect(analyser);
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  const canvasCtx = canvas.value.getContext('2d');
  const WIDTH = canvas.value.width;
  const HEIGHT = canvas.value.height;
  const draw = () => {
    // symetric spectrum

    reqFrame = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    const barWidth = (WIDTH / bufferLength) * 2.5;
    let barHeight;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i];

      // fill with  dynamic light blue
      canvasCtx.fillStyle = `hsl(200, 100%, ${barHeight / 2}%)`;

      canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);
      x += barWidth + 1;
    }
    console.log('draw');
  };
  reqFrame = requestAnimationFrame(draw);
};

const clearCanvas = () => {
  const canvasCtx = canvas.value.getContext('2d');
  canvasCtx.clearRect(0, 0, canvas.value.width, canvas.value.height);
};

const selectDevice = (kind, deviceId) => {
  mediaStore.selectDevice(kind, deviceId);

  // reset trạng thái lỗi nếu có
  if (error.value) {
    error.value = null;
  }

  if (kind === DeviceType.VideoInput && isCameraOn.value) {
    isCameraOn.value = false;
    toggleCamera();
  }
  if (kind === DeviceType.AudioInput && isMicrophoneOn.value) {
    isMicrophoneOn.value = false;
    toggleMicrophone();
  }
};

const toggleCamera = async () => {
  try {
    if (!mediaStore.videoInputDevice) {
      return;
    }

    if (isCameraOn.value) {
      closeStream({ type: MediaType.Video });
      isCameraOn.value = false;
      return;
    }
    localVideo.value.srcObject = await getStream({
      video: {
        deviceId: mediaStore.videoInputDevice,
      },
    });
    isCameraOn.value = true;
  } catch (err) {
    localVideo.value.srcObject = null;
    error.value = err;
  }
};

const toggleMicrophone = async () => {
  try {
    if (!mediaStore.audioInputDevice) {
      return;
    }
    if (isMicrophoneOn.value) {
      closeStream({ type: MediaType.Audio });
      isMicrophoneOn.value = false;
      cancelAnimationFrame(reqFrame);
      clearCanvas();
      return;
    }
    await getStream({
      audio: {
        deviceId: mediaStore.audioInputDevice,
      },
    });
    isMicrophoneOn.value = true;
    visualizeAudioStream();
  } catch (err) {
    error.value = err;
  }
};

watchEffect(() => {
  if (audioOutputs.value.length > 0) {
    mediaStore.audioOutputDevice = audioOutputs.value[0].value;
  }
  if (videoInputs.value.length > 0) {
    mediaStore.videoInputDevice = videoInputs.value[0].value;
  }
  if (audioInputs.value.length > 0) {
    mediaStore.audioInputDevice = audioInputs.value[0].value;
  }
});

// const unWatchVideo = watchEffect(() => {
//   if (videoInputs.value.length > 0 && localAudio.value) {
//     toggleCamera();
//     unWatchVideo();
//   }
// });

// const unWatchAudio = watchEffect(() => {
//   if (audioInputs.value.length > 0 && localVideo.value) {
//     toggleMicrophone();
//     unWatchAudio();
//   }
// });
</script>

<style lang="scss" scoped></style>
