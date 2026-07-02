<template>
  <!-- 模板部分完全不变，仅保留原有结构 -->
  <view style="width: 100%; height: 100vh; box-sizing: border-box">
<CustomHeader :title="currentPlay" :showBack="true" />
   <scroll-view class="tab-bar-sticky" scroll-x show-scrollbar="false"  :style="{top: statusBarHeight + 126 + 'rpx'}"  scroll-with-animation>
      <view v-for="(item, index) in typesList" :key="index" :id="`tab-${index}`" class="tab-item" :class="{ active: activeTab === index }" @tap="switchTab(index,item)">
        {{ item || "0" }}
      </view>
    </scroll-view>

    <scroll-view class="match-scroll" scroll-y>
      <!-- 原有玩法组件 -->
      <MatchSpf ref="spfRef" v-if="currentPlay === '胜平负'" :drawer-list="drawerList" :status-bar-height="statusBarHeight + 40" :header-height="headerHeight || statusBarHeight + 88" @toggle-select="toggleSelect" :my-value="myValue" />
      <MatchHandicap ref="handicapRef" v-else-if="currentPlay === '让胜平负'" :drawer-list="drawerList" :status-bar-height="statusBarHeight + 40" @toggle-select="toggleSelect" :my-value="myValue" />
      <MatchTotalGoals ref="goalsRef" v-else-if="currentPlay === '总进球'" :drawer-list="drawerList" :status-bar-height="statusBarHeight + 40" @toggle-goal-select="toggleGoalSelect" :my-value="myValue" />
      <MatchHalfFull ref="halfFullRef" v-else-if="currentPlay === '半全场'" :drawer-list="drawerList" :status-bar-height="statusBarHeight + 40" @on-half-full-selected="handleHalfFullSelected" :my-value="myValue" />
      <MatchScore ref="scoreRef" v-else-if="currentPlay === '比分'" :drawer-list="drawerList" :status-bar-height="statusBarHeight + 40" :toggle-score-select="toggleScoreSelect" @on-score-selected="handleScoreSelected" :my-value="myValue" />

      <!-- 新增：混合过关列表组件 -->
      <MixedPassList ref="mixedPassRef" v-else-if="currentPlay === '混合过关'" :drawer-list="drawerList" :status-bar-height="statusBarHeight + 40" :header-height="headerHeight" @toggle-mixed-select="handleMixedSelect" @update-selected-count="updateMixedSelectedCount" @confirm-mixed-select="handleConfirmMixedSelect" :my-value="myValue" />
    </scroll-view>

    <view class="bet-bar" v-if="urlValue">
      <view class="bet-bar-inner">
        <view class="left-section">
          <image class="clear-icon" src="https://www.tianjifu.com/static/trash.png" mode="widthFix" @click="clearAllSelection" :class="{ disabled: selectedMatchCount === 0 }"></image>
          <view class="text-group">
            <text class="selected-text">已选{{ selectedMatchCount }}场</text>
            <text class="risk-tip">数据仅供参考</text>
          </view>
        </view>
        <button class="confirm-btn" @click="goToSchemeEdit" :disabled="selectedMatchCount === 0">预览</button>
      </view>
    </view>
    <view class="type-popup" :class="{ show: isPopupShowType }">
      <view class="popup-mask" @tap="closePopupType"></view>
      <view class="popup-box" :style="{ top: headerHeight + 'px' }">
        <view class="filter-section">
          <view class="options-container">
            <view v-for="typeText in typesList" :key="typeText" class="option-item" :class="{ active: selectedType.includes(typeText) }" @click="toggleType(typeText)">
              {{ typeText }}
              <view class="check-mark" v-if="selectedType.includes(typeText)">
                <image class="check-icon" src="https://www.tianjifu.com/static/check.png" mode="widthFix"></image>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <TipsPopup :visible.sync="isPopupShow" :title="tipsTitle" :content-list="tipsContentList" :header-height="headerHeight" :popup-width="700" border-color="#07c160" @close="handlePopupClose" :max-height="popupMaxHeight" />
    <!-- 全局数字软键盘组件（新增） -->
    <UniNumberKeyboard :show.sync="showNumberKeyboard" :value="betCount + ''" :allowDot="false" confirm-text="确认" :min="1" :max="50" @input="handleKeyboardInput" @confirm="handleKeyboardConfirm" />
    <EmptyStop :hasData="hasData" />
    <SystemMsgModal/>
  </view>
</template>

<script>
import NativeTabbar from "@/components/tabbar.vue";
import MatchSpf from "@/pages/commn/index/MatchSpf.vue";
import MatchHandicap from "@/pages/commn/index/MatchHandicap.vue";
import MatchScore from "@/pages/commn/index/MatchScore.vue";
import MatchTotalGoals from "@/pages/commn/index/MatchTotalGoals.vue";
import MatchHalfFull from "@/pages/commn/index/MatchHalfFull.vue";
import CustomHeader from "@/components/CustomHeader.vue";
// 新增：引入混合过关列表组件
import MixedPassList from "@/pages/commn/index/MixedPassList.vue";
import { queryFootBallLLottery, checkCode, wxLogin, checkSelect, recharge } from "@/api/demo";
import { formatTimeToMDWeekHM } from "@/utils/data";
import TipsPopup from "@/pages/commn/playTip";
import { validateBetInput } from "@/utils/validate";
import EmptyStop from "@/pages/commn/emptyStop.vue";

import SystemMsgModal from "@/components/SystemMsgModal.vue";

