<template>
  <view
    style="width: 100%; height: 100vh; box-sizing: border-box;">
    <CustomHeader
      :showBack="false"
      :ballTitle="''"
      :title="'KeepSeek'"
      :isIndex="false"
      :showIcon="true"
      :isSelected="false"
      @funnel-click="handleFunnel"
    />

    <!-- 🌟 动态绑定滚动区域样式，适配导航栏和tabbar高度 -->
    <view 
      class="match-scroll" 
      scroll-y
      :style="{ 
        top: headerHeight + 'px', // 基于导航栏实际高度定位
        bottom: tabbarHeight + 'px', // 基于tabbar实际高度预留底部空间
        height: `calc(100vh - ${headerHeight + tabbarHeight}px)` // 动态计算高度
      }"
    >
      <!-- 赛事分析模块 -->
      <view class="simulation-container">
        <!-- 🌟 重构游戏网格布局：一行三个，分两行 -->
        <view class="game-grid">
          <!-- 第一行（3个） -->
          <view class="game-item" @click="goToGame('football/index')">
            <image class="game-icon" src="/static/jczq.png" mode="widthFix"></image>
            <text class="game-name" >J&nbsp;-&nbsp;足</text>
          </view>
          <view class="game-item" @click="goToGame('basketball/index')">
            <image class="game-icon" src="/static/jclq.png" mode="widthFix"></image>
            <text class="game-name" >J&nbsp;-&nbsp;篮</text>
          </view>
          <view class="game-item" @click="goToGame('fourteenIndex/index')">
            <image class="game-icon" src="/static/ctzq.png" mode="widthFix"></image>
            <text class="game-name" >14</text>
          </view>
          <!-- 第二行（3个） -->
          <view class="game-item two" @click="goToGame('nineIndex/index')">
            <image class="game-icon" src="/static/ctzq.png" mode="widthFix"></image>
            <text class="game-name" >任&nbsp;&nbsp;9</text>
          </view>
          <view class="game-item two" @click="goToGame('sixIndex/index')">
            <image class="game-icon" src="/static/ctzq.png" mode="widthFix"></image>
            <text class="game-name" >6半全</text>
          </view>
          <view class="game-item two" @click="goToGame('fourIndex/index')">
            <image class="game-icon" src="/static/ctzq.png" mode="widthFix"></image>
            <text class="game-name" >4&nbsp;&nbsp;进</text>
          </view>
        </view>
        <view class="game-grid">
          <view class="game-item" @click="goToGame('footballData/index')">
            <image class="game-icon" src="/static/f.png" mode="widthFix"></image>
            <text class="game-name" >足&nbsp;&nbsp;数</text>
          </view>
          <view class="game-item" @click="goToGame('basketballData/index')">
            <image class="game-icon" src="/static/b.png" mode="widthFix"></image>
            <text class="game-name" >蓝&nbsp;&nbsp;数</text>
          </view>
        </view>
      </view>
    </view>
    <TipsPopup
      :visible.sync="isPopupShow"
      :header-height="headerHeight"
      :popup-width="700"
      border-color="#07c160"
      @close="handlePopupClose"
      :max-height="popupMaxHeight"
    />
    <!-- 保留底部tabbar -->
    <NativeTabbar ref="nativeTabbar" />
  </view>
</template>

<script>
import CustomHeader from "@/components/CustomHeader.vue";
import NativeTabbar from "@/components/tabbar.vue";
import TipsPopup from "@/pages/commn/playTip";

