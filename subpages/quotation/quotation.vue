<template>
    <view class="quotation-page">
        <!-- 自定义导航栏 -->
        <view class="navbar">
            <view class="nav-left" @click="goBack">
                <u-icon name="arrow-left" color="#333" size="20"></u-icon>
            </view>
            <view class="nav-title">报价单</view>
            <view class="nav-right">
                <u-icon name="close" color="#333" size="20" @click="goBack"></u-icon>
            </view>
        </view>

        <scroll-view scroll-y class="content">
            <view class="quotation-container">
                <!-- 报价单头部 -->
                <view class="header-section">
                    <view class="section-title">销售方信息</view>
                    <view class="info-item">
                        <text class="label">公司名称：</text>
                        <text class="value">{{ quotationData.sellerInfo?.company || '销售方公司' }}</text>
                    </view>
                    <view class="info-item">
                        <text class="label">联系人：</text>
                        <text class="value">{{ quotationData.sellerInfo?.name || quotationData.salesperson || '-'
                            }}</text>
                    </view>
                    <view class="info-item">
                        <text class="label">电话：</text>
                        <text class="value">{{ quotationData.sellerInfo?.phone || '-' }}</text>
                    </view>
                    <view class="info-item">
                        <text class="label">邮箱：</text>
                        <text class="value">{{ quotationData.sellerInfo?.email || '-' }}</text>
                    </view>
                </view>
                <view class="header-section">
                    <view class="section-title">报价信息</view>
                    <view class="info-item">
                        <text class="label">报价单号：</text>
                        <text class="value">{{ quotationData.orderNo || '-' }}</text>
                    </view>
                    <view class="info-item">
                        <text class="label">报价日期：</text>
                        <text class="value">{{ quotationData.createDay || '-' }}</text>
                    </view>
                    <view class="info-item">
                        <text class="label">有效期至：</text>
                        <text class="value">{{ quotationData.expireDay || '-' }}</text>
                    </view>
                </view>

                <!-- 产品清单 -->
                <view class="product-section">
                    <view class="section-title">产品清单</view>
                    <scroll-view scroll-x class="table-scroll">
                        <view class="table-container">
                            <view class="table-header">
                                <view class="table-cell">序号</view>
                                <view class="table-cell">产品名称</view>
                                <view class="table-cell">供应商</view>
                                <view class="table-cell">数量</view>
                                <view class="table-cell">单价</view>
                                <view class="table-cell">小计</view>
                            </view>
                            <view v-for="(product, index) in quotationData.productInfo.products" :key="index"
                                class="table-row">
                                <view class="table-cell">{{ index + 1 }}</view>
                                <view class="table-cell product-name">{{ product.name }}</view>
                                <view class="table-cell">{{ product.supplier || '-' }}</view>
                                <view class="table-cell">{{ product.num }}</view>
                                <view class="table-cell price">¥{{ formatPrice(product.price) }}/{{ periodUnit(product.period) }}</view>
                                <view class="table-cell price">¥{{ formatPrice(product.subtotalPrice) }}</view>
                            </view>
                            <view class="table-row total-row">
                                <view class="table-cell" colspan="2">总计金额：</view>
                                <view class="table-cell total-price">¥{{
                                    formatPrice(quotationData.productInfo.totalPrice) }}/{{ periodUnit(billingPeriod) }}</view>
                            </view>
                        </view>
                    </scroll-view>
                </view>

                <!-- 报价条款 -->
                <view class="clause-section">
                    <view class="section-title">报价条款</view>
                    <view class="clause-content">
                        <text>{{ formatClause(quotationData.clause) }}</text>
                    </view>
                </view>
            </view>
        </scroll-view>

        <!-- 底部操作按钮 -->
        <view class="bottom-actions">
            <u-button type="info" size="small" class="action-btn" shape="circle" @click="shareQuotation">
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
            quotationData: {
                sellerInfo: {},
                products: [],
                totalPrice: 0,
                orderNo: '',
                createDay: '',
                expireDay: '',
                clause: ''
            },
            billingPeriod: ''
        }
    },
    onLoad(options) {
        // 获取传递的报价单数据
        if (options.quotationData) {
            try {
                this.quotationData = JSON.parse(decodeURIComponent(options.quotationData))
                console.log('接收到的报价单数据:', this.quotationData)
            } catch (e) {
                console.error('解析报价单数据失败:', e)
                uni.showToast({
                    title: '数据解析失败',
                    icon: 'none'
                })
            }
        }
        // 获取周期参数
        if (options.period) {
            this.billingPeriod = options.period
        }
    },
    methods: {
        goBack() {
            uni.navigateBack()
        },
        async shareQuotation() {
            if (!this.quotationData.orderNo) {
                uni.showToast({ title: '未获取到报价单编号', icon: 'none' })
                return
            }
            try {
                uni.showLoading({ title: '生成分享链接...', mask: true })
                const res = await api.quotation.shareQuotationPdf({ orderNo:this.quotationData.orderNo, period: this.billingPeriod, isShare: true })
                const url = res?.data
                if (!url) {
                    uni.showToast({ title: '未获取到分享链接', icon: 'none' })
                    return
                }
                // 复制到剪贴板并展示
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
        periodUnit(period) {
            const unitMap = { year: '年', season: '季', month: '月', disposable: '一次性' }
            return unitMap[period] || '一次性'
        },
        // 格式化价格
        formatPrice(price) {
            if (typeof price === 'number') {
                return price.toLocaleString()
            }
            return price || '-'
        },
        // 计算小计（兼容多种字段）
        computeSubtotal(p) {
            if (typeof p?.subtotalPrice === 'number') return p.subtotalPrice
            if (typeof p?.subtotal === 'number') return p.subtotal
            const quantity = typeof (p?.num ?? 0) === 'number' ? (p?.num ?? 0) : 0
            const unitPrice = typeof p?.price === 'number' ? p.price : 0
            return unitPrice * quantity
        },
        // 格式化条款内容
        formatClause(clause) {
            if (!clause) return '暂无条款说明'
            return clause.replace(/\/n/g, '\n')
        },
        // 下载PDF
        async downloadPdf() {
            if (!this.quotationData.orderNo) {
                uni.showToast({
                    title: '未获取到报价单编号',
                    icon: 'none'
                })
                return
            }

            try {
                uni.showLoading({ title: '生成PDF中...', mask: true })
                // 请求文件流（arraybuffer）
                const res = await api.quotation.downloadQuotationPdf(this.quotationData.orderNo, this.billingPeriod)
                const arrayBuffer = res?.data || res
                if (!arrayBuffer) throw new Error('未获取到文件数据')

                // 保存到本地（各端处理）
                const isH5 = typeof window !== 'undefined' && typeof document !== 'undefined'
                if (isH5) {
                    const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `报价单_${this.quotationData.orderNo}.pdf`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    window.URL.revokeObjectURL(url)
                } else if (typeof plus !== 'undefined' && plus?.io) {
                    // App 端简单存储到私有目录
                    const fileName = `报价单_${this.quotationData.orderNo}.pdf`
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
        }
    }
}
</script>

<style lang="scss" scoped>
.quotation-page {
    background: #f5f5f5;
    // min-height: 100vh;
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

.nav-left,
.nav-right {
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
    height: calc(100vh - 88rpx);
}

.quotation-container {
    padding: 24rpx;
    background-color: #fff;
    padding-bottom: 55px;
}

.header-section {
    margin-bottom: 24rpx;
}

.section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #303133;
    margin-bottom: 20rpx;
}

.info-item {
    display: flex;
    margin-bottom: 12rpx;
}

.label {
    font-size: 28rpx;
    color: #606266;
    margin-right: 12rpx;
    min-width: 120rpx;
}

.value {
    font-size: 28rpx;
    color: #303133;
    flex: 1;
}

/* 产品清单 */
.product-section {
    margin-bottom: 32rpx;
}

/* 表格滚动容器 */
.table-scroll {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.table-container {
    border: 1px solid #e4e7ed;
    border-radius: 8rpx;
    overflow: hidden;
    min-width: 800rpx;
    /* 设置最小宽度确保表格内容完整显示 */
    display: inline-block; /* 让容器宽度随内容收缩，避免末尾空白 */
}

.table-header {
    display: flex;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    min-width: 800rpx;
}

.table-row {
    display: flex;
    border-bottom: 1px solid #e4e7ed;
    min-width: 800rpx;
}

.table-row:last-child {
    border-bottom: none;
}

.total-row {
    background: #f0f8ff;
    font-weight: 600;
}

.table-cell {
    flex: 1;
    padding: 16rpx 12rpx;
    font-size: 26rpx;
    color: #303133;
    text-align: center;
    border-right: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 120rpx;
    /* 设置最小宽度确保内容可读 */
}

.table-cell:last-child {
    border-right: none;
}

/* 产品名称列稍微宽一些 */
.table-cell:nth-child(2) {
    min-width: 200rpx;
}

/* 供应商列稍微宽一些 */
.table-cell:nth-child(3) {
    min-width: 180rpx;
}

/* 序号与数量列更窄 */
.table-header .table-cell:nth-child(1),
.table-row .table-cell:nth-child(1) {
    flex: 0 0 80rpx;
    min-width: 80rpx;
}
.table-header .table-cell:nth-child(4),
.table-row .table-cell:nth-child(4) {
    flex: 0 0 80rpx;
    min-width: 80rpx;
}

.product-name {
    text-align: left;
    justify-content: flex-start;
    font-weight: 500;
    word-break: break-all;
    line-height: 1.4;
}

.price {
    text-align: right;
    justify-content: flex-end;
}

.total-price {
    color: #d9001bc8;
    font-size: 32rpx;
    font-weight: bold;
}

/* 报价条款 */
.clause-section {
    margin-bottom: 32rpx;
}

.clause-content {
    font-size: 26rpx;
    color: #606266;
    line-height: 1.6;
    white-space: pre-line;
}

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
