<template>
	<view class="page">
		<!-- <u-navbar title="AI智能销售助手" placeholder :autoBack="false">
			<template #right>
				<u-icon name="more-dot-fill" size="20"></u-icon>
			</template>
		</u-navbar> -->

		<view class="card">
			<view class="input-container">
				<!-- H5 语音输入备选方案 -->
				<!-- #ifdef H5 -->
				<input 
					v-if="useNativeVoiceInput"
					v-model="description" 
					placeholder="请描述您的需求，描述越详细，AI推荐越精准。可提及品牌、行业类型、数据条件等具体信息，获得更贴近场景的智能推荐产品"
					class="native-voice-input"
					x-webkit-speech
					@webkitspeechchange="onVoiceInputChange"
					@input="onTextInput"
				/>
				<!-- #endif -->
				
				<!-- 默认文本域 -->
				<u-textarea 
					v-if="!useNativeVoiceInput"
					v-model="description" 
					placeholder="请描述您的需求，描述越详细，AI推荐越精准。可提及品牌、行业类型、数据条件等具体信息，获得更贴近场景的智能推荐产品" 
					height="100" 
					cursor-color="#007aff"
					:maxlength="300"
					:disabled="isRecording">
				</u-textarea>
				
				<view class="mic" @click="toggleVoiceInput">
					<view class="voice-animation" v-if="isRecording">
				    	<view class="voice-wave"></view>
				    	<view class="voice-wave"></view>
				    	<view class="voice-wave"></view>
				    </view>
					<u-icon 
						name="mic" 
						:color="isRecording ? '#07c160' : '#909399'" 
						size="22">
					</u-icon>
				</view>
			</view>
			<!-- 语音输入状态提示 -->
			<!-- <view v-if="isRecording" class="voice-status">
				<view class="voice-animation">
					<view class="voice-wave"></view>
					<view class="voice-wave"></view>
					<view class="voice-wave"></view>
				</view>
				<text class="voice-text">{{ interimText || '正在录音中，请说话...' }}</text>
				<u-button type="error" size="mini" @click="stopRecording" style="width: 20px;">停止录音</u-button>
			</view> -->
			<view class="filters">
				<u-dropdown ref="dropdown">
					<!-- <u-dropdown-item title="产品预算" >
						<view class="slot-content">
							<u-input 
								v-model="budget" 
								placeholder="请输入预算金额" 
								type="number"
								clearable>
								<template #suffix>  
									<text class="budget-unit-inline">元</text>
								</template>
							</u-input>
							<view class="budget-actions">
								<u-button 
									type="info" 
									size="small" 
									@click="cancelDropdown('budget')">
									重置
								</u-button>
								<u-button 
									type="primary" 
									size="small" 
									@click="confirmProCount">
									确定
								</u-button>
							</view>
						</view>
					</u-dropdown-item> -->
					<u-dropdown-item title="行业类型">
						<view class="slot-content">
							<!-- 行业类型数据循环出来的tag -->
							<view class="industry-tag-container">
						    	<u-tag 
						    		v-for="item in industryOptions" 
						    		:key="item.value" 
						    		:text="item.label" 
						    		:plain= "typeLabels.includes(item.value) ? false : true" 
						    		size="mini"
						    		shape="circle"
						    		class="industry-tag"
						    		@click="selectLabels('typeLabels', item.value)">
						    	</u-tag>
						    </view>
							<view class="budget-actions">
								<u-button 
									type="info" 
									size="small" 
									@click="cancelDropdown('typeLabels', [])">
									重置
								</u-button>
								<u-button 
									type="primary" 
									size="small" 
									@click="confirmProCount">
									确定
								</u-button>
							</view>
						</view>
					</u-dropdown-item>
					<u-dropdown-item title="相关产品数量" ref="proCountDropdown">
						<view class="slot-content">
							<u-input 
								v-model="productCount" 
								placeholder="请输入产品数量" 
								type="number"
								cursor-color="#007aff"
								clearable>
								<template #suffix>
									<text class="budget-unit-inline">条</text>
								</template>
							</u-input>
							<view class="budget-actions">
								<u-button 
									type="info" 
									size="small" 
									@click="cancelDropdown('productCount')">
									重置
								</u-button>
								<u-button 
									type="primary" 
									size="small" 
									@click="confirmProCount">
									确定
								</u-button>
							</view>
						</view>
					</u-dropdown-item>
					<u-dropdown-item title="标签" :options="tagOptions">
						<view class="slot-content">
							<!-- 标签数据循环出来的tag -->
							<view class="industry-tag-container">
							    <u-tag 
							    	v-for="item in tagOptions" 
							    	:key="item.value" 
							    	:text="item.label" 
							    	:plain= "labels.includes(item.value) ? false : true" 
							    	size="mini"
							    	shape="circle"
							    	class="industry-tag"
							    	@click="selectLabels('labels', item.value)">
							    </u-tag>
							</view>
							<view class="budget-actions">
								<u-button 
									type="info" 
									size="small" 
									@click="cancelDropdown('labels', [])">
									重置
								</u-button>
								<u-button 
									type="primary" 
									size="small" 
									@click="confirmProCount">
									确定
								</u-button>
							</view>
						</view>
					</u-dropdown-item>
				</u-dropdown>
			</view>
			<u-button type="primary" shape="square" class="submit" @click="recommend">AI智能推荐产品</u-button>
		</view>
		
		<!-- 推荐产品组合展示区域 -->
		<view v-if="recommendProducts.length > 0" class="recommend-section">
			<view class="recommend-title">推荐产品组合</view>
			<view class="product-list">
				<view 
					v-for="(product, index) in recommendProducts" 
					:key="index" 
					class="product-card"
					@click="goToProductDetail(product)">
					<view class="product-info">
						<image 
							:src="product.logo || '/static/defaultPro.png'" 
							class="product-logo"
							mode="aspectFit">
						</image>
						<view class="product-details">
							<view class="product-name">{{ product.name}}</view>
							<view class="product-desc">{{ product.description || '' }}</view>
							<view class="product-price">￥{{ product.price || '' }}/{{ periodUnit(product.period) }}</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<u-float-button 
			:backgroundColor="fabPattern.buttonColor" 
			:color="fabPattern.iconColor" 
			right="24rpx" 
			bottom="200rpx" 
			@click="onFab">
			<u-icon name="file-text" :color="fabPattern.iconColor" size="20"></u-icon>
			<span class="fab-text">生成方案</span>
		</u-float-button>
	</view>