export default {
  components: {
    CustomHeader,
    NativeTabbar,
    TipsPopup,
  },
  data() {
    return {
      currentPlay: "",
      isPopupShow: false,
      touchStartX: 0,
      swipeThreshold: 50,
      headerHeight: 0, // 导航栏总高度（px）
      statusBarHeight: 0,
      tabbarHeight: 0, // tabbar高度（px
      popupMaxHeight: 0,
    };
  },
  created() {
    // 获取状态栏高度（兼容新旧API）
    if (uni.getWindowInfo) {
      const windowInfo = uni.getWindowInfo();
      this.statusBarHeight = windowInfo.statusBarHeight;
    } else {
      const systemInfo = wx.getWindowInfo();
      this.statusBarHeight = systemInfo.statusBarHeight;
    }
  },
  mounted() {
    console.log(uni, 'uni-----------',window,'window----------')
    this.calcHeaderHeight();
    this.calcTabbarHeight();
    this.calcPopupMaxHeight();
  },
  
  methods: {
    handlePopupClose() {

    },
    calcPopupMaxHeight() {
      const windowInfo = uni.getWindowInfo ? uni.getWindowInfo() : wx.getWindowInfo();
      const { 
        windowHeight, 
        windowWidth, 
        safeAreaInsets,
        safeArea,
        statusBarHeight
      } = windowInfo;

      this.windowHeight = windowHeight;

      const pixelRatio = 3;
      this.bottomBtnBarHeight = (90 / 750) * windowWidth / pixelRatio;
      this.tabbarHeight = (100 / 750) * windowWidth / pixelRatio;

      this.popupMaxHeight = windowHeight - this.bottomBtnBarHeight - this.tabbarHeight - safeAreaInsets.bottom;

      // #ifdef MP-WEIXIN
      this.popupMaxHeight = Math.min(
        this.popupMaxHeight, 
        safeArea.height - this.bottomBtnBarHeight - this.tabbarHeight
      );
      // #endif
    },
    togglePopup() {
      this.isPopupShow = !this.isPopupShow;
    },
    handleFunnel() {
      this.isPopupShow = true;
    },
    // 🌟 精确计算导航栏总高度（状态栏+自定义导航栏，转px）
    calcHeaderHeight() {
      const systemInfo = wx.getWindowInfo();
      const statusBarHeight = systemInfo.statusBarHeight;
      // 自定义导航栏高度（80rpx转px：rpx * 屏幕宽度 / 750）
      const customHeaderHeightRpx = 80;
      const customHeaderHeightPx = (customHeaderHeightRpx * systemInfo.windowWidth) / 750;
      // 导航栏总高度（px）
      this.headerHeight = statusBarHeight + customHeaderHeightPx;
    },
    // 🌟 精确计算tabbar高度（100rpx转px）
    calcTabbarHeight() {
      const systemInfo = wx.getWindowInfo();
      const tabbarHeightRpx = 100;
      this.tabbarHeight = (tabbarHeightRpx * systemInfo.windowWidth) / 750;
    },
    // 跳转对应游戏页面
    goToGame(gameName) {
      uni.navigateTo({ url: `/pages/${gameName}` });
    }
  }
};
</script>

<style scoped lang="scss">
page {
  background-color: #f5f5f5;
  box-sizing: border-box;
  height: 100vh;
  margin: 0;
  padding: 0;
}

::v-deep .custom-header {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  z-index: 10 !important;
}

// 🌟 重构滚动区域样式：删除固定值，全端统一动态适配
.match-scroll {
  touch-action: pan-y;
  position: absolute !important;
  left: 0;
  right: 0;
  width: 100% !important;
  overflow-y: auto !important;
  background-color: #f5f5f5;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  padding: 20rpx; // 增加内边距，避免内容贴边
  box-sizing: border-box; // 确保padding不影响宽度
}
.match-scroll::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

/* 赛事分析模块样式 */
.simulation-container {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
}

// 🌟 核心：一行三个布局，自适应宽度
.game-grid {
  display: flex;
  flex-wrap: wrap;
  // 计算间距：左右各20rpx，中间两个间距，总间距40rpx，平分到3个item之间
  gap: 20rpx; 
  justify-content: flex-start; // 靠左显示
}

.game-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  // 宽度计算：(100% - 2个间距) / 3 = (100% - 40rpx) / 3
  width: calc((100% - 40rpx) / 3);
  margin-top: 30rpx;
  margin-bottom: 30rpx; // 行间距
  cursor: pointer;
  box-sizing: border-box;
}

.game-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 8rpx;
  border-radius: 8rpx;
}

.game-name {
  font-size: 24rpx;
  color: #666;
  text-align: center;
  line-height: 1.2;
}

/* 保留tabbar样式 */
::v-deep .native-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 9;
}

::-webkit-scrollbar {
  display: none;
}
</style>