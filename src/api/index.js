import request from './request.js'

// API服务类
class ApiService {
  /**
   * GET请求
   * @param {string} url - 请求地址
   * @param {object} params - 查询参数
   * @param {object} config - 额外配置
   */
  get(url, params = {}, config = {}) {
    return request({
      method: 'GET',
      url,
      params,
      ...config
    })
  }

  /**
   * POST请求
   * @param {string} url - 请求地址
   * @param {object} data - 请求数据
   * @param {object} config - 额外配置
   */
  post(url, data = {}, config = {}) {
    return request({
      method: 'POST',
      url,
      data,
      ...config
    })
  }

  /**
   * PUT请求
   * @param {string} url - 请求地址
   * @param {object} data - 请求数据
   * @param {object} config - 额外配置
   */
  put(url, data = {}, config = {}) {
    return request({
      method: 'PUT',
      url,
      data,
      ...config
    })
  }

  /**
   * DELETE请求
   * @param {string} url - 请求地址
   * @param {object} config - 额外配置
   */
  delete(url, config = {}) {
    return request({
      method: 'DELETE',
      url,
      ...config
    })
  }

  /**
   * PATCH请求
   * @param {string} url - 请求地址
   * @param {object} data - 请求数据
   * @param {object} config - 额外配置
   */
  patch(url, data = {}, config = {}) {
    return request({
      method: 'PATCH',
      url,
      data,
      ...config
    })
  }

  /**
   * 上传文件
   * @param {string} url - 上传地址
   * @param {FormData} formData - 文件数据
   * @param {object} config - 额外配置
   */
  upload(url, formData, config = {}) {
    return request({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    })
  }
}

// 创建API服务实例
const api = new ApiService()

// 导出API服务实例和request实例
export { api, request }
export default api 