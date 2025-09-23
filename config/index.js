/**
 * 应用配置文件
 */

// API配置
export default {
  // 服务器地址
  BASE_URL: 'https://trial.jdyos.com:10202',
  
  // API前缀
  API_PREFIX: '/admin-api',
  
  // 完整API地址（自动拼接）
  get FULL_API_URL() {
    return this.BASE_URL + this.API_PREFIX
  }
}
