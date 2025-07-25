<template>
  <div :class="pageClass">
    <!-- 图片轮播容器 -->
    <div class="image-slider-container" :class="containerClass">
      <swiper
        :modules="swiperModules"
        :slides-per-view="1"
        :space-between="0"
        :pagination="{ 
          clickable: true, 
          dynamicBullets: true
        }"
        :keyboard="{ enabled: true }"
        :grab-cursor="true"
        :loop="true"
        :lazy="{ loadPrevNext: true }"
        :zoom="{ maxRatio: 3 }"
        
        :class="swiperClass"
        @swiper="onSwiper"
        @slideChange="onSlideChange"
      >
        <swiper-slide 
          v-for="(item, index) in imageItems" 
          :key="item.id" 
          class="flex items-center justify-center"
          @click="toggleFullscreen"
        >
          <div class="swiper-zoom-container w-full h-full flex items-center justify-center">
            <img 
              :src="item.file.filePath" 
              class="max-w-full max-h-full object-contain cursor-pointer"
              loading="lazy"
            />
          </div>
        </swiper-slide>
      </swiper>

      <!-- 信息覆盖层 - 底部 -->
      <div class="info-overlay" v-if="isFullscreenEnabled">
        <div class="info-content"> 
          <div class="image-counter">{{ activeIndex + 1 }} / {{ imageItems.length }}</div>
        </div>
      </div>
    </div>

    <!-- 描述内容在非全屏模式下显示 -->
    <div v-if="!isFullscreenEnabled" v-html="descriptionWithAudioControls" class="description-container">
      
    </div>
    
    <!-- 音频播放器固定容器 - 始终存在，不受全屏影响 -->
    <div v-if="audioOnlyContent" class="audio-player-container" :class="{ 'audio-fullscreen': isFullscreenEnabled }">
      <div v-html="audioOnlyContent"></div>
    </div>
 
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// 导入Swiper相关组件
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Keyboard, Zoom, Autoplay, A11y } from 'swiper/modules'

// 导入Swiper样式
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/zoom'

