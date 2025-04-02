<template>
  <div class="relative w-full">
    <!-- 视频容器 -->
    <div class="w-full relative mt-16">
      <div class="aspect-video">
        <video
          class="w-full h-full object-contain"
          loop
          playsinline
          webkit-playsinline="true"
          x5-playsinline="true"
          x-webkit-airplay="allow"
          x5-video-player-type="h5"
          x5-video-player-fullscreen="true"
          :poster="posterImage"
          ref="videoRef"
          id="videoPlayer"
        >
          <source src="../assets/南华寺.mp4" type="video/mp4">
        </video>
      </div>
      <!-- 视频遮罩层 -->
      <div class="absolute inset-0 bg-black/20"></div>
      
      <!-- 中央大播放按钮 -->
      <div v-if="!isPlaying" class="z-[1000] absolute inset-0 flex items-center justify-center">
        <button @click="togglePlay" class="p-4 hover:bg-white/20 rounded-full transition transform hover:scale-110 bg-black/30">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 md:h-16 md:w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          </svg>
        </button>
      </div>

      <!-- 视频标题 -->
      <div class="absolute inset-0 flex items-center justify-center text-white">
        <div class="text-center">
          <!-- <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-shadow-lg">南华寺</h2> -->
          <!-- <p class="text-lg md:text-xl lg:text-2xl text-shadow">所愿皆所得</p> -->
        </div>
      </div>
      <!-- 控制按钮 -->
      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
        <div class="container mx-auto flex items-center justify-between text-white">
          <button v-if="isPlaying" @click="togglePlay" class="p-2 hover:bg-white/20 rounded-full transition transform hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button @click="toggleFullscreen" class="p-2 hover:bg-white/20 rounded-full transition transform hover:scale-110">
            <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import posterImage from '../assets/output_image.jpg'

const videoRef = ref(null)
const isPlaying = ref(false)
const isFullscreen = ref(false)
const isIOS = ref(false)

const togglePlay = () => {
  if (videoRef.value) {
    if (isPlaying.value) {
      videoRef.value.pause()
    } else {
      videoRef.value.play()
    }
    isPlaying.value = !isPlaying.value
  }
}

const toggleFullscreen = () => {
  // 检测是否是iOS设备
  if (isIOS.value) {
    // iOS设备使用特殊的全屏处理方式
    handleIOSFullscreen()
    return
  }

  // 桌面浏览器标准全屏API
  if (!document.fullscreenElement) {
    if (videoRef.value.requestFullscreen) {
      videoRef.value.requestFullscreen()
      isFullscreen.value = true
    } else if (videoRef.value.webkitRequestFullscreen) { /* Safari */
      videoRef.value.webkitRequestFullscreen()
      isFullscreen.value = true
    } else if (videoRef.value.msRequestFullscreen) { /* IE11 */
      videoRef.value.msRequestFullscreen()
      isFullscreen.value = true
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      isFullscreen.value = false
    } else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen()
      isFullscreen.value = false
    } else if (document.msExitFullscreen) { /* IE11 */
      document.msExitFullscreen()
      isFullscreen.value = false
    }
  }
}

const handleIOSFullscreen = () => {
  const video = videoRef.value
  
  if (!video) return
  
  if (video.webkitEnterFullscreen) {
    // 尝试使用iOS特有的webkitEnterFullscreen方法
    video.webkitEnterFullscreen()
    isFullscreen.value = true
  } else if (video.webkitSupportsFullscreen && video.webkitEnterFullScreen) {
    // 备用方法
    video.webkitEnterFullScreen()
    isFullscreen.value = true
  } else {
    // 如果以上方法都不支持，尝试使用video元素的play触发全屏
    video.play()
    
    // 通知用户全屏受限
    alert('请点击视频进入全屏模式或使用系统全屏按钮')
  }
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!(
    document.fullscreenElement || 
    document.webkitFullscreenElement || 
    document.mozFullScreenElement || 
    document.msFullscreenElement
  )
}

const detectIOS = () => {
  const userAgent = window.navigator.userAgent.toLowerCase()
  isIOS.value = /iphone|ipad|ipod/.test(userAgent) || 
    (userAgent.includes('mac') && 'ontouchend' in document)
}

const handleKeyDown = (e) => {
  if (e.key === 'Escape' && isFullscreen.value) {
    toggleFullscreen()
  }
}

onMounted(() => {
  if (videoRef.value) {
    videoRef.value.play()
  }
  
  // 添加触摸事件监听以提高移动端播放体验
  document.addEventListener('touchstart', () => {
    if (videoRef.value) {
      videoRef.value.play()
    }
  }, { once: true })
  
  // 检测iOS设备
  detectIOS()
  
  // 添加全屏变化事件监听
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('mozfullscreenchange', handleFullscreenChange)
  document.addEventListener('MSFullscreenChange', handleFullscreenChange)
  
  // 监听iOS设备的全屏变化
  if (videoRef.value) {
    videoRef.value.addEventListener('webkitbeginfullscreen', () => {
      isFullscreen.value = true
    })
    videoRef.value.addEventListener('webkitendfullscreen', () => {
      isFullscreen.value = false
    })
  }
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
  document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
  
  if (videoRef.value) {
    videoRef.value.removeEventListener('webkitbeginfullscreen', () => {})
    videoRef.value.removeEventListener('webkitendfullscreen', () => {})
  }
})
</script>

<style scoped>
.text-shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.text-shadow-lg {
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.7);
}

/* 针对iOS设备的全屏样式 */
:deep(video::-webkit-media-controls) {
  display: none !important;
}

/* 添加视频容器样式 */
.aspect-video {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 的宽高比 (9/16 = 0.5625) */
  height: 0;
  overflow: hidden;
}

.aspect-video video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

@media (max-width: 767px) {
  .aspect-video {
    /* 可以根据需要调整移动端的宽高比 */
    padding-bottom: 56.25%;
  }
}
</style> 