<template>
  <div class="w-full h-full flex flex-col">
    <div class="flex gap-6 md:gap-10 flex-col">
      <div class="flex flex-col gap-1 flex-1">
        <label class="text-md font-bold ml-14">Microphone</label>
        <div class="flex gap-4 items-center">
          <FontAwesomeIcon icon="fa-solid fa-microphone" class="text-xl w-10" />
          <MSelect
            :options="audioInputs"
            @select="(value) => selectDevice(DeviceType.AudioInput, value)"
            :isLoading="isLoading"
            :defaultValue="audioInputDevice"
          />
          <div class="ml-4 bg-neutral-focus rounded-xl overflow-hidden">
            <canvas ref="canvas" class="w-12 h-6"></canvas>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-1 flex-1">
        <label class="text-md font-bold ml-14">Speaker</label>
        <div class="flex gap-4 items-center">
          <FontAwesomeIcon icon="fa-solid fa-volume-up" class="text-xl w-10" />
          <MSelect
            :options="audioOutputs"
            @select="(value) => selectDevice(DeviceType.AudioOutput, value)"
            :isLoading="isLoading"
            :defaultValue="audioOutputDevice"
          />
          <button class="btn btn-ghost btn-sm gap-2" @click="playAudioHandler">
            <FontAwesomeIcon
              icon="fa-solid fa-volume-up"
              class="text-xl w-10"
            />
            Test Audio
          </button>
          <audio ref="testAudio"></audio>
        </div>
      </div>
      <div class="flex flex-col gap-6 font-medium">
        <MToggler
          label="Giảm tiếng ồn"
          :isActive="audioSetting.noiseSuppression"
          @toggle="(active) => toggleSetting('noiseSuppression', active)"
        />
        <MToggler
          label="Loại bỏ tiếng vang"
          :isActive="audioSetting.echoCancellation"
          @toggle="(active) => toggleSetting('echoCancellation', active)"
        />
        <MToggler
          label="Khuếch đại âm thanh"
          :isActive="audioSetting.autoGainControl"
          @toggle="(active) => toggleSetting('autoGainControl', active)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onUnmounted, ref, watchEffect } from 'vue';
import { DeviceType } from '../../enums/MediaEnum';
import { useMediaStore } from '../../store/mediaStore';
import MSelect from '../MSelect.vue';
import sound from '@/assets/test_sound.mp3';
import MToggler from '@/components/Utils/MToggler.vue';
const props = defineProps({
  audioInputs: {
    type: Array,
    required: true,
  },
  audioOutputs: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    required: true,
  },
  audioStream: {
    type: Object,
    required: false,
  },
});

const {
  audioOutputDevice,
  audioInputDevice,
  audioSetting,
  changeAudioSetting,
} = useMediaStore();

const toggleSetting = (key, active) => {
  changeAudioSetting({ [key]: active });
};

const canvas = ref(null);
const testAudio = ref(null);
let reqFrame;

const playAudioHandler = () => {
  if (!audioOutputDevice) return;
  testAudio.value.src = sound;
  testAudio.value.setSinkId(audioOutputDevice);
  testAudio.value.play();
};

const visualizeAudioStream = (stream) => {
  // visualize audio stream in circular shape
  const audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();
  const source = audioCtx.createMediaStreamSource(stream);
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

const emit = defineEmits(['select-device']);
const selectDevice = (type, value) => {
  emit('select-device', { type, value });
};

watchEffect(() => {
  if (props.audioStream && canvas.value) {
    visualizeAudioStream(props.audioStream);
  }
});
onUnmounted(() => {
  cancelAnimationFrame(reqFrame);
});
</script>

<style lang="scss" scoped></style>
