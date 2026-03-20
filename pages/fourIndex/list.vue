<template>
  <!---比分--->
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

      <!-- 抽屉内容：比赛列表 -->
      <view v-show="expandedDrawers[drawerIdx]" class="drawer-content">
        <!-- 🌟 修改1：循环仅保留item，index仅作为备用（不再用于场次号） -->
        <view v-for="item in drawer.lotteryList" :key="item.id" class="match-row">
          <!-- 核心内容行 -->
          <view class="main-content-row">
            <!-- 左侧场次号 -->
            <view class="main-left">
              <view class="match-num-wrapper">
                <!-- 🌟 修改2：场次号改用接口的match_num字段 -->
                <text class="match-num">第{{ item.match_num }}场</text>
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
                <!-- 胜+分析：接口无此字段，自动隐藏 -->
                <view class="rate-row" v-if="item.home_win_rate && urlValue">
                  <text class="rate-text home" v-if="item.home_win_rate">胜{{ item.home_win_rate || '' }}</text>
                  <text class="vs-text" v-if="item.draw_rate">平{{item.draw_rate}}</text>
                  <text class="rate-text away" v-if="item.visiting_win_rate">胜{{ item.visiting_win_rate || '' }}</text>
              <view class="ai-analysis-btn" :class="{ 'x-text-green': item.is_buy !== 0}" v-if="item.home_win_rate && item.visiting_win_rate&&urlValue" @click.stop="() => goToAiAnalysis(item)"> {{ item.is_buy == 0 ? '1币比分+析' : '比分+析' }}</view>
                </view>
              </view>

              <!-- 核心：比分矩阵选择（主/客 0/1/2/3+ 多选） -->
              <view class="bottom-right">
                <view class="score-matrix">
                  <!-- 主队行 -->
                  <view class="matrix-row">
                    <view class="matrix-label">主</view>
                    <view 
                      class="matrix-cell" 
                      :class="{ selected: item.homeScoreSelected.includes(0) }"
                      @click="toggleScoreSelect(item, 'homeScoreSelected', 0)"
                    >0</view>
                    <view 
                      class="matrix-cell" 
                      :class="{ selected: item.homeScoreSelected.includes(1) }"
                      @click="toggleScoreSelect(item, 'homeScoreSelected', 1)"
                    >1</view>
                    <view 
                      class="matrix-cell" 
                      :class="{ selected: item.homeScoreSelected.includes(2) }"
                      @click="toggleScoreSelect(item, 'homeScoreSelected', 2)"
                    >2</view>
                    <view 
                      class="matrix-cell" 
                      :class="{ selected: item.homeScoreSelected.includes('3+') }"
                      @click="toggleScoreSelect(item, 'homeScoreSelected', '3+')"
                    >3+</view>
                  </view>

                  <!-- 客队行 -->
                  <view class="matrix-row">
                    <view class="matrix-label">客</view>
                    <view 
                      class="matrix-cell" 
                      :class="{ selected: item.awayScoreSelected.includes(0) }"
                      @click="toggleScoreSelect(item, 'awayScoreSelected', 0)"
                    >0</view>
                    <view 
                      class="matrix-cell" 
                      :class="{ selected: item.awayScoreSelected.includes(1) }"
                      @click="toggleScoreSelect(item, 'awayScoreSelected', 1)"
                    >1</view>
                    <view 
                      class="matrix-cell" 
                      :class="{ selected: item.awayScoreSelected.includes(2) }"
                      @click="toggleScoreSelect(item, 'awayScoreSelected', 2)"
                    >2</view>
                    <view 
                      class="matrix-cell" 
                      :class="{ selected: item.awayScoreSelected.includes('3+') }"
                      @click="toggleScoreSelect(item, 'awayScoreSelected', '3+')"
                    >3+</view>
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
    drawNumSelectorHeight: {
    type: Number,
    default: 70 // 默认70rpx
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
    finalDrawerList() {
      if (this.drawerList.length > 0) {
        return this.drawerList;
      }
      return this.matchList.length > 0 
        ? [{ title: `周四 2025-12-04 共${this.matchList.length}场比赛`, lotteryList: this.matchList }] 
        : [];
    },
    selectedMatchCount() {
      let count = 0;
      this.finalDrawerList.forEach(drawer => {
        drawer.lotteryList.forEach(item => {
          // 只要主/客有一个比分被选中（数组长度>0），就算该场次选中
          if (item.homeScoreSelected.length > 0 || item.awayScoreSelected.length > 0) {
            count++;
          }
        });
      });
      return count;
    },
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
      // 初始化比分选中状态为空数组（多选）
      newVal.forEach(drawer => {
        drawer.lotteryList.forEach(item => {
          if (!Array.isArray(item.homeScoreSelected)) item.homeScoreSelected = [];
          if (!Array.isArray(item.awayScoreSelected)) item.awayScoreSelected = [];
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
    // 初始化比分选中状态为空数组
    this.finalDrawerList.forEach(drawer => {
      drawer.lotteryList.forEach(item => {
        if (!Array.isArray(item.homeScoreSelected)) item.homeScoreSelected = [];
        if (!Array.isArray(item.awayScoreSelected)) item.awayScoreSelected = [];
      });
    });
  },
  methods: {
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
    pxToRpx(px) {
      if (!px || !this.windowWidth) return 0;
      return Math.round((px / this.windowWidth) * 750 + 0.5);
    },
    // 核心：比分多选逻辑（切换选中/取消状态）
    toggleScoreSelect(item, key, value) {
      this.finalDrawerList.forEach((drawer, dIdx) => {
        const idx = drawer.lotteryList.findIndex(i => i.id === item.id);
        if (idx > -1) {
          const currentSelections = drawer.lotteryList[idx][key];
          // 判断当前值是否已选中
          const valueIndex = currentSelections.findIndex(v => v === value);
          if (valueIndex > -1) {
            // 已选中：移除该值
            currentSelections.splice(valueIndex, 1);
          } else {
            // 未选中：添加该值
            currentSelections.push(value);
          }
          // 触发响应式更新
          this.$set(drawer.lotteryList[idx], key, [...currentSelections]);
          // 通知父组件同步状态
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


/* 比分矩阵样式 */
.bottom-right {
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #f1f1f1;
}

.score-matrix {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
}

.matrix-row {
  display: flex;
  width: 100%;
  border-bottom: 1rpx solid #ddd;
  &:last-child {
    border-bottom: none;
  }
}

.matrix-label {
  width: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-right: 1rpx solid #ddd;
  font-size: 26rpx;
  color: #333;
}

.matrix-cell {
  flex: 1;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #333;
  border-right: 1rpx solid #ddd;
  transition: all 0.2s ease;
  &:last-child {
    border-right: none;
  }
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