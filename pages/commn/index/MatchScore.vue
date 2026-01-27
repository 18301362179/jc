<template>
  <!---比分-->
  <!-- 仅改：paddingTop 从 px 计算改为 rpx 计算（paddingTopVal） -->
  <view class="match-list" :style="{ paddingTop: paddingTopVal + 'rpx' }">
    <!-- 抽屉循环容器（兼容原有matchList，无侵入） -->
    <view v-for="(drawer, drawerIdx) in finalDrawerList" :key="drawerIdx" class="drawer-wrapper">
      <!-- 吸顶标题栏（适配statusBarHeight，点击展开/收起） -->
      <!-- 仅改：top 值从 px 计算改为 rpx 计算（stickyHeaderTop） -->
      <view class="date-title sticky-header" 
        :style="{ top: stickyHeaderTop + 'rpx'  }"
        @click="toggleDrawer(drawerIdx)"
        hover-class="none"
      >
        <view class="drawer-title-text">{{ drawer.title }}</view>
        <view class="arrow-icon" :class="{ rotated: expandedDrawers[drawerIdx] }">↓</view>
      </view>

      <!-- 抽屉内容：比分列表（复刻半全场的布局逻辑） -->
      <view v-show="expandedDrawers[drawerIdx]" class="drawer-content">
        <view v-for="(item, index) in drawer.lotteryList" :key="index" class="match-row" style="background: #F6F6F6;">
          <!-- ========== 第一行状态行（和半全场完全一致） ========== -->
          <view class="match-status-row">
            <view class="status-left">
              <text class="single-tag" v-if="item.is_stop == 0 && item.is_bf_single == 1">单场</text>
            </view>
            <view class="status-right">
              <!-- 仅改：@tap.stop 改为 @click.stop -->
              <view class="ai-analysis-btn" @click.stop="() => goToAiAnalysis(item)">分析</view>
            </view>
          </view>

          <!-- ========== 核心修改：复刻半全场的左右布局逻辑 ========== -->
          <view class="main-content-row">
            <!-- 左侧区域：和半全场完全一致（固定宽度+flex:none） -->
            <view class="main-left">
              <view class="top-left">
                  <text class="league-name">{{ item.league_name }}</text>
              </view>
              <view class="bottom-left">
                <text class="serial-number">{{ item.serial_number }}</text>
                <text class="match-time">{{ item.race_date }}</text>
              </view>
            </view>

            <!-- 右侧区域：复刻半全场的逐层约束 -->
            <view class="main-right">
              <view class="top-right">
                <view class="team-vs" @click="handleAiAnalysis(item)">
                  <text class="team-name home">{{ item.home_name }}</text>
                  <text class="vs-text">VS</text>
                  <text class="team-name away">{{ item.visiting_name }}</text>
                </view>
                <view class="rate-row" v-if="item.home_win_rate || item.visiting_win_rate">
                  <text class="rate-text home" v-if="item.home_win_rate">胜率{{ item.home_win_rate || '' }}%</text>
                  <text class="vs-text"></text>
                  <text class="rate-text away" v-if="item.visiting_win_rate">胜率{{ item.visiting_win_rate || '' }}%</text>
                </view>
              </view>
              <!-- 复刻半全场的bottom-right：仅保留宽度+溢出约束 -->
              <view class="bottom-right">
                <view 
                  class="odds-trigger-area" 
                  @click="openScorePopup(item)"
                  :class="{ 'selected-trigger': item.selectedScores && item.selectedScores.length > 0 }"
                  hover-class="none"
                >
                  <!-- 核心修改：移除多余的text-wrapper，直接用text标签（和半全场一致） -->
                  <text v-if="item.selectedScores && item.selectedScores.length > 0" class="selected-text">
                    {{ item.selectedScores.join(",").replace(/\n|\r/g, "") }}
                  </text>
                  <text v-else class="trigger-tip">请选择投注内容</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 弹框部分：保持不变 -->
    <view class="score-popup-mask" v-show="isPopupShow" @click="closePopup" hover-class="none"></view>
    <view class="score-popup" v-show="isPopupShow">
      <view v-if="isLoading" class="popup-loading">加载中...</view>
      <view v-else>
        <view class="popup-title"> 
          {{ currentMatch && currentMatch.home_name }}(主) 
          <text class="vs-text">VS</text> 
          {{ currentMatch && currentMatch.visiting_name }}(客) 
        </view>
        <view class="score-section">
          <view class="section-label main-win">主胜比分</view>
          <view class="score-options">
            <view v-for="(item, idx) in mainWinScores" :key="idx" class="score-option" :class="{ selected: selectedScores.includes(item.value) }" @click="toggleScore(item.value)" hover-class="none">
              <text class="score-text">{{ item.label }}</text>
              <text class="score-odds">{{ item.odds }}</text>
            </view>
            <view class="score-option other" :class="{ selected: selectedScores.includes('胜其它') }" @click="toggleScore('胜其它')" hover-class="none">
              <text class="score-text">胜其它</text>
              <text class="score-odds">{{ currentMatch && currentMatch.score_odds && currentMatch.score_odds.winOther || "" }}</text>
            </view>
          </view>
        </view>
        <view class="score-section">
          <view class="section-label draw">平比分</view>
          <view class="score-options">
            <view v-for="(item, idx) in drawScores" :key="idx" class="score-option" :class="{ selected: selectedScores.includes(item.value) }" @click="toggleScore(item.value)" hover-class="none">
              <text class="score-text">{{ item.label }}</text>
              <text class="score-odds">{{ item.odds }}</text>
            </view>
            <view class="score-option other" :class="{ selected: selectedScores.includes('平其它') }" @click="toggleScore('平其它')" hover-class="none">
              <text class="score-text">平其它</text>
              <text class="score-odds">{{ currentMatch && currentMatch.score_odds && currentMatch.score_odds.drawOther || "" }}</text>
            </view>
          </view>
        </view>
        <view class="score-section">
          <view class="section-label away-win">客胜比分</view>
          <view class="score-options">
            <view v-for="(item, idx) in awayWinScores" :key="idx" class="score-option" :class="{ selected: selectedScores.includes(item.value) }" @click="toggleScore(item.value)" hover-class="none">
              <text class="score-text">{{ item.label }}</text>
              <text class="score-odds">{{ item.odds }}</text>
            </view>
            <view class="score-option other" :class="{ selected: selectedScores.includes('负其它') }" @click="toggleScore('负其它')" hover-class="none">
              <text class="score-text">负其它</text>
              <text class="score-odds">{{ currentMatch && currentMatch.score_odds && currentMatch.score_odds.loseOther || "" }}</text>
            </view>
          </view>
        </view>
        <view class="popup-btn-bar">
          <button class="cancel-btn" @click="closePopup" hover-class="none">取消</button>
          <button class="confirm-btn" @click="confirmSelection" hover-class="none">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// script部分完全复用原有逻辑，仅保留注释
