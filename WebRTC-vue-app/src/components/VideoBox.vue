<template>
  <div class="p-1 transition-all duration-500" ref="videoContainer">
    <div
      class="flex w-full h-full justify-center items-center bg-gray-700 relative overflow-hidden rounded-xl"
    >
      <video
        v-if="stream"
        :src-object.prop.camel="stream"
        class="absolute w-full h-full"
        :class="[
          videoOn ? '' : 'hidden',
          isSharedStream ? 'object-contain' : 'object-cover',
        ]"
        :controls="isSharedStream"
        autoplay
        playsinline
      ></video>
      <div
        class="absolute text-white font-medium bottom-4 left-4 bg-gray-transparent px-3 rounded-md"
      >
        {{ isLocal ? 'Bạn' : userName }}
      </div>
      <UserAvatar
        v-if="!stream || !videoOn"
        :userName="isLocal ? 'Bạn' : userName"
        :avatarBg="avatarBg"
        :nameLength="isLocal ? 'full' : 'short'"
        classes="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        sizeClass="w-28 h-28"
        textSize="text-2xl"
      />
      <div
        v-if="!audioOn"
        class="h-8 w-8 flex justify-center items-center rounded-full absolute bg-gray-transparent right-4 top-4 z-10"
      >
        <FontAwesomeIcon
          icon="fa-solid fa-microphone-slash"
          class="text-white text-sm"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import UserAvatar from './UserAvatar.vue';

const props = defineProps({
  userName: {
    type: String,
    required: true,
  },
  audioOn: {
    type: Boolean,
    required: true,
  },
  videoOn: {
    type: Boolean,
    required: true,
  },
  stream: {
    type: [MediaStream, null],
    required: false,
  },
  width: {
    type: [String, Number],
    required: true,
  },
  height: {
    type: [String, Number],
    required: true,
  },
  avatarBg: {
    type: String,
    required: false,
    default: 'bg-red-500',
  },
  isLocal: {
    type: Boolean,
    required: false,
    default: false,
  },

  isSharedStream: {
    type: Boolean,
    required: false,
    default: false,
  },
});
const videoContainer = ref(null);

watchEffect(() => {
  if (videoContainer.value) {
    if (props.width === 'full' && props.height === 'full') {
      videoContainer.value.style.width = '100%';
      videoContainer.value.style.height = '100%';
      return;
    }
    videoContainer.value.style.width = `${props.width}px`;
    videoContainer.value.style.height = `${props.height}px`;
  }
});
</script>

<style lang="scss" scoped>
video::-webkit-media-controls-current-time-display,
video::-webkit-media-controls-play-button,
video::-webkit-media-controls-timeline {
  display: none;
}
</style>
