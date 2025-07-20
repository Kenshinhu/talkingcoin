<template>
  <div class="mixed-page">
    <!-- 页面头部 -->
    <div class="header-container" v-if="headerSettings && Object.keys(headerSettings).length > 0" >
      <div class="page-header"
          :style="headerStyle">
        <h1 class="header-text" :style="headerTextStyle">
          {{ headerSettings.text || name }}
        </h1>
        <!-- 页面头部背景图片 -->
      </div>
      <div class="header-background-image-container">
        <img 
          v-if="headerSettings.file && headerSettings.file.filePath"
          :src="headerSettings.file.filePath" 
          :alt="headerSettings.text || name"
          class="header-background-image"
        />
      </div>
    </div>
    

    <!-- Banner 区域 -->
    <div v-if="bannerItems && bannerItems.length > 0" class="banner-section">
      <swiper
        :modules="modules"
        :slides-per-view="1"
        :space-between="0"
        :loop="bannerItems.length > 1"
        :autoplay="false"
        :pagination="bannerItems.length > 1 ? { clickable: true } : false"
        :navigation="bannerItems.length > 1"
        class="banner-swiper"
      >
        <swiper-slide v-for="(banner, index) in bannerItems" :key="banner.id" class="banner-slide">
          <div class="banner-item">
            <img 
              v-if="banner.mediaType === 'image'"
              :src="banner.file.filePath" 
              :alt="banner.title || banner.description"
              class="banner-media"
            />
            <!-- 视频播放器 -->
            <div v-else-if="banner.mediaType === 'video'" class="banner-video-container" @click.stop="togglePlay(index)">
              <video 
                :ref="el => setVideoRef(el, index)"
                :src="banner.file.filePath"
                class="banner-media" 
                loop
                playsinline
                webkit-playsinline="true"
                x5-playsinline="true"
                x-webkit-airplay="allow"
                x5-video-player-type="h5"
                x5-video-player-fullscreen="true"
                @loadedmetadata="initVideoState(index)"
                @play="onVideoPlay(index)"
                @pause="onVideoPause(index)"
              />
              
              <!-- 视频遮罩层 -->
              <div class="video-overlay"></div>
              
              <!-- 中央播放/暂停切换按钮 -->
              <div class="video-play-button" v-if="!getVideoState(index, 'isPlaying')">
                <!-- 播放图标 -->
                <button class="play-btn">
                  <svg v-if="!getVideoState(index, 'isPlaying')" xmlns="http://www.w3.org/2000/svg" class="play-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                    <!-- 暂停图标 -->
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="play-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
              </div>

              <!-- 控制按钮 -->
              <div class="video-controls">
                <div class="controls-container">
                  <button v-if="getVideoState(index, 'isPlaying')" @click.stop="togglePlay(index)" class="control-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" class="control-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button @click.stop="toggleFullscreen(index)" class="control-btn">
                    <svg v-if="!getVideoState(index, 'isFullscreen')" xmlns="http://www.w3.org/2000/svg" class="control-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="control-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div v-if="banner.title || banner.description" class="banner-overlay">
              <h2 v-if="banner.title" class="banner-title">{{ banner.title }}</h2>
              <p v-if="banner.description" class="banner-description">{{ banner.description }}</p>
            </div>
          </div>
        </swiper-slide>
      </swiper>
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
                 @click="handleMediaClick(media)"
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
        <!-- 动态链接渲染 -->
        <div v-if="footerSettings.links && footerSettings.links.length > 0" class="footer-links">
          <template v-for="link in footerSettings.links" :key="link.text">
            <!-- Web链接 -->
            <a v-if="link.type === 'web'" 
               :href="link.url" 
               rel="noopener noreferrer"
               class="footer-link">
              {{ link.text }}
            </a>
            <!-- 电话链接 -->
            <a v-else-if="link.type === 'phone'" 
               :href="`tel:${link.url}`" 
               class="footer-link">
              {{ link.text }}
            </a>
            <!-- 邮箱链接 -->
            <a v-else-if="link.type === 'email'" 
               :href="`mailto:${link.url}`" 
               class="footer-link">
              {{ link.text }}
            </a>
            <!-- 其他类型链接 -->
            <a v-else 
               :href="link.url" 
               class="footer-link">
              {{ link.text }}
            </a>
          </template>
        </div>
        
        <p v-if="footerSettings.copyrightText" class="copyright">
          {{ footerSettings.copyrightText }}
        </p> 
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export default {
  name: 'MixedPage',
  components: {
    Swiper,
    SwiperSlide,
  },
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
    // Swiper 模块
    const modules = [Navigation, Pagination, Autoplay]
    
    // 视频引用和状态管理
    const videoRefs = ref({})
    const videoStates = reactive({})
    const isIOS = ref(false)

 

    // 初始化视频状态
    const initVideoState = (index) => {
      if (!videoStates[index]) {
        videoStates[index] = {
          isPlaying: false,
          isFullscreen: false
        }
      }
    }

    // 获取视频状态的安全方法
    const getVideoState = (index, property) => {
      return videoStates[index]?.[property] || false
    }

    // 设置视频引用
    const setVideoRef = (el, index) => {
      if (el) {
        videoRefs.value[index] = el
        initVideoState(index)
        
        // 添加视频事件监听
        nextTick(() => {
          const video = videoRefs.value[index]
          if (video) {
            // 监听iOS设备的全屏事件
            video.addEventListener('webkitbeginfullscreen', () => {
              videoStates[index].isFullscreen = true
            })
            video.addEventListener('webkitendfullscreen', () => {
              videoStates[index].isFullscreen = false
            })
          }
        })
      }
    }

    // 视频播放事件处理
    const onVideoPlay = (index) => {
      if (videoStates[index]) {
        videoStates[index].isPlaying = true
      }
    }

    // 视频暂停事件处理
    const onVideoPause = (index) => {
      if (videoStates[index]) {
        videoStates[index].isPlaying = false
      }
    }

    // 切换播放状态
    const togglePlay = (index) => {
      console.log('togglePlay called with index:', index) // 调试日志
      const video = videoRefs.value[index]
      if (video) {
        try {
          if (videoStates[index]?.isPlaying) {
            video.pause()
          } else {
            video.play().catch(error => {
              console.error('Video play failed:', error)
            })
          }
        } catch (error) {
          console.error('Toggle play error:', error)
        }
      } else {
        console.error('Video element not found for index:', index)
      }
    }

    // 切换全屏
    const toggleFullscreen = (index) => {
      console.log('toggleFullscreen called with index:', index) // 调试日志
      const video = videoRefs.value[index]
      if (!video) {
        console.error('Video element not found for fullscreen toggle')
        return
      }

      try {
        // 检测是否是iOS设备
        if (isIOS.value) {
          handleIOSFullscreen(video, index)
          return
        }

        // 桌面浏览器标准全屏API
        if (!document.fullscreenElement) {
          if (video.requestFullscreen) {
            video.requestFullscreen()
          } else if (video.webkitRequestFullscreen) { /* Safari */
            video.webkitRequestFullscreen()
          } else if (video.msRequestFullscreen) { /* IE11 */
            video.msRequestFullscreen()
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen()
          } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen()
          } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen()
          }
        }
      } catch (error) {
        console.error('Fullscreen toggle error:', error)
      }
    }

    // iOS全屏处理
    const handleIOSFullscreen = (video, index) => {
      try {
        if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen()
        } else if (video.webkitSupportsFullscreen && video.webkitEnterFullScreen) {
          video.webkitEnterFullScreen()
        } else {
          video.play()
          alert('请点击视频进入全屏模式或使用系统全屏按钮')
        }
      } catch (error) {
        console.error('iOS fullscreen error:', error)
      }
    }

    // 全屏变化处理
    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement || 
        document.msFullscreenElement
      )
      
      // 更新所有视频的全屏状态
      Object.keys(videoStates).forEach(index => {
        if (videoStates[index]) {
          videoStates[index].isFullscreen = isFullscreen
        }
      })
    }

    // 检测iOS设备
    const detectIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase()
      isIOS.value = /iphone|ipad|ipod/.test(userAgent) || 
        (userAgent.includes('mac') && 'ontouchend' in document)
    }

    // 计算banner项目
    const bannerItems = computed(() => {
      return props.contentData.bannerMediaItemsData || []
    })

    // 计算头部样式
    const headerStyle = computed(() => {
      const settings = props.headerSettings
      return {
        height: settings.height || 'auto',
        minHeight: '50px',
        marginTop: settings.marginTop || '0',
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
          // 移除 aspectRatio，让内容自然高度
          minWidth: 0
        }
      } else if (layout === 'grid') {
        return {
          ...baseStyle,
          width: '100%',
          // 移除 aspectRatio，让内容自然高度
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
        ...baseStyle
        // 移除 aspectRatio，让内容自然高度
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

    // 瀑布流布局函数
    const initMasonryLayout = () => {
      nextTick(() => {
        const masonryGrids = document.querySelectorAll('.media-grid[style*="display: grid"]')
        
        masonryGrids.forEach(grid => {
          const items = grid.querySelectorAll('.media-item')
          const columnCount = getComputedStyle(grid).gridTemplateColumns.split(' ').length
          const gap = parseFloat(getComputedStyle(grid).gap) || 4
          
          // 如果浏览器不支持CSS Grid masonry，使用JavaScript实现
          if (!CSS.supports('grid-template-rows', 'masonry')) {
            applyMasonryLayout(grid, items, columnCount, gap)
          }
        })
      })
    }

    // JavaScript瀑布流布局实现
    const applyMasonryLayout = (grid, items, columnCount, gap) => {
      // 创建列高度数组
      const columnHeights = new Array(columnCount).fill(0)
      
      // 重置grid为相对定位
      grid.style.position = 'relative'
      grid.style.height = 'auto'
      
      items.forEach((item, index) => {
        // 找到最短的列
        const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))
        
        // 计算项目位置
        const itemWidth = (grid.offsetWidth - gap * (columnCount - 1)) / columnCount
        const left = shortestColumnIndex * (itemWidth + gap)
        const top = columnHeights[shortestColumnIndex]
        
        // 设置项目位置
        item.style.position = 'absolute'
        item.style.left = `${left}px`
        item.style.top = `${top}px`
        item.style.width = `${itemWidth}px`
        
        // 更新列高度
        columnHeights[shortestColumnIndex] += item.offsetHeight + gap
      })
      
      // 设置容器高度
      grid.style.height = `${Math.max(...columnHeights)}px`
    }

    // 等待图片加载完成后重新布局
    const waitForImagesAndLayout = () => {
      nextTick(() => {
        const images = document.querySelectorAll('.media-grid .media-image')
        let loadedCount = 0
        const totalImages = images.length
        
        if (totalImages === 0) {
          initMasonryLayout()
          return
        }
        
        const checkAllLoaded = () => {
          loadedCount++
          if (loadedCount === totalImages) {
            initMasonryLayout()
          }
        }
        
        images.forEach(img => {
          if (img.complete) {
            checkAllLoaded()
          } else {
            img.addEventListener('load', checkAllLoaded)
            img.addEventListener('error', checkAllLoaded)
          }
        })
      })
    }

    // 响应式重新布局
    const handleResize = () => {
      initMasonryLayout()
    }

    onMounted(() => {
      // 检测iOS设备
      detectIOS()
      
      // 等待图片加载完成后初始化瀑布流布局
      waitForImagesAndLayout()
      
      // 添加窗口大小变化监听
      window.addEventListener('resize', handleResize)
      
      // 添加全屏变化事件监听
      document.addEventListener('fullscreenchange', handleFullscreenChange)
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.addEventListener('mozfullscreenchange', handleFullscreenChange)
      document.addEventListener('MSFullscreenChange', handleFullscreenChange)
    })

    onUnmounted(() => {
      // 清理窗口大小变化监听
      window.removeEventListener('resize', handleResize)
      
      // 清理全屏变化事件监听
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    })

       // 媒体点击事件处理
    const handleMediaClick = (media) => { 
      // log media value
      // check linkedContentId is not null, if not null redirect to linkedContentId
      if (media.linkedContentId) {
        window.location.href = '/page/' + media.linkedContentId + '?mediaId=' + media.id
      }
    }

    return {
      modules,
      bannerItems,
      videoRefs,
      videoStates,
      setVideoRef,
      initVideoState,
      getVideoState,
      onVideoPlay,
      onVideoPause,
      togglePlay,
      toggleFullscreen,
      headerStyle,
      headerTextStyle,
      footerStyle,
      sectionsContainerStyle,
      getSectionStyle,
      getMediaGridStyle,
      getMediaItemStyle,
      debugSectionConfig,
      mediaGridStyle,
      mediaItemStyle,
      handleMediaClick
    }
  }
}
</script>

