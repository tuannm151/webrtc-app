<template>
  <div class="flex gap-10">
    <div class="flex flex-col gap-10">
      <video
        class="w-[300px] h-[300px] object-cover"
        ref="localVideo"
        muted="muted"
        autoplay
        playsinline
      ></video>
    </div>
    <div class="flex flex-col gap-10">
      <div
        class="w-[300px] h-[300px] object-cover"
        v-for="data in remoteStreams"
        :key="data.id"
      >
        <video
          class="w-[300px] h-[300px] object-cover"
          autoplay
          playsinline
          muted
          :src-object.prop.camel="data.stream"
        ></video>
      </div>
    </div>
    <button class="btn btn-outline btn-warning" @click="onStartCall">
      Bắt đầu gọi
    </button>
  </div>
</template>

<script setup>
import { useUserStore } from '../store/userStore';
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

import { WebsocketClient } from '../utils/websocket-client';
import PeerConnectionManager from '../utils/PeerConnectionManager';

const route = useRoute();
const store = useUserStore();
const localVideo = ref(null);
const remoteStreams = ref([]);
const { userName } = store;
const wsConn = reactive(
  new WebsocketClient(import.meta.env.VITE_CONNECTION_URL)
);
const pcManager = reactive(new PeerConnectionManager(wsConn));

const initConn = async () => {
  // lấy roomId và secret từ url
  const roomId = route.params.roomId;
  const secret = route.query.key;

  wsConn.onConnected = () => {
    wsConn.join(roomId, secret, {
      userName,
    });
  };
  wsConn.on('Announce', (message) => {
    console.log('Announce', message.Announce);
  });
  pcManager.onStreamChange = (stream, id) => {
    const remoteStream = remoteStreams.value.find((s) => s.id === id);

    if (remoteStream) {
      if (stream === null) {
        remoteStreams.value = remoteStreams.value.filter((s) => s.id !== id);
        return;
      }
      remoteStreams.value = remoteStreams.value.map((s) => {
        if (s.id === id) {
          return {
            id,
            stream,
          };
        }
        return s;
      });
    } else {
      remoteStreams.value.push({
        id,
        stream,
      });
    }
  };
};

// const initConnection = async () => {
//   // lấy roomId và secret từ url
//   const roomId = route.params.roomId;
//   const secret = route.query.key;

//   const wsClient = new WebsocketClient(import.meta.env.VITE_CONNECTION_URL);
//   wsClient.onConnected = () => {
//     wsClient.join(roomId, secret, {
//       userName,
//     });
//   };
//   wsClient.on('Announce', (message) => {
//     console.log('Announce', message.Announce);
//   });
//   const pcManager = new PeerConnectionManager(wsClient);
//   pcManager.onStreamChange = onStreamChangeHandler;
//   await pcManager.getUserMedia();
//   pcManagerRef.value = pcManager;
// };

const onStartCall = async () => {
  try {
    const localStream = await pcManager.openLocalMedia();
    localVideo.value.srcObject = localStream;
  } catch (error) {
    console.log(error);
  }
};

onMounted(() => {
  // initStream();
  // initConnection();
  initConn();
});
</script>

<style lang="scss" scoped></style>
