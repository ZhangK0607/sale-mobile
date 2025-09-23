<template>
	<view class="scheme-page">
		<!-- 自定义导航栏 -->
		<!-- <view class="navbar">
			<view class="nav-left" @click="goBack">
				<u-icon name="arrow-left" color="#333" size="20"></u-icon>
			</view>
			<view class="nav-title">AI智能销售助手</view>
			<view class="nav-right">
				<u-icon name="more-dot-fill" color="#333" size="20"></u-icon>
			</view>
		</view> -->

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
							<view class="product-price">￥{{ product.price || '' }}/{{ periodUnit(product.period) }}</view>
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
				<view class="summary-right">
					<text class="summary-label">合计金额: <text class="summary-value">￥{{ formatAmount(calculatedTotal) }}</text></text>
					<picker mode="selector" :range="periodOptions" range-key="label" :value="periodIndex" @change="onPeriodChange">
						<view class="period-trigger">
							<text class="period-selected">/{{ periodUnit(selectedPeriod) }}</text>
							<u-icon name="arrow-down" color="#909399" size="14" class="period-icon"></u-icon>
						</view>
					</picker>
				</view>
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
		    selectedPeriod: 'year',
		    periodOptions: [
		    	{ value: 'year', label: '年' },
		    	{ value: 'season', label: '季度' },
		    	{ value: 'month', label: '月' }
		    ],
		    dataLoaded: false // 标记数据是否已加载
		}
	},
	onLoad(options) {
		// 从本地存储获取产品数据
		try {
			const storedProducts = uni.getStorageSync('recommendProducts')
			if (storedProducts && Array.isArray(storedProducts) && storedProducts.length > 0) {
				// 为每个产品添加quantity字段，默认为1
				this.productList = storedProducts.map(product => ({
					...product,
					num: product.num || 1
				}))
				// 初始化选中状态数组，默认全部选中
				this.selectedProducts = new Array(this.productList.length).fill(true)
				console.log('从本地存储获取的产品数据:', this.productList)
				
				// 标记数据已读取，在页面卸载时清除
				this.dataLoaded = true
			} else {
				// 没有数据时显示空状态
				this.productList = []
				this.selectedProducts = []
				console.log('未找到产品数据，显示空状态')
			}
		} catch (e) {
			console.error('获取产品数据失败:', e)
			// 获取失败时保持空数组，显示空状态
			this.productList = []
			this.selectedProducts = []
		}
	},
	onUnload() {
		// 页面卸载时清除存储的数据
		if (this.dataLoaded) {
			uni.removeStorageSync('recommendProducts')
		}
	},
	computed: {
		// 计算总金额（只计算选中的产品，包含数量）
		calculatedTotal() {
		    const total = this.productList.reduce((sum, p, index) => {
		    	if (!this.selectedProducts[index]) return sum
		    	const price = parseFloat(p.price) || 0
		    	const src = p.period
		    	const factor = this.periodFactor(this.selectedPeriod, src)
		    	const qty = p.num || 0
		    	return sum + (price * factor * qty)
		    }, 0)
		    return Math.round(total * 100) / 100
		},
	periodIndex() {
		return Math.max(0, this.periodOptions.findIndex(opt => opt.value === this.selectedPeriod))
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
watch: {},
	methods: {
		goBack() {
			uni.navigateBack()
		},
	    onPeriodChange(e) {
	    	const index = e.detail.value
	    	const option = this.periodOptions[index]
	    	this.selectedPeriod = option?.value || this.selectedPeriod
	    },
	    computeSubtotal(price, quantity, productPeriod, targetPeriod) {
	    	const factor = this.periodFactor(targetPeriod, productPeriod)
	    	const subtotalPrice = (Number(price) || 0) * (Number(quantity) || 0) * factor
	    	return Math.round(subtotalPrice * 100) / 100
	    },
	    formatAmount(value) {
	    	const n = Number(value)
	    	if (!isFinite(n)) return '0.00'
	    	return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	    },
	    periodFactor(target, source) {
	    	const src = source || 'disposable'
	    	if (target === 'month') {
	    		if (src === 'month') return 1
	    		if (src === 'season') return 1 / 3
	    		if (src === 'year') return 1 / 12
	    		return 1
	    	}
	    	if (target === 'season') {
	    		if (src === 'season') return 1
	    		if (src === 'month') return 3
	    		if (src === 'year') return 1 / 4
	    		return 1
	    	}
	    	if (target === 'year') {
	    		if (src === 'year') return 1
	    		if (src === 'month') return 12
	    		if (src === 'season') return 4
	    		return 1
	    	}
	    	return 1
	    },
	    periodUnit(period) {
	    	const unitMap = {
	    		year: '年',
	    		season: '季',
	    		month: '月',
	    		disposable: '一次性'
	    	}
	    	return unitMap[period] || '一次性'
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
				url: `/subpages/product/detail?id=${product.id}`
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
				      const price = typeof p?.price === 'number' ? p.price : parseFloat(p?.price) || 0
				      const quantity = typeof (p?.num ?? 0) === 'number' ? (p?.num ?? 0) : parseFloat(p?.num) || 0
				      const subtotalPrice = this.computeSubtotal(price, quantity, p?.period, this.selectedPeriod)
				      return {
				        ...rest,
				        subtotalPrice,
				      };
                    }),
					totalPrice: this.calculatedTotal
				}

				console.log('生成报价单请求数据:', requestData)

				// 调用生成报价单接口
				const response = await api.quotation.createQuotation(requestData)
				
				if (response.code === 0 && response.data) {
					// 使用本地存储传递数据，避免URL参数长度限制
					uni.setStorageSync('quotationData', response.data)
					uni.setStorageSync('quotationPeriod', this.selectedPeriod)
					uni.navigateTo({
						url: '/subpages/quotation/quotation'
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
				products: selectedProducts.map(p => {
                  const { createTime, updateTime, ...rest } = p
				  const price = typeof p?.price === 'number' ? p.price : parseFloat(p?.price) || 0
				  const quantity = typeof (p?.num ?? 0) === 'number' ? (p?.num ?? 0) : parseFloat(p?.num) || 0
				  const subtotalPrice = this.computeSubtotal(price, quantity, p?.period, this.selectedPeriod)
				  return {
				    ...rest,
				    subtotalPrice,
				  };
                }),
				totalPrice: this.calculatedTotal
			}
			// 使用本地存储传递数据，避免URL参数长度限制
			uni.setStorageSync('contractData', requestData)
			uni.navigateTo({ url: '/subpages/contract/contract' })
		},
		// 生成PPT
		async generateProposal() {
			const selectedProducts = this.productList.filter((p, idx) => this.selectedProducts[idx])
			if (selectedProducts.length === 0) {
				uni.showToast({ title: '请选择至少一个产品', icon: 'none' })
				return
			}
			// 使用本地存储传递数据，避免URL参数长度限制
			uni.setStorageSync('pptProducts', selectedProducts)
			uni.navigateTo({ url: '/subpages/ppt/ppt' })
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
	line-clamp: 2;
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

.summary-right {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.period-selected {
	font-size: 28rpx;
	color: #303133;
	margin-left: 8rpx;
}

.period-trigger{
	display: inline-flex;
	align-items: center;
	gap: 8rpx;
}

.period-icon{
	margin-left: 4rpx;
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
