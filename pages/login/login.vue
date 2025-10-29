<template>
  <view class="login-container">
    <!-- 检查登录状态loading -->
    <!-- <view v-if="isCheckingLogin" class="checking-loading">
      <u-loading-icon mode="spinner" size="40" color="#007aff"></u-loading-icon>
      <text class="checking-text">检查登录状态中...</text>
    </view> -->
    
      <!-- 顶部标题和图标 -->
      <view class="logo">
        <u-image 
          :src="'/static/logo.png'" 
          width="200rpx" 
          height="200rpx" 
          shape="circle"
          :show-loading="false"
          :show-error="false"
        ></u-image>
      </view>
      
      <!-- 登录表单 -->
      <view class="form-container">
      <u-form 
        :model="formData" 
        :rules="rules" 
        ref="loginForm"
        label-position="top"
        label-width="auto"
      >
        <!-- 企业唯一ID -->
        <u-form-item label="企业唯一ID" prop="tenantName" class="form-item">
          <view class="extend-class" @tap="handleWrapTap('tenantName')">
            <input 
              v-model="formData.tenantName" 
              :disabled="inputStates.tenantName.disabled"
              :focus="inputStates.tenantName.focus"
              placeholder="请输入企业唯一ID"
              placeholder-class="title_input"
              cursor-color="#007aff"
              @input="onInput($event, 'tenantName')"
              @blur="onBlur($event, 'tenantName')"
              class="uni-input"
            />
          </view>
        </u-form-item>
        
        <!-- 用户名 -->
        <u-form-item label="用户名" prop="username" class="form-item">
          <view class="extend-class" @tap="handleWrapTap('username')">
            <input 
              v-model="formData.username" 
              :disabled="inputStates.username.disabled"
              :focus="inputStates.username.focus"
              placeholder="请输入用户名"
              placeholder-class="title_input"
              cursor-color="#007aff"
              @input="onInput($event, 'username')"
              @blur="onBlur($event, 'username')"
              class="uni-input"
            />
          </view>
        </u-form-item>
        
            <!-- 密码 -->
        <u-form-item label="密码" prop="password" class="form-item">
          <view class="extend-class password-wrapper" @tap="handleWrapTap('password')">
            <input 
              v-model="formData.password" 
              :disabled="inputStates.password.disabled"
              :focus="inputStates.password.focus"
              :password="!showPassword"
              placeholder="请输入密码"
              placeholder-class="title_input"
              cursor-color="#007aff"
              @input="onInput($event, 'password')"
              @blur="onBlur($event, 'password')"
              class="uni-input password-input"
            />
            <view class="password-icon" @click="showPassword = !showPassword">
              <u-icon
                :name="showPassword ? 'eye-off' : 'eye-fill'"
                size="18"
                color="#909399"
              ></u-icon>
            </view>
          </view>
        </u-form-item>
      </u-form>
      
      <!-- 记住我 -->
      <view class="remember-me">
        <u-checkbox-group v-model="checkboxValue" @change="onRememberChange">
          <u-checkbox 
            name="remember"
            label="记住我"
            label-size="14"
            icon-size="14"
          ></u-checkbox>
        </u-checkbox-group>
      </view>
      
      <!-- 登录按钮 -->
      <u-button 
        type="primary"
        :loading="loading"
        :loading-text="'登录中...'"
        @click="handleLogin"
        :disabled="loading"
        class="login-btn"
      >
        登录
      </u-button>
    </view>
  </view>
</template>

<script>
import http from '@/utils/request.js'
import api from '@/utils/api.js'
import { encrypt, decrypt } from '@/utils/encrypt.js'

