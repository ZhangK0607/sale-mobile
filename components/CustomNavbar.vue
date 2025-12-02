<template>
  <view class="custom-navbar" :style="customNavbarStyle">
    <view class="navbar-bg-gradient"></view>
    <view class="navbar-spot spot1"></view>
    <view class="navbar-spot spot2"></view>
    <view class="navbar-spot spot3"></view>
    <view class="navbar-content" :style="'height:44px;'">
      <view v-if="showBack" class="navbar-back" @click="goBack">
        <u-icon name="arrow-left" color="#333" size="18"></u-icon>
      </view>
      <text class="navbar-title">{{ title }}</text>
      <slot name="right"></slot>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

defineOptions({
  name: 'CustomNavbar'
})

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  showBack: {
    type: Boolean,
    default: false
  },
  overflowHidden: {
    type: Boolean,
    default: true
  }
})

const statusBarHeight = ref(0)

const customNavbarStyle = computed(() => {
  let style = `padding-top:${statusBarHeight.value}px;`
  if (props.overflowHidden) {
    style += 'overflow:hidden;'
  }
  return style
})

onMounted(() => {
  const sys = uni.getSystemInfoSync()
  statusBarHeight.value = sys.statusBarHeight || 20
})

const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.custom-navbar {
  position: relative;
  width: 100%;
  z-index: 100;
}
.navbar-bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, #DFEFFF 0%, #E1F0FE 100%);
  z-index: 1;
}
.navbar-spot {
  position: absolute;
  border-radius: 50%;
  filter: blur(12px);
  z-index: 2;
  opacity: 0.85;
}
.spot1 {
  width: 120px;
  height: 60px;
  background: #E6F1FC;
  left: -24rpx;
}
.spot2 {
  width: 150px;
  height: 100px;
  background: #d9e1f5;
  top: -20px;
  right: 30%;
}
.spot3 {
  width: 140px;
  height: 100px;
  background: #F3F1F1;
  top: -10px;
  right: -30px;
}
.navbar-content {
  position: relative;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}
.navbar-back {
  position: absolute;
  left: 16px;
  top: 0;
  height: 44px;
  width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
  cursor: pointer;
}
.navbar-title {
  font-size: 16px;
  font-weight: bold;
  color: #060606;
  text-shadow: none;
}
</style>
