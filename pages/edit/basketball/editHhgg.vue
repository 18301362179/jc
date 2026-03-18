<template>
  <!-- 篮球混合过关编辑页：按玩法分行展示投注项 -->
  <view class="scheme-edit-page">
    <CustomHeader :ballTitle="'篮球'" title="混合过关" :showBack="true" :showIcon="false" @back-click="handleBack" />

    <!-- 核心修改：参考足球页面，统一scroll-view样式和高度计算 -->
    <scroll-view
      class="match-scroll"
      scroll-y
      :style="{
        top: headerTotalHeight + 'px',
        bottom: betBarTotalHeight + 'px',
      }"
    >
      <view class="match-list">
        <view class="empty-tip" v-if="selectedMatchList.length === 0">暂无</view>

        <!-- 混合过关赛事行：按玩法分行展示 -->
        <view v-for="(item, index) in selectedMatchList" :key="index" class="match-row">
          <!-- 上排：编号 + 队名VS队名 -->
          <view class="match-header">
            <text class="serial-number">{{ item.serial_number }}</text>
            <text class="team-name"> {{ item.home_name }} <span class="vs-text">VS</span> {{ item.visiting_name }} </text>
          </view>

          <!-- 核心修改：按玩法单独分行展示 -->
          <view class="selected-content">
            <!-- 1. 胜负行 -->
            <view class="bet-item" v-if="getBetItem('spf', item)">
              <text class="bet-label">胜负：</text>
              <text class="bet-value highlight">{{ getBetItem("spf", item) }}</text>
            </view>
            <!-- 2. 让分胜负行 -->
            <view class="bet-item" v-if="getBetItem('rspf', item)">
              <text class="bet-label">让分胜负：</text>
              <text class="bet-value highlight">{{ getBetItem("rspf", item) }}</text>
            </view>
            <!-- 3. 大小分行 -->
            <view class="bet-item" v-if="getBetItem('dx', item)">
              <text class="bet-label">大小分：</text>
              <text class="bet-value highlight">{{ getBetItem("dx", item) }}</text>
            </view>
            <!-- 4. 胜分差（客胜）行 -->
            <view class="bet-item" v-if="getBetItem('sfc_away', item)">
              <text class="bet-label">胜分差（客胜）：</text>
              <text class="bet-value highlight">{{ getBetItem("sfc_away", item) }}</text>
            </view>
            <!-- 5. 胜分差（主胜）行 -->
            <view class="bet-item" v-if="getBetItem('sfc_home', item)">
              <text class="bet-label">胜分差（主胜）：</text>
              <text class="bet-value highlight">{{ getBetItem("sfc_home", item) }}</text>
            </view>
            <!-- 无任何投注项时显示 -->
            <view v-if="!hasAnyBetItem(item)" class="empty-bet">
              <text class="trigger-tip">无选中投注内容</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- <view class="bet-bar" v-if="isShowStatus" :style="{ 
      height: betBarFixedPx + 'px',
      paddingBottom: (isApp ? safeAreaBottom : 0) + 'px' 
    }">
<view class="bet-bar-top">
  <view class="top-left">
    {{selectedMatchList.length == 1 ? '单关': selectedMatchList.length + '串1'}}
  </view>
  <view class="collapse-area">
    <view class="multi-group">
      <button class="multi-btn minus" @click="handleMinus"><text>-</text></button>
      <view 
        class="multi-input" 
        @tap="showNumberKeyboard = true"
        :class="{ 'disabled': selectedMatchCount < 1 }"
      >
        {{ betCount }}
      </view>
      <button class="multi-btn plus" @click="handlePlus"><text>+</text></button>
      <text class="multi-unit">倍</text>
    </view>
  </view>
