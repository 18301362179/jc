<template>
  <view class="tabbar-container">
    <view class="tabbar">
      <view 
        class="tab-item" 
        v-for="(item, originIndex) in baseTabList" 
        :key="item.path"
        @click="handleClick(item.path, originIndex)"
        :class="{ active: currentActiveIndex === originIndex }"
      >
        <image 
          :src="currentActiveIndex === originIndex ? item.activeIcon : item.icon"
          class="tab-icon"
          mode="widthFix"
        ></image>
      </view>
    </view>
  </view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  data() {
    return {
      baseTabList: [
        { text: '首页', icon: 'https://www.tianjifu.com/static/home1.png', activeIcon: 'https://www.tianjifu.com/static/home.png', path: '/pages/index/index' },
        { text: '预测', icon: 'https://www.tianjifu.com/static/yu.png', activeIcon: 'https://www.tianjifu.com/static/yu1.png', path: '/pages/analysisForecast/index' },
        { text: '我的', icon: 'https://www.tianjifu.com/static/mine.png', activeIcon: 'https://www.tianjifu.com/static/mine1.png', path: '/pages/user/index' }
      ],
      iconCache: new Set()
    };
  },
  onShow() {
    uni.hideTabBar()
  },
  computed: {
    ...mapState(['currentTabIndex']),
    currentActiveIndex() {
      return this.$store.state.currentTabIndex;
    }
  },
  created() {
    this.baseTabList.forEach(item => {
      this.preloadIcon(item.icon);
      this.preloadIcon(item.activeIcon);
    });
  },
  methods: {
    ...mapMutations(['SET_CURRENT_TAB_INDEX']),
    preloadIcon(src) {
      if (this.iconCache.has(src)) return;
      
      // #ifdef H5
      const img = new Image();
      img.src = src;
      img.onload = () => this.iconCache.add(src);
      img.onerror = () => this.iconCache.add(src);
      // #endif
      
      // #ifndef H5
      uni.getImageInfo({
        src,
        success: () => this.iconCache.add(src),
        fail: () => this.iconCache.add(src)
      });
      // #endif
    },
    handleClick(path, originIndex) {
      const localToken = uni.getStorageSync("requestToken") || "";
      this.SET_CURRENT_TAB_INDEX(originIndex);
      const validPath = path.startsWith('/') ? path : `/${path}`;
      uni.switchTab({ url: validPath, fail: () => uni.redirectTo({ url: validPath }) });
    },
    // ========== 新增：滑动切换Tab的核心方法 ==========
    switchTabBySwipe(direction) {
      const maxIndex = this.baseTabList.length - 1; // 最大索引（3）
      let newIndex = this.currentActiveIndex;
      
      // 根据滑动方向更新索引：left=左滑（下一个），right=右滑（上一个）
      if (direction === 'left') {
        newIndex = newIndex >= maxIndex ? maxIndex : newIndex + 1;
      } else if (direction === 'right') {
        newIndex = newIndex <= 0 ? 0 : newIndex - 1;
      }
      
      // 索引不变则不处理
      if (newIndex === this.currentActiveIndex) return;
      
      // 更新Vuex的激活索引 + 跳转对应页面
      this.SET_CURRENT_TAB_INDEX(newIndex);
      const targetTab = this.baseTabList[newIndex];
      const validPath = targetTab.path.startsWith('/') ? targetTab.path : `/${targetTab.path}`;
      uni.switchTab({ url: validPath, fail: () => uni.redirectTo({ url: validPath }) });
    }
  }
};
</script>

<style scoped>
.tabbar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 99;
  height: calc(100rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background: #fff;
}

.tabbar {
  width: 100%;
  height: 100rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
  display: flex;
  align-items: center;
  margin-bottom: constant(safe-area-inset-bottom);
  margin-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
}

.tab-item {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 20rpx;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  transition: none !important;
}

.tab-icon {
  width: 60rpx;
  height: 60rpx;
  object-fit: contain;
  pointer-events: none;
  transition: none !important;
}

.tab-item.active .tab-icon {
  filter: brightness(0.8) !important;
}
</style>