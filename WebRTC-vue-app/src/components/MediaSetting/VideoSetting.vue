div
<template>
  <div class="w-full h-full flex flex-col">
    <div class="flex flex-col gap-1 flex-1">
      <label class="text-md font-bold ml-14">Camera</label>
      <div class="flex gap-4 items-center">
        <FontAwesomeIcon icon="fa-solid fa-video" class="text-xl w-10" />
        <MSelect
          :options="videoInputs"
          @select="(value) => selectDevice(DeviceType.VideoInput, value)"
          :isLoading="isLoading"
          :defaultValue="videoInputDevice"
          :is-loading="isLoading"
        />
      </div>
    </div>
    <div class="p-10">
      <video
        ref="localVideo"
        class="w-full aspect-4/3 object-cover rounded-lg"
        poster="../assets/black_image.jpg"
        autoplay
        muted
      ></video>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { useMediaStore } from '../../store/mediaStore';
import MSelect from '../MSelect.vue';
import { DeviceType } from '../../enums/MediaEnum';
const emit = defineEmits(['select-device']);
const selectDevice = (type, value) => {
  emit('select-device', { type, value });
};

const localVideo = ref(null);

const { videoInputDevice, isLoading } = useMediaStore();

const props = defineProps({
  videoInputs: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  videoStream: {
    type: Object,
  },
});

watchEffect(() => {
  if (props.videoStream && localVideo.value) {
    localVideo.value.srcObject = props.videoStream;
  }
});
</script>

<style lang="scss" scoped></style>
