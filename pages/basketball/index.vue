<template>
  <view style="width: 100%; height: 100vh; box-sizing: border-box">
    <CustomHeader :showBack="true" :ballTitle="' '" :isIndex="true" :showIcon="false" :isSelected="!!currentPlay" :selectedPlay="currentPlay" @trigger-select="togglePopup" @funnel-click="handleFunnel" />
    <scroll-view class="match-scroll" scroll-y>
      <!-- 原有玩法组件 -->
      <MatchSpf ref="spfRef" v-if="currentPlay === '胜负'" :drawer-list="drawerList" :status-bar-height="statusBarHeight" @toggle-select="toggleSelect" :go-to-ai-analysis="goToAiAnalysis" />
      <MatchHandicap ref="handicapRef" v-else-if="currentPlay === '让分胜负'" :drawer-list="drawerList" :status-bar-height="statusBarHeight" @toggle-select="toggleSelect" :go-to-ai-analysis="goToAiAnalysis" />
      <MatchHalfFull ref="halfFullRef" v-else-if="currentPlay === '大小分'" :drawer-list="drawerList" :status-bar-height="statusBarHeight" @toggle-select="toggleHalfFullSelect" :go-to-ai-analysis="goToAiAnalysis" />
      <MatchScore ref="scoreRef" v-else-if="currentPlay === '胜分差'" :drawer-list="drawerList" :status-bar-height="statusBarHeight" @toggle-score-select="toggleScoreSelect" :go-to-ai-analysis="goToAiAnalysis" @on-score-selected="handleScoreSelected" />
      <!-- 新增：混合过关组件 -->
      <MixedPassList ref="hhggRef" v-else-if="currentPlay === '混合过关'" :drawer-list="drawerList" :match-list="drawerList.flatMap((d) => d.lotteryList)" :status-bar-height="statusBarHeight" :go-to-ai-analysis="goToAiAnalysis" @toggle-spf-multi-select="handleHhggSpfSelect" @toggle-multi-select="handleHhggMultiSelect" />
    </scroll-view>

    <!-- 替换为足球同款底部投注栏 -->
    <view class="bet-bar" v-if="$isShowStatus">
      <view class="bet-bar-inner">
        <!-- 左侧：清空图标 + 已选场次 + 风险提示 -->
        <view class="left-section">
          <image class="clear-icon" src="/static/trash.png" mode="widthFix" @click="clearAllSelection" :class="{ disabled: selectedMatchCount === 0 }"></image>
          <view class="text-group">
            <text class="selected-text">已选{{ selectedMatchCount }}场</text>
            <text class="risk-tip">页面固定奖金仅供参考，请以出票时固定奖金为准</text>
          </view>
        </view>

        <!-- 右侧：选好了按钮 -->
        <button class="confirm-btn" @click="goToSchemeEdit" :disabled="selectedMatchCount === 0">选好了</button>
      </view>
    </view>

    <!-- 原有弹窗/组件 -->
    <view class="type-popup" :class="{ show: isPopupShowType }">
      <view class="popup-mask" @tap="closePopupType"></view>
      <view class="popup-box" :style="{ top: headerHeight + 'px' }">
        <view class="filter-section">
          <view class="options-container">
            <view v-for="typeText in typesList" :key="typeText" class="option-item" :class="{ active: selectedType.includes(typeText) }" @click="toggleType(typeText)">
              {{ typeText }}
              <view class="check-mark" v-if="selectedType.includes(typeText)"><image class="check-icon" src="/static/check.png" mode="widthFix"></image></view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <TipsPopup :visible.sync="isPopupShow" :title="tipsTitle" :content-list="tipsContentList" :header-height="headerHeight" :popup-width="700" border-color="#07c160" @close="handlePopupClose" :max-height="popupMaxHeight" />
    <UniNumberKeyboard :show.sync="showNumberKeyboard" :value="betCount + ''" :allowDot="false" confirm-text="确认" :min="1" :max="50" @input="handleKeyboardInput" @confirm="handleKeyboardConfirm" />
    <EmptyStop :hasData="hasData" position="middle" />
        
  </view>
</template>

