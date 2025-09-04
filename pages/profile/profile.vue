<template>
  <view class="profile-container">
    <!-- 用户信息 -->
    <view class="user-info">
      <view class="avatar">
        <u-avatar :src="userInfo.avatarUrl || '/static/default-avatar.png'" size="80"></u-avatar>
      </view>
      <view class="user-details">
        <view class="nickname">{{ userInfo.nickName || '未登录' }}</view>
        <view class="login-status">
          <text v-if="isLoggedIn" class="status-text logged">已登录</text>
          <text v-else class="status-text not-logged">未登录</text>
        </view>
      </view>
    </view>
    
    <!-- 菜单列表 -->
    <view class="menu-list">
      <u-cell-group :border="false">
        <u-cell 
          title="个人设置" 
          icon="setting"
          :is-link="true"
          @click="goToSettings"
        ></u-cell>
        
        <u-cell 
          title="关于我们" 
          icon="info-circle"
          :is-link="true"
          @click="goToAbout"
        ></u-cell>
        
        <u-cell 
          v-if="isLoggedIn"
          title="退出登录" 
          icon="logout"
          :is-link="true"
          @click="handleLogout"
        ></u-cell>
        
        <u-cell 
          v-else
          title="立即登录" 
          icon="account"
          :is-link="true"
          @click="goToLogin"
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
    
    // 跳转到设置页面
    goToSettings() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },
    
    // 跳转到关于页面
    goToAbout() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
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
            wechat.logout()
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-container {
  background-color: #f5f5f5;
  min-height: 100vh;
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