export default {
    // 局部引入Mixin
  components: {
    NativeTabbar,
    MatchSpf,
    MatchHandicap,
    MatchScore,
    MatchTotalGoals,
    MatchHalfFull,
    CustomHeader,
    TipsPopup,
    EmptyStop,
    // 注册混合过关组件
    MixedPassList,
    SystemMsgModal
  },
  data() {
    return {
      activeTab: 1,
      // 新增：玩法列表添加混合过关
      typesList: ["混合过关", "胜平负", "让胜平负", "总进球", "半全场", "比分"],
      selectedType: ["混合过关"],
      currentPlay: "混合过关",
      showModal: false,
      hasToken: false,
      isPopupShowType: false,
      isPopupShow: false,
      drawerList: [],
      // 移除：不再需要独立的mixedPassMatchList
      // 新增：混合过关选中场次计数
      mixedSelectedCount: 0,
      isLoading: false,
      selectedTime: "",
      headerHeight: 0,
      betCount: 50,
      selectedWays: [],
      statusBarHeight: 0,
      playTypeMap: {
        胜平负: "spf",
        让胜平负: "rspf",
        比分: "bf",
        总进球: "zjq",
        半全场: "bqc",
        // 新增：混合过关映射
        混合过关: "hhgg",
      },
      isRefreshing: false,
      keyboardHeight: 0,
      isKeyboardShow: false,
      tipsTitle: "重要提示",
      tipsContentList: [
      ],
      windowHeight: 0,
      bottomBtnBarHeight: 0,
      tabbarHeight: 0,
      popupMaxHeight: 0,
      collapseStatus: true, // 默认为收起状态
      selectedCombo: "", // 修正：改为字符串（单选）
      comboList: [], // 串关选项列表
      showNumberKeyboard: false, // 控制自定义软键盘显隐
      touchStartX: 0, // 新增：触摸起始X坐标
      swipeThreshold: 50, // 新增：滑动判定阈值（px）
      hasData: false,
      urlValue: false,
    };
  },
  async onPullDownRefresh() {
    try {
      this.isRefreshing = true;
      this.betCount = 1;
      await this.loadMatchData();
    } catch (err) {
      console.error("下拉刷新失败：", err);
      uni.showToast({ title: "刷新失败", icon: "none" });
    } finally {
      this.isRefreshing = false;
      uni.stopPullDownRefresh();
    }
  },
  computed: {
    targetLotteryType() {
      return this.playTypeMap[this.currentPlay] || "hhgg";
    },
    // 完整的选中场次计数逻辑（仅修复计算错误，不改动串关规则）
selectedMatchCount() {
  if (this.currentPlay === "混合过关") {
    return this.mixedSelectedCount;
  }
  // 其他玩法原有逻辑不动，加个日志
  let count = 0;
  this.drawerList.forEach((drawer) => {
    drawer.lotteryList.forEach((item) => {
      switch (this.currentPlay) {
        case "胜平负":
          if (item.homeSelected || item.vsSelected || item.awaySelected) count++;
          break;
        case "让胜平负":
          if (item.handicapHomeSelected || item.handicapVsSelected || item.handicapAwaySelected) count++;
          break;
        case "比分":
          if (Array.isArray(item.selectedScores) && item.selectedScores.length > 0) count++;
          break;
        case "总进球":
          if (Array.isArray(item.selectedGoals) && item.selectedGoals.length > 0) count++;
          break;
        case "半全场":
          if (Array.isArray(item.selectedScores) && item.selectedScores.length > 0) count++;
          break;
        default:
          break;
      }
    });
  });
  return count;
},
    // 完整的单场判断逻辑（完全保留原有串关规则）
    hasSingleMatch() {
      // 混合过关单独处理（完全保留原有逻辑，不改动）
      if (this.currentPlay === "混合过关") {
        // 混合过关单独处理
        if (this.currentPlay === "混合过关") {
          return this.drawerList.some((drawer) => drawer.lotteryList.some((match) => match.is_stop === false && match.betRows.some((row) => row.items.some((item) => item.isSelected))));
        }
      }

      // 原有逻辑（完全保留）
      const selectedMatches = this.getSelectedMatches();
      return selectedMatches.some((item) => {
        switch (this.currentPlay) {
          case "胜平负":
            return item.is_spf_single == 1;
          case "让胜平负":
            return item.is_rspf_single == 1;
          case "比分":
            return item.is_bf_single == 1;
          case "总进球":
            return item.is_zjq_single == 1;
          case "半全场":
            return item.is_bqc_single == 1;
          default:
            return false;
        }
      });
    },
  },
  watch: {
    // 监听玩法切换
    currentPlay(newVal) {
      // 所有玩法都使用同一个加载方法
      this.loadMatchData();
    },
  },
  onLoad() {
        // #ifdef APP-PLUS
    this.checkLocalToken();
    // #endif
    const editedData = uni.getStorageSync("editedMatchData");
    if (editedData) {
      let parsedData = editedData;
      if (typeof editedData === "string") {
        parsedData = JSON.parse(editedData);
      }
      this.syncUpdatedMatches(parsedData);
      uni.removeStorageSync("editedMatchData");
    } else {
        try {
          this.loadMatchData();
        } catch (error) {
          try {
            this.loadMatchData();
          } catch (retryError) {
          }
        }
    }
        this.$nextTick(()=>{
    this.urlValue = uni.getStorageSync('urlValue');
    
    })
    if (uni.getWindowInfo) {
      const windowInfo = uni.getWindowInfo();
      this.statusBarHeight = windowInfo.statusBarHeight;
    } else {
      const systemInfo = wx.getWindowInfo();
      this.statusBarHeight = systemInfo.statusBarHeight;
    }
  },
  created() {
    const editedData = uni.getStorageSync("editedMatchData");
    if (editedData) {
      let parsedData = editedData;
      if (typeof editedData === "string") {
        parsedData = JSON.parse(editedData);
      }
      this.syncUpdatedMatches(parsedData);
      uni.removeStorageSync("editedMatchData");
    } else {
        try {
          this.loadMatchData();
        } catch (error) {
          try {
            this.loadMatchData();
          } catch (retryError) {
          }
        }
    }
        this.$nextTick(()=>{
    this.urlValue = uni.getStorageSync('urlValue');
    
    })
  },
  mounted() {
    this.calcHeaderHeight();
    this.calcPopupMaxHeight();
  },
  methods: {
    switchTab(index,item) {
      this.currentPlay = item;
      this.activeTab = index;
    },
handleConfirmMixedSelect(confirmData) {
  // 就这么简单！你原来怎么写就怎么用，我只修复报错！
  if (!confirmData || !confirmData.finalDrawerList) {
    console.warn("混合过关确认数据为空", confirmData);
    return;
  }
  this.drawerList = confirmData.finalDrawerList;
  this.$nextTick(() => {
    this.updateMixedSelectedCount();
  });
},

updateMixedSelectedCount() {
  let count = 0;
  if (this.currentPlay !== "混合过关") {
    this.mixedSelectedCount = 0;
    return;
  }

  this.drawerList.forEach((drawer) => {
    if (!Array.isArray(drawer.lotteryList)) return;
    drawer.lotteryList.forEach((match) => {
      if (match.is_stop || !match.id) return;
      // 兜底：没有数组则置为空数组，避免报错
      const spf = Array.isArray(match.selectedSpf) ? match.selectedSpf : [];
      const bifen = Array.isArray(match.selectedBifen) ? match.selectedBifen : [];
      const zjq = Array.isArray(match.selectedZjq) ? match.selectedZjq : [];
      const bqc = Array.isArray(match.selectedBqc) ? match.selectedBqc : [];
      // 判定是否有选中项
      const hasSelect = spf.length > 0 || bifen.length > 0 || zjq.length > 0 || bqc.length > 0;

      if (hasSelect) count++;
    });
  });

  this.mixedSelectedCount = count;
},
clearAllSelection() {
  if (this.selectedMatchCount === 0) return;

  uni.showModal({
    title: "提示",
    content: "确定清空所有已选场次吗？",
    success: (res) => {
      if (res.confirm) {
        this.drawerList.forEach((drawer, drawerIdx) => {
          drawer.lotteryList.forEach((match, matchIdx) => {
            
            // ======================================
            // 混合过关：清空 4 个选中数组（核心修复）
            // ======================================
            if (this.currentPlay === "混合过关") {
              this.$set(match, "selectedSpf", []);
              this.$set(match, "selectedBifen", []);
              this.$set(match, "selectedZjq", []);
              this.$set(match, "selectedBqc", []);
              return;
            }

            // 其他玩法不动（原来逻辑）
            this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "homeSelected", false);
            this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "vsSelected", false);
            this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "awaySelected", false);
            this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "handicapHomeSelected", false);
            this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "handicapVsSelected", false);
            this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "handicapAwaySelected", false);
            this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "selectedScores", []);
            this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "selectedGoals", []);
            
          });
        });

        // 强制刷新混合过关计数
        this.updateMixedSelectedCount();

        uni.showToast({ title: "已清空", icon: "success" });
      }
    },
  });
},
    getIsPreviewEnabled() {
      if (this.currentPlay === "混合过关") {
        // 混合过关：仅判断选中场次≥1（保留原有串关规则，不改动单场/几串1）
        return this.selectedMatchCount >= 1;
      }
      // 原有逻辑（完全保留）
      return !!this.selectedCombo && this.selectedMatchCount >= 1;
    },
