<template>
  <div class="min-h-screen bg-gray-100">
    <TheHeader />
    <main>
      <VideoPlayer />
      <ScenicSpotGrid />
    </main>
  </div>
</template>

<script setup>
import TheHeader from '../components/TheHeader.vue'
import VideoPlayer from '../components/VideoPlayer.vue'
import ScenicSpotGrid from '../components/ScenicSpotGrid.vue'
</script> 