/**
 * uni-app 超简洁请求封装
 */

// 配置
const BASE_URL = 'https://demo.jdyos.com/admin-api' // 修改为你的API地址
const TIMEOUT = 10000

// 防止重复跳转登录页
let isNavigatingToLogin = false

/**
 * 统一的错误处理函数
 * @param {Object} errorData 错误数据
 * @param {Number} statusCode HTTP状态码
 */
function handleError(errorData, statusCode = 0) {
  const code = errorData.code || statusCode
  const message = errorData.message || errorData.msg || '请求失败'
  
  // 服务器异常
  if (code === -2) {
    uni.showToast({ 
      title: message || '服务器异常，请联系管理员', 
      icon: 'none',
      duration: 2000
    })
  } 
  // token失效处理
  else if (code === 5 || code === 401) {
    handleUnauthorized(message || '登录已失效，请重新登录')
  } 
  // 403 权限不足
  else if (code === 403) {
    uni.showToast({ 
      title: '您的请求被服务器拒绝！', 
      icon: 'none',
      duration: 2000
    })
  }
  // 其他错误
  else {
    uni.showToast({ 
      title: message || '服务器异常，请联系管理员', 
      icon: 'none',
      duration: 2000
    })
  }
  
  return Promise.reject(new Error(message))
}

/**
 * 处理401未授权错误
 * @param {String} message 提示信息
 */
function handleUnauthorized(message = '登录已过期，请重新登录') {
  // 防止重复跳转
  if (isNavigatingToLogin) return
  isNavigatingToLogin = true
  
  // 清除所有登录相关数据
  uni.removeStorageSync('accessToken')
  uni.removeStorageSync('userInfo')
  uni.removeStorageSync('openId')
  uni.removeStorageSync('tenant-id')
  
  // 显示提示
  uni.showToast({ 
    title: message, 
    icon: 'none',
    duration: 2000
  })
  
  // 延迟跳转，确保toast显示
  setTimeout(() => {
    uni.reLaunch({ 
      url: '/pages/login/login',
      success: () => {
        isNavigatingToLogin = false
      },
      fail: () => {
        isNavigatingToLogin = false
      }
    })
  }, 1500)
}

/**
 * 响应数据处理
 * @param {Object} res uni.request的响应对象
 * @param {Object} options 请求选项
 */
function handleResponse(res, options = {}) {
  // 处理文件下载响应 (arraybuffer)
  if (options.responseType === 'arraybuffer') {
    // 检查是否是错误响应（通常错误响应会在header中标识content-type为application/json）
    const contentType = res.header['content-type'] || res.header['Content-Type'] || ''
    
    if (contentType.includes('application/json')) {
      try {
        // 尝试将arraybuffer转为字符串解析错误信息
        const uint8Array = new Uint8Array(res.data)
        const jsonString = String.fromCharCode.apply(null, uint8Array)
        const errorData = JSON.parse(jsonString)
        
        // 如果解析成功且是错误响应，进行错误处理
        if (errorData.code !== 0) {
          return handleError(errorData)
        }
      } catch (e) {
        // 解析失败说明确实是文件数据，直接返回
        return Promise.resolve(res)
      }
    }
    
    // 确实是文件数据，直接返回
    return Promise.resolve(res)
  }
  
  // 处理正常的JSON响应
  const responseData = res.data
  
  // HTTP状态码错误
  if (res.statusCode === 401) {
    return handleError({ code: 401, message: '登录已超时，请重新登录' }, 401)
  } else if (res.statusCode === 403) {
    return handleError({ code: 403, message: '您的请求被服务器拒绝！' }, 403)
  } else if (res.statusCode !== 200) {
    return handleError({ 
      code: res.statusCode, 
      message: `请求失败 ${res.statusCode}` 
    }, res.statusCode)
  }
  
  // 业务逻辑错误
  if (responseData.code !== 0 && responseData.code !== 200) {
    return handleError(responseData)
  }
  
  // 成功响应，显示成功消息（如果有且不为'true'）
  if (responseData.message && responseData.message.toString() !== 'true') {
    uni.showToast({ 
      title: responseData.message, 
      icon: 'success',
      duration: 1500
    })
  }
  
  return Promise.resolve(responseData)
}

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
        
        // 使用统一的响应处理函数
        handleResponse(res, options)
          .then(resolve)
          .catch(reject)
      },
      fail: (err) => {
        uni.hideLoading()
        
        // 网络错误统一处理
        let message = '网络异常，请稍后再试'
        if (err.errMsg) {
          if (err.errMsg.includes('timeout')) {
            message = '请求超时，请检查网络连接'
          } else if (err.errMsg.includes('fail')) {
            message = '网络连接失败，请检查网络设置'
          }
        }
        
        uni.showToast({ 
          title: message, 
          icon: 'none',
          duration: 2000
        })
        
        reject(new Error(message))
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
  
  const token = uni.getStorageSync('accessToken')
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
          // 解析上传响应数据
          const data = JSON.parse(res.data)
          
          // 构造标准响应格式用于统一处理
          const standardResponse = {
            statusCode: res.statusCode,
            data: data,
            header: res.header
          }
          
          // 使用统一的响应处理函数
          handleResponse(standardResponse)
            .then((responseData) => resolve(responseData))
            .catch(reject)
            
        } catch (parseError) {
          // JSON解析失败
          const errorResponse = {
            statusCode: res.statusCode,
            data: { code: -1, message: '响应数据解析失败' },
            header: res.header
          }
          
          handleResponse(errorResponse)
            .then(resolve)
            .catch(reject)
        }
      },
      fail: (err) => {
        uni.hideLoading()
        
        // 上传网络错误处理
        let message = '上传失败，请稍后再试'
        if (err.errMsg) {
          if (err.errMsg.includes('timeout')) {
            message = '上传超时，请检查网络连接'
          } else if (err.errMsg.includes('fail')) {
            message = '上传失败，请检查网络设置'
          }
        }
        
        uni.showToast({ 
          title: message, 
          icon: 'none',
          duration: 2000
        })
        
        reject(new Error(message))
      }
    })
  })
}

// 导出
export default http
export { http, upload }
