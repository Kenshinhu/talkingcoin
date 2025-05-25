<template>
  <div class="video-only-page">
    <!-- 全屏视频容器 -->
    <div class="video-container">
      <video
        ref="videoRef"
        id="my-video"
        class="video-js vjs-default-skin vjs-big-play-centered"
        controls
        preload="auto"
        playsinline
        webkit-playsinline="true"
        x5-playsinline="true"
        x-webkit-airplay="allow"
        x5-video-player-type="h5"
        x5-video-player-fullscreen="true"
      >
        <p class="vjs-no-js">
          要查看此视频，请启用JavaScript，并考虑升级到支持HTML5视频的Web浏览器
        </p>
      </video>
      
      <!-- 透明点击层 - 覆盖在视频上方 -->
      <div class="video-click-overlay" @click="togglePlayPause"></div>
      
      <!-- 视频信息覆盖层 - 底部 -->
      <div class="video-info-overlay" @click.stop>
        <div class="video-info">
          <h1 v-if="title"  class="video-title">{{ title }}</h1>
          <p v-if="description"   class="video-description">{{ description }}</p>
        </div>
      </div>
      
      <!-- 播放/暂停状态指示器 -->
      <div v-if="showPlayPauseIndicator" class="play-pause-indicator" :class="{ 'paused': isPaused }">
        <div class="indicator-icon">
          <svg v-if="isPaused" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

export default {
  name: 'VideoOnlyPage',
  props: {
    mediaItems: {
      type: Array,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const videoRef = ref(null)
    const player = ref(null)
    const videoLoaded = ref(false)
    const videoError = ref(false)
    const isPaused = ref(true)
    const showPlayPauseIndicator = ref(false)
    const indicatorTimeout = ref(null)

    // 计算视频URL和信息
    const videoUrl = computed(() => {
      return props.mediaItems?.[0]?.file?.filePath || ''
    })

    const posterUrl = computed(() => {
      // 如果有封面图片，可以在这里设置
      return props.mediaItems?.[0]?.file?.posterUrl || ''
    })

    const title = computed(() => { 
      return props.name || ''
    })

    const description = computed(() => { 
      return props.description || ''
    })

    // 显示播放/暂停指示器
    const showIndicator = (paused) => {
      isPaused.value = paused
      showPlayPauseIndicator.value = true
      
      // 清除之前的定时器
      if (indicatorTimeout.value) {
        clearTimeout(indicatorTimeout.value)
      }
      
      // 1秒后隐藏指示器
      indicatorTimeout.value = setTimeout(() => {
        showPlayPauseIndicator.value = false
      }, 1000)
    }

    // 切换播放/暂停
    const togglePlayPause = (event) => {
      console.log('点击事件触发', event.target)
      
      if (!player.value) {
        console.log('播放器未初始化')
        return
      }

      try {
        if (player.value.paused()) {
          console.log('开始播放')
          player.value.play()
          showIndicator(false)
        } else {
          console.log('暂停播放')
          player.value.pause()
          showIndicator(true)
        }
      } catch (error) {
        console.error('播放/暂停操作失败:', error)
      }
    }

    // 初始化 video.js 播放器
    const initializePlayer = () => {
      if (!videoUrl.value) {
        console.error('未找到视频URL')
        videoError.value = true
        return
      }

      // 初始化Video.js
      player.value = videojs('my-video', {
        sources: [
          {
            src: videoUrl.value,
            type: 'video/mp4',
          },
        ],
        fluid: true,
        responsive: true,
        playbackRates: [0.5, 1, 1.5, 2],
        poster: posterUrl.value,
        controlBar: {
          pictureInPictureToggle: false,
        },
        // 移动端优化配置
        techOrder: ['html5'],
        html5: {
          vhs: {
            overrideNative: true
          },
          nativeVideoTracks: false,
          nativeAudioTracks: false,
          nativeTextTracks: false
        }
      })

      // 播放器就绪后的处理
      player.value.ready(() => {
        videoLoaded.value = true
        console.log('视频播放器初始化完成')
        
        // 设置视频尺寸
        const containerHeight = document.querySelector('.video-container')?.clientHeight
        if (containerHeight) {
          player.value.dimensions('auto', containerHeight)
        }

        // 添加自定义点击事件处理
        nextTick(() => {
          setupCustomClickHandler()
        })

        // 尝试自动播放
        const playPromise = player.value.play()
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log('自动播放被阻止:', error)
          })
        }
      })

      // 监听播放状态变化
      player.value.on('play', () => {
        isPaused.value = false
        console.log('视频开始播放')
      })

      player.value.on('pause', () => {
        isPaused.value = true
        console.log('视频暂停')
      })

      // 错误处理
      player.value.on('error', (error) => {
        videoError.value = true
        console.error('视频加载错误:', error)
      })

      // 监听加载完成事件
      player.value.on('loadedmetadata', () => {
        console.log('视频元数据加载完成')
      })
    }

    // 设置自定义点击事件处理
    const setupCustomClickHandler = () => {
      if (!player.value) return

      // 方法1：使用 video.js 的 on 方法监听点击事件
      player.value.on('click', (event) => {
        console.log('Video.js 点击事件触发')
        
        // 检查是否点击在控制栏上
        if (event.target && event.target.closest('.vjs-control-bar')) {
          console.log('点击在控制栏上，忽略')
          return
        }
        
        togglePlayPause(event)
      })

      // 方法2：直接在 video 元素上添加事件监听器
      const videoElement = player.value.el().querySelector('video')
      if (videoElement) {
        videoElement.addEventListener('click', (event) => {
          console.log('原生视频元素点击事件触发')
          
          // 阻止事件冒泡，避免重复触发
          event.stopPropagation()
          
          // 检查是否点击在控制栏上
          if (event.target.closest('.vjs-control-bar')) {
            console.log('点击在控制栏上，忽略')
            return
          }
          
          togglePlayPause(event)
        })
      }

      // 方法3：在播放器容器上添加事件监听器
      const playerEl = player.value.el()
      if (playerEl) {
        playerEl.addEventListener('click', (event) => {
          console.log('播放器容器点击事件触发')
          
          // 检查是否点击在控制栏上
          if (event.target.closest('.vjs-control-bar')) {
            console.log('点击在控制栏上，忽略')
            return
          }
          
          // 检查是否点击在大播放按钮上
          if (event.target.closest('.vjs-big-play-button')) {
            console.log('点击在大播放按钮上，忽略')
            return
          }
          
          togglePlayPause(event)
        })
      }
    }

    // 销毁播放器
    const destroyPlayer = () => {
      if (indicatorTimeout.value) {
        clearTimeout(indicatorTimeout.value)
      }
      if (player.value) {
        player.value.dispose()
        player.value = null
      }
    }

    onMounted(() => {
      // 延迟初始化，确保DOM已经渲染
      setTimeout(() => {
        initializePlayer()
      }, 100)
    })

    onBeforeUnmount(() => {
      destroyPlayer()
    })

    return {
      videoRef,
      player,
      videoLoaded,
      videoError,
      videoUrl,
      posterUrl,
      title,
      description,
      isPaused,
      showPlayPauseIndicator,
      togglePlayPause
    }
  }
}
</script>

