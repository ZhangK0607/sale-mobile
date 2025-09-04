<script>
	import wechat from '@/utils/wechat.js'
	
	export default {
		onLaunch: function() {
			console.log('App Launch')
			this.checkLoginStatus()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		
		methods: {
			// 检查登录状态
			checkLoginStatus() {
				try {
					// 检查是否有登录token
					const accessToken = uni.getStorageSync('accessToken')
					const userInfo = uni.getStorageSync('userInfo')
					
					if (!accessToken) {
						// 没有登录信息，跳转到登录页
						this.clearLoginData()
						this.goToLogin()
						return
					} else {
						// 有登录信息，跳转到首页
						this.goToHome()
						return
					}
				} catch (error) {
					console.error('检查登录状态失败:', error)
					this.goToLogin()
				}
			},
			
			// 清除登录数据
			clearLoginData() {
				uni.removeStorageSync('accessToken')
				uni.removeStorageSync('userInfo')
				uni.removeStorageSync('openId')
				uni.removeStorageSync('tenant-id')
			},
			
			// 跳转到登录页
			goToLogin() {
				// 延迟跳转，避免在应用启动时立即跳转
				setTimeout(() => {
					uni.reLaunch({
						url: '/pages/login/login'
					})
				}, 100)
			},
			
			// 跳转到首页
			goToHome() {
				// 延迟跳转，避免在应用启动时立即跳转
				setTimeout(() => {
					uni.switchTab({
						url: '/pages/index/index'
					})
				}, 100)
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
