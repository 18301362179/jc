<template>
  <!-- 混合过关：让球+胜平负 列表多选布局 -->
  <view class="match-list" :style="{ paddingTop: paddingTopVal + 'rpx' }">
    <!-- 抽屉循环容器 -->
    <view v-for="(drawer, drawerIdx) in finalDrawerList" :key="drawerIdx" class="drawer-wrapper">
      <view class="date-title sticky-header" :style="{ top: stickyHeaderTop + 'rpx' }" @click="toggleDrawer(drawerIdx)" hover-class="none">
        <text class="drawer-title-text">{{ drawer.title }}</text>
        <view class="arrow-icon" :class="[{ rotated: expandedDrawers[drawerIdx] }]">↓</view>
      </view>

      <!-- 抽屉内容：列表多选布局 -->
      <view class="drawer-content" v-show="expandedDrawers[drawerIdx]">
        <view v-for="(item, index) in drawer.lotteryList" :key="index" class="match-row">
          <!-- 状态行 -->
          <view class="match-status-row">
            <view class="status-left">
              <text class="single-tag" v-if="item.is_hhgg_single == 1 && item.is_stop == 0">单</text>
              <text class="single-tag" style="background: #dedede" v-if="item.is_stop == 1">停</text>
            </view>
            <view class="status-right">
              <view class="ai-analysis-btn" :class="{ 'x-text-green': item.is_buy !== 0 }" v-if="$xiValue" @click.stop="() => goToAiAnalysis(item)">
                <text>详细</text>
                <text class="small-coin" v-if="item.is_buy == 0">{{item.charge}}</text>
              </view>
            </view>
          </view>

          <!-- 核心多层左右布局 -->
          <view class="main-content-row">
            <view class="main-left">
              <view class="top-left">
                <text class="league-name">{{ item.league_name || "未知联赛" }}</text>
              </view>
              <view class="bottom-left">
                <text class="serial-number">{{ item.serial_number }}</text>
                <text class="match-time">{{ item.race_date }}</text>
              </view>
            </view>

            <view class="main-right">
              <view class="top-right-layout">
                <view class="handicap-col">
                  <text class="handicap-text">让</text>
                  <text class="handicap-text">球</text>
                </view>
                <view class="team-rate-col">
                  <view class="team-vs">
                    <text class="team-name away">{{ item.visiting_name }}</text>
                    <text class="vs-text">VS</text>
                    <text class="team-name home">{{ item.home_name }}</text>
                  </view>
                  <view class="rate-row">
                    <text class="rate-text away" style="text-align: right; padding-right: 15px" v-if="item.visiting_win_rate&&$urlValue">胜率{{ item.visiting_win_rate || "" }}</text>
                    <text class="rate-text home" style="text-align: left; padding-left: 15px" v-if="item.home_win_rate&&$urlValue">胜率{{ item.home_win_rate || "" }}</text>
                  </view>
                </view>
              </view>

              <view class="bottom-right-layout">
                <view class="handicap-value-col">
                  <view class="handicap-value-item">0</view>
                  <!-- 兼容写法：去掉模板字符串，纯数组+方法调用 -->
                  <view class="handicap-value-item" :class="[getHandicapColorClass(item.r_goal)]">
                    {{ item.r_goal !== undefined && item.r_goal !== null ? item.r_goal : "0" }}
                  </view>
                </view>
                <view class="spf-select-col">
                  <view class="spf-row">
                    <view class="spf-btn" :class="[{ selected: checkSelected(item.selectedSpf, 'home_lose'), disabled: item.is_stop == 1 || !item.loss_multiplier }]" @click="handleSpfMultiClick(item, 'home_lose')">
                      <text class="spf-text">主负</text>
                      <text class="spf-odds">{{ item.loss_multiplier !== undefined && item.loss_multiplier !== null ? item.loss_multiplier : "--" }}</text>
                    </view>
                    <view class="spf-btn" :class="[{ selected: checkSelected(item.selectedSpf, 'home_win'), disabled: item.is_stop == 1 || !item.win_multiplier }]" @click="handleSpfMultiClick(item, 'home_win')">
                      <text class="spf-text">主胜</text>
                      <text class="spf-odds">{{ item.win_multiplier !== undefined && item.win_multiplier !== null ? item.win_multiplier : "--" }}</text>
                    </view>
                  </view>
                  <view class="spf-row">
                    <view class="spf-btn" :class="[{ selected: checkSelected(item.selectedSpf, 'home_lose_r'), disabled: item.is_stop == 1 }]" @click="handleSpfMultiClick(item, 'home_lose_r')">
                      <text class="spf-text">主负</text>
                      <text class="spf-odds">{{ item.r_loss_multiplier !== undefined && item.r_loss_multiplier !== null ? item.r_loss_multiplier : "--" }}</text>
                    </view>

                    <view class="spf-btn" :class="[{ selected: checkSelected(item.selectedSpf, 'home_win_r'), disabled: item.is_stop == 1 }]" @click="handleSpfMultiClick(item, 'home_win_r')">
                      <text class="spf-text">主胜</text>
                      <text class="spf-odds">{{ item.r_win_multiplier !== undefined && item.r_win_multiplier !== null ? item.r_win_multiplier : "--" }}</text>
                    </view>
                  </view>
                </view>
                <view class="expand-btn-col" @click="openScorePopup(item)">
                  <text class="expand-text">展开</text>
                  <text class="expand-more">全部</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 混合过关弹框：替换为篮球玩法（胜负、让分胜负、大小分） -->
    <view class="score-popup-mask" v-if="isPopupShow && currentMatch" @click="closePopup" hover-class="none"></view>
    <view class="score-popup" v-if="isPopupShow && currentMatch">
      <view v-if="isLoading" class="popup-loading">
        <text>加载赔率中...</text>
      </view>
      <view v-else class="popup-content-wrapper">
        <view class="popup-header">
          <view class="popup-title"> {{ currentMatch.visiting_name + "(客)" }} VS {{ currentMatch.home_name + "(主)" }} </view>
          <!-- 第二行：胜、平、负率 横向排列 -->
          <view class="match-stat-info stat-spf">
            <view class="stat-item" v-if="currentMatch.visiting_win_rate">
              <text class="stat-label">胜：</text>
              <text class="stat-value">{{ currentMatch.visiting_win_rate || "--" }}</text>
            </view>
            <view class="stat-item" v-if="currentMatch.draw_rate">
              <text class="stat-label">平：</text>
              <text class="stat-value">{{ currentMatch.draw_rate || "--" }}</text>
            </view>
            <view class="stat-item" v-if="currentMatch.home_win_rate">
              <text class="stat-label">负率：</text>
              <text class="stat-value">{{ currentMatch.home_win_rate || "--" }}</text>
            </view>
          </view>
          <!-- 第三行：预测比分 单独居中【核心要求】 -->
          <view class="match-stat-info stat-score" v-if="currentMatch.home_goal_calculate && currentMatch.visiting_goal_calculate">
            <view class="stat-item">
              <text class="stat-label">比分：</text>
              <text class="stat-value">{{ currentMatch.visiting_goal_calculate }}:{{ currentMatch.home_goal_calculate }}</text>
            </view>
          </view>
        </view>
        <view class="popup-scroll-content">
          <!-- 1. 胜负板块（替换原胜平负） -->
          <view class="score-section">
            <view class="section-label spf-label">胜负</view>
            <view class="spf-options">
              <view class="spf-item" @click="handleScoreToggle('spf', '胜负_客胜')" :class="[getScoreClass('spf', '胜负_客胜', currentMatch.loss_multiplier)]">
                <text class="score-text">主负</text>
                <text class="score-odds">{{ currentMatch.loss_multiplier !== undefined && currentMatch.loss_multiplier !== null ? currentMatch.loss_multiplier : "--" }}</text>
              </view>
              <view class="spf-item" @click="handleScoreToggle('spf', '胜负_主胜')" :class="[getScoreClass('spf', '胜负_主胜', currentMatch.win_multiplier)]">
                <text class="score-text">主胜</text>
                <text class="score-odds">{{ currentMatch.win_multiplier !== undefined && currentMatch.win_multiplier !== null ? currentMatch.win_multiplier : "--" }}</text>
              </view>
            </view>
          </view>

          <!-- 2. 让分胜负板块（保留，适配篮球逻辑） -->
          <view class="score-section">
            <view class="section-label rspf-label">让分胜负</view>
            <view class="rspf-container">
              <view class="rspf-options">
                <view class="rspf-item" @click="handleScoreToggle('rspf', '让分_客胜')" :class="[getScoreClass('rspf', '让分_客胜')]">
                  <text class="score-text">主负</text>
                  <text class="score-odds">{{ currentMatch.r_loss_multiplier !== undefined && currentMatch.r_loss_multiplier !== null ? currentMatch.r_loss_multiplier : "--" }}</text>
                </view>
                <view class="rspf-item" @click="handleScoreToggle('rspf', '让分_主胜')" :class="[getScoreClass('rspf', '让分_主胜')]">
                  <text class="score-text">主胜【让】</text>
                  <text class="score-odds">{{ currentMatch.r_win_multiplier !== undefined && currentMatch.r_win_multiplier !== null ? currentMatch.r_win_multiplier : "--" }}</text>
                </view>
              </view>
              <view class="rspf-tip">让分胜负（主队{{ currentMatch.r_goal || -1 }}）</view>
            </view>
          </view>

          <!-- 3. 大小分板块（替换原比分/总进球/半全场） -->
          <view class="score-section">
            <view class="section-label zjq-label">大小分</view>
            <view class="zjq-container">
              <view class="zjq-options">
                <view class="zjq-item" @click="handleScoreToggle('dx', '大小分_大')" :class="[getScoreClass('dx', '大小分_大')]">
                  <text class="score-text">大</text>
                  <text class="score-odds">{{ currentMatch.dxf_d_multiplier !== undefined && currentMatch.dxf_d_multiplier !== null ? currentMatch.dxf_d_multiplier : "--" }}</text>
                </view>
                <view class="zjq-item" @click="handleScoreToggle('dx', '大小分_小')" :class="[getScoreClass('dx', '大小分_小')]">
                  <text class="score-text">小</text>
                  <text class="score-odds">{{ currentMatch.dxf_x_multiplier !== undefined && currentMatch.dxf_x_multiplier !== null ? currentMatch.dxf_x_multiplier : "--" }}</text>
                </view>
              </view>
              <view class="zjq-tip">总分{{ currentMatch.dxf_goal || 0 }}分</view>
            </view>
          </view>

          <!-- 4. 胜分差板块：拆分为两个独立竖排（客胜分差 + 主胜分差） -->
          <!-- 4.1 客胜分差（独立竖排） -->
          <view class="score-section">
            <view class="section-label bqc-label">胜分差</view>
            <view class="bqc-container single-column">
              <view class="bqc-options">
                <view class="bqc-row">
                  <view class="bqc-item" @click="handleScoreToggle('sfc', '胜分差_客胜_1-5')" :class="[getScoreClass('sfc', '胜分差_客胜_1-5')]">
                    <text class="score-text">1-5</text>
                    <text class="score-odds">{{ getScoreValue(currentMatch, "v_sfc1_5") }}</text>
                  </view>
                  <view class="bqc-item" @click="handleScoreToggle('sfc', '胜分差_客胜_6-10')" :class="[getScoreClass('sfc', '胜分差_客胜_6-10')]">
                    <text class="score-text">6-10</text>
                    <text class="score-odds">{{ getScoreValue(currentMatch, "v_sfc6_10") }}</text>
                  </view>
                  <view class="bqc-item" @click="handleScoreToggle('sfc', '胜分差_客胜_11-15')" :class="[getScoreClass('sfc', '胜分差_客胜_11-15')]">
                    <text class="score-text">11-15</text>
                    <text class="score-odds">{{ getScoreValue(currentMatch, "v_sfc11_15") }}</text>
                  </view>
                </view>
                <view class="bqc-row">
                  <view class="bqc-item" @click="handleScoreToggle('sfc', '胜分差_客胜_16-20')" :class="[getScoreClass('sfc', '胜分差_客胜_16-20')]">
                    <text class="score-text">16-20</text>
                    <text class="score-odds">{{ getScoreValue(currentMatch, "v_sfc16_20") }}</text>
                  </view>
                  <view class="bqc-item" @click="handleScoreToggle('sfc', '胜分差_客胜_21-25')" :class="[getScoreClass('sfc', '胜分差_客胜_21-25')]">
                    <text class="score-text">21-25</text>
                    <text class="score-odds">{{ getScoreValue(currentMatch, "v_sfc21_25") }}</text>
                  </view>
                  <view class="bqc-item" @click="handleScoreToggle('sfc', '胜分差_客胜_26+')" :class="[getScoreClass('sfc', '胜分差_客胜_26+')]">
                    <text class="score-text">26+</text>
                    <text class="score-odds">{{ getScoreValue(currentMatch, "v_sfc26_jia") }}</text>
                  </view>
                </view>
              </view>
              <view class="bqc-tip">{{ currentMatch.visiting_name }}(客)胜</view>
            </view>
          </view>

          <!-- 4.2 主胜分差（独立竖排） -->
          <view class="score-section">
            <view class="section-label bqc-label">胜分差</view>
            <view class="bqc-container single-column">
              <view class="bqc-options">
                <view class="bqc-row">
                  <view class="bqc-item" @click="handleScoreToggle('sfc', '胜分差_主胜_1-5')" :class="[getScoreClass('sfc', '胜分差_主胜_1-5')]">
                    <text class="score-text">1-5</text>
                    <text class="score-odds">{{ getScoreValue(currentMatch, "h_sfc1_5") }}</text>
                  </view>
                  <view class="bqc-item" @click="handleScoreToggle('sfc', '胜分差_主胜_6-10')" :class="[getScoreClass('sfc', '胜分差_主胜_6-10')]">
                    <text class="score-text">6-10</text>
                    <text class="score-odds">{{ getScoreValue(currentMatch, "h_sfc6_10") }}</text>
                  </view>
                  <view class="bqc-item" @click="handleScoreToggle('sfc', '胜分差_主胜_11-15')" :class="[getScoreClass('sfc', '胜分差_主胜_11-15')]">
                    <text class="score-text">11-15</text>
                    <text class="score-odds">{{ getScoreValue(currentMatch, "h_sfc11_15") }}</text>
                  </view>
                </view>
                <view class="bqc-row">
                  <view class="bqc-item" @click="handleScoreToggle('sfc', '胜分差_主胜_16-20')" :class="[getScoreClass('sfc', '胜分差_主胜_16-20')]">
                    <text class="score-text">16-20</text>
                    <text class="score-odds">{{ getScoreValue(currentMatch, "h_sfc16_20") }}</text>
                  </view>
                  <view class="bqc-item" @click="handleScoreToggle('sfc', '胜分差_主胜_21-25')" :class="[getScoreClass('sfc', '胜分差_主胜_21-25')]">
                    <text class="score-text">21-25</text>
                    <text class="score-odds">{{ getScoreValue(currentMatch, "h_sfc21_25") }}</text>
                  </view>
                  <view class="bqc-item" @click="handleScoreToggle('sfc', '胜分差_主胜_26+')" :class="[getScoreClass('sfc', '胜分差_主胜_26+')]">
                    <text class="score-text">26+</text>
                    <text class="score-odds">{{ getScoreValue(currentMatch, "h_sfc26_jia") }}</text>
                  </view>
                </view>
              </view>
              <view class="bqc-tip">{{ currentMatch.home_name }}(主)胜</view>
            </view>
          </view>
        </view>
        <!-- 底部按钮栏 -->
        <view class="popup-btn-bar">
          <button class="cancel-btn" @click="closePopup" hover-class="none">取消</button>
          <button class="confirm-btn" @click="confirmSelection" hover-class="none" :disabled="currentMatch.is_stop == 1">确定</button>
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
      default: function () {
        return [];
      },
    },
    statusBarHeight: { type: Number, default: 0 },
    goToAiAnalysis: { type: Function, required: true },
    drawerList: {
      type: Array,
      default: function () {
        return [];
      },
    },
  },
  data() {
    return {
      isPopupShow: false,
      currentMatch: {
        r_goal: -1,
        is_stop: 0,
        selectedSpf: [],
        selectedDx: [],
        selectedSfc: [],
        dxf_d_multiplier: "",
        dxf_x_multiplier: "",
        dxf_goal: 0,
        h_sfc1_5: "",
        h_sfc6_10: "",
        h_sfc11_15: "",
        h_sfc16_20: "",
        h_sfc21_25: "",
        h_sfc26_jia: "",
        v_sfc1_5: "",
        v_sfc6_10: "",
        v_sfc11_15: "",
        v_sfc16_20: "",
        v_sfc21_25: "",
        v_sfc26_jia: "",
      },
      // 适配篮球玩法：spf(胜负/让分)、dx(大小分)、sfc(胜分差)
      selectedScores: { spf: [], rspf: [], dx: [], sfc: [] },
      MAX_SELECT_COUNT: 10,
      MAX_MATCH_COUNT: 8,
      isLoading: false,
      expandedDrawers: [],
      statusBarHeightRpx: 0,
      windowWidth: 0,
      // 核心修改：适配首页的篮球玩法映射
      spfMapping: {
        胜负_主胜: "home_win",
        胜负_客胜: "home_lose",
        让分_主胜: "home_win_r",
        让分_客胜: "home_lose_r",
      },
      dxMapping: {
        大小分_大: "dxf_d_multiplier",
        大小分_小: "dxf_x_multiplier",
      },
      sfcMapping: {
        "胜分差_主胜_1-5": "h_sfc1_5",
        "胜分差_主胜_6-10": "h_sfc6_10",
        "胜分差_主胜_11-15": "h_sfc11_15",
        "胜分差_主胜_16-20": "h_sfc16_20",
        "胜分差_主胜_21-25": "h_sfc21_25",
        "胜分差_主胜_26+": "h_sfc26_jia",
        "胜分差_客胜_1-5": "v_sfc1_5",
        "胜分差_客胜_6-10": "v_sfc6_10",
        "胜分差_客胜_11-15": "v_sfc11_15",
        "胜分差_客胜_16-20": "v_sfc16_20",
        "胜分差_客胜_21-25": "v_sfc21_25",
        "胜分差_客胜_26+": "v_sfc26_jia",
      },
      reverseSpfMapping: {
        home_win: "胜负_主胜",
        home_lose: "胜负_客胜",
        home_win_r: "让分_主胜",
        home_lose_r: "让分_客胜",
      },
    };
  },
  computed: {
    finalDrawerList() {
      if (this.drawerList.length > 0) {
        return this.drawerList;
      } else {
        if (this.matchList.length > 0) {
          return [{ title: "周四 2025-12-04 共" + this.matchList.length + "场比赛", lotteryList: this.matchList }];
        } else {
          return [];
        }
      }
    },
    selectedMatchCount() {
      var count = 0;
      this.finalDrawerList.forEach(function (drawer) {
        drawer.lotteryList.forEach(function (item) {
          var hasSpf = item.selectedSpf && item.selectedSpf.length > 0;
          var hasDx = item.selectedDx && item.selectedDx.length > 0;
          var hasSfc = item.selectedSfc && item.selectedSfc.length > 0;
          if (hasSpf || hasDx || hasSfc) {
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
      return this.statusBarHeightRpx + 88 - 10;
    },
  },
  watch: {
    finalDrawerList(newVal) {
      this.expandedDrawers = [];
      for (var i = 0; i < newVal.length; i++) {
        this.expandedDrawers.push(true);
      }
      newVal.forEach(
        function (drawer) {
          drawer.lotteryList.forEach(
            function (item) {
              // 初始化篮球玩法选中数组
              if (!item.selectedSpf) {
                this.$set(item, "selectedSpf", []);
              }
              if (!item.selectedDx) {
                this.$set(item, "selectedDx", []);
              }
              if (!item.selectedSfc) {
                this.$set(item, "selectedSfc", []);
              }
            }.bind(this)
          );
        }.bind(this)
      );
    },
    statusBarHeight(newVal) {
      this.statusBarHeightRpx = this.pxToRpx(newVal);
    },
  },
  created() {
    this.initWindowInfo();
    this.statusBarHeightRpx = this.pxToRpx(this.statusBarHeight);
    this.expandedDrawers = [];
    for (var i = 0; i < this.finalDrawerList.length; i++) {
      this.expandedDrawers.push(true);
    }
    this.finalDrawerList.forEach(
      function (drawer) {
        drawer.lotteryList.forEach(
          function (item) {
            if (!item.selectedSpf) {
              this.$set(item, "selectedSpf", []);
            }
            if (!item.selectedDx) {
              this.$set(item, "selectedDx", []);
            }
            if (!item.selectedSfc) {
              this.$set(item, "selectedSfc", []);
            }
          }.bind(this)
        );
      }.bind(this)
    );
  },
  methods: {
    // 新增方法：判断让球数值颜色类
    getHandicapColorClass(value) {
      var num = Number(value || 0);
      if (num < 0) return "negative";
      if (num > 0) return "positive";
      return "";
    },
    // 兼容版取值方法（简化：去掉parentKey）
    getScoreValue(obj, key) {
      if (obj && obj[key] !== undefined && obj[key] !== null) {
        return obj[key];
      } else {
        return "--";
      }
    },
    // 检查列表选中状态
    checkSelected(arr, val) {
      if (!arr || arr.length === 0) {
        return false;
      }
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] === val) {
          return true;
        }
      }
      return false;
    },
    initWindowInfo() {
      try {
        var systemInfo = wx.getWindowInfo();
        this.windowWidth = systemInfo.windowWidth || 375;
      } catch (e) {
        this.windowWidth = 375;
        console.warn("获取窗口信息失败:", e);
      }
    },
    pxToRpx(px) {
      if (!px || !this.windowWidth) {
        return 0;
      } else {
        return Math.round((px / this.windowWidth) * 750 + 0.5);
      }
    },
    toggleDrawer(drawerIdx) {
      this.$set(this.expandedDrawers, drawerIdx, !this.expandedDrawers[drawerIdx]);
    },
    // 胜负/让分选中事件（适配篮球）
    handleSpfMultiClick(item, spfType) {
      if (item.is_stop == 1) {
        uni.showToast({ title: "该场次已停售", icon: "none" });
        return;
      }
      // 胜负类型赔率判断
      var isSpfType = ["home_win", "home_lose"].indexOf(spfType) > -1;
      if (isSpfType) {
        var multiplierKey = {
          home_win: "win_multiplier",
          home_lose: "loss_multiplier",
        }[spfType];
        if (!item[multiplierKey]) {
          uni.showToast({ title: "该选项暂无赔率", icon: "none" });
          return;
        }
      }
      var isSelected = this.checkSelected(item.selectedSpf, spfType);
      if (!isSelected) {
        var currentSelected = (item.selectedSpf && item.selectedSpf.length > 0) || (item.selectedDx && item.selectedDx.length > 0) || (item.selectedSfc && item.selectedSfc.length > 0);
        item.selectedSpf.push(spfType);
      } else {
        var newArr = [];
        for (var i = 0; i < item.selectedSpf.length; i++) {
          if (item.selectedSpf[i] !== spfType) {
            newArr.push(item.selectedSpf[i]);
          }
        }
        item.selectedSpf = newArr;
      }
      this.$emit("toggle-spf-multi-select", item);
    },
    // 获取选中样式（适配篮球玩法）
    getScoreClass(plate, value, multiplier) {
      // 1. 基础选中/禁用判断（和原有逻辑一致）
      const targetArr = this.selectedScores && this.selectedScores[plate] ? this.selectedScores[plate] : [];
      let isDisabled = this.currentMatch && this.currentMatch.is_stop === 1;
      // 胜负板块额外校验赔率是否存在
      if (plate === "spf" && (multiplier === undefined || multiplier === null || multiplier === "")) {
        isDisabled = true;
      }
      const isSelected = this.checkSelected(targetArr, value);

      // 2. 核心修改：返回字符串（对齐getStatusClass写法，小程序兼容）
      let classStr = "";
      if (isSelected) classStr += "selected "; // 选中样式
      if (isDisabled) classStr += "disabled"; // 禁用样式

      // 3. 去除多余空格，返回纯字符串
      return classStr.trim();
    },
    // 核心修改：篮球玩法选中切换（适配胜负/让分/大小分/胜分差）
    handleScoreToggle(plate, value) {
      if (this.isLoading || this.currentMatch.is_stop == 1) {
        uni.showToast({ title: "操作不可用", icon: "none" });
        return;
      }
      // 胜负赔率判断
      if (plate === "spf") {
        var multiplierKey = {
          胜负_主胜: "win_multiplier",
          胜负_客胜: "loss_multiplier",
        }[value];
        if (!this.currentMatch[multiplierKey]) {
          uni.showToast({ title: "该选项暂无赔率", icon: "none" });
          return;
        }
      }
      // 新增：大小分赔率判断
      if (plate === "dx") {
        var multiplierKey = this.dxMapping[value];
        if (!this.currentMatch[multiplierKey]) {
          uni.showToast({ title: "该选项暂无赔率", icon: "none" });
          return;
        }
      }
      // 确保数组存在
      if (!this.selectedScores[plate]) {
        this.$set(this.selectedScores, plate, []);
      }
      var current = this.selectedScores[plate];
      var isSelected = this.checkSelected(current, value);
      if (!isSelected) {
        // if (current.length >= this.MAX_SELECT_COUNT) {
        //   uni.showToast({ title: '最多选' + this.MAX_SELECT_COUNT + '个', icon: 'none' });
        //   return;
        // }
        current.push(value);
      } else {
        var newArr = [];
        for (var i = 0; i < current.length; i++) {
          if (current[i] !== value) {
            newArr.push(current[i]);
          }
        }
        this.$set(this.selectedScores, plate, newArr);
      }
    },
    // 打开弹框（初始化篮球玩法选中状态）
    openScorePopup(match) {
      if (match.is_stop == 1) {
        return;
      }
      // 深拷贝避免修改原数据
      this.currentMatch = JSON.parse(JSON.stringify(match));
      this.isLoading = false; // 无需加载，直接设为false
      this.isPopupShow = true;

      // 初始化选中状态（适配篮球玩法）
      var initSpf = [];
      var initRspf = [];
      if (match.selectedSpf) {
        match.selectedSpf.forEach(
          function (val) {
            var key = this.reverseSpfMapping[val];
            if (key) {
              if (key.indexOf("胜负_") === 0) {
                initSpf.push(key);
              } else {
                initRspf.push(key);
              }
            }
          }.bind(this)
        );
      }

      // 初始化所有篮球玩法选中状态
      this.selectedScores = {
        spf: initSpf,
        rspf: initRspf,
        dx: match.selectedDx ? match.selectedDx.concat() : [],
        sfc: match.selectedSfc ? match.selectedSfc.concat() : [],
      };
    },
    // 核心修改：确认选中（适配首页的篮球玩法映射）
    confirmSelection() {
      if (!this.currentMatch || this.isLoading || this.currentMatch.is_stop == 1) return;
      this.finalDrawerList.forEach(
        function (drawer) {
          drawer.lotteryList.forEach(
            function (item) {
              if (item.serial_number === this.currentMatch.serial_number) {
                // 1. 保存大小分选中状态
                this.$set(item, "selectedDx", this.selectedScores.dx.concat());
                // 2. 保存胜分差选中状态
                this.$set(item, "selectedSfc", this.selectedScores.sfc.concat());

                // 3. 转换并保存胜负/让分选中状态（对齐首页映射）
                var spfList = [];
                if (this.selectedScores.spf) {
                  for (var i = 0; i < this.selectedScores.spf.length; i++) {
                    var val = this.spfMapping[this.selectedScores.spf[i]];
                    if (val) {
                      spfList.push(val);
                    }
                  }
                }
                if (this.selectedScores.rspf) {
                  for (var j = 0; j < this.selectedScores.rspf.length; j++) {
                    var val2 = this.spfMapping[this.selectedScores.rspf[j]];
                    if (val2) {
                      spfList.push(val2);
                    }
                  }
                }
                this.$set(item, "selectedSpf", spfList);
              }
            }.bind(this)
          );
        }.bind(this)
      );
      // 触发父组件事件（对齐首页的handleHhggMultiSelect）
      this.$emit("toggle-multi-select", {
        serialNumber: this.currentMatch.serial_number,
        selectedData: JSON.parse(JSON.stringify(this.selectedScores)),
      });
      this.closePopup();
      uni.showToast({ title: "选择成功", icon: "success" });
    },
    closePopup() {
      this.isPopupShow = false;
      this.selectedScores = { spf: [], rspf: [], dx: [], sfc: [] };
    },
  },
};
</script>
<style scoped lang="scss">
// 原有样式保持不变，新增大小分提示样式
.zjq-tip {
  font-size: 20rpx;
  color: #999;
  padding: 8rpx 12rpx;
  background: #f5f5f5;
  border-top: 1rpx solid #eee;
  text-align: center;
  width: 100%;
}

// 新增胜分差容器样式（单列独立版）
.bqc-container {
  flex: 1;
  display: flex;
  width: 100%;

  &.single-column {
    flex-direction: column; // 独立竖排使用列布局
  }
}

// 移除原有双列布局样式，保留单列样式
.bqc-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1rpx solid #eee;

  &:last-child {
    border-right: none;
  }
}

