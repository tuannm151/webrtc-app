<template>
  <div class="p-1" ref="videoContainer">
    <div
      class="flex w-full h-full justify-center items-center bg-black relative overflow-hidden rounded-xl"
    >
      <video
        ref="localVideo"
        class="absolute w-full h-full object-cover"
        :class="[videoOn ? '' : 'hidden']"
        autoplay
        muted
        playsinline
      ></video>
      <audio ref="localAudio" autoplay />
      <div
        class="absolute text-white font-medium bottom-4 left-4 bg-gray-transparent px-3 rounded-md"
      >
        {{ userName }}
      </div>
      <div
        v-if="!stream || !videoOn"
        class="w-28 h-28 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-2xl font-medium rounded-full flex justify-center items-center"
        :class="[avatarBgColor]"
      >
        {{ avatarName }}
      </div>
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
import { computed } from 'vue';
import { ref, watchEffect } from 'vue';
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
    type: Object,
  },
  width: {
    type: [String, Number],
    required: true,
  },
  aspectRatio: {
    type: Number,
    required: true,
  },
});
const videoContainer = ref(null);
const localVideo = ref(null);
const localAudio = ref(null);
const avatarName = computed(() => {
  // remove all non-alphanumeric characters exccept spaces
  const name = props.userName.replace(/[^a-zA-Z0-9 ]/g, '');
  // get short name max 3 characters
  const shortName = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .substring(0, 3);
  return shortName;
});

const avatarBgColor = computed(() => {
  const colors = [
    'bg-red-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return color;
});

watchEffect(() => {
  if (props.stream) {
    const videoStream = new MediaStream();
    const audioStream = new MediaStream();

    props.stream.getTracks().forEach((track) => {
      if (track.kind === 'video') {
        videoStream.addTrack(track);
      } else if (track.kind === 'audio') {
        audioStream.addTrack(track);
      }
    });
    if (videoStream.getTracks().length > 0) {
      localVideo.value.srcObject = videoStream;
    }
    if (audioStream.getTracks().length > 0) {
      localAudio.value.srcObject = audioStream;
    }
  }
});

watchEffect(() => {
  if (videoContainer.value) {
    if (props.width === 'full') {
      videoContainer.value.style.width = '100%';
      videoContainer.value.style.height = '100%';

      return;
    }
    videoContainer.value.style.width = `${props.width}px`;
    videoContainer.value.style.height = `${props.width * props.aspectRatio}px`;
  }
});
</script>

<style lang="scss" scoped></style>
