<template>
  <view class="scheme-edit-page">
    <!-- 顶部导航：保留原有 -->
    <CustomHeader :ballTitle="'KeepSeek'" title="胜平负" :showBack="true" :showIcon="false" @back-click="handleBack" />

    <!-- 核心优化：基于sysinfo精准计算高度，移除冗余padding -->
    <scroll-view
      class="match-scroll"
      scroll-y
      :style="{
        top: headerTotalHeight + 'px',
        bottom: betBarTotalHeight + 'px',
      }"
    >
      <view class="match-list">
        <view v-for="(item, index) in selectedMatchList" :key="index" class="match-row">
          <view class="match-category">
            <view class="league-name">{{ item.league_name }}</view>
            <view class="league-name" style="display: flex; justify-content: flex-start; width: 100%"> <text class="single"></text>{{ item.serial_number }}</view>
            <view class="match-time">{{ item.race_date }}</view>
          </view>
          <view class="match-cells">
            <view class="match-cell home" :class="{ selected: item.homeSelected }">
              <view class="team-name">{{ item.home_name }}</view>
              <text class="odds" v-if="item.win_multiplier">主胜{{ item.win_multiplier }}</text>
              <text class="odds rate" v-if="item.home_win_rate">胜{{ item.home_win_rate || "" }}</text>
            </view>
            <view class="match-cell vs" :class="{ selected: item.vsSelected }">
              <text class="vs-text">VS</text>
              <text class="vs-odds" v-if="item.draw_multiplier">平{{ item.draw_multiplier }}</text>
              <text class="vs-odds" v-if="item.draw_rate">平{{ item.draw_rate }}</text>
            </view>
            <view class="match-cell away" :class="{ selected: item.awaySelected }">
              <text class="team-name">{{ item.visiting_name }}</text>
              <text class="odds" v-if="item.loss_multiplier">主负{{ item.loss_multiplier }}</text>
              <text class="odds rate" v-if="item.visiting_win_rate">胜{{ item.visiting_win_rate || "" }}</text>
            </view>
          </view>
        </view>

        <view class="empty-tip" v-if="selectedMatchList.length === 0"> 暂无 </view>
      </view>
    </scroll-view>

    <view
       v-if="urlValue"
      class="bet-bar"
      :style="{
        height: betBarFixedPx + 'px',
        paddingBottom: (isApp ? safeAreaBottom : 0) + 'px',
      }"
    >
      <view class="bet-bar-top">
        <!-- -->
        <view class="collapse-area">
          <view class="multi-group" style="color: #d92929;">
            <!-- <button class="multi-btn minus" @click="handleMinus"><text>-</text></button>
            <view class="multi-input" @tap="showNumberKeyboard = true" :class="{ disabled: selectedMatchCount < 1 }">
              {{ betCount }}
            </view>
            <button class="multi-btn plus" @click="handlePlus"><text>+</text></button> -->
            请截屏
            <!--  -->
          </view>
        </view>
      </view>
      <view class="bet-bar-bottom">
        <view class="bottom-middle">
          <!--  -->
          <text class="bonus-tip">
            <!-- {{ calculateHalfFullBonus() }} -->
            </text>
        </view>
      </view>
    </view>
    <UniNumberKeyboard :show.sync="showNumberKeyboard" :value="betCount + ''" :allowDot="false" confirm-text="确认" :min="1" :max="50" @input="handleKeyboardInput" @confirm="handleKeyboardConfirm" />
  </view>
</template>

<script>
import CustomHeader from "@/components/CustomHeader.vue";
import { formatTimeToMDWeekHM } from "@/utils/data";
import { purchasingLotteryApply } from "@/api/demo";
import { validateBetInput } from "@/utils/validate";

