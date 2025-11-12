/**
 * 分享混入 - 用于页面级别的分享配置
 * 使用方法：在需要自定义分享的页面中引入并使用
 * 
 * import shareMixin from '@/mixins/shareMixin.js'
 * export default {
 *   mixins: [shareMixin],
 *   data() {
 *     return {
 *       shareConfig: {
 *         title: '自定义标题',
 *         path: '/pages/xxx/xxx',
 *         imageUrl: '/static/xxx.png'
 *       }
 *     }
 *   }
 * }
 */

export default {
	data() {
		return {
			// 默认分享配置
			shareConfig: {
				title: 'AI智能销售助手 - 智能推荐最适合您的产品',
				path: '/pages/index/index',
				imageUrl: '/static/share-cover.png'
			}
		}
	},
	
	// 分享给好友
	onShareAppMessage(options) {
		const { from, target } = options
		
		// 如果是点击按钮触发的分享，可以从按钮的 data-share-xxx 属性获取自定义数据
		if (from === 'button' && target) {
			const dataset = target.dataset
			if (dataset.shareTitle) {
				return {
					title: dataset.shareTitle,
					path: dataset.sharePath || this.shareConfig.path,
					imageUrl: dataset.shareImage || this.shareConfig.imageUrl
				}
			}
		}
		
		// 默认返回页面配置的分享信息
		return {
			title: this.shareConfig.title,
			path: this.shareConfig.path,
			imageUrl: this.shareConfig.imageUrl
		}
	},
	
	// 分享到朋友圈
	onShareTimeline(options) {
		return {
			title: this.shareConfig.title,
			query: this.shareConfig.query || '',
			imageUrl: this.shareConfig.imageUrl
		}
	}
}