<script>
import NativeTabbar from "@/components/tabbar.vue";
import MatchSpf from "@/pages/commn/basketball/MatchSpf.vue";
import MatchHandicap from "@/pages/commn/basketball/MatchHandicap.vue";
import MatchScore from "@/pages/commn/basketball/MatchScore.vue";
import MatchHalfFull from "@/pages/commn/basketball/MatchHalfFull.vue";
import MixedPassList from "@/pages/commn/basketball/MixedPassList.vue"; // 混合过关组件
import CustomHeader from "@/components/CustomHeader.vue";
import { queryBasketBallLLottery, checkCode, wxLogin, checkSelectBasketball, recharge } from "@/api/demo";
import { formatTimeToMDWeekHM } from "@/utils/data";
import TipsPopup from "@/pages/commn/playTip";
import { validateBetInput } from "@/utils/validate";
import EmptyStop from "@/pages/commn/emptyStop.vue";

export default {
  components: {
    NativeTabbar,
    MatchSpf,
    MatchHandicap,
    MatchScore,
    MatchHalfFull,
    MixedPassList, // 注册组件
    CustomHeader,
    TipsPopup,
    EmptyStop,
    
  },
  data() {
    return {
      typesList: ["混合过关", "胜负", "让分胜负", "大小分", "胜分差"],
      selectedType: ["胜负"],
      currentPlay: "胜负",
      hasToken: false,
      isPopupShowType: false,
      drawerList: [],
      isLoading: false,
      headerHeight: 0,
      betCount: 1,
      statusBarHeight: 0,
      playTypeMap: {
        胜负: "sf",
        让分胜负: "rsf",
        胜分差: "sfc",
        大小分: "dxf",
        混合过关: "hhgg", // 新增混合过关玩法映射
      },
      isRefreshing: false,
      isPopupShow: false,
      tipsTitle: "重要提示",
      tipsContentList: ["1、本软件无任何彩票销售业务，仅提供足球、篮球相关模拟玩法。", "2、本软件截图可作为彩票站打票依据。", "3、本软件预测数据仅供参考。", "4、体彩相关玩法、规则请到中国体育彩票官方渠道了解。", "5、本软件固定奖金数据可能存在未及时更新情况，通常浮动比例较小，可供参考。", "6、体彩爱好者可以设置小程序允许接收消息通知，会有更多交流机会及足不出户方便购彩方式。", "7、每天上午11点10分后本软件正式可用。"],
      windowHeight: 0,
      bottomBtnBarHeight: 0,
      tabbarHeight: 0,
      popupMaxHeight: 0,
      collapseStatus: true,
      selectedCombo: "",
      comboList: [],
      showNumberKeyboard: false,
      touchStartX: 0,
      swipeThreshold: 50,
      hasData: false,
      // 新增：全局选中状态缓存（和足球逻辑对齐）
      matchSelectedState: {},
    };
  },
onLoad() {
  // 强制显示分享菜单，立刻解除置灰
  wx.showShareMenu({
    menus: ['shareAppMessage', 'shareTimeline']
  })
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
      return this.playTypeMap[this.currentPlay] || "rsf";
    },
    // 核心修复：selectedMatchCount 实时精准统计，和足球逻辑完全对齐
    selectedMatchCount() {
      let count = 0;
      // 深遍历所有赛事，确保不遗漏
      this.drawerList.forEach((drawer) => {
        if (!drawer || !Array.isArray(drawer.lotteryList)) return;

        drawer.lotteryList.forEach((item) => {
          if (!item) return;
          let isSelected = false;

          switch (this.currentPlay) {
            case "胜负":
              isSelected = !!item.homeSelected || !!item.awaySelected;
              break;
            case "让分胜负":
              isSelected = !!item.rHomeSelected || !!item.rAwaySelected;
              break;
            case "大小分":
              isSelected = !!item.homeSelected || !!item.awaySelected;
              break;
            case "胜分差":
              isSelected = Array.isArray(item.selectedScores) && item.selectedScores.length > 0;
              break;
            case "混合过关":
              // 优化：优先读全局缓存，再读item自身，确保统计准确
              const matchState = this.matchSelectedState[item.serial_number] || item;
              const hasSpf = Array.isArray(matchState.selectedSpf) && matchState.selectedSpf.length > 0;
              const hasDx = Array.isArray(matchState.selectedDx) && matchState.selectedDx.length > 0;
              const hasSfc = Array.isArray(matchState.selectedSfc) && matchState.selectedSfc.length > 0;
              isSelected = hasSpf || hasDx || hasSfc;
              break;
            default:
              break;
          }

          if (isSelected) count++;
        });
      });
      return count;
    },
    // 原有 hasSingleMatch 方法，保持不变
    hasSingleMatch() {
      const selectedMatches = this.getSelectedMatches();
      return selectedMatches.some((item) => {
        switch (this.currentPlay) {
          case "胜负":
            return item.is_sf_single == 1;
          case "让分胜负":
            return item.is_rsf_single == 1;
          case "胜分差":
            return item.is_sfc_single == 1;
          case "大小分":
            return item.is_dxf_single == 1;
          case "混合过关":
            return item.is_hhgg_single == 1;
          default:
            return false;
        }
      });
    },
  },
  watch: {
    selectedMatchCount(newVal) {
      // 选中数>0时强制展开串关栏
      if (newVal > 0) {
        this.collapseStatus = false;
      }
      // 强制更新DOM，确保UI同步
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },
    // 监听玩法切换，重置状态
    currentPlay() {
      this.selectedCombo = "";
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },
    // 监听drawerList变化，初始化全局选中状态缓存
    drawerList: {
      deep: true,
      handler(newVal) {
        if (!newVal || !newVal.length) return;
        // 初始化全局选中状态
        newVal.forEach((drawer) => {
          drawer.lotteryList.forEach((item) => {
            if (!this.matchSelectedState[item.serial_number]) {
              this.$set(this.matchSelectedState, item.serial_number, {
                selectedSpf: [...(item.selectedSpf || [])],
                selectedDx: [...(item.selectedDx || [])],
                selectedSfc: [...(item.selectedSfc || [])],
                homeSelected: item.homeSelected || false,
                awaySelected: item.awaySelected || false,
                rHomeSelected: item.rHomeSelected || false,
                rAwaySelected: item.rAwaySelected || false,
                selectedScores: [...(item.selectedScores || [])],
              });
            }
          });
        });
      },
    },
  },
  created() {
    if (uni.getWindowInfo) {
      const windowInfo = uni.getWindowInfo();
      this.statusBarHeight = windowInfo.statusBarHeight;
    }
  },
  mounted() {
    this.calcHeaderHeight();
    this.calcPopupMaxHeight();
  },
  onShow() {
    // #ifdef APP-PLUS
    this.checkLocalToken();
    // #endif
    const editedData = uni.getStorageSync("editedMatchData");
    if (editedData) {
      let parsedData = typeof editedData === "string" ? JSON.parse(editedData) : editedData;
      this.syncUpdatedMatches(parsedData);
      uni.removeStorageSync("editedMatchData");
    } else {
      this.loadMatchData();
    }
  },
  methods: {
    // ========== 新增：清空所有选中场次方法（和足球一致） ==========
    clearAllSelection() {
      if (this.selectedMatchCount === 0) return;

      uni.showModal({
        title: "提示",
        content: "确定清空所有已选场次吗？",
        success: (res) => {
          if (res.confirm) {
            // 清空所有玩法的选中状态
            this.drawerList.forEach((drawer, drawerIdx) => {
              drawer.lotteryList.forEach((match, matchIdx) => {
                const targetMatch = this.drawerList[drawerIdx].lotteryList[matchIdx];
                // 清空普通玩法选中状态
                this.$set(targetMatch, "homeSelected", false);
                this.$set(targetMatch, "awaySelected", false);
                this.$set(targetMatch, "rHomeSelected", false);
                this.$set(targetMatch, "rAwaySelected", false);
                this.$set(targetMatch, "selectedScores", []);
                // 清空混合过关选中状态（补充字段校验，避免报错）
                this.$set(targetMatch, "selectedSpf", targetMatch.selectedSpf ? [] : []);
                this.$set(targetMatch, "selectedDx", targetMatch.selectedDx ? [] : []);
                this.$set(targetMatch, "selectedSfc", targetMatch.selectedSfc ? [] : []);
                // 清空全局缓存
                this.$set(this.matchSelectedState, match.serial_number, {
                  selectedSpf: [],
                  selectedDx: [],
                  selectedSfc: [],
                  homeSelected: false,
                  awaySelected: false,
                  rHomeSelected: false,
                  rAwaySelected: false,
                  selectedScores: [],
                });
              });
            });
            uni.showToast({ title: "已清空", icon: "success" });
            // 强制刷新统计
            this.$nextTick(() => {
              this.$forceUpdate();
            });
          }
        },
      });
    },
    // 核心新增：校验选中状态（和足球逻辑对齐）
    checkSelected(item, val) {
      if (!item || !val) return false;
      // 优先读取全局缓存
      const matchState = this.matchSelectedState[item.serial_number] || item;
      return Array.isArray(matchState.selectedSpf) && matchState.selectedSpf.includes(val);
    },
    // 自定义数字键盘
    handleKeyboardInput(val) {
      const num = parseInt(val) || 1;
      if (num < 1) {
        this.betCount = 1;
      } else if (num > 50) {
        this.betCount = 50;
      } else {
        this.betCount = num;
      }
    },
    handleKeyboardConfirm(val) {
      const num = parseInt(val) || 1;
      this.betCount = Math.min(Math.max(num, 1), 50);
      this.showNumberKeyboard = false;
    },
    // 计算弹窗最大高度
    calcPopupMaxHeight() {
      const systemInfo = wx.getWindowInfo();
      this.windowHeight = systemInfo.windowHeight;
      this.bottomBtnBarHeight = (90 / 750) * systemInfo.windowWidth;
      this.tabbarHeight = (100 / 750) * systemInfo.windowWidth;
      this.popupMaxHeight = this.windowHeight;
      // #ifdef MP-WEIXIN
      this.popupMaxHeight = this.windowHeight;
      // #endif
    },
    handlePopupClose() {
      this.isPopupShow = false;
    },
    // 玩法切换弹窗
    togglePopup() {
      this.isPopupShowType = !this.isPopupShowType;
    },
    // 获取选中的赛事（适配混合过关，和足球逻辑对齐）
    getSelectedMatches() {
      const selected = [];
      this.drawerList.forEach((drawer) => {
        if (!drawer || !Array.isArray(drawer.lotteryList)) return;

        drawer.lotteryList.forEach((item) => {
          let isSelected = false;
          // 优先读取全局缓存
          const matchState = this.matchSelectedState[item.serial_number] || item;

          switch (this.currentPlay) {
            case "大小分":
              isSelected = Boolean(matchState.homeSelected) || Boolean(matchState.awaySelected);
              break;
            case "胜负":
              isSelected = Boolean(matchState.homeSelected) || Boolean(matchState.awaySelected);
              break;
            case "让分胜负":
              isSelected = Boolean(matchState.rHomeSelected) || Boolean(matchState.rAwaySelected);
              break;
            case "胜分差":
              isSelected = Array.isArray(matchState.selectedScores) && matchState.selectedScores.length > 0;
              break;
            case "混合过关":
              const hasSpf = Array.isArray(matchState.selectedSpf) && matchState.selectedSpf.length > 0;
              const hasDx = Array.isArray(matchState.selectedDx) && matchState.selectedDx.length > 0;
              const hasSfc = Array.isArray(matchState.selectedSfc) && matchState.selectedSfc.length > 0;
              isSelected = hasSpf || hasDx || hasSfc;
              break;
          }

          if (isSelected) {
            // 合并缓存数据和原始数据，确保字段完整
            selected.push({ ...item, ...matchState });
          }
        });
      });
      return selected;
    },
    // 跳转编辑页面（适配混合过关）
    async goToSchemeEdit() {
      const selectedMatches = this.getSelectedMatches();
      const totalSelectedCount = selectedMatches.length;
      // 1. 基础校验：最多8场
      if (totalSelectedCount > 8) {
        uni.showToast({ title: "最多只能选择8场赛事", icon: "none" });
        return;
      }
      // 2. 单场判断
      const hasSingleMatch = this.hasSingleMatch;

      // 3. 投注场次校验
      if (hasSingleMatch) {
        if (totalSelectedCount < 1) {
          uni.showToast({ title: "单场赛事至少选择1场", icon: "none" });
          return;
        }
      } else {
        if (totalSelectedCount < 2) {
          uni.showToast({ title: "非单场赛事至少选择2场", icon: "none" });
          return;
        }
      }
      // 5. 停售校验
      const matchSerials = selectedMatches.map((item) => item.serial_number).join(",");
      try {
        this.showLoading();
        const res = await checkSelectBasketball({ lotteryIds: matchSerials });
        const isNeedUserPhone = false;

        if (res.data && res.data.status == 1) {
          // 6. 玩法与编辑页面匹配
          const basketballPlayToPageMap = {
            "胜负": "/pages/edit/basketball/index",
            "让分胜负": "/pages/edit/basketball/editHandicap",
            "胜分差": "/pages/edit/basketball/editScore",
            "大小分": "/pages/edit/basketball/editHalfFull",
            "混合过关": "/pages/edit/basketball/editHhgg"
          };
// 2. 一行取值（匹配不到则用默认值，对应原switch的default）
const editUrl = basketballPlayToPageMap[this.currentPlay] || "/pages/edit/basketball/index";


          // 7. 传递完整数据（包含混合过关选中字段）
          uni.navigateTo({
            url: editUrl,
            events: {
              updateSelectedMatches: (updatedData) => this.syncUpdatedMatches(updatedData),
            },
            success: (res) => {
              res.eventChannel.emit("selectedData", {
                matches: selectedMatches,
                betCount: this.betCount,
                isNeedUserPhone,
                combo: this.selectedCombo,
                playType: this.currentPlay,
              });
            },
          });
        } else {
          uni.showModal({
            title: "提示",
            content: "抱歉存在停售场次，请重新选择!",
            showCancel: false,
            confirmText: "我知道了",
            success: (modalRes) => {
              if (modalRes.confirm) {
                this.drawerList = [];
                this.loadMatchData();
                this.betCount = 1;
                this.selectedCombo = "";
              }
            },
          });
        }
      } catch (error) {
        console.error("checkSelectBasketball接口调用失败:", error);
        uni.showModal({
          title: "错误",
          content: "验证失败，请稍后重试",
          showCancel: false,
          confirmText: "我知道了",
          success: (modalRes) => {
            if (modalRes.confirm) {
              this.drawerList = [];
              this.loadMatchData();
              this.betCount = 1;
              this.selectedCombo = "";
            }
          },
        });
      } finally {
        this.hideLoading();
      }
    },
    // 同步编辑页面返回的数据（适配混合过关，和足球逻辑对齐）
    syncUpdatedMatches(updatedData) {
      if (!updatedData || !updatedData.matches) return;

      // 清空所有选中状态
      this.drawerList.forEach((drawer, drawerIdx) => {
        drawer.lotteryList.forEach((item, matchIdx) => {
          const targetMatch = this.drawerList[drawerIdx].lotteryList[matchIdx];
          // 基础玩法
          this.$set(targetMatch, "homeSelected", false);
          this.$set(targetMatch, "awaySelected", false);
          this.$set(targetMatch, "rHomeSelected", false);
          this.$set(targetMatch, "rAwaySelected", false);
          this.$set(targetMatch, "selectedScores", []);
          // 混合过关（补充字段校验）
          this.$set(targetMatch, "selectedSpf", targetMatch.selectedSpf ? [] : []);
          this.$set(targetMatch, "selectedDx", targetMatch.selectedDx ? [] : []);
          this.$set(targetMatch, "selectedSfc", targetMatch.selectedSfc ? [] : []);
          // 清空全局缓存
          this.$set(this.matchSelectedState, item.serial_number, {
            selectedSpf: [],
            selectedDx: [],
            selectedSfc: [],
            homeSelected: false,
            awaySelected: false,
            rHomeSelected: false,
            rAwaySelected: false,
            selectedScores: [],
          });
        });
      });

      // 更新选中状态
      updatedData.matches.forEach((updatedItem) => {
        this.drawerList.forEach((drawer, drawerIdx) => {
          const targetMatchIdx = drawer.lotteryList.findIndex((item) => item.serial_number === updatedItem.serial_number);
          if (targetMatchIdx !== -1) {
            const targetMatch = this.drawerList[drawerIdx].lotteryList[targetMatchIdx];
            // 更新基础玩法
            this.$set(targetMatch, "homeSelected", updatedItem.homeSelected || false);
            this.$set(targetMatch, "awaySelected", updatedItem.awaySelected || false);
            this.$set(targetMatch, "rHomeSelected", updatedItem.rHomeSelected || false);
            this.$set(targetMatch, "rAwaySelected", updatedItem.rAwaySelected || false);
            this.$set(targetMatch, "selectedScores", updatedItem.selectedScores || []);
            // 更新混合过关（保持和子组件一致的原始标识）
            this.$set(targetMatch, "selectedSpf", updatedItem.selectedSpf || []);
            this.$set(targetMatch, "selectedDx", updatedItem.selectedDx || []);
            this.$set(targetMatch, "selectedSfc", updatedItem.selectedSfc || []);

            // 更新全局缓存（核心：和子组件字段完全对齐）
            this.$set(this.matchSelectedState, updatedItem.serial_number, {
              selectedSpf: updatedItem.selectedSpf || [],
              selectedDx: updatedItem.selectedDx || [],
              selectedSfc: updatedItem.selectedSfc || [],
              homeSelected: updatedItem.homeSelected || false,
              awaySelected: updatedItem.awaySelected || false,
              rHomeSelected: updatedItem.rHomeSelected || false,
              rAwaySelected: updatedItem.rAwaySelected || false,
              selectedScores: updatedItem.selectedScores || [],
            });
          }
        });
      });

      if (typeof updatedData.betCount === "number") {
        this.betCount = updatedData.betCount;
      }
    },
    // 倍数减
    handleMinus() {
      if (this.selectedMatchCount < 1) return;
      if (this.betCount > 1) this.betCount--;
    },
    // 倍数输入
    handleBetInput(e) {
      const inputVal = e.detail.value;
      const validVal = validateBetInput(inputVal);

      this.betCount = null;
      this.$nextTick(() => {
        this.betCount = validVal;
      });
    },
    // 倍数加
    handlePlus() {
      if (this.selectedMatchCount < 1) return;
      if (this.betCount < 50) {
        this.betCount++;
      } else {
        uni.showToast({ title: "倍数最多50倍", icon: "none" });
      }
    },
    // 胜负选中切换（和足球逻辑对齐）
    toggleSelect(targetItem, key) {
      this.drawerList.forEach((drawer, drawerIdx) => {
        const targetMatchIdx = drawer.lotteryList.findIndex((item) => item.serial_number == targetItem.serial_number);
        if (targetMatchIdx !== -1) {
          // 更新drawerList
          const targetMatch = this.drawerList[drawerIdx].lotteryList[targetMatchIdx];
          const currentVal = targetMatch[key];
          this.$set(targetMatch, key, !currentVal);

          // 更新全局缓存
          if (!this.matchSelectedState[targetItem.serial_number]) {
            this.$set(this.matchSelectedState, targetItem.serial_number, { ...targetMatch });
          }
          this.$set(this.matchSelectedState[targetItem.serial_number], key, !currentVal);
        }
      });

      this.$forceUpdate();
    },
    // 大小分选中切换
    toggleHalfFullSelect(targetItem, selectType) {
      if (!["homeSelected", "awaySelected"].includes(selectType)) {
        uni.showToast({ title: "参数错误：选中字段不合法", icon: "none" });
        console.error("非法selectType：", selectType);
        return;
      }

      this.drawerList.forEach((drawer, drawerIdx) => {
        const matchIdx = drawer.lotteryList.findIndex((item) => item.serial_number === targetItem.serial_number || item.serial_number === targetItem.serialNumber);

        if (matchIdx !== -1) {
          const targetMatch = this.drawerList[drawerIdx].lotteryList[matchIdx];
          const currentStatus = targetMatch[selectType] !== undefined && targetMatch[selectType] !== null ? targetMatch[selectType] : false;
          // 更新drawerList
          this.$set(targetMatch, selectType, !currentStatus);

          // 更新全局缓存
          const serialNumber = targetItem.serial_number || targetItem.serialNumber;
          if (!this.matchSelectedState[serialNumber]) {
            this.$set(this.matchSelectedState, serialNumber, { ...targetMatch });
          }
          this.$set(this.matchSelectedState[serialNumber], selectType, !currentStatus);
        } else {
          console.warn("未找到对应赛事：", targetItem.serial_number || targetItem.serialNumber);
        }
      });
    },
    // 胜分差选中切换
    toggleScoreSelect(data) {
      const { serialNumber, selectedScores } = data;
      this.drawerList.forEach((drawer, drawerIdx) => {
        const matchIdx = drawer.lotteryList.findIndex((item) => item.serial_number === serialNumber);
        if (matchIdx !== -1) {
          const targetMatch = this.drawerList[drawerIdx].lotteryList[matchIdx];
          // 更新drawerList
          this.$set(targetMatch, "selectedScores", selectedScores);

          // 更新全局缓存
          if (!this.matchSelectedState[serialNumber]) {
            this.$set(this.matchSelectedState, serialNumber, { ...targetMatch });
          }
          this.$set(this.matchSelectedState[serialNumber], "selectedScores", selectedScores);
        }
      });
    },
    // 核心修复：混合过关 - 胜负/让分胜负选中事件处理（和足球逻辑对齐）
    handleHhggSpfSelect(item) {
      if (!item || !item.serial_number) return;

      // 1. 更新全局缓存（核心）
      this.$set(this.matchSelectedState, item.serial_number, {
        ...this.matchSelectedState[item.serial_number],
        selectedSpf: [...(item.selectedSpf || [])],
      });

      // 2. 更新drawerList
      this.drawerList.forEach((drawer, drawerIdx) => {
        const targetMatchIdx = drawer.lotteryList.findIndex((m) => m.serial_number === item.serial_number);
        if (targetMatchIdx !== -1) {
          this.$set(drawer.lotteryList[targetMatchIdx], "selectedSpf", [...(item.selectedSpf || [])]);
        }
      });

      // 3. 强制刷新
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },
    // 核心修复：混合过关 - 所有玩法选中事件处理（关键修改：移除错误的dx/sfc映射）
    handleHhggMultiSelect(data) {
      const { serialNumber, selectedData } = data;
      if (!serialNumber || !selectedData) return;

      // 1. 转换弹框数据为列表格式（仅处理spf，dx/sfc直接保留原始标识）
      const spfList = [];
      [...(selectedData.spf || []), ...(selectedData.rspf || [])].forEach((val) => {
        const spfMapping = {
          胜负_主胜: "home_win",
          胜负_客胜: "home_lose",
          让分_主胜: "home_win_r",
          让分_客胜: "home_lose_r",
        };
        if (spfMapping[val]) spfList.push(spfMapping[val]);
      });

      // 关键修改：dx/sfc直接使用原始标识，不做额外映射（和子组件保持一致）
      const dxList = [...(selectedData.dx || [])];
      const sfcList = [...(selectedData.sfc || [])];

      // 2. 更新全局缓存（核心：和子组件字段完全一致）
      this.$set(this.matchSelectedState, serialNumber, {
        ...this.matchSelectedState[serialNumber],
        selectedSpf: spfList,
        selectedDx: dxList,
        selectedSfc: sfcList,
      });

      // 3. 更新drawerList
      this.drawerList.forEach((drawer, drawerIdx) => {
        const targetMatchIdx = drawer.lotteryList.findIndex((m) => m.serial_number === serialNumber);
        if (targetMatchIdx !== -1) {
          this.$set(drawer.lotteryList[targetMatchIdx], "selectedSpf", spfList);
          this.$set(drawer.lotteryList[targetMatchIdx], "selectedDx", dxList);
          this.$set(drawer.lotteryList[targetMatchIdx], "selectedSfc", sfcList);
        }
      });

      // 4. 强制刷新
      this.$nextTick(() => {
        this.$forceUpdate();
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
        if (res.data && res.data.token) {
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
    // 加载赛事数据（核心优化：初始化字段更简洁）
    async loadMatchData() {
      try {
        this.drawerList = [];
        this.matchSelectedState = {}; // 清空全局缓存
        this.isLoading = true;
        this.showLoading();
        const res = await queryBasketBallLLottery({
          lotteryType: this.targetLotteryType,
        });
        let newDrawerList = this.formatDrawerList(res.data);
        this.isLoading = false;
        this.hideLoading();

        // 初始化选中字段（优化：更简洁的赋值）
        newDrawerList = newDrawerList.map((drawer) => ({
          ...drawer,
          lotteryList: drawer.lotteryList.map((item) => {
            const initItem = {
              ...item,
              rHomeSelected: false,
              rAwaySelected: false,
              homeSelected: false,
              awaySelected: false,
              selectedScores: [],
              selectedSpf: [],
              selectedDx: [],
              selectedSfc: [],
            };
            // 初始化全局缓存
            this.$set(this.matchSelectedState, item.serial_number, { ...initItem });
            return initItem;
          }),
        }));

        this.drawerList = newDrawerList;
        this.hasData = this.drawerList.length === 0;
        this.$forceUpdate();
      } catch (err) {
        this.hideLoading();
        console.error("加载赛事失败:", err);
        uni.showToast({ title: "加载失败，请重试", icon: "none" });
      } finally {
        this.hideLoading();
        this.isLoading = false;
      }
    },
    formatDrawerList(data) {
      if (!data) return [];
      const drawerList = [];
      Object.keys(data).forEach((key) => {
        if (key.startsWith("data_") && data[key].title && data[key].lotteryList) {
          drawerList.push({
            title: data[key].title,
            lotteryList: data[key].lotteryList || [],
          });
        }
      });
      return drawerList.sort((a, b) => {
        const aKey = Object.keys(data).find((key) => data[key].title === a.title);
        const bKey = Object.keys(data).find((key) => data[key].title === b.title);
        return parseInt(aKey.replace("data_", "")) - parseInt(bKey.replace("data_", ""));
      });
    },
    calcHeaderHeight() {
      const windowInfo = uni.getWindowInfo ? uni.getWindowInfo() : '';
      const statusBarHeight = windowInfo.statusBarHeight;
      const customHeaderHeight = (80 / 750) * windowInfo.windowWidth;
      this.headerHeight = statusBarHeight + customHeaderHeight;
    },
    toggleType(value) {
      this.drawerList = [];
      this.matchSelectedState = {}; // 清空全局缓存
      this.selectedType = [value];
      this.currentPlay = value;
      this.isPopupShowType = false;
      this.betCount = 1;
      this.selectedCombo = "";
      this.loadMatchData();
    },
    closePopupType() {
      this.isPopupShowType = false;
    },
    handleFunnel() {
      this.isPopupShow = true;
    },
    async goToAiAnalysis(item) {
      try {
        this.showLoading();
        const reqParams = {
          id: item.id,
          beFrom: "basketball",
          serialNumber: item.serial_number || "",
          dateStr: item.date_str,
          isLottery: 1,
        };
        // 调用recharge接口
        const res = await recharge(reqParams);
        console.log(res, "res------");
        if (res.data.status == 'fail') {
          // isLottery=1 表示无灵石，显示充值弹窗
          this.hideLoading();
          uni.showModal({
                title: "请充币",
                content: "您的游戏币不足，请充币！",
                cancelText: "取消",
                confirmText: "充币",
                confirmColor: "#d92929",
                success: (res) => {
                  if (res.confirm) {
                    // 点击兑换跳充值页
                    uni.navigateTo({ url: `/pages/recharge/recharge?beFrom=basketball&isLottery=1` });
                  }
                }
              });
        return;
        } else {
          await uni.navigateTo({ url: `/pages/test/basketballAi?id=${item.id}&isLottery=1` });
        }
      } catch (err) {
        console.error("[AI分析] 失败:", err);
        uni.showToast({ title: "网络异常，请稍后重试", icon: "none" });
      } finally {
        this.hideLoading();
      }
    },
    showLoading() {
      uni.showLoading({ title: "加载中...", mask: true });
    },
    hideLoading() {
      uni.hideLoading();
    },
  },
};
</script>

<style scoped lang="scss">
/* 原有样式保持不变，仅替换bet-bar部分样式 */
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

/* 替换为足球同款bet-bar样式 */
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

  .text-group {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  .selected-text {
    font-size: 28rpx;
    color: #666;
    font-weight: 400;
  }

  .risk-tip {
    font-size: 20rpx;
    color: #999;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

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

/* 彻底删除原有串关和倍数相关样式 */
.bet-bar-top,
.bet-bar-bottom,
.top-middle {
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
    box-sizing: border-box;
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

  .reset-single-btn {
    font-size: 24rpx;
    color: #d92929;
    background: transparent;
    border: none;
    padding: 6rpx 32rpx;
    margin: 0;
    height: auto;
    border-radius: 6rpx;
    background-color: #fff5f5;
    transition: all 0.2s ease;

    &:hover {
      background-color: #ffe6e6;
    }

    &:active {
      background-color: #ffd9d9;
    }
  }

  .options-container {
    display: flex;
    flex-wrap: wrap;
    gap: 4rpx;
  }

  .option-item {
    min-width: calc((100% - 3 * 4rpx) / 4);
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
</style>
