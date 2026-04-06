<template>
  <view class="custom-header" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="header-content">
      <!-- 左侧返回区 -->
      <view class="header-left" v-if="showBack">
        <view class="header-back" @click="onBackClick">
          <image class="back-icon" src="https://www.tianjifu.com/static/back.png" mode="aspectFit"></image>
        </view>
      </view>
      <view class="header-left" v-if="showIcon">
        <view class="header-back" @click="onFunnelClick">
          <image class="funnel-icon" src="https://www.tianjifu.com/static/funnel.png" mode="aspectFit"></image>
        </view>
      </view>

      <!-- 中间标题区 → 真正居中 -->
      <view class="header-middle">
        <!-- 前缀：居中在返回和标题之间 -->
        <view class="prefix-text" v-if="isIndex">{{ballTitle}}</view>
        <!-- 标题 -->
        <view class="core-content" @click="triggerSelect">
          <text class="content-text">{{ isSelected ? (selectedPlay || title) : title }}</text>
          <view class="triangle-icon" v-if="isSelected"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CustomHeader',
  props: {
    title: { type: String, default: '标题' },
    showIcon: { type: Boolean, default: false },
    showBack: { type: Boolean, default: false },
    isSelected: { type: Boolean, default: false },
    selectedPlay: { type: String, default: '' },
    ballTitle:{ type: String, default:''},
    isIndex: {type: Boolean, default: false,}
  },
  data() {
    return { statusBarHeight: 0 };
  },
  created() {
    // 兼容获取状态栏高度
    this.statusBarHeight = uni.getWindowInfo 
      ? uni.getWindowInfo().statusBarHeight 
      : wx.getWindowInfo().statusBarHeight;
  },
  methods: {
    onFunnelClick() { this.$emit('funnel-click'); },
onBackClick() {
    uni.navigateBack({ delta: 1 });
},
    triggerSelect() { this.$emit('trigger-select'); },
    // 新增：游戏规则点击事件
    onRuleClick() { this.$emit('rule-click'); }
  }
};
</script>

<style scoped lang="scss">
// 头部整体样式
.custom-header {
  background-color: #31926e;
  color: #FFFFFF;
  box-sizing: border-box;
  position: relative;
  z-index: 10;
}

// 头部内容容器
.header-content {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 16rpx 24rpx 6rpx;
  font-size: 32rpx;
  font-weight: 500;
}

// 左侧返回按钮容器
.header-left {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

// 返回按钮样式
.header-back {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 返回图标样式
.back-icon {
  width: 48rpx;
  height: 40rpx;
  filter: brightness(0) invert(1);
}
.funnel-icon {
  width: 22px !important;
  height: 22px !important;
}

// 中间区域：整体居中
.header-middle {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

// ========== 核心：prefix-text 完美居中在返回按钮 & 标题之间 ==========
.prefix-text {
  position: absolute;
  left: 4%;
  transform: translateX(-4%);
  font-size: 24rpx;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  z-index: 2;
}

// 核心内容
.core-content {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background-color: #31926e;
  padding: 8rpx 16rpx 8rpx 0rpx;
  border-radius: 8rpx;
  white-space: nowrap;
  z-index: 1;
}

// 核心文字样式
.content-text {
  font-size: 32rpx;
  font-weight: 500;
  color: #fff;
  padding-right: 12rpx;
}

// 三角图标
.triangle-icon {
  width: 8px;
  height: 8px;
  background-color: #fff;
  -webkit-clip-path: polygon(100% 0, 0 100%, 100% 100%);
  clip-path: polygon(100% 0, 0 100%, 100% 100%);
}

// 右侧功能区样式（保留）
.header-right { 
  width: 60rpx; 
}
.mp-weixin { 
  position: absolute; 
  right: 220rpx; 
}
.header-actions { 
  width: 44rpx; 
  height: 44rpx; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
}
.funnel-icon { 
  margin-top: 10rpx;
  width: 30rpx!important; 
  height: 30rpx!important; 
  filter: brightness(0) invert(1); 
}
</style>