</template>

<script>
	import api from '@/utils/api.js'
	
	export default {
		data() {
			return {
				description: '思政助手',
				// budget: '', // 实际的预算值
				productCount: '',
				typeLabels: [],
				labels: [],
				industryOptions: [],
				tagOptions: [],
				recommendProducts: [], // 推荐产品列表
				fabPattern: {
					buttonColor: '#ffffff',
					iconColor: '#606266'
				},
				// 语音输入相关
				isRecording: false,
				voiceInputSupported: false,
				useNativeVoiceInput: false,
				// 微信同声传译插件
				wxAsrManager: null,
				interimText: ''
			}
		},
		onLoad() {
			// 页面加载时获取数据
			this.fetchIndustryTypes()
			this.fetchAllLabels()
			this.initVoiceInput()
		},
		onShow() {
			// 仅在小程序端检查录音权限
			// #ifdef MP-WEIXIN
			this.ensureRecordPermission()
			// #endif
		},
		methods: {
			async recommend() {
				// 验证描述和标签必须有一个有值
				if (!this.description && (!this.labels || this.labels.length === 0)) {
					uni.showToast({ 
						title: '请填写描述或标签', 
						icon: 'none',
						duration: 2000
					})
					return
				}

				const requestData = {
					description: this.description || '',
					typeLabels: this.typeLabels || [],
					// budget: this.budget || '',
					productCount: this.productCount || '',
					labels: this.labels.join(',') || ''
				}

				console.log('提交数据：', requestData)

				try {
					uni.showLoading({ title: 'AI推荐中...', mask: true })
					const response = await api.product.fetchAIRecommendProducts(requestData)
					
					if (response.code === 0) {
						// 存储推荐产品数据
						this.recommendProducts = response.data.products || []
						
						uni.showToast({ 
							title: response.msg || `推荐成功`, 
							icon: 'success',
							duration: 2000
						})
						
						// 滚动到推荐结果区域
						setTimeout(() => {
							uni.pageScrollTo({
								selector: '.recommend-section',
								duration: 500
							})
						}, 500)
					} else {
						uni.showToast({ 
							title: response.msg || '推荐失败', 
							icon: 'none',
							duration: 2000
						})
					}
				} catch (error) {
					console.error('AI推荐失败:', error)
					uni.showToast({ 
						title: '推荐失败，请重试', 
						icon: 'none',
						duration: 2000
					})
				} finally {
					uni.hideLoading()
				}
			},
			onFab() {
				// 检查是否有推荐产品组合
				if (!this.recommendProducts || this.recommendProducts.length === 0) {
					uni.showToast({
						title: '请搜索产品',
						icon: 'none',
						duration: 2000
					})
					return
				}
				
				// 将推荐产品数据传递到生成方案页面
				const productData = encodeURIComponent(JSON.stringify(this.recommendProducts))
				uni.navigateTo({
					url: `/subpages/scheme/scheme?productData=${productData}`
				})
			},
			confirmBudget() {
				this.closeDropdown()
			},
			cancelDropdown(ref, value='') {
				// 重置选择状态
				this[ref] = value || ''
				this.closeDropdown()
			},
			selectLabels(field,value) {
				// 切换选中状态
				if (this[field].includes(value)) {
					// 如果已选中，则取消选中
					this[field] = this[field].filter(item => item !== value)
				} else {
					// 如果未选中，则添加选中
					this[field].push(value)
				}
			},
			// 获取行业类型数据
			async fetchIndustryTypes() {
				try {
					const response = await api.dict.fetchProductTypes('sale_product_type')
					if (response.data && Array.isArray(response.data)) {
						// 转换数据格式为 { label, value } 格式
						this.industryOptions = response.data.map(item => ({
							label: item.label,
							value: item.label
						}))
					}
				} catch (error) {
					console.error('获取行业类型失败:', error)
				}
			},
			// 获取所有标签数据
			async fetchAllLabels() {
				try {
					const response = await api.product.getAllLabels()
					if (response.data && Array.isArray(response.data)) {
						// 转换数据格式为 { label, value } 格式
						this.tagOptions = response.data.map(item => ({
							label: item,
							value: item
						}))
					}
				} catch (error) {
					console.error('获取标签数据失败:', error)
				}
			},
			// 跳转到产品详情页
			goToProductDetail(product) {
							uni.navigateTo({
				url: `/subpages/product/detail?id=${product.id}`
			})
			},
			confirmProCount() {
				this.closeDropdown()
			},
			closeDropdown(ref) {
				// 关闭下拉菜单
				if (this.$refs.dropdown) {
					this.$refs.dropdown.close()
				}
			},
			// 初始化语音输入
			initVoiceInput() {
				// 检查是否支持语音输入
				// #ifdef H5
				// 检查是否支持原生语音输入
				if (typeof window !== 'undefined') {
					// 尝试使用 x-webkit-speech 属性
					const testInput = document.createElement('input')
					if ('webkitSpeech' in testInput || 'speech' in testInput) {
						this.useNativeVoiceInput = true
						this.voiceInputSupported = true
						console.log('使用原生语音输入')
						return
					}
					
					// 检查是否支持 Web Speech API
					if ('webkitSpeechRecognition' in window) {
						this.voiceInputSupported = true
						console.log('使用 Web Speech API')
					}
				}
				// #endif
				
				// #ifdef MP-WEIXIN
				// 初始化微信同声传译插件（实时语音转文字）
				try {
					const plugin = requirePlugin('WechatSI')
					this.wxAsrManager = plugin.getRecordRecognitionManager()
					this.wxAsrManager.onRecognize = (res) => {
						console.log('语音识别结果:', res)
						this.isRecording = true
						if(res.result) {
							this.description = this.description + res.result
						}
					}
					this.wxAsrManager.onStop = (res) => {
						console.log('语音识别停止:', res)
						this.isRecording = false
						const finalText = (res && res.result) ? res.result : ''
						if (finalText) {
							this.description = this.description + finalText
							uni.showToast({ title: '语音识别成功', icon: 'success' })
						} else {
							uni.showToast({ title: '未识别到语音', icon: 'none' })
						}
						this.interimText = ''
					}
					this.wxAsrManager.onError = (err) => {
						this.isRecording = false
						this.interimText = ''
						const tips = {
                          '-30003': '说话时间间隔太短，无法识别语音',
                          '-30004': '没有听清，请再说一次~',
                          '-30011': '上个录音正在识别中，请稍后尝试',
                        };
						const retcode = (err && err.retcode != null) ? String(err.retcode) : '';
						console.error('语音识别错误:', err)
						uni.showToast({ title: tips[`${retcode}`] || '语音识别失败', icon: 'none' })
					}
					this.voiceInputSupported = true
				} catch (e) {
					console.error('WechatSI 插件初始化失败:', e)
					this.voiceInputSupported = false
				}
				// #endif
			},
			// 切换语音输入
			toggleVoiceInput() {
				if (this.isRecording) {
					this.stopRecording()
				} else {
					this.startRecording()
				}
			},
			// 开始录音
			startRecording() {
				// #ifdef H5
				if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
					this.startWebSpeechRecognition()
				} else {
					uni.showToast({ title: '当前浏览器不支持语音输入', icon: 'none' })
				}
				// #endif

				// #ifdef MP-WEIXIN
				this.startWxAsr()
				// #endif
			},
			// H5 语音识别
			startWebSpeechRecognition() {
				const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
				if (!SpeechRecognition) {
					uni.showToast({ title: '当前浏览器不支持语音输入', icon: 'none' })
					return
				}
				
				const recognition = new SpeechRecognition()
				recognition.lang = 'zh-CN'
				recognition.continuous = false
				recognition.interimResults = false
				
				recognition.onstart = () => {
					this.isRecording = true
					uni.showToast({ title: '开始录音', icon: 'none' })
				}
				
				recognition.onresult = (event) => {
					const result = event.results[0][0].transcript
					this.description = this.description + result
					uni.showToast({ title: '语音识别成功', icon: 'success' })
				}
				
				recognition.onerror = (event) => {
					console.error('语音识别错误:', event.error)
					uni.showToast({ title: '语音识别失败', icon: 'none' })
				}
				
				recognition.onend = () => {
					this.isRecording = false
				}
				
				recognition.start()
			},
			// 停止录音
			stopRecording() {
				// #ifdef H5
				// H5 模式下，语音识别会自动停止
				this.isRecording = false
				// #endif
				// #ifdef MP-WEIXIN
				this.stopWxAsr()
				// #endif
			},
			// 微信同声传译：开始/停止
			startWxAsr() {
				if (!this.wxAsrManager) {
					uni.showToast({ title: '语音识别不可用', icon: 'none' })
					return
				}
				// #ifdef MP-WEIXIN
				this.ensureRecordPermission().then((granted) => {
					if (!granted) return
					this._doStartWxAsr()
				})
				return
				// #endif
				this._doStartWxAsr()
			},
			_doStartWxAsr() {
				this.interimText = ''
				try {
					this.wxAsrManager.start({
						lang: 'zh_CN',
						duration: 60000
					})
					this.isRecording = true
					uni.showToast({ title: '开始录音', icon: 'none' })
				} catch (e) {
					console.error('启动语音识别失败:', e)
					uni.showToast({ title: '语音识别启动失败', icon: 'none' })
				}
			},
			stopWxAsr() {
				if (this.wxAsrManager) {
					try { this.wxAsrManager.stop() } catch (e) {}
				}
			},
			// 录音权限校验与引导
			ensureRecordPermission() {
				return new Promise((resolve) => {
					uni.getSetting({
						success: (res) => {
							const authed = !!res.authSetting['scope.record']
							if (authed) { resolve(true); return }
							uni.authorize({
								scope: 'scope.record',
								success: () => resolve(true),
								fail: () => {
									this.promptOpenSetting('请授权录音，用于语音识别').then(ok => resolve(!!ok)).catch(() => resolve(false))
								}
							})
						},
						fail: () => resolve(false)
					})
				})
			},
			promptOpenSetting(tip) {
				return new Promise((resolve, reject) => {
					uni.showModal({
						title: '提示',
						content: tip,
						confirmText: '去授权',
						cancelText: '取消',
						success: (res) => {
							if (res.confirm) {
								uni.openSetting({
									success: (st) => resolve(st.authSetting && st.authSetting['scope.record'])
								})
							} else {
								reject('用户取消授权')
							}
						}
					})
				})
			},
			// 原生语音输入事件处理
			onVoiceInputChange(event) {
				console.log('语音输入结果:', event.target.value)
				this.description = event.target.value
				uni.showToast({ title: '语音输入成功', icon: 'success' })
			},
			// 文本输入事件处理
			onTextInput(event) {
				this.description = event.target.value
			},
			periodUnit(period) {
				const unitMap = {
					year: '年',
					season: '季',
					month: '月',
					disposable: '一次性'
				}
				return unitMap[period] || '一次性'
			}
		}
	}
