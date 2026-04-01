<template>
  <!-- 大小分页面：重构布局样式，统一视觉风格 -->
  <!-- 仅改：paddingTop 从 px 计算改为 rpx 计算（paddingTopVal） -->
  <view class="match-list" :style="{ paddingTop: paddingTopVal + 'rpx' }">
    <!-- 抽屉循环容器（逻辑完全保留） -->
    <view v-for="(drawer, drawerIdx) in finalDrawerList" :key="drawerIdx" class="drawer-wrapper">
      <view class="date-title sticky-header" :style="{ top: stickyHeaderTop + 'rpx' }" @click="toggleDrawer(drawerIdx)">
        <text>{{ drawer.title }}</text>
        <view class="arrow-icon" :class="{ rotated: expandedDrawers[drawerIdx] }">↓</view>
      </view>

      <!-- 抽屉内容（逻辑完全保留，布局重构） -->
      <view class="drawer-content" v-show="expandedDrawers[drawerIdx]">
        <view v-for="(item, index) in drawer.lotteryList" :key="index" class="match-row" style="background: #f6f6f6">
          <!-- ========== 状态行：和其他组件完全统一 ========== -->
          <view class="match-status-row">
            <view class="status-left">
              <!-- 单场标签：无停时，根据is_sf_single显示 -->
              <text class="single-tag" v-if="item.is_dxf_single == 1 && item.is_stop == 0">单</text>
              <text class="single-tag" style="background: #dedede" v-if="item.is_stop == 1">停</text>
            </view>
            <view class="status-right">
              <!-- 右侧分析按钮：仅在有胜数据时显示 -->
          <view class="ai-analysis-btn" :class="{ 'x-text-green': item.is_buy !== 0}" v-if="item.url_show_status==1" @click.stop="() => myValue(item)">
            <text>详细</text>
            <text class="small-coin" v-if="item.is_buy == 0">{{item.charge}}</text>
          </view>
            </view>
          </view>

          <!-- ========== 核心：重构为左右布局（和其他组件统一） ========== -->
          <view class="main-content-row">
            <!-- 左侧：固定宽度，垂直排列联赛名+编号+时间 -->
            <view class="main-left">
              <view class="top-left">
                <text class="league-name">{{ item.league_name }}</text>
              </view>
              <view class="bottom-left">
                <text class="serial-number">{{ item.serial_number }}</text>
                <text class="match-time">{{ item.race_date }}</text>
              </view>
            </view>

            <!-- 右侧：自适应宽度，垂直排列队名VS+胜+大小分选项 -->
            <view class="main-right">
              <view class="top-right">
                
                <view class="team-name">
                  <text>{{ item.visiting_name }}</text>
                  <text class="vs-text">VS</text>
                  <text>{{ item.home_name }}</text>
                </view>
                
                <view class="rate-row" v-if="xiValue">
                  <text class="rate-text away" v-if="item.visiting_win_rate&&xiValue">胜{{item.visiting_win_rate || "--" }}</text>
                  <text class="vs-text"></text>
                  <text class="rate-text home" v-if="item.home_win_rate&&xiValue">胜{{item.home_win_rate || "--" }}</text>
                </view>
              </view>

              <!-- 大小分选项：样式统一，保留三列结构 -->
              <view class="bottom-right" :class="{ 'stop-bg': item.is_stop == 1 }">
                <view class="odds-trigger-area" :class="{ 'disabled-trigger': item.is_stop == 1 }">
                  <view class="odds-row">
                    <view class="match-cell home" :class="{ selected: item.awaySelected, 'stop-cell': item.is_stop == 1 }" @click="item.is_stop != 1 && checkAndSelect(item, 'awaySelected')"> 小分{{ item.dxf_x_multiplier || "--" }} </view>

                    <view class="match-cell middle" style="color: #999" :class="{ 'stop-cell': item.is_stop == 1 }">
                      {{ item.dxf_goal || "--" }}
                    </view>
                    <view class="match-cell away" :class="{ selected: item.homeSelected, 'stop-cell': item.is_stop == 1 }" @click="item.is_stop != 1 && checkAndSelect(item, 'homeSelected')"> 大分{{ item.dxf_d_multiplier || "--" }} </view>
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
// 逻辑代码完全保留，仅新增px转rpx相关逻辑
export default {
  props: {
    matchList: { type: Array, default: () => [] },
    statusBarHeight: { type: Number, default: 0 },
    myValue: { type: Function, required: true },
    drawerList: { type: Array, default: () => [] },
  },
  data() {
    return {
      expandedDrawers: [],
      // 缓存转换后的状态栏高度（px转rpx，适配多端）
      statusBarHeightRpx: 0,
      windowWidth: 0,
      xiValue: false,
    };
  },
  computed: {
    finalDrawerList() {
      if (this.drawerList.length > 0) {
        return this.drawerList;
      }
      return this.matchList.length > 0 ? [{ title: `未知日期 共${this.matchList.length}场比赛`, lotteryList: this.matchList }] : [];
    },
    selectedMatchCount() {
      let count = 0;
      this.finalDrawerList.forEach((drawer) => {
        drawer.lotteryList.forEach((item) => {
          // 子组件内部统计也用 homeSelected/awaySelected
          if (item.homeSelected || item.awaySelected) {
            count++;
          }
        });
      });
      return count;
    },
    // 仅新增：计算rpx版paddingTop（值为statusBarHeightRpx + 88）
    paddingTopVal() {
      return this.statusBarHeightRpx + 88;
    },
    // 仅新增：计算rpx版sticky header top值（值为statusBarHeightRpx + 88）
    stickyHeaderTop() {
      return this.statusBarHeightRpx + 88 - 10; // 3rpx是通用微调值，可按实际偏移动2/4
    },
  },
  watch: {
    finalDrawerList(newVal) {
      this.expandedDrawers = newVal.map(() => true);
    },
    // 仅新增：监听状态栏高度变化，转换单位
    statusBarHeight(newVal) {
      this.statusBarHeightRpx = this.pxToRpx(newVal);
    },
  },
  created() {

    this.$nextTick(()=>{
    this.xiValue = uni.getStorageSync('xiValue');
    
    })

    // 初始化：获取最新的窗口信息（替代废弃的getSystemInfoSync）
    this.initWindowInfo();
    this.statusBarHeightRpx = this.pxToRpx(this.statusBarHeight);
    this.expandedDrawers = this.finalDrawerList.map(() => true);
  },
  methods: {
    // 新增：初始化窗口信息（替代废弃API）
    initWindowInfo() {
      try {
        const windowInfo = wx.getWindowInfo();
        this.windowWidth = windowInfo.windowWidth || 375; // 兜底默认值
      } catch (e) {
        console.warn("当前微信版本不支持wx.getWindowInfo，已降级兼容", e);
      }
    },
    // 修正后的px转rpx：使用新API获取的windowWidth，优化精度
    pxToRpx(px) {
      if (!px || !this.windowWidth) return 0;
      // 计算后四舍五入，减少1-2px的机型偏差
      return Math.round((px / this.windowWidth) * 750 + 0.5);
    },
    toggleDrawer(drawerIdx) {
      this.$set(this.expandedDrawers, drawerIdx, !this.expandedDrawers[drawerIdx]);
    },
    checkAndSelect(item, selectType) {
      const isCancel = item[selectType];
      const isAdd = !isCancel;

      if (isAdd) {
        const isCurrentMatchSelected = item.homeSelected || item.vsSelected || item.awaySelected;
        if (!isCurrentMatchSelected && this.selectedMatchCount >= 8) {
          uni.showToast({
            title: "最多只能选择8场比赛",
            icon: "none",
            duration: 2000,
          });
          return;
        }
      }
      this.$emit("toggle-select", item, selectType);
    },
  },
};
</script>

