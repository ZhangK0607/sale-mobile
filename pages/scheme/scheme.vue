<template>
	<view class="scheme-page">
		<!-- 自定义导航栏 -->
		<view class="navbar">
			<view class="nav-left" @click="goBack">
				<u-icon name="arrow-left" color="#333" size="20"></u-icon>
			</view>
			<view class="nav-title">AI智能销售助手</view>
			<view class="nav-right">
				<u-icon name="more-dot-fill" color="#333" size="20"></u-icon>
			</view>
		</view>

		<scroll-view scroll-y class="content">
			<!-- 产品列表 -->
			<view class="product-section">
				<!-- 空状态提示 -->
				<view v-if="productList.length === 0" class="empty-state">
					<view class="empty-icon">📦</view>
					<view class="empty-text">暂无产品数据</view>
					<view class="empty-desc">请先在首页搜索推荐产品</view>
				</view>
				
				<!-- 产品列表 -->
				<view 
					v-for="(product, index) in productList" 
					:key="index" 
					class="product-item">
					<!-- 选中按钮 -->
					<view class="product-checkbox" @click="toggleProductSelect(index)">
						<view class="checkbox-icon" :class="{ 'selected': selectedProducts[index] }">
							<u-icon v-if="selectedProducts[index]" name="checkmark" color="#fff" size="14"></u-icon>
						</view>
					</view>
					<view class="product-info" @click="goToProductDetail(product)">
						<image 
							:src="product.logo || '/static/defaultPro.png'" 
							class="product-logo"
							mode="aspectFit">
						</image>
						<view class="product-details">
							<view class="product-name">{{ product.name || '' }}</view>
							<view class="product-desc">{{ product.description || '' }}</view>
							<view class="price-quantity-row">
								<view class="product-price">￥{{ product.price || '' }}</view>
								<view class="quantity-input" @click.stop>
									<u-number-box 
										v-model="product.num" 
										:min="1" 
										:max="999"
										size="small"
										bgColor="#ffffff00"
										@change="updateQuantity(index, $event)"
										:disabled="!selectedProducts[index]">
										<template #minus>
                                            <view
                                                class="step-btn"
                                            >
                                                <u-icon
                                                    name="minus"
                                                    size="12"
                                                ></u-icon>
                                            </view>
                                        </template>
                                        <template #input>
                                            <text
                                                style="width: 50px;text-align: center;"
                                                class="input"
                                            >{{ product.num }}</text>
                                        </template>
                                        <template #plus>
                                            <view
                                                class="step-btn"
                                            >
                                                <u-icon
                                                    name="plus"
                                                    size="12"
                                                ></u-icon>
                                            </view>
                                        </template>
									</u-number-box>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 底部操作按钮 -->
		<view class="bottom-con" v-if="productList.length > 0">
			<view class="bottom-summary">
				<!-- 全选按钮 -->
				<view class="select-all-container">
					<view class="select-all" @click="toggleSelectAll">
						<view class="checkbox-icon" :class="{ 'selected': isAllSelected }">
							<u-icon v-if="isAllSelected" name="checkmark" color="#fff" size="14"></u-icon>
						</view>
						<text class="select-all-text">全选</text>
					</view>
					<text class="selected-count">已选{{ selectedCount }}条</text>
				</view>
				<text class="summary-label">合计金额: <text class="summary-value">￥{{ totalAmount }}</text></text>
			</view>
			<u-divider style="margin: 8px 0;"></u-divider>
			<view class="bottom-actions">
		    	<u-button 
		    		type="info" 
		    		size="small"
		    		class="action-btn"
					shape="circle"
		    		@click="generatePlan">
		    		生成报价单
		    	</u-button>
		    	<u-button 
		    		type="info" 
		    		size="small"
		    		class="action-btn"
					shape="circle"
		    		@click="generateProposal">
		    		生成ppt
		    	</u-button>
		    	<u-button 
		    		type="info" 
		    		size="small"
		    		class="action-btn"
					shape="circle"
		    		@click="generateContract">
		    		生成合同
		    	</u-button>
		    </view>
		</view>
	</view>
</template>

<script>
import api from '@/utils/api.js'

