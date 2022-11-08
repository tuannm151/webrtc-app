<template>
  <div
    ref="drawer"
    class="absolute w-28 xl:w-32 h-full z-50 left-0"
    :class="[
      isOpen ? 'translate-x-0' : 'translate-x-[-100%]',
      'transition-all duration-300 ease-in-out',
    ]"
  >
    <div
      class="w-full h-full flex flex-col gap-4 lg:py-6 lg:px-2 items-center transition-all duration-300"
      :class="[blurBackground ? 'glassy' : '']"
    >
      <SharedItem
        :img-src="'/src/assets/img/gallery-meet-sm.jpg'"
        :description="'Màn hình chung'"
        :is-active="currentStreamId === 'gallery'"
        @click="
          handleClickItem({
            streamId: 'gallery',
            socketId: 'gallery',
          })
        "
      />
      <SharedItem
        v-for="stream in streams"
        :key="stream.streamId"
        :icon="'fa-solid fa-share-from-square'"
        :description="`${stream.data.UserName} đang chia sẻ`"
        :is-active="stream.streamId === currentStreamId"
        :local-share="stream.socketId === 'local'"
        @stop-share="handleStopShare(stream.streamId)"
        @click="
          handleClickItem({
            streamId: stream.streamId,
            socketId: stream.socketId,
          })
        "
      />
    </div>
    <button
      class="absolute top-1/2 right-[-28px] -translate-y-1/2 rounded-full h-6 w-6 transition-opacity glassy glassy-dark"
      :class="[blurBackground ? 'opacity-100' : 'opacity-0']"
      @click="toggleDrawer"
    >
      <FontAwesomeIcon
        :icon="isOpen ? 'fa-solid fa-angle-left' : 'fa-solid fa-angle-right'"
        class="text-white text-sm"
      />
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import SharedItem from './SharedItem.vue';

const drawer = ref(null);
const isOpen = ref(false);

const emit = defineEmits(['switch-stream', 'stop-share']);

const props = defineProps({
  streams: {
    type: Array,
    required: true,
  },
  currentStreamId: {
    type: String,
    required: true,
  },
  blurBackground: {
    type: Boolean,
    required: false,
    default: true,
  },
});

const handleClickItem = (data) => {
  const { streamId } = data;

  // ignore if click on current stream
  if (streamId === props.currentStreamId) return;
  emit('switch-stream', data);
};

const handleStopShare = (streamId) => {
  console.log('stop share', streamId);
  emit('stop-share', streamId);
};

const toggleDrawer = () => {
  isOpen.value = !isOpen.value;
};
</script>

<style lang="scss" scoped>
.glassy {
  /* From https://css.glass */
  background: rgba(255, 255, 255, 0.1);
  // backdrop-filter: blur(1px);
  // -webkit-backdrop-filter: blur(2px);

  &-dark {
    background: rgba(0, 0, 0, 0.2);
  }
}
</style>
