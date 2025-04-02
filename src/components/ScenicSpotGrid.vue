<template>
  <div class="container mx-auto px-2 sm:px-4 py-4">
    <div class="masonry-grid" ref="masonryContainer">
      <div 
        v-for="spot in scenicSpots" 
        :key="spot.id"
        class="masonry-item  w-1/2 p-2"
      >
        <ScenicSpotCard
          :title="spot.title"
          :image="spot.image"
          :id="spot.id"
          class="h-full"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import ScenicSpotCard from './ScenicSpotCard.vue'
import { provide, ref, onMounted, onUnmounted } from 'vue'
import Masonry from 'masonry-layout'
import imagesLoaded from 'imagesloaded'

const scenicSpots = [
  {
    id: 1,
    title: '佛光普照',
    image: new URL('../assets/0001佛光普照.jpg', import.meta.url).href
  },
  {
    id: 2,
    title: '六祖塑像',
    image: new URL('../assets/0002六祖塑像.jpg', import.meta.url).href
  },
  {
    id: 3,
    title: '菩提偈语',
    image: new URL('../assets/0003菩提偈语.jpg', import.meta.url).href
  },
  {
    id: 4,
    title: '御赐牌匾',
    image: new URL('../assets/0004御赐牌匾.jpg', import.meta.url).href
  },
  {
    id: 5,
    title: '大雄宝殿',
    image: new URL('../assets/0005大雄宝殿.jpg', import.meta.url).href
  },
  {
    id: 6,
    title: '如画景致',
    image: new URL('../assets/0006如画景致.jpg', import.meta.url).href
  },
  {
    id: 7,
    title: '岭南骑楼',
    image: new URL('../assets/0007岭南骑楼.jpg', import.meta.url).href
  },
  {
    id: 8,
    title: '广州会馆',
    image: new URL('../assets/0008广州会馆.jpg', import.meta.url).href
  },
  {
    id: 9,
    title: '百年东街',
    image: new URL('../assets/0009百年东街.jpg', import.meta.url).href
  },
  {
    id: 10,
    title: '江心宝塔',
    image: new URL('../assets/0010江心宝塔.jpg', import.meta.url).href
  }
]

// 提供景点数据给子组件
provide('scenicSpots', scenicSpots)

const masonryContainer = ref(null)
let masonryInstance = null

const initMasonry = () => {
  if (!masonryContainer.value) return

  // 初始化Masonry
  masonryInstance = new Masonry(masonryContainer.value, {
    itemSelector: '.masonry-item',
    columnWidth: '.masonry-item',
    percentPosition: true,
    transitionDuration: '0.3s',
    initLayout: false, // 等待图片加载完成后再初始化布局
  })

  // 等待所有图片加载完成后再初始化布局
  imagesLoaded(masonryContainer.value, () => {
    masonryInstance.layout()
  })
}

// 处理窗口大小变化
const handleResize = () => {
  if (masonryInstance) {
    masonryInstance.layout()
  }
}

onMounted(() => {
  // 在下一个tick初始化Masonry，确保DOM已经渲染
  setTimeout(() => {
    initMasonry()
  }, 100)

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (masonryInstance) {
    masonryInstance.destroy()
  }
})
</script>

<style scoped>
.masonry-grid {
  width: 100%;
}

.masonry-item {
  float: left; /* 必须的，用于Masonry布局 */
}

/* 响应式调整 */
@media (max-width: 639px) {
  .masonry-item {
    padding: 0.5rem;
  }
}

/* 确保图片容器有正确的宽高比 */
:deep(.h-full) {
  height: auto !important;
}

:deep(img) {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
}

/* 添加hover效果 */
:deep(.relative:hover img) {
  transform: scale(1.05);
}
</style> 