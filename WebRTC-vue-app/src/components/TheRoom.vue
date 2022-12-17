<template>
  <div
    ref="roomContainer"
    class="w-full h-full relative flex justify-center items-center"
  >
    <TheBackground classes="bg-base-300" />
    <div>
      <audio ref="localAudio" class="hidden" autoplay></audio>
      <audio
        v-for="peer in peers"
        :key="peer.peerId"
        autoplay
        class="hidden"
        :src-object.prop.camel="peer.audioStream"
      />
    </div>
    <MediaSetting v-if="isSettingOpen" @close="toggleSetting" />
    <SharedDrawer
      :streams="sharedStreamInfos"
      :current-stream-id="
        isGalleryView ? 'gallery' : currentSharedStream?.stream.id || 'gallery'
      "
      :blurBackground="showUI"
      :isOpen="isDrawerOpen"
      @switch-stream="handleSwitchStream"
      @stop-share="handleDrawerStopShare"
      @toggle="toggleDrawer"
    />

    <div
      class="w-full h-full overflow-hidden pb-14 transition-transform"
      :class="type === 'xs' && isChatOpen ? 'hidden' : ''"
    >
      <VideoGrid
        v-if="isGalleryView"
        :localStream="localStream"
        :peers="peers"
        :isMicrophoneOn="isMicrophoneOn"
        :isCameraOn="isCameraOn"
      />

      <StreamBox
        v-if="!isGalleryView && currentSharedStream"
        :currentSharedStream="currentSharedStream"
      />
    </div>
    <Transition name="chat">
      <ChatTab
        v-if="isChatOpen"
        :messages="chatMessages"
        @send-message="handleSendChatMessage"
      />
    </Transition>

    <Transition name="control">
      <ControlBar
        :isMicrophoneOn="isMicrophoneOn"
        :isCameraOn="isCameraOn"
        :isChatOpen="isChatOpen"
        @toggle-microphone="toggleMicrophone"
        @toggle-camera="toggleCamera"
        @toggle-chat="toggleChat"
        @share-screen="startSharing"
        @hang-up="handleHangUp"
        @setting="toggleSetting"
        @fullscreen="toggleFullscreen"
      />
    </Transition>
  </div>
</template>

<script setup>
import { useUserStore } from '../store/userStore';
import { useMediaStore } from '../store/mediaStore';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { WebsocketClient } from '../utils/websocket-client';
import PeerConnectionManager from '../utils/PeerConnectionManager';
import connectedSound from '../assets/connected_sound.mp3';
import VideoGrid from './VideoGrid.vue';
import { useToast } from 'vue-toastification';
import SharedDrawer from './SharedDrawer.vue';
import StreamBox from './StreamBox.vue';
import ChatTab from './Chat/ChatTab.vue';
import { generateBgColor } from '../utils/stringUtils';
import ControlBar from './ControlBar.vue';
import useBreakpoints from '../hooks/useBreakpoints';
import MediaSetting from './MediaSetting/MediaSetting.vue';
import TheBackground from './Utils/TheBackground.vue';

const route = useRoute();
const router = useRouter();
const toastOptions = {
  showCloseButtonOnHover: true,
  closeButton: false,
  timeout: 3000,
  icon: true,
  hideProgressBar: true,
};
const userStore = useUserStore();
const { audioInputDevice, videoInputDevice, audioOutputDevice } =
  useMediaStore();
const peers = ref([]);
const chatMessages = ref([]);
const sharedStreamInfos = ref([]);
const isGalleryView = ref(true);
const isChatOpen = ref(false);
const isDrawerOpen = ref(false);
const isSettingOpen = ref(false);
const currentSharedStream = ref(null);
const wsConn = reactive(
  new WebsocketClient(import.meta.env.VITE_CONNECTION_URL)
);

const { userName: UserName } = userStore;
const userData = {
  UserName,
};
const { type } = useBreakpoints();
const pcManager = reactive(new PeerConnectionManager(wsConn, userData));
const roomContainer = ref(null);
const toast = useToast();
const isCameraOn = ref(false);
const isMicrophoneOn = ref(false);
const localStream = ref(null);
const localAudio = ref(null);
const showUI = ref(true);

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

const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value;
};

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value;
};

const toggleSetting = () => {
  console.log('toggleSetting');
  isSettingOpen.value = !isSettingOpen.value;
};

const startSharing = async () => {
  try {
    const stream = await pcManager.startSharingScreen();

    isGalleryView.value = false;
    currentSharedStream.value = {
      stream,
      data: {
        UserName: 'bạn',
      },
      isLocal: true,
      socketId: 'local',
    };
    sharedStreamInfos.value.unshift({
      streamId: stream.id,
      data: {
        UserName: 'bạn',
      },
      socketId: 'local',
    });
    isDrawerOpen.value = true;
  } catch (err) {
    console.error(err);
  }
};

const handleSwitchStream = (data) => {
  // if mobile user switch stream during open chat
  if (type.value === 'xs' && isChatOpen.value) {
    isChatOpen.value = false;
  }
  const { socketId, streamId } = data;
  if (streamId === 'gallery') {
    isGalleryView.value = true;
    return;
  }

  isGalleryView.value = false;
  if (socketId === 'local') {
    const stream = pcManager.localShareStream.find(
      (stream) => stream.id === streamId
    );

    if (stream) {
      currentSharedStream.value = {
        stream,
        data: {
          UserName: 'bạn',
        },
      };
    }
    return;
  }

  if (currentSharedStream.value) {
    // stop if having any active remote stream
    pcManager.requestStopScreen({
      socketId,
      streamId: currentSharedStream.value.stream.id,
    });
  }
  // request new stream
  console.log('switch-stream');
  pcManager.requestScreen({ socketId, streamId });
};

