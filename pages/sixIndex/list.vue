<template>
  <!---比分-->
  <view class="match-list">
    <!-- 抽屉循环容器 -->
    <view v-for="(drawer, drawerIdx) in finalDrawerList" :key="drawerIdx" class="drawer-wrapper">
      <!-- 吸顶标题栏 -->
      <!-- <view class="date-title sticky-header" 
        :style="{ top: 0 + 'rpx'  }"
        hover-class="none"
      >
        <view class="drawer-title-text">{{ drawer.title }}</view>
      </view> -->

      
      <view v-show="expandedDrawers[drawerIdx]" class="drawer-content">
        <!-- 🌟 修改1：循环仅保留item，index仅作为备用（和4球一致） -->
        <view v-for="item in drawer.lotteryList" :key="item.id" class="match-row">
          <!-- 核心内容行 -->
          <view class="main-content-row">
            
            <view class="main-left">
              <view class="match-num-wrapper">
                <!-- 🌟 修改2：场次号改用接口的match_num字段（和4球一致） -->
                <text class="match-num">{{ item.match_num }}</text>
              </view>
            </view>

            <!-- 右侧内容 -->
            <view class="main-right">
              <view class="top-right">
                <!-- 队名VS -->
                <view class="team-vs">
                  <text class="team-name home">{{ item.home_name }}</text>
                  <text class="vs-text">VS</text>
                  <text class="team-name away">{{ item.visiting_name }}</text>
                </view>
                
                <view class="rate-row" v-if="item.home_win_rate && urlValue">
                  <text class="rate-text home" v-if="item.home_win_rate">胜{{ item.home_win_rate || '' }}</text>
                 <text class="vs-text" v-if="item.draw_rate">平{{item.draw_rate}}</text>
                  <text class="rate-text away" v-if="item.visiting_win_rate">胜{{ item.visiting_win_rate || '' }}</text>
              <view class="ai-analysis-btn" :class="{ 'x-text-green': item.is_buy !== 0}" v-if="item.home_win_rate && item.visiting_win_rate&&urlValue" @click.stop="() => goToAiAnalysis(item)"> {{ item.is_buy == 0 ? '1币比分+析' : '比分+析' }}</view>
                </view>
              </view>

              <!-- 保留6球原有半全场按钮布局 -->
              <view class="bottom-right">
                <!-- 半场行 -->
                <view class="score-row half-row">
                  <text class="row-label">半</text>
                  <view class="score-btn-group">
                    <view 
                      class="score-btn" 
                      :class="{ selected: item.halfHomeSelected }"
                      @click="toggleScoreBtn(item, 'halfHomeSelected')"
                      hover-class="none"
                    >3</view>
                    <view 
                      class="score-btn" 
                      :class="{ selected: item.halfVsSelected }"
                      @click="toggleScoreBtn(item, 'halfVsSelected')"
                      hover-class="none"
                    >1</view>
                    <view 
                      class="score-btn" 
                      :class="{ selected: item.halfAwaySelected }"
                      @click="toggleScoreBtn(item, 'halfAwaySelected')"
                      hover-class="none"
                    >0</view>
                  </view>
                </view>
                <!-- 全场行 -->
                <view class="score-row full-row">
                  <text class="row-label">全</text>
                  <view class="score-btn-group">
                    <view 
                      class="score-btn" 
                      :class="{ selected: item.fullHomeSelected }"
                      @click="toggleScoreBtn(item, 'fullHomeSelected')"
                      hover-class="none"
                    >3</view>
                    <view 
                      class="score-btn" 
                      :class="{ selected: item.fullVsSelected }"
                      @click="toggleScoreBtn(item, 'fullVsSelected')"
                      hover-class="none"
                    >1</view>
                    <view 
                      class="score-btn" 
                      :class="{ selected: item.fullAwaySelected }"
                      @click="toggleScoreBtn(item, 'fullAwaySelected')"
                      hover-class="none"
                    >0</view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { queryHomeAndVisitingGoalOdds } from "@/api/demo";
