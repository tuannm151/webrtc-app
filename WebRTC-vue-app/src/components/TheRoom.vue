<template>
  <div class="flex gap-10">
    <div class="flex flex-col gap-10">
      <video ref="webcamVideo" muted="muted" autoplay playsinline></video>
    </div>
    <div class="flex flex-col gap-10">
      <video
        v-for="stream in remoteStreams"
        :key="stream.id"
        autoplay
        playsinline
        :src-object.prop.camel="stream"
      ></video>
    </div>
    <button class="btn btn-outline btn-warning" @click="onStartCall">
      Bắt đầu gọi
    </button>
  </div>
</template>

<script setup>
import { useUserStore } from '../store/userStore';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { WebsocketClient } from '../utils/websocket-client';
import WebRTCConnection from '../utils/WebRTCConnection';

const route = useRoute();
const store = useUserStore();
const webcamVideo = ref(null);
const remoteStreams = ref([]);
const wsConn = ref(null);
// lấy userName từ store
const { userName } = store;

const onStartCall = async () => {
  // initWebRTCConnection();
};

const initConnection = async () => {
  const configuration = {
    iceServers: [
      {
        urls: 'stun:openrelay.metered.ca:80',
      },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
    ],
  };
  const pc = new RTCPeerConnection(configuration);

  try {
    const streamId = [];
    const localStream = await openCamera(600, 600);

    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });
    webcamVideo.value.srcObject = localStream;
    pc.ontrack = (event) => {
      const stream = event.streams[0];
      if (event.track.kind === 'video') {
        remoteStreams.value.push(stream);
      }
      console.log(remoteStreams.value);
    };
  } catch (error) {
    console.log(error);
  }

  // lấy roomId và secret từ url
  const roomId = route.params.roomId;
  const secret = route.query.key;

  const wsClient = new WebsocketClient(import.meta.env.VITE_CONNECTION_URL);
  wsClient.onConnected = () => {
    wsClient.join(roomId, secret, {
      userName,
    });
  };
  wsClient.on('Announce', (message) => {
    console.log('Announce', message.Announce);
  });
  wsClient.on('Connected', (_, data) => {
    console.log('Connected', `${data.userName} joined`);
  });
  wsClient.on('Disconnected', () => {
    console.log('Disconnected', `user left`);
  });
  wsClient.on('Joined', () => {
    const webRTCConn = new WebRTCConnection(pc, wsClient, {
      userName,
    });
    webRTCConn.connectRTC();
  });
  wsConn.value = wsClient;
};

async function openCamera(minWidth, minHeight) {
  const constraints = {
    audio: { echoCancellation: true },
    video: {
      width: { min: minWidth },
      height: { min: minHeight },
    },
  };

  return await navigator.mediaDevices.getUserMedia(constraints);
}

onMounted(() => {
  // initStream();
  initConnection();
});
</script>

<style lang="scss" scoped></style>
