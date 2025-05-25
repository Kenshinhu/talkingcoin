// API配置文件
export const API_CONFIG = {
  // 默认API地址
  BASE_URL: 'http://127.0.0.1:3000',
  
  // 请求超时时间（毫秒）
  TIMEOUT: 10000,
  
  // 默认请求头
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

// 环境配置
export const ENV_CONFIG = {
  development: {
    BASE_URL: 'http://127.0.0.1:3000'
  },
  production: {
    BASE_URL: 'https://m.talkingcoin.cn/'
  }
}

// 获取当前环境的配置
export const getCurrentConfig = () => {
  const env = import.meta.env.MODE || 'development'
  return ENV_CONFIG[env] || ENV_CONFIG.development
} 