export default {
  components: { CustomHeader },
  data() {
    return {
      selectedMatchList: [],
      betCount: 50,
      isPayLoading: false,
      isNeedUserPhone: 1,
      showPhoneModal: false,
      userPhone: "",
      isSubmitSuccess: false,
      statusBarHeight: 0, // 状态栏高度
      safeAreaBottom: 0, // 底部安全区高度
      headerTotalHeight: 0, // 导航栏总高度
      betBarFixedPx: 0, // （200rpx转px）
      betBarTotalHeight: 0, // 栏总高度（仅固定高度，不叠加安全区）
      isApp: false, // 标记是否为App端
      isMp: false, // 标记是否为小程序端
      selectedCombo: "", // 用于接收串关类型，显示单关/几串几
      showNumberKeyboard: false,
      urlValue: false,
    };
  },
  computed: {
    selectedMatchCount() {
      return this.selectedMatchList.filter((item) => {
        return item.homeSelected || item.vsSelected || item.awaySelected;
      }).length;
    },
    // 计算注数：每行选中的选项数量相乘
    betNotes() {
      if (this.selectedMatchList.length === 0) return 0;
      let notes = 1;
      this.selectedMatchList.forEach((item) => {
        let selectedCount = 0;
        if (item.homeSelected) selectedCount++;
        if (item.vsSelected) selectedCount++;
        if (item.awaySelected) selectedCount++;
        if (selectedCount > 0) {
          notes *= selectedCount;
        }
      });
      return notes;
    },
    // 计算总金额（注数 ×  × 2）
    totalBetAmount() {
      return this.betNotes * this.betCount * 2;
    },
  },
  onShow() {
    uni.setTabBarStyle({ height: "0px" });
  },
  created() {
    // 计算所有高度
    this.calcAllHeights();
    this.$nextTick(()=>{
    this.urlValue = uni.getStorageSync('urlValue');
    
    })
  },
  onLoad() {
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.on("selectedData", (data) => {
        this.selectedMatchList = data.matches || [];
        console.log(data, "list------------------");
        this.betCount = data.betCount || 1;
        this.isNeedUserPhone = data.isNeedUserPhone;
        this.selectedCombo = data.combo || "";
      });
    }
  },
  onUnload() {
    if (this.isSubmitSuccess) {
      return;
    }
    const editedData = {
      matches: this.selectedMatchList,
      betCount: this.betCount,
    };

    uni.setStorageSync("editedMatchData", JSON.stringify(editedData));
  },
  methods: {
    // 新增：处理自定义软键盘实时输入
    handleKeyboardInput(val) {
      // 过滤非数字，限制1-50
      const num = parseInt(val) || 1;
      if (num < 1) {
        this.betCount = 1;
      } else if (num > 50) {
        this.betCount = 50;
      } else {
        this.betCount = num;
      }
    },

    // 新增：处理自定义软键盘确认
    handleKeyboardConfirm(val) {
      const num = parseInt(val) || 1;
      this.betCount = Math.min(Math.max(num, 1), 50); // 最终限制1-50
      this.showNumberKeyboard = false; // 收起键盘
    },

    // 原有handleBetInput方法可以保留（兼容备用），也可以删除（因为改用自定义键盘了）
    handleBetInput(e) {
      const inputVal = e.detail.value;
      const validVal = validateBetInput(inputVal);
      this.betCount = null;
      this.$nextTick(() => {
        this.betCount = validVal;
      });
    },
    // 核心优化：统一计算所有高度，栏总高度仅保留固定高度，不叠加安全区
    calcAllHeights() {
      const sys = wx.getWindowInfo();
      // 1. 状态栏高度
      this.statusBarHeight = sys.statusBarHeight || 20;
      // 2. 底部安全区高度：仅 iOS 设备生效，安卓/小程序端为 0（核心！）
      this.safeAreaBottom = (sys.safeAreaInsets && sys.safeAreaInsets.bottom) || 0;
      // 3. 导航栏固定高度（设计稿80rpx转px）
      const navBarFixedRpx = 80;
      const navBarFixedPx = (sys.screenWidth / 750) * navBarFixedRpx;
      // 4. 导航栏总高度
      this.headerTotalHeight = this.statusBarHeight + navBarFixedPx;
      
      const betBarFixedRpx = 200;
      this.betBarFixedPx = (sys.screenWidth / 750) * betBarFixedRpx;
      // 6. 栏总高度：固定高度 + iOS 安全区高度（让 scroll-view 底部留出足够空间）
      this.betBarTotalHeight = this.betBarFixedPx + this.safeAreaBottom;
    },
    calculateHalfFullBonus() {
      if (this.selectedMatchCount === 0) {
        return "预计：0.00";
      }
      const rowOddsList = [];
      this.selectedMatchList.forEach((item) => {
        const selectedOdds = [];
        if (item.homeSelected) {
          const homeOdds = Number(item.win_multiplier) || 0;
          if (homeOdds > 0) selectedOdds.push(homeOdds);
        }
        if (item.vsSelected) {
          const drawOdds = Number(item.draw_multiplier) || 0;
          if (drawOdds > 0) selectedOdds.push(drawOdds);
        }
        if (item.awaySelected) {
          const awayOdds = Number(item.loss_multiplier) || 0;
          if (awayOdds > 0) selectedOdds.push(awayOdds);
        }
        if (selectedOdds.length > 0) {
          rowOddsList.push(selectedOdds);
        }
      });
      if (rowOddsList.length === 0) {
        return "预计：0.00";
      }
      const isAllSingleSelect = rowOddsList.every((oddsArr) => oddsArr.length === 1);
      let minOddsProduct = 1;
      let maxOddsProduct = 1;
      rowOddsList.forEach((oddsArr) => {
        const currentMin = Math.min(...oddsArr);
        const currentMax = Math.max(...oddsArr);
        minOddsProduct *= currentMin;
        maxOddsProduct *= currentMax;
      });
      const base = 2 * this.betCount;
      const minBonus = minOddsProduct * base;
      const maxBonus = maxOddsProduct * base;
      if (isAllSingleSelect) {
        return `预计：${minBonus.toFixed(2)}`;
      } else {
        return `预计：${minBonus.toFixed(2)} ~ ${maxBonus.toFixed(2)}`;
      }
    },
    // 确认手机号
    confirmPhone() {
      const reg = /^1[3-9]\d{9}$/;
      if (!reg.test(this.userPhone)) {
        uni.showToast({ title: "请输入正确的手机号", icon: "none" });
        return;
      }
      this.showPhoneModal = false;
      this.handleConfirmBet(true);
    },
    formDate(time) {
      return formatTimeToMDWeekHM(time);
    },
    toggleSelect(item, key) {
      if (item.is_discontinued === 1) return;
      this.$set(item, key, !item[key]);
    },
    handleBack() {
      this.saveEditedData();
      uni.navigateBack({ delta: 1 });
    },
    handleGotoHome() {
      this.saveEditedData();
      uni.navigateBack({ delta: 1 });
    },
    saveEditedData() {
      const deepCopyData = JSON.parse(
        JSON.stringify({
          matches: this.selectedMatchList,
          betCount: this.betCount,
        })
      );
      uni.setStorageSync("editedMatchData", JSON.stringify(deepCopyData));
    },
    handleDeleteMatch(index) {
      this.selectedMatchList.splice(index, 1);
    },
    handleClearAll() {
      this.selectedMatchList = [];
    },
    handleMinus() {
      if (this.betCount > 1) this.betCount--;
    },
    // 输入框实时校验（全端兼容）
    handleBetInput(e) {
      const inputVal = e.detail.value;
      const validVal = validateBetInput(inputVal);
      this.betCount = validVal;
    },
    handlePlus() {
      if (this.selectedMatchCount < 1) return;
      if (this.betCount < 50) {
        this.betCount++;
      } else {
        uni.showToast({ title: "最多50倍", icon: "none" });
      }
    },
    async handleConfirmBet(fromPhoneModal) {
      if (this.selectedMatchCount === 0) {
        uni.showToast({ title: "请先选择至少一场赛事的选项", icon: "none", duration: 1500 });
        return;
      }
      if (this.isNeedUserPhone == 1 && !fromPhoneModal) {
        this.showPhoneModal = true;
        return;
      }
      this.isPayLoading = true;
      const list = this.selectedMatchList.map((item) => ({
        courseId: item.id,
        isSelectWin: item.homeSelected ? 1 : 0,
        isSelectDraw: item.vsSelected ? 1 : 0,
        isSelectLoss: item.awaySelected ? 1 : 0,
        serialNumber: item.serial_number,
        leagueName: item.league_name,
        homeName: item.home_name,
        visitingName: item.visiting_name,
        raceDate: item.race_date,
        dateStr: item.date_str,
        winMultiplier: item.win_multiplier,
        homeGoalCalculate: item.home_goal_calculate,
        visitingGoalCalculate: item.visiting_goal_calculate,
        homeWinRate: item.home_win_rate,
        drawMultiplier: item.draw_multiplier,
        drawRate: item.draw_rate,
        lossMultiplier: item.loss_multiplier,
        visitingWinRate: item.visiting_win_rate,
      }));
      const payRequestData = {
        contentJson: JSON.stringify(list),
        entityType: "足彩胜平负",
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
          uni.showToast({
            title: "操作成功！",
            icon: "success",
            duration: 2000,
            mask: true,
          });
          uni.setStorageSync("editedMatchData", JSON.stringify({ matches: [], betCount: 50 }));
          setTimeout(() => {
            uni.navigateBack({ delta: 1 });
          }, 2000);
        } else {
          this.isPayLoading = false;
          uni.showToast({ title: res.message || "获取支付信息失败", icon: "none", duration: 1500 });
        }
      } catch (error) {
        this.isPayLoading = false;
        uni.showToast({ title: "网络异常，请稍后重试", icon: "none", duration: 1500 });
        console.error("purchasingLotteryApply接口请求失败：", error);
      }
    },
    invokeWxPayment(payParams) {
      const { timeStamp, nonceStr, package: prepayPackage, signType, paySign, orderId } = payParams;
      uni.requestPayment({
        provider: "wxpay",
        timeStamp: timeStamp + "",
        nonceStr: nonceStr,
        package: prepayPackage,
        signType: signType,
        paySign: paySign,
        success: (res) => {
          this.isPayLoading = false;
          uni.showToast({ title: "支付成功", icon: "success", duration: 1500 });
          setTimeout(() => {
            uni.navigateTo({ url: `/pages/orderDetail/orderDetail?orderId=${orderId}` });
            this.selectedMatchList = [];
            this.betCount = 1;
          }, 1500);
        },
        fail: (err) => {
          this.isPayLoading = false;
          if (err.errMsg.includes("cancel")) {
            uni.showToast({ title: "已取消支付", icon: "none", duration: 1500 });
          } else {
            uni.showToast({ title: "支付失败，请重试", icon: "none", duration: 1500 });
            console.error("微信支付失败：", err);
          }
        },
        complete: () => {
          this.isPayLoading = false;
        },
      });
    },
  },
};
</script>