const toggleFullscreen = () => {
  const elem = roomContainer.value;
  if (!document.fullscreenElement) {
    elem.requestFullscreen().catch((err) => {
      console.error(err);
    });
  } else {
    document.exitFullscreen();
  }
};

const appendChatMessage = (message) => {
  // check if last message is from the same user and less than 1 minutes
  const lastMessage = chatMessages.value[chatMessages.value.length - 1];
  if (
    lastMessage &&
    lastMessage.user.id === message.user.id &&
    Date.now() - lastMessage.timestamp < 60 * 1000
  ) {
    lastMessage.msgs.push(message.msgs[0]);
    return;
  }
  chatMessages.value.push(message);
};

const handleSendChatMessage = (data) => {
  const newMessage = {
    user: {
      id: 'local',
    },
    timestamp: Date.now(),
    msgs: [data],
    isLocal: true,
  };
  appendChatMessage(newMessage);
  wsConn.send({
    ActionType: 'ChatMessage',
    Data: JSON.stringify(data),
  });
};

const handleHangUp = () => {
  wsConn.close();
  router.push('/');
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

const removeSharedStream = ({ type, id }) => {
  console.log('removeSharedStream', type, id);
  if (type === 'all') {
    sharedStreamInfos.value = sharedStreamInfos.value.filter(
      (s) => s.socketId !== id
    );
  }
  if (type === 'stream') {
    sharedStreamInfos.value = sharedStreamInfos.value.filter(
      (s) => s.streamId !== id
    );
  }

  if (
    currentSharedStream.value?.stream.id !== id &&
    currentSharedStream.value?.socketId !== id
  ) {
    return;
  }
  isGalleryView.value = true;
  currentSharedStream.value = null;
};

const handleDrawerStopShare = (streamId) => {
  console.log('handleDrawerStopShare', streamId);
  pcManager.stopSharingStream(streamId);
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
  pcManager.onConnection = ({ id, data: peerData }) => {
    peers.value.push({
      id,
      data: {
        ...peerData,
        avatarBg: generateBgColor(id),
      },
      videoOn: false,
      audioOn: false,
      audioStream: null,
      videoStream: null,
    });
    playConnectedSound();
  };
  pcManager.onPeerStateChange = (id, state) => {
    console.log(state);
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
    const peer = peers.value.find((p) => p.id === id);
    if (!peer) return;
    toast.info(`${peer.data.UserName} đã rời khỏi phòng`, toastOptions);
    peers.value = peers.value.filter((p) => p.id !== id);
    removeSharedStream({ type: 'all', id });
  };
  pcManager.onRemoteStartStream = ({ socketId, streamId }) => {
    const peer = peers.value.find((p) => p.id === socketId);

    toast(`${peer.data.UserName} đang chia sẻ màn hình`, toastOptions);
    sharedStreamInfos.value.push({
      socketId: socketId,
      data: peer.data,
      streamId,
    });
    // if having first stream open drawer
    if (sharedStreamInfos.value.length === 1) {
      isDrawerOpen.value = true;
    }
  };
  pcManager.onRemoteStopStream = ({ socketId, streamId }) => {
    const peer = peers.value.find((p) => p.id === socketId);
    toast(`${peer.data.UserName} đã dừng chia sẻ màn hình`, toastOptions);
    removeSharedStream({ type: 'stream', id: streamId });
  };
  pcManager.onGotScreenStream = ({ stream }) => {
    // find info of the stream
    const streamInfo = sharedStreamInfos.value.find(
      (s) => s.streamId === stream.id
    );
    if (!streamInfo) return;
    currentSharedStream.value = {
      ...streamInfo,
      stream,
    };
  };
  pcManager.onStopSharingStream = (streamId) => {
    console.log('onStopSharingStream', streamId);
    removeSharedStream({ type: 'stream', id: streamId });
  };
  pcManager.onReceivedChatMessage = ({ id, data }) => {
    const peer = peers.value.find((p) => p.id === id);
    if (!peer) return;
    const newMessage = {
      user: {
        id: peer.id,
        avatarBg: peer.data.avatarBg,
        userName: peer.data.UserName,
      },
      timestamp: Date.now(),
      msgs: [data],
    };

    appendChatMessage(newMessage);
  };
};
onMounted(() => {
  initConn();
});
onUnmounted(() => {
  wsConn.close();
});
</script>

<style lang="scss" scoped>
.control-enter-active,
.control-leave-active {
  transition: transform 0.5s ease;
  transform: translateX(-50%) translateY(0);
}

.control-enter-from,
.control-leave-to {
  transform: translateX(-50%) translateY(100px);
}

.chat-enter-active,
.chat-leave-active {
  transition: all 0.4s ease;
  // width: 350px;
  transform: translateX(0);
}
.chat-enter-from,
.chat-leave-to {
  // width: 0;

  transform: translateX(100%);
}
</style>
