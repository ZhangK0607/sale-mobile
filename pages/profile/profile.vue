<template>
  <view class="profile-container">
    <CustomNavbar title="我的" :overflowHidden="false"/>
    <!-- 用户信息 -->
    <view class="user-info">
      <view class="avatar">
        <u-avatar :src="userInfo.avatar || '/static/avatar.jpg'" size="64"></u-avatar>
      </view>
      <view class="user-details">
        <view class="nickname">{{ userInfo.nickname || userInfo.username || '未登录' }}
          <view class="login-status">
            <text class="status-text logged">已登录</text>
            <!-- <text v-else class="status-text not-logged">未登录</text> -->
          </view>
        </view>
        <view class="username" v-if="userInfo.username && userInfo.username !== userInfo.nickname">
          {{ userInfo.username }}
        </view>
        
      </view>
    </view>
    
    <!-- 菜单列表 -->
    <view class="menu-list">
      <view class="logout-card" @click="handleLogout">
        <img src="/static/logout.png" alt="logout" class="logout-img" />
        <text class="logout-text">退出登录</text>
      </view>
    </view>
  </view>
</template>

<script>
import wechat from '@/utils/wechat.js'
import CustomNavbar from '@/components/CustomNavbar.vue'

export default {
  name: 'Profile',
  components: { CustomNavbar },
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
  
  onReady() {
    // #ifdef MP-WEIXIN
    // 确保分享菜单显示
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    // #endif
  },
  
  // 分享给好友
  onShareAppMessage(options) { 
    const shareConfig = {
      title: 'AI智能销售助手 - 智能推荐最适合您的产品',
      path: '/pages/index/index',
      imageUrl: '/static/share.png'
    }
    return shareConfig
  },
  
  // 分享到朋友圈
  onShareTimeline() {
    const shareConfig = {
      title: 'AI智能销售助手 - 智能推荐最适合您的产品',
      imageUrl: '/static/share.png'
    }
    return shareConfig
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
  /* #ifdef H5 */
	height: calc(100vh - 50px); /* H5环境下减去导航栏高度 */
	/* #endif */
	/* #ifdef MP-WEIXIN */
	height: 100vh; /* 小程序环境下使用100% */
	/* #endif */
  box-sizing: border-box;
  background: linear-gradient(180deg, #DFEFFF 0%, #F2F5F8 100%);
  position: relative;
  overflow: hidden; /* 禁用页面滚动 */
}

.user-info {
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
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10rpx;
  color: #262626;
  display: flex;
  align-items: center;
  gap: 10px;
}

.username {
  font-size: 14px;
  color: #262626;
  margin-bottom: 10rpx;
}

.login-status {
  font-size: 24rpx;
  color: #3194FA;
}

.status-text {
  padding: 2px 4px;
  border-radius: 20rpx;
  font-size: 10px;
}

.logged {
  background-color: #D9E8F9;
}

.not-logged {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.menu-list {
  margin-top: 20rpx;
  color: #262626;
}
/* 退出登录卡片样式 */
.logout-card {
  background: #fff;
  border-radius: 16px;
  display: flex;
  align-items: center;
  padding: 18px 20px;
  transition: box-shadow 0.2s;
  border-radius: 10px;
  font-size: 14px;
}
.logout-card:active {
  box-shadow: 0 2px 8px rgba(61, 100, 255, 0.03);
}
.logout-text {
  font-size: 14px;
  color: #262626;
}
/* 退出登录图片样式 */
.logout-img {
  width: 16px;
  height: 16px;
  display: block;
  margin-right: 10px;
}
</style>




