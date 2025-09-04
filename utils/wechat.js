/**
 * 微信小程序API封装
 * 包含登录、注册、分享等微信相关功能
 */

import http from './request.js'

// 微信小程序配置
const WECHAT_CONFIG = {
  appId: 'wx88dfc93573be519b',
  appSecret: '92e55a2a165dee25a79fa8c12338b053'
}

// 微信相关API接口
const WECHAT_API = {
  WX_LOGIN: '/wechat/login',           // 微信登录
  WX_GET_USER_INFO: '/wechat/userinfo', // 获取微信用户信息  
  WX_REGISTER: '/wechat/register',      // 微信注册
  WX_BIND_PHONE: '/wechat/bind-phone'   // 绑定手机号
}

/**
 * 微信登录工具类
 */
class WechatAuth {
  /**
   * 获取微信登录code
   */
  static getWxCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            resolve(res.code)
          } else {
            reject(new Error('获取微信登录code失败'))
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }

  /**
   * 获取微信用户信息
   */
  static getWxUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          resolve(res.userInfo)
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }

  /**
   * 微信授权登录
   * @returns {Promise} 返回登录结果
   */
  static async wxLogin() {
    try {
      // 1. 获取微信登录code
      const code = await this.getWxCode()
      
      // 2. 发送code到后端进行登录
      const loginData = {
        code: code,
        appId: WECHAT_CONFIG.appId
      }
      
      const res = await http('POST', WECHAT_API.WX_LOGIN, loginData)
      
      if (res.data) {
        // 保存登录信息
        const { token, userInfo, openId } = res.data
        
        if (token) {
          uni.setStorageSync('accessToken', token)
        }
        if (openId) {
          uni.setStorageSync('openId', openId)
        }
        if (userInfo) {
          uni.setStorageSync('userInfo', userInfo)
        }
        
        return res.data
      }
      
      throw new Error('登录失败')
    } catch (error) {
      console.error('微信登录失败:', error)
      throw error
    }
  }

  /**
   * 微信用户注册
   * @param {Object} userProfile 微信用户资料
   * @returns {Promise} 返回注册结果
   */
  static async wxRegister(userProfile = null) {
    try {
      // 1. 获取微信登录code
      const code = await this.getWxCode()
      
      // 2. 如果没有传入用户资料，则获取
      let wxUserInfo = userProfile
      if (!wxUserInfo) {
        wxUserInfo = await this.getWxUserProfile()
      }
      
      // 3. 构建注册数据
      const registerData = {
        code: code,
        appId: WECHAT_CONFIG.appId,
        nickName: wxUserInfo.nickName,
        avatarUrl: wxUserInfo.avatarUrl,
        gender: wxUserInfo.gender,
        city: wxUserInfo.city,
        province: wxUserInfo.province,
        country: wxUserInfo.country
      }
      
      // 4. 发送注册请求
      const res = await http('POST', WECHAT_API.WX_REGISTER, registerData)
      
      if (res.data) {
        const { token, userInfo, openId } = res.data
        
        // 保存用户信息
        if (token) {
          uni.setStorageSync('accessToken', token)
        }
        if (openId) {
          uni.setStorageSync('openId', openId)
        }
        if (userInfo) {
          uni.setStorageSync('userInfo', userInfo)
        }
        
        return res.data
      }
      
      throw new Error('注册失败')
    } catch (error) {
      console.error('微信注册失败:', error)
      throw error
    }
  }

  /**
   * 检查登录状态
   */
  static checkLoginStatus() {
    const token = uni.getStorageSync('accessToken')
    const openId = uni.getStorageSync('openId')
    
    return !!(token && openId)
  }

  /**
   * 退出登录
   */
  static logout() {
    uni.removeStorageSync('accessToken')
    uni.removeStorageSync('openId')
    uni.removeStorageSync('userInfo')
    
    // 跳转到登录页
    uni.reLaunch({
      url: '/pages/login/login'
    })
  }
}

/**
 * 微信分享工具类
 */
class WechatShare {
  /**
   * 分享给朋友
   * @param {Object} options 分享配置
   */
  static shareToFriend(options = {}) {
    const { 
      title = '销售助手', 
      path = '/pages/index/index',
      imageUrl = ''
    } = options
    
    return {
      title,
      path,
      imageUrl
    }
  }

  /**
   * 分享到朋友圈
   * @param {Object} options 分享配置  
   */
  static shareToTimeline(options = {}) {
    const {
      title = '销售助手',
      query = '',
      imageUrl = ''
    } = options
    
    return {
      title,
      query,
      imageUrl
    }
  }

  /**
   * 生成小程序码
   * @param {Object} params 参数
   */
  static async generateQRCode(params = {}) {
    try {
      const data = {
        scene: params.scene || '',
        page: params.page || 'pages/index/index',
        width: params.width || 430,
        ...params
      }
      
      const res = await http('POST', '/wechat/qrcode', data)
      return res.data
    } catch (error) {
      console.error('生成小程序码失败:', error)
      throw error
    }
  }
}

/**
 * 微信支付工具类（预留）
 */
class WechatPay {
  /**
   * 发起微信支付
   * @param {Object} paymentData 支付数据
   */
  static async wxPay(paymentData) {
    try {
      // 调用后端获取支付参数
      const res = await http('POST', '/wechat/pay', paymentData)
      const { timeStamp, nonceStr, package: packageValue, signType, paySign } = res.data
      
      return new Promise((resolve, reject) => {
        wx.requestPayment({
          timeStamp,
          nonceStr,
          package: packageValue,
          signType,
          paySign,
          success: (result) => {
            resolve(result)
          },
          fail: (error) => {
            reject(error)
          }
        })
      })
    } catch (error) {
      console.error('微信支付失败:', error)
      throw error
    }
  }
}

// 微信API对象
export const wechat = {
  // 配置
  config: WECHAT_CONFIG,
  
  // 认证相关
  auth: WechatAuth,
  
  // 登录
  login: WechatAuth.wxLogin,
  
  // 注册
  register: WechatAuth.wxRegister,
  
  // 检查登录状态
  checkLogin: WechatAuth.checkLoginStatus,
  
  // 退出登录
  logout: WechatAuth.logout,
  
  // 分享相关
  share: WechatShare,
  
  // 支付相关（预留）
  pay: WechatPay,
  
  // 获取用户信息
  getUserInfo: () => http('GET', WECHAT_API.WX_GET_USER_INFO),
  
  // 绑定手机号
  bindPhone: (data) => http('POST', WECHAT_API.WX_BIND_PHONE, data)
}

// 默认导出
export default wechat

/**
 * 使用示例：
 * 
 * import wechat from '@/utils/wechat.js'
 * 
 * // 微信登录
 * try {
 *   const result = await wechat.login()
 *   console.log('登录成功:', result)
 * } catch (error) {
 *   console.error('登录失败:', error)
 * }
 * 
 * // 微信注册
 * try {
 *   const result = await wechat.register()
 *   console.log('注册成功:', result)
 * } catch (error) {
 *   console.error('注册失败:', error)
 * }
 * 
 * // 检查登录状态
 * if (wechat.checkLogin()) {
 *   console.log('用户已登录')
 * }
 * 
 * // 分享配置
 * export default {
 *   onShareAppMessage() {
 *     return wechat.share.shareToFriend({
 *       title: '我的产品推荐',
 *       path: '/subpages/product/detail?id=123'
 *     })
 *   }
 * }
 */

