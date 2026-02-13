<template>
  <view class="scheme-edit-page">
    <!-- 顶部导航：保留 -->
    <CustomHeader 
     :ballTitle="'竞彩足球'"
      title="半全场" 
      :showBack="true" 
      :showIcon="false" 
      @back-click="handleBack" 
    ></CustomHeader>

    <!-- 核心优化：按胜平负页面规则，基于sysinfo计算top/bottom -->
    <scroll-view class="match-scroll" scroll-y :style="{ 
      top: headerTotalHeight + 'px',    
      bottom: betBarTotalHeight + 'px'  
    }">
      <view class="match-list">
        <!-- 赛事行：上下结构（保留原有业务内容） -->
        <view v-for="(item, index) in selectedMatchList" :key="index" class="match-row">
          <!-- 上排：编号 + 队名VS队名 -->
          <view class="match-header">
            <text class="serial-number">{{ item.serial_number }}</text>
            <text class="team-name">
              {{ item.home_name }} <span class="vs-text">VS</span> {{ item.visiting_name }}
            </text>
          </view>
          <!-- 下排：选中的半全场内容（一整行） -->
          <view class="selected-content">
            {{ (item.selectedScores && item.selectedScores.length > 0) 
              ? item.selectedScores.map(val => getOptionLabel(val)).join(',') 
              : '无选中投注内容' }}
          </view>
        </view>

        <view class="empty-tip" v-if="selectedMatchList.length === 0">
          暂无已选赛事
        </view>
      </view>
    </scroll-view>

    <!-- 底部投注栏：按胜平负规则修改样式绑定 + 颜色 -->
    <view class="bet-bar" :style="{ 
      height: betBarFixedPx + 'px',
      // 核心：仅App端添加安全区padding，小程序端为0
      paddingBottom: (isApp ? safeAreaBottom : 0) + 'px' 
    }">
      <view class="bet-bar-top">
        <view class="top-left">
          {{selectedMatchList.length == 1 ? '单关': selectedMatchList.length + '串1'}}
        </view>
        <view class="collapse-area">
          <view class="multi-group">
            <text class="multi-label">投</text>
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
          <text class="select-tip">共{{betNotes}}注 {{betCount}}倍  {{totalBetAmount}}</text>
          <text class="bonus-tip">{{calculateHalfFullBonus()}}</text>
        </view>
        <!-- <view class="bottom-right">
          <button class="confirm-btn" :disabled="selectedMatchCount === 0 || isPayLoading" @click="handleConfirmBet(false)">
            <text>{{ isPayLoading ? "支付中..." : "模拟投注" }}</text>
          </button>
        </view> -->
      </view>
    </view>

    <!-- 手机号弹窗：保留 -->
    <view class="phone-modal" v-if="showPhoneModal">
      <view class="modal-mask" @click="showPhoneModal = false"></view>
      <view class="modal-content">
        <view class="modal-desc">
          <text>业务人员通过微信与您联系付款及打印彩票后给您发送图片留作兑奖凭证等后续流程</text>
        </view>
        <view class="input-wrap">
          <label><text>微信手机号：</text></label>
          <input type="number" v-model="userPhone" placeholder="请输入手机号（必填）" maxlength="11" />
        </view>
        <view class="modal-btns">
          <button class="cancel-btn" @click="showPhoneModal = false"><text>取消</text></button>
          <button class="confirm-btn" @click="confirmPhone"><text>提交</text></button>
        </view>
      </view>
    </view>
        <UniNumberKeyboard
      :show.sync="showNumberKeyboard"
      :value="betCount + ''"
      :allowDot="false"
      confirm-text="确认"
      :min="1"
      :max="50"
      @input="handleKeyboardInput"
      @confirm="handleKeyboardConfirm"
    />
  </view>
</template>

