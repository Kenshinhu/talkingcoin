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
        :autoplay="{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }"
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
              :alt="item.title || `图片 ${index + 1}`"
              class="max-w-full max-h-full object-contain cursor-pointer"
              loading="lazy"
            />
          </div>
        </swiper-slide>
      </swiper>

      <!-- 信息覆盖层 - 底部 -->
      <div class="info-overlay" v-if="isFullscreenEnabled">
        <div class="info-content">
          <h1 v-if="currentImageTitle" class="image-title" v-html="currentImageTitle"></h1>
          <p v-if="currentImageDescription" class="image-description" v-html="currentImageDescription"></p>
          <div class="image-counter">{{ activeIndex + 1 }} / {{ imageItems.length }}</div>
        </div>
      </div>
    </div>

    <div v-if="!isFullscreenEnabled" v-html="description" class="description-container">
      
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

    // 切换全屏模式
    const toggleFullscreen = () => {
      if (!isUserFullscreen.value) {
        // 进入全屏，添加锚点
        isUserFullscreen.value = true
        const currentImageIndex = activeIndex.value
        const imageId = imageItems.value[currentImageIndex]?.id || currentImageIndex
        router.push({ 
          path: route.path, 
          hash: `#fullscreen-${imageId}` 
        })
      } else {
        // 退出全屏，移除锚点
        isUserFullscreen.value = false
        router.push({ 
          path: route.path, 
          hash: '' 
        })
      }
    }

    // 监听路由变化，处理浏览器后退
    watch(() => route.hash, (newHash) => {
      if (newHash.startsWith('#fullscreen-')) {
        // 如果URL包含全屏锚点但当前不是全屏状态，则进入全屏
        if (!isUserFullscreen.value) {
          isUserFullscreen.value = true
        }
        
        // 解析图片ID并跳转到对应图片
        const imageId = newHash.replace('#fullscreen-', '')
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
    }, { immediate: true })

    onMounted(() => {
      window.addEventListener('keydown', handleKeyDown)
      
      // 检查初始URL是否包含全屏锚点
      if (route.hash.startsWith('#fullscreen-')) {
        isUserFullscreen.value = true
        const imageId = route.hash.replace('#fullscreen-', '')
        const imageIndex = imageItems.value.findIndex(item => 
          item.id.toString() === imageId || 
          imageItems.value.indexOf(item).toString() === imageId
        )
        if (imageIndex !== -1) {
          activeIndex.value = imageIndex
        }
      }
      
      console.log('图片页面加载完成，共', imageItems.value.length, '张图片')
    })

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeyDown)
      if (swiperInstance.value) {
        swiperInstance.value.destroy()
      }
    })

    // 计算是否启用全屏模式
    const isFullscreenEnabled = computed(() => {
      return props.contentData?.fullscreenEnabled === true || isUserFullscreen.value
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
      onSwiper,
      onSlideChange,
      toggleFullscreen,
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
  z-index: 15;
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