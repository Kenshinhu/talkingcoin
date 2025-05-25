<template>
  <div class="page-container">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
    </div>
    <div v-else>
      <!-- 根据pageType渲染不同的组件 -->
      <component 
        :is="currentPageComponent" 
        v-bind="pageComponentProps"
        :key="pageData?.data?.id"
      />
      
      <!-- 调试信息 - 开发环境可以显示 -->
      <!-- <div class="debug-info" v-if="showDebug">
        <h3>调试信息:</h3>
        <p>页面类型: {{ pageData?.data?.pageType }}</p>
        <pre>{{ JSON.stringify(pageData, null, 2) }}</pre>
      </div> -->
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api/index.js'
import VideoOnlyPage from '../components/VideoOnlyPage.vue'
import ImageOnlyPage from '../components/ImageOnlyPage.vue'
import DefaultPage from '../components/DefaultPage.vue'

export default {
  name: 'Page',
  components: {
    VideoOnlyPage,
    ImageOnlyPage,
    DefaultPage
  },
  setup() {
    const route = useRoute()
    const loading = ref(false)
    const error = ref(null)
    const pageData = ref(null)
    const showDebug = ref(false) // 可以设置为true来显示调试信息

    // 根据pageType计算当前应该使用的组件
    const currentPageComponent = computed(() => {
      const pageType = pageData.value?.data?.pageType
      
      switch (pageType) {
        case 'VIDEO_ONLY':
          return 'VideoOnlyPage'
        case 'IMAGE_ONLY':
          return 'ImageOnlyPage'
        case 'SCENIC_SPOT':
          // 可以在这里添加景点页面组件
          return 'ScenicSpotPage'
        case 'GALLERY':
          // 可以在这里添加图片画廊组件
          return 'GalleryPage'
        default:
          // 默认显示原始数据
          return 'DefaultPage'
      }
    })

    // 计算传递给组件的props
    const pageComponentProps = computed(() => {
      const data = pageData.value?.data
      if (!data) return {} 

      const baseProps = {
        pageData: data,
        name: '旅行的意义——在世界的每一个角落，发现自我、感受生活、体验不同文化、结识新朋友、欣赏壮丽风景、品味美食、挑战自我极限、收获成长与感动、留下珍贵回忆、让心灵自由飞翔、让人生更加丰富多彩。',
        description: '旅行不仅是对未知世界的探索，更是对自我内心的发现。在旅途中，我们遇见不同的人，欣赏多样的风景，体验别样的生活方式。每一次出发，都是一次成长，每一次归来，都是心灵的充实。旅行让我们学会包容、理解与感恩，让生活变得更加丰富多彩。',
        headerSettings: data.headerSettings,
        footerSettings: data.footerSettings,
        contentData: data.contentData,
        styleSettings: data.styleSettings
      }

      // 根据页面类型添加特定的props
      switch (data.pageType) {
        case 'VIDEO_ONLY':
          return {
            ...baseProps,
            mediaItems: data.mediaItems || []
          }
        case 'IMAGE_ONLY':
          return {
            ...baseProps,
            mediaItems: data.mediaItems || []
          }
        case 'SCENIC_SPOT':
          return {
            ...baseProps,
            mediaItems: data.mediaItems || [],
            spots: data.contentData?.spots || []
          }
        case 'GALLERY':
          return {
            ...baseProps,
            mediaItems: data.mediaItems || []
          }
        default:
          return baseProps
      }
    })

    // 获取页面数据
    const fetchPageData = async () => {
      try {
        loading.value = true
        error.value = null
        
        // 从路由参数中获取id
        const id = route.params.pathMatch || route.params.id
        console.log('页面ID:', id)
        
        // 请求页面数据
        const response = await api.get(`/pages/${id}`)
        pageData.value = response

        //使用 name - description 作为页面标题
        const {name, description} = response?.data
        document.title = `${name} - ${description}`;
        console.log('页面数据:', response)
        console.log('页面类型:', response?.data?.pageType)
        
      } catch (err) {
        error.value = err.response?.data?.message || err.message || '获取页面数据失败'
        console.error('获取页面数据错误:', err)
      } finally {
        loading.value = false
      }
    }

    // 页面加载时获取数据
    onMounted(() => {
      fetchPageData()
    })

    return {
      loading,
      error,
      pageData,
      showDebug,
      currentPageComponent,
      pageComponentProps,
      fetchPageData
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  position: relative;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: #e74c3c;
  font-size: 1.1rem;
  text-align: center;
  padding: 20px;
}

.debug-info {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 4px;
  max-width: 300px;
  max-height: 400px;
  overflow: auto;
  font-size: 12px;
  z-index: 9999;
}

.debug-info pre {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 5px;
  border-radius: 2px;
  overflow-x: auto;
  font-size: 10px;
}
</style>
