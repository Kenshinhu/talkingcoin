<template>
  <div class="default-page">
    <div class="container">
      <h1 v-if="name" class="page-title">{{ name }}</h1>
      <p v-if="description" class="page-description">{{ description }}</p>
      
      <div class="page-type-info">
        <span class="page-type-badge">{{ pageData?.pageType || '未知类型' }}</span>
      </div>
      
      <!-- 媒体项目展示 -->
      <div v-if="mediaItems && mediaItems.length > 0" class="media-section">
        <h2>媒体内容</h2>
        <div class="media-grid">
          <div 
            v-for="item in mediaItems" 
            :key="item.id"
            class="media-item"
          >
            <div v-if="item.mediaType === 'video'" class="video-item">
              <video 
                :src="item.file?.filePath" 
                controls 
                class="media-video"
                :poster="item.file?.posterUrl"
              >
                您的浏览器不支持视频播放。
              </video>
              <div class="media-info">
                <h3 v-if="item.title">{{ item.title }}</h3>
                <p v-if="item.description">{{ item.description }}</p>
              </div>
            </div>
            
            <div v-else-if="item.mediaType === 'image'" class="image-item">
              <img 
                :src="item.file?.filePath" 
                :alt="item.title || '图片'"
                class="media-image"
              />
              <div class="media-info">
                <h3 v-if="item.title">{{ item.title }}</h3>
                <p v-if="item.description">{{ item.description }}</p>
              </div>
            </div>
            
            <div v-else class="unknown-media">
              <div class="unknown-media-placeholder">
                <p>未知媒体类型: {{ item.mediaType }}</p>
                <p v-if="item.file?.fileName">文件: {{ item.file.fileName }}</p>
              </div>
              <div class="media-info">
                <h3 v-if="item.title">{{ item.title }}</h3>
                <p v-if="item.description">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 原始数据展示 -->
      <details class="raw-data-section">
        <summary>查看原始数据</summary>
        <pre class="raw-data">{{ JSON.stringify(pageData, null, 2) }}</pre>
      </details>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DefaultPage',
  props: {
    pageData: {
      type: Object,
      default: () => ({})
    },
    name: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    mediaItems: {
      type: Array,
      default: () => []
    },
    headerSettings: {
      type: Object,
      default: () => ({})
    },
    footerSettings: {
      type: Object,
      default: () => ({})
    },
    contentData: {
      type: Object,
      default: () => ({})
    },
    styleSettings: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style scoped>
.default-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  text-align: center;
}

.page-description {
  font-size: 1.2rem;
  color: #666;
  text-align: center;
  margin-bottom: 30px;
  line-height: 1.6;
}

.page-type-info {
  text-align: center;
  margin-bottom: 40px;
}

.page-type-badge {
  display: inline-block;
  background: #007bff;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.media-section {
  margin-bottom: 40px;
}

.media-section h2 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.media-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.media-item:hover {
  transform: translateY(-5px);
}

.media-video,
.media-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.unknown-media-placeholder {
  height: 200px;
  background: #f0f0f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  text-align: center;
}

.media-info {
  padding: 15px;
}

.media-info h3 {
  font-size: 1.2rem;
  color: #333;
  margin: 0 0 8px 0;
}

.media-info p {
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.raw-data-section {
  margin-top: 40px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.raw-data-section summary {
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
}

.raw-data {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #333;
  border: 1px solid #e9ecef;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .default-page {
    padding: 15px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .page-description {
    font-size: 1.1rem;
  }
  
  .media-grid {
    grid-template-columns: 1fr;
  }
}
</style> 