export default {
	data() {
		return {
			productList: [], // 产品列表
			selectedProducts: [], // 选中状态数组
			totalAmount: 0 // 总金额
		}
	},
	onLoad(options) {
		// 获取传递的产品数据
		if (options.productData) {
			try {
				this.productList = JSON.parse(decodeURIComponent(options.productData))
				// 为每个产品添加quantity字段，默认为1
				this.productList = this.productList.map(product => ({
					...product,
					num: product.num || 1
				}))
				// 初始化选中状态数组，默认全部选中
				this.selectedProducts = new Array(this.productList.length).fill(true)
				console.log('接收到的产品数据:', this.productList)
			} catch (e) {
				console.error('解析产品数据失败:', e)
				// 解析失败时保持空数组，显示空状态
				this.productList = []
				this.selectedProducts = []
			}
		} else {
			// 没有传递数据时保持空数组，显示空状态
			this.productList = []
			this.selectedProducts = []
			console.log('未接收到产品数据，显示空状态')
		}
	},
	computed: {
		// 计算总金额（只计算选中的产品，包含数量）
		calculatedTotal() {
			return this.productList.reduce((total, product, index) => {
				if (this.selectedProducts[index]) {
					const price = parseFloat(product.price) || 0
					const num = product.num || 1
					return total + (price * num)
				}
				return total
			}, 0)
		},
		// 是否全选
		isAllSelected() {
			return this.productList.length > 0 && this.selectedProducts.every(selected => selected)
		},
		// 已选产品数量
		selectedCount() {
			return this.selectedProducts.filter(selected => selected).length
		}
	},
	watch: {
		productList: {
			handler() {
				this.totalAmount = this.calculatedTotal
			},
			deep: true
		},
		selectedProducts: {
			handler() {
				this.totalAmount = this.calculatedTotal
			},
			deep: true
		}
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		// 切换单个产品选中状态
		toggleProductSelect(index) {
			this.$set(this.selectedProducts, index, !this.selectedProducts[index])
		},
		// 切换全选状态
		toggleSelectAll() {
			const newState = !this.isAllSelected
			this.selectedProducts = new Array(this.productList.length).fill(newState)
		},
		// 更新产品数量
		updateQuantity(index, value) {
			this.$set(this.productList[index], 'num', value)
		},
		// 跳转到产品详情页
		goToProductDetail(product) {
			uni.navigateTo({
				url: `/pages/product/detail?id=${product.id}`
			})
		},
		// 生成报价单
		async generatePlan() {
			// 检查是否有选中的产品
			const selectedProducts = this.productList.filter((product, index) => this.selectedProducts[index])
			
			if (selectedProducts.length === 0) {
				uni.showToast({
					title: '请选择至少一个产品',
					icon: 'none'
				})
				return
			}

			try {
				uni.showLoading({ title: '生成报价单中...', mask: true })
				
				// 准备请求数据
				const requestData = {
					products: selectedProducts.map(p => {
                      const { createTime, updateTime, ...rest } = p
                      return {
                        ...rest,
                      };
                    }),
					totalPrice: this.totalAmount
				}

				console.log('生成报价单请求数据:', requestData)

				// 调用生成报价单接口
				const response = await api.quotation.createQuotation(requestData)
				
				if (response.code === 0 && response.data) {
					// 跳转到报价单页面
					const quotationData = encodeURIComponent(JSON.stringify(response.data))
					uni.navigateTo({
						url: `/pages/quotation/quotation?quotationData=${quotationData}`
					})
				} else {
					uni.showToast({
						title: response.msg || '生成报价单失败',
						icon: 'none'
					})
				}
			} catch (error) {
				console.error('生成报价单失败:', error)
				uni.showToast({
					title: '生成报价单失败，请重试',
					icon: 'none'
				})
			} finally {
				uni.hideLoading()
			}
		},
		// 生成合同
		async generateContract() {
			const selectedProducts = this.productList.filter((p, idx) => this.selectedProducts[idx])
			if (selectedProducts.length === 0) {
				uni.showToast({ title: '请选择至少一个产品', icon: 'none' })
				return
			}
			const requestData = {
				products: selectedProducts.map(p => ({ ...p })),
				totalPrice: this.totalAmount
			}
			const payload = encodeURIComponent(JSON.stringify(requestData))
			uni.navigateTo({ url: `/pages/contract/contract?data=${payload}` })
		},
		// 生成PPT
		async generateProposal() {
			const selectedProducts = this.productList.filter((p, idx) => this.selectedProducts[idx])
			if (selectedProducts.length === 0) {
				uni.showToast({ title: '请选择至少一个产品', icon: 'none' })
				return
			}
			const payload = encodeURIComponent(JSON.stringify(selectedProducts))
			uni.navigateTo({ url: `/pages/ppt/ppt?products=${payload}` })
		}
	}
}
</script>

