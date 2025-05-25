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

// 设置页面标题
document.title = '南华寺 所愿皆所得'
</script> 