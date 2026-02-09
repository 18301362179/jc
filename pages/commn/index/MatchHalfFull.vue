<template>
  <!---半全场-->
  <!-- 仅改：paddingTop 从 px 计算改为 rpx 计算（新增paddingTopVal） -->
  <view class="match-list" :style="{ paddingTop: paddingTopVal + 'rpx' }">
    <!-- 循环渲染多抽屉（适配任意数量日期标题） -->
    <view v-for="(drawer, drawerIdx) in finalDrawerList" :key="drawer.title" class="drawer-wrapper">
      <!-- 抽屉标题栏（吸顶）：仅改top值为rpx计算 + 移除高版本属性，其他不变 -->
      <view class="date-title sticky-header" :style="{ top: stickyHeaderTop + 'rpx' }" @click="toggleDrawer(drawerIdx)">
        <text>{{ drawer.title }}</text>
        <view class="arrow-icon" :class="{ rotated: expandedDrawers[drawerIdx] }">↓</view>
      </view>

      <!-- 抽屉内容：该日期下的半全场比赛列表（展开时显示） -->
      <view class="drawer-content" v-show="expandedDrawers[drawerIdx]">
        <view v-for="item in drawer.lotteryList" :key="item.id" class="match-row" style="background: #f6f6f6">
          <!-- ========== 第一行：停/单场 + 分析按钮（和总进球一致） ========== -->
          <view class="match-status-row">
            <view class="status-left">
              <text class="single-tag" v-if="item.is_bqc_single == 1 && item.is_stop == 0">单场</text>
              <text class="single-tag" style="background: #dedede" v-if="item.is_stop == 1">停售</text>
            </view>
            <view class="status-right">
              <!-- 仅改：@tap.stop 改为 @click.stop，其他不变 -->
              <view class="ai-analysis-btn" v-if="item.home_win_rate && item.visiting_win_rate" @click.stop="() => goToAiAnalysis(item)"> 分析 </view>
            </view>
          </view>

          <!-- ========== 核心修改：第一行下面改为整体左右布局 ========== -->
          <view class="main-content-row">
            <view class="main-left">
              <view class="top-left">
                <text class="league-name">{{ item.league_name }}</text>
              </view>
              <view class="bottom-left">
                <text class="serial-number">{{ item.serial_number }}</text>
                <text class="match-time">{{ item.race_date }}</text>
              </view>
            </view>

            <view class="main-right">
              <view class="top-right">
                <view class="team-vs"> {{ item.home_name }} VS {{ item.visiting_name }} </view>
                <view class="rate-row" v-if="item.home_win_rate || item.visiting_win_rate">
                  <text class="rate-text home" v-if="item.home_win_rate">胜率{{ item.home_win_rate || "" }}</text>
                  <text class="vs-text">{{ item.draw_rate ? "平率" + item.draw_rate : "" }}</text>
                  <text class="rate-text away" v-if="item.visiting_win_rate">胜率{{ item.visiting_win_rate || "" }}</text>
                </view>
              </view>
              <view class="bottom-right" :class="{ 'stop-bg': item.is_stop == 1 }">
                <view
                  class="score-trigger-area"
                  @click="item.is_stop != 1 && openScorePopup(item)"
                  :class="{
                    'selected-trigger': item.selectedScores && item.selectedScores.length > 0,
                    'disabled-trigger': item.is_stop == 1,
                  }"
                >
                  <text v-if="item.selectedScores && item.selectedScores.length > 0" class="selected-text">
                    {{ item.selectedScores.map((val) => getOptionLabel(val)).join(",") }}
                  </text>
                  <!-- 停售时替换提示文字为“已停售” -->
                  <text v-else class="trigger-tip">请选择投注内容</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 半全场弹窗：完全保留你原代码，无任何修改 -->
    <view class="score-popup-mask" v-show="isPopupShow" @click="closePopup"></view>
    <view class="score-popup" v-show="isPopupShow">
      <view class="popup-title"> {{ currentMatch && currentMatch.home_name }}(主) VS {{ currentMatch && currentMatch.visiting_name }}(客) </view>
      <view class="popup-subtitle">竞彩主队在上半场和全场比赛(不含加时和点球)的胜平负结果</view>

      <view class="half-full-container">
        <view class="section-label">半全场</view>
        <view class="half-full-grid">
          <view v-for="(item, idx) in halfFullOptions" :key="idx" class="half-full-option" :class="{ selected: selectedScores.includes(item.value) }" @click="toggleScore(item.value)">
            <text class="option-label">{{ item.label }}</text>
            <text class="option-odds">{{ item.odds }}</text>
          </view>
        </view>
      </view>

      <view class="popup-btn-bar">
        <button class="cancel-btn" @click="closePopup">取消</button>
        <button class="confirm-btn" @click="confirmSelection">确定</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    drawerList: { type: Array, default: () => [] },
    matchList: { type: Array, default: () => [] },
    statusBarHeight: { type: Number, default: 0 },
    goToAiAnalysis: { type: Function, required: true },
  },
  data() {
    return {
      isPopupShow: false,
      currentMatch: null,
      selectedScores: [],
      MAX_SELECT_COUNT: 10,
      expandedDrawers: [],
      // 缓存转换后的状态栏高度（px转rpx，适配多端）
      statusBarHeightRpx: 0,
      windowWidth: 0,
      halfFullOptions: [
        { label: "胜胜", value: "ss", oddsField: "ss_odds" },
        { label: "胜平", value: "sp", oddsField: "sp_odds" },
        { label: "胜负", value: "sf", oddsField: "sf_odds" },
        { label: "平胜", value: "ps", oddsField: "ps_odds" },
        { label: "平平", value: "pp", oddsField: "pp_odds" },
        { label: "平负", value: "pf", oddsField: "pf_odds" },
        { label: "负胜", value: "fs", oddsField: "fs_odds" },
        { label: "负平", value: "fp", oddsField: "fp_odds" },
        { label: "负负", value: "ff", oddsField: "ff_odds" },
      ],
    };
  },
  computed: {
    finalDrawerList() {
      // 完全保留你原代码，无修改
      if (this.drawerList.length > 0) {
        return this.drawerList;
      }
      return this.matchList.length > 0 ? [{ title: `周四 2025-12-04 共${this.matchList.length}场比赛`, lotteryList: this.matchList }] : [];
    },
    selectedMatchCount() {
      // 完全保留你原代码，无修改
      let count = 0;
      this.finalDrawerList.forEach((drawer) => {
        drawer.lotteryList.forEach((item) => {
          if (item.selectedScores && item.selectedScores.length > 0) {
            count++;
          }
        });
      });
      return count;
    },
    // 仅新增：计算rpx版paddingTop（和胜平负一致）
    paddingTopVal() {
      return this.statusBarHeightRpx + 88; // 44px=88rpx，8px=16rpx
    },
    // 仅新增：计算rpx版sticky header top值（和胜平负一致）
    stickyHeaderTop() {
      return this.statusBarHeightRpx + 88 - 10; // 3rpx是通用微调值，可按实际偏移动2/4
    },
  },
  watch: {
    finalDrawerList(newVal) {
      // 完全保留你原代码，无修改
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
        // 微信最新API：获取窗口信息（替代getSystemInfoSync的windowWidth）
        const windowInfo = wx.getWindowInfo();
        this.windowWidth = windowInfo.windowWidth || 375; // 兜底默认值
      } catch (e) {
        // 兼容旧版本微信：降级使用uni.getSystemInfo（避免报错）
        const systemInfo = uni.getSystemInfoSync();
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
    toggleDrawer(drawerIdx) {
      this.$set(this.expandedDrawers, drawerIdx, !this.expandedDrawers[drawerIdx]);
    },
    getOptionLabel(value) {
      const opt = this.halfFullOptions.find((item) => item.value === value);
      return opt ? opt.label : "";
    },
    openScorePopup(match) {
      const isCurrentMatchUnselected = !match.selectedScores || match.selectedScores.length === 0;
      if (isCurrentMatchUnselected && this.selectedMatchCount >= 8) {
        uni.showToast({
          title: "最多只能选择8场比赛",
          icon: "none",
          duration: 2000,
        });
        return;
      }
      this.selectedScores = Array.isArray(match.selectedScores) ? [...match.selectedScores] : [];
      this.currentMatch = match;
      this.isPopupShow = true;
      this.halfFullOptions = this.halfFullOptions.map((opt) => ({
        ...opt,
        odds: match[opt.value] ? match[opt.value].toString() : match[opt.oddsField] || "",
      }));
    },
    toggleScore(scoreValue) {
      if (this.isPopupShow && !this.currentMatch) return;
      const index = this.selectedScores.indexOf(scoreValue);
      if (index === -1) {
        if (this.selectedScores.length >= this.MAX_SELECT_COUNT) {
          uni.showToast({
            title: `最多选择${this.MAX_SELECT_COUNT}个选项`,
            icon: "none",
            duration: 1500,
          });
          return;
        }
        this.selectedScores.push(scoreValue);
      } else {
        this.selectedScores.splice(index, 1);
      }
    },
    confirmSelection() {
      if (!this.currentMatch) {
        this.closePopup();
        return;
      }
      let targetDrawerIdx = -1;
      let targetItemIdx = -1;
      this.finalDrawerList.some((drawer, dIdx) => {
        const idx = drawer.lotteryList.findIndex((item) => item.id === this.currentMatch.id);
        if (idx > -1) {
          targetDrawerIdx = dIdx;
          targetItemIdx = idx;
          return true;
        }
        return false;
      });
      if (targetDrawerIdx > -1 && targetItemIdx > -1) {
        this.$set(this.finalDrawerList[targetDrawerIdx].lotteryList[targetItemIdx], "selectedScores", [...this.selectedScores]);
        this.$emit("on-half-full-selected", [...this.finalDrawerList]);
      }
      this.closePopup();
    },
    closePopup() {
      this.isPopupShow = false;
      this.selectedScores = [];
      this.currentMatch = null;
      this.halfFullOptions = this.halfFullOptions.map((opt) => ({ ...opt, odds: "" }));
    },
  },
};
</script>

