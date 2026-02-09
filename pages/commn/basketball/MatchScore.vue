<template>
  <!-- 胜分差页面：修复标签未闭合问题 + 统一布局样式 -->
  <!-- 仅改：paddingTop 从 px 计算改为 rpx 计算（paddingTopVal） -->
  <view class="match-list" :style="{ paddingTop: paddingTopVal + 'rpx' }">
    <!-- 抽屉循环容器 -->
    <view v-for="(drawer, drawerIdx) in finalDrawerList" :key="drawerIdx" class="drawer-wrapper">
      <view class="date-title sticky-header" :style="{ top: stickyHeaderTop + 'rpx' }" @click="toggleDrawer(drawerIdx)" hover-class="none">
        <text class="drawer-title-text">{{ drawer.title }}</text>
        <view class="arrow-icon" :class="{ rotated: expandedDrawers[drawerIdx] }">↓</view>
      </view>

      <!-- 抽屉内容：比分列表（布局重构） -->
      <view class="drawer-content" v-show="expandedDrawers[drawerIdx]">
        <!-- 移除行内background样式，统一到样式文件 -->
        <view v-for="(item, index) in drawer.lotteryList" :key="index" class="match-row">
          <!-- ========== 状态行：和其他组件完全统一 ========== -->
          <view class="match-status-row">
            <view class="status-left">
              <!-- 单场标签：样式统一 -->
              <!-- 单场标签：无停时，根据is_sf_single显示 -->
              <text class="single-tag" v-if="item.is_sfc_single == 1 && item.is_stop == 0">单场</text>
              <text class="single-tag" style="background: #dedede" v-if="item.is_stop == 1">停售</text>
            </view>
            <view class="status-right">
              <!-- 分析按钮：样式统一 -->
              <!-- 仅改：@tap.stop 改为 @click.stop -->
              <view class="ai-analysis-btn" v-if="item.home_win_rate && item.visiting_win_rate" @click.stop="() => goToAiAnalysis(item)">分析</view>
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

            <!-- 右侧：自适应宽度，垂直排列队名VS+胜率+比分选择区 -->
            <view class="main-right">
              <view class="top-right">
                <!-- 队名VS：样式统一 -->
                <view class="team-vs">
                  <text class="team-name away">{{ item.visiting_name }}</text>
                  <text class="vs-text">VS</text>
                  <text class="team-name home">{{ item.home_name }}</text>
                </view>

                <!-- 胜率行：补充vs-text，样式统一 -->
                <view class="rate-row">
                  <text class="rate-text away" v-if="item.visiting_win_rate">胜率{{ item.visiting_win_rate || "" }}</text>
                  <text class="vs-text" v-if="item.draw_rate">平率{{ item.draw_rate }}</text>
                  <text class="rate-text home" v-if="item.home_win_rate">胜率{{ item.home_win_rate || "" }}</text>
                </view>
              </view>

              <!-- 比分选择区：样式统一 -->
              <view class="bottom-right" :class="{ 'stop-bg': item.is_stop == 1 }">
                <view class="score-trigger-area odds-trigger-area" @click="item.is_stop != 1 && openScorePopup(item)" :class="{ 'selected-trigger': item.selectedScores && item.selectedScores.length > 0, 'disabled-trigger': item.is_stop == 1 }" hover-class="none">
                  <text v-if="item.selectedScores && item.selectedScores.length > 0" class="selected-text">
                    {{ item.selectedScores.join(",") }}
                  </text>
                  <text v-else class="trigger-tip">请选择投注内容</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 弹框：样式保留，仅微调适配 -->
    <view class="score-popup-mask" v-show="isPopupShow" @click="closePopup" hover-class="none"></view>
    <view class="score-popup" v-show="isPopupShow">
      <!-- 加载状态 -->
      <view v-if="isLoading" class="popup-loading">
        <text>加载赔率中...</text>
      </view>
      <view v-else>
        <!-- 标题：客队(客) VS 主队(主)（匹配home_name/visiting_name） -->
        <view class="popup-title"> {{ currentMatch ? currentMatch.visiting_name + "(客)" : "" }} VS {{ currentMatch ? currentMatch.home_name + "(主)" : "" }} </view>

        <!-- 1. 客胜区域（胜分差） -->
        <view class="score-section">
          <view class="section-title">
            {{ currentMatch ? currentMatch.visiting_name + "(客) | 客胜" : "" }}
          </view>
          <view class="score-options">
            <view v-for="(item, idx) in awayWinScores" :key="idx" class="score-option" :class="{ selected: selectedScores.indexOf(item.value) > -1 }" @click="toggleScore(item.value)" hover-class="none">
              <text class="score-text">{{ item.label }}</text>
              <text class="score-odds">{{ item.odds }}</text>
            </view>
          </view>
        </view>

        <!-- 2. 主胜区域（胜分差） -->
        <view class="score-section">
          <view class="section-title">
            {{ currentMatch ? currentMatch.home_name + "(主) | 主胜" : "" }}
          </view>
          <view class="score-options">
            <view v-for="(item, idx) in mainWinScores" :key="idx" class="score-option" :class="{ selected: selectedScores.indexOf(item.value) > -1 }" @click="toggleScore(item.value)" hover-class="none">
              <text class="score-text">{{ item.label }}</text>
              <text class="score-odds">{{ item.odds }}</text>
            </view>
          </view>
        </view>

        <!-- 底部按钮栏 -->
        <view class="popup-btn-bar">
          <button class="cancel-btn" @click="closePopup" hover-class="none">取消</button>
          <button class="confirm-btn" @click="confirmSelection" hover-class="none">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { queryHomeAndVisitingGoalOdds } from "@/api/demo";