</view>
      <view class="bet-bar-bottom">
        <view class="bottom-middle">
          <text class="select-tip">共{{betNotes}}注 {{betCount}}倍  {{totalBetAmount}}元</text>
          <text class="bonus-tip">{{calculateBonusText()}}</text>
        </view>
      </view>
    </view> -->

    <!-- 手机号弹窗：保留原逻辑 -->
    <view class="phone-modal" v-if="showPhoneModal">
      <view class="modal-mask" @click="showPhoneModal = false" hover-class="none"></view>
      <view class="modal-content">
        <view class="modal-desc">业务人员通过微信与您联系确认购买及打印彩票后给您发送图片留作兑奖凭证等后续流程</view>
        <view class="input-wrap">
          <label>微信手机号：</label>
          <input type="number" v-model="userPhone" placeholder="请输入手机号（必填）" maxlength="11" />
        </view>
        <view class="modal-btns">
          <button class="cancel-btn" @click="showPhoneModal = false" hover-class="none">取消</button>
          <button class="confirm-btn" @click="confirmPhone" hover-class="none">提交</button>
        </view>
      </view>
    </view>

    <UniNumberKeyboard :show.sync="showNumberKeyboard" :value="betCount + ''" :allowDot="false" confirm-text="确认" :min="1" :max="50" @input="handleKeyboardInput" @confirm="handleKeyboardConfirm" />
  </view>
</template>

<script>
import CustomHeader from "@/components/CustomHeader.vue";
import { purchasingLotteryApply } from "@/api/demo";
import { validateBetInput } from "@/utils/validate";

