<template>
  <div
    ref="videoContainer"
    class="w-full h-full relative flex-1 flex-wrap md:flex-nowrap pb-10 md:pb-0"
  >
    <VideoBox
      userName="Bạn"
      :audioOn="isMicrophoneOn"
      :videoOn="isCameraOn"
      :stream="localStream"
      :width="maxWidth"
      :height="maxHeight"
      :isLocal="true"
    />
    <VideoBox
      v-for="peer in peers"
      :key="peer.id"
      :userName="peer.data.UserName"
      :audioOn="peer.audioOn"
      :videoOn="peer.videoOn"
      :stream="peer.videoStream"
      :width="maxWidth"
      :height="maxHeight"
      :avatarBg="peer.data.avatarBg"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue';
import useScreenFit from '../hooks/useScreenFit';
import VideoBox from './VideoBox.vue';

const videoContainer = ref(null);
const totalWidth = ref(0);
const totalHeight = ref(0);

const props = defineProps({
  localStream: {
    type: [MediaStream, null],
    required: true,
  },
  peers: {
    type: Array,
    required: true,
  },
  isMicrophoneOn: {
    type: Boolean,
    required: true,
  },
  isCameraOn: {
    type: Boolean,
    required: true,
  },
});
const { maxWidth, maxHeight, setTotalSize, setStreamState } = useScreenFit();

const streamCount = computed(() => props.peers.length + 1);

const aspectRatio = computed(() => {
  switch (streamCount.value) {
    case 2:
      if (768 <= totalWidth.value && totalWidth.value <= 1280) {
        return 6 / 5;
      }
      return 3 / 4;
    case 3:
      return totalWidth.value <= 768 ? 9 / 16 : 16 / 12;
    case 4:
      return 9 / 16;
    default:
      return 3 / 4;
  }
});

watchEffect(() => {
  setStreamState({
    StreamCount: streamCount.value,
    AspectRatio: aspectRatio.value,
  });
});

watchEffect(() => {
  const row = Math.floor(totalHeight.value / maxHeight.value);
  const column = Math.floor(totalWidth.value / maxWidth.value);
  if (row === 1) {
    videoContainer.value.style.justifyContent = 'center';
    videoContainer.value.style.alignItems = 'center';
    videoContainer.value.style.display = 'flex';
  } else if (row > 1 && column > 1) {
    videoContainer.value.style.display = 'grid';
    videoContainer.value.style.gridTemplateColumns = `repeat(${column}, 1fr)`;
    videoContainer.value.style.gridTemplateRows = `repeat(${row}, 1fr)`;
    // justify-items: center;
    videoContainer.value.style.justifyItems = 'center';
  }
});

const setContainerSize = () => {
  const TotalWidth = videoContainer.value?.offsetWidth;
  const TotalHeight = videoContainer.value?.offsetHeight;
  if (!TotalWidth || !TotalHeight) {
    return;
  }
  totalWidth.value = TotalWidth;
  totalHeight.value = TotalHeight;
  setTotalSize({
    TotalWidth,
    TotalHeight,
  });
};

onMounted(() => {
  setContainerSize();
  new ResizeObserver(setContainerSize).observe(videoContainer.value);
});
</script>

<style lang="scss" scoped></style>
