<template>
  <div class="w-full h-full relative pb-16 pt-4">
    <audio ref="localAudio" class="hidden" autoplay></audio>
    <div
      ref="videoContainer"
      :class="['w-full h-full relative', videoContainerClass]"
    >
      <VideoBox
        userName="Bạn"
        :audioOn="isMicrophoneOn"
        :videoOn="isCameraOn"
        :stream="localStream"
        :width="maxStreamWidth"
        :aspectRatio="aspectRatio"
      />
      <VideoBox
        v-for="peer in peers"
        :key="peer.id"
        :userName="peer.data.UserName"
        :audioOn="peer.audioOn"
        :videoOn="peer.videoOn"
        :stream="peer.stream"
        :width="maxStreamWidth"
        :aspectRatio="aspectRatio"
      />
    </div>
    <div class="flex gap-6 absolute bottom-2 left-1/2 -translate-x-1/2 mx-auto">
      <ToggleDeviceBtn
        iconOn="fa-solid fa-microphone"
        iconOff="fa-solid fa-microphone-slash"
        :isOn="isMicrophoneOn"
        @click="toggleMicrophone"
        classes="w-12 h-12"
        size="text-2xl"
      />
      <ToggleDeviceBtn
        iconOn="fa-solid fa-video"
        iconOff="fa-solid fa-video-slash"
        :isOn="isCameraOn"
        @click="toggleCamera"
        classes="w-12 h-12"
        size="text-2xl"
      />
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '../store/userStore';
import { useMediaStore } from '../store/mediaStore';
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { WebsocketClient } from '../utils/websocket-client';
import PeerConnectionManager from '../utils/PeerConnectionManager';
import ToggleDeviceBtn from './ToggleDeviceBtn.vue';
import VideoBox from './VideoBox.vue';
import connectedSound from '../assets/connected_sound.mp3';
import { computed } from 'vue';

const route = useRoute();
const userStore = useUserStore();
const { audioInputDevice, videoInputDevice, audioOutputDevice } =
  useMediaStore();
const peers = ref([]);
const { userName: UserName } = userStore;
const wsConn = reactive(
  new WebsocketClient(import.meta.env.VITE_CONNECTION_URL)
);
const pcManager = reactive(
  new PeerConnectionManager(wsConn, {
    UserName,
  })
);
const isCameraOn = ref(false);
const isMicrophoneOn = ref(false);
const localStream = ref(null);
const localAudio = ref(null);
const videoContainer = ref(null);

const areaFits = ({
  possibleWidth,
  streamCount,
  TotalWidth,
  TotalHeight,
  ratio,
}) => {
  let totalHeightNeeded;

  const streamsPerRow = Math.floor(TotalWidth / possibleWidth);
  const rowsNeeded = Math.ceil(streamCount / streamsPerRow);
  if (rowsNeeded > 0) {
    totalHeightNeeded = rowsNeeded * possibleWidth * ratio;
  } else {
    totalHeightNeeded = possibleWidth * ratio;
  }
  return totalHeightNeeded < TotalHeight;
};
const aspectRatio = computed(() => {
  const streamCount = peers.value.length + 1;
  if (streamCount === 4) return 9 / 16;
  return 3 / 4;
});

const maxStreamWidth = computed(() => {
  if (!videoContainer.value) return 0;
  const streamCount = peers.value.length + 1;

  if (streamCount === 3) return 'full';
  let max = 0;
  // binary search for maximal width in  [50, 5000]
  for (let lower = 50, upper = 5000; lower < upper; ) {
    max = Math.floor((upper + lower) / 2);
    if (max === lower) {
      break;
    }
    if (
      areaFits({
        possibleWidth: max,
        streamCount,
        TotalWidth: videoContainer.value.offsetWidth,
        TotalHeight: videoContainer.value.offsetHeight,
        ratio: aspectRatio.value,
      })
    ) {
      lower = max;
    } else {
      upper = max;
    }
  }
  return max;
});

const videoContainerClass = computed(() => {
  let flex = 'flex justify-center items-center flex-wrap';
  const streamCount = peers.value.length + 1;
  if (streamCount === 3) {
    return 'flex justify-center items-center';
  }
  return flex;
});

const toggleCamera = async () => {
  try {
    if (!videoInputDevice) return;
    isCameraOn.value = !isCameraOn.value;
    if (isCameraOn.value) {
      const stream = await pcManager.openLocalMedia({
        type: 'video',
        deviceId: videoInputDevice,
      });
      localStream.value = stream;
    } else {
      pcManager.closeLocalMedia('video');
      localStream.value = null;
    }
  } catch (err) {
    console.error(err);
  }
};

const playConnectedSound = () => {
  try {
    if (!audioOutputDevice) return;
    localAudio.value.src = connectedSound;
    localAudio.value.setSinkId(audioOutputDevice);
    localAudio.value.play();
  } catch (err) {
    console.error(err);
  }
};

const toggleMicrophone = async () => {
  if (!audioInputDevice) return;
  isMicrophoneOn.value = !isMicrophoneOn.value;
  if (isMicrophoneOn.value) {
    await pcManager.openLocalMedia({
      type: 'audio',
      deviceId: audioInputDevice,
    });
  } else {
    pcManager.closeLocalMedia('audio');
  }
  const newValue = localStream.value;
  localStream.value = newValue;
};

const initConn = async () => {
  // lấy roomId và secret từ url
  const roomId = route.params.roomId;
  const secret = route.query.key;

  wsConn.onConnected = () => {
    wsConn.join(roomId, secret, {
      UserName,
    });
  };
  wsConn.on('Announce', (message) => {
    console.log('Announce', message.Announce);
  });
  pcManager.onConnection = ({ id, data }) => {
    peers.value.push({
      id,
      data,
      videoOn: false,
      audioOn: false,
      stream: null,
    });
  };
  pcManager.onNewClientConnected = () => {
    playConnectedSound();
  };
  pcManager.onPeerStateChange = (id, state) => {
    peers.value = peers.value.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          ...state,
        };
      }
      return p;
    });
  };
  pcManager.onPeerDestroyed = (id) => {
    peers.value = peers.value.filter((p) => p.id !== id);
  };
};
onMounted(() => {
  initConn();
});
</script>

<style lang="scss" scoped></style>
