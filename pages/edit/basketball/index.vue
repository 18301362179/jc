<template>
  <!-- 篮球胜负编辑页：统一适配逻辑，对齐让分胜负页结构 -->
  <view class="scheme-edit-page">
    <!-- 自定义头部：仅保留核心参数，结构不变 -->
    <CustomHeader :ballTitle="'篮球'" title="胜负" :showBack="true" :showIcon="false" @back-click="handleBack" />

    <!-- 内容区：统一用样式分端适配，移除template中的bottom绑定 -->
    <scroll-view
      class="match-scroll"
      scroll-y
      :style="{
        top: headerTotalHeight + 'px', // 仅保留top动态绑定，bottom由样式分端控制
      }"
    >
      <view class="match-list">
        <!-- 空状态：调整位置到列表顶部，对齐让分胜负页 -->
        <view class="empty-tip" v-if="selectedMatchList.length === 0">暂无</view>

        <!-- 已选赛事列表：保留胜负玩法字段，结构对齐 -->
        <view v-for="(item, index) in selectedMatchList" :key="index" class="match-row">
          <view class="match-category">
            <view class="league-name" style="display: flex; justify-content: center; width: 100%">
              <!-- <text class="single" :style="{backgroundColor: item.is_sf_single == 1 ? '#b71c1c':'transparent'}">
                {{item.is_sf_single == 1 ?  '单' : ''}}
              </text> -->
              {{ item.league_name }}
            </view>
            <view class="serial-number">{{ item.serial_number }}</view>
            <view class="match-time">{{ item.race_date }}</view>
          </view>
          <view class="match-cells">
            <view class="name-row">
              <text class="team-name away" :title="item.visiting_name">{{ item.visiting_name }}</text>
              <text class="vs-text">VS</text>
              <text class="team-name home" :title="item.home_name">{{ item.home_name }}</text>
            </view>
            <view class="rate-row" v-if="isShowStatus">
              <text class="rate-text away" v-show="item.visiting_win_rate" :title="`胜${item.visiting_win_rate}，约${item.home_goal_calculate}分`"> 胜率{{ item.visiting_win_rate || "--" }}，约{{ item.home_goal_calculate || "--" }}分 </text>
              <text class="vs-text"></text>
              <text class="rate-text home" v-show="item.home_win_rate" :title="`胜${item.home_win_rate}，约${item.visiting_goal_calculate}分`"> 胜率{{ item.home_win_rate || "--" }}，约{{ item.visiting_goal_calculate || "--" }}分 </text>
            </view>
            <view class="odds-row">
              <view class="match-cell away" :class="{ selected: item.awaySelected }"> 主负{{ item.loss_multiplier || "--" }} </view>
              <view class="match-cell home" :class="{ selected: item.homeSelected }"> 主胜{{ item.win_multiplier || "--" }} </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- <view
      class="bet-bar"
      v-if="isShowStatus"
      :style="{
        height: betBarFixedPx + 'px',
        paddingBottom: safeAreaBottom + 'px',
        bottom: safeAreaBottom + 'px',
      }"
    >
      <view class="bet-bar-top">
        <view class="top-left">
          {{ selectedMatchList.length == 1 ? "单关" : selectedMatchList.length + "串1" }}
        </view>
        <view class="collapse-area">
          <view class="multi-group">
            <button class="multi-btn minus" @click="handleMinus"><text>-</text></button>
            <view class="multi-input" @tap="showNumberKeyboard = true" :class="{ disabled: selectedMatchCount < 1 }">
              {{ betCount }}
            </view>
            <button class="multi-btn plus" @click="handlePlus"><text>+</text></button>
            <text class="multi-unit">倍</text>
          </view>
        </view>
      </view>
      <view class="bet-bar-bottom">
        <view class="bottom-middle">
          <text class="select-tip">共{{ betNotes }}注 {{ betCount }}倍 {{ totalBetAmount }}</text>
          <text class="bonus-tip">{{ calculateBonusText() }}</text>
        </view>
      </view>
    </view> -->

    <!-- 手机号弹窗：结构完全不变 -->
    <view class="phone-modal" v-if="showPhoneModal">
      <view class="modal-mask" @click="showPhoneModal = false"></view>
      <view class="modal-content">
        <view class="modal-desc">业务人员通过微信与您联系确认购买及打印彩票后给您发送图片留作兑奖凭证等后续流程</view>
        <view class="input-wrap">
          <label>微信手机号：</label>
          <input type="number" v-model="userPhone" placeholder="请输入手机号" maxlength="11" />
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
      betBarFixedPx: 0, // 投注栏固定高度（180rpx转px，对齐让分胜负页）
      betBarTotalHeight: 0, // 投注栏总高度（备用）
      isApp: false, // 标记是否为App端
      isMp: false, // 标记是否为小程序端
      selectedCombo: "", // 用于接收串关类型，显示单关/几串几
      showNumberKeyboard: false,
      isShowStatus:null
    };
  },
  computed: {
    // 保留胜负玩法的选中字段判断
    selectedMatchCount() {
      return this.selectedMatchList.filter((item) => {
        return item.homeSelected || item.awaySelected;
      }).length;
    },
    betNotes() {
      if (this.selectedMatchList.length === 0) return 0;
      let notes = 1;
      this.selectedMatchList.forEach((item) => {
        let count = 0;
        if (item.homeSelected) count++;
        if (item.awaySelected) count++;
        notes *= count > 0 ? count : 1;
      });
      return notes;
    },
    totalBetAmount() {
      return this.betNotes * this.betCount * 2;
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
        // 恢复深拷贝，保证数据独立性
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
    // 统一高度计算逻辑，投注栏改回180rpx（对齐让分胜负页）
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
    // 保留胜负玩法的奖金计算逻辑
    calculateBonusText() {
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
    // 保留胜负玩法的AI跳转类型
    goToAiAnalysis(item) {
      try {
        uni.navigateTo({
          url: `/pages/test/index?id=${item.id}&isLottery=1&type=篮球胜负`,
        });
      } catch (err) {
        uni.showToast({ title: "暂未开放AI分析", icon: "none" });
        console.error("AI分析跳转失败：", err);
      }
    },
    // 统一选中切换逻辑
    toggleSelect(item, key) {
      if (item.is_discontinued === 1) return;
      this.$set(item, key, !item[key]);
    },
    // 统一数据保存逻辑
    saveEditedData() {
      const editedData = JSON.parse(
        JSON.stringify({
          matches: this.selectedMatchList,
          betCount: this.betCount,
        })
      );
      uni.setStorageSync("editedMatchData", JSON.stringify(editedData));
    },
    // 统一返回逻辑
    handleBack() {
      this.saveEditedData();
      uni.navigateBack({ delta: 1 });
    },
    // 统一倍数操作逻辑
    handleMinus() {
      if (this.betCount > 1) {
        this.betCount--;
      }
    },
    // 统一倍数输入校验逻辑（恢复nextTick，避免输入闪烁）
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
    // 统一手机号校验逻辑
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
    // 统一投注逻辑，保留胜负玩法字段
    async handleConfirmBet(fromPhoneModal) {
      if (this.selectedMatchCount === 0) {
        uni.showToast({ title: "请先选择至少一场赛事", icon: "none" });
        return;
      }
      if (this.isNeedUserPhone == 1 && !fromPhoneModal) {
        this.showPhoneModal = true;
        return;
      }
      this.isPayLoading = true;
      const submitData = {
        contentJson: JSON.stringify(
          this.selectedMatchList.map((item) => ({
            courseId: item.id,
            serialNumber: item.serial_number,
            leagueName: item.league_name,
            homeName: item.home_name,
            visitingName: item.visiting_name,
            raceDate: item.race_date,
            isSelectWin: item.homeSelected ? 1 : 0,
            isSelectLoss: item.awaySelected ? 1 : 0,
            winMultiplier: item.win_multiplier,
            lossMultiplier: item.loss_multiplier,
            // 胜负玩法专属字段
            isSfSingle: item.is_sf_single,
            visitingWinRate: item.visiting_win_rate,
            homeWinRate: item.home_win_rate,
            homeGoalCalculate: item.home_goal_calculate,
            visitingGoalCalculate: item.visiting_goal_calculate,
          }))
        ),
        entityType: "篮球胜负",
        multiple: this.betNotes,
        bet: this.betCount,
        payment: this.totalBetAmount,
        payType: "wechat",
        userPhone: this.userPhone,
      };
      try {
        const res = await purchasingLotteryApply(submitData);
        if (res.code == 200) {
          this.isPayLoading = false;
          this.isSubmitSuccess = true;
          uni.showToast({ title: "操作成功！", icon: "success", duration: 2000, mask: true });
          uni.setStorageSync("editedMatchData", JSON.stringify({ matches: [], betCount: 50 }));
          setTimeout(() => uni.navigateBack({ delta: 1 }), 2000);
        } else {
          this.isPayLoading = false;
          uni.showToast({ title: res.message || "投注失败", icon: "none" });
        }
      } catch (error) {
        this.isPayLoading = false;
        uni.showToast({ title: "网络异常，请稍后重试", icon: "none" });
        console.error("篮球胜负投注报错：", error);
      }
    },
    // 移除冗余方法（handleGotoHome/handleDeleteMatch/handleClearAll/invokeWxPayment/formDate）
    // 如需保留，可根据实际业务需求添加
  },
};
</script>

<style scoped lang="scss">
/* 全局样式：统一对齐让分胜负页 */
.scheme-edit-page {
  background-color: #f5f5f5;
  box-sizing: border-box;
  height: 100vh;
  margin: 0;
  padding: 0;
  // #ifdef H5
  overflow: hidden;
  // #endif
}

/* 核心修改：统一分端适配逻辑，对齐让分胜负页 */
.match-scroll {
  position: absolute !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
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

  // 统一分端设置bottom和height
  top: v-bind(headerTotalHeight + "px") !important;

  // 小程序端
  // #ifdef MP-WEIXIN
  bottom: calc(100rpx + env(safe-area-inset-bottom) + 90rpx) !important;
  height: calc(100vh - v-bind(headerTotalHeight + "px") - 100rpx - env(safe-area-inset-bottom) - 90rpx) !important;
  // #endif

  // APP端
  // #ifdef APP-PLUS
  bottom: calc(90rpx + constant(safe-area-inset-bottom) + 90rpx) !important;
  bottom: calc(90rpx + env(safe-area-inset-bottom) + 90rpx) !important;
  height: calc(100vh - v-bind(headerTotalHeight + "px") - 90rpx - env(safe-area-inset-bottom) - 90rpx) !important;
  // #endif

  // H5端
  // #ifdef H5
  bottom: calc(92rpx + env(safe-area-inset-bottom) + 90rpx) !important;
  height: calc(100vh - v-bind(headerTotalHeight + "px") - 92rpx - env(safe-area-inset-bottom) - 90rpx) !important;
  // #endif
}

/* 赛事列表样式：统一对齐让分胜负页 */
.match-list {
  width: 100%;
  box-sizing: border-box;

  .empty-tip {
    text-align: center;
    padding: 50rpx 0;
    font-size: 26rpx;
    color: #999;
    background: #fff;
    border-radius: 8rpx;
    margin: 20rpx 0;
  }

  .match-row {
    display: flex;
    background-color: #fff;
    border-bottom: 1rpx solid #eee; // 改回#eee，对齐让分胜负页
    padding: 12rpx 20rpx;
    align-items: center;
    margin-bottom: 4rpx;
    border-radius: 8rpx;
    box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.05);

    .match-category {
      width: 170rpx; // 改回170rpx，对齐让分胜负页
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4rpx;

      .league-name {
        font-size: 24rpx;
        color: #777;
        width: 100%;

        .single {
          display: inline-block;
          width: 44rpx;
          background: #b71c1c;
          color: #fff;
          text-align: center;
          border-top-right-radius: 15rpx;
          border-bottom-right-radius: 16rpx;
          margin-right: 10rpx;
          font-size: 20rpx;
          padding: 2rpx 0;
        }
      }

      .serial-number,
      .match-time {
        font-size: 22rpx;
        color: #999;
        text-align: center;
        width: 100%;
      }
    }

    .match-cells {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6rpx;
      padding-left: 16rpx;
      position: relative;

      .ai {
        position: absolute;
        right: 0;
        top: 0;
        font-size: 22rpx;
        color: #06f;
        letter-spacing: 4rpx;
        padding: 4rpx 8rpx;
        cursor: pointer;
      }

      .ai:active {
        color: #049;
      }

      .name-row {
        width: 100%;
        display: flex;
        align-items: center;
        font-size: 24rpx;
        color: #333;

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

        .rate-text.away {
          text-align: right;
          padding-right: 10rpx;
        }

        .rate-text.home {
          text-align: left;
          padding-left: 10rpx;
        }

        .vs-text {
          width: 40rpx;
          text-align: center;
          flex-shrink: 0;
        }
      }

      .odds-row {
        width: 100%;
        display: flex;
        gap: 2rpx;
        margin-top: 4rpx;

        .match-cell {
          flex: 1;
          text-align: center;
          padding: 12rpx 0; // 改回12rpx，对齐让分胜负页
          background-color: #f0f0f0;
          color: #333;
          font-size: 24rpx;
          border-radius: 4rpx;

          &.selected {
            background-color: #d92929;
            color: #fff;
          }

          &:active {
            background: #e5e5e5;
          }

          &.selected:active {
            background: #c62828;
          }
        }
      }
    }
  }
}

/* 投注栏样式：统一对齐让分胜负页 */
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

        // #ifdef MP-WEIXIN
        &:active {
          opacity: 0.8;
        }
        // #endif
      }
    }
  }
}

/* 手机号弹窗：样式完全不变 */
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

/* 全局样式兼容：统一保留 */
::-webkit-scrollbar {
  display: none;
}

button::after {
  border: none;
}
</style>