import { queryHomeAndVisitingGoalOdds } from "@/api/demo";
export default {
  props: {
    matchList: { type: Array, default: () => [] },
    statusBarHeight: { type: Number, default: 0 },
    drawerList: { type: Array, default: () => [] },
    goToAiAnalysis: { type: Function, required: true },
  },
  data() {
    return {
      isPopupShow: false,
      currentMatch: null,
      selectedScores: [],
      MAX_SELECT_COUNT: 10,
      isLoading: false,
      currentOddsData: null,
      mainWinScores: [
        { label: "1:0", value: "1:0", odds: "" },
        { label: "2:0", value: "2:0", odds: "" },
        { label: "2:1", value: "2:1", odds: "" },
        { label: "3:0", value: "3:0", odds: "" },
        { label: "3:1", value: "3:1", odds: "" },
        { label: "3:2", value: "3:2", odds: "" },
        { label: "4:0", value: "4:0", odds: "" },
        { label: "4:1", value: "4:1", odds: "" },
        { label: "4:2", value: "4:2", odds: "" },
        { label: "5:0", value: "5:0", odds: "" },
        { label: "5:1", value: "5:1", odds: "" },
        { label: "5:2", value: "5:2", odds: "" },
      ],
      drawScores: [
        { label: "0:0", value: "0:0", odds: "" },
        { label: "1:1", value: "1:1", odds: "" },
        { label: "2:2", value: "2:2", odds: "" },
        { label: "3:3", value: "3:3", odds: "" },
      ],
      awayWinScores: [
        { label: "0:1", value: "0:1", odds: "" },
        { label: "0:2", value: "0:2", odds: "" },
        { label: "1:2", value: "1:2", odds: "" },
        { label: "0:3", value: "0:3", odds: "" },
        { label: "1:3", value: "1:3", odds: "" },
        { label: "2:3", value: "2:3", odds: "" },
        { label: "0:4", value: "0:4", odds: "" },
        { label: "1:4", value: "1:4", odds: "" },
        { label: "2:4", value: "2:4", odds: "" },
        { label: "0:5", value: "0:5", odds: "" },
        { label: "1:5", value: "1:5", odds: "" },
        { label: "2:5", value: "2:5", odds: "" },
      ],
      expandedDrawers: [],
      // 缓存转换后的状态栏高度（px转rpx，适配多端）
      statusBarHeightRpx: 0,
       windowWidth: 0
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
          if (item.selectedScores && item.selectedScores.length > 0) {
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
      return this.statusBarHeightRpx + 88;
    }
  },
  watch: {
    finalDrawerList(newVal) {
      this.expandedDrawers = newVal.map(() => true);
    },
    // 仅新增：监听状态栏高度变化，转换单位
    statusBarHeight(newVal) {
      this.statusBarHeightRpx = this.pxToRpx(newVal);
    }
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
    console.warn('当前微信版本不支持wx.getWindowInfo，已降级兼容', e);
  }
},
// 修正后的px转rpx：使用新API获取的windowWidth，优化精度
pxToRpx(px) {
  if (!px || !this.windowWidth) return 0;
  // 计算后四舍五入，减少1-2px的机型偏差
  return Math.round((px / this.windowWidth) * 750 + 0.5);
},
    // 以下所有方法：完全保留你原代码，无任何修改
    handleAiAnalysis(item) { console.log('AI分析', item); },
    toggleDrawer(drawerIdx) { this.$set(this.expandedDrawers, drawerIdx, !this.expandedDrawers[drawerIdx]); },
    async openScorePopup(match) {
      const isCurrentMatchUnselected = !match.selectedScores || match.selectedScores.length === 0;
      if (isCurrentMatchUnselected && this.selectedMatchCount >= 8) {
        uni.showToast({ title: '最多只能选择8场比赛', icon: 'none', duration: 2000 });
        return;
      }

      this.isLoading = true;
      this.selectedScores = Array.isArray(match.selectedScores) ? [...match.selectedScores] : [];
      this.currentMatch = match;
      this.isPopupShow = true;
      this.currentOddsData = match.oddsData || null;

      try {
        if (!this.currentOddsData) {
          const res = await queryHomeAndVisitingGoalOdds({
            serialNumber: match.serial_number,
            dateStr: match.date_str,
          });
          if (res.code === "200" && res.data) {
            this.currentOddsData = res.data;
          }
        }

        if (this.currentOddsData) {
          const oddsData = this.currentOddsData;
          this.mainWinScores = this.mainWinScores.map((item) => {
            let odds = item.odds;
            switch (item.value) {
              case "1:0": odds = oddsData.ybl?.toString() || ""; break;
              case "2:0": odds = oddsData.ebl?.toString() || ""; break;
              case "2:1": odds = oddsData.eby?.toString() || ""; break;
              case "3:0": odds = oddsData.sbl?.toString() || ""; break;
              case "3:1": odds = oddsData.sby?.toString() || ""; break;
              case "3:2": odds = oddsData.sbe?.toString() || ""; break;
              case "4:0": odds = oddsData.sibl?.toString() || ""; break;
              case "4:1": odds = oddsData.siby?.toString() || ""; break;
              case "4:2": odds = oddsData.sibe?.toString() || ""; break;
              case "5:0": odds = oddsData.wbl?.toString() || ""; break;
              case "5:1": odds = oddsData.wby?.toString() || ""; break;
              case "5:2": odds = oddsData.wbe?.toString() || ""; break;
              default: odds = "";
            }
            return { ...item, odds };
          });

          this.drawScores = this.drawScores.map((item) => {
            let odds = item.odds;
            switch (item.value) {
              case "0:0": odds = oddsData.lbl?.toString() || ""; break;
              case "1:1": odds = oddsData.yby?.toString() || ""; break;
              case "2:2": odds = oddsData.ebe?.toString() || ""; break;
              case "3:3": odds = oddsData.sbs?.toString() || ""; break;
              default: odds = "";
            }
            return { ...item, odds };
          });

          this.awayWinScores = this.awayWinScores.map((item) => {
            let odds = item.odds;
            switch (item.value) {
              case "0:1": odds = oddsData.lby?.toString() || ""; break;
              case "0:2": odds = oddsData.lbe?.toString() || ""; break;
              case "1:2": odds = oddsData.ybe?.toString() || ""; break;
              case "0:3": odds = oddsData.lbs?.toString() || ""; break;
              case "1:3": odds = oddsData.ybs?.toString() || ""; break;
              case "2:3": odds = oddsData.ebs?.toString() || ""; break;
              case "0:4": odds = oddsData.lbsi?.toString() || ""; break;
              case "1:4": odds = oddsData.ybsi?.toString() || ""; break;
              case "2:4": odds = oddsData.ebsi?.toString() || ""; break;
              case "0:5": odds = oddsData.lbw?.toString() || ""; break;
              case "1:5": odds = oddsData.ybw?.toString() || ""; break;
              case "2:5": odds = oddsData.ebw?.toString() || ""; break;
              default: odds = "";
            }
            return { ...item, odds };
          });

          this.currentMatch.score_odds = {
            winOther: oddsData.sqt?.toString() || "",
            drawOther: oddsData.pqt?.toString() || "",
            loseOther: oddsData.fqt?.toString() || ""
          };
        }
      } catch (err) {
        console.error("获取赔率失败:", err);
        uni.showToast({ title: "赔率加载失败", icon: "none" });
      } finally {
        this.isLoading = false;
      }
    },
    toggleScore(scoreValue) {
      if (this.isLoading) return;
      const index = this.selectedScores.indexOf(scoreValue);
      if (index === -1) {
        this.selectedScores.push(scoreValue);
      } else {
        this.selectedScores.splice(index, 1);
      }
    },
    confirmSelection() {
      if (!this.currentMatch || this.isLoading) return;

      let targetItem = null;
      let targetDrawerIdx = -1;
      let targetItemIdx = -1;

      this.finalDrawerList.forEach((drawer, dIdx) => {
        const idx = drawer.lotteryList.findIndex((item) => item.id === this.currentMatch.id);
        if (idx > -1) {
          targetDrawerIdx = dIdx;
          targetItemIdx = idx;
          targetItem = drawer.lotteryList[idx];
        }
      });

      if (targetItem) {
        const updatedMatch = {
          ...targetItem,
          selectedScores: [...this.selectedScores],
          oddsData: this.currentOddsData,
          score_odds: this.currentMatch.score_odds || { winOther: "", drawOther: "", loseOther: "" }
        };

        this.$set(this.finalDrawerList[targetDrawerIdx].lotteryList, targetItemIdx, updatedMatch);
        this.$emit("on-score-selected", this.finalDrawerList);
      }

      this.closePopup();
    },
    closePopup() {
      this.isPopupShow = false;
      this.selectedScores = [];
      this.currentMatch = null;
      this.currentOddsData = null;
      this.isLoading = false;
    }
  },
};
</script>