.bqc-tip {
  font-size: 20rpx;
  color: #999;
  padding: 8rpx 12rpx;
  background: #f5f5f5;
  border-top: 1rpx solid #eee;
  text-align: center;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// 调整大小分容器样式
.zjq-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

// 其他原有样式不变
* {
  box-sizing: border-box;
}

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
  z-index: 999;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8rpx 20rpx 12rpx;
  background-color: #f5f5f5;
  border-bottom: 1rpx solid #eee;
  font-size: 26rpx;
  color: #333;

  .drawer-title-text {
    font-size: 24rpx;
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

.match-row {
  background-color: #f6f6f6;
  border-bottom: 1rpx solid #dedede;
  box-sizing: border-box;
  padding: 0 20rpx;
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 4rpx;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.05);
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

.main-content-row {
  display: flex;
  width: 100%;
  gap: 16rpx;
  padding: 8rpx 0;
  overflow: hidden;
  box-sizing: border-box;
}

.main-left {
  width: 160rpx;
  display: flex;
  flex-direction: column;
  flex: none;
  gap: 8rpx;

  .top-left {
    margin-top: 8rpx;
    display: flex;
    justify-content: center;
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

  .bottom-left {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2rpx;
    width: 100%;
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
}

.main-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  background: #fff;
  overflow: hidden;
  box-sizing: border-box;
}

.top-right-layout {
  display: flex;
  width: 100%;
  border-bottom: 1rpx solid #eee;
  padding-bottom: 8rpx;

  .handicap-col {
    width: 40rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-right: 1rpx solid #eee;

    .handicap-text {
      font-size: 22rpx;
      color: #666;
      line-height: 1.2;
    }
  }

  .team-rate-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    padding: 0 10rpx;

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

    .rate-row {
      width: 100%;
      display: flex;
      align-items: center;
      font-size: 22rpx;
      color: #999;
      justify-content: center;

      .rate-text {
        flex: 1;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .vs-text {
        width: 140rpx;
      }
    }
  }
}

.bottom-right-layout {
  color: #666;
  display: flex;
  width: 100%;
  align-items: stretch;

  .handicap-value-col {
    width: 60rpx;
    display: flex;
    flex-direction: column;
    border-right: 1rpx solid #eee;

    .handicap-value-item {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e8e8e8;
      font-size: 24rpx;
      color: #666;

      &:first-child {
        border-radius: 4rpx 0 0 0;
        border-bottom: 1rpx solid #fff;
      }

      &:last-child {
        border-radius: 0 0 0 4rpx;
      }

      &.positive {
        color: red;
      }

      &.negative {
        color: green;
      }
    }
  }

  .spf-select-col {
    flex: 1;
    display: flex;
    flex-direction: column;

    .spf-row {
      flex: 1;
      display: flex;

      .spf-btn {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 10rpx;
        background: #e8e8e8;
        font-size: 22rpx;
        color: #666;
        cursor: pointer;

        &:first-child {
          border-right: 1rpx solid #fff;
        }

        &:last-child {
          border-left: 1rpx solid #fff;
        }

        &.selected {
          background: #d92929;
          color: #fff;
        }

        &.disabled {
          background: #cccccc !important;
          color: #999999 !important;
          cursor: not-allowed;
          pointer-events: none;
        }

        .spf-text {
          flex: 1;
          text-align: left;
        }

        .spf-odds {
          flex: 0 0 auto;
          margin-left: 8rpx;
          font-size: 20rpx;
        }
      }

      &:first-child {
        border-bottom: 1rpx solid #fff;
        border-radius: 0 4rpx 0 0;
      }

      &:last-child {
        border-radius: 0 0 4rpx 0;
      }
    }
  }

  .expand-btn-col {
    background: #feeedf;
    width: 80rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-left: 1rpx solid #eee;
    cursor: pointer;

    .expand-text {
      font-size: 22rpx;
      color: #999;
      margin-bottom: 5rpx;
    }

    .expand-more {
      font-size: 20rpx;
      color: #999;
    }
  }
}

.score-popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999999;
  touch-action: none; // 禁止遮罩滑动穿透
}

.score-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 85%;
  max-height: 75vh;
  height: 75vh; // 与max-height一致，让flex布局生效
  background: #fff;
  border-radius: 12rpx;
  z-index: 9999999;
  box-sizing: border-box;
  // 核心修复：声明flex列布局，约束子元素
  display: flex;
  flex-direction: column;
  overflow: hidden; // 禁止弹窗整体滚动！！！
  padding: 0; // 去掉主容器padding，由子容器自己控制
}
// 弹窗内容容器 - 仅保留必要属性
.popup-content-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1; // 占满弹窗剩余高度
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}
.popup-header {
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
  flex-shrink: 0; // 核心：不被flex压缩，固定高度
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

// 第一行：队名VS队名
.popup-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  text-align: center;
  padding: 8rpx 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  // 停售标签
  .popup-stop-tag {
    display: inline-block;
    font-size: 22rpx;
    color: #fff;
    background: #999;
    border-radius: 4rpx;
    padding: 2rpx 8rpx;
    margin-left: 12rpx;
    vertical-align: middle;
    line-height: 1;
  }
}