handleMixedSelect(item, selectType) {
  // 基础容错（严格校验）
  if (!item || !selectType || !item.id || this.currentPlay !== "混合过关") {
    return;
  }

  // 1. 找到对应场次（双层循环，100%找到）
  let targetMatch = null;
  this.drawerList.some(drawer => {
    return (drawer.lotteryList || []).some(match => {
      if (match.id === item.id) {
        targetMatch = match;
        return true;
      }
      return false;
    });
  });
  if (!targetMatch) {    return;
  }

  // 2. 匹配选中数组（兼容home_0/draw_0/away_0等格式）
  let targetArrKey = "selectedSpf"; // 默认胜平负/让球（home_0/draw_0/away_0都归这）
  if (selectType.includes(":") || selectType.startsWith("比分_")) {
    targetArrKey = "selectedBifen";
  } else if (!isNaN(Number(selectType)) || selectType.startsWith("总进球_")) {
    targetArrKey = "selectedZjq";
  } else if ((selectType.length === 2 && !isNaN(Number(selectType))) || selectType.startsWith("半全场_")) {
    targetArrKey = "selectedBqc";
  }

  // 3. 初始化数组（强制$set，确保响应式，uniapp深层对象必加）
  if (!targetMatch[targetArrKey] || !Array.isArray(targetMatch[targetArrKey])) {
    this.$set(targetMatch, targetArrKey, []);
  }

  // 4. 选中/取消核心逻辑（✅ 直接用原始数组，无深拷贝，第一次点击必是false）
  const originalArr = targetMatch[targetArrKey];
  const isSelected = originalArr.includes(selectType);

  if (!isSelected) {
    // 选中：push后无需$set（数组是响应式的，push会触发更新）
    originalArr.push(selectType);
  } else {
    // 取消：必须$set替换整个数组（过滤后数组地址变了，需$set）
    const newArr = originalArr.filter(v => v !== selectType);
    this.$set(targetMatch, targetArrKey, newArr);
  }

  // 5. 强制更新计数+视图（nextTick确保DOM更新后统计）
  this.$nextTick(() => {
    this.updateMixedSelectedCount();
  });
},
    // 混合过关新增：清空指定场次选中状态（供编辑页返回调用）
    clearMixedMatchSelection(matchId) {
      this.drawerList.forEach((drawer) => {
        const matchIdx = drawer.lotteryList.findIndex((m) => m.id === matchId);
        if (matchIdx !== -1) {
          const targetMatch = drawer.lotteryList[matchIdx];
          if (targetMatch.betRows) {
            targetMatch.betRows.forEach((row, rIdx) => {
              row.items.forEach((item, iIdx) => {
                this.$set(targetMatch.betRows[rIdx].items[iIdx], "isSelected", false);
              });
            });
          }
        }
      });
      this.updateMixedSelectedCount();
    },
    handleKeyboardInput(val) {
      const num = parseInt(val) || 1;
      if (num < 1) {
        this.betCount = 1;
      } else {
        this.betCount = num;
      }
    },
    handleKeyboardConfirm(val) {
      const num = parseInt(val) || 1;
      this.betCount = num
      this.showNumberKeyboard = false;
    },
    handleBetInput(e) {
      const inputVal = e.detail.value;
      const validVal = validateBetInput(inputVal);
      this.betCount = null;
      this.$nextTick(() => {
        this.betCount = validVal;
      });
    },
    handlePopupClose() {},
    calcPopupMaxHeight() {
      const windowInfo = uni.getWindowInfo ? uni.getWindowInfo() : wx.getWindowInfo();
      const { windowHeight, windowWidth, safeAreaInsets, safeArea, statusBarHeight } = windowInfo;

      this.windowHeight = windowHeight;

      const pixelRatio = 3;
      this.bottomBtnBarHeight = ((90 / 750) * windowWidth) / pixelRatio;
      this.tabbarHeight = ((100 / 750) * windowWidth) / pixelRatio;

      this.popupMaxHeight = windowHeight - this.bottomBtnBarHeight - this.tabbarHeight - safeAreaInsets.bottom;

      // #ifdef MP-WEIXIN
      this.popupMaxHeight = Math.min(this.popupMaxHeight, safeArea.height - this.bottomBtnBarHeight - this.tabbarHeight);
      // #endif
    },
    handleHalfFullSelected(updatedDrawerList) {
      this.drawerList = updatedDrawerList;
    },
    handleScoreSelected(updatedDrawerList) {
      this.drawerList = updatedDrawerList;
    },
    togglePopup() {
      this.isPopupShowType = !this.isPopupShowType;
    },
    getSelectedMatches() {
      const selected = [];
      this.drawerList.forEach((drawer) => {
        drawer.lotteryList.forEach((item) => {
          let isSelected = false;
          switch (this.currentPlay) {
            case "胜平负":
              isSelected = item.homeSelected || item.vsSelected || item.awaySelected;
              break;
            case "让胜平负":
              isSelected = item.handicapHomeSelected || item.handicapVsSelected || item.handicapAwaySelected;
              break;
            case "比分":
              isSelected = Array.isArray(item.selectedScores) && item.selectedScores.length > 0;
              break;
            case "总进球":
              isSelected = Array.isArray(item.selectedGoals) && item.selectedGoals.length > 0;
              break;
            case "半全场":
              isSelected = Array.isArray(item.selectedScores) && item.selectedScores.length > 0;
              break;
            default:
              break;
          }
          if (isSelected) {
            selected.push(item);
          }
        });
      });
      return selected;
    },
    /**
/**
 * 跳转到方案编辑页
 * 修复点：混合过关场景下选中场次收集逻辑与计数逻辑不一致的问题
 */
