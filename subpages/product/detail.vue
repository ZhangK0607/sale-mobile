<template>
	<view class="product-detail">
		<CustomNavbar :title="productInfo.name || '产品详情'" :showBack="true" />

		<scroll-view scroll-y class="content" :style="{height: productListMaxHeight}">
			<!-- 产品轮播图 -->
			<view v-if="showPicUrls && showPicUrls.length > 0" class="product-swiper">
				<swiper 
					class="swiper" 
					:indicator-dots="true" 
					:autoplay="true" 
					:interval="3000" 
					:duration="500"
					indicator-color="rgba(255, 255, 255, 0.5)"
					indicator-active-color="#5DADE2">
					<swiper-item v-for="(image, index) in showPicUrls" :key="index">
						<image 
							:src="image" 
							class="swiper-image" 
							mode="aspectFill"
							@click="previewShowImage(image, index)">
						</image>
					</swiper-item>
				</swiper>
			</view>
			
			<!-- 产品头部信息 -->
			<view class="product-header">
				<view class="product-main">
					<image 
						:src="productInfo.logo || '/static/defaultPro.png'" 
						class="product-logo"
						mode="aspectFit">
					</image>
					<view class="product-info">
						<view class="product-name-row">
							<view class="product-name">{{ productInfo.name || '思政助手' }}</view>
							<view class="product-price">￥{{ productInfo.price || '50000' }}</view>
						</view>
						<view class="product-desc">{{ productInfo.description || '构建全方位思政教育体系，通过智能化教学内容推荐和个性化学习路径规划，提升思政教育的针对性和实效性，培养具有正确价值观的新时代人才。' }}</view>
					</view>
				</view>
				<!-- 标签信息 -->
				<view class="product-tags">
					<view v-if="productInfo.typeLabel && productInfo.typeLabel.length > 0" class="tag-group">
						<view class="tag-label">行业类型：</view>
						<view class="tag-content">
							<u-tag 
								v-for="(tag, index) in productInfo.typeLabel" 
								:key="'type-' + index"
								:text="tag" 
								size="mini"
								type="primary"
								shape="circle"
								plain 
								class="product-tag">
							</u-tag>
						</view>
					</view>
					<view v-if="productInfo.pubLabels && productInfo.pubLabels.length > 0" class="tag-group">
						<view class="tag-label">公共标签：</view>
						<view class="tag-content">
							<u-tag 
								v-for="(tag, index) in productInfo.pubLabels" 
								:key="'public-' + index"
								:text="tag" 
								size="mini"
								plain 
								class="product-tag">
							</u-tag>
						</view>
					</view>
					<view v-if="productInfo.showPriLabels &&productInfo.showPriLabels.length > 0" class="tag-group">
						<view class="tag-label">个人标签：</view>
						<view class="tag-content">
							<u-tag 
								v-for="(tag, index) in productInfo.showPriLabels" 
								:key="'personal-' + index"
								:text="tag" 
								size="mini"
								type="success"
								plain 
								class="product-tag">
							</u-tag>
						</view>
					</view>
				</view>
			</view>
			<!-- 产品图片介绍 -->
			<view v-if="productImages.length > 0" class="section">
				<view class="section-title">产品ppt</view>
				<view class="product-images">
					<view 
						v-for="(image, index) in productImages" 
						:key="index" 
						class="image-item">
						<image 
							:src="image.url || image" 
							class="product-image" 
							mode="widthFix"
							@click="previewImage(image.url || image, index)">
						</image>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import api from '@/utils/api.js'
import CustomNavbar from '@/components/CustomNavbar.vue'

