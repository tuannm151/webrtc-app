<script setup>
import PageWrapper from './components/PageWrapper.vue';
import HomePage from './components/HomePage.vue';
</script>

<template>
  <PageWrapper><HomePage /></PageWrapper>
</template>

<style scoped>
.m-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
}
</style>