export default {
  components: { CustomHeader },
  data() {
    return {
      selectedMatchList: [], // 接收混合过关选中的赛事
      betCount: 1,
      isPayLoading: false,
      isNeedUserPhone: 1,
      showPhoneModal: false,
      userPhone: "",
      isSubmitSuccess: false,
      statusBarHeight: 0,
      safeAreaBottom: 0,
      headerTotalHeight: 0,
      betBarFixedPx: 0,
      betBarTotalHeight: 0,
      isApp: false,
      isMp: false,
      selectedCombo: "",
      showNumberKeyboard: false,
      // 玩法映射：转义中文展示
      spfMap: {
        home_win: "主胜",
        home_lose: "客胜",
      },
      rspfMap: {
        home_win_r: "让分主胜",
        home_lose_r: "让分客胜",
      },
      dxMap: {
        大小分_大: "大分",
        大小分_小: "小分",
      },
      isShowStatus: null,
    };
  },
  computed: {
    // 统计有选中投注项的赛事数量
    selectedMatchCount() {
      return this.selectedMatchList.filter((item) => this.hasAnyBetItem(item)).length;
    },
    // 计算总注数：所有赛事的选中项数量相乘
    betNotes() {
      if (this.selectedMatchCount === 0) return 0;
      return this.selectedMatchList.reduce((total, item) => {
        let itemCount = 0;
        // 统计当前赛事所有选中项数量
        if (item.selectedSpf) {
          // 区分胜负和让分胜负
          const spfCount = item.selectedSpf.filter((t) => ["home_win", "home_lose"].includes(t)).length;
          const rspfCount = item.selectedSpf.filter((t) => ["home_win_r", "home_lose_r"].includes(t)).length;
          itemCount += spfCount + rspfCount;
        }
        if (item.selectedDx && item.selectedDx.length > 0) itemCount += item.selectedDx.length;
        if (item.selectedSfc && item.selectedSfc.length > 0) itemCount += item.selectedSfc.length;
        return total * (itemCount > 0 ? itemCount : 1);
      }, 1);
    },
    // 总投注金额
    totalBetAmount() {
      return (this.betNotes * this.betCount * 2).toFixed(2);
    },
  },
  onShow() {
    uni.setTabBarStyle({ height: "0px" });
  },
  created() {
        this.$nextTick(()=>{
    this.isShowStatus = uni.getStorageSync('isShowStatus');
    
    })
    this.calcAllHeights();
  },
  onLoad() {
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.on("selectedData", (data) => {
        this.selectedMatchList = JSON.parse(JSON.stringify(data.matches || []));
        this.betCount = data.betCount || 1;
        this.isNeedUserPhone = data.isNeedUserPhone || 1;
        this.selectedCombo = data.combo || "";
      });
    }
  },
  onUnload() {
    if (!this.isSubmitSuccess) {
      this.saveEditedData();
    }
    uni.setTabBarStyle({ height: "auto" });
  },
  methods: {
    // 核心方法：判断是否有任何投注项
    hasAnyBetItem(item) {
      if (!item) return false;
      // 胜负
      const hasSpf = item.selectedSpf && item.selectedSpf.filter((t) => ["home_win", "home_lose"].includes(t)).length > 0;
      // 让分胜负
      const hasRspf = item.selectedSpf && item.selectedSpf.filter((t) => ["home_win_r", "home_lose_r"].includes(t)).length > 0;
      // 大小分
      const hasDx = item.selectedDx && item.selectedDx.length > 0;
      // 胜分差（主/客）
      const hasSfcHome = item.selectedSfc && item.selectedSfc.filter((t) => t.includes("主胜")).length > 0;
      const hasSfcAway = item.selectedSfc && item.selectedSfc.filter((t) => t.includes("客胜")).length > 0;
      return hasSpf || hasRspf || hasDx || hasSfcHome || hasSfcAway;
    },
    // 核心方法：获取单个玩法的展示文本
    getBetItem(type, item) {
      if (!item) return "";
      switch (type) {
        // 1. 胜负
        case "spf": {
          const spfItems = item.selectedSpf && item.selectedSpf.filter((t) => ["home_win", "home_lose"].includes(t)) ? item.selectedSpf.filter((t) => ["home_win", "home_lose"].includes(t)) : [];
          if (spfItems.length === 0) return "";
          // 转义为中文并拼接赔率
          return spfItems
            .map((t) => {
              const odds = t === "home_win" ? item.win_multiplier : item.loss_multiplier;
              return `${this.spfMap[t]}(${odds || "--"})`;
            })
            .join("、");
        }
        // 2. 让分胜负
        case "rspf": {
          const rspfItems = item.selectedSpf && item.selectedSpf.filter((t) => ["home_win_r", "home_lose_r"].includes(t)) ? item.selectedSpf.filter((t) => ["home_win_r", "home_lose_r"].includes(t)) : [];
          if (rspfItems.length === 0) return "";
          // 转义为中文并拼接赔率
          return rspfItems
            .map((t) => {
              const odds = t === "home_win_r" ? item.r_win_multiplier : item.r_loss_multiplier;
              return `${this.rspfMap[t]}(${odds || "--"})`;
            })
            .join("、");
        }
        // 3. 大小分
        case "dx": {
          const dxItems = item.selectedDx || [];
          if (dxItems.length === 0) return "";
          // 转义为中文并拼接赔率
          return dxItems
            .map((t) => {
              const odds = t === "大小分_大" ? item.dxf_d_multiplier : item.dxf_x_multiplier;
              return `${this.dxMap[t]}(${odds || "--"})`;
            })
            .join("、");
        }
        // 4. 胜分差（客胜）
        case "sfc_away": {
          const sfcAwayItems = item.selectedSfc && item.selectedSfc.filter((t) => t.includes("客胜")) ? item.selectedSfc.filter((t) => t.includes("客胜")) : [];
          if (sfcAwayItems.length === 0) return "";
          // 提取分差区间并拼接赔率
          return sfcAwayItems
            .map((t) => {
              const range = t.split("_").pop(); // 提取1-5、6-10等
              const oddsField = `v_sfc${range.replace("+", "_jia").replace("-", "_")}`; // 匹配字段名
              const odds = item[oddsField] || "--";
              return `${range}(${odds})`;
            })
            .join("、");
        }
        // 5. 胜分差（主胜）
        case "sfc_home": {
          const sfcHomeItems = item.selectedSfc && item.selectedSfc.filter((t) => t.includes("主胜")) ? item.selectedSfc.filter((t) => t.includes("主胜")) : [];
          if (sfcHomeItems.length === 0) return "";
          // 提取分差区间并拼接赔率
          return sfcHomeItems
            .map((t) => {
              const range = t.split("_").pop(); // 提取1-5、6-10等
              const oddsField = `h_sfc${range.replace("+", "_jia").replace("-", "_")}`; // 匹配字段名
              const odds = item[oddsField] || "--";
              return `${range}(${odds})`;
            })
            .join("、");
        }
        default:
          return "";
      }
    },
    // 处理软键盘输入
    handleKeyboardInput(val) {
      const num = parseInt(val) || 1;
      this.betCount = Math.min(Math.max(num, 1), 50);
    },
    // 确认软键盘输入
    handleKeyboardConfirm(val) {
      const num = parseInt(val) || 1;
      this.betCount = Math.min(Math.max(num, 1), 50);
      this.showNumberKeyboard = false;
    },
    // 计算高度
    calcAllHeights() {
      const sys = wx.getWindowInfo();
      // 1. 状态栏高度
      this.statusBarHeight = sys.statusBarHeight || 20;
      // 2. 底部安全区高度
      this.safeAreaBottom = (sys.safeAreaInsets && sys.safeAreaInsets.bottom) || 0;
      // 3. 导航栏固定高度（80rpx转px）
      const navBarFixedRpx = 80;
      const navBarFixedPx = (sys.screenWidth / 750) * navBarFixedRpx;
      // 4. 导航栏总高度
      this.headerTotalHeight = this.statusBarHeight + navBarFixedPx;
      // 5. 投注栏固定高度（200rpx转px）
      const betBarFixedRpx = 200;
      this.betBarFixedPx = (sys.screenWidth / 750) * betBarFixedRpx;
      // 6. 投注栏总高度（仅固定高度）
      this.betBarTotalHeight = this.betBarFixedPx;
    },
    // 保存数据
    saveEditedData() {
      const editedData = JSON.parse(
        JSON.stringify({
          matches: this.selectedMatchList,
          betCount: this.betCount,
        })
      );
      uni.setStorageSync("editedMatchData", JSON.stringify(editedData));
    },
    // 奖金计算
    calculateBonusText() {
      if (this.selectedMatchCount === 0) return "预计奖金：0.00 元";
      const matchOddsList = [];

      this.selectedMatchList.forEach((item) => {
        const allOdds = [];
        // 1. 胜负赔率
        if (item.selectedSpf) {
          item.selectedSpf.forEach((t) => {
            let odds = "--";
            switch (t) {
              case "home_win":
                odds = item.win_multiplier;
                break;
              case "home_lose":
                odds = item.loss_multiplier;
                break;
              case "home_win_r":
                odds = item.r_win_multiplier;
                break;
              case "home_lose_r":
                odds = item.r_loss_multiplier;
                break;
            }
            const numOdds = Number(odds);
            if (!isNaN(numOdds) && numOdds > 0) allOdds.push(numOdds);
          });
        }
        // 2. 大小分赔率
        if (item.selectedDx) {
          item.selectedDx.forEach((t) => {
            let odds = t === "大小分_大" ? item.dxf_d_multiplier : item.dxf_x_multiplier;
            const numOdds = Number(odds);
            if (!isNaN(numOdds) && numOdds > 0) allOdds.push(numOdds);
          });
        }
        // 3. 胜分差赔率
        if (item.selectedSfc) {
          item.selectedSfc.forEach((t) => {
            let odds = "--";
            const splitArr = t.split("_");
            const type = splitArr[1] || "";
            const range = splitArr[2] || "";
            const isHome = type === "主胜";
            const oddsField = isHome ? `h_sfc${range.replace("+", "_jia").replace("-", "_")}` : `v_sfc${range.replace("+", "_jia").replace("-", "_")}`;
            odds = item[oddsField];
            const numOdds = Number(odds);
            if (!isNaN(numOdds) && numOdds > 0) allOdds.push(numOdds);
          });
        }
        if (allOdds.length > 0) {
          matchOddsList.push({
            min: Math.min(...allOdds),
            max: Math.max(...allOdds),
          });
        }
      });

      if (matchOddsList.length === 0) return "预计奖金：0.00 元";
      let totalMin = 1,
        totalMax = 1;
      matchOddsList.forEach(({ min, max }) => {
        totalMin *= min;
        totalMax *= max;
      });
      const base = this.betNotes * this.betCount * 2;
      const minBonus = (totalMin * base).toFixed(2);
      const maxBonus = (totalMax * base).toFixed(2);
      return `预计奖金：${minBonus} ~ ${maxBonus} 元`;
    },
    // 手机号校验
    confirmPhone() {
      const reg = /^1[3-9]\d{9}$/;
      if (!this.userPhone) {
        uni.showToast({ title: "手机号不能为空！", icon: "none" });
        return;
      }
      if (!reg.test(this.userPhone)) {
        uni.showToast({ title: "请输入正确的手机号", icon: "none" });
        return;
      }
      this.showPhoneModal = false;
      this.handleConfirmBet(true);
    },
    // 返回
    handleBack() {
      this.saveEditedData();
      uni.navigateBack({ delta: 1 });
    },
    // 减倍数
    handleMinus() {
      if (this.betCount > 1) {
        this.betCount--;
      }
    },
    // 加倍数
    handlePlus() {
      if (this.selectedMatchCount < 1) return;
      if (this.betCount < 50) {
        this.betCount++;
      } else {
        uni.showToast({ title: "倍数最多50倍", icon: "none" });
      }
    },
    // 提交投注
    async handleConfirmBet(fromPhoneModal) {
      if (this.selectedMatchCount === 0) {
        uni.showToast({ title: "请先选择至少一场赛事的投注内容", icon: "none" });
        return;
      }
      if (this.isNeedUserPhone == 1 && !fromPhoneModal) {
        this.showPhoneModal = true;
        return;
      }
      this.isPayLoading = true;
      const list = this.selectedMatchList.map((item) => ({
        courseId: item.id,
        serialNumber: item.serial_number,
        leagueName: item.league_name,
        homeName: item.home_name,
        visitingName: item.visiting_name,
        raceDate: item.race_date,
        dateStr: item.date_str,
        selectedSpf: item.selectedSpf || [],
        selectedDx: item.selectedDx || [],
        selectedSfc: item.selectedSfc || [],
        winMultiplier: item.win_multiplier,
        lossMultiplier: item.loss_multiplier,
        rWinMultiplier: item.r_win_multiplier,
        rLossMultiplier: item.r_loss_multiplier,
        dxfDMultiplier: item.dxf_d_multiplier,
        dxfXMultiplier: item.dxf_x_multiplier,
        sfcOdds: {
          home: {
            "1-5": item.h_sfc1_5,
            "6-10": item.h_sfc6_10,
            "11-15": item.h_sfc11_15,
            "16-20": item.h_sfc16_20,
            "21-25": item.h_sfc21_25,
            "26+": item.h_sfc26_jia,
          },
          away: {
            "1-5": item.v_sfc1_5,
            "6-10": item.v_sfc6_10,
            "11-15": item.v_sfc11_15,
            "16-20": item.v_sfc16_20,
            "21-25": item.v_sfc21_25,
            "26+": item.v_sfc26_jia,
          },
        },
        playType: "篮球混合过关",
        entityType: "篮球混合过关",
      }));
      const payRequestData = {
        contentJson: JSON.stringify(list),
        entityType: "篮球混合过关",
        multiple: this.betNotes,
        bet: this.betCount,
        payment: this.totalBetAmount,
        payType: "wechat",
        userPhone: this.userPhone,
      };
      try {
        const res = await purchasingLotteryApply(payRequestData);
        if (res.code == 200) {
          this.isPayLoading = false;
          this.isSubmitSuccess = true;
          uni.showToast({ title: "操作成功！", icon: "success", duration: 2000, mask: true });
          uni.setStorageSync("editedMatchData", JSON.stringify({ matches: [], betCount: 1 }));
          setTimeout(() => uni.navigateBack({ delta: 1 }), 2000);
        } else {
          this.isPayLoading = false;
          uni.showToast({ title: res.message || "获取支付信息失败", icon: "none" });
        }
      } catch (error) {
        this.isPayLoading = false;
        uni.showToast({ title: "网络异常，请稍后重试", icon: "none" });
        console.error("篮球混合过关投注报错：", error);
      }
    },
  },
};
</script>