</script>

<style scoped>
	.page { 
		background: #ffffff; 
		/* 设置页面级别的层叠上下文 */
		position: relative;
		z-index: 1;
		padding: 0 24rpx;
	}
	.card { 
		background: #ffffff; 
		margin: 24rpx 0; 
		padding: 24rpx; 
		border-radius: 12rpx; 
		position: relative; 
		border: 1px solid #e5e6eb;
		/* 重要：允许子元素溢出 */
		overflow: visible;
		/* 确保卡片有足够的层级 */
		z-index: 10;
	}
	.input-container { position: relative; }
	.mic { 
		position: absolute; 
		right: 24rpx; 
		bottom: 24rpx; 
		cursor: pointer;
		transition: all 0.3s;
		display: flex;
	}
	.mic:hover { transform: scale(1.1); }
	
	/* 语音输入状态样式 */
	.voice-status {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16rpx;
		background: #f8f9fa;
		border-radius: 8rpx;
		margin-top: 16rpx;
		gap: 16rpx;
	}
	
	.voice-animation {
		display: flex;
		align-items: center;
		gap: 4rpx;
	}
	
	.voice-wave {
		width: 4rpx;
		height: 20rpx;
		background: #07c160;
		border-radius: 2rpx;
		animation: voiceWave 1s infinite ease-in-out;
	}
	
	.voice-wave:nth-child(2) {
		animation-delay: 0.2s;
	}
	
	.voice-wave:nth-child(3) {
		animation-delay: 0.4s;
	}
	
	@keyframes voiceWave {
		0%, 100% { height: 20rpx; }
		50% { height: 40rpx; }
	}
	
	.voice-text {
		font-size: 24rpx;
		color: #606266;
		flex: 1;
	}
	
	/* 原生语音输入样式 */
	.native-voice-input {
		width: 100%;
		height: 100rpx;
		padding: 16rpx 24rpx;
		border: 1px solid #e4e7ed;
		border-radius: 8rpx;
		font-size: 28rpx;
		line-height: 1.5;
		background: #fff;
		resize: none;
		outline: none;
		box-sizing: border-box;
	}
	
	.native-voice-input:focus {
		border-color: #d9001bc8;
	}
	.filters { 
		margin-top: 20rpx; 
		/* 关键修改：允许下拉内容溢出容器 */
		overflow: visible !important;
		/* 设置高层级确保下拉菜单显示在最上层 */
		position: relative;
		z-index: 9999;
	}
	.submit { margin-top: 24rpx; }
	
	/* 预算输入弹窗样式 */
	.budget-input-container {
		padding: 20rpx 0;
	}
	
	.budget-unit {
		color: #909399;
		font-size: 28rpx;
	}
	
	/* slot自定义下拉菜单样式 */
	.slot-content {
		padding: 20rpx;
		background: #ffffff;
	}
	
	.budget-options {
		margin-bottom: 20rpx;
	}
	
	.budget-option {
		padding: 24rpx;
		border-bottom: 1px solid #f5f5f5;
		color: #606266;
		font-size: 28rpx;
		transition: all 0.3s;
		cursor: pointer;
	}
	
	.budget-option:last-child {
		border-bottom: none;
	}
	
	.budget-option.active {
		color: #2979ff;
		background: #f0f8ff;
	}
	
	.budget-option:hover {
		background: #f8f9fa;
	}
	
	.custom-budget-section {
		margin: 20rpx 0;
		padding: 20rpx;
		background: #f8f9fa;
		border-radius: 8rpx;
	}
	
	.custom-input-wrapper {
		margin-bottom: 20rpx;
	}
	
	.budget-unit-inline {
		color: #909399;
		font-size: 28rpx;
		margin-left: 8rpx;
	}
	
	.budget-actions {
		display: flex;
		justify-content: flex-end;
		gap: 20rpx;
		margin-top: 20rpx;
	}