<script>
// 集成胜平负页面的高度计算逻辑 + 保留半全场业务逻辑
import CustomHeader from "@/components/CustomHeader.vue";
import { purchasingLotteryApply } from "@/api/demo";
import { validateBetInput  } from '@/utils/validate';
export default {
  components: { CustomHeader },
  data() {
    return {
      selectedMatchList: [], 
      betCount: 1, 
      isPayLoading: false,
      isNeedUserPhone: 1,
      showPhoneModal: false,
      userPhone: '',
      isSubmitSuccess: false,
      statusBarHeight: 0,       // 状态栏高度
      safeAreaBottom: 0,        // 底部安全区高度
      headerTotalHeight: 0,     // 导航栏总高度
      betBarFixedPx: 0,         // 投注栏固定高度（200rpx转px）
      betBarTotalHeight: 0,     // 投注栏总高度（仅固定高度）
      isApp: false,             // App端标记
      isMp: false,              // 小程序端标记
      halfFullOptions: [
        { label: "胜胜", value: "ss", oddsField: "ss" },
        { label: "胜平", value: "sp", oddsField: "sp" },
        { label: "胜负", value: "sf", oddsField: "sf" },
        { label: "平胜", value: "ps", oddsField: "ps" },
        { label: "平平", value: "pp", oddsField: "pp" },
        { label: "平负", value: "pf", oddsField: "pf" },
        { label: "负胜", value: "fs", oddsField: "fs" },
        { label: "负平", value: "fp", oddsField: "fp" },
        { label: "负负", value: "ff", oddsField: "ff" }
      ],
      selectedCombo: "",
       showNumberKeyboard: false,
    };
  },
  computed: {
    selectedMatchCount() {
      return this.selectedMatchList.filter(item => {
        return item.selectedScores && item.selectedScores.length > 0;
      }).length;
    },
    betNotes() {
      const selectedRows = this.selectedMatchList.filter(item => 
        item.selectedScores && Array.isArray(item.selectedScores) && item.selectedScores.length > 0
      );

      if (selectedRows.length === 0) return 0;

      return selectedRows.reduce((total, row) => {
        const rowSelectedCount = row.selectedScores.length;
        return total * rowSelectedCount;
      }, 1);
    },
    totalBetAmount() {
      return this.betNotes * this.betCount * 2;
    }
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
calculateHalfFullBonus() {
  if (this.selectedMatchCount === 0 || this.betNotes === 0) {
    return "0.00元 ~ 0.00元";
  }

  const rowOddsList = [];
  this.selectedMatchList.forEach((item, itemIdx) => {
    const currentRowOdds = [];
    const selectedScores = item.selectedScores || [];

    selectedScores.forEach(scoreValue => {
      const option = this.halfFullOptions.find(opt => opt.value === scoreValue);
      if (!option) return;

      const oddsFieldName = option.oddsField.replace('_odds', '');
      const rawOddValue = item[oddsFieldName];
      const odd = Number(rawOddValue) || 0;

      if (!isNaN(odd) && odd > 0) {
        currentRowOdds.push(odd);
      }
    });

    if (currentRowOdds.length > 0) {
      rowOddsList.push(currentRowOdds);
    }
  });

  if (rowOddsList.length === 0) {
    return "0.00元 ~ 0.00元";
  }

  let minOddsProduct = 1;
  let maxOddsProduct = 1;

  rowOddsList.forEach(oddsArr => {
    const currentMin = oddsArr.length > 0 ? Math.min(...oddsArr) : 1;
    const currentMax = oddsArr.length > 0 ? Math.max(...oddsArr) : 1;

    minOddsProduct *= currentMin;
    maxOddsProduct *= currentMax;
  });

  const base = 2 * this.betCount;
  const minBonus = minOddsProduct * base;
  const maxBonus = maxOddsProduct * base;

  const formatBonus = (bonus) => {
    const num = Number(bonus);
    if (isNaN(num) || num <= 0) {
      return "0.00";
    }
    return num.toFixed(2);
  };

  const minBonusText = formatBonus(minBonus);
  const maxBonusText = formatBonus(maxBonus);

  return `${minBonusText} ~ ${maxBonusText}`;
},
    getOptionLabel(value) {
      const opt = this.halfFullOptions.find(item => item.value === value);
      return opt ? opt.label : value;
    },
    confirmPhone() {
      if (this.isNeedUserPhone == 1) {
        const reg = /^1[3-9]\d{9}$/;
        if (!this.userPhone) {
          uni.showToast({ title: "手机号不能为空！", icon: "none", duration: 1500 });
          return;
        }
        if (!reg.test(this.userPhone)) {
          uni.showToast({ title: "请输入正确的手机号", icon: "none", duration: 1500 });
          return;
        }
      }
      this.showPhoneModal = false;
      this.handleConfirmBet(true);
    },
    // 新增：统一高度计算方法（和胜平负页面一致）
    calcAllHeights() {
      const sys = uni.getSystemInfoSync();
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
    handleBack() {
      this.saveEditedData();
      uni.navigateBack({ delta: 1 });
    },
    saveEditedData() {
      const deepCopyData = JSON.parse(JSON.stringify({
        matches: this.selectedMatchList,
        betCount: this.betCount
      }));
      uni.setStorageSync("editedMatchData", JSON.stringify(deepCopyData));
    },
    handleMinus() {
      if (this.betCount > 1) this.betCount--;
      const v = this.calculateHalfFullBonus();
    },
    handleBetInput(e) {
      const inputVal = e.detail.value;
      const validVal = validateBetInput(inputVal);
      
      this.betCount = null;
      this.$nextTick(() => {
        this.betCount = validVal;
      });
    },
handlePlus() {
  if (this.selectedMatchCount < 1) return;
  if (this.betCount < 50) {
    this.betCount++;
  } else {
    uni.showToast({ title: "倍数最多50倍", icon: "none" });
  }
},
    async handleConfirmBet(fromPhoneModal) {
      if (this.selectedMatchCount === 0) {
        uni.showToast({ title: "请先选择至少一场赛事的投注内容", icon: "none", duration: 1500 });
        return;
      }
      if (!fromPhoneModal) {
        await this.doConfirmBetLogic();
      }
    },
    async doConfirmBetLogic() {
      if (this.isNeedUserPhone == 1 && !this.userPhone) {
        this.showPhoneModal = true;
        return;
      }

      this.isPayLoading = true;
      const list = this.selectedMatchList.map(item => ({
        courseId: item.id,
        serialNumber: item.serial_number,
        leagueName: item.league_name,
        homeName: item.home_name,
        visitingName: item.visiting_name,
        raceDate: item.race_date,
        dateStr: item.date_str,
        homeAndVisitingGaols: item.selectedScores,
        selectedScores: item.selectedScores || [],
        playType: "半全场"
      }));

      const payRequestData = {
        contentJson: JSON.stringify(list),
        entityType: "半全场",
        multiple: this.betNotes,
        bet: this.betCount,
        payment: this.totalBetAmount,
        payType: "wechat",
        userPhone: this.userPhone
      };

      try {
        const res = await purchasingLotteryApply(payRequestData);
        if (res.code == 200) {
          this.isPayLoading = false;
          this.isSubmitSuccess = true;
          uni.showToast({
            title: "投注成功！",
            icon: "success",
            duration: 2000,
            mask: true
          });
          uni.setStorageSync("editedMatchData", JSON.stringify({ matches: [], betCount: 1 }));
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
          }
        },
        complete: () => {
          this.isPayLoading = false;
        }
      });
    }
  },
  created() {
    // 计算所有高度
    this.calcAllHeights();
  },
  onLoad() {
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.on("selectedData", (data) => {
        this.selectedMatchList = JSON.parse(JSON.stringify(data.matches || []));
        this.betCount = data.betCount || 1;
        this.isNeedUserPhone = data.isNeedUserPhone;
        this.selectedCombo = data.combo || ""; 
      });
    }
  },
  onShow() {
    uni.setTabBarStyle({ height: '0px' });
  },
  onUnload() {
    if (this.isSubmitSuccess) return;
    const editedData = {
      matches: this.selectedMatchList,
      betCount: this.betCount
    };
    uni.setStorageSync("editedMatchData", JSON.stringify(editedData));
  }
};
</script>

