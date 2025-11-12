<script>
	import wechat from '@/utils/wechat.js'
	
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// 延迟执行，等待页面加载完成
			setTimeout(() => {
				this.checkLoginStatus()
			}, 200)
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
						// 有登录信息，检查当前目标页面
						// #ifdef H5
						// 使用URL判断当前页面
						const currentUrl = window.location.hash || window.location.pathname
						console.log('当前URL:', currentUrl)
						
						// 如果当前在登录页，则跳转到首页
						if (currentUrl.includes('/login') || currentUrl=='#/') {
							console.log('当前在登录页，跳转到首页')
							this.goToHome()
							return
						}
						
						// 如果不在登录页，则保持当前页面，不执行跳转
						console.log('当前不在登录页，保持当前页面')
						return
						// #endif
						
						// 非H5环境时，跳转到首页
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

<style lang="scss">
	@import "uview-plus/index.scss";
	/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
	/*每个页面公共css */
</style>