async goToSchemeEdit() {
      try {
        // 基础校验：没选中场次不跳转，提示用户
        if (this.selectedMatchCount === 0) {
          uni.showToast({ title: "请先选择至少1场比赛", icon: "none" });
          return;
        }
        if (this.currentPlay != "混合过关") {
          if (!this.hasSingleMatch && this.selectedMatchCount < 2) {
            uni.showToast({ title: "非单场赛事至少选择2场比赛", icon: "none" });
            return;
          }
        }
        // 混合过关专属逻辑
        if (this.currentPlay === "混合过关") {
          // 关键修复1：遍历所有drawer，收集所有有选中项的场次（不再只取第一条）
          const selectedMatches = [];
          this.drawerList.forEach((drawer) => {
            // 容错：跳过非数组的lotteryList
            if (!Array.isArray(drawer.lotteryList)) {
              return;
            }

            drawer.lotteryList.forEach((match) => {
              // 关键修复2：解析逻辑和计数逻辑完全一致（避免计数显示2场，跳转只传1场）
              const hasSelected = (Array.isArray(match.selectedSpf) && match.selectedSpf.length > 0) || (Array.isArray(match.selectedRspf) && match.selectedRspf.length > 0) || (Array.isArray(match.selectedZjq) && match.selectedZjq.length > 0) || (Array.isArray(match.selectedBqc) && match.selectedBqc.length > 0) || (Array.isArray(match.selectedBifen) && match.selectedBifen.length > 0) || (Array.isArray(match.selectedAll) && match.selectedAll.length > 0);
              console.log(match, "match--------------");
              // 只收集有选中项的场次
              if (hasSelected) {
                // 整理场次数据（适配编辑页字段，保留所有原始数据）
                selectedMatches.push({
                  ...match,
                  id: match.id,
                  league_name: match.league_name,
                  serial_number: match.serial_number,
                  race_date: match.race_date,
                  home_name: match.home_name,
                  visiting_name: match.visiting_name,
                  is_stop: match.is_stop,
                  home_win_rate: match.home_win_rate,
                  draw_rate: match.draw_rate,
                  visiting_win_rate: match.visiting_win_rate,
                  is_hhgg_single: match.is_hhgg_single,

                  selectedSpf: match.selectedSpf || [],
                  selectedBifen: match.selectedBifen || [],
                  selectedZjq: match.selectedZjq || [],
                  selectedBqc: match.selectedBqc || [],

                  // 胜平负 / 让球
                  win_multiplier: match.win_multiplier,
                  draw_multiplier: match.draw_multiplier,
                  loss_multiplier: match.loss_multiplier,
                  r_win_multiplier: match.r_win_multiplier,
                  r_draw_multiplier: match.r_draw_multiplier,
                  r_loss_multiplier: match.r_loss_multiplier,

                  // 总进球
                  zjq_ling: match.zjq_ling,
                  zjq_yi: match.zjq_yi,
                  zjq_er: match.zjq_er,
                  zjq_san: match.zjq_san,
                  zjq_si: match.zjq_si,
                  zjq_wu: match.zjq_wu,
                  zjq_liu: match.zjq_liu,
                  zjq_qi_jia: match.zjq_qi_jia,

                  // 半全场
                  ss: match.ss,
                  sp: match.sp,
                  sf: match.sf,
                  ps: match.ps,
                  pp: match.pp,
                  pf: match.pf,
                  fs: match.fs,
                  fp: match.fp,
                  ff: match.ff,

                  // ====================
                  // ✅ 比分赔率（全部补齐）
                  // ====================
                  sbe: match.sbe || "",
                  sbl: match.sbl || "",
                  sbs: match.sbs || "",
                  ebe: match.ebe || "",
                  ebl: match.ebl || "",
                  ebs: match.ebs || "",
                  ybe: match.ybe || "",
                  ybl: match.ybl || "",
                  ybs: match.ybs || "",
                  lbl: match.lbl || "",
                  lbs: match.lbs || "",
                  lbe: match.lbe || "",
                  wbe: match.wbe || "",
                  wbl: match.wbl || "",
                  wby: match.wby || "",
                  ybw: match.ybw || "",
                  yby: match.yby || "",
                  ebw: match.ebw || "",
                  eby: match.eby || "",
                  lbw: match.lbw || "",
                  lby: match.lby || "",
                  lbsi: match.lbsi || "",
                  ybsi: match.ybsi || "",
                  ebsi: match.ebsi || "",
                  sibe: match.sibe || "",
                  sibl: match.sibl || "",
                  siby: match.siby || "",
                  sqt: match.sqt || "",
                  pqt: match.pqt || "",
                  fqt: match.fqt || "",
                });
              }
            });
          });
          const hasSingleMatch = selectedMatches.some((match) => match.is_hhgg_single);

          // 2. 非单场场景：需要至少选择2场
          if (!hasSingleMatch && selectedMatches.length < 2) {
            uni.showToast({ title: "非单场赛事至少选择2场比赛", icon: "none" });
            return;
          }
          // 跳转方案编辑页并传递选中数据
          await uni.navigateTo({
            url: `/pages/edit/football/editHhgg`,
            events: {
              // 可选：接收编辑页返回的回调数据（如果需要）
              editCallback: (data) => {},
            },
            success: (res) => {
              // 向编辑页传递选中数据
              res.eventChannel.emit("selectedData", {
                matches: selectedMatches,
                betCount: 50,
                // isNeedUserPhone: 1,
                combo: `${selectedMatches.length}串1`,
              });
            },
          });
          return;
        }
        const selectedMatches = this.getSelectedMatches();
        // 组装其他玩法的场次数据（原有逻辑，无需修改）
const formattedMatches = selectedMatches.map((item) => ({
  ...item,
  id: item.id,
  league_name: item.league_name,
  serial_number: item.serial_number,
  race_date: item.race_date,
  home_name: item.home_name,
  visiting_name: item.visiting_name,
  is_stop: item.is_stop,
  homeSelected: item.homeSelected,
  vsSelected: item.vsSelected,
  awaySelected: item.awaySelected,
  handicapHomeSelected: item.handicapHomeSelected,
  handicapVsSelected: item.handicapVsSelected,
  handicapAwaySelected: item.handicapAwaySelected,
  selectedScores: item.selectedScores,
  selectedGoals: item.selectedGoals,
  win_multiplier: item.win_multiplier,
  draw_multiplier: item.draw_multiplier,
  loss_multiplier: item.loss_multiplier,
  r_win_multiplier: item.r_win_multiplier,
  r_draw_multiplier: item.r_draw_multiplier,
  r_loss_multiplier: item.r_loss_multiplier,
  zjq_0: item.zjq_0,
  zjq_1: item.zjq_1,
  zjq_2: item.zjq_2,
  zjq_3: item.zjq_3,
  zjq_4_jia: item.zjq_4_jia,
  bqc_33: item.bqc_33,
  bqc_31: item.bqc_31,
  bqc_30: item.bqc_30,
  bqc_13: item.bqc_13,
  bqc_11: item.bqc_11,
  bqc_10: item.bqc_10,
  bqc_03: item.bqc_03,
  bqc_01: item.bqc_01,
  bqc_00: item.bqc_00,
  bfOdds: item.bfOdds || {},
  // 补齐所有编辑页计算需要的比分独立赔率key
  ybl: item.ybl,
  ebl: item.ebl,
  eby: item.eby,
  sbl: item.sbl,
  sby: item.sby,
  sbe: item.sbe,
  sibl: item.sibl,
  siby: item.siby,
  sibe: item.sibe,
  wbl: item.wbl,
  wby: item.wby,
  wbe: item.wbe,
  lbl: item.lbl,
  yby: item.yby,
  ebe: item.ebe,
  lbs: item.lbs,
  ybs: item.ybs,
  ebs: item.ebs,
  lbsi: item.lbsi,
  ybsi: item.ybsi,
  ebsi: item.ebsi,
  lbw: item.lbw,
  ybw: item.ybw,
  ebw: item.ebw,
  lby: item.lby,
  // 其它比分（胜其它/平其它/负其它赔率）
  winOther: item.sqt,
  drawOther: item.pqt,
  loseOther: item.fqt
}));
        const playToPageMap = {
          胜平负: "index", // 胜平负跳index
          让胜平负: "editHandicap", // 让球胜平负跳editHandicap
          总进球: "editTotalGoals", // 总进球跳editTotalGoals
          半全场: "editHalfFull", // 半全场跳editHalfFull
          比分: "editScore", // 比分跳editScore
          混合过关: "editHhgg", // 混合过关跳editHhgg
        };
        await uni.navigateTo({
          url: `/pages/edit/football/${playToPageMap[this.currentPlay]}`,
          events: {
            // 可选：接收编辑页返回的回调数据（如果需要）
            editCallback: (data) => {},
          },
          success: (res) => {
            // 向编辑页传递选中数据
            res.eventChannel.emit("selectedData", {
              matches: formattedMatches,
              betCount: 50,
              // isNeedUserPhone: 1,
              combo: `${selectedMatches.length}串1`,
            });
          }
        });
        return;
      } catch (error) {
        uni.showToast({ title: "跳转失败，请稍后重试", icon: "none" });
      }
    },
    syncUpdatedMatches(updatedData) {
      if (!updatedData || !updatedData.matches) return;

      this.drawerList.forEach((drawer, drawerIdx) => {
        drawer.lotteryList.forEach((item, matchIdx) => {
          this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "homeSelected", false);
          this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "vsSelected", false);
          this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "awaySelected", false);
          this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "handicapHomeSelected", false);
          this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "handicapVsSelected", false);
          this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "handicapAwaySelected", false);
          this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "selectedScores", []);
          this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "selectedGoals", []);
        });
      });

      updatedData.matches.forEach((updatedItem) => {
        this.drawerList.forEach((drawer, drawerIdx) => {
          const targetMatchIdx = drawer.lotteryList.findIndex((item) => {
            return item.race_date === updatedItem.race_date && item.home_name === updatedItem.home_name && item.visiting_name === updatedItem.visiting_name;
          });
          if (targetMatchIdx !== -1) {
            this.$set(this.drawerList[drawerIdx].lotteryList[targetMatchIdx], "homeSelected", updatedItem.homeSelected || false);
            this.$set(this.drawerList[drawerIdx].lotteryList[targetMatchIdx], "vsSelected", updatedItem.vsSelected || false);
            this.$set(this.drawerList[drawerIdx].lotteryList[targetMatchIdx], "awaySelected", updatedItem.awaySelected || false);
            this.$set(this.drawerList[drawerIdx].lotteryList[targetMatchIdx], "handicapHomeSelected", updatedItem.handicapHomeSelected || false);
            this.$set(this.drawerList[drawerIdx].lotteryList[targetMatchIdx], "handicapVsSelected", updatedItem.handicapVsSelected || false);
            this.$set(this.drawerList[drawerIdx].lotteryList[targetMatchIdx], "handicapAwaySelected", updatedItem.handicapAwaySelected || false);
            this.$set(this.drawerList[drawerIdx].lotteryList[targetMatchIdx], "selectedScores", updatedItem.selectedScores || []);
            this.$set(this.drawerList[drawerIdx].lotteryList[targetMatchIdx], "selectedGoals", updatedItem.selectedGoals || []);
          }
        });
      });

      if (typeof updatedData.betCount === "number") {
        this.betCount = updatedData.betCount;
      }
    },
    handleMinus() {
      if (this.selectedMatchCount < 1) return;
      if (this.betCount > 1) this.betCount--;
    },
    handlePlus() {
      if (this.selectedMatchCount < 1) return;
        this.betCount++;
    },
    toggleSelect(targetItem, key) {
      this.drawerList.forEach((drawer, drawerIdx) => {
        const matchIdx = drawer.lotteryList.findIndex((item) => item.id === targetItem.id);
        if (matchIdx !== -1) {
          this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], key, !this.drawerList[drawerIdx].lotteryList[matchIdx][key]);
        }
      });
    },
    toggleScoreSelect(targetItem, value) {
      this.drawerList.forEach((drawer, drawerIdx) => {
        const matchIdx = drawer.lotteryList.findIndex((item) => item.id === targetItem.id);
        if (matchIdx !== -1) {
          let selectedScores = this.drawerList[drawerIdx].lotteryList[matchIdx].selectedScores || [];
          if (!Array.isArray(selectedScores)) selectedScores = [];
          const index = selectedScores.indexOf(value);
          if (index === -1) {
            selectedScores.push(value);
          } else {
            selectedScores.splice(index, 1);
          }
          this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "selectedScores", selectedScores);
        }
      });
    },
    toggleGoalSelect(targetItem, value) {
      this.drawerList.forEach((drawer, drawerIdx) => {
        const matchIdx = drawer.lotteryList.findIndex((item) => item.id === targetItem.id);
        if (matchIdx !== -1) {
          let selectedGoals = this.drawerList[drawerIdx].lotteryList[matchIdx].selectedGoals || [];
          if (!Array.isArray(selectedGoals)) selectedGoals = [];
          const index = selectedGoals.indexOf(value);
          if (index === -1) {
            selectedGoals.push(value);
          } else {
            selectedGoals.splice(index, 1);
          }
          this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "selectedGoals", selectedGoals);
        }
      });
    },
    toggleHalfFullSelect(targetItem, value) {
      this.drawerList.forEach((drawer, drawerIdx) => {
        const matchIdx = drawer.lotteryList.findIndex((item) => item.id === targetItem.id);
        if (matchIdx !== -1) {
          let selectedScores = this.drawerList[drawerIdx].lotteryList[matchIdx].selectedScores || [];
          if (!Array.isArray(selectedScores)) selectedScores = [];
          const index = selectedScores.indexOf(value);
          if (index === -1) {
            selectedScores.push(value);
          } else {
            selectedScores.splice(index, 1);
          }
          this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "selectedScores", selectedScores);
        }
      });
    },
    checkLocalToken() {
      const localToken = uni.getStorageSync("requestToken") || "";
      this.hasToken = !!localToken;
      this.showModal = !localToken;
    },
    async wxLoginHandler() {
      try {
        this.showLoading();
        const { code } = await uni.login({ provider: "weixin" });
        if (!code) {
          throw new Error("获取微信登录凭证失败");
        }
        const res = await wxLogin({ code });
        if (res.data.token) {
          uni.setStorageSync("requestToken", res.data.token);
          this.hasToken = true;
          uni.showToast({ title: "操作成功", icon: "success" });
        } else {
          uni.showToast({ title: res.message || "微信登录失败", icon: "none" });
        }
      } catch (err) {
        console.error("微信登录异常:", err);
        uni.showToast({ title: "登录失败，请稍后重试", icon: "none" });
      } finally {
        this.hideLoading();
      }
    },
    // ========== 核心修正：loadMatchData兼容混合过关 ==========
    async loadMatchData() {
      try {
        this.drawerList = [];
        this.isLoading = true;
        this.showLoading();

        // 调用统一的赛事接口（混合过关使用hhgg类型）
        const res = await queryFootBallLLottery({
          lotteryType: this.targetLotteryType,
        });

        // 如果是混合过关，格式化数据为混合过关所需结构
        if (this.currentPlay === "混合过关") {
          this.drawerList = this.formatMixedPassDrawerList(res.data);
        } else {
          // 原有玩法使用原有格式化逻辑
          this.drawerList = this.formatDrawerList(res.data);
        }

        this.hasData = this.drawerList.length === 0;
        this.isLoading = false;
        this.hideLoading();

        // 如果是混合过关，初始化选中计数
        if (this.currentPlay === "混合过关") {
          this.updateMixedSelectedCount();
        }
      } catch (err) {
        this.isLoading = false;
        this.hideLoading();
        console.error("加载赛事失败:", err);
        uni.showToast({ title: "加载失败，请重试", icon: "none" });
      }
    },
    // 混合过关数据格式化（完善：补充更多类型）
    formatMixedPassDrawerList(data) {
      if (!data) {
        // 返回默认的混合过关示例数据（完善：补充选中数组初始化）
        return [
          {
            title: `2026-01-22 周四 共1场比赛(双选选项, 即尚未开售)`,
            lotteryList: [
              {
                id: "mix_001",
                league_name: "沙职",
                serial_number: "周四001场",
                race_date: "01-23 01:30",
                home_name: "胡巴卡德",
                visiting_name: "吉达联合",
                home_win_rate: "65%", // 胜字段
                visiting_win_rate: "35%", // 胜字段
                is_stop: false, // 改为未停售
                // ========== 核心新增：初始化所有玩法的选中数组 ==========
                selectedSpf: [], // 胜平负/让球胜平负选中数组
                selectedBifen: [], // 比分选中数组
                selectedZongjinqiu: [], // 总进球选中数组
                selectedBanquan: [], // 半全场选中数组
                // ========== 原有赔率字段 ==========
                win_multiplier: 1.85,
                draw_multiplier: 3.2,
                loss_multiplier: 4.5,
                r_win_multiplier: 2.1,
                r_draw_multiplier: 3.1,
                r_loss_multiplier: 3.8,
                // 完善项：包含胜平负、让球胜平负、比分、总进球、半全场
                betRows: [
                ],
                popupBets: {
                  main: [

                  ],
                  score: [

                  ],
                  totalGoals: [
                  ],
                  halfFull: [
                  ],
                },
              },
            ],
          },
        ];
      }

      // 格式化接口返回的混合过关数据（保留所有原始字段，完善项+初始化选中数组）
      const drawerList = [];
      Object.keys(data).forEach((key) => {
        if (key.startsWith("data_") && data[key].title && data[key].lotteryList) {
          // 转换每个比赛为混合过关格式（使用扩展运算符保留所有原始字段）
          const formattedLotteryList = data[key].lotteryList.map((item) => ({
            // 保留所有原始字段
            ...item,
            // 补充默认ID（如果没有）
            id: item.id || `mix_${Math.random().toString(36).substr(2, 9)}`,
            // ========== 核心新增：初始化所有玩法的选中数组 ==========
            selectedSpf: item.selectedSpf || [], // 胜平负/让球胜平负选中数组
            selectedBifen: item.selectedBifen || [], // 比分选中数组
            selectedZongjinqiu: item.selectedZongjinqiu || [], // 总进球选中数组
            selectedBanquan: item.selectedBanquan || [], // 半全场选中数组
            // ========== 原有字段别名兼容 ==========
            league_name: item.league_name || "",
            serial_number: item.serial_number || "",
            race_date: item.race_date || item.time || "",
            home_name: item.homeTeam || item.home_name || "",
            visiting_name: item.awayTeam || item.visiting_name || "",
            date_str: item.date_str,
            is_stop: item.is_stop || false ,

            // 完善betRows结构：补充赔率、value等字段
            betRows: item.betRows
              ? item.betRows.map((row) => ({
                  ...row,
                  items: row.items.map((item) => ({
                    ...item,
                    value: item.value || item.label,
                    odds: item.odds || 1.0,
                    isSelected: item.isSelected || false,
                  })),
                }))
              : [
                  {
                    label: "胜平负",
                    items: [
                      { label: "主胜", value: "3", odds: item.win_multiplier || "", isSelected: false },
                      { label: "平", value: "1", odds: item.draw_multiplier || "", isSelected: false },
                      { label: "客胜", value: "0", odds: item.loss_multiplier || "", isSelected: false },
                    ],
                  },
                  {
                    label: "让球胜平负",
                    items: [
                      { label: "主胜【让】", value: "3", odds: item.r_win_multiplier || "", isSelected: false },
                      { label: "平【让】", value: "1", odds: item.r_draw_multiplier || "", isSelected: false },
                      { label: "客胜【让】", value: "0", odds: item.r_loss_multiplier || "", isSelected: false },
                    ],
                  },
                  {
                    label: "比分",
                    items: [
                      { label: "1:0", value: "1:0", odds: "", isSelected: false },
                      { label: "2:0", value: "2:0", odds: "", isSelected: false },
                      { label: "2:1", value: "2:1", odds: "", isSelected: false },
                      { label: "0:0", value: "0:0", odds: "", isSelected: false },
                      { label: "1:1", value: "1:1", odds: "", isSelected: false },
                      { label: "2:2", value: "2:2", odds: "", isSelected: false },
                    ],
                  },
                  {
                    label: "总进球",
                    items: [
                      { label: "0", value: "0", odds: "", isSelected: false },
                      { label: "1", value: "1", odds: "", isSelected: false },
                      { label: "2", value: "2", odds: "", isSelected: false },
                      { label: "3", value: "3", odds: "", isSelected: false },
                      { label: "4+", value: "4+", odds: "", isSelected: false },
                    ],
                  },
                  {
                    label: "半全场",
                    items: [
                      { label: "胜胜", value: "33", odds: "", isSelected: false },
                      { label: "胜平", value: "31", odds: "", isSelected: false },
                      { label: "胜负", value: "30", odds: "", isSelected: false },
                      { label: "平平", value: "11", odds: "", isSelected: false },
                      { label: "负负", value: "00", odds: "", isSelected: false },
                    ],
                  },
                ],
            // 完善popupBets结构
            popupBets: item.popupBets
              ? {
                  ...item.popupBets,
                  main: item.popupBets.main.map((item) => ({
                    ...item,
                    value: item.value || item.label,
                    odds: item.odds || 1.0,
                  })),
                  score: item.popupBets.score.map((item) => ({
                    ...item,
                    value: item.value || item.label,
                    odds: item.odds || 1.0,
                  })),
                  totalGoals: item.popupBets.totalGoals || [
                    { label: "0", value: "0", odds: "", isSelected: false },
                    { label: "1", value: "1", odds: "", isSelected: false },
                    { label: "2", value: "2", odds: "", isSelected: false },
                    { label: "3", value: "3", odds: "", isSelected: false },
                    { label: "4+", value: "4+", odds: "", isSelected: false },
                  ],
                  halfFull: item.popupBets.halfFull || [
                    { label: "胜胜", value: "33", odds: "", isSelected: false },
                    { label: "胜平", value: "31", odds: "", isSelected: false },
                    { label: "胜负", value: "30", odds: "", isSelected: false },
                    { label: "平平", value: "11", odds: "", isSelected: false },
                    { label: "负负", value: "00", odds: "", isSelected: false },
                  ],
                }
              : {
                  main: [
                    { label: "主胜", value: "3", odds: item.win_multiplier || "", isSelected: false },
                    { label: "平", value: "1", odds: item.draw_multiplier || "", isSelected: false },
                    { label: "客胜", value: "0", odds: item.loss_multiplier || "", isSelected: false },
                    { label: "主胜【让】", value: "3", odds: item.r_win_multiplier || "", isSelected: false },
                    { label: "平【让】", value: "1", odds: item.r_draw_multiplier || "", isSelected: false },
                    { label: "客胜【让】", value: "0", odds: item.r_loss_multiplier || "", isSelected: false },
                  ],
                  score: [
                    { label: "1:0", value: "1:0", odds: "", isSelected: false },
                    { label: "2:0", value: "2:0", odds: "", isSelected: false },
                    { label: "2:1", value: "2:1", odds: "", isSelected: false },
                    { label: "0:0", value: "0:0", odds: "", isSelected: false },
                    { label: "1:1", value: "1:1", odds: "", isSelected: false },
                    { label: "2:2", value: "2:2", odds: "", isSelected: false },
                  ],
                  totalGoals: [
                    { label: "0", value: "0", odds: "", isSelected: false },
                    { label: "1", value: "1", odds: "", isSelected: false },
                    { label: "2", value: "2", odds: "", isSelected: false },
                    { label: "3", value: "3", odds: "", isSelected: false },
                    { label: "4+", value: "4+", odds: "", isSelected: false },
                  ],
                  halfFull: [
                    { label: "胜胜", value: "33", odds: "", isSelected: false },
                    { label: "胜平", value: "31", odds: "", isSelected: false },
                    { label: "胜负", value: "30", odds: "", isSelected: false },
                    { label: "平平", value: "11", odds: "", isSelected: false },
                    { label: "负负", value: "00", odds: "", isSelected: false },
                  ],
                },
          }));

          drawerList.push({
            title: data[key].title,
            lotteryList: formattedLotteryList,
          });
        }
      });

      return drawerList.sort((a, b) => {
        const aKey = Object.keys(data).find((key) => data[key].title === a.title);
        const bKey = Object.keys(data).find((key) => data[key].title === b.title);
        return parseInt(aKey.replace("data_", "")) - parseInt(bKey.replace("data_", ""));
      });
    },
    // 原有玩法数据格式化（完全不动）
    formatDrawerList(data) {
      if (!data) return [];
      const drawerList = [];
      Object.keys(data).forEach((key) => {
        if (key.startsWith("data_") && data[key].title && data[key].lotteryList) {
          // 保留所有原始字段，不做字段过滤
          drawerList.push({
            title: data[key].title,
            // 直接使用原始数据，不做修改（保留胜、赔率等所有字段）
            lotteryList:
              data[key].lotteryList.map((item) => ({
                ...item,
                // 仅初始化必要的空数组，避免undefined
                selectedScores: item.selectedScores || [],
                selectedGoals: item.selectedGoals || [],
                selectedSpf: item.selectedSpf || [],
                selectedBifen: item.selectedBifen || [],
                selectedZjq: item.selectedZjq || [],
                selectedBqc: item.selectedBqc || [],
              })) || [],
          });
        }
      });
      return drawerList.sort((a, b) => {
        const aKey = Object.keys(data).find((key) => data[key].title === a.title);
        const bKey = Object.keys(data).find((key) => data[key].title === b.title);
        return parseInt(aKey.replace("data_", "")) - parseInt(bKey.replace("data_", ""));
      });
    },
    formDate(time) {
      return formatTimeToMDWeekHM(time);
    },
    calcHeaderHeight() {
      const systemInfo = wx.getWindowInfo();
      const statusBarHeight = systemInfo.statusBarHeight;
      const customHeaderHeight = (80 / 750) * systemInfo.windowWidth;
      this.headerHeight = statusBarHeight + customHeaderHeight;
    },
    toggleType(value) {
      this.drawerList = [];
      this.selectedType = [];
      this.selectedType.push(value);
      this.currentPlay = value;
      this.isPopupShowType = false;
      this.betCount = 1;
      this.selectedCombo = "";
      // 所有玩法都使用统一的加载方法
      this.loadMatchData();
    },
    toggleTime(value) {
      this.selectedTime = this.selectedTime === value ? "" : value;
    },
    closePopupType() {
      this.isPopupShowType = false;
    },
    handleFunnel() {
      this.isPopupShow = true;
    },
    async myValue(item) {
        // 组装接口参数
        const reqParams = {
          id: item.id,
          beFrom: "football",
          serialNumber: item.serial_number || "",
          dateStr: item.date_str,
          isLottery: 1,
        };
        // 调用recharge接口
        const res = await recharge(reqParams);
        if (res.data.status == 'fail') {
          
         this.hideLoading();
      
              uni.showModal({
                title: "提示",
                content: "您的服务币不足，请获取！",
                cancelText: "取消",
                confirmText: "获取",
                confirmColor: "#d92929",
                success: (res) => {
                  if (res.confirm) {
                    
                    uni.navigateTo({ url: `/pages/recharge/recharge?beFrom=football&isLottery=1` });
                  }
                }
              });
              return;
        } else {
                if (item.is_buy == 0) {
        this.$set(item, 'is_buy' ,1)
      }
        await uni.navigateTo({
          url: `/pages/test/footballPredict?id=${item.match_id}&isLottery=1&serialNumber=${reqParams.serialNumber}&beFrom=${reqParams.beFrom}`,
        });
        }

    },
    // 取消弹窗
    showLoading() {
      uni.showLoading({
        title: "加载中...",
        mask: true,
      });
    },
    hideLoading() {
      uni.hideLoading();
    },
  },
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