export default {
  props: {
    matchList: {
      type: Array,
      default: () => [],
    },
    statusBarHeight: {
      type: Number,
      default: 0,
    },
    goToAiAnalysis: {
      type: Function,
      required: true,
    },
    drawerList: { type: Array, default: () => [] },
  },
  data() {
    return {
      isPopupShow: false,
      currentMatch: null,
      selectedScores: [],
      MAX_SELECT_COUNT: 10,
      isLoading: false,
      // 主胜胜分差选项（匹配后端h_sfc开头字段）
      mainWinScores: [
        { label: "1-5", value: "主胜1-5", odds: "" },
        { label: "6-10", value: "主胜6-10", odds: "" },
        { label: "11-15", value: "主胜11-15", odds: "" },
        { label: "16-20", value: "主胜16-20", odds: "" },
        { label: "21-25", value: "主胜21-25", odds: "" },
        { label: "26+", value: "主胜26+", odds: "" },
      ],
      drawScores: [], // 无平比分区域
      // 客胜胜分差选项（匹配后端v_sfc开头字段）
      awayWinScores: [
        { label: "1-5", value: "客胜1-5", odds: "" },
        { label: "6-10", value: "客胜6-10", odds: "" },
        { label: "11-15", value: "客胜11-15", odds: "" },
        { label: "16-20", value: "客胜16-20", odds: "" },
        { label: "21-25", value: "客胜21-25", odds: "" },
        { label: "26+", value: "客胜26+", odds: "" },
      ],
      expandedDrawers: [],
      // 缓存转换后的状态栏高度（px转rpx，适配多端）
      statusBarHeightRpx: 0,
      windowWidth: 0,
    };
  },
  computed: {
    finalDrawerList() {
      if (this.drawerList.length > 0) {
        return this.drawerList;
      }
      return this.matchList.length > 0 ? [{ title: `周四 2025-12-04 共${this.matchList.length}场比赛`, lotteryList: this.matchList }] : [];
    },
    selectedMatchCount() {
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
    finalDrawerList(newVal) {
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
    async openScorePopup(match) {
      // 最多8场校验
      const isCurrentMatchUnselected = !match.selectedScores || match.selectedScores.length === 0;
      if (isCurrentMatchUnselected && this.selectedMatchCount >= 8) {
        uni.showToast({
          title: "最多只能选择8场比赛",
          icon: "none",
          duration: 2000,
        });
        return;
      }

      this.isLoading = true;
      this.selectedScores = Array.isArray(match.selectedScores) ? [...match.selectedScores] : [];
      this.currentMatch = match;
      this.isPopupShow = true;

      try {
        const res = await queryHomeAndVisitingGoalOdds({
          serialNumber: match.serial_number,
          dateStr: match.date_str,
        });

        if (res.code === "200" && res.data) {
          // 直接使用当前赛事的赔率数据（无需额外接口，drawerList已包含h_sfc/v_sfc字段）
          const oddsData = match;

          // 映射主胜胜分差赔率（h_sfc开头字段）
          this.mainWinScores = this.mainWinScores.map((item) => {
            let odds = "";
            switch (item.value) {
              case "主胜1-5":
                odds = oddsData.h_sfc1_5 || "";
                break;
              case "主胜6-10":
                odds = oddsData.h_sfc6_10 || "";
                break;
              case "主胜11-15":
                odds = oddsData.h_sfc11_15 || "";
                break;
              case "主胜16-20":
                odds = oddsData.h_sfc16_20 || "";
                break;
              case "主胜21-25":
                odds = oddsData.h_sfc21_25 || "";
                break;
              case "主胜26+":
                odds = oddsData.h_sfc26_jia || "";
                break;
              default:
                odds = "";
            }
            return { ...item, odds: odds.toString() };
          });

          // 映射客胜胜分差赔率（v_sfc开头字段）
          this.awayWinScores = this.awayWinScores.map((item) => {
            let odds = "";
            switch (item.value) {
              case "客胜1-5":
                odds = oddsData.v_sfc1_5 || "";
                break;
              case "客胜6-10":
                odds = oddsData.v_sfc6_10 || "";
                break;
              case "客胜11-15":
                odds = oddsData.v_sfc11_15 || "";
                break;
              case "客胜16-20":
                odds = oddsData.v_sfc16_20 || "";
                break;
              case "客胜21-25":
                odds = oddsData.v_sfc21_25 || "";
                break;
              case "客胜26+":
                odds = oddsData.v_sfc26_jia || "";
                break;
              default:
                odds = "";
            }
            return { ...item, odds: odds.toString() };
          });
        }
      } catch (err) {
        console.error("获取赔率失败:", err);
        uni.showToast({ title: "赔率加载失败，使用默认值", icon: "none" });
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
    // ========== 核心修改：仅调整这个方法 ==========
    confirmSelection() {
      if (!this.currentMatch || this.isLoading) return;

      // 只传递关键参数给父组件，由父组件修改数据源
      this.$emit("toggle-score-select", {
        serialNumber: this.currentMatch.serial_number, // 赛事唯一标识
        selectedScores: [...this.selectedScores], // 选中的胜分差
      });

      // 关闭弹窗即可，无需在子组件修改数组
      this.closePopup();
    },
    // ============================================
    closePopup() {
      this.isPopupShow = false;
      this.selectedScores = [];
      this.currentMatch = null;
      this.isLoading = false;
    },
    handleAiAnalysis(item) {
      if (typeof this.goToAiAnalysis === "function") {
        this.goToAiAnalysis(item);
      }
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

  .drawer-title-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.arrow-icon {
  transition: transform 0.2s;
  font-size: 24rpx;
  color: #666;
}
.rotated {
  transform: rotate(180deg);
}
.drawer-content {
  width: 100%;
  transition: all 0.2s ease;
}

/* ========== 核心重构：比赛行样式（和其他组件完全统一） ========== */
.match-row {
  background-color: #f6f6f6; // 移入行内样式的背景色
  border-bottom: 1rpx solid #dedede;
  box-sizing: border-box;
  padding: 0rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 4rpx;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.05);
  width: 100%;
  overflow: hidden;
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

/* 核心：整体左右布局（和其他组件完全一致） */
.main-content-row {
  display: flex;
  width: 100%;
  gap: 16rpx;
  box-sizing: border-box;
  padding: 8rpx 0;
  overflow: hidden;
}

/* 左侧区域：固定宽度，垂直排列（统一为flex: none） */
.main-left {
  width: 160rpx;
  display: flex;
  flex-direction: column;
  flex: none; // 统一约束，禁止拉伸/收缩
  gap: 8rpx;
}

/* 右侧区域：自适应宽度，垂直排列（补充overflow+box-sizing） */
.main-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  background: #fff;
  box-sizing: border-box; // 新增：盒模型约束
  overflow: hidden; // 新增：第二层溢出约束
}

/* 左侧子元素：补充省略号属性 */
.top-left {
  margin-top: 8rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%; // 新增：父容器锁宽
}

.league-name {
  font-size: 22rpx;
  color: #777;
  white-space: nowrap; // 新增：禁止换行
  overflow: hidden; // 新增：溢出隐藏
  text-overflow: ellipsis; // 新增：显示省略号
}

.bottom-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 2rpx;
  width: 100%; // 新增：父容器锁宽
}

.serial-number,
.match-time {
  width: 100%;
  font-size: 20rpx;
  color: #999;
  text-align: center;
}

.serial-number {
  margin-bottom: 10rpx;
}

/* 右侧子元素：补充溢出约束 */
.top-right {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden; // 新增：第三层溢出约束
}

/* 队名VS：样式统一，补充省略号 */
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
  }
  .team-name.away {
    text-align: right;
    padding-right: 10rpx;
  }
  .team-name.home {
    text-align: left;
    padding-left: 10rpx;
  }
  .vs-text {
    width: 40rpx;
    text-align: center;
    flex-shrink: 0;
    font-weight: 500;
  }
}

/* 胜率行：样式统一，补充vs-text样式 */
.rate-row {
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 22rpx;
  color: #999;
  justify-content: center;
  gap: 0; // 移除gap，避免排版混乱

  .rate-text {
    flex: 1;
    text-align: center;
    white-space: nowrap; // 新增：禁止换行
    overflow: hidden; // 新增：溢出隐藏
    text-overflow: ellipsis; // 新增：显示省略号
  }
  .rate-text.away {
    text-align: right;
    padding-right: 10rpx;
  }
  .rate-text.home {
    text-align: left;
    padding-left: 10rpx;
  }
  .vs-text {
    width: 140rpx; // 缩小宽度，避免占比过大
    text-align: center;
    flex-shrink: 0;
    color: #999;
    font-size: 20rpx;
  }
}

/* 比分选择区：样式统一 */
.bottom-right {
  width: 100%;
  box-sizing: border-box;
  overflow: hidden; // 第四层溢出约束
}

/* ========== 核心：复刻半全场的触发区样式 ========== */
.odds-trigger-area {
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
  overflow: hidden; // 最后一层溢出约束

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

  &:active {
    background-color: #f0f0f0;
  }
}

// 复刻半全场的selected-trigger样式
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

/* 弹框核心样式：修复溢出问题 */
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
  width: 85%; // 调整为85%，避免过宽
  max-height: 75vh; // 调整为75vh，避免内容溢出
  background: #fff;
  border-radius: 12rpx;
  z-index: 9999999;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 20rpx;
}

.popup-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  text-align: center;
  padding: 8rpx 0;
  border-bottom: 1rpx solid #eee;
  margin-bottom: 16rpx;
  white-space: nowrap; // 新增：标题禁止换行
  overflow: hidden; // 新增：标题溢出隐藏
  text-overflow: ellipsis; // 新增：标题显示省略号
}

.popup-loading {
  padding: 40rpx 0;
  text-align: center;
  font-size: 26rpx;
  color: #999;
}

/* 比分区域 */
.score-section {
  margin-bottom: 20rpx;
  width: 100%; // 新增：锁宽
  box-sizing: border-box; // 新增：盒模型
}

.section-title {
  font-size: 24rpx;
  color: #333;
  padding: 8rpx 12rpx;
  background-color: #f5f5f5;
  border-radius: 6rpx;
  margin-bottom: 10rpx;
  white-space: nowrap; // 新增：禁止换行
  overflow: hidden; // 新增：溢出隐藏
  text-overflow: ellipsis; // 新增：显示省略号
}

/* 选项一排三个：修复宽度计算溢出 */
.score-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6rpx; // 调整gap，避免挤兑
  width: 100%; // 新增：锁宽
  box-sizing: border-box; // 新增：盒模型
}