<style scoped lang="scss">
/* 全局样式：复刻半全场的基础样式 */
.match-list {
  background-color: #f5f5f5;
  box-sizing: border-box;
  padding-bottom: 140rpx;
// #ifdef MP-WEIXIN
  padding-bottom: 230rpx;
// #endif
}

.drawer-wrapper { width: 100%; margin-bottom: 8rpx; background: #f5f5f5 }

/* 吸顶标题栏：和半全场一致 */
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

  .drawer-title-text { font-size: 24rpx; color: #333; }
  .arrow-icon { transition: transform 0.2s ease; font-size: 24rpx; color: #666; }
  .rotated { transform: rotate(180deg); }
}

.drawer-content { width: 100%; transition: all 0.2s ease; }

/* 比赛行：复刻半全场的约束 */
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
  overflow: hidden; // 新增：和半全场一致
}

/* 状态行：完全复刻半全场 */
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

  .status-right .ai-analysis-btn {
    font-size: 24rpx;
    color: #06f;
    cursor: pointer;
    transition: opacity 0.2s;
    letter-spacing: 4rpx;
    &:active { opacity: 0.8; }
  }
}

/* ========== 核心：复刻半全场的左右布局 ========== */
.main-content-row {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  gap: 16rpx;
  padding: 8rpx 0;
  overflow: hidden; // 复刻半全场：根层溢出约束
}