<style scoped>
.video-only-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;
}

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Video.js 播放器样式 */
.video-js {
  width: 100% !important;
  height: 100% !important;
  max-height: 100vh;
}

/* 确保播放器填满容器 */
.video-js .vjs-tech {
  object-fit: contain;
}

/* 透明点击层 - 覆盖在视频上方但在控制栏下方 */
.video-click-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 60px; /* 为控制栏留出空间 */
  z-index: 5;
  cursor: pointer;
  background: transparent;
}

.video-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 60px 20px 20px;
  pointer-events: none;
  z-index: 10;
  margin-bottom: 80px;
}

.video-info {
  max-width: 800px;
  margin: 0 auto;
  text-align: left;
}

.video-title {
  color: white;
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: normal;
  max-width: 100%;
}

.video-description {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  line-height: 1.4;
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
}

/* 播放/暂停指示器 */
.play-pause-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  pointer-events: none;
  opacity: 0;
  animation: fadeInOut 1s ease-in-out;
}

.play-pause-indicator.paused {
  animation: fadeInOut 1s ease-in-out;
}

.indicator-icon {
  width: 80px;
  height: 80px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.indicator-icon svg {
  width: 40px;
  height: 40px;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  30% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  70% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .video-title {
    font-size: 1.5rem;
  }
  
  .video-description {
    font-size: 1rem;
  }
  
  .video-info-overlay {
    padding: 40px 15px 15px;
  }
  
  .indicator-icon {
    width: 60px;
    height: 60px;
  }
  
  .indicator-icon svg {
    width: 30px;
    height: 30px;
  }
  
  .video-click-overlay {
    bottom: 50px; /* 移动端控制栏可能更小 */
  }
}

/* 确保在iOS设备上正确显示 */
@media (max-width: 480px) {
  .video-title {
    font-size: 1.3rem;
  }
  
  .video-description {
    font-size: 0.9rem;
  }
}

/* Video.js 自定义样式 */
.video-js .vjs-big-play-button {
  font-size: 3em;
  line-height: 1.5em;
  height: 1.5em;
  width: 3em;
  border-radius: 50%;
  background-color: rgba(43, 51, 63, 0.7);
  border: 0.06666em solid #fff;
  margin-top: -0.75em;
  margin-left: -1.5em;
  z-index: 6; /* 确保大播放按钮在点击层上方 */
}

.video-js .vjs-big-play-button:hover {
  background-color: rgba(43, 51, 63, 0.9);
}

/* 控制栏样式 */
.video-js .vjs-control-bar {
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  z-index: 7; /* 确保控制栏在点击层上方 */
}

/* 确保在移动设备上控制栏可见 */
.video-js.vjs-user-inactive .vjs-control-bar {
  opacity: 1;
  visibility: visible;
}
</style> 