<style scoped lang="scss">
/* 完全对齐胜平负页面的样式规则 */
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

// 滚动区样式：和胜平负页面完全一致
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

  /* 赛事行：保留原有业务样式，仅微调布局 */
  .match-row {
    background-color: #fff;
    margin-bottom: 15rpx;
    padding: 26rpx 20rpx;
    box-shadow: 0 2rpx 5rpx rgba(0,0,0,0.05);
    border-radius: 8rpx;

    /* 上排：编号 + 队名VS队名 */
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
          margin: 0 10rpx;
          color: #999;
        }
      }
    }

    /* 下排：选中内容（一整行） */
    .selected-content {
      text-align: center;
      font-size: 32rpx;
      color: #d92929;
      font-weight: 500;
      background: #f1f1f1;
      border-radius: 10rpx;
      padding: 16rpx 0;
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

// 核心优化：投注栏强制固定高度，解决两端溢出/空白问题
.bet-bar {
  position: fixed !important;
  width: 100% !important;
  left: 0 !important;
  z-index: 10 !important;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.1);
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
    // 新增：给 bet-bar-top 加 flex 布局，让 top-left 和 collapse-area 左右排列
    display: flex;
    justify-content: space-around;
    align-items: center;
    
    // 仅新增这一段 top-left 样式
    .top-left {
      font-size: 28rpx;
      color: #333;
      padding: 8rpx 12rpx;
      margin-left: 20rpx;
      max-width: 200rpx;
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
          font-size: 30rpx;
          color: #333;
        }

        .multi-btn {
          width: 52rpx;
          height: 52rpx;
          background-color: #ddd;
          color: #333;
          font-size: 32rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1rpx solid #ccc;
          padding: 0;
          margin: 0;
          border-radius: 0;
          // 小程序按钮样式兼容
          // #ifdef MP-WEIXIN
          line-height: 1;
          // #endif
        }

        .multi-input {
          width: 180rpx;
          height: 52rpx;
          background-color: #fff;
          color: #333;
          text-align: center;
          font-size: 30rpx;
          border: 1rpx solid #ccc;
          padding: 0;
          box-sizing: border-box;
          border-radius: 0;
          // H5输入框样式兼容
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
/* 手机号弹窗：保留原有样式，和胜平负页面一致 */
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