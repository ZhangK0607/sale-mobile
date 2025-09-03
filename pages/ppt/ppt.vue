<template>
	<view class="ppt-page">
		<!-- 顶部栏 -->
		<view class="navbar">
			<view class="nav-left" @click="goBack">
				<u-icon name="arrow-left" color="#333" size="20"></u-icon>
			</view>
			<view class="nav-title">PPT</view>
			<view class="nav-right"></view>
		</view>

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
            <u-button type="info" size="small" class="action-btn" shape="circle" @click="goBack">
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
			loading: true
		}
	},
	onLoad(options) {
		// 从参数拿到所选产品并请求生成PPT
		try {
			const productsParam = options.products
			if (!productsParam) {
				this.loading = false
				return
			}
			const products = JSON.parse(decodeURIComponent(productsParam))
			this.generate(products)
		} catch (e) {
			this.loading = false
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

				const isH5 = typeof window !== 'undefined' && typeof document !== 'undefined'
				if (isH5) {
					const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
					const url = window.URL.createObjectURL(blob)
					const a = document.createElement('a')
					a.href = url
					a.download = `产品方案演示_${Date.now()}.pptx`
					document.body.appendChild(a)
					a.click()
					document.body.removeChild(a)
					window.URL.revokeObjectURL(url)
				} else if (typeof plus !== 'undefined' && plus?.io) {
					const fileName = `产品方案演示_${Date.now()}.pptx`
					plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
						fs.root.getFile(fileName, { create: true }, (entry) => {
							entry.createWriter((writer) => {
								writer.write(arrayBuffer)
								uni.showToast({ title: '已保存到本地', icon: 'success' })
							})
						})
					})
				} else {
					uni.showToast({ title: '当前端暂不支持自动下载', icon: 'none' })
				}
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
.content { padding-top: 88rpx; height: calc(100vh - 88rpx); }
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
}

.action-btn {
    flex: 1;
}
</style>