export default {
	components: { CustomNavbar },
	data() {
		return {
			statusBarHeight: 0,
			productId: '', // 产品ID
			productInfo: {
				typeLabel: [],
				showPriLabels: [],
				pubLabels: [],
			},
			productImages: [], // 产品图片列表
			showPicUrls: [] // 轮播图片列表
		}
	},
	computed: {
		productListMaxHeight() {
			return `calc(100vh - 44px - ${this.statusBarHeight}px)`
		},
    },
	onLoad(options) {
		const sys = uni.getSystemInfoSync()
		this.statusBarHeight = sys.statusBarHeight || 20
		// 获取传递的产品ID
		if (options.id) {
			this.productId = options.id
			// 获取产品详情
			this.fetchProductDetail()
		} else {
			uni.showToast({
				title: '产品ID不能为空',
				icon: 'none'
			})
		}
	},
	
	// 页面加载完成后显示分享按钮
	onReady() {
		// #ifdef MP-WEIXIN
		// 确保分享菜单显示
		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline']
		})
		// #endif
	},
	
	// 配置分享功能 - 分享当前产品
	onShareAppMessage(res) {
		const shareConfig = {
			title: this.productInfo.name ? `${this.productInfo.name} - AI智能销售助手推荐` : 'AI智能销售助手 - 产品详情',
			path: `/subpages/product/detail?id=${this.productId}`,
			imageUrl: this.productInfo.logo || '/static/defaultPro.png'
		}
		return shareConfig
	},
	
	// 配置分享到朋友圈
	onShareTimeline() {
		const shareConfig = {
			title: this.productInfo.name ? `${this.productInfo.name} - AI智能销售助手推荐` : 'AI智能销售助手 - 产品详情',
			query: `id=${this.productId}`,
			imageUrl: this.productInfo.logo || '/static/defaultPro.png'
		}
		return shareConfig
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		// 获取产品详情
		async fetchProductDetail() {
			try {
				uni.showLoading({ title: '加载中...' })
				const response = await api.product.getProductDetail(this.productId)

				if (response.code === 0 && response.data) {
					this.productInfo = {
						...response.data,
						typeLabel: response.data.typeLabel?.split(',') || [],
						showPriLabels: response.data.showPriLabels?.split(',') || [],
						pubLabels: response.data.pubLabels?.split(',') || []
					}
					console.log(this.productInfo,'this.productInfo')
					// 设置导航栏标题（如用自定义导航栏可省略此行）
					// uni.setNavigationBarTitle({
					//     title: this.productInfo.name || '产品详情'
					// })
					// 获取产品图片
					this.fetchProductImages()
				} else {
					uni.showToast({
						title: response.msg || '获取产品详情失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('获取产品详情失败:', error)
				uni.showToast({
					title: '获取产品详情失败',
					icon: 'none'
				})
			} finally {
				uni.hideLoading()
			}
		},
		// 获取产品图片
		async fetchProductImages() {
			try {
				// 如果产品有ID，则获取图片
				if (this.productId) {
					const response = await api.product.fetchProductPptImages(this.productId)

					if (response.code === 0 && response.data) {
						this.productImages = Array.isArray(response.data?.pptPicUrls) ? response.data.pptPicUrls : []
						this.showPicUrls = Array.isArray(response.data?.showPicUrls) ? response.data.showPicUrls : []
					}
				}
			} catch (error) {
				console.error('获取产品图片失败:', error)
			}
		},
		// 预览轮播图片
		previewShowImage(currentUrl, index) {
			uni.previewImage({
				urls: this.showPicUrls,
				current: currentUrl
			})
		},

		// 预览产品PPT图片
		previewImage(currentUrl, index) {
			const urls = this.productImages.map(img => img.url || img)
			uni.previewImage({
				urls: urls,
				current: currentUrl
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.product-detail {
	// min-height: 100vh;
	background: linear-gradient(180deg, #DFEFFF 0%, #F2F5F8 100%)
}

/* 产品轮播图 */
.product-swiper {
	width: 100%;
	background: #fff;
}

.swiper {
	width: 100%;
	height: 400rpx;
}

.swiper-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

/* 自定义导航栏 */
.navbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 88rpx;
	padding: 0 32rpx;
	background: #fff;
	border-bottom: 1px solid #e4e7ed;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 1000;
}

.nav-left, .nav-right {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.nav-title {
	flex: 1;
	text-align: center;
	font-size: 32rpx;
	font-weight: 600;
	color: #303133;
}

/* 内容区域 */
.content {
	border-radius: 10px;
    overflow: hidden;
}

/* 产品头部 */
.product-header {
	background: #fff;
	padding: 32rpx;
	margin-bottom: 20rpx;
}

.product-main {
	display: flex;
	align-items: flex-start;
	margin-bottom: 24rpx;
}

/* 标签信息样式 */
.product-tags {
	margin-top: 24rpx;
	padding-top: 24rpx;
	border-top: 1px solid #f0f0f0;
}

.tag-group {
	display: flex;
	align-items: flex-start;
	margin-bottom: 16rpx;
}

.tag-group:last-child {
	margin-bottom: 0;
}

.tag-label {
	font-size: 26rpx;
	color: #606266;
	font-weight: 500;
	margin-right: 16rpx;
	flex-shrink: 0;
	min-width: 120rpx;
	margin-top: 2px;
}

.tag-content {
	font-size: 26rpx;
	color: #303133;
	line-height: 1.5;
	flex: 1;
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.product-tag {
	margin-right: 0 !important;
	margin-bottom: 0 !important;
}

.product-logo {
	width: 120rpx;
	height: 120rpx;
	border-radius: 16rpx;
	margin-right: 24rpx;
}

.product-info {
	flex: 1;
}

.product-name-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.product-name {
	font-size: 36rpx;
	font-weight: 600;
	color: #303133;
	flex: 1;
}

.product-desc {
	font-size: 28rpx;
	color: #606266;
	line-height: 1.6;
}

.product-price {
	font-size: 32rpx;
	font-weight: bold;
	color: #d9001bc8;
	flex-shrink: 0;
	margin-left: 16rpx;
}

/* 通用section样式 */
.section {
	background: #fff;
	margin-bottom: 20rpx;
	padding: 32rpx;
}

.section-title {
	font-size: 30rpx;
	font-weight: 500;
	color: #303133;
	margin-bottom: 24rpx;
}

/* 产品图片样式 */
.product-images {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.image-item {
	width: 100%;
	border-radius: 12rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
	transition: all 0.3s;
}

.image-item:hover {
	transform: translateY(-2rpx);
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
}

.product-image {
	width: 100%;
	background: #f8f9fa;
	border-radius: 12rpx;
	cursor: pointer;
}
</style>
