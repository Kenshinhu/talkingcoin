<template>
  <div class="test-page">
    <h1>页面组件测试</h1>
    
    <div class="test-buttons">
      <button @click="testVideoOnlyPage" class="test-btn">测试 VIDEO_ONLY 页面</button>
      <button @click="testImageOnlyPage" class="test-btn">测试 IMAGE_ONLY 页面</button>
      <button @click="testDefaultPage" class="test-btn">测试默认页面</button>
      <button @click="clearTest" class="test-btn clear-btn">清除测试</button>
    </div>
    
    <div v-if="currentTest" class="test-container">
      <h2>当前测试: {{ currentTest }}</h2>
      <component 
        :is="currentComponent" 
        v-bind="currentProps"
        :key="testKey"
      />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import VideoOnlyPage from '../components/VideoOnlyPage.vue'
import ImageOnlyPage from '../components/ImageOnlyPage.vue'
import DefaultPage from '../components/DefaultPage.vue'

export default {
  name: 'TestPage',
  components: {
    VideoOnlyPage,
    ImageOnlyPage,
    DefaultPage
  },
  setup() {
    const currentTest = ref('')
    const currentComponent = ref(null)
    const currentProps = ref({})
    const testKey = ref(0)

    // 测试数据
    const videoOnlyTestData = {
      pageData: {
        id: "test-video-page",
        name: "测试视频页面",
        description: "这是一个测试视频页面",
        pageType: "VIDEO_ONLY"
      },
      name: "测试视频页面",
      description: "这是一个测试视频页面，用于验证VIDEO_ONLY页面类型的功能",
      mediaItems: [
        {
          id: "test-video-item",
          mediaType: "video",
          title: "测试视频标题",
          description: "这是一个测试视频的描述信息，用于验证视频页面的显示效果。",
          file: {
            filePath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          }
        }
      ]
    }

    const imageOnlyTestData = {
      pageData: {
        id: "test-image-page",
        name: "测试图片页面",
        description: "这是一个测试图片页面",
        pageType: "IMAGE_ONLY"
      },
      name: "测试图片页面",
      description: "这是一个测试图片页面，用于验证IMAGE_ONLY页面类型的功能",
      mediaItems: [
        {
          id: "test-image-1",
          mediaType: "image",
          title: "第一张测试图片",
          description: "这是第一张测试图片的描述信息，用于验证图片轮播的显示效果。",
          displayOrder: 0,
          file: {
            filePath: "https://picsum.photos/1920/1080?random=1"
          }
        },
        {
          id: "test-image-2",
          mediaType: "image",
          title: "第二张测试图片",
          description: "这是第二张测试图片的描述信息，展示了不同的内容和样式。",
          displayOrder: 1,
          file: {
            filePath: "https://picsum.photos/1920/1080?random=2"
          }
        },
        {
          id: "test-image-3",
          mediaType: "image",
          title: "第三张测试图片",
          description: "这是第三张测试图片，用于测试多图片轮播的切换效果和信息显示。",
          displayOrder: 2,
          file: {
            filePath: "https://picsum.photos/1920/1080?random=3"
          }
        }
      ]
    }

    const defaultPageTestData = {
      pageData: {
        id: "test-default-page",
        name: "测试默认页面",
        description: "这是一个测试默认页面",
        pageType: "UNKNOWN_TYPE"
      },
      name: "测试默认页面",
      description: "这是一个测试默认页面，用于验证默认页面组件的功能",
      mediaItems: [
        {
          id: "test-image-item",
          mediaType: "image",
          title: "测试图片标题",
          description: "这是一个测试图片的描述信息。",
          file: {
            filePath: "https://picsum.photos/800/600"
          }
        },
        {
          id: "test-video-item-2",
          mediaType: "video",
          title: "测试视频标题",
          description: "这是另一个测试视频的描述信息。",
          file: {
            filePath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
          }
        }
      ]
    }

    const testVideoOnlyPage = () => {
      currentTest.value = 'VIDEO_ONLY 页面'
      currentComponent.value = 'VideoOnlyPage'
      currentProps.value = videoOnlyTestData
      testKey.value++
    }

    const testImageOnlyPage = () => {
      currentTest.value = 'IMAGE_ONLY 页面'
      currentComponent.value = 'ImageOnlyPage'
      currentProps.value = imageOnlyTestData
      testKey.value++
    }

    const testDefaultPage = () => {
      currentTest.value = '默认页面'
      currentComponent.value = 'DefaultPage'
      currentProps.value = defaultPageTestData
      testKey.value++
    }

    const clearTest = () => {
      currentTest.value = ''
      currentComponent.value = null
      currentProps.value = {}
      testKey.value++
    }

    return {
      currentTest,
      currentComponent,
      currentProps,
      testKey,
      testVideoOnlyPage,
      testImageOnlyPage,
      testDefaultPage,
      clearTest
    }
  }
}
</script>

<style scoped>
.test-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.test-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.test-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  background: #007bff;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.test-btn:hover {
  background: #0056b3;
}

.clear-btn {
  background: #dc3545;
}

.clear-btn:hover {
  background: #c82333;
}

.test-container {
  border: 2px solid #007bff;
  border-radius: 8px;
  overflow: hidden;
}

.test-container h2 {
  background: #007bff;
  color: white;
  margin: 0;
  padding: 15px;
  text-align: center;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .test-page {
    padding: 15px;
  }
  
  .test-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .test-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style> 