// 胜/平/负率 样式（第二行）
.match-stat-info.stat-spf {
  display: flex;
  justify-content: center;
  gap: 30rpx;
  font-size: 24rpx;
  color: #666;
}

// 预测比分 样式（第三行 - 单独居中【核心】）
.match-stat-info.stat-score {
  display: flex;
  justify-content: center;
  font-size: 24rpx;
  color: #666;
}

// 统计项通用样式
.stat-item {
  display: flex;
  align-items: center;
}
.stat-label {
  margin-right: 4rpx;
  color: #888;
}
.stat-value {
  color: #666;
}

// 中间滚动区域 - 仅这里可滚动
.popup-scroll-content {
  flex: 1; // 占满剩余空间
  overflow-y: auto; // 垂直滚动
  -webkit-overflow-scrolling: touch; // 小程序弹性滚动
  padding: 0 20rpx;
  // 隐藏所有内核滚动条
  scrollbar-width: none; // 火狐
  -ms-overflow-style: none; // IE/Edge
  ::-webkit-scrollbar {
    display: none; // 微信小程序内核
  }
}
.popup-loading {
  padding: 40rpx 0;
  text-align: center;
  font-size: 26rpx;
  color: #999;
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

.bifen-label {
  background: #6fbdbd;
}
.spf-label {
  background: #6fbdbd;
}
.rspf-label {
  background: #6ab284;
}
.zjq-label {
  background: #6ab284;
}
.bqc-label {
  background: #6fbdbd;
}

.bifen-options {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.bifen-row {
  display: flex;
  width: 100%;
  border-bottom: 1rpx solid #eee;

  &:last-child {
    border-bottom: none;
  }
}

.bifen-item {
  flex: 1;
  box-sizing: border-box;
  padding: 12rpx 0;
  background: #f9f9f9;
  border: 1rpx solid #eee;
  text-align: center;
  cursor: pointer;
  color: #999;
  transition: all 0.2s ease;

  .score-text {
    font-size: 22rpx;
    display: block;
  }

  .score-odds {
    font-size: 18rpx;
  }

  &.selected {
    background: #d92929;
    color: #fff !important;
  }

  &.disabled {
    background: #ccc !important;
    color: #999 !important;
    cursor: not-allowed;
    pointer-events: none;
  }
}

.bifen-other {
  flex: 3;
  background: #f8f8f8;
}

.spf-options {
  flex: 1;
  display: flex;
}

.spf-item {
  flex: 1;
  box-sizing: border-box;
  padding: 12rpx 0;
  background: #f9f9f9;
  border: 1rpx solid #eee;
  text-align: center;
  cursor: pointer;
  color: #999;
  transition: all 0.2s ease;

  .score-text {
    font-size: 22rpx;
    display: block;
  }

  .score-odds {
    font-size: 18rpx;
  }

  &.selected {
    background: #d92929;
    color: #fff !important;
  }

  &.disabled {
    background: #ccc !important;
    color: #999 !important;
    cursor: not-allowed;
    pointer-events: none;
  }
}

.rspf-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.rspf-options {
  display: flex;
  width: 100%;
}

.rspf-item {
  flex: 1;
  box-sizing: border-box;
  padding: 12rpx 0;
  background: #f9f9f9;
  border: 1rpx solid #eee;
  text-align: center;
  cursor: pointer;
  color: #999;
  transition: all 0.2s ease;

  .score-text {
    font-size: 22rpx;
    display: block;
  }

  .score-odds {
    font-size: 18rpx;
  }

  &.selected {
    background: #d92929;
    color: #fff !important;
  }

  &.disabled {
    background: #ccc !important;
    color: #999 !important;
    cursor: not-allowed;
    pointer-events: none;
  }
}

.rspf-tip {
  font-size: 20rpx;
  color: #999;
  padding: 8rpx 12rpx;
  background: #f5f5f5;
  border-top: 1rpx solid #eee;
  text-align: center;
}

.zjq-options {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
}

.zjq-item {
  width: 50%;
  box-sizing: border-box;
  padding: 12rpx 0;
  background: #f9f9f9;
  border: 1rpx solid #eee;
  text-align: center;
  cursor: pointer;
  color: #999;
  transition: all 0.2s ease;

  .score-text {
    font-size: 22rpx;
    display: block;
  }

  .score-odds {
    font-size: 18rpx;
  }

  &:first-child {
    border-right: none;
  }

  &.selected {
    background: #d92929;
    color: #fff !important;
  }

  &.disabled {
    background: #ccc !important;
    color: #999 !important;
    cursor: not-allowed;
    pointer-events: none;
  }
}

// 胜分差容器（单列独立版）
.bqc-container {
  flex: 1;
  display: flex;
  width: 100%;
  flex-direction: column; // 独立竖排使用列布局
}

// 胜分差选项容器
.bqc-options {
  flex: 1;
  display: flex;
  flex-direction: column; // 保持列布局，每个bqc-row是一行
}

// 胜分差行 - 每行3个选项
.bqc-row {
  width: 100%;
  display: flex; // 横向排列3个item
  border-bottom: 1rpx solid #eee;

  &:last-child {
    border-bottom: none;
  }
}

// 胜分差选项项 - 完全匹配原型图
.bqc-item {
  flex: 1; // 一行3个，每个占1/3宽度
  box-sizing: border-box;
  padding: 12rpx 0;
  background: #fff;
  border-right: 1rpx solid #eee;
  text-align: center;
  cursor: pointer;
  color: #999;
  transition: all 0.2s ease;

  // 去掉最后一个的右边框
  &:last-child {
    border-right: none;
  }

  .score-text {
    font-size: 24rpx;
    display: block;
    margin-bottom: 4rpx;
    font-weight: 500;
  }

  .score-odds {
    font-size: 22rpx;
    color: #999;
  }

  &.selected {
    background: #d92929;
    color: #fff !important;

    .score-odds {
      color: #fff;
    }
  }

  &.disabled {
    background: #ccc !important;
    color: #999 !important;
    cursor: not-allowed;
    pointer-events: none;
  }
}

// 胜分差底部提示文字
.bqc-tip {
  font-size: 22rpx;
  color: #999;
  padding: 12rpx 0;
  background: #f5f5f5;
  text-align: center;
  width: 100%;
  font-weight: 500;
  border-top: 1rpx solid #eee;
}
// 弹窗底部按钮栏【足球原版】
.popup-btn-bar {
  display: flex;
  gap: 8rpx;
  padding: 12rpx 20rpx 20rpx;
  flex-shrink: 0; // 核心：固定不滚动
  margin-top: 0;
}
.cancel-btn {
  flex: 1;
  height: 60rpx;
  line-height: 60rpx;
  background: #f5f5f5;
  color: #333;
  border-radius: 8rpx;
  font-size: 26rpx;
  border: none;
}
.confirm-btn {
  flex: 1;
  height: 60rpx;
  line-height: 60rpx;
  background: #d92929;
  color: #fff;
  border-radius: 8rpx;
  font-size: 26rpx;
  border: none;
  &[disabled] {
    background: #ccc !important;
    color: #999 !important;
  }
}

// 通用兼容【足球原版】
button::after {
  border: none;
}
/* #ifdef APP-PLUS */
.popup-btn-bar {
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}
/* #endif */
::-webkit-scrollbar {
  display: none;
}
</style>
