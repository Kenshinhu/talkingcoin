<template>
  <div class="redirect-page" :style="pageStyle">
    <!-- Header -->
    <div v-if="headerSettings && Object.keys(headerSettings).length > 0"
         class="page-header"
         :style="headerStyle">
      <div class="header-content">
        <h1 v-if="headerSettings.text" class="header-text">{{ headerSettings.text }}</h1>
      </div>
    </div>

    <!-- Main Content -->
    <div class="redirect-content" :style="contentStyle">
      <!-- 重定向消息 -->
      <div class="redirect-message">
        <h2 v-if="redirectMessage.title" class="message-title">{{ redirectMessage.title }}</h2>
        <p v-if="redirectMessage.description" class="message-description">{{ redirectMessage.description }}</p>
      </div>

      <!-- 倒计时显示 -->
      <div v-if="showCountdown && countdown > 0" class="countdown-container">
        <div class="countdown-number">{{ countdown }}</div>
        <div class="countdown-label">秒后自动跳转</div>
      </div>

      <!-- 跳过按钮 -->
      <div v-if="allowSkip" class="skip-button-container">
        <button
          @click="redirectNow"
          class="skip-button"
          :style="skipButtonStyle"
        >
          {{ skipButton.text }}
        </button>
      </div>

      <!-- 加载动画 -->
      <div class="loading-spinner"></div>
    </div>

    <!-- Footer -->
    <div v-if="footerSettings && Object.keys(footerSettings).length > 0"
         class="page-footer"
         :style="footerStyle">
      <div class="footer-content">
        <p v-if="footerSettings.copyrightText" class="copyright">
          {{ footerSettings.copyrightText }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

export default {
  name: 'RedirectPage',
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
    }
  },
  setup(props) {
    const countdown = ref(props.contentData.delaySeconds || 3)
    const redirecting = ref(false)

    // 计算重定向相关配置
    const redirectMessage = computed(() => {
      return props.contentData.redirectMessage || {}
    })

    const showCountdown = computed(() => {
      return props.contentData.showCountdown !== false
    })

    const allowSkip = computed(() => {
      return props.contentData.allowSkip !== false
    })

    const skipButton = computed(() => {
      return props.contentData.skipButton || { text: '立即跳转' }
    })

    // 计算样式
    const pageStyle = computed(() => {
      const settings = props.styleSettings || {}
      return {
        fontFamily: settings.fontFamily || 'Arial, sans-serif',
        color: settings.primaryColor || '#333333'
      }
    })

    const headerStyle = computed(() => {
      const settings = props.headerSettings || {}
      return {
        backgroundColor: settings.backgroundColor || '#ffffff',
        color: settings.textColor || '#333333',
        textAlign: settings.textAlign || 'center',
        height: settings.height || '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: 'bold'
      }
    })

    const contentStyle = computed(() => {
      const backgroundColor = props.contentData.backgroundColor || '#f5f5f5'
      return {
        backgroundColor,
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }
    })

    const footerStyle = computed(() => {
      const settings = props.footerSettings || {}
      return {
        backgroundColor: settings.backgroundColor || '#f8f8f8',
        color: '#666666',
        padding: '20px',
        textAlign: 'center',
        fontSize: '14px'
      }
    })

    const skipButtonStyle = computed(() => {
      const button = props.contentData.skipButton || {}
      return {
        backgroundColor: button.backgroundColor || '#007bff',
        color: button.textColor || '#ffffff',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease'
      }
    })

    // 开始倒计时
    const startCountdown = () => {
      if (!showCountdown.value || redirecting.value) return

      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
          performRedirect()
        }
      }, 1000)
    }

    // 执行重定向
    const performRedirect = () => {
      if (redirecting.value) return

      redirecting.value = true
      const targetUrl = props.contentData.targetUrl

      if (targetUrl) {
        console.log('执行重定向到:', targetUrl)
        window.location.href = targetUrl
      }
    }

    // 立即重定向
    const redirectNow = () => {
      performRedirect()
    }

    onMounted(() => {
      console.log('RedirectPage 组件已加载:', props.name)
      console.log('重定向配置:', props.contentData)

      // 如果是立即重定向，立即执行
      if (props.contentData.redirectType === 'immediate') {
        performRedirect()
      } else {
        // 延迟重定向，开始倒计时
        startCountdown()
      }
    })

    onBeforeUnmount(() => {
      // 清除定时器等清理工作
    })

    return {
      countdown,
      redirectMessage,
      showCountdown,
      allowSkip,
      skipButton,
      pageStyle,
      headerStyle,
      contentStyle,
      footerStyle,
      skipButtonStyle,
      redirectNow
    }
  }
}
</script>

<style scoped>
.redirect-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-header {
  flex-shrink: 0;
}

.page-footer {
  flex-shrink: 0;
}

.redirect-content {
  flex: 1;
}

.redirect-message {
  text-align: center;
  margin-bottom: 40px;
}

.message-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333333;
}

.message-description {
  font-size: 16px;
  color: #666666;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto;
}

.countdown-container {
  text-align: center;
  margin-bottom: 30px;
}

.countdown-number {
  font-size: 48px;
  font-weight: bold;
  color: #ff6600;
  margin-bottom: 8px;
}

.countdown-label {
  font-size: 14px;
  color: #666666;
}

.skip-button-container {
  text-align: center;
}

.skip-button {
  min-width: 120px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.skip-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .redirect-content {
    padding: 20px 15px;
  }

  .message-title {
    font-size: 20px;
  }

  .message-description {
    font-size: 14px;
  }

  .countdown-number {
    font-size: 36px;
  }

  .skip-button {
    padding: 10px 20px;
    font-size: 14px;
  }
}
</style>