export default {
  name: 'ImageOnlyPage',
  components: {
    Swiper,
    SwiperSlide
  },
  props: {
    mediaItems: {
      type: Array,
      required: true
    },
    name: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    contentData: {
      type: Object,
      default: () => ({})
    },
    pageData: {
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
    const router = useRouter()
    const route = useRoute()
    const swiperInstance = ref(null)
    const activeIndex = ref(0)
    const isUserFullscreen = ref(false) // 添加用户控制的全屏状态

    // Swiper模块
    const swiperModules = [Pagination, Keyboard, Zoom, Autoplay, A11y]

    // 过滤出图片类型的媒体项目
    const imageItems = computed(() => {
      return props.mediaItems
        .filter(item => item.mediaType === 'image')
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    })

    // 当前显示图片的标题
    const currentImageTitle = computed(() => {
      const currentItem = imageItems.value[activeIndex.value]
      return currentItem?.title || props.name || ''
    })

    // 当前显示图片的描述
    const currentImageDescription = computed(() => {
      const currentItem = imageItems.value[activeIndex.value]
      return currentItem?.description || props.description || ''
    })

    // 提取音频内容 - 只包含audio标签
    const audioOnlyContent = computed(() => {
      const description = props.description || ''
      // 使用正则表达式提取所有audio标签
      const audioMatches = description.match(/<audio[^>]*>.*?<\/audio>/gi) || []
      return audioMatches.join('')
    })

    // 为描述区域创建音频控制版本（用占位符替换实际音频）
    const descriptionWithAudioControls = computed(() => {
      const description = props.description || ''
      let audioIndex = 0
      
      // 替换audio标签为完整的播放器UI
      return description.replace(/<audio[^>]*>.*?<\/audio>/gi, (match) => {
        const currentIndex = audioIndex++
        // 提取audio标签的属性（如果有的话）
        const srcMatch = match.match(/src=["']([^"']*)["']/i)
        const titleMatch = match.match(/title=["']([^"']*)["']/i)
        
        const audioSrc = srcMatch ? srcMatch[1] : ''
        const audioTitle = titleMatch ? titleMatch[1] : `音频 ${currentIndex + 1}`
        
        return `
          <div class="audio-control-placeholder" data-audio-index="${currentIndex}">
            <div class="audio-player-ui">
 
              <div class="audio-controls">
                <button class="audio-play-btn" data-audio-index="${currentIndex}">
                  <span class="play-icon">▶</span>
                </button>
                <div class="audio-progress-container">
                  <span class="time-elapsed" data-audio-index="${currentIndex}">0:00</span>
                  <input type="range" class="duration-bar" data-audio-index="${currentIndex}" value="0" min="0" max="100" step="1">
                  <span class="total-time" data-audio-index="${currentIndex}">0:00</span>
                </div>
               
              </div>
            </div>
          </div>
        `
      })
    })

    // 音频控制方法
    const setupAudioControls = () => {
      setTimeout(() => {
        const fixedAudioElements = document.querySelectorAll('.audio-player-container audio')
        
        // 工具函数：格式化时间
        const getMinsSeconds = (seconds) => {
          const mins = Math.floor(seconds / 60)
          const secs = Math.floor(seconds - mins * 60)
          return mins + ':' + (secs < 10 ? '0' + secs : secs)
        }

        fixedAudioElements.forEach((audio, audioIndex) => {
          // 获取对应的UI控件
          const playButton = document.querySelector(`[data-audio-index="${audioIndex}"].audio-play-btn`)
          const playIcon = playButton?.querySelector('.play-icon')
          const timeElapsed = document.querySelector(`[data-audio-index="${audioIndex}"].time-elapsed`)
          const totalTime = document.querySelector(`[data-audio-index="${audioIndex}"].total-time`)
          const durationBar = document.querySelector(`[data-audio-index="${audioIndex}"].duration-bar`)
          const muteButton = document.querySelector(`[data-audio-index="${audioIndex}"].mute-btn`)
          const volumeIcon = muteButton?.querySelector('.volume-icon')
          const volumeBar = document.querySelector(`[data-audio-index="${audioIndex}"].volume-bar`)
          
          let userVolume = audio.volume

          // 设置初始播放状态 - 根据音频的实际播放状态来设置图标
          if (playIcon) {
            playIcon.textContent = audio.paused ? '▶' : '⏸'
          }

          // 播放/暂停按钮事件
          if (playButton) {
            // 先移除已有的事件监听器，避免重复绑定
            const existingHandler = playButton._clickHandler
            if (existingHandler) {
              playButton.removeEventListener('click', existingHandler)
            }
            
            const clickHandler = (e) => {
              e.preventDefault()
              if (audio.paused) {
                // 暂停其他音频
                fixedAudioElements.forEach((otherAudio, index) => {
                  if (index !== audioIndex && !otherAudio.paused) {
                    otherAudio.pause()
                  }
                })
                audio.play().catch(e => console.log('Audio play failed:', e))
              } else {
                audio.pause()
              }
            }
            
            playButton.addEventListener('click', clickHandler)
            playButton._clickHandler = clickHandler // 保存引用用于移除
          }

          // 移除已有的事件监听器，避免重复绑定
          if (audio._playHandler) {
            audio.removeEventListener('play', audio._playHandler)
          }
          if (audio._pauseHandler) {
            audio.removeEventListener('pause', audio._pauseHandler)
          }
          if (audio._endedHandler) {
            audio.removeEventListener('ended', audio._endedHandler)
          }
          if (audio._loadedmetadataHandler) {
            audio.removeEventListener('loadedmetadata', audio._loadedmetadataHandler)
          }

          // 音频播放状态变化
          const playHandler = () => {
            if (playIcon) playIcon.textContent = '⏸'
          }
          audio.addEventListener('play', playHandler)
          audio._playHandler = playHandler

          const pauseHandler = () => {
            if (playIcon) playIcon.textContent = '▶'
          }
          audio.addEventListener('pause', pauseHandler)
          audio._pauseHandler = pauseHandler

          const endedHandler = () => {
            if (playIcon) playIcon.textContent = '▶'
            if (durationBar) durationBar.value = 0
          }
          audio.addEventListener('ended', endedHandler)
          audio._endedHandler = endedHandler

          // 音频元数据加载完成
          const loadedmetadataHandler = () => {
            if (totalTime) totalTime.textContent = getMinsSeconds(audio.duration)
            userVolume = audio.volume
          }
          audio.addEventListener('loadedmetadata', loadedmetadataHandler)
          audio._loadedmetadataHandler = loadedmetadataHandler

          // 移除时间更新和音量变化的已有监听器
          if (audio._timeupdateHandler) {
            audio.removeEventListener('timeupdate', audio._timeupdateHandler)
          }
          if (audio._volumechangeHandler) {
            audio.removeEventListener('volumechange', audio._volumechangeHandler)
          }

          // 时间更新
          const timeupdateHandler = () => {
            if (timeElapsed) timeElapsed.textContent = getMinsSeconds(audio.currentTime)
            if (durationBar && audio.duration) {
              durationBar.value = Math.floor((audio.currentTime / audio.duration) * 100)
            }
          }
          audio.addEventListener('timeupdate', timeupdateHandler)
          audio._timeupdateHandler = timeupdateHandler

          // 进度条控制
          if (durationBar) {
            // 移除已有的事件监听器
            const existingInputHandler = durationBar._inputHandler
            if (existingInputHandler) {
              durationBar.removeEventListener('input', existingInputHandler)
            }
            
            const inputHandler = () => {
              if (audio.duration) {
                audio.currentTime = (durationBar.value * audio.duration) / 100
              }
            }
            durationBar.addEventListener('input', inputHandler)
            durationBar._inputHandler = inputHandler
          }

          // 静音按钮
          if (muteButton) {
            // 移除已有的事件监听器
            const existingMuteHandler = muteButton._clickHandler
            if (existingMuteHandler) {
              muteButton.removeEventListener('click', existingMuteHandler)
            }
            
            const muteHandler = (e) => {
              e.preventDefault()
              if (audio.volume > 0.0) {
                userVolume = audio.volume
                audio.volume = 0.0
              } else {
                audio.volume = userVolume
              }
            }
            muteButton.addEventListener('click', muteHandler)
            muteButton._clickHandler = muteHandler
          }

          // 音量变化
          const volumechangeHandler = () => {
            if (volumeIcon) {
              if (audio.volume === 0.0) {
                volumeIcon.textContent = '🔇'
              } else if (audio.volume < 0.5) {
                volumeIcon.textContent = '🔉'
              } else {
                volumeIcon.textContent = '🔊'
              }
            }
            if (volumeBar) {
              volumeBar.value = audio.volume * 100
            }
          }
          audio.addEventListener('volumechange', volumechangeHandler)
          audio._volumechangeHandler = volumechangeHandler

          // 音量条控制
          if (volumeBar) {
            // 移除已有的事件监听器
            const existingVolumeInputHandler = volumeBar._inputHandler
            if (existingVolumeInputHandler) {
              volumeBar.removeEventListener('input', existingVolumeInputHandler)
            }
            
            const volumeInputHandler = () => {
              audio.volume = volumeBar.value / 100
            }
            volumeBar.addEventListener('input', volumeInputHandler)
            volumeBar._inputHandler = volumeInputHandler
          }
        })
      }, 100)
    }

    // 计算底部样式
    const footerStyle = computed(() => {
      const settings = props.footerSettings
      return {
        backgroundColor: settings.backgroundColor || '#f8f9fa'
      }
    })

    // Swiper实例初始化
    const onSwiper = (swiper) => {
      swiperInstance.value = swiper
      console.log('图片轮播初始化完成')
    }

    // 当Swiper切换幻灯片时更新状态
    const onSlideChange = (swiper) => {
      activeIndex.value = swiper.realIndex // 使用 realIndex 处理循环模式
      console.log('切换到图片:', activeIndex.value + 1)
    }

    // 监听键盘事件
    const handleKeyDown = (e) => {
      if (!swiperInstance.value) return
      
      switch (e.key) {
        case 'ArrowLeft':
          swiperInstance.value.slidePrev()
          break
        case 'ArrowRight':
          swiperInstance.value.slideNext()
          break
        case ' ': // 空格键暂停/继续自动播放
          e.preventDefault()
          if (swiperInstance.value.autoplay.running) {
            swiperInstance.value.autoplay.stop()
          } else {
            swiperInstance.value.autoplay.start()
          }
          break
        case 'Escape': // ESC键退出全屏
          if (isUserFullscreen.value) {
            // 使用toggleFullscreen来保持URL同步
            toggleFullscreen()
          }
          break
      }
    }

    // 切换全屏模式 - 简化版本，不影响音频播放
    const toggleFullscreen = () => {
      if (!isUserFullscreen.value) {
        // 进入全屏，使用 pushState 添加新的历史记录
        isUserFullscreen.value = true
        const currentImageIndex = activeIndex.value
        const imageId = imageItems.value[currentImageIndex]?.id || currentImageIndex
        const newUrl = `${window.location.pathname}${window.location.search}#fullscreen-${imageId}`
        window.history.pushState({ fullscreen: true, imageId }, '', newUrl)
      } else {
        // 退出全屏，使用 back 返回上一个历史记录
        isUserFullscreen.value = false
        window.history.back()
      }
    }

    // 处理浏览器历史记录变化
    const handlePopState = (event) => {
      const hash = window.location.hash 
      if (hash.startsWith('#fullscreen-')) {
        // 如果URL包含全屏锚点但当前不是全屏状态，则进入全屏
        if (!isUserFullscreen.value) {
          isUserFullscreen.value = true
        }
        
        // 解析图片ID并跳转到对应图片
        const imageId = hash.replace('#fullscreen-', '')
        const imageIndex = imageItems.value.findIndex(item => 
          item.id.toString() === imageId || 
          imageItems.value.indexOf(item).toString() === imageId
        )
        if (imageIndex !== -1 && swiperInstance.value) {
          swiperInstance.value.slideTo(imageIndex)
        }
      } else {
        // 如果URL没有全屏锚点，则退出全屏
        if (isUserFullscreen.value) {
          isUserFullscreen.value = false
        }
      }
    }

    // 在组件挂载和更新时设置音频控制
    onMounted(() => {
      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('popstate', handlePopState)
      
      // 检查初始URL是否包含全屏锚点
      const currentHash = window.location.hash
      if (currentHash.startsWith('#fullscreen-')) {
        isUserFullscreen.value = true
        const imageId = currentHash.replace('#fullscreen-', '')
        const imageIndex = imageItems.value.findIndex(item => 
          item.id.toString() === imageId || 
          imageItems.value.indexOf(item).toString() === imageId
        )
        if (imageIndex !== -1) {
          activeIndex.value = imageIndex
        }
      }
      
      // 设置音频控制
      setupAudioControls()
      
      console.log('图片页面加载完成，共', imageItems.value.length, '张图片')
    })

    // 计算是否启用全屏模式
    const isFullscreenEnabled = computed(() => {
      return props.contentData?.fullscreenEnabled === true || isUserFullscreen.value
    })

    // 监听全屏状态变化，重新设置音频控制
    watch(isFullscreenEnabled, () => {
      setupAudioControls()
    })

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('popstate', handlePopState)
      if (swiperInstance.value) {
        swiperInstance.value.destroy()
      }
    })

    // 计算容器的class
    const containerClass = computed(() => {
      return isFullscreenEnabled.value ? 'fullscreen-container' : 'adaptive-container'
    })

    // 计算Swiper的class
    const swiperClass = computed(() => {
      const baseClass = 'image-swiper'
      if (isFullscreenEnabled.value) {
        return `${baseClass} w-full h-full`
      } else {
        return `${baseClass} adaptive-swiper`
      }
    })

    const pageClass = computed(() => {
      return isFullscreenEnabled.value ? 'image-only-page' : 'image-only-page-adaptive'
    })

    return {
      router,
      route,
      swiperInstance,
      activeIndex,
      isUserFullscreen,
      swiperModules,
      imageItems,
      currentImageTitle,
      currentImageDescription,
      audioOnlyContent,
      descriptionWithAudioControls,
      setupAudioControls,
      onSwiper,
      onSlideChange,
      toggleFullscreen,
      handlePopState,
      footerStyle,
      isFullscreenEnabled,
      containerClass,
      swiperClass,
      pageClass
    }
  }
}
</script>