</style>

<!-- 添加全局样式确保 dropdown 组件正常显示 -->
<style>
    .u-input{
    	background: #fff;
    }
	/* 全局样式，确保uview dropdown组件的遮罩和内容能正常显示 */
	.u-dropdown__popup,
	.u-dropdown__mask,
	.u-dropdown__content {
		z-index: 99999 !important;
	}
	.u-dropdown__content {
		width: calc(100% + 48rpx)!important;
		left: -24rpx!important;
	}
	
	/* 确保页面容器不会裁剪dropdown内容 */
	page {
		overflow: visible !important;
	}
	
	/* 如果dropdown内容仍被裁剪，可以尝试这个 */
	.u-dropdown {
		position: static !important;
	}
	
	/* 推荐产品展示样式 */
	
	.recommend-title {
		font-size: 28rpx;
		color: #303133;
		margin-bottom: 20rpx;
		text-align: left;
	}
	
	.product-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}
	
	.product-card {
		display: flex;
		align-items: flex-start;
		padding: 24rpx;
		border-radius: 12rpx;
		transition: all 0.3s;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
		cursor: pointer;
	}
	
	.product-card:hover {
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
		transform: translateY(-2rpx);
	}
	
	.product-info {
		display: flex;
		align-items: center;
		flex: 1;
	}
	
	.product-logo {
		width: 80rpx;
		height: 80rpx;
		border-radius: 8rpx;
		margin-right: 24rpx;
		background: #ffffff;
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
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.product-price {
		font-size: 28rpx;
		font-weight: bold;
		color: #d9001bc8;
		margin-top: 12rpx;
	}
	
	/* 浮动按钮样式 */
	::v-deep .u-float-button__main {
		border: 2px solid #e4e7ed !important;
		box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.15) !important;
		flex-direction: column !important;
	}
	.fab-text{
		font-size: 20rpx;
	}
	.industry-tag-container{
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
        row-gap: 16rpx;
	}
</style>
