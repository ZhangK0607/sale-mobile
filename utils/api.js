/**
 * API接口封装
 */

import http, { upload } from './request.js'

// API接口地址
const API = {
  // 用户相关
  LOGIN: '/system/auth/login',
  REGISTER: '/user/register',
  USER_INFO: '/user/info',
  GET_TENANT_ID: '/system/tenant/get-id-by-name',
  
  // 文件上传
  UPLOAD_IMAGE: '/upload/image',
}

// 用户API
export const user = {
  // 获取租户ID（通过租户名）
  getTenantIdByName: (tenantName) => http('GET', `${API.GET_TENANT_ID}?name=${tenantName}`),
  
  // 用户登录
  login: (data) => http('POST', API.LOGIN, data),
  
  // 用户注册
  register: (data) => http('POST', API.REGISTER, data),
  
  // 获取用户信息
  getInfo: () => http('GET', API.USER_INFO),
  
  // 用户登出
  logout: () => http('POST', '/user/logout'),
}

// 字典数据API
export const dict = {
  // 获取字典数据
  getDictDataByType: (dictType) => http('GET', '/system/dict-data/getDiceDataByDictType', { dictType }),
  
  // 获取行业类型
  fetchProductTypes: (dictType) => http('GET', '/system/dict-data/getDiceDataByDictType', { dictType }),
}

// 产品相关API
export const product = {
  // 获取所有标签
  getAllLabels: () => http('GET', '/sale/product/getAllLabels', {}),
  
  // AI智能推荐产品接口
  fetchAIRecommendProducts: (data) => http('POST', '/sale/recommend/recommend', data),
  
  // 获取产品详情
  getProductDetail: (id) => http('GET', '/sale/product/detail', { id }),
  
  // 获取PPT图片
  fetchProductPptImages: (id) => http('GET', '/sale/product/findPics', { id }),
}

// 报价单相关API
export const quotation = {
  // 生成报价单
  createQuotation: (data) => http('POST', '/sale/recommend/createQuotation', data),
  // 下载报价单PDF
  downloadQuotationPdf: (orderNo) => http('GET', '/sale/recommend/downloadPdf', { orderNo }, { responseType: 'arraybuffer' }),
}

// PPT相关API
export const ppt = {
  // 生成PPT，返回图片URL数组
  generate: (products) => http('POST', '/sale/recommend/generatePPT', products),
  // 下载PPT（返回文件流）
  download: (data) => http('POST', '/sale/recommend/downloadPPT', data, { responseType: 'arraybuffer' }),
}

// 合同相关API
export const contract = {
  generate: (data) => http('POST', '/sale/recommend/generateContract', data),
}

// 文件上传API
export const file = {
  uploadImage: (filePath) => upload(API.UPLOAD_IMAGE, filePath),
}

// 默认导出
export default { user, dict, product, quotation, ppt, contract, file }

/**
 * 使用示例：
 * 
 * import api from '@/utils/api.js'
 * // 或者
 * import { user, file } from '@/utils/api.js'
 * 
 * // 登录
 * const res = await api.user.login({ username: 'admin', password: '123' })
 * uni.setStorageSync('token', res.data.token)
 * 
 * // 获取用户信息
 * const userInfo = await api.user.getInfo()
 * 
 * // 上传图片
 * const uploadRes = await api.file.uploadImage(filePath)
 */
