<template>
  <view v-if="show" class="share-modal-mask">
    <view class="share-modal-card">
      <img class="share-modal-bot" src="/static/robot.png" mode="aspectFit" />
      <view class="share-modal-title">分享链接</view>
      <view class="share-modal-link">{{ link }}</view>
      <button class="share-modal-btn" @click="onConfirm">确定</button>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    show: Boolean,
    link: String
  },
  methods: {
    onConfirm() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.share-modal-mask {
  position: fixed;
  left: 0; right: 0; top: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.share-modal-card {
  background: linear-gradient(to bottom, #E1F0FD 0%, #FFFFFF 100%);
  border-radius: 18rpx;
  width: 520rpx;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.10);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.share-modal-bot {
  width: 84px;
  height: 84px;
  margin-bottom: 12rpx;
  position: absolute;
  right: 10px;
  top: -68px;
}
.share-modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #080808;
  margin-top: 32rpx;
  margin-bottom: 8rpx;
}
.share-modal-link {
  font-size: 14px;
  color: #8D8D8D;
  padding: 16rpx 32rpx;
  word-break: break-all;
  margin-bottom: 32rpx;
  text-align: center;
}
.share-modal-btn {
  width: 100%;
  background: #5BACFF;
  color: #fff;
  border: none;
  border-radius: 0 0 18rpx 18rpx;
  font-size: 15px;
}
</style>
