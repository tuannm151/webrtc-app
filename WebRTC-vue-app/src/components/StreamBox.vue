<template>
  <div
    ref="videoContainer"
    class="w-full h-full overflow-hidden relative flex justify-center items-center pb-10 md:pb-0"
  >
    <VideoBox
      :stream="currentSharedStream.stream"
      :userName="`Màn hình của ${
        currentSharedStream.isLocal ? 'bạn' : currentSharedStream.data.UserName
      }`"
      :audioOn="true"
      :videoOn="true"
      :width="maxWidth"
      :height="maxHeight"
      :isSharedStream="true"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import useScreenFit from '../hooks/useScreenFit';
import VideoBox from './VideoBox.vue';
const videoContainer = ref(null);

defineProps({
  currentSharedStream: {
    type: Object,
    required: true,
  },
});
const { maxWidth, maxHeight, setTotalSize, setStreamState } = useScreenFit();

const setContainerSize = () => {
  const TotalWidth = videoContainer.value?.offsetWidth;
  const TotalHeight = videoContainer.value?.offsetHeight;
  if (!TotalWidth || !TotalHeight) {
    return;
  }
  setTotalSize({
    TotalWidth,
    TotalHeight,
  });
};

onMounted(() => {
  setContainerSize();
  setStreamState({
    StreamCount: 1,
    AspectRatio: 9 / 16,
  });
  new ResizeObserver(setContainerSize).observe(videoContainer.value);
});
</script>

<style lang="scss" scoped></style>
