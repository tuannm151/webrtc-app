<template>
  <VueFinalModal
    v-model="showModal"
    :click-to-close="false"
    content-class="modal-box px-8 w-3/5 max-w-5xl h-5/6 flex flex-col"
    classes="flex justify-center items-center"
  >
    <div class="flex gap-4 items-center mb-10">
      <FontAwesomeIcon icon="fa-solid fa-gear" class="text-2xl" />
      <h3 class="font-bold text-2xl mb-1">Lựa chọn thiết lập</h3>
    </div>
    <div class="flex flex-1 flex-wrap">
      <div class="flex-1 flex-col gap-5">
        <div class="flex gap-6 flex-col">
          <div class="flex flex-col gap-1 flex-1">
            <label class="text-md font-bold ml-14">Microphone</label>
            <div class="flex gap-4 items-center">
              <FontAwesomeIcon
                icon="fa-solid fa-microphone"
                class="text-xl w-10"
              />
              <MSelect
                :options="audioInputs"
                @select="(value) => selectDevice('audioinput', value)"
                :isLoading="isLoadingDevice"
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
                @select="(value) => selectDevice('audiooutput', value)"
                :isLoading="isLoadingDevice"
              />
            </div>
          </div>
          <div class="flex flex-col gap-1 flex-1">
            <label class="text-md font-bold ml-14">Camera</label>
            <div class="flex gap-4 items-center">
              <FontAwesomeIcon icon="fa-solid fa-video" class="text-xl w-10" />
              <MSelect
                :options="videoInputs"
                @select="(value) => selectDevice('videoinput', value)"
                :isLoading="isLoadingDevice"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col flex-1 gap-4">
        <div class="relative mr-8">
          <video
            ref="localVideo"
            class="w-full h-72 object-cover rounded-lg"
            poster="../assets/black_image.jpg"
            autoplay
            muted
          ></video>
          <canvas
            ref="canvas"
            class="absolute w-16 h-10 bottom-2 left-2"
          ></canvas>
          <audio ref="localAudio" muted autoplay></audio>
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
          class="btn btn-outline gap-2 self-start"
          @click="playAudioHandler"
        >
          Test Audio
          <FontAwesomeIcon icon="fa-solid fa-volume-up" class="text-xl w-10" />
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
import { onMounted, ref } from 'vue';
import { VueFinalModal } from 'vue-final-modal';
import { useMediaStore } from '../store/mediaStore';
import MSelect from './MSelect.vue';
import ToggleDeviceBtn from './ToggleDeviceBtn.vue';
import sound from '../assets/test_sound.mp3';
const audioInputs = ref([]);
const audioOutputs = ref([]);
const videoInputs = ref([]);
const mediaStore = useMediaStore();
const showModal = ref(true);
const isLoadingDevice = ref(false);
const localVideo = ref(null);
const localAudio = ref(null);
const videoStream = ref(null);
const audioStream = ref(null);
const isCameraOn = ref(false);
const isMicrophoneOn = ref(false);
const canvas = ref(null);
const testAudio = ref(null);

const emit = defineEmits(['start']);

const onStartHandler = () => {
  if (isLoadingDevice.value) {
    return;
  }
  emit('start');
};

const playAudioHandler = () => {
  if (!mediaStore.audioOutputDevice) return;
  testAudio.value.src = sound;
  testAudio.value.setSinkId(mediaStore.audioOutputDevice);
  testAudio.value.play();
};

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

    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    const barWidth = (WIDTH / bufferLength) * 2.5;
    let barHeight;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i];
      canvasCtx.fillStyle = `rgb(${barHeight + 146}, ${barHeight + 39}, ${
        barHeight + 36
      })`;

      canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);
      x += barWidth + 1;
    }
  };
  draw();
};

const selectDevice = (kind, deviceId) => {
  mediaStore.selectDevice(kind, deviceId);
  if (kind === 'videoinput' && isCameraOn.value) {
    isCameraOn.value = false;
    toggleCamera();
  }
  if (kind === 'audioinput' && isMicrophoneOn.value) {
    isMicrophoneOn.value = false;
    toggleMicrophone();
  }
};

const toggleCamera = async () => {
  if (!mediaStore.videoInputDevice) {
    return;
  }

  if (isCameraOn.value) {
    videoStream.value.getTracks().forEach((track) => track.stop());
    videoStream.value = null;
    localVideo.value.srcObject = null;
    isCameraOn.value = false;
    return;
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      deviceId: mediaStore.videoInputDevice,
    },
  });
  if (localVideo.value.srcObject) {
    localVideo.value.srcObject = stream;
  }

  videoStream.value = stream;
  isCameraOn.value = true;
};

const toggleMicrophone = async () => {
  if (!mediaStore.audioInputDevice) {
    return;
  }
  console.log('toggleMicrophone');
  if (isMicrophoneOn.value) {
    audioStream.value.getTracks().forEach((track) => track.stop());
    audioStream.value = null;
    isMicrophoneOn.value = false;
    return;
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      deviceId: mediaStore.audioInputDevice,
    },
  });
  audioStream.value = stream;
  if (localAudio.value.srcObject) {
    localAudio.value.srcObject = stream;
  }
  isMicrophoneOn.value = true;
  visualizeAudioStream();
};

const initDevices = async () => {
  try {
    isLoadingDevice.value = true;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

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
    stream.getTracks().forEach(function (track) {
      //find current used device and set in store
      const device = devices.find(
        (d) => d.deviceId === track.getSettings().deviceId
      );
      if (device.kind === 'audioinput' && !mediaStore.audioInputDevice) {
        mediaStore.audioInputDevice = device.deviceId;
      }
      if (device.kind === 'videoinput' && !mediaStore.videoInputDevice) {
        mediaStore.videoInputDevice = device.deviceId;
      }
      track.stop();
    });

    if (audioOutputs.value.length > 0) {
      mediaStore.audioOutputDevice = audioOutputs.value[0].value;
    }
    // if (videoInputs.value.length > 0) {
    //   toggleCamera();
    // }
    // if (audioInputs.value.length > 0) {
    //   toggleMicrophone();
    // }
  } catch (error) {
    console.log(error);
  } finally {
    isLoadingDevice.value = false;
  }
};

onMounted(() => {
  initDevices();
});
</script>

<style lang="scss" scoped></style>