.match-scroll {
  touch-action: pan-y;
  position: absolute !important;
  left: 0;
  right: 0;
  width: 100% !important;
  overflow-y: auto !important;
  background-color: #f5f5f5;

  // #ifdef APP-PLUS
  height: calc(100vh - var(--status-bar-height)) !important;
  top: 0 !important;
  // #endif

  // #ifndef APP-PLUS
  top: 0 !important;
  bottom: 90rpx !important;
  // #endif

  -ms-overflow-style: none;
  scrollbar-width: none;
}
.match-scroll::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}


.bet-bar {
  position: fixed !important;
  width: 100% !important;
  left: 0 !important;
  z-index: 10 !important;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
  box-sizing: border-box !important;
  padding: 10rpx 20rpx;

  // #ifdef MP-WEIXIN
  bottom: calc(env(safe-area-inset-bottom)) !important;
  // #endif
  // #ifdef APP-PLUS
  bottom: calc(constant(safe-area-inset-bottom)) !important;
  bottom: calc(env(safe-area-inset-bottom)) !important;
  // #endif
  // #ifdef H5
  bottom: calc(env(safe-area-inset-bottom)) !important;
  // #endif

  .bet-bar-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 80rpx;
  }

  .left-section {
    display: flex;
    align-items: center;
    gap: 12rpx;
    flex: 1;
    padding: 10rpx 0rpx 10rpx 20rpx;
  }

  .clear-icon {
    width: 42rpx;
    height: 42rpx;
    opacity: 1;
    &.disabled {
      opacity: 0.2;
      pointer-events: none;
    }
  }

  // ========== 核心修改部分 ==========
  .text-group {
    display: flex;
    flex-direction: row; /* 改成水平排列 */
    align-items: center;  /* 垂直居中 */
    margin-left: 16rpx;   /* 可选：和清空图标拉开点距离 */
  }

  .selected-text {
    font-size: 28rpx;
    color: #666;
    font-weight: 400;
    margin-right: 16rpx; /* 这里控制和提示文字的间距，16rpx≈4个字符 */
    white-space: nowrap;
  }

  .risk-tip {
    font-size: 20rpx;
    color: #999;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-left: 40rpx;
  }
  // ========== 核心修改结束 ==========

  .confirm-btn {
    width: 180rpx;
    height: 70rpx;
    line-height: 70rpx;
    background-color: #d92929;
    color: #fff;
    border-radius: 8rpx;
    font-size: 28rpx;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;

    &:disabled {
      background-color: #ccc;
      color: #999;
    }
  }
}
/* 彻底删除原有串关和相关样式 */
.bet-bar-top, .bet-bar-bottom, .top-middle {
  display: none !important;
}