/* 左侧区域：完全复刻半全场（固定宽度+flex:none） */
.main-left {
  width: 160rpx;
  display: flex;
  flex-direction: column;
  flex: none; // 关键：禁止拉伸/收缩，固定宽度
  gap: 8rpx;
}

/* 右侧区域：完全复刻半全场（固定剩余宽度+逐层溢出） */
.main-right {
  flex: 1;
  width: calc(100% - 176rpx); // 160rpx+16rpx，和半全场一致
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  background: #fff;
  box-sizing: border-box;
  overflow: hidden; // 复刻半全场：第二层溢出约束
}

/* 左侧子元素：和半全场一致 */
.top-left {
  margin-top: 8rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.bottom-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 2rpx;
}

.league-name {
  font-size: 22rpx;
  color: #777;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; // 复刻半全场：联赛名省略
}

.serial-number, .match-time {
  width: 100%;
  font-size: 20rpx;
  color: #999;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; // 复刻半全场：编号/时间省略
}

.serial-number { margin-bottom: 10rpx; }

/* 右侧子元素：复刻半全场 */
.top-right {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden; // 复刻半全场：第三层溢出约束
}

/* 胜率行：完全复刻半全场 */
.rate-row {
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 22rpx;
  color: #999;

  .rate-text {
    flex: 1;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .rate-text.home { text-align: right; padding-right: 10rpx; }
  .rate-text.away { text-align: left; padding-left: 10rpx; }
  .vs-text {
    width: 40rpx;
    text-align: center;
    flex-shrink: 0;
    color: #999;
    font-size: 20rpx;
  }
}

/* bottom-right：完全复刻半全场 */
.bottom-right {
  width: 100%;
  box-sizing: border-box;
  overflow: hidden; // 复刻半全场：第四层溢出约束
}

/* 队名VS：复刻半全场的省略逻辑 */
.team-vs {
  font-size: 24rpx;
  color: #333;
  text-align: center;
  padding: 4rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;

  &:active { color: #d92929; opacity: 0.8; }

  .team-name {
    flex: 1;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis; // 复刻半全场：队名省略
  }

  .team-name.home { text-align: right; padding-right: 10rpx; }
  .team-name.away { text-align: left; padding-left: 10rpx; }
  .vs-text {
    width: 40rpx;
    text-align: center;
    flex-shrink: 0;
    font-weight: 500;
  }
}

/* ========== 核心：复刻半全场的触发区样式 ========== */
.odds-trigger-area {
  // 仅保留半全场的必要属性，移除所有多余flex属性
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #DEDEDE;
  border-radius: 8rpx;
  padding: 16rpx 10rpx;
  background-color: #f9f9f9;
  cursor: pointer;
  width: 100%; 
  max-width: 100%;
  box-sizing: border-box;
  transition: all 0.2s ease;
  flex-shrink: 0; // 仅保留半全场的这个属性
  overflow: hidden; // 复刻半全场：最后一层溢出约束

  // 复刻半全场的trigger-tip样式（无多余嵌套）
  .trigger-tip {
    font-size: 28rpx;
    color: #999;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    box-sizing: border-box;
  }

  &:active { background-color: #f0f0f0; }
}

// 复刻半全场的selected-trigger样式（无!important，精准生效）
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

/* 弹窗样式：保持不变 */
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
  max-height: 75vh;
  background: #fff;
  border-radius: 12rpx;
  z-index: 9999999;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 0 14rpx;

  .popup-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
    padding: 12rpx 0;
    border-bottom: 1rpx solid #eee;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;

    .vs-text { font-size: 24rpx; font-weight: 500; color: #666; }
  }

  .popup-loading {
    padding: 40rpx 0;
    text-align: center;
    font-size: 26rpx;
    color: #999;
  }
}

.score-section {
  display: flex;
  align-items: stretch;
  gap: 0;
  padding: 0;
  border-bottom: 1rpx solid #f5f5f5;
  margin-bottom: 14rpx;
}

.section-label {
  flex: 0 0 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx 4rpx;
  border-radius: 4rpx 0 0 4rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 500;
  color: #fff;
  writing-mode: vertical-rl;
  letter-spacing: 2rpx;
  box-sizing: border-box;
}

.main-win { background: #6FBDBD; }
.draw { background: #6AB284; }
.away-win { background: #6FBDBD; }

.score-options {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0;
}

.score-option {
  width: 20%;
  box-sizing: border-box;
  padding: 12rpx 0;
  background: #f9f9f9;
  border: 1rpx solid #eee;
  text-align: center;
  cursor: pointer;
  color: #999;
  transition: all 0.2s ease;

  .score-text { font-size: 22rpx; display: block; }
  .score-odds { font-size: 18rpx; }

  &.selected { background: #d92929; color: #fff !important; }
  &:active { background: #f0f0f0; }
  &.selected:active { background: #c62828; }
}

.popup-btn-bar {
  display: flex;
  gap: 16rpx;
  padding: 12rpx 16rpx 24rpx;
  box-sizing: border-box;

  .cancel-btn, .confirm-btn {
    flex: 1;
    height: 70rpx;
    border-radius: 8rpx;
    font-size: 28rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
    border: none;
  }

  .cancel-btn {
    background: #fff;
    color: #666;
    border: 1rpx solid #ddd;
  }

  .confirm-btn {
    background: #d92929;
    color: #fff;
    border: none;
    &:active { background: #c62828; }
  }
}

/* 兼容优化：和半全场一致 */
::-webkit-scrollbar { display: none; }
/* #ifdef APP-PLUS */
.score-popup {
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom)); 
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); 
}
/* #endif */
button::after { border: none; }
</style>