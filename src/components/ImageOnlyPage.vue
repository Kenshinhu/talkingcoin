<template>
  <div class="image-only-page">
    <!-- 图片轮播容器 -->
    <div class="image-slider-container">
      <swiper
        :modules="swiperModules"
        :slides-per-view="1"
        :space-between="0"
        :pagination="{ 
          clickable: true, 
          dynamicBullets: true
        }"
        :navigation="true"
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
        class="image-swiper w-full h-full"
        @swiper="onSwiper"
        @slideChange="onSlideChange"
      >
        <swiper-slide 
          v-for="(item, index) in imageItems" 
          :key="item.id" 
          class="flex items-center justify-center"
        >
          <div class="swiper-zoom-container w-full h-full flex items-center justify-center">
            <img 
              :src="item.file.filePath" 
              :alt="item.title || `图片 ${index + 1}`"
              class="max-w-full max-h-full object-contain"
              loading="lazy"
            />
          </div>
        </swiper-slide>
      </swiper>

      <!-- 信息覆盖层 - 底部 -->
      <div class="info-overlay">
        <div class="info-content">
          <h1 v-if="currentImageTitle" class="image-title">{{ currentImageTitle }}</h1>
          <p v-if="currentImageDescription" class="image-description">{{ currentImageDescription }}</p>
          <div class="image-counter">{{ activeIndex + 1 }} / {{ imageItems.length }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
// 导入Swiper相关组件
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Navigation, Keyboard, Zoom, Autoplay, A11y } from 'swiper/modules'

// 导入Swiper样式
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
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
    pageData: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const swiperInstance = ref(null)
    const activeIndex = ref(0)

    // Swiper模块
    const swiperModules = [Pagination, Navigation, Keyboard, Zoom, Autoplay, A11y]

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
      }
    }

    onMounted(() => {
      window.addEventListener('keydown', handleKeyDown)
      console.log('图片页面加载完成，共', imageItems.value.length, '张图片')
    })

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeyDown)
      if (swiperInstance.value) {
        swiperInstance.value.destroy()
      }
    })

    return {
      swiperInstance,
      activeIndex,
      swiperModules,
      imageItems,
      currentImageTitle,
      currentImageDescription,
      onSwiper,
      onSlideChange
    }
  }
}
</script>

<style scoped>
.image-only-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;
}

.image-slider-container {
  position: relative;
  width: 100%;
  height: 100%;
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

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  background-color: rgba(0, 0, 0, 0.3);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -25px;
  z-index: 20;
}

:deep(.swiper-button-next)::after,
:deep(.swiper-button-prev)::after {
  font-size: 24px;
}

:deep(.swiper-zoom-container) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
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
  
  :deep(.swiper-button-next),
  :deep(.swiper-button-prev) {
    width: 40px;
    height: 40px;
    margin-top: -20px;
  }
  
  :deep(.swiper-button-next)::after,
  :deep(.swiper-button-prev)::after {
    font-size: 18px;
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

/* 图片样式 */
img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* 淡入淡出过渡效果 */
.swiper-slide {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.swiper-slide-active {
  opacity: 1;
}
</style> 