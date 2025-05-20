<template>
  <div 
    class="bg-white rounded-md sm:rounded-lg shadow-md overflow-hidden"
    @click="openFullscreenImage"
  >
    <div class="relative overflow-hidden">
      <img 
        :src="props.image" 
        :alt="props.title" 
        class="w-full object-cover"
        loading="lazy"
        ref="imageRef"
        @load="onImageLoad"
      >
      
      <div 
        class="absolute bottom-0 left-0 right-0 p-2 sm:p-4 text-white bg-gradient-to-t from-black/60 to-transparent"
      >
        <h3 class="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 text-shadow">{{ props.title }}</h3>
      </div>
    </div>
  </div>

  <!-- 全屏图片模态框 - 移到组件外层以避免闪烁 -->
  <Teleport to="body">
    <transition name="fade">
      <div v-if="showFullscreen" 
          class="fullscreen-modal fixed inset-0 z-50 bg-black/95">
        <div class="relative w-full h-full flex flex-col items-center justify-center">
          <!-- Swiper轮播 -->
          <swiper
            :modules="swiperModules"
            :slides-per-view="1"
            :initial-slide="currentIndex"
            :space-between="30"
            :pagination="{ 
              clickable: true, 
              dynamicBullets: true
            }"
            :navigation="true"
            :keyboard="{ enabled: true }"
            :grab-cursor="true"
            :autoplay="false"
            :loop="false"
            :lazy="{ loadPrevNext: true }"
            :zoom="{ maxRatio: 3 }"
            :prevent-clicks-propagation="true"
            class="fullscreen-swiper w-full h-full"
            @swiper="onSwiper"
            @slideChange="onSlideChange"
          >
            <swiper-slide v-for="spot in allSpots" :key="spot.id" class="flex items-center justify-center">
              <div class="swiper-zoom-container w-full h-full flex items-center justify-center">
                <img 
                  :src="spot.image" 
                  :alt="spot.title"
                  class="max-w-full max-h-[85vh] object-contain"
                />
              </div>
            </swiper-slide>
          </swiper>

          <!-- 关闭按钮 -->
          <div class="absolute top-4 right-4 z-30">
            <button 
              @click.stop="closeFullscreen" 
              class="p-2 bg-black/50 rounded-full text-white hover:bg-black/80 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- 标题和计数 -->
          <div class="absolute bottom-12 left-0 right-0 text-center text-white z-30">
            <h2 class="text-xl font-bold text-shadow">{{ currentSpotTitle }}</h2>
            <div class="mt-2 text-sm">{{ activeIndex + 1 }} / {{ allSpots.length }}</div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed, inject, nextTick } from 'vue'
// 导入Swiper相关组件
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination, Navigation, Keyboard, Zoom, Controller, A11y } from 'swiper/modules'

// 导入Swiper样式
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/zoom'

// 全局锁定计数器，用于处理多组件共享滚动锁定状态
const lockCount = ref(window.scrollLockCount || 0)
if (typeof window.scrollLockCount === 'undefined') {
  window.scrollLockCount = 0
}

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  id: {
    type: Number,
    required: true
  }
})

// 从父组件注入所有景点数据
const allSpots = inject('scenicSpots')

const showFullscreen = ref(false)
const imageRef = ref(null)
const currentIndex = ref(0)
const activeIndex = ref(0)
const swiperInstance = ref(null)

// Swiper模块
const swiperModules = [Pagination, Navigation, Keyboard, Zoom, Controller, A11y]

// 计算当前显示的景点信息
const currentSpotTitle = computed(() => {
  return allSpots[activeIndex.value] ? allSpots[activeIndex.value].title : ''
})

// 检测iOS设备
const detectIOS = () => {
  const userAgent = window.navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(userAgent) || 
    (userAgent.includes('mac') && 'ontouchend' in document)
}

// 控制body滚动锁定
const lockBodyScroll = () => {
  // 增加锁定计数
  window.scrollLockCount++
  
  // 只有在从0变为1时才实际锁定滚动
  if (window.scrollLockCount === 1) {
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    console.log('滚动已锁定，计数:', window.scrollLockCount)
  }
}

const unlockBodyScroll = () => {
  // 减少锁定计数，但不低于0
  if (window.scrollLockCount > 0) {
    window.scrollLockCount--
  }
  
  // 只有在计数变为0时才实际解锁滚动
  if (window.scrollLockCount === 0) {
    document.body.style.overflow = ''
    document.body.style.touchAction = ''
    console.log('滚动已解锁，计数:', window.scrollLockCount)
  }
}

// Swiper实例初始化
const onSwiper = (swiper) => {
  swiperInstance.value = swiper
  // 初始设置活动索引
  activeIndex.value = currentIndex.value
}

// 当Swiper切换幻灯片时更新状态
const onSlideChange = (swiper) => {
  activeIndex.value = swiper.activeIndex
}

// 打开全屏图片
const openFullscreenImage = () => {
  // 找到当前图片在数组中的索引
  const index = allSpots.findIndex(spot => spot.id === props.id)
  currentIndex.value = index
  
  // 显示全屏模态框
  showFullscreen.value = true
  lockBodyScroll()
  
  // 等待DOM更新后初始化Swiper到正确的索引
  nextTick(() => {
    if (swiperInstance.value) {
      swiperInstance.value.slideTo(index, 0)
      activeIndex.value = index
    }
  })
}

// 关闭全屏图片
const closeFullscreen = () => {
  showFullscreen.value = false
  unlockBodyScroll()
}

// 图片加载完成时的处理
const onImageLoad = () => {
  if (imageRef.value) {
    imageRef.value.style.opacity = '1'
  }
}

// 监听ESC键关闭全屏
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && showFullscreen.value) {
    closeFullscreen()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
  
  // 确保组件销毁时解锁滚动（如果当前组件锁定了滚动）
  if (showFullscreen.value) {
    unlockBodyScroll()
  }
})
</script>

<style scoped>
.text-shadow {
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

@media (max-width: 639px) {
  .text-shadow {
    text-shadow: 0.5px 0.5px 1px rgba(0, 0, 0, 0.5);
  }
}

/* 淡入淡出过渡 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fullscreen-modal {
  backdrop-filter: blur(3px);
}

/* Swiper 自定义样式 */
.fullscreen-swiper {
  --swiper-theme-color: #ffffff;
  --swiper-navigation-size: 30px;
  --swiper-pagination-bullet-inactive-color: rgba(255, 255, 255, 0.5);
  --swiper-pagination-bullet-inactive-opacity: 0.7;
}
 

:deep(.swiper-pagination) {
  bottom: 5px !important;
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  background-color: rgba(0, 0, 0, 0.3);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.swiper-button-next)::after,
:deep(.swiper-button-prev)::after {
  font-size: 20px;
}

:deep(.swiper-zoom-container) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 确保图片容器能够自适应高度 */
img {
  display: block;
  height: auto;
  min-height: 200px;
  transition: transform 0.3s ease;
}

/* 添加hover效果 */
.relative:hover img {
  transform: scale(1.05);
}
</style> 