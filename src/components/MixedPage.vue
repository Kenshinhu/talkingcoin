<template>
  <div class="mixed-page">
    <!-- 页面头部 -->
    <div v-if="headerSettings && Object.keys(headerSettings).length > 0" 
         class="page-header"
         :style="headerStyle">
      <h1 class="header-text" :style="headerTextStyle">
        {{ headerSettings.text || name }}
      </h1>
    </div>

    <!-- Banner 区域 -->
    <div v-if="bannerItems && bannerItems.length > 0" class="banner-section">
      <div class="banner-container">
        <div v-for="banner in bannerItems" :key="banner.id" class="banner-item">
          <img 
            :src="banner.file.filePath" 
            :alt="banner.title || banner.description"
            class="banner-image"
          />
          <div v-if="banner.title || banner.description" class="banner-overlay">
            <h2 v-if="banner.title" class="banner-title">{{ banner.title }}</h2>
            <p v-if="banner.description" class="banner-description">{{ banner.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- Sections 区域 -->
      <div v-if="contentData.sections && contentData.sections.length > 0" 
           class="sections-container"
           :style="sectionsContainerStyle">
        <div v-for="(section, sectionIndex) in contentData.sections" 
             :key="section.id" 
             class="section"
             :style="getSectionStyle(section, sectionIndex)">
          <!-- <h2 v-if="section.title" class="section-title">{{ section.title }}</h2> -->
          
          <!-- 媒体网格 -->
          <div v-if="section.mediaItemsData && section.mediaItemsData.length > 0" 
               class="media-grid"
               :class="{ 'force-single-column': section.forceMobileSingle || contentData.forceMobileSingle }"
               :data-force-mobile-single="section.forceMobileSingle || contentData.forceMobileSingle"
               :style="getMediaGridStyle(section)">
            <div v-for="media in section.mediaItemsData" 
                 :key="media.id" 
                 class="media-item"
                 :style="getMediaItemStyle(section)">
              <div class="media-content">
                <img v-if="media.mediaType === 'image'"
                     :src="media.file.filePath"
                     :alt="media.title || media.description"
                     class="media-image"
                />
                <video v-else-if="media.mediaType === 'video'"
                       :src="media.file.filePath"
                       class="media-video"
                       controls
                       preload="metadata"
                />
                
                <!-- 媒体信息覆盖层 -->
                <div v-if="media.title || media.description" class="media-info">
                  <h3 v-if="media.title" class="media-title">{{ media.title }}</h3>
                  <p v-if="media.description" class="media-description">{{ media.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 页面底部 -->
    <div v-if="footerSettings && Object.keys(footerSettings).length > 0" 
         class="page-footer"
         :style="footerStyle">
      <div class="footer-content">
        <p v-if="footerSettings.copyrightText" class="copyright">
          {{ footerSettings.copyrightText }}
        </p>
        <div v-if="footerSettings.showSocialLinks" class="social-links">
          <!-- 这里可以添加社交媒体链接 -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'MixedPage',
  props: {
    pageData: {
      type: Object,
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
    },
    mediaItems: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    // 计算banner项目
    const bannerItems = computed(() => {
      return props.contentData.bannerMediaItemsData || []
    })

    // 计算头部样式
    const headerStyle = computed(() => {
      const settings = props.headerSettings
      return {
        height: settings.height || 'auto',
        backgroundColor: settings.backgroundColor || 'transparent',
        textAlign: settings.textAlign || 'center'
      }
    })

    // 计算头部文字样式
    const headerTextStyle = computed(() => {
      const settings = props.headerSettings
      return {
        color: settings.textColor || '#333'
      }
    })

    // 计算底部样式
    const footerStyle = computed(() => {
      const settings = props.footerSettings
      return {
        backgroundColor: settings.backgroundColor || '#f8f9fa'
      }
    })

    // 计算sections容器样式
    const sectionsContainerStyle = computed(() => {
      const gap = props.contentData.sectionsGap || props.contentData.gridGap || '40px'
      return {
        gap: gap
      }
    })

    // 获取单个section的样式
    const getSectionStyle = (section, sectionIndex) => {
      const sectionGap = section.sectionGap || props.contentData.sectionGap || '20px'
      return {
        marginBottom: sectionIndex < props.contentData.sections.length - 1 ? sectionGap : '0'
      }
    }

    // 获取媒体网格样式（支持每个section独立配置）
    const getMediaGridStyle = (section) => {
      // 优先使用section级别的配置，然后是contentData级别的配置
      const layout = section.mediaLayout || props.contentData.mediaLayout || 'grid'
      const perRow = parseInt(section.mediaPerRow || props.contentData.mediaPerRow || 2)
      const gap = section.gridGap || props.contentData.gridGap || '4px' // 小红书风格超窄间隙
      
      // 移动设备列数配置（可选）
      const mobilePerRow = parseInt(section.mobilePerRow || props.contentData.mobilePerRow || Math.min(perRow, 2))
      const tabletPerRow = parseInt(section.tabletPerRow || props.contentData.tabletPerRow || Math.min(perRow, 3))
      
      const baseStyle = {
        width: '100%',
        boxSizing: 'border-box'
      }
      
      if (layout === 'grid') {
        return {
          ...baseStyle,
          display: 'grid',
          gridTemplateColumns: `repeat(${perRow}, 1fr)`,
          gap: gap,
          alignItems: 'start',
          // 添加CSS自定义属性用于响应式
          '--desktop-columns': perRow,
          '--tablet-columns': tabletPerRow,
          '--mobile-columns': mobilePerRow
        }
      } else if (layout === 'flex') {
        return {
          ...baseStyle,
          display: 'flex',
          flexWrap: 'wrap',
          gap: gap,
          justifyContent: 'flex-start',
          alignItems: 'stretch',
          '--desktop-columns': perRow,
          '--tablet-columns': tabletPerRow,
          '--mobile-columns': mobilePerRow
        }
      } else if (layout === 'masonry') {
        return {
          ...baseStyle,
          display: 'grid',
          gridTemplateColumns: `repeat(${perRow}, 1fr)`,
          gap: gap,
          gridAutoRows: 'min-content',
          alignItems: 'start',
          '--desktop-columns': perRow,
          '--tablet-columns': tabletPerRow,
          '--mobile-columns': mobilePerRow
        }
      }
      
      return baseStyle
    }

    // 获取媒体项目样式（支持每个section独立配置）
    const getMediaItemStyle = (section) => {
      // 支持最小高宽比1，最大高宽比2的需求
      let aspectRatio = parseFloat(1)
      // 限制高宽比范围：最小1（正方形），最大2（宽度是高度的2倍）
      aspectRatio = 3/ 4;
      const layout = section.mediaLayout || props.contentData.mediaLayout || 'grid'
      const perRow = parseInt(section.mediaPerRow || props.contentData.mediaPerRow || 2)
      const gap = section.gridGap || props.contentData.gridGap || '4px' // 小红书风格超窄间隙
      
      const baseStyle = {
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '2px',
        boxSizing: 'border-box'
      }
      
      if (layout === 'flex') {
        // 计算flex-basis，考虑gap的影响
        const gapValue = parseFloat(gap.replace(/[^\d.]/g, '')) || 20
        const gapUnit = gap.replace(/[\d.]/g, '') || 'px'
        const totalGapWidth = `${(perRow - 1) * gapValue}${gapUnit}`
        const flexBasis = `calc(${100 / perRow}% - ${totalGapWidth} / ${perRow})`
        
        return {
          ...baseStyle,
          flexBasis: flexBasis,
          flexShrink: 0,
          flexGrow: 0,
          aspectRatio: aspectRatio.toString(),
          minWidth: 0
        }
      } else if (layout === 'grid') {
        return {
          ...baseStyle,
          aspectRatio: aspectRatio.toString(),
          width: '100%',
          minWidth: 0
        }
      } else if (layout === 'masonry') {
        return {
          ...baseStyle,
          width: '100%',
          minWidth: 0,
          // masonry布局不强制aspectRatio，让内容自然高度
          minHeight: '200px'
        }
      }
      
      return {
        ...baseStyle,
        aspectRatio: aspectRatio.toString()
      }
    }

    // 调试方法：输出当前section的配置信息
    const debugSectionConfig = (section, sectionIndex) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Section ${sectionIndex} 配置:`, {
          mediaLayout: section.mediaLayout || props.contentData.mediaLayout || 'grid',
          mediaPerRow: section.mediaPerRow || props.contentData.mediaPerRow || 2,
          tabletPerRow: section.tabletPerRow || props.contentData.tabletPerRow || 'auto',
          mobilePerRow: section.mobilePerRow || props.contentData.mobilePerRow || 'auto',
          gridGap: section.gridGap || props.contentData.gridGap || '20px',
          mediaAspectRatio: section.mediaAspectRatio || props.contentData.mediaAspectRatio || 1,
          forceMobileSingle: section.forceMobileSingle || props.contentData.forceMobileSingle || false,
          mediaItemsCount: section.mediaItemsData?.length || 0
        })
      }
    }

    // 保持原有的计算属性以兼容性（已弃用，但保留以防其他地方使用）
    const mediaGridStyle = computed(() => {
      return getMediaGridStyle(props.contentData)
    })

    const mediaItemStyle = computed(() => {
      return getMediaItemStyle(props.contentData)
    })

    return {
      bannerItems,
      headerStyle,
      headerTextStyle,
      footerStyle,
      sectionsContainerStyle,
      getSectionStyle,
      getMediaGridStyle,
      getMediaItemStyle,
      debugSectionConfig,
      mediaGridStyle,
      mediaItemStyle
    }
  }
}
</script>

<style scoped>
.mixed-page {
  min-height: 100vh;
  background-color: #fff;
}

/* 页面头部样式 */
.page-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.header-text {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
}

/* Banner 样式 */
.banner-section {
  position: relative;
  width: 100%;
}

.banner-container {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
}

.banner-item {
  position: relative;
  width: 100%;
  height: 100%;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 40px 20px 20px;
}

.banner-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.banner-description {
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

/* 主要内容样式 */
.main-content {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.sections-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.section {
  width: 100%;
  position: relative;
}

.section-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0 0 20px 0;
  color: #333;
  text-align: center;
}

/* 媒体网格样式 */
.media-grid {
  width: 100%;
  position: relative;
  box-sizing: border-box;
  /* 确保没有默认的display属性覆盖动态样式 */
  /* 小红书风格：紧密排列 */
  margin: 0;
  padding: 0;
}

/* Grid布局样式 */
.media-grid[style*="display: grid"] {
  align-items: start;
}

/* Flex布局样式 */
.media-grid[style*="display: flex"] {
  justify-content: flex-start;
  align-items: stretch;
}

/* Masonry布局样式 */
.media-grid[style*="min-content"] {
  align-items: start;
}

.media-item {
  position: relative;
  overflow: hidden;
  border-radius: 4px; /* 小直径圆角，仿照小红书 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background-color: #fff;
  box-sizing: border-box;
}

/* Grid布局下的媒体项目 */
.media-grid[style*="display: grid"] .media-item {
  width: 100%;
  min-width: 0;
}

/* Flex布局下的媒体项目 */
.media-grid[style*="display: flex"] .media-item {
  flex-shrink: 0;
  flex-grow: 0;
  min-width: 0;
}

/* Masonry布局下的媒体项目 */
.media-grid[style*="min-content"] .media-item {
  width: 100%;
  min-width: 0;
}

.media-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.media-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.media-image,
.media-video {
  width: 100%;
  flex: 1;
  object-fit: cover;
  display: block;
  min-height: 0;
}

.media-info {
  position: static;
  background: #fff;
  color: #333;
  padding: 8px 6px 6px;
  border-radius: 0 0 4px 4px;
  border-top: 1px solid #f0f0f0;
}

.media-title {
  font-size: 0.75rem;
  font-weight: 500;
  margin: 0 0 2px 0;
  line-height: 1.2;
  /* 最多显示两行 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333;
}

.media-description {
  font-size: 0.65rem;
  margin: 0;
  opacity: 0.7;
  line-height: 1.2;
  /* 最多显示两行 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #666;
}

/* 页面底部样式 */
.page-footer {
  padding: 30px 20px;
  border-top: 1px solid #eee;
  margin-top: 40px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.copyright {
  margin: 0;
  color: #fff;
  font-size: 0.9rem;
}

.social-links {
  margin-top: 15px;
}

/* 平板设备响应式设计 */
@media (max-width: 1024px) and (min-width: 769px) {
  /* Grid布局使用平板列数 
  .media-grid[style*="display: grid"] {
    grid-template-columns: repeat(var(--tablet-columns, 3), 1fr) !important;
  }
  */
  /* Flex布局使用平板列数 */
  .media-grid[style*="display: flex"] .media-item {
    flex-basis: calc(100% / var(--tablet-columns, 3) - var(--gap-adjustment, 15px)) !important;
    max-width: calc(100% / var(--tablet-columns, 3) - var(--gap-adjustment, 15px)) !important;
  }
}

/* 移动设备响应式设计 */
@media (max-width: 768px) {
  .banner-container {
    height: 250px;
  }
  
  .banner-title {
    font-size: 1.8rem;
  }
  
  .banner-description {
    font-size: 1rem;
  }
  
  .main-content {
    padding: 20px 4px;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  /* Grid布局使用移动设备列数 
  .media-grid[style*="display: grid"] {
    grid-template-columns: repeat(var(--mobile-columns, 2), 1fr) !important;
  }
    */
  
  /* Flex布局使用移动设备列数 */
  .media-grid[style*="display: flex"] .media-item {
    flex-basis: calc(100% / var(--mobile-columns, 2) - var(--gap-adjustment, 10px)) !important;
    max-width: calc(100% / var(--mobile-columns, 2) - var(--gap-adjustment, 10px)) !important;
  }
  
  /* Masonry布局使用移动设备列数 
  .media-grid[style*="min-content"] {
    grid-template-columns: repeat(var(--mobile-columns, 2), 1fr) !important;
  }*/
  
  /* 减少间距 */
  .sections-container {
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .banner-container {
    height: 200px;
  }
  
  .banner-title {
    font-size: 1.5rem;
  }
  
  .header-text {
    font-size: 1.5rem;
  }
  
  /* 超小屏幕优化 */
  .main-content {
    padding: 15px 4px;
  }
  
  .sections-container {
    gap: 15px;
  }
 
  
  /* 超小屏幕可选择强制单列 
  .media-grid.force-single-column,
  .media-grid[data-force-mobile-single="true"] {
    grid-template-columns: 1fr !important;
  }
    */
  
  .media-grid.force-single-column .media-item,
  .media-grid[data-force-mobile-single="true"] .media-item {
    flex-basis: 100% !important;
    max-width: 100% !important;
  }
}

/* 移除可能冲突的CSS规则，让动态样式生效 */

/* 小红书风格的高宽比支持 */
.media-item[style*="aspect-ratio"] {
  /* 确保高宽比在1-2之间 */
  min-aspect-ratio: 1;
  max-aspect-ratio: 2;
}

/* 小红书风格的文字样式增强 */
.media-info .media-title,
.media-info .media-description {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* 大屏幕优化 */
@media (min-width: 1200px) {
  .main-content {
    max-width: 1400px;
  }
}

/* 支持更多列数的大屏幕 */
@media (min-width: 1600px) {
  .main-content {
    max-width: 1600px;
  }
}
</style> 