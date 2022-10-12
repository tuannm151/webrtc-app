<script setup>
import { useRoute } from 'vue-router';
import AppContainer from '../components/AppContainer.vue';
import io from 'socket.io-client';
import { useUserStore } from '../store/userStore';
import { onMounted } from 'vue';
// get room id from url
const route = useRoute();
const roomId = route.params.roomId;

// get username from store
const store = useUserStore();
const { userName } = store;

const initSocketConnection = () => {
  // join socket room
  const socket = io('http://localhost:3000');
  socket.emit('join-room', roomId, userName);

  socket.on('connect', () => {
    console.log(socket.connected ? 'connected' : 'not connected');
  });

  socket.on('user-connected', (data) => {
    console.log(data.msg);
  });
  socket.on('user-disconnected', (data) => {
    console.log(data.msg);
  });
};

onMounted(() => {
  initSocketConnection();
});
</script>

<template>
  <AppContainer> </AppContainer>
</template>

<style lang="scss" scoped></style>