<style scoped lang="scss">
.scheme-edit-page {
  background-color: #f5f5f5;
  box-sizing: border-box;
  height: 100vh;
  margin: 0;
  padding: 0;
  // 兼容H5端滚动穿透
  // #ifdef H5
  overflow: hidden;
  // #endif
}

// 滚动区样式：保留原有逻辑，基于JS计算的top/bottom定位
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

  // 隐藏滚动条
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
}

.match-list {
  width: 100%;
  box-sizing: border-box;

  .match-row {
    display: flex;
    background-color: #fff;
    border-bottom: 1rpx solid#DEDEDE;
    padding: 8rpx 20rpx 8rpx 20rpx;
    margin-bottom: 10rpx;
    border-radius: 8rpx;

    .match-category {
      width: 180rpx;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;

      .league-name {
        font-size: 24rpx;
        color: #777;
        margin-bottom: 6rpx;
        .single {
          display: inline-block;
          box-sizing: border-box;
          padding-left: 6rpx;
          width: 44rpx;
          color: #fff;
          text-align: left;
          border-top-right-radius: 15rpx;
          border-bottom-right-radius: 16rpx;
          margin-right: 10rpx;
        }
      }

      .match-time {
        font-size: 22rpx;
        color: #999;
      }
    }

    .match-cells {
      flex: 1;
      display: flex;
      border: 1rpx solid #dedede;
      border-radius: 8rpx;
      overflow: hidden;

      .match-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 16rpx 10rpx;
        cursor: pointer;
        transition: background-color 0.2s;

        &.home {
          width: 38%;
          border-right: 1rpx solid #eee;
        }

        &.vs {
          width: 22%;
          flex-direction: column;
          gap: 4rpx;

          .vs-text {
            font-size: 24rpx;
            font-weight: 400;
            color: #333;
            margin-bottom: 0;
          }
          .vs-odds {
            font-weight: 400;
            font-size: 24rpx;
            color: #999;
          }
        }
        &.away {
          width: 38%;
          border-left: 1rpx solid #eee;
        }

        &.selected {
          background-color: #d92929;
          color: #fff;
          .vs-text,
          .team-name,
          .vs-odds,
          .odds {
            color: #fff !important;
          }
        }

        .team-name {
          font-size: 24rpx;
          color: #666;
          margin-bottom: 8rpx;
          font-weight: 400;
          text-align: center;
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .odds {
          font-size: 24rpx;
          color: #999;
          margin-bottom: 4rpx;

          &.rate {
            color: #999;
            font-size: 22rpx;
          }
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
    border-top: 1rpx solid #f2f2f2;
    border-radius: 8rpx;
    margin-top: 20rpx;
  }
}

// 核心优化：栏强制固定高度，解决两端溢出/空白问题
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
    height: 100rpx; // 和bet-bar-top合计200rpx，匹配固定高度
    background-color: #232323;
    color: #fff;
    box-sizing: border-box;
    padding: 0 20rpx;

    .bottom-middle {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin: 0 20rpx;
      height: 100%;

      .select-tip {
        height: 50rpx;
        font-size: 28rpx;
        color: #fff;
        text-align: center;
      }

      .bonus-tip {
        font-size: 18rpx;
        color: #999;
        line-height: 1.2;
        text-align: center;
      }
    }

    .bottom-right {
      width: 200rpx;

      .confirm-btn {
        width: 100%;
        height: 76rpx;
        background-color: #d92929;
        color: #fff;
        border-radius: 8rpx;
        font-size: 28rpx;
        border: none;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        &[disabled] {
          background-color: #666;
          color: #aaa;
          cursor: not-allowed;
        }
        // 小程序按钮点击态
        // #ifdef MP-WEIXIN
        &:active {
          opacity: 0.8;
        }
        // #endif
      }
    }
  }
}
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

// 隐藏滚动条（全端兼容）
::-webkit-scrollbar {
  display: none;
}
</style>