<style scoped lang="scss">
/* 全局样式 */
.scheme-edit-page {
  background-color: #f5f5f5;
  box-sizing: border-box;
  height: 100vh;
  margin: 0;
  padding: 0;
  /* #ifdef H5 */
  overflow: hidden;
  /* #endif */
}

/* 滚动区域 */
.match-scroll {
  position: absolute !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  height: auto !important;
  overflow-y: auto !important;
  background-color: #f5f5f5;
  box-sizing: border-box;
  padding: 10rpx 20rpx 20rpx;

  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
}

/* 赛事列表 */
.match-list {
  width: 100%;
  box-sizing: border-box;

  .match-row {
    background-color: #fff;
    margin-bottom: 15rpx;
    padding: 26rpx 20rpx;
    box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.05);
    border-radius: 8rpx;

    /* 赛事头部 */
    .match-header {
      display: flex;
      align-items: center;
      margin-bottom: 15rpx;
      font-size: 28rpx;
      color: #333;

      .serial-number {
        margin-right: 20rpx;
        font-weight: 400;
        color: #999;
      }

      .team-name {
        flex: 1;
        text-align: center;

        .vs-text {
          margin: 0 10rpx !important;
          color: #999;
        }
      }
    }

    /* 投注项：按行展示 */
    .selected-content {
      background: #f9f9f9;
      border-radius: 4rpx;
      padding: 12rpx;

      .bet-item {
        display: flex;
        align-items: center;
        margin-bottom: 8rpx; /* 行间距 */

        &:last-child {
          margin-bottom: 0;
        }

        .bet-label {
          font-size: 24rpx;
          color: #666;
          width: 180rpx; /* 标签宽度加宽，适配"胜分差（客胜）" */
        }

        .bet-value {
          font-size: 24rpx;
          color: #333;
          flex: 1;
        }

        .highlight {
          color: #d92929;
          font-weight: 500;
        }
      }

      .empty-bet {
        text-align: center;
        padding: 10rpx 0;
        .trigger-tip {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }

  .empty-tip {
    text-align: center;
    padding: 50rpx 0;
    font-size: 26rpx;
    color: #999;
    background-color: #fff;
    border-radius: 8rpx;
    margin-top: 20rpx;
  }
}

/* 底部投注栏：保持不变 */
.bet-bar {
  position: fixed !important;
  width: 100% !important;
  left: 0 !important;
  z-index: 10 !important;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
  padding-bottom: 0 !important;
  box-sizing: border-box !important;
  height: 80rpx !important;

  // #ifdef MP-WEIXIN
  bottom: calc(100rpx + env(safe-area-inset-bottom)) !important;
  // #endif

  // #ifdef APP-PLUS
  bottom: calc(100rpx + constant(safe-area-inset-bottom)) !important;
  bottom: calc(100rpx + env(safe-area-inset-bottom)) !important;
  // #endif

  // #ifdef H5
  bottom: calc(102rpx + env(safe-area-inset-bottom)) !important;
  // #endif

  .bet-bar-top {
    background: #fff;
    display: flex;
    justify-content: space-around;
    align-items: center;

    // 新增提示文本样式
    .tips-text {
      font-size: 24rpx;
      color: #d92929;
      flex: 1;
      margin-left: 20rpx;
      line-height: 1.4;
    }

    // 缩小 top-left 样式
    .top-left {
      font-size: 24rpx; // 从28rpx改小
      color: #333;
      padding: 8rpx 12rpx;
      margin-left: 10rpx; // 缩小左边距
      max-width: 150rpx; // 缩小最大宽度
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .collapse-area {
      display: flex;
      align-items: center;
      justify-content: space-around;
      height: 80rpx;
      box-sizing: border-box;
      padding: 10rpx 20rpx;
      border-bottom: 2rpx solid #eee;

      .multi-group {
        display: flex;
        align-items: center;
        gap: 10rpx;

        .multi-label {
          height: 100%;
          font-size: 26rpx; // 略缩小
          color: #333;
        }

        .multi-btn {
          width: 44rpx; // 从52rpx改小
          height: 44rpx; // 从52rpx改小
          background-color: #ddd;
          color: #333;
          font-size: 28rpx; // 从32rpx改小
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1rpx solid #ccc;
          padding: 0;
          margin: 0;
          border-radius: 0;
          // #ifdef MP-WEIXIN
          line-height: 1;
          // #endif
        }

        // 缩小输入框
        .multi-input {
          width: 120rpx; // 从180rpx改小
          height: 44rpx; // 从52rpx改小
          background-color: #fff;
          color: #333;
          text-align: center;
          font-size: 26rpx; // 从30rpx改小
          border: 1rpx solid #ccc;
          padding: 0;
          box-sizing: border-box;
          border-radius: 0;
          // #ifdef H5
          outline: none;
          // #endif
        }
      }
    }
  }

  .bet-bar-bottom {
    display: flex;
    align-items: center;
    height: 100rpx;
    background: #232323;
    color: #fff;
    padding: 0 40rpx;

    .bottom-middle {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin: 0 20rpx;

      .select-tip {
        font-size: 28rpx;
        color: #fff;
        text-align: center;
      }

      .bonus-tip {
        font-size: 18rpx;
        color: #999;
        text-align: center;
        line-height: 1.2;
      }
    }

    .bottom-right {
      width: 200rpx;

      .confirm-btn {
        width: 100%;
        height: 76rpx;
        background: #d92929;
        color: #fff;
        border-radius: 8rpx;
        font-size: 28rpx;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;

        &[disabled] {
          background: #666;
          color: #aaa;
          cursor: not-allowed;
        }

        &:active {
          background: #c62828;
        }
      }
    }
  }
}

/* 手机号弹窗 */
.phone-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;

  .modal-mask {
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
  }

  .modal-content {
    width: 80%;
    background: #fff;
    border-radius: 16rpx;
    padding: 40rpx;
    position: relative;

    .modal-desc {
      font-size: 28rpx;
      color: #666;
      line-height: 1.5;
      margin-bottom: 30rpx;
    }

    .input-wrap {
      display: flex;
      align-items: center;
      margin-bottom: 40rpx;

      label {
        font-size: 28rpx;
        color: #333;
        width: 180rpx;
      }

      input {
        flex: 1;
        height: 70rpx;
        border: 1rpx solid #eee;
        border-radius: 8rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
      }
    }

    .modal-btns {
      display: flex;
      gap: 20rpx;

      button {
        flex: 1;
        height: 80rpx;
        border-radius: 8rpx;
        font-size: 28rpx;
      }

      .cancel-btn {
        background: #f5f5f5;
        color: #666;
      }

      .confirm-btn {
        background: #d92929;
        color: #fff;
      }
    }
  }
}

/* 全局兼容 */
::-webkit-scrollbar {
  display: none;
}

button::after {
  border: none;
}

.disabled {
  color: #999 !important;
  border-color: #eee !important;
}
</style>