.type-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;

  .popup-mask {
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    transition: background 0.3s ease;
  }

  .popup-box {
    position: absolute;
    left: 0;
    width: 100%;
    background: #fff;
    box-shadow: 0 5rpx 20rpx rgba(0, 0, 0, 0.2);
    transform: translateY(-100%);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow-y: auto;
  }

  &.show {
    opacity: 1;
    pointer-events: auto;

    .popup-box {
      transform: translateY(0);
    }

    .popup-mask {
      background: rgba(0, 0, 0, 0.6);
    }
  }
}

.filter-section {
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;

  .section-title {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 16rpx;
    font-weight: 500;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .options-container {
    display: flex;
    flex-wrap: wrap;
    gap: 4rpx;
  }

  .option-item {
    min-width: calc((100% - 3 * 4rpx) / 5.05);
    height: 90rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1rpx solid #ddd;
    border-radius: 6rpx;
    box-sizing: border-box;
    cursor: pointer;
    font-size: 26rpx;
    color: #666;
    position: relative;
    transition: all 0.2s ease;

    &.active {
      border-color: #d92929;
      color: #d92929;
      background-color: #fff5f5;
    }

    .check-mark {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 40rpx;
      height: 40rpx;
      background-color: #d92929;
      clip-path: polygon(100% 0, 0 100%, 100% 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      .check-icon {
        width: 28rpx;
        height: 28rpx;
        transform: translate(10rpx, 8rpx);
      }
    }
  }
}

::v-deep .tips-container {
  width: 100%;
  box-sizing: border-box;
  padding: 10rpx 0;
}

::v-deep .tips-title {
  font-size: 32rpx;
  color: #d92929;
  font-weight: bold;
  margin-bottom: 20rpx;
  text-align: center;
}

::v-deep .tips-list {
  width: 100%;
}

::v-deep .tips-item {
  font-size: 26rpx;
  color: #333;
  line-height: 1.8;
  margin-bottom: 16rpx;
  text-align: justify;
  padding: 0 10rpx;
  word-break: break-all;
}

::v-deep .tips-item:last-child {
  margin-bottom: 0;
}

.popup-btn-bar {
  display: flex;
  padding: 20rpx 24rpx;
  gap: 20rpx;
  background-color: #fff;
  margin-top: 20rpx;
  box-sizing: border-box;

  .popup-btn {
    flex: 1;
    height: 80rpx;
    border-radius: 8rpx;
    font-size: 30rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    transition: all 0.2s ease;
  }

  .cancel-btn {
    background-color: #fff;
    color: #666;
    border: 1rpx solid #ddd;

    &:hover {
      background-color: #f5f5f5;
    }

    &:active {
      background-color: #eee;
    }
  }

  .confirm-btn {
    background-color: #d92929;
    color: #fff;
    border: none;

    &:hover {
      background-color: #c62828;
    }

    &:active {
      background-color: #b71c1c;
    }
  }
}

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

.uni-modal-wrapper .uni-modal {
  border-radius: 20rpx !important;
  background-color: #fff !important;
}

.uni-modal-wrapper .uni-modal-header {
  font-size: 32rpx !important;
  color: #d92929 !important;
  font-weight: bold !important;
}

.uni-modal-wrapper .uni-modal-body {
  font-size: 28rpx !important;
  color: #666 !important;
  padding: 30rpx 20rpx !important;
}

.uni-modal-wrapper .uni-modal-footer .uni-modal-btn {
  border-radius: 40rpx !important;
}

.uni-modal-wrapper .uni-modal-footer .uni-modal-btn.uni-modal-confirm {
  background-color: #d92929 !important;
  color: #fff !important;
}
.tab-bar-sticky {
  position: sticky;
  left: 0;
  width: 100%;
  background: #fff;
  padding: 16rpx 20rpx;
  white-space: nowrap;
  box-sizing: border-box;
  z-index: 8;
}

.tab-item {
  display: inline-block;
  padding: 10rpx 26rpx;
  margin-right: 16rpx;
  border-radius: 50rpx;
  font-size: 28rpx;
  color: #999;
  background: #f0f0f0;
}

.tab-item.active {
  color: #fff;
  background: #ff4444;
}
</style>
