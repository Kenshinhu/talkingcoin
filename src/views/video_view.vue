<script setup>
import { useRoute } from 'vue-router'
import { computed, onMounted } from 'vue'

const route = useRoute()
const videoId = computed(() => route.params.id)

// 构建视频URL
const videoUrl = computed(() => {
  if (videoId.value) {
    const url = `http://m.talkingcoin.cn/video-player.html?vid=${videoId.value}`
    console.log('构建的视频URL:', url)
    return url
  }
  return ''
})

onMounted(() => {
  if (videoUrl.value) {
    window.location.href = videoUrl.value
  }
})
</script>

<template>
  <div class="video-view">
    <p v-if="!videoUrl">加载中...</p>
  </div>
</template>

<style scoped>
.video-view {
  text-align: center;
  padding: 20px;
}
</style> 