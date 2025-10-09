<template>
	<view class="ppt-page">
		<!-- 顶部栏 -->
		<!-- <view class="navbar">
			<view class="nav-left" @click="goBack">
				<u-icon name="arrow-left" color="#333" size="20"></u-icon>
			</view>
			<view class="nav-title">PPT</view>
			<view class="nav-right"></view>
		</view> -->

		<scroll-view scroll-y class="content">
			<view class="ppt-container">
				<view v-if="loading" class="loading">正在生成PPT...</view>
				<view v-else>
					<view v-if="imageUrls.length === 0" class="empty">暂无PPT图片</view>
					<view v-else class="slides">
						<image v-for="(url, idx) in imageUrls" :key="idx" :src="url" mode="widthFix" class="slide" @click="preview(idx)" />
					</view>
				</view>
			</view>
		</scroll-view>
		<!-- 底部操作按钮 -->
        <view class="bottom-actions">
            <u-button type="info" size="small" class="action-btn" shape="circle" @click="sharePPTLink">
                分享
            </u-button>
            <u-button type="info" size="small" class="action-btn" shape="circle" @click="downloadPdf">
                下载
            </u-button>
        </view>
	</view>
</template>

<script>
import api from '@/utils/api.js'

export default {
	data() {
		return {
			imageUrls: [],
			loading: true,
			downloadedFilePath: '' // 存储已下载的文件路径
		}
	},
	
	// 支持分享功能
	onShareAppMessage(res) {
		if (res.from === 'button') {
			// 来自页面内分享按钮
			return {
				title: 'PPT产品方案演示文稿',
				path: `/pages/ppt/ppt?products=${encodeURIComponent(JSON.stringify(this.currentProducts || []))}`,
				imageUrl: this.imageUrls.length > 0 ? this.imageUrls[0] : ''
			}
		}
		return {
			title: 'AI智能销售助手 - PPT方案',
			path: '/pages/index/index',
			imageUrl: ''
		}
	},
	onLoad(options) {
		// 从本地存储获取产品数据并请求生成PPT
		try {
			const storedProducts = uni.getStorageSync('pptProducts')
			if (!storedProducts) {
				this.loading = false
				console.log('未找到PPT产品数据')
				return
			}
			
			console.log('从本地存储获取的PPT产品数据:', storedProducts)
			this.currentProducts = storedProducts // 保存产品数据用于分享
			this.generate(storedProducts)
			
			// 清除存储的数据
			uni.removeStorageSync('pptProducts')
		} catch (e) {
			this.loading = false
			console.error('获取PPT产品数据失败:', e)
		}
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		async downloadPdf() {
			try {
				if (!this.imageUrls || this.imageUrls.length === 0) {
					uni.showToast({ title: '请先生成PPT', icon: 'none' })
					return
				}
				uni.showLoading({ title: '打包下载中...', mask: true })
				// 将当前已展示图片的URL作为下载依据传给后端（若后端需要产品原始数据，可改为透传产品列表）
				const res = await api.ppt.download(this.imageUrls)
				const arrayBuffer = res?.data || res
				if (!arrayBuffer) throw new Error('未获取到文件数据')

                // #ifdef H5
                    const blob = new Blob([arrayBuffer])
					const url = window.URL.createObjectURL(blob)
					const a = document.createElement('a')
					a.href = url
					a.download = `产品方案演示_${Date.now()}.pptx`
					document.body.appendChild(a)
					a.click()
					document.body.removeChild(a)
					window.URL.revokeObjectURL(url)
                // #endif

                // #ifdef MP-WEIXIN
                try {
                    const filePath = `${wx.env.USER_DATA_PATH}/产品方案演示_${Date.now()}.pptx`
                    const fs = wx.getFileSystemManager()
                    fs.writeFileSync(filePath, arrayBuffer)
                    uni.openDocument({
                        filePath,
                        fileType: 'pptx',
                        showMenu: true,
                        success: () => {},
                        fail: () => {
                            uni.showToast({ title: '打开PPT失败', icon: 'none' })
                        }
                    })
                } catch (err) {
                    uni.showToast({ title: '保存文件失败', icon: 'none' })
                }
                // #endif

                // #ifdef APP-PLUS
					const fileName = `产品方案演示_${Date.now()}.pptx`
					plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
						fs.root.getFile(fileName, { create: true }, (entry) => {
							entry.createWriter((writer) => {
								writer.write(arrayBuffer)
								uni.showToast({ title: '已保存到本地', icon: 'success' })
							})
						})
					})
                // #endif
			} catch (e) {
				uni.showToast({ title: (e && e.message) || '下载失败，请稍后重试', icon: 'none' })
			} finally {
				uni.hideLoading()
			}
		},
		async generate(products) {
			try {
				uni.showLoading({ title: '生成PPT中...', mask: true })
				const res = await api.ppt.generate(products)
				if (res.code === 0 && Array.isArray(res.data)) {
					this.imageUrls = res.data
				} else if (res.data && Array.isArray(res.data.urls)) {
					this.imageUrls = res.data.urls
				}
			} catch (e) {
				uni.showToast({ title: '生成PPT失败', icon: 'none' })
			} finally {
				this.loading = false
				uni.hideLoading()
			}
		},
		preview(startIdx) {
			uni.previewImage({
				urls: this.imageUrls,
				current: this.imageUrls[startIdx]
			})
		},
		
		// 分享给朋友
		async shareToFriend() {
			try {
				if (!this.imageUrls || this.imageUrls.length === 0) {
					uni.showToast({ title: '请先生成PPT', icon: 'none' })
					return
				}

				uni.showLoading({ title: '准备分享...', mask: true })
				
				// 1. 先下载PPT文件到本地
				await this.downloadPPTFile()
				
				// 2. 显示分享选项
				uni.showActionSheet({
					itemList: ['分享小程序', '分享到微信群', '分享PPT文件'],
					success: async (res) => {
						switch (res.tapIndex) {
							case 0:
								// 分享小程序页面
								this.shareAppMessage()
								break
							case 1:
								// 分享到微信群
								this.shareAppMessage()
								break
							case 2:
								// 分享PPT文件
								await this.sharePPTFile()
								break
						}
					}
				})
				
			} catch (error) {
				console.error('分享失败:', error)
				uni.showToast({ title: '分享准备失败', icon: 'none' })
			} finally {
				uni.hideLoading()
			}
		},

		// 直接生成分享链接（调用后端 sharePPT 接口）
		async sharePPTLink() {
			try {
				if (!this.imageUrls || this.imageUrls.length === 0) {
					uni.showToast({ title: '请先生成PPT', icon: 'none' })
					return
				}
				uni.showLoading({ title: '生成分享链接...', mask: true })
				const res = await api.ppt.sharePPT(this.imageUrls, true)
				const url = res?.data
				if (!url) {
					uni.showToast({ title: '未获取到分享链接', icon: 'none' })
					return
				}
				if (uni.setClipboardData) {
					uni.setClipboardData({ data: url, success: () => {} })
				}
				uni.showModal({
					title: '分享链接',
					content: url,
					showCancel: false
				})
			} catch (e) {
				uni.showToast({ title: (e && e.message) || '分享失败，请稍后重试', icon: 'none' })
			} finally {
				uni.hideLoading()
			}
		},
		
		// 下载PPT文件到本地临时目录
		async downloadPPTFile() {
			try {
				const res = await api.ppt.download(this.imageUrls)
				const arrayBuffer = res?.data || res
				
				if (!arrayBuffer) throw new Error('未获取到文件数据')
				
				// 小程序环境下保存到临时文件
				if (uni.getSystemInfoSync().platform !== 'h5') {
					const fileName = `产品方案演示_${Date.now()}.pptx`
					const base64 = uni.arrayBufferToBase64(arrayBuffer)
					const fs = wx.getFileSystemManager()
					
					// 使用Promise包装异步文件操作
					const tempFilePath = await new Promise((resolve, reject) => {
						// 获取临时文件路径
						let filePath = ''
						
						// 方案1: 使用系统临时目录
						if (wx.env && wx.env.USER_DATA_PATH) {
							filePath = `${wx.env.USER_DATA_PATH}/${fileName}`
							console.log('使用用户数据目录:', filePath)
						} else {
							// 方案2: 使用wxfile协议创建临时文件
							filePath = `wxfile://tmp_${Date.now()}_${fileName}`
							console.log('使用wxfile临时路径:', filePath)
						}
						
						// 异步写入文件
						fs.writeFile({
							filePath: filePath,
							data: base64,
							encoding: 'base64',
							success: () => {
								console.log('PPT文件写入成功:', filePath)
								resolve(filePath)
							},
							fail: (error) => {
								console.log('writeFile失败，尝试备用方案:', error)
								
								// 备用方案: 直接使用相对路径
								const backupPath = fileName
								fs.writeFile({
									filePath: backupPath,
									data: base64,
									encoding: 'base64',
									success: () => {
										console.log('备用路径写入成功:', backupPath)
										resolve(backupPath)
									},
									fail: (backupError) => {
										console.error('所有写入方案均失败:', backupError)
										reject(new Error('无法保存PPT文件到本地'))
									}
								})
							}
						})
					})
					
					this.downloadedFilePath = tempFilePath
					console.log('PPT文件最终保存路径:', tempFilePath)
				}
				
			} catch (error) {
				console.error('下载PPT文件失败:', error)
				throw error
			}
		},
		
		// 分享小程序页面
		shareAppMessage() {
			uni.showShareMenu({
				withShareTicket: true,
				menus: ['shareAppMessage']
			})
			
			// 触发分享
			uni.showToast({
				title: '请点击右上角分享',
				icon: 'none'
			})
		},
		
		// 分享PPT文件
		async sharePPTFile() {
			try {
				if (!this.downloadedFilePath) {
					uni.showToast({ title: 'PPT文件未准备好', icon: 'none' })
					return
				}
				
				// 小程序环境下使用文件分享
				if (typeof wx !== 'undefined' && wx.shareFileMessage) {
					wx.shareFileMessage({
						filePath: this.downloadedFilePath,
						fileName: `产品方案演示_${Date.now()}.pptx`,
						success: () => {
							uni.showToast({ title: '分享成功', icon: 'success' })
						},
						fail: (error) => {
							console.error('分享文件失败:', error)
							uni.showToast({ title: '分享失败，请稍后重试', icon: 'none' })
						}
					})
				} else {
					// 其他平台的分享逻辑
					uni.showToast({ title: '当前平台不支持文件分享', icon: 'none' })
				}
				
			} catch (error) {
				console.error('分享PPT文件失败:', error)
				uni.showToast({ title: '分享失败', icon: 'none' })
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.ppt-page { background: #fff; }
.navbar {
	display: flex; align-items: center; justify-content: space-between;
	height: 88rpx; padding: 0 32rpx; background: #fff; border-bottom: 1px solid #e4e7ed;
	position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
}
.nav-left, .nav-right { width: 60rpx; height: 60rpx; display: flex; align-items: center; justify-content: center; }
.nav-title { flex: 1; text-align: center; font-size: 32rpx; font-weight: 600; color: #303133; }
.content { height: calc(100vh - 88rpx); }
.ppt-container { padding: 16rpx; padding-bottom: 55px;}
.loading, .empty { text-align: center; color: #909399; padding: 32rpx 0; }
.slides { display: flex; flex-direction: column; gap: 16rpx; }
.slide { width: 100%; border-radius: 12rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,.06); background: #f7f8fa; }
/* 底部操作按钮 */
.bottom-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: flex-end;
    font-size: 28rpx;
    gap: 16rpx;
    padding: 24rpx;
    padding-left: 30%;
    background: #fff;
    box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.1);
	margin-bottom: 20rpx;
}

.action-btn {
    flex: 1;
}
</style>