<style scoped>
.mixed-page {
  min-height: 100vh;
  background-color: #fff;
}
 

.header-background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 页面头部样式 */
.page-header {
  @apply flex flex-col items-center justify-center;
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
  background-color: #000; /* 添加黑色背景 */
}

.banner-swiper {
  width: 100%;
  height: calc(100vw * 0.5625);
  background-color: #000; /* 添加黑色背景 */
}

.banner-slide {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #000; /* 添加黑色背景 */
}

.banner-item {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #000; /* 添加黑色背景 */
}

.banner-media {
  width: 100%;
  height: 100%;
  object-fit: contain;
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
  /* 最多显示两行 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.banner-description {
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  /* 最多显示两行 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

/* Swiper 自定义样式 */
.banner-swiper :deep(.swiper-button-next),
.banner-swiper :deep(.swiper-button-prev) {
  color: white;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  margin-top: -22px;
  transition: all 0.3s ease;
}

.banner-swiper :deep(.swiper-button-next):hover,
.banner-swiper :deep(.swiper-button-prev):hover {
  background: rgba(0, 0, 0, 0.5);
  transform: scale(1.1);
}

.banner-swiper :deep(.swiper-button-next::after),
.banner-swiper :deep(.swiper-button-prev::after) {
  font-size: 18px;
  font-weight: bold;
}

.banner-swiper :deep(.swiper-pagination) {
  bottom: 20px;
}

.banner-swiper :deep(.swiper-pagination-bullet) {
  background: rgba(255, 255, 255, 0.5);
  opacity: 1;
  width: 12px;
  height: 12px;
  margin: 0 6px;
  transition: all 0.3s ease;
}

.banner-swiper :deep(.swiper-pagination-bullet-active) {
  background: white;
  transform: scale(1.2);
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

/* Grid布局样式 - 瀑布流效果 */
.media-grid[style*="display: grid"] {
  align-items: start;
  /* 使用CSS Grid的瀑布流布局 */
  grid-auto-rows: min-content;
  /* 优化网格项目的放置算法 */
  grid-auto-flow: row dense;
  /* 添加更细粒度的行控制 */
  grid-template-rows: masonry;
}

/* 对于不支持masonry的浏览器，使用JavaScript瀑布流 */
@supports not (grid-template-rows: masonry) {
  .media-grid[style*="display: grid"] {
    /* 保持原有的grid布局作为fallback */
    display: grid;
    align-items: start;
    /* 在JavaScript接管之前提供基本的网格布局 */
    grid-auto-rows: min-content;
    grid-auto-flow: row dense;
  }
  
  .media-grid[style*="display: grid"] .media-item {
    /* JavaScript瀑布流布局会覆盖这些样式 */
    width: 100%;
    min-width: 0;
    height: auto;
    align-self: start;
    /* 确保在JavaScript布局之前有合理的显示 */
    margin-bottom: 0;
    break-inside: avoid;
  }
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
  /* 确保项目高度自适应内容 */
  height: fit-content;
}

/* Grid布局下的媒体项目 - 瀑布流优化 */
.media-grid[style*="display: grid"] .media-item {
  width: 100%;
  min-width: 0;
  /* 移除固定高度，让内容自然流动 */
  height: auto;
  /* 确保项目能够紧密排列 */
  align-self: start;
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
  font-size: 1.0rem;
  font-weight: 500;
  margin: 0 0 2px 0;
  line-height: 1.5;
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
  padding: 10px 20px;
  border-top: 1px solid #eee;
  margin-top: 20px;
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
  .banner-swiper {
    height: calc(100vw * 0.5625);
  }
  
  .banner-title {
    font-size: 1.8rem;
  }
  
  .banner-description {
    font-size: 1rem;
  }
  
  .main-content {
    padding: 10px 4px;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  /* Footer responsive styles */
  .footer-links {
    gap: 2px;
    margin-bottom: 5px;
  }
  
  .footer-link {
    font-size: 0.85rem;
    padding: 6px 10px;
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
  
  /* 移动端 Swiper 按钮优化 */
  .banner-swiper :deep(.swiper-button-next),
  .banner-swiper :deep(.swiper-button-prev) {
    width: 36px;
    height: 36px;
    margin-top: -18px;
  }
  
  .banner-swiper :deep(.swiper-button-next::after),
  .banner-swiper :deep(.swiper-button-prev::after) {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  
  .banner-title {
    font-size: 1.5rem;
  }
  
  .header-text {
    font-size: 1.5rem;
  }
  
  /* 超小屏幕优化 */
  .main-content {
    padding: 10px 4px;
  }
  
  .sections-container {
    gap: 15px;
  }
  
  /* 超小屏幕 Swiper 按钮优化 */
  .banner-swiper :deep(.swiper-button-next),
  .banner-swiper :deep(.swiper-button-prev) {
    width: 32px;
    height: 32px;
    margin-top: -16px;
  }
  
  .banner-swiper :deep(.swiper-pagination-bullet) {
    width: 8px;
    height: 8px;
    margin: 0 4px;
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

/* 视频容器样式 */
.banner-video-container {
  position: relative;
  width: 100%;
  height: 100%;
  /* 确保视频容器有足够高的层级 */
  z-index: 1;
}

/* 视频遮罩层 */
.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 2;
  pointer-events: none;
}

/* 中央播放按钮 - 提高z-index */
.video-play-button {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100; /* 提高到100，确保高于swiper分页器 */
  pointer-events: none;
}

.play-btn {
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: auto;
  /* 添加重要性声明确保样式生效 */
  position: relative !important;
  z-index: 101 !important;
}

.play-btn:hover {
  background: rgba(0, 0, 0, 0.5);
  transform: scale(1.1);
}

.play-icon {
  width: 3rem;
  height: 3rem;
}

/* 控制按钮区域 - 提高z-index */
.video-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
  padding: 1rem;
  z-index: 100; /* 提高到100，确保高于swiper分页器 */
  pointer-events: none;
}

.controls-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  pointer-events: auto;
  /* 确保容器有足够的层级 */
  position: relative;
  z-index: 101;
}

.control-btn {
  padding: 0.5rem;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  /* 添加重要性声明确保按钮可点击 */
  position: relative !important;
  z-index: 102 !important;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.control-icon {
  width: 1.5rem;
  height: 1.5rem;
}

/* 专门针对Swiper分页器的样式覆盖 */
.banner-swiper :deep(.swiper-pagination) {
  z-index: 50 !important; /* 降低分页器的z-index */
  bottom: 20px !important;
}

.banner-swiper :deep(.swiper-pagination-bullet) {
  background: rgba(255, 255, 255, 0.5);
  opacity: 1;
  width: 12px;
  height: 12px;
  margin: 0 6px;
  transition: all 0.3s ease;
  z-index: 51 !important;
}

.banner-swiper :deep(.swiper-pagination-bullet-active) {
  background: white;
  transform: scale(1.2);
}

/* 确保Swiper导航按钮也不会干扰视频控制 */
.banner-swiper :deep(.swiper-button-next),
.banner-swiper :deep(.swiper-button-prev) {
  color: white;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  margin-top: -22px;
  transition: all 0.3s ease;
  z-index: 60 !important; /* 设置适中的z-index */
}

.banner-swiper :deep(.swiper-button-next):hover,
.banner-swiper :deep(.swiper-button-prev):hover {
  background: rgba(0, 0, 0, 0.5);
  transform: scale(1.1);
}

.banner-swiper :deep(.swiper-button-next::after),
.banner-swiper :deep(.swiper-button-prev::after) {
  font-size: 18px;
  font-weight: bold;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .play-icon {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .control-icon {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .control-btn {
    padding: 0.4rem;
  }
  
  /* 移动端分页器位置调整 */
  .banner-swiper :deep(.swiper-pagination) {
    bottom: 15px !important;
  }
  
  /* 移动端导航按钮优化 */
  .banner-swiper :deep(.swiper-button-next),
  .banner-swiper :deep(.swiper-button-prev) {
    width: 36px;
    height: 36px;
    margin-top: -18px;
  }
  
  .banner-swiper :deep(.swiper-button-next::after),
  .banner-swiper :deep(.swiper-button-prev::after) {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .play-icon {
    width: 2rem;
    height: 2rem;
  }
  
  .play-btn {
    padding: 0.75rem;
  }
  
  /* 超小屏幕分页器优化 */
  .banner-swiper :deep(.swiper-pagination-bullet) {
    width: 8px;
    height: 8px;
    margin: 0 4px;
  }
  
  /* 超小屏幕导航按钮优化 */
  .banner-swiper :deep(.swiper-button-next),
  .banner-swiper :deep(.swiper-button-prev) {
    width: 32px;
    height: 32px;
    margin-top: -16px;
  }
}

/* 确保视频控制按钮在所有情况下都可点击 */
.banner-video-container .play-btn,
.banner-video-container .control-btn {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  touch-action: manipulation;
}
</style> 