<style lang="scss" scoped>
.scheme-page {
	background: #fff;
	padding-bottom: 120rpx; // 为底部按钮留出空间
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
	padding-top: 88rpx;
	height: calc(100vh - 88rpx - 200rpx);
}

/* 产品列表 */
.product-section {
	padding: 24rpx;
}

/* 空状态样式 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 24rpx;
	text-align: center;
}

.empty-icon {
	font-size: 120rpx;
	margin-bottom: 32rpx;
	opacity: 0.6;
}

.empty-text {
	font-size: 32rpx;
	color: #303133;
	margin-bottom: 16rpx;
	font-weight: 500;
}

.empty-desc {
	font-size: 28rpx;
	color: #909399;
	line-height: 1.5;
}

.product-item {
	display: flex;
	align-items: center;
	padding: 24rpx 24rpx 24rpx 0;
	// margin-bottom: 24rpx;
	// border-radius: 12rpx;
	// box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

/* 产品选中按钮 */
.product-checkbox {
	margin-right: 16rpx;
	margin-top: 4rpx;
}

.checkbox-icon {
	width: 36rpx;
	height: 36rpx;
	border: 2rpx solid #dcdfe6;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s;
	
	&.selected {
		background-color: #d9001bc8;
		border-color: #d9001bc8;
	}
}

.product-info {
	display: flex;
	align-items: center;
	flex: 1;
	cursor: pointer;
	transition: all 0.3s;
}

.product-info:hover {
	opacity: 0.8;
}

.product-logo {
	width: 80rpx;
	height: 80rpx;
	border-radius: 8rpx;
	margin-right: 24rpx;
	border: 1px solid #e4e7ed;
}

.product-details {
	flex: 1;
}

.product-name {
	font-size: 28rpx;
	font-weight: 500;
	color: #303133;
	margin-bottom: 8rpx;
	line-height: 1.4;
}

.product-desc {
	font-size: 24rpx;
	color: #909399;
	line-height: 1.5;
	margin-bottom: 12rpx;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
	text-overflow: ellipsis;
}

/* 价格和数量行 */
.price-quantity-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 8rpx;
}

.product-price {
	font-size: 28rpx;
	font-weight: bold;
	color: #d9001bc8;
}

.quantity-input {
	margin-left: 16rpx;
}

.product-actions {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
	margin-left: 24rpx;
}

/* 统计区域 */
.summary-section {
	padding: 24rpx;
	background: #fff;
	margin: 0 24rpx 16rpx 24rpx;
	border-radius: 12rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.bottom-summary {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

/* 全选按钮容器 */
.select-all-container {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

/* 全选按钮 */
.select-all {
	display: flex;
	align-items: center;
	cursor: pointer;
}

.select-all-text {
	margin-left: 12rpx;
	font-size: 28rpx;
	color: #303133;
}

/* 已选统计 */
.selected-count {
	font-size: 24rpx;
	color: #909399;
}

.summary-label {
	font-size: 28rpx;
	color: #303133;
}

.summary-value {
	font-size: 32rpx;
	font-weight: bold;
	color: #d9001bc8;
}

/* 底部操作按钮 */
.bottom-con {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 24rpx;
	background: #fff;
	box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.1);
	.bottom-actions{
		display: flex;
		justify-content: flex-end;
		font-size: 28rpx;
		padding-left: 70rpx;
		gap: 16rpx;
	}
}
.step-btn{
	width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
