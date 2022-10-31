<template>
  <AppContainer>
    <MediaMenu v-if="!isStart" @start="onStart" />
    <TheRoom v-if="isStart" />
  </AppContainer>
</template>

<script setup>
import { ref } from 'vue';
import AppContainer from '../components/AppContainer.vue';
import MediaMenu from '../components/MediaMenu.vue';
import TheRoom from '../components/TheRoom.vue';

const isStart = ref(false);

const onStart = () => {
  isStart.value = true;
};
</script>

<style lang="scss" scoped></style>