export default {
  props: {
    matchList: { type: Array, default: () => [] },
    statusBarHeight: { type: Number, default: 0 },
    drawerList: { type: Array, default: () => [] },
    goToAiAnalysis: { type: Function, required: true },
    // 🌟 新增drawNumSelectorHeight（和4球子组件一致）
    drawNumSelectorHeight: {
      type: Number,
      default: 70 
    }
  },
  data() {
    return {
      expandedDrawers: [],
      statusBarHeightRpx: 0,
      windowWidth: 0,
      urlValue: false,
    };
  },
  computed: {
    // 保持和4球子组件一致的finalDrawerList逻辑
    finalDrawerList() {
      if (this.drawerList.length > 0) {
        return this.drawerList;
      }
      return this.matchList.length > 0 
        ? [{ title: `周四 2025-12-04 共${this.matchList.length}场比赛`, lotteryList: this.matchList }] 
        : [];
    },
    // 保留6球原有选中计数逻辑
    selectedMatchCount() {
      let count = 0;
      this.finalDrawerList.forEach(drawer => {
        drawer.lotteryList.forEach(item => {
          const isHalfSelected = item.halfHomeSelected || item.halfVsSelected || item.halfAwaySelected;
          const isFullSelected = item.fullHomeSelected || item.fullVsSelected || item.fullAwaySelected;
          if (isHalfSelected || isFullSelected) {
            count++;
          }
        });
      });
      return count;
    },
    // 保持和4球子组件一致的适配计算属性
    paddingTopVal() {
      return this.statusBarHeightRpx + 88;
    },
    stickyHeaderTop() {
      return this.statusBarHeightRpx;
    }
  },
  watch: {
    finalDrawerList(newVal) {
      this.expandedDrawers = newVal.map(() => true);
      // 初始化半全场选中状态（和6球原有逻辑一致）
      newVal.forEach(drawer => {
        drawer.lotteryList.forEach(item => {
          if (item.halfHomeSelected === undefined) item.halfHomeSelected = false;
          if (item.halfVsSelected === undefined) item.halfVsSelected = false;
          if (item.halfAwaySelected === undefined) item.halfAwaySelected = false;
          if (item.fullHomeSelected === undefined) item.fullHomeSelected = false;
          if (item.fullVsSelected === undefined) item.fullVsSelected = false;
          if (item.fullAwaySelected === undefined) item.fullAwaySelected = false;
        });
      });
    },
    statusBarHeight(newVal) {
      this.statusBarHeightRpx = this.pxToRpx(newVal);
    }
  },
  created() {
        this.$nextTick(()=>{
    this.urlValue = uni.getStorageSync('urlValue');
    
    })
    this.initWindowInfo();
    this.statusBarHeightRpx = this.pxToRpx(this.statusBarHeight);
    this.expandedDrawers = this.finalDrawerList.map(() => true);
    // 初始化半全场选中状态
    this.finalDrawerList.forEach(drawer => {
      drawer.lotteryList.forEach(item => {
        if (item.halfHomeSelected === undefined) item.halfHomeSelected = false;
        if (item.halfVsSelected === undefined) item.halfVsSelected = false;
        if (item.halfAwaySelected === undefined) item.halfAwaySelected = false;
        if (item.fullHomeSelected === undefined) item.fullHomeSelected = false;
        if (item.fullVsSelected === undefined) item.fullVsSelected = false;
        if (item.fullAwaySelected === undefined) item.fullAwaySelected = false;
      });
    });
  },
  methods: {
    // 保持和4球子组件一致的窗口信息初始化
    initWindowInfo() {
      try {
        const windowInfo = wx.getWindowInfo();
        this.windowWidth = windowInfo.windowWidth || 375;
      } catch (e) {
        const systemInfo = wx.getWindowInfo();
        this.windowWidth = systemInfo.windowWidth || 375;
        console.warn('当前微信版本不支持wx.getWindowInfo，已降级兼容', e);
      }
    },
    // 保持和4球子组件一致的px转rpx方法
    pxToRpx(px) {
      if (!px || !this.windowWidth) return 0;
      return Math.round((px / this.windowWidth) * 750 + 0.5);
    },
    handleAiAnalysis(item) { console.log('AI分析', item); },
    // 保留6球原有半全场按钮切换逻辑
    toggleScoreBtn(item, key) {
      this.finalDrawerList.forEach((drawer, dIdx) => {
        const idx = drawer.lotteryList.findIndex(i => i.id === item.id);
        if (idx > -1) {
          this.$set(drawer.lotteryList[idx], key, !drawer.lotteryList[idx][key]);
          this.$emit("toggle-select", drawer.lotteryList[idx], key);
        }
      });
    }
  },
};
</script>

