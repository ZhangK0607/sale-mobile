<template>
  <view class="login-container">
    <!-- 顶部标题和图标 -->
    <view class="logo">
      <u-image 
        :src="'/static/logo.png'" 
        width="300rpx" 
        height="300rpx" 
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
          <u-input 
            v-model="formData.tenantName" 
            placeholder="请输入企业唯一ID"
            clearable
            cursor-color="#007aff"
          ></u-input>
        </u-form-item>
        
        <!-- 用户名 -->
        <u-form-item label="用户名" prop="username" class="form-item">
          <u-input 
            v-model="formData.username" 
            placeholder="请输入用户名"
            clearable
            cursor-color="#007aff"
          ></u-input>
        </u-form-item>
        
            <!-- 密码 -->
        <u-form-item label="密码" prop="password" class="form-item">
          <u-input 
            v-model="formData.password" 
            type="text"
            :password="!showPassword"
            placeholder="请输入密码"
            cursor-color="#007aff"
            :passwordVisibilityToggle="false"
          >
            <template #suffix>
              <u-icon
                :name="showPassword ? 'eye-off' : 'eye-fill'"
                size="18"
                color="#909399"
                @click="showPassword = !showPassword"
              ></u-icon>
            </template>
          </u-input>
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

export default {
  data() {
    return {
      formData: {
        tenantName: '',
        username: '',
        password: ''
      },
      showPassword: false,
      rememberMe: false,
      checkboxValue: [],
      loading: false,
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
    // 检查是否记住了登录信息
    this.loadRememberedInfo()
  },
  
  methods: {
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
        
        if (rememberMe && savedUsername && savedTenantName) {
          this.formData.username = savedUsername
          this.formData.tenantName = savedTenantName
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
      } else {
        uni.removeStorageSync('rememberMe')
        uni.removeStorageSync('savedUsername')
        uni.removeStorageSync('savedTenantName')
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
          
          // 显示登录成功提示
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })
          
          // 跳转到首页
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/index/index'
            })
          }, 1000)
        }
        
      } catch (error) {
        console.error('登录失败:', error)
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

</style>