export default {
  data() {
    return {
      isIOS: false,
      inputStates: {
        tenantName: {
          disabled: false,
          focus: false
        },
        username: {
          disabled: false,
          focus: false
        },
        password: {
          disabled: false,
          focus: false
        }
      },
      formData: {
        tenantName: '',
        username: '',
        password: ''
      },
      showPassword: false,
      rememberMe: false,
      checkboxValue: [],
      loading: false,
      isCheckingLogin: true, // 检查登录状态中
      rules: {
        tenantName: [
          {
            required: true,
            message: '请输入企业唯一ID',
            trigger: ['blur', 'change']
          }
        ],
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: ['blur', 'change']
          }
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: ['blur', 'change']
          },
          {
            min: 8,
            message: '请输入至少8位的密码',
            trigger: ['blur', 'change']
          }
        ]
      }
    }
  },
  
  onLoad() {
    // 检查是否已经有accessToken，如果有则直接跳转到首页
    this.checkLoginStatus()
    // 检查是否记住了登录信息
    this.loadRememberedInfo()
    // 检查是否是iOS系统
    const systemInfo = uni.getSystemInfoSync()
    console.log('系统信息:', systemInfo)
    this.isIOS = systemInfo.platform === 'ios'
    // 如果是iOS，初始化禁用输入框
    if (this.isIOS) {
      this.inputStates.tenantName.disabled = true
      this.inputStates.username.disabled = true
      this.inputStates.password.disabled = true
    }
  },
  
  methods: {
    // 输入框相关方法
    onInput(event, field) {
      this.formData[field] = event.detail.value
      // 触发表单校验
      this.$refs.loginForm.validateField(field)
    },
    
    onBlur(event, field) {
      console.log('onBlur', field)
      if (this.isIOS) {
        this.inputStates[field].disabled = true
        this.inputStates[field].focus = false
      }
      // 触发表单校验
      this.$refs.loginForm.validateField(field)
    },
    handleWrapTap(field) {
      console.log('handleWrapTap', field)
      if (this.isIOS) {
        this.inputStates[field].disabled = false
        setTimeout(() => {
          this.inputStates[field].focus = true
        }, 20)
      }
    },
    
    // 检查登录状态
    checkLoginStatus() {
      try {
        const accessToken = uni.getStorageSync('accessToken')
        const userInfo = uni.getStorageSync('userInfo')
        
        if (accessToken && userInfo) {
          console.log('检测到已登录状态，自动跳转到首页')
          // 延迟跳转，避免页面闪烁
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/index/index'
            })
          }, 500)
        } else {
          // 没有登录信息，结束检查状态
          this.isCheckingLogin = false
        }
      } catch (error) {
        console.error('检查登录状态失败:', error)
        this.isCheckingLogin = false
      }
    },
    
    // 记住我选择变化
    onRememberChange(value) {
      this.rememberMe = value.includes('remember')
    },
    
    // 加载记住的登录信息
    loadRememberedInfo() {
      try {
        const rememberMe = uni.getStorageSync('rememberMe') === 'true'
        const savedUsername = uni.getStorageSync('savedUsername')
        const savedTenantName = uni.getStorageSync('savedTenantName')
        const savedPassword = uni.getStorageSync('savedPassword')
        
        if (rememberMe && savedUsername && savedTenantName) {
          this.formData.username = savedUsername
          this.formData.tenantName = savedTenantName
          if (savedPassword) {
            this.formData.password = decrypt(savedPassword) // 解密密码
          }
          this.rememberMe = true
          this.checkboxValue = ['remember']
        }
      } catch (error) {
        console.log('加载记住的登录信息失败:', error)
      }
    },
    
    // 保存登录信息
    saveLoginInfo() {
      if (this.rememberMe) {
        uni.setStorageSync('rememberMe', 'true')
        uni.setStorageSync('savedUsername', this.formData.username)
        uni.setStorageSync('savedTenantName', this.formData.tenantName)
        // 加密保存密码
        const encryptedPassword = encrypt(this.formData.password)
        uni.setStorageSync('savedPassword', encryptedPassword)
      } else {
        uni.removeStorageSync('rememberMe')
        uni.removeStorageSync('savedUsername')
        uni.removeStorageSync('savedTenantName')
        uni.removeStorageSync('savedPassword')
      }
    },
    
    // 表单验证
    validateForm() {
      return new Promise((resolve) => {
        this.$refs.loginForm.validate().then(res => {
          resolve(res)
        }).catch(errors => {
          // uview-plus会自动显示错误信息
          resolve(false)
        })
      })
    },
    
    // 处理登录
    async handleLogin() {
      const isValid = await this.validateForm()
      if (!isValid) {
        return
      }
      
      this.loading = true
      
      try {
        uni.showLoading({ title: '登录中...', mask: true })
        // 1. 先通过租户名获取租户ID
        const tenantResponse = await api.user.getTenantIdByName(this.formData.tenantName)
        
        if (!tenantResponse.data) {
          uni.showToast({
            title: '企业ID不存在，请检查输入',
            icon: 'none'
          })
          return
        }
        
        const tenantId = tenantResponse.data
        
        // 将tenantId存储在本地
        uni.setStorageSync('tenant-id', tenantId)
        
        // 2. 处理记住我功能
        this.saveLoginInfo()
        
        // 3. 调用登录接口
        const loginData = {
          username: this.formData.username,
          password: this.formData.password,
          tenantId: tenantId,
          tenantName: this.formData.tenantName,
          rememberMe: this.rememberMe
        }
        
        const loginResponse = await api.user.login(loginData)
        
        if (loginResponse.code === 0) {
          // 登录成功，保存token
          uni.setStorageSync('accessToken', loginResponse.data.accessToken)
          
          // 获取用户权限信息
          try {
            const permissionResponse = await api.user.getPermissionInfo()
            
            if (permissionResponse.code === 0 && permissionResponse.data) {
              // 只保存用户信息字段
              const userInfo = permissionResponse.data.user
              uni.setStorageSync('userInfo', userInfo)
              
              // 可选：保存其他权限信息（如果后续需要用到）
              uni.setStorageSync('userRoles', permissionResponse.data.roles)
              uni.setStorageSync('userPermissions', permissionResponse.data.permissions)
              uni.setStorageSync('userMenus', permissionResponse.data.menus)
            }
          } catch (error) {
            console.error('获取用户权限信息失败:', error)
            // 权限信息获取失败不影响登录流程
          }
          
          // 跳转到首页
          setTimeout(() => {
            uni.hideLoading()
            uni.switchTab({
              url: '/pages/index/index'
            })
          }, 1000)
        }
        
      } catch (error) {
        console.error('登录失败:', error)
        // uni.hideLoading()
        // 错误提示已在request.js中处理
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  padding: 10rpx 80rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  box-sizing: border-box;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.form-container {
  width: 100%;
}

.remember-me {
  margin: 0 0 60rpx 0;
  display: flex;
  align-items: center;
}

// 自定义uview组件样式
.u-form-item {
  padding: 0;
  margin-bottom: 24rpx;
}

.u-form-item__label {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
  margin-bottom: 12rpx;
}

// 修复登录按钮样式优先级问题
.login-btn {
  margin-top: 20rpx;
}

/* 强制 u-input 使用实体 1px 边框 */
:deep(.u-input) {
  border-width: 1px !important;
}

/* 输入框相关样式 */
.extend-class {
  width: 100%;
  background-color: #ffffff;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  padding: 0 10px;
  box-sizing: border-box;
}

.password-wrapper {
  position: relative;
  padding-right: 40px !important; /* 为图标预留空间 */
}

.uni-input {
  width: 100%;
  height: 35px;
  line-height: 35px;
  font-size: 14px;
  color: #333;
}

.password-input {
  padding-right: 0 !important; /* 密码输入框不需要额外的右内边距 */
}

.password-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}
::v-deep .uni-input-placeholder {
    color: #c0c4cc !important;
}
::v-deep .title_input{
  color: #c0c4cc;
}
/* 检查登录状态loading样式 */
.checking-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 24rpx;
}

.checking-text {
  font-size: 28rpx;
  color: #666666;
  text-align: center;
}

</style>
