<template>
	<view class="contract-page">
		<!-- <view class="navbar">
			<view class="nav-left" @click="goBack">
				<u-icon name="arrow-left" color="#333" size="20"></u-icon>
			</view>
			<view class="nav-title">产品采购合同</view>
			<view class="nav-right"></view>
		</view> -->

		<scroll-view scroll-y class="content">
			<view class="wrap">
				<view class="paper">
					<!-- <view class="header">
						<view class="title">产品采购合同</view>
					</view> -->
					<view v-if="loading" class="loading">加载中...</view>
					<view v-else>
						<!-- 合同编号与日期 -->
						<view class="meta">
							<text>合同编号：{{ contract.contractNo || '-' }}</text>
							<text style="margin-left: 24rpx;">签署日期：{{ contract.signDate || '' }}</text>
						</view>
						<!-- 甲乙方表格 -->
						<view class="party-table">
							<view class="party-col">
								<view class="party-title">甲方（采购方）</view>
								<view>公司名称：{{ contract.partyA?.company || '' }}</view>
								<view>法定代表人：{{ contract.partyA?.legal || '' }}</view>
								<view>地址：{{ contract.partyA?.address || '' }}</view>
								<view>联系电话：{{ contract.partyA?.phone || '' }}</view>
							</view>
							<view class="party-col">
								<view class="party-title">乙方（供应方）</view>
								<view>公司名称：{{ contract.partyB?.company || '' }}</view>
								<view>法定代表人：{{ contract.partyB?.legal || '' }}</view>
								<view>地址：{{ contract.partyB?.address || '' }}</view>
								<view>联系电话：{{ contract.partyB?.phone || '' }}</view>
							</view>
						</view>
						<!-- 合同正文（后端返回HTML） -->
						<view class="content-html" v-html="contentHtml"></view>
						<!-- 签字栏 -->
						<view class="signature">
							<view class="sig-col">
								<view class="sig-title">甲方（采购方）</view>
								<view>签字：_______________</view>
								<view>盖章：</view>
								<view>日期：_______________</view>
							</view>
							<view class="sig-col">
								<view class="sig-title">乙方（供应方）</view>
								<view>签字：_______________</view>
								<view>盖章：</view>
								<view>日期：_______________</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
        <!-- 底部操作按钮 -->
        <view class="bottom-actions">
            <u-button type="info" size="small" class="action-btn" shape="circle" @click="shareContract">
                分享
            </u-button>
            <u-button type="info" size="small" class="action-btn" shape="circle" @click="downloadContractPdf">
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
			contract: {},
			contentHtml: '',
			loading: true
		}
	},
	onLoad(options) {
		try {
			// 从本地存储获取合同数据
			const storedData = uni.getStorageSync('contractData')
			if (!storedData) { 
				this.loading = false
				console.log('未找到合同数据')
				return 
			}
			
			console.log('从本地存储获取的合同数据:', storedData)
			this.fetchContract(storedData)
			
			// 清除存储的数据
			uni.removeStorageSync('contractData')
		} catch (e) { 
			this.loading = false
			console.error('获取合同数据失败:', e)
		}
	},
	methods: {
		goBack() { uni.navigateBack() },
		async fetchContract(data) {
			try {
				uni.showLoading({ title: '生成合同中...', mask: true })
				const res = await api.contract.generate(data)
				if (res.code === 0 && res.data) {
					this.contract = res.data
					const html = typeof res.data.content === 'string' ? res.data.content.replace(/\r\n|\n|\r/g, '<br/>') : (res.data.content || '')
					this.contentHtml = html
				} else {
					uni.showToast({ title: res.msg || '生成合同失败', icon: 'none' })
				}
			} catch (e) {
				uni.showToast({ title: '生成合同失败', icon: 'none' })
			} finally {
				this.loading = false
				uni.hideLoading()
		    }
	    },
		// 下载合同word
		async downloadContractPdf() {
			try {
				if (!this.contract?.contractNo || !this.contract?.content) {
					uni.showToast({ title: '合同数据未就绪', icon: 'none' })
					return
				}
				uni.showLoading({ title: '下载中...', mask: true })
				const res = await api.contract.downloadContract({ contractNo: this.contract.contractNo, content: this.contract.content })
				const arrayBuffer = res?.data || res
				if (!arrayBuffer) throw new Error('未获取到文件数据')

				// #ifdef H5
				const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
				const url = window.URL.createObjectURL(blob)
				const a = document.createElement('a')
				a.href = url
				a.download = `合同_${this.contract.contractNo || Date.now()}.docx`
				document.body.appendChild(a)
				a.click()
				document.body.removeChild(a)
				window.URL.revokeObjectURL(url)
				// #endif

				// #ifdef MP-WEIXIN
				try {
					const filePath = `${wx.env.USER_DATA_PATH}/合同_${this.contract.contractNo || Date.now()}.docx`
					const fs = wx.getFileSystemManager()
					fs.writeFileSync(filePath, arrayBuffer)
					uni.openDocument({
						filePath,
						fileType: 'docx',
						showMenu: true,
						success: () => {},
						fail: () => {
							uni.showToast({ title: '打开合同失败', icon: 'none' })
						}
					})
				} catch (err) {
					uni.showToast({ title: '保存文件失败', icon: 'none' })
				}
				// #endif

				// #ifdef APP-PLUS
				const fileName = `合同_${this.contract.contractNo || Date.now()}.docx`
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
		// 分享合同（返回链接或直接返回文件流）
		async shareContract() {
			try {
				if (!this.contract?.contractNo || !this.contract?.content) {
					uni.showToast({ title: '合同数据未就绪', icon: 'none' })
					return
				}
				uni.showLoading({ title: '生成分享链接...', mask: true })
				const res = await api.contract.buildDownloadContract({ contractNo: this.contract.contractNo, content: this.contract.content, isShare: true })
				const data = res?.data
				// 如果后端直接返回URL
				if (typeof data === 'string') {
					if (uni.setClipboardData) {
						uni.setClipboardData({ data, success: () => {} })
					}
					uni.showModal({ title: '分享链接', content: data, showCancel: false })
					return
				}
				// 否则尝试按文件流处理
				const arrayBuffer = data || res
				if (arrayBuffer && (typeof window !== 'undefined')) {
					const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
					const url = window.URL.createObjectURL(blob)
					if (uni.setClipboardData) {
						uni.setClipboardData({ data: url, success: () => {} })
					}
					uni.showModal({ title: '分享链接', content: url, showCancel: false })
					return
				}
				uni.showToast({ title: '未获取到分享内容', icon: 'none' })
			} catch (e) {
				uni.showToast({ title: (e && e.message) || '分享失败，请稍后重试', icon: 'none' })
			} finally {
				uni.hideLoading()
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.contract-page { background: #fff; }
.navbar { display: flex; align-items: center; justify-content: space-between; height: 88rpx; padding: 0 32rpx; background: #fff; border-bottom: 1px solid #e4e7ed; position: fixed; top:0; left:0; right:0; z-index:1000; }
.nav-left, .nav-right { width:60rpx; height:60rpx; display:flex; align-items:center; justify-content:center; }
.nav-title { flex:1; text-align:center; font-size:32rpx; font-weight:600; color:#303133; }
.content { height: calc(100vh - 88rpx); }
.wrap { padding: 16rpx; }
.paper { padding: 24rpx 0 55px 0; min-height: 600rpx; font-size: 26rpx;}
.title { font-size: 36rpx; font-weight: 700; }
.meta { display:flex; align-items:center; margin-bottom: 16rpx; color:#606266; font-size: 26rpx; }
.party-table { display:flex; gap: 24rpx; margin: 16rpx 0; color:#303133;}
.party-col { flex:1; padding: 16rpx 0; }
.party-title { font-weight: 600; margin-bottom: 8rpx; }
.content-html { font-size: 26rpx; color:#303133; line-height: 1.7; white-space: normal; word-break: break-word; }
.signature { display:flex; gap:24rpx; margin-top: 32rpx; padding-top: 16rpx; border-top: 1px dashed #e4e7ed; }
.sig-col { flex:1; text-align:center; }
.sig-title { font-weight: 600; margin-bottom: 8rpx; }
.loading { text-align:center; color:#909399; padding: 32rpx 0; }
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


