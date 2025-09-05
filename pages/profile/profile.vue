<template>
  <view class="profile-container">
    <!-- 用户信息 -->
    <view class="user-info">
      <view class="avatar">
        <u-avatar :src="userInfo.avatar || '/static/avatar.jpg'" size="80"></u-avatar>
      </view>
      <view class="user-details">
        <view class="nickname">{{ userInfo.nickname || userInfo.username || '未登录' }}</view>
        <view class="username" v-if="userInfo.username && userInfo.username !== userInfo.nickname">
          {{ userInfo.username }}
        </view>
        <view class="login-status">
          <text class="status-text logged">已登录</text>
          <!-- <text v-else class="status-text not-logged">未登录</text> -->
        </view>
      </view>
    </view>
    
    <!-- 菜单列表 -->
    <view class="menu-list">
      <u-cell-group :border="false">
        
        
        <u-cell 
          title="退出登录" 
          icon="logout"
          :is-link="true"
          @click="handleLogout"
        ></u-cell>

      </u-cell-group>
    </view>
  </view>
</template>

<script>
import wechat from '@/utils/wechat.js'

export default {
  name: 'Profile',
  data() {
    return {
      userInfo: {},
      isLoggedIn: false
    }
  },
  
  onShow() {
    this.checkLoginStatus()
    this.loadUserInfo()
  },
  
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      this.isLoggedIn = wechat.checkLogin()
    },
    
    // 加载用户信息
    loadUserInfo() {
      try {
        const userInfo = uni.getStorageSync('userInfo')
        if (userInfo) {
          this.userInfo = userInfo
        }
      } catch (error) {
        console.error('加载用户信息失败:', error)
      }
    },
    
    
    // 跳转到登录页面
    goToLogin() {
      uni.navigateTo({
        url: '/pages/login/login'
      })
    },
    
    // 退出登录
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            this.performLogout()
          }
        }
      })
    },
    
    // 执行退出登录操作
    performLogout() {
      try {
        // 清除所有本地存储的用户信息
        uni.removeStorageSync('accessToken')
        uni.removeStorageSync('userInfo')
        uni.removeStorageSync('userRoles')
        uni.removeStorageSync('userPermissions')
        uni.removeStorageSync('userMenus')
        uni.removeStorageSync('openId')
        uni.removeStorageSync('tenant-id')
        uni.removeStorageSync('rememberMe')
        uni.removeStorageSync('savedUsername')
        uni.removeStorageSync('savedTenantName')
        
        // 显示退出成功提示
        uni.showToast({
          title: '退出登录成功',
          icon: 'success',
          duration: 1500
        })
        
        // 延迟跳转，让用户看到提示信息
        setTimeout(() => {
          // 使用reLaunch清空页面栈并跳转到登录页
          uni.reLaunch({
            url: '/pages/login/login'
          })
        }, 1500)
        
      } catch (error) {
        console.error('退出登录失败:', error)
        uni.showToast({
          title: '退出登录失败',
          icon: 'error'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-container {
  background-color: #f5f5f5;
  // min-height: 100vh;
  box-sizing: border-box;
}

.user-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx;
  display: flex;
  align-items: center;
  color: white;
}

.avatar {
  margin-right: 30rpx;
}

.user-details {
  flex: 1;
}

.nickname {
  font-size: 36rpx;
  font-weight: 500;
  margin-bottom: 10rpx;
}

.username {
  font-size: 28rpx;
  opacity: 0.8;
  margin-bottom: 10rpx;
}

.login-status {
  font-size: 24rpx;
}

.status-text {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.logged {
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.not-logged {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.menu-list {
  margin-top: 20rpx;
  background-color: #fff;
}
</style>

