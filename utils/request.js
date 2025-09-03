/**
 * uni-app 超简洁请求封装
 */

// 配置
const BASE_URL = 'https://demo.jdyos.com/admin-api' // 修改为你的API地址
const TIMEOUT = 10000

/**
 * 统一请求方法
 * @param {String} method 请求方法
 * @param {String} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 额外配置
 */
function http(method = 'GET', url = '', data = {}, options = {}) {
  // 显示loading
  uni.showLoading({ title: '加载中...', mask: true })
  
  // 获取token和tenant-id
  const accessToken = uni.getStorageSync('accessToken')
  const tenantId = uni.getStorageSync('tenant-id')
  
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      method: method.toUpperCase(),
      data,
      timeout: TIMEOUT,
      responseType: options.responseType || undefined,
      header: {
        'Content-Type': 'application/json',
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        'tenant-id': tenantId || '',
        ...options.header
      },
      success: (res) => {
        uni.hideLoading()
        
        if (options.responseType === 'arraybuffer') {
          // 文件流等非JSON响应，直接返回数据
          resolve(res)
          return
        }

        if (res.statusCode === 200) {
          // 成功
          if (res.data.code === 0 || res.data.code === 200) {
            resolve(res.data)
          } else {
            // 业务错误
            uni.showToast({ title: res.data.message || '请求失败', icon: 'none' })
            reject(res.data)
          }
        } else if (res.statusCode === 401) {
          // 未授权
          uni.removeStorageSync('token')
          uni.showToast({ title: '请重新登录', icon: 'none' })
          setTimeout(() => uni.reLaunch({ url: '/pages/login/login' }), 1500)
          reject(res)
        } else {
          // 其他错误
          uni.showToast({ title: `请求失败 ${res.statusCode}`, icon: 'none' })
          reject(res)
        }
      },
      fail: (err) => {
        uni.hideLoading()
        uni.showToast({ title: '网络异常', icon: 'none' })
        reject(err)
      }
    })
  })
}

/**
 * 文件上传
 * @param {String} url 上传地址
 * @param {String} filePath 文件路径
 * @param {Object} formData 表单数据
 */
function upload(url, filePath, formData = {}) {
  uni.showLoading({ title: '上传中...', mask: true })
  
  const token = uni.getStorageSync('token')
  const tenantId = uni.getStorageSync('tenant-id')
  
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: BASE_URL + url,
      filePath,
      name: 'file',
      formData,
      header: { 
        'Authorization': token ? `Bearer ${token}` : '',
        'tenant-id': tenantId || ''
      },
      success: (res) => {
        uni.hideLoading()
        try {
          const data = JSON.parse(res.data)
          if (data.code === 0 || data.code === 200) {
            resolve(data)
          } else {
            uni.showToast({ title: data.message || '上传失败', icon: 'none' })
            reject(data)
          }
        } catch (error) {
          uni.showToast({ title: '上传失败', icon: 'none' })
          reject(error)
        }
      },
      fail: (err) => {
        uni.hideLoading()
        uni.showToast({ title: '上传失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

// 导出
export default http
export { http, upload }