<style scoped lang="scss">
.match-list {
  background-color: #f5f5f5;
  box-sizing: border-box;
  padding-bottom: 140rpx;
// #ifdef MP-WEIXIN
  padding-bottom: 230rpx;
// #endif
}

.drawer-wrapper { width: 100%; margin-bottom: 8rpx; background: #f5f5f5 }

.sticky-header {
  position: sticky;
  z-index: 999;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  padding: 8rpx 20rpx 12rpx 20rpx;
  background-color: #f5f5f5;
  border-bottom: 1rpx solid #eee;
  font-size: 26rpx;
  color: #333;

  .drawer-title-text { font-size: 24rpx; color: #333; }
  .arrow-icon { transition: transform 0.2s ease; font-size: 24rpx; color: #666; }
  .rotated { transform: rotate(180deg); }
}

.drawer-content { width: 100%; transition: all 0.2s ease; }

.match-row {
  background-color: #fff;
  border-bottom: 1rpx solid #DEDEDE;
  box-sizing: border-box;
  padding: 0rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 4rpx;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 5rpx rgba(0,0,0,0.05);
  width: 100%;
  overflow: hidden;
}

.main-content-row {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  gap: 16rpx;
  padding: 8rpx 0;
  overflow: hidden;
}

/* 左侧场次号 */
.main-left {
  width: 160rpx;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
}

.match-num-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.match-num {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

/* 右侧内容 */
.main-right {
  flex: 1;
  width: calc(100% - 176rpx);
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  background: #fff;
  box-sizing: border-box;
  overflow: hidden;
}

.top-right {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

/* 队名行：绝对对称布局，为对齐锁死尺寸 */
.team-vs {
  font-size: 24rpx;
  color: #333;
  display: flex;
  align-items: center;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
  &:active { color: #d92929; opacity: 0.8; }

  /* 主队名容器：固定占比，右对齐 */
  .team-name.home {
    width: calc((100% - 80rpx) / 2.1);
    text-align: right;
    padding-right: 10rpx;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* VS容器：固定80rpx，居中（和你截图一致） */
  .vs-text {
    width: 100rpx;
    text-align: center;
    flex-shrink: 0;
    font-weight: 500;
  }
  /* 客队名容器：固定占比，左对齐 */
  .team-name.away {
    width: calc((100% - 80rpx) / 2.1);
    text-align: left;
    padding-left: 10rpx;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* 胜行：和队名行1:1复刻尺寸，绝对对齐 */
.rate-row {
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 22rpx;
  color: #999;

  /* 主队胜容器：和主队名尺寸/对齐完全一致 */
  .rate-text.home {
    width: calc((100% - 80rpx) / 2.1);
    text-align: right;
    padding-right: 10rpx;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* 平容器：和VS尺寸/对齐完全一致 */
  .vs-text {
    width: 80rpx;
    text-align: center;
    flex-shrink: 0;
    color: #999;
    font-size: 20rpx;
  }
  /* 客队胜容器：和客队名尺寸/对齐完全一致 */
  .rate-text.away {
    text-align: left;
    padding-left: 20rpx;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* 分析按钮：不影响对齐，单独靠外 */
  .ai-analysis-btn {
    font-size: 22rpx;
    color: #06f;
    cursor: pointer;
    transition: opacity 0.2s;
    flex-shrink: 0;
    margin-left: 12rpx;
    &:active { opacity: 0.8; }
  }
}



/* 保留6球原有半全场按钮样式 */
.bottom-right {
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10rpx 0;
  gap: 4rpx;
}

.score-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0;
}

.row-label {
  width: 40rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  font-size: 24rpx;
  color: #666;
  flex-shrink: 0;
}

.score-btn-group {
  display: flex;
  width: calc(100% - 40rpx);
  justify-content: space-around;
  gap: 0;
}

.score-btn {
  width: 33.33%;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #333;
  border: 1rpx solid #ddd;
  background-color: #fff;
  transition: all 0.2s ease;
  &.selected {
    background-color: #d92929;
    color: #fff;
  }
  &:active {
    background-color: #f0f0f0;
  }
  &.selected:active {
    background-color: #c62828;
  }
}

/* 兼容优化 */
::-webkit-scrollbar { display: none; }
/* #ifdef APP-PLUS */
.score-popup {
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom)); 
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); 
}
/* #endif */
button::after { border: none; }
</style>