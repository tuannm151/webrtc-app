/* eslint-env node */
<template>
  <div></div>
</template>

<script setup>
import { useUserStore } from '../store/userStore';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import WebRTCConnection from '../utils/WebRTCConnection';

const route = useRoute();

const store = useUserStore();

const initConn = () => {
  // lấy roomId và secret từ url
  const roomId = route.params.roomId;
  const secret = route.query.key;
  // lấy userName từ store
  const { userName } = store;

  const webRTCconn = new WebRTCConnection();
  webRTCconn.joinRoom(roomId, secret, {
    userName,
  });
};

// const initConnection = () => {
//   // // join socket room
//   // const socket = io('http://localhost:3000');
//   // socket.emit('join-room', roomId, userName);
//   // socket.on('connect', () => {
//   //   console.log(socket.connected ? 'connected' : 'not connected');
//   // });
//   // const configuration = {
//   //   iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
//   // };
//   // const pc = new RTCPeerConnection(configuration);
//   // // listen khi có user mới join room
//   // socket.on('user-connected', (data) => {
//   //   console.log(data.msg);
//   //   // tạo offer và gửi cho user mới
//   //   pc.createOffer()
//   //     .then((offer) => {
//   //       pc.setLocalDescription(offer);
//   //       socket.emit('offer', offer, {
//   //         source: socket.id,
//   //         dest: data.source,
//   //       });
//   //     })
//   //     .catch((err) => console.log(`Có lỗi khi khởi tạo kết nối P2P: ${err}`));
//   // });
//   // // nhận offer từ các user trong room
//   // socket.on('offer', (offer, data) => {
//   //   console.log(`Nhận được một SDP offer: ${JSON.stringify(offer)}`);
//   //   pc.setRemoteDescription(offer);
//   //   // tạo answer và gửi lại cho user gửi offer
//   //   pc.createAnswer()
//   //     .then((answer) => {
//   //       pc.setLocalDescription(answer);
//   //       socket.emit('answer', answer, {
//   //         source: socket.id,
//   //         dest: data.source,
//   //       });
//   //     })
//   //     .catch((err) => console.log(`Có lỗi khi tạo SDP answer: ${err}`));
//   // });
//   // // set remote description để tạo kết nối P2P
//   // socket.on('answer', (answer) => {
//   //   console.log(
//   //     `Nhận được một SDP answer: ${JSON.stringify(
//   //       answer
//   //     )}. Khởi tạo kết nối thành công`
//   //   );
//   //   pc.setRemoteDescription(answer);
//   // });
//   // // listen khi có user rời room
//   // socket.on('user-disconnected', (data) => {
//   //   console.log(data.msg);
//   // });
// };

onMounted(() => {
  initConn();
});
</script>

<style lang="scss" scoped></style>
