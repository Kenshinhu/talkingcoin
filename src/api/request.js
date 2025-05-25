import axios from 'axios'
import { API_CONFIG, getCurrentConfig } from './config.js'

// 创建axios实例
const request = axios.create({
  baseURL: getCurrentConfig().BASE_URL || API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    console.log('发送请求:', config.method?.toUpperCase(), config.url)
    
    // 可以在这里添加token等认证信息
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    // 对请求错误做些什么
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 2xx 范围内的状态码都会触发该函数
    console.log('响应成功:', response.status, response.config.url)
    
    // 可以在这里统一处理响应数据
    return response.data
  },
  (error) => {
    // 超出 2xx 范围的状态码都会触发该函数
    console.error('响应错误:', error.response?.status, error.config?.url)
    
    // 统一错误处理
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('token')
          // 这里可以添加路由跳转逻辑
          console.warn('用户未授权，请重新登录')
          break
        case 403:
          console.warn('访问被禁止')
          break
        case 404:
          console.warn('请求的资源不存在')
          break
        case 500:
          console.error('服务器内部错误')
          break
        default:
          console.error('请求失败:', error.response.data?.message || error.message)
      }
    } else if (error.request) {
      console.error('网络错误，请检查网络连接')
    } else {
      console.error('请求配置错误:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default request 