.score-option {
  width: calc(33.333% - 4rpx); // 精准计算，避免溢出
  box-sizing: border-box;
  padding: 20rpx 0;
  background-color: #f0f0f0;
  text-align: center;
  cursor: pointer;
  border-radius: 6rpx;

  &.selected {
    background-color: #d92929;
    border-color: #d92929;
  }
  &.selected .score-text,
  &.selected .score-odds {
    color: #fff !important;
  }
  &:active {
    background: #e8e8e8;
  }
  &.selected:active {
    background: #c62828;
  }
}

.score-text {
  font-size: 24rpx;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
  white-space: nowrap; // 新增：禁止换行
  overflow: hidden; // 新增：溢出隐藏
  text-overflow: ellipsis; // 新增：显示省略号
}

.score-odds {
  font-size: 20rpx;
  color: #666;
  white-space: nowrap; // 新增：禁止换行
  overflow: hidden; // 新增：溢出隐藏
  text-overflow: ellipsis; // 新增：显示省略号
}

/* 底部按钮栏 */
.popup-btn-bar {
  display: flex;
  gap: 8rpx;
  margin-top: 10rpx;
  padding: 8rpx 0 0;
  width: 100%; // 新增：锁宽
  box-sizing: border-box; // 新增：盒模型
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  height: 76rpx;
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
  background-color: #f0f0f0;
  color: #333;
}

.confirm-btn {
  background-color: #d92929;
  color: #fff;
  &:active {
    background: #c62828;
  }
}

/* 兼容优化 */
::-webkit-scrollbar {
  display: none;
}

/* #ifdef APP-PLUS */
.score-popup {
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}
/* #endif */

button::after {
  border: none;
}

// 新增停售相关样式
.stop-bg {
  background-color: #dedede;
}
.disabled-trigger {
  pointer-events: none;
  opacity: 0.8;
  background-color: #f5f5f5 !important;
}
.disabled-trigger .trigger-tip {
  color: #666 !important;
}
</style>