<style scoped lang="scss">
/* 仅修改sticky-header样式：移除高版本属性、调整z-index，其他完全保留你原代码 */
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
    transition: transform 0.2s ease;
    font-size: 24rpx;
    color: #666;
  }

  .rotated {
    transform: rotate(180deg);
  }
}

/* 以下所有样式：完全保留你原代码，无任何修改 */
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
.drawer-content {
  width: 100%;
  transition: all 0.2s ease;
}

.match-row {
  box-sizing: border-box;
  background-color: #fff;
  border-bottom: 1rpx solid #dedede;
  padding: 0rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  overflow: hidden;
}

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
    width: 60rpx;
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
  }
}

.main-content-row {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  gap: 16rpx;
  padding: 8rpx 0;
  overflow: hidden;
}

.main-left {
  width: 160rpx;
  display: flex;
  flex-direction: column;
  flex: none;
  gap: 8rpx;
}

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

.top-left {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  text-align: center;
  margin-top: 8rpx;
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

.rate-row {
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 22rpx;
  color: #999;

  .rate-text {
    width: 100%;
    flex: 1;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .rate-text.home {
    text-align: right;
    padding-right: 10rpx;
  }
  .rate-text.away {
    text-align: left;
    padding-left: 10rpx;
  }
  .vs-text {
    width: 140rpx;
    text-align: center;
    flex-shrink: 0;
    color: #999;
    font-size: 20rpx;
  }
}

.bottom-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 2rpx;
}

.bottom-right {
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.league-name-row {
  display: flex;
  align-items: center;
  width: 100%;
}

.league-name {
  font-size: 22rpx;
  color: #777;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.serial-number {
  width: 100%;
  font-size: 20rpx;
  color: #777;
  margin-bottom: 10rpx;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.match-time {
  width: 100%;
  text-align: center;
  font-size: 20rpx;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-vs {
  font-size: 24rpx;
  color: #333;
  text-align: center;
  padding: 4rpx 0;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:active {
    color: #d92929;
    opacity: 0.8;
  }
}

.score-trigger-area {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #dedede;
  border-radius: 8rpx;
  padding: 16rpx 10rpx;
  background-color: #f9f9f9;
  cursor: pointer;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  transition: all 0.2s ease;
  flex-shrink: 0;

  .trigger-tip {
    font-size: 28rpx;
    color: #999;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
  }

  &:active {
    background-color: #f0f0f0;
  }
}

.selected-trigger {
  background-color: #d92929;
  border-color: #d92929;
  color: #fff;

  .selected-text {
    font-size: 28rpx;
    color: #fff;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 10rpx;
    text-align: center;
    box-sizing: border-box;
  }
}
.disabled-trigger {
  pointer-events: none; // 彻底禁止点击事件
  opacity: 0.8;
  background-color: #f5f5f5 !important;
}
// 停售时触发区文字颜色适配
.disabled-trigger .trigger-tip {
  height: 41rpx !important;
  color: #666 !important;
}
.score-popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999999;
}

.score-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 85%;
  max-height: 80vh;
  background: #fff;
  border-radius: 12rpx;
  z-index: 9999999;
  box-sizing: border-box;
  padding: 14rpx;
  overflow-y: auto;
}

.popup-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #eee;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.popup-subtitle {
  font-size: 22rpx;
  color: #666;
  text-align: center;
  padding: 8rpx 0;
  margin-bottom: 10rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.half-full-container {
  display: flex;
  align-items: stretch;
  border-top: 1rpx solid #eee;
  border-left: 1rpx solid #eee;
  margin-bottom: 16rpx;
}

.section-label {
  flex: 0 0 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #6fbdbd;
  color: #fff;
  font-size: 24rpx;
  font-weight: 500;
  writing-mode: vertical-rl;
  letter-spacing: 2rpx;
  border-right: 1rpx solid #eee;
}

.half-full-grid {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  border-top: 1rpx solid #eee;
  border-left: 1rpx solid #eee;
}

.half-full-option {
  width: 33.3333%;
  box-sizing: border-box;
  padding: 16rpx 0;
  background: #f9f9f9;
  border-right: 1rpx solid #eee;
  border-bottom: 1rpx solid #eee;
  text-align: center;
  cursor: pointer;
  color: #999;
  transition: all 0.2s ease;

  .option-label {
    font-size: 24rpx;
    display: block;
    margin-bottom: 4rpx;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .option-odds {
    font-size: 20rpx;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &.selected {
    background: #d92929;
    color: #fff !important;
  }

  &:active {
    background: #f0f0f0;
  }

  &.selected:active {
    background: #c62828;
  }

  &:nth-child(3n) {
    border-right: none;
  }
}

.popup-btn-bar {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 0 10rpx;
  box-sizing: border-box;

  .cancel-btn,
  .confirm-btn {
    flex: 1;
    height: 70rpx;
    border-radius: 8rpx;
    font-size: 28rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
  }

  .cancel-btn {
    background: #fff;
    color: #666;
    border: 1rpx solid #ddd;
    transition: all 0.2s ease;

    &:active {
      background: #f5f5f5;
    }
  }

  .confirm-btn {
    background: #d92929;
    color: #fff;
    border: none;
    transition: all 0.2s ease;

    &:active {
      background: #c62828;
    }
  }
}

::-webkit-scrollbar {
  display: none;
}

/* #ifdef APP-PLUS */
.score-popup {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
/* #endif */
</style>
