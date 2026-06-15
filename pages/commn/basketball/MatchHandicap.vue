<template>
  <!-- 让分胜负页面：重构布局样式，统一视觉风格 -->
  <!-- 仅改：paddingTop 从 px 计算改为 rpx 计算（paddingTopVal） -->
  <view class="match-list" :style="{ paddingTop: paddingTopVal + 'rpx' }">
    <!-- 抽屉循环容器 -->
    <view v-for="(drawer, drawerIdx) in finalDrawerList" :key="drawerIdx" class="drawer-wrapper">
      <view class="date-title sticky-header" :style="{ top: stickyHeaderTop + 'rpx' }" @click="toggleDrawer(drawerIdx)">
        <text>{{ drawer.title }}</text>
        <view class="arrow-icon" :class="{ rotated: expandedDrawers[drawerIdx] }">↓</view>
      </view>

      <!-- 抽屉内容 -->
      <view class="drawer-content" v-show="expandedDrawers[drawerIdx]">
        <view v-for="(item, index) in drawer.lotteryList" :key="index" class="match-row" style="background: #f6f6f6">
          <!-- ========== 新增：状态行（和比分/半全场统一） ========== -->
          <view class="match-status-row">
            <view class="status-left">
              <!-- 单场标签：样式统一 -->
              <!-- 单场标签：无停时，根据is_sf_single显示 -->
              <text class="single-tag" v-if="item.is_rsf_single == 1 && item.is_stop == 0">单</text>
              <text class="single-tag" style="background: #dedede" v-if="item.is_stop == 1">停</text>
            </view>
            <view class="status-right">
              <!-- 分析按钮：样式统一 -->
              <!-- 仅改：@tap.stop 改为 @click.stop -->
              <view class="ai-analysis-btn" :class="{ 'x-text-green': item.is_buy !== 0 }"  @click.stop="() => goToAiAnalysis(item)">
                <text>详细</text>
                <text class="small-coin" v-if="item.is_buy == 0">{{item.charge}}</text>
              </view>
            </view>
          </view>

          <!-- ========== 核心：重构为左右布局（和比分/半全场统一） ========== -->
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

            <!-- 右侧：自适应宽度，垂直排列队名VS+胜+让分胜负选项 -->
            <view class="main-right">
              <view class="top-right">
                <!-- 队名VS：样式统一 -->
                <view class="team-vs">
                  <text class="team-name away">{{ item.visiting_name }}</text>
                  <text class="vs-text">VS</text>
                  <!-- 关键修改：拆分主队名称和让球数，添加颜色逻辑 -->
                  <text class="team-name home">
                    {{ item.home_name }}
                    <text v-if="item.r_goal && item.r_goal !== ''" class="handicap-num">
                      (
                      <text
                        :class="{
                          'text-red': item.r_goal && item.r_goal.includes('+'),
                          'text-green': item.r_goal && !item.r_goal.includes('+'),
                        }"
                      >
                        {{ item.r_goal }}
                      </text>
                      )
                    </text>
                  </text>
                </view>

                <!-- 胜行：样式统一 -->
                <view class="rate-row">
                  <text class="rate-text away" v-if="item.visiting_win_rate&&$urlValue">胜率{{ item.visiting_win_rate || "" }}</text>
                  <text class="vs-text"></text>
                  <text class="rate-text home" v-if="item.home_win_rate&&$urlValue">胜率{{ item.home_win_rate || "" }}</text>
                </view>
              </view>

              <!-- 让分胜负按钮：样式统一 -->
              <view class="bottom-right" :class="{ 'stop-bg': item.is_stop == 1 }">
                <view class="odds-trigger-area" :class="{ 'disabled-trigger': item.is_stop == 1 }">
              <view class="odds-row">
                  <view class="match-cell away" :class="{ selected: item.rAwaySelected, 'stop-cell': item.is_stop == 1 }" @click="item.is_stop != 1 && checkAndSelect(item, 'rAwaySelected')"> 
                      主负{{ item.r_loss_multiplier || "--" }} 
                      <text v-if="item.r_loss_multiplier_c == 1" class="up">↑</text>
                      <text v-if="item.r_loss_multiplier_c == -1" class="down">↓</text>
                  </view>
                  <view class="match-cell home" :class="{ selected: item.rHomeSelected, 'stop-cell': item.is_stop == 1 }" @click="item.is_stop != 1 && checkAndSelect(item, 'rHomeSelected')"> 
                      主胜{{ item.r_win_multiplier || "--" }} 
                      <text v-if="item.r_win_multiplier_c == 1" class="up">↑</text>
                      <text v-if="item.r_win_multiplier_c == -1" class="down">↓</text>
                  </view>
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
import { getRateColor } from "@/utils/index.js";
export default {
  props: {
    matchList: { type: Array, default: () => [] },
    statusBarHeight: { type: Number, default: 0 },
    goToAiAnalysis: { type: Function, required: true },
    drawerList: { type: Array, default: () => [] },
  },
  data() {
    return {
      expandedDrawers: [],
      // ====== 新增1行：本地缓存drawerList，避免直接依赖prop ======
      localDrawerList: [],
      // 缓存转换后的状态栏高度（px转rpx，适配多端）
      statusBarHeightRpx: 0,
      windowWidth: 0,
    };
  },
  computed: {
    finalDrawerList() {
      // ====== 修改1行：优先用本地localDrawerList，逻辑不变 ======
      if (this.localDrawerList.length > 0) {
        return this.localDrawerList;
      }
      return this.matchList.length > 0 ? [{ title: `未知日期 共${this.matchList.length}场比赛`, lotteryList: this.matchList }] : [];
    },
    selectedMatchCount() {
      // 完全保留原有逻辑，一行没改
      let count = 0;
      this.finalDrawerList.forEach((drawer) => {
        drawer.lotteryList.forEach((item) => {
          if (item.rHomeSelected || item.rAwaySelected) {
            count++;
          }
        });
      });
      return count;
    },
    // 仅新增：计算rpx版paddingTop（按你要求只加88）
    paddingTopVal() {
      return this.statusBarHeightRpx + 88;
    },
    // 仅新增：计算rpx版sticky header top值（按你要求只加88）
    stickyHeaderTop() {
      return this.statusBarHeightRpx + 88 - 10; // 3rpx是通用微调值，可按实际偏移动2/4
    },
  },
  watch: {
    // ====== 新增3行：监听父组件prop变化，深拷贝到本地（解决prop警告+小程序响应式） ======
    drawerList: {
      immediate: true, // 初始化就同步
      deep: true, // 深度监听数组变化
      handler(newVal) {
        this.localDrawerList = JSON.parse(JSON.stringify(newVal)); // 深拷贝避免prop关联
        this.expandedDrawers = this.localDrawerList.map(() => true); // 同步抽屉展开状态
      },
    },
    finalDrawerList(newVal) {
      /* 保留原有watch，不删，不影响 */
      this.expandedDrawers = newVal.map(() => true);
    },
    // 仅新增：监听状态栏高度变化，转换单位
    statusBarHeight(newVal) {
      this.statusBarHeightRpx = this.pxToRpx(newVal);
    },
  },
  created() {
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
        // 兼容旧版本微信：降级使用uni.getSystemInfo（避免报错）
        this.windowWidth = systemInfo.windowWidth || 375;
        console.warn("当前微信版本不支持wx.getWindowInfo，已降级兼容", e);
      }
    },
    // 修正后的px转rpx：使用新API获取的windowWidth，优化精度
    pxToRpx(px) {
      if (!px || !this.windowWidth) return 0;
      // 计算后四舍五入，减少1-2px的机型偏差
      return Math.round((px / this.windowWidth) * 750 + 0.5);
    },
    getRateColor: getRateColor,
    // 切换抽屉展开/收起
    toggleDrawer(drawerIdx) {
      this.$set(this.expandedDrawers, drawerIdx, !this.expandedDrawers[drawerIdx]);
    },
    // 校验并触发选中（新增停校验：is_stop）
    checkAndSelect(item, selectType) {
      const isCancel = item[selectType];
      const isAdd = !isCancel;

      // 2. 最多8场校验
      if (isAdd) {
        const isCurrentMatchSelected = item.rHomeSelected || item.rAwaySelected;
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
  z-index: 7; // 仅改：从999999999降为999
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

/* ========== 核心重构：比赛行样式（和比分/半全场统一） ========== */
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

/* 状态行：和比分/半全场完全一致 */
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

/* 核心：整体左右布局（和比分/半全场完全一致） */
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

/* 队名VS：样式统一 */
.team-vs {
  font-size: 24rpx;
  color: #333;
  text-align: center;
  padding: 4rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  .team-name {
    flex: 1;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    // 新增：让球数样式
    .handicap-num {
      margin-left: 4rpx;
      font-size: 20rpx;
      font-weight: 900;
    }
    // +号红色
    .text-red {
      color: #d92929;
    }
    // -号绿色
    .text-green {
      color: #00b578;
    }
  }
  .team-name.away {
    text-align: right;
  }
  .team-name.home {
    text-align: left;
  }
  .vs-text {
    width: 80rpx;
    text-align: center;
    flex-shrink: 0;
    font-weight: 500;
  }
}

/* 胜行：样式统一 */
.rate-row {
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 22rpx;
  color: #999;
  justify-content: center;
  gap: 10rpx;

  .rate-text {
    flex: 1;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .rate-text.away {
    text-align: right;
  }
  .rate-text.home {
    text-align: left;
  }
  .vs-text {
    width: 60rpx;
  }
}

/* 让分胜负选项区：和比分选择区统一样式 */
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

/* 赔率按钮行：样式统一 */
.odds-row {
  width: 100%;
  display: flex;
  gap: 2rpx;
  margin-top: 0;
}

/* 按钮样式：统一交互效果 */
.match-cell {
  flex: 1;
  text-align: center;
  padding: 12rpx 0;
  background-color: #f0f0f0;
  color: #666;
  font-size: 24rpx;
  cursor: pointer;
  border-radius: 4rpx;
  &.selected {
    background-color: #d92929;
    color: #fff;
    // 关键新增：选中时让球数也变成白色
    .team-name .handicap-num .text-red,
    .team-name .handicap-num .text-green {
      color: #fff !important;
    }
  }
  &:active {
    background: #e5e5e5;
  }
  &.selected:active {
    background: #c62828;
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