<style scoped lang="scss">
/* 全局容器样式：保留原有适配，微调统一 */
.match-list {
  background-color: #f5f5f5;
  box-sizing: border-box;
  padding-bottom: 140rpx;
  // #ifdef MP-WEIXIN
  padding-bottom: 230rpx;
  // #endif
}

.drawer-wrapper {
  width: 100%;
  margin-bottom: 8rpx;
  background: #f5f5f5;
}
.sticky-header {
  position: sticky;
  z-index: 999; // 仅改：从999999999降为999
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  padding: 8rpx 20rpx 12rpx 20rpx;
  background-color: #f5f5f5;
  border-bottom: 1rpx solid #eee;
  font-size: 26rpx;
  color: #333;
  .arrow-icon {
    transition: transform 0.2s;
  }
  .rotated {
    transform: rotate(180deg);
  }
}

.drawer-content {
  width: 100%;
  transition: all 0.2s ease;
}

/* ========== 核心重构：比赛行样式（和其他组件完全统一） ========== */
.match-row {
  background-color: #fff;
  border-bottom: 1rpx solid #dedede;
  padding: 0rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 4rpx;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.05);
}

/* 状态行：和其他组件完全一致 */
.match-status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border-bottom: 1rpx solid #f5f5f5;
  .status-left {
    width: 200rpx;
    display: flex;
    align-items: center;
  }

  .single-tag {
    display: inline-block;
    padding-left: 6rpx;
    width: 44rpx;
    background: #b71c1c;
    color: #fff;
    text-align: left;
    font-size: 22rpx;
    border-top-right-radius: 15rpx;
    border-bottom-right-radius: 16rpx;
    margin-right: 10rpx;
  }

  .status-right {
.ai-analysis-btn {
  font-size: 24rpx;
  color: #06f;
  cursor: pointer;
  transition: opacity 0.2s;
  letter-spacing: 4rpx;
  &:active {
    opacity: 0.8;
  }
}
/* 加在这里 */
.small-coin {
  font-size: 20rpx !important;
  margin-left: 4rpx;
}
  }
}

/* 核心：整体左右布局（和其他组件完全一致） */
.main-content-row {
  display: flex;
  width: 100%;
  gap: 16rpx;
  padding: 8rpx 0;
}

/* 左侧区域：固定宽度，垂直排列 */
.main-left {
  width: 160rpx;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 8rpx;
}

/* 右侧区域：自适应宽度，垂直排列 */
.main-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  background: #fff;
}

/* 左侧子元素：样式统一 */
.top-left {
  margin-top: 8rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.league-name-row {
  display: flex;
  align-items: center;
  width: 100%;
}

.league-name {
  font-size: 22rpx;
  color: #777;
}

.bottom-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 2rpx;
}

.serial-number,
.match-time {
  width: 100%;
  font-size: 20rpx;
  color: #999;
  text-align: center;
}

/* 右侧子元素：样式统一 */
.top-right {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

// 球队名称行 - 核心修改：改为flex布局实现左右对齐
.team-name {
  font-size: 26rpx;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between; // 改为两端对齐
  width: 100%; // 确保占满宽度

  .vs-text {
    color: #999;
    font-size: 24rpx;
    // 居中占位，宽度与胜行的平文本一致
    width: 60rpx;
    text-align: center;
  }

  
  text:first-child {
    text-align: right;
    flex: 1;
  }

  
  text:last-child {
    text-align: left;
    flex: 1;
  }
}

// 胜&进球数行 - 核心修改：保持布局匹配
.rate-row {
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 22rpx;
  color: #999;

  .rate-text {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .rate-text.home {
    text-align: left; // 主队胜靠右
  }
  .rate-text.away {
    text-align: right; // 客队胜靠左
  }
  .vs-text {
    width: 60rpx; // 与球队行VS文本宽度一致
    text-align: center; // 平居中
    flex-shrink: 0;
  }
}
/* 大小分选项区：样式统一，保留三列结构 */
.bottom-right {
  width: 100%;
}

.odds-trigger-area {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #dedede;
  border-radius: 8rpx;
  padding: 8rpx 0;
  background-color: #f9f9f9;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

/* 赔率按钮行：保留三列结构，样式统一 */
.odds-row {
  width: 100%;
  display: flex;
  gap: 2rpx;
  margin-top: 0;
}

/* 按钮样式：统一交互效果，保留三列逻辑 */
.match-cell {
  flex: 1;
  text-align: center;
  padding: 12rpx 0;
  background-color: #f0f0f0;
  color: #666;
  font-size: 24rpx;
  cursor: pointer;
  &.selected {
    background-color: #d92929;
    color: #fff;
  }
  &:active {
    background: #e5e5e5;
  }
  &.selected:active {
    background: #c62828;
  }
  /* 中间分值按钮：特殊样式保留 */
  &.middle {
    color: #999;
    pointer-events: none; /* 禁止点击 */
  }
}

/* 全局样式：隐藏滚动条 */
::-webkit-scrollbar {
  display: none;
}

// 新增停售相关样式
.stop-bg {
  background-color: #dedede;
}
.disabled-trigger {
  pointer-events: none;
  opacity: 0.8;
}
.stop-cell {
  background-color: #dedede !important;
  color: #999 !important;
  cursor: not-allowed;
  &:active {
    background-color: #dedede !important;
  }
}
.stop-cell.selected {
  background-color: #dedede !important;
  color: #999 !important;
}
</style>