<style scoped>
/* 全屏模式样式 */
.image-only-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;
}

.image-only-page-adaptive {
  position: relative; /* 改为relative定位 */
  width: 100%;
  min-height: 100vh; /* 改为最小高度 */
  overflow: auto; /* 允许滚动 */
  display: flex;
  flex-direction: column;
}

.fullscreen-container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 自适应模式样式 */
.adaptive-container {
  position: relative;
  width: 100%; 
  height: 68vh;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.description-container {
  @apply m-2 px-2 pb-10 leading-relaxed; 
   
}

/* 音频播放器固定容器 */
.audio-player-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: none;
  z-index: 1000;
  max-width: 300px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

/* 全屏模式下的音频容器样式 */
.audio-player-container.audio-fullscreen {
  background: rgba(0, 0, 0, 0.8);
  color: white;
}

/* 音频播放器样式 */
.audio-player-container audio {
  width: 100%;
  max-width: 280px;
  margin: 0;
}

/* 移动端音频播放器样式调整 */
@media (max-width: 768px) {
  .audio-player-container {
    bottom: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .audio-player-container audio {
    max-width: 100%;
  }
}

/* 音频播放器UI样式 - 使用深度选择器让样式可以应用到动态生成的内容 */
:deep(.audio-control-placeholder) {
  margin: 15px 0;
  padding: 0;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

:deep(.audio-control-placeholder:hover) {
  border-color: #007bff;
  box-shadow: 0 4px 16px rgba(0, 123, 255, 0.15);
  transform: translateY(-1px);
}

:deep(.audio-player-ui) {
  width: 100%;
}

:deep(.audio-header) {
  padding: 12px 16px 8px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e0e0e0;
}

:deep(.audio-title) {
  font-weight: 600;
  color: #333;
  font-size: 0.95em;
  margin: 0;
}

:deep(.audio-controls) {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  background: #ffffff;
}

:deep(.audio-play-btn) {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

:deep(.audio-play-btn:hover) {
  background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
  transform: scale(1.05);
}

:deep(.audio-play-btn:active) {
  transform: scale(0.95);
}

:deep(.play-icon) {
  font-size: 16px;
  font-weight: bold;
  margin-left: 2px; /* 微调播放图标位置 */
}

:deep(.audio-progress-container) {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
  min-width: 0;
}

:deep(.time-elapsed),
:deep(.total-time) {
  font-size: 0.8em;
  color: #666;
  font-family: 'Courier New', monospace;
  font-weight: 500;
  min-width: 35px;
  text-align: center;
}

:deep(.duration-bar) {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

:deep(.duration-bar::-webkit-slider-thumb) {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

:deep(.duration-bar::-webkit-slider-thumb:hover) {
  background: #0056b3;
  transform: scale(1.1);
}

:deep(.duration-bar::-moz-range-thumb) {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

:deep(.mute-btn) {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: #f8f9fa;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

:deep(.mute-btn:hover) {
  background: #e9ecef;
  transform: scale(1.05);
}

:deep(.volume-icon) {
  font-size: 14px;
}

:deep(.volume-bar) {
  width: 60px;
  height: 4px;
  border-radius: 2px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

:deep(.volume-bar::-webkit-slider-thumb) {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: 1px solid #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

:deep(.volume-bar::-webkit-slider-thumb:hover) {
  background: #0056b3;
  transform: scale(1.1);
}

:deep(.volume-bar::-moz-range-thumb) {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: 1px solid #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* 移动端音频播放器样式 */
@media (max-width: 768px) {
  :deep(.audio-control-placeholder) {
    margin: 10px 0;
  }
  
  :deep(.audio-header) {
    padding: 10px 12px 6px;
  }
  
  :deep(.audio-title) {
    font-size: 0.9em;
  }
  
  :deep(.audio-controls) {
    padding: 10px 12px;
    gap: 8px;
  }
  
  :deep(.audio-play-btn) {
    width: 36px;
    height: 36px;
  }
  
  :deep(.play-icon) {
    font-size: 14px;
  }
  
  :deep(.time-elapsed),
  :deep(.total-time) {
    font-size: 0.75em;
    min-width: 32px;
  }
  
  :deep(.volume-bar) {
    width: 50px;
  }
  
  :deep(.mute-btn) {
    width: 28px;
    height: 28px;
  }
  
  :deep(.volume-icon) {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  :deep(.audio-controls) {
    gap: 6px;
  }
  
  :deep(.volume-bar) {
    width: 40px;
  }
  
  :deep(.time-elapsed),
  :deep(.total-time) {
    min-width: 28px;
  }
}

.adaptive-swiper {
  width: 100%;
  height: 100%;
  max-height: 80vh; /* 增加最大高度 */
}

/* Swiper 自定义样式 */
.image-swiper {
  --swiper-theme-color: #ffffff;
  --swiper-navigation-size: 30px;
  --swiper-pagination-bullet-inactive-color: rgba(255, 255, 255, 0.5);
  --swiper-pagination-bullet-inactive-opacity: 0.7;
}

:deep(.swiper-pagination) {
  bottom: 120px !important;
  z-index: 20;
}

:deep(.swiper-zoom-container) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.swiper-wrapper) {
  align-items: center !important;
}

:deep(.swiper-slide) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* 图片样式优化 */
img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

/* 确保图片在zoom容器中正确居中 */
:deep(.swiper-zoom-container img) {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

/* 信息覆盖层样式 */
.info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 60px 20px 20px;
  z-index: 99999;
  pointer-events: none;
}

.info-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: left;
}

.image-title {
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
}

.image-description {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin: 0 0 15px 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  line-height: 1.4;
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.image-counter {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.fullscreen-hint {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  margin-top: 5px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  animation: fadeInOut 3s ease-in-out infinite;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* 移动端适配 */
@media (max-width: 768px) { 
   
  
  .info-overlay {
    padding: 40px 15px 15px;
  }
  
  .image-title {
    font-size: 1.5rem;
  }
  
  .image-description {
    font-size: 1rem;
    -webkit-line-clamp: 2;
  }
  
  :deep(.swiper-pagination) {
    bottom: 100px !important;
  }
}

@media (max-width: 480px) { 
   
  
  .image-title {
    font-size: 1.3rem;
  }
  
  .image-description {
    font-size: 0.9rem;
  }
  
  :deep(.swiper-pagination) {
    bottom: 80px !important;
  }
}

/* 淡入淡出过渡效果 */
.swiper-slide {
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  height: 100% !important;
}

.swiper-slide-active {
  opacity: 1;
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