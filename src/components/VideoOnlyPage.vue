<template>
  <div class="video-only-page">
    <!-- 全屏视频容器 -->
    <div class="video-container">
      <video
        ref="videoRef"
        id="my-video"
        class="video-js vjs-default-skin vjs-big-play-centered"
        playsinline
        webkit-playsinline="true"
        x5-playsinline="true"
        x-webkit-airplay="allow"
        x5-video-player-type="h5"
        x5-video-player-fullscreen="true"
        :poster="posterUrl"
        preload="none"
      >
        <p class="vjs-no-js">
          要查看此视频，请启用JavaScript，并考虑升级到支持HTML5视频的Web浏览器
        </p>
      </video>
      
      <!-- 透明点击层 - 覆盖在视频上方 -->
      <div class="video-click-overlay" :class="{ 'hidden': !isPaused }" @click="togglePlayPause"></div>
      
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

    <!-- 页面底部 -->
    <div v-if="footerSettings && Object.keys(footerSettings).length > 0" 
         class="page-footer"
         :style="footerStyle">
      <div class="footer-content">
        <!-- 动态链接渲染 -->
        <div v-if="footerSettings.links && footerSettings.links.length > 0" class="footer-links">
          <template v-for="link in footerSettings.links" :key="link.text">
            <!-- Web链接 -->
            <a v-if="link.type === 'web'" 
               :href="link.url" 
               target="_blank" 
               rel="noopener noreferrer"
               class="footer-link">
              {{ link.text }}
            </a>
            <!-- 电话链接 -->
            <a v-else-if="link.type === 'phone'" 
               :href="`tel:${link.url}`" 
               class="footer-link">
              {{ link.text }}
            </a>
            <!-- 邮箱链接 -->
            <a v-else-if="link.type === 'email'" 
               :href="`mailto:${link.url}`" 
               class="footer-link">
              {{ link.text }}
            </a>
            <!-- 其他类型链接 -->
            <a v-else 
               :href="link.url" 
               class="footer-link">
              {{ link.text }}
            </a>
          </template>
        </div>
        
        <p v-if="footerSettings.copyrightText" class="copyright">
          {{ footerSettings.copyrightText }}
        </p> 
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
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
    },
    contentData: {
      type: Object,
      default: () => ({})
    },
    headerSettings: {
      type: Object,
      default: () => ({})
    },
    footerSettings: {
      type: Object,
      default: () => ({})
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
      // props.mediaItems
      let posterUrl = props.mediaItems?.[0]?.file?.posterUrl || ''
      props.mediaItems.forEach(item => {
        if (item.isCover) {
          posterUrl = item.file.filePath
        }
      })

      console.log('计算得到的posterUrl:', posterUrl)
      return posterUrl
    }) 

    const title = computed(() => { 
      return props.name || ''
    })

    const description = computed(() => { 
      return props.description || ''
    })

    // 计算底部样式
    const footerStyle = computed(() => {
      const settings = props.footerSettings
      return {
        backgroundColor: settings.backgroundColor || '#f8f9fa'
      }
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

      console.log('videoUrl.value', videoUrl.value)

      // 验证是否为有效的视频URL
      const isValidVideoUrl = (url) => {
        // 1. 检查URL格式是否正确
        try {
          new URL(url)
        } catch (error) {
          console.error('无效的URL格式:', url)
          return false
        }

        // 2. 检查文件扩展名是否为视频格式
        const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv', '3gp', 'm4v']
        const urlWithoutParams = url.split('?')[0] // 移除查询参数
        const ext = urlWithoutParams.split('.').pop()?.toLowerCase()
        
        if (!ext || !videoExtensions.includes(ext)) {
          console.error('文件扩展名不是视频格式:', ext)
          return false
        }

        // 3. 检查mimeType是否为视频类型
        const mimeType = props.mediaItems?.[0]?.file?.mimeType
        if (mimeType && !mimeType.startsWith('video/')) {
          console.error('mimeType不是视频类型:', mimeType)
          return false
        }

        // 4. 检查mediaType是否为video
        const mediaType = props.mediaItems?.[0]?.mediaType
        if (mediaType && mediaType !== 'video') {
          console.error('mediaType不是video:', mediaType)
          return false
        }

        return true
      }

      // 验证视频URL
      if (!isValidVideoUrl(videoUrl.value)) {
        console.error('无效的视频URL:', videoUrl.value)
        videoError.value = true
        return
      }

      // 动态检测文件类型而不是硬编码
      const getVideoType = (url) => {
        const ext = url.split('?')[0].split('.').pop()?.toLowerCase() // 移除查询参数后获取扩展名
        const mimeType = props.mediaItems?.[0]?.file?.mimeType
        
        if (mimeType && mimeType.startsWith('video/')) {
          return mimeType
        }
        
        switch (ext) {
          case 'mp4': return 'video/mp4'
          case 'webm': return 'video/webm'
          case 'ogg': return 'video/ogg'
          case 'mov': return 'video/quicktime'
          case 'avi': return 'video/x-msvideo'
          case 'mkv': return 'video/x-matroska'
          case 'flv': return 'video/x-flv'
          case 'wmv': return 'video/x-ms-wmv'
          case '3gp': return 'video/3gpp'
          case 'm4v': return 'video/mp4'
          default: return 'video/mp4'
        }
      }

      // 如果需要进一步验证文件是否可访问，可以添加这个函数
      const checkVideoAccessibility = async (url) => {
        try {
          const response = await fetch(url, { 
            method: 'HEAD',
            timeout: 5000 // 5秒超时
          })
          
          if (!response.ok) {
            console.error(`视频文件不可访问: HTTP ${response.status}`)
            return false
          }

          const contentType = response.headers.get('content-type')
          if (contentType && !contentType.startsWith('video/')) {
            console.error('服务器返回的Content-Type不是视频类型:', contentType)
            return false
          }

          console.log('视频文件验证通过:', {
            url,
            contentType,
            contentLength: response.headers.get('content-length')
          })
          return true
        } catch (error) {
          console.error('检查视频可访问性失败:', error)
          return false
        }
      }

      // 可选：异步检查文件是否可访问（注释掉以避免影响性能）
      // checkVideoAccessibility(videoUrl.value).then(isAccessible => {
      //   if (!isAccessible) {
      //     videoError.value = true
      //     return
      //   }
      // })

      player.value = videojs('my-video', {
        sources: [
          {
            src: videoUrl.value,
            type: getVideoType(videoUrl.value),
          },
        ],
        fluid: true,
        responsive: true,
        playbackRates: [0.5, 1, 1.5, 2],
        poster: posterUrl.value,
        // 通过Video.js配置替代HTML属性
        controls: props.contentData?.controls || false,
        // iOS修复：设置preload为metadata以确保poster显示
        preload: 'metadata',
        loop: props.contentData?.loop || false,
        autoplay: props.contentData?.autoPlayInMiniProgram || false,
        muted: props.contentData?.muted || false,
        controlBar: {
          pictureInPictureToggle: false,
        },
        // 移除过于严格的配置
        techOrder: ['html5'],
        html5: {
          // 允许使用原生功能作为备选方案
          nativeVideoTracks: true,
          nativeAudioTracks: true,
          nativeTextTracks: true
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

        // 根据 contentData.loop 设置循环播放
        const shouldLoop = props.contentData?.loop || false
        const videoElement = player.value.el().querySelector('video')
        if (videoElement) {
          videoElement.loop = shouldLoop
          console.log('设置视频循环播放:', shouldLoop)
          
          // iOS修复：手动设置poster属性到HTML video元素
          if (posterUrl.value) {
            videoElement.setAttribute('poster', posterUrl.value)
            console.log('iOS修复：手动设置poster:', posterUrl.value)
            
            // 额外的iOS修复：使用Video.js的poster方法
            setTimeout(() => {
              player.value.poster(posterUrl.value)
              console.log('iOS修复：使用Video.js设置poster')
            }, 100)
          }
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

    // 监听poster URL的变化
    watch(posterUrl, (newPosterUrl) => {
      if (player.value && newPosterUrl) {
        console.log('Poster URL变化，重新设置:', newPosterUrl)
        
        // 设置Video.js poster
        player.value.poster(newPosterUrl)
        
        // 设置HTML video元素poster (iOS修复)
        const videoElement = player.value.el().querySelector('video')
        if (videoElement) {
          videoElement.setAttribute('poster', newPosterUrl)
        }
      }
    })

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
      togglePlayPause,
      footerStyle
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
  transition: opacity 0.3s ease;
}

.video-click-overlay.hidden {
  opacity: 0;
  pointer-events: none;
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

/* 页面底部样式 */
.page-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 20px;
  border-top: 1px solid #eee;
  z-index: 30;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.footer-links {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.footer-link {
  color: #666;
  text-decoration: underline;
  font-size: 0.9rem;
  padding: 0px 4px;
  transition: all 0.3s ease;
}

.footer-link:hover {
  color: #333;
  background-color: #f5f5f5;
  border-color: #ccc;
  text-decoration: none;
}

.copyright {
  margin: 0;
  font-size: 0.9rem;
  color: #888;
}

/* Footer responsive styles */
@media (max-width: 768px) {
  .footer-links {
    gap: 2px;
    margin-bottom: 5px;
  }
  
  .footer-link {
    font-size: 0.85rem;
    padding: 6px 10px;
  }
}
</style> 