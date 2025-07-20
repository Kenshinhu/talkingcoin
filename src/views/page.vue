<template>
  <div class="page-container">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <div v-if="errorType === 'not-found'" class="not-found">
        <div class="not-found-icon">🔍</div>
        <h2>页面不存在</h2>
        <p>抱歉，您访问的页面不存在或已被删除</p>
        <button @click="goBack" class="back-button">返回上一页</button>
      </div>
      <div v-else class="general-error">
        <div class="error-icon">⚠️</div>
        <h2>加载失败</h2>
        <p>{{ error }}</p>
        <button @click="retry" class="retry-button">重试</button>
      </div>
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
import MixedPage from '../components/MixedPage.vue'
import DefaultPage from '../components/DefaultPage.vue'

export default {
  name: 'Page',
  components: {
    VideoOnlyPage,
    ImageOnlyPage,
    MixedPage,
    DefaultPage
  },
  setup() {
    const route = useRoute()
    const loading = ref(false)
    const error = ref(null)
    const errorType = ref(null)
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
        case 'MIXED':
          return 'MixedPage'
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
        name: data.name,
        description: data.description,
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
            mediaItems: data.contentData?.mediaItemsData || []
          }
        case 'IMAGE_ONLY':
          return {
            ...baseProps,
            mediaItems: data.mediaItems || []
          }
        case 'MIXED':
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
        errorType.value = null
        
        // 从路由参数中获取id
        const id = route.params.pathMatch || route.params.id
        console.log('页面ID:', id)
        
        // 请求页面数据
        const response = await api.get(`/pages/${id}`)
        pageData.value = response

        

        //使用 name - description 作为页面标题
        const {name, description} = response?.data
        // 过滤HTML标签的函数
        const stripHtmlTags = (html) => {
          if (!html) return '';
          const div = document.createElement('div');
          div.innerHTML = html;
          return div.textContent || div.innerText || '';
        };
        
        document.title = [stripHtmlTags(name), stripHtmlTags(description)].filter(v => v.trim() !=='').join(' - ')
        console.log('stripHtmlTags(description):', stripHtmlTags(description))
        console.log('页面类型:', response?.data?.pageType)
        
      } catch (err) {
        console.error('获取页面数据错误:', err)
        
        // 判断错误类型
        if (err.response?.status === 404) {
          errorType.value = 'not-found'
          error.value = '页面不存在'
        } else {
          errorType.value = 'general'
          error.value = err.response?.data?.message || err.message || '获取页面数据失败'
        }
      } finally {
        loading.value = false
      }
    }

    // 返回上一页
    const goBack = () => {
      window.history.back()
    }

    // 重试加载
    const retry = () => {
      fetchPageData()
    }

    // 页面加载时获取数据
    onMounted(() => {
      fetchPageData()
    })

    return {
      loading,
      error,
      errorType,
      pageData,
      showDebug,
      currentPageComponent,
      pageComponentProps,
      fetchPageData,
      goBack,
      retry
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
  padding: 20px;
}

.not-found, .general-error {
  text-align: center;
  max-width: 500px;
}

.not-found-icon, .error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.not-found h2, .general-error h2 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.not-found p, .general-error p {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.5;
}

.back-button, .retry-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.back-button:hover, .retry-button:hover {
  background-color: #2980b9;
}

.retry-button {
  background-color: #e74c3c;
}

.retry-button:hover {
  background-color: #c0392b;
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
