<template>
  <!-- 篮球让分胜负编辑页：仅调整内容区高度，保留bet-bar原有兼容 -->
  <view class="scheme-edit-page">
    <!-- 自定义头部：不变 -->
    <CustomHeader 
      :ballTitle="'竞彩篮球'"
      title="让分胜负" 
      :showBack="true" 
      :showIcon="false" 
      @back-click="handleBack" 
    />

    <!-- 内容区：仅修改style，适配bet-bar的分端定位 -->
    <scroll-view 
      class="match-scroll" 
      scroll-y 
      :style="{ 
        top: headerTotalHeight + 'px',    // 头部高度仍用动态计算
        // 关键：删除原有的bottom和height，改为通过样式分端适配
      }"
    >
      <!-- 内部内容完全不变 -->
      <view class="match-list">
        <!-- 空状态 -->
        <view class="empty-tip" v-if="selectedMatchList.length === 0">暂无已选赛事</view>
        <!-- 已选赛事列表 -->
        <view v-for="(item, index) in selectedMatchList" :key="index" class="match-row">
          <!-- 左侧赛事分类 -->
          <view class="match-category">
            <view class="league-name" style="display: flex;justify-content: center;width: 100%;">
              <!-- <text class="single" :style="{backgroundColor: item.is_rsf_single == 1 ? '#b71c1c':'transparent'}">
                {{item.is_rsf_single == 1 ?  '单' : ''}}
              </text> -->
              {{ item.league_name }}
            </view>
            <view class="serial-number">{{ item.serial_number }}</view>
            <view class="match-time">{{ item.race_date }}</view>
          </view>
          <!-- 右侧让分胜负展示 -->
          <view class="match-cells">
            <view class="name-row">
              <text class="team-name away" :title="item.visiting_name">{{ item.visiting_name }}</text>
              <text class="vs-text">VS</text>
              <text class="team-name home">{{ item.home_name }}
                    <text v-if="item.r_goal && item.r_goal !== ''" class="handicap-num">
                      (
                      <text :class="{ 
                        'text-red': item.r_goal && item.r_goal.includes('+'), 
                        'text-green': item.r_goal && !item.r_goal.includes('+') 
                      }">
                        {{ item.r_goal }}
                      </text>
                      )
                    </text>
                </text>
            </view>
            <view class="rate-row">
              <text class="rate-text away" v-show="item.visiting_win_rate" :title="`胜率${item.visiting_win_rate}，约${item.home_goal_calculate}分`">
                胜率{{ item.visiting_win_rate || '--' }}，约{{ item.home_goal_calculate || '--' }}分
              </text>
              <text class="vs-text"></text>
              <text class="rate-text home" v-show="item.home_win_rate" :title="`胜率${item.home_win_rate}，约${item.visiting_goal_calculate}分`">
                胜率{{ item.home_win_rate || '--' }}，约{{ item.visiting_goal_calculate || '--' }}分
              </text>
            </view>
            <view class="odds-row">
              <view class="match-cell away" :class="{ selected: item.rAwaySelected }" >
                客胜{{ item.loss_multiplier || '--' }}
              </view>
              <view class="match-cell home" :class="{ selected: item.rHomeSelected }">
                主胜{{ item.win_multiplier || '--' }}
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部投注栏：完全保留你的原有代码 -->
    <view class="bet-bar" :style="{ 
      height: betBarFixedPx + 'px',  
      paddingBottom: safeAreaBottom + 'px', 
      bottom: safeAreaBottom + 'px' 
    }">
      <!-- 投注栏内部内容完全不变 -->
      <view class="bet-bar-top">
        <view class="top-left">
          {{selectedMatchList.length == 1 ? '单关': selectedMatchList.length + '串1'}}
        </view>
        <view class="multi-group">
          <text class="multi-label">投</text>
          <button class="multi-btn minus" @click="handleMinus" hover-class="none">-</button>
                   <view 
            class="multi-input" 
            @tap="showNumberKeyboard = true"
            :class="{ 'disabled': selectedMatchCount < 1 }"
          >
            {{ betCount }}
          </view>
          <button class="multi-btn plus" @click="handlePlus" hover-class="none">+</button>
          <text class="multi-unit">倍</text>
        </view>
      </view>
      <view class="bet-bar-bottom">
        <view class="bottom-middle">
          <text class="select-tip">共{{betNotes}}注 {{betCount}}倍  {{totalBetAmount}}</text>
          <text class="bonus-tip">{{calculateBonusText()}}</text>
        </view>
        <!-- <view class="bottom-right">
          <button class="confirm-btn" :disabled="selectedMatchCount === 0 || isPayLoading" @click="handleConfirmBet(false)">
            {{ isPayLoading ? "支付中..." : "模拟投注" }}
          </button>
        </view> -->
      </view>
    </view>

    <!-- 手机号弹窗：完全不变 -->
    <view class="phone-modal" v-if="showPhoneModal">
      <view class="modal-mask" @click="showPhoneModal = false"></view>
      <view class="modal-content">
        <view class="modal-desc">业务人员通过微信与您联系付款及打印彩票后给您发送图片留作兑奖凭证等后续流程</view>
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
// script部分完全保留你的原有代码（包括calcAllHeights、各种方法等）
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
      statusBarHeight: 0,    
      safeAreaBottom: 0,     
      headerTotalHeight: 0,  
      betBarFixedPx: 0,      
      betBarTotalHeight: 0,  
      isApp: false,          
      isMp: false,
      selectedCombo: "", // 用于接收串关类型，显示单关/几串几   
       showNumberKeyboard: false,         
    };
  },
  computed: {
    selectedMatchCount() {
      return this.selectedMatchList.filter(item => {
        return item.rHomeSelected || item.rAwaySelected;
      }).length;
    },
    betNotes() {
      if (this.selectedMatchList.length === 0) return 0;
      let notes = 1;
      this.selectedMatchList.forEach(item => {
        let count = 0;
        if (item.rHomeSelected) count++;
        if (item.rAwaySelected) count++;
        notes *= count > 0 ? count : 1;
      });
      return notes;
    },
    totalBetAmount() {
      return this.betNotes * this.betCount * 2;
    }
  },
  onShow() {
    uni.setTabBarStyle({ height: '0px' });
  },
  created() {
    const sys = uni.getSystemInfoSync();
    this.isApp = sys.platform === 'android' || sys.platform === 'ios';
    this.isMp = sys.platform === 'mp-weixin';
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
    uni.setTabBarStyle({ height: 'auto' });
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
    calcAllHeights() {
      const sys = uni.getSystemInfoSync();
      this.statusBarHeight = sys.statusBarHeight || 20;
      this.safeAreaBottom = (sys.safeAreaInsets?.bottom) || 0;
      const navBarFixedRpx = 80;
      const navBarFixedPx = (sys.screenWidth / 750) * navBarFixedRpx;
      this.headerTotalHeight = this.statusBarHeight + navBarFixedPx;
      const betBarFixedRpx = 180;
      this.betBarFixedPx = (sys.screenWidth / 750) * betBarFixedRpx;
      this.betBarTotalHeight = this.betBarFixedPx + this.safeAreaBottom;
    },
    calculateBonusText() {
      if (this.selectedMatchCount === 0) {
        return "预计：0.00";
      }
      const rowOddsList = [];
      this.selectedMatchList.forEach(item => {
        const selectedOdds = [];
        if (item.rHomeSelected) {
          const homeOdds = Number(item.win_multiplier) || 0;
          if (homeOdds > 0) selectedOdds.push(homeOdds);
        }
        if (item.rAwaySelected) {
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
      const isAllSingleSelect = rowOddsList.every(oddsArr => oddsArr.length === 1);
      let minOddsProduct = 1;
      let maxOddsProduct = 1;
      rowOddsList.forEach(oddsArr => {
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
    goToAiAnalysis(item) {
      try {
        uni.navigateTo({ 
          url: `/pages/test/index?id=${item.id}&isLottery=1&type=篮球让分胜负` 
        });
      } catch (err) {
        uni.showToast({ title: "暂未开放AI分析", icon: "none" });
        console.error("AI分析跳转失败：", err);
      }
    },
    toggleSelect(item, key) {
      if (item.is_discontinued === 1) return;
      this.$set(item, key, !item[key]);
    },
    saveEditedData() {
      const editedData = JSON.parse(JSON.stringify({
        matches: this.selectedMatchList,
        betCount: this.betCount
      }));
      uni.setStorageSync("editedMatchData", JSON.stringify(editedData));
    },
    handleBack() {
      this.saveEditedData();
      uni.navigateBack({ delta: 1 });
    },
    handleMinus() {
      if (this.betCount > 1) {
        this.betCount--;
      }
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
        contentJson: JSON.stringify(this.selectedMatchList.map(item => ({
          courseId: item.id,
          serialNumber: item.serial_number,
          leagueName: item.league_name,
          homeName: item.home_name,
          visitingName: item.visiting_name,
          raceDate: item.race_date,
          dateStr: item.date_str,
          isRHomeWin: item.rHomeSelected ? 1 : 0,
          isRAwayWin: item.rAwaySelected ? 1 : 0,
          rGoal: item.r_goal,
          rHomeOdds: item.win_multiplier,
          rAwayOdds: item.loss_multiplier,
          playType: "让分胜负",
          entityType: "篮球让分胜负",
          visitingWinRate: item.visiting_win_rate,
          homeWinRate: item.home_win_rate,
          homeGoalCalculate: item.home_goal_calculate,
          visitingGoalCalculate: item.visiting_goal_calculate
        }))),
        entityType: "篮球让分胜负",
        multiple: this.betNotes,
        bet: this.betCount,
        payment: this.totalBetAmount,
        payType: "wechat",
        userPhone: this.userPhone
      };
      try {
        const res = await purchasingLotteryApply(submitData);
        if (res.code == 200) {
          this.isPayLoading = false;
          this.isSubmitSuccess = true;
          uni.showToast({ title: "投注成功！", icon: "success", duration: 2000, mask: true });
          uni.setStorageSync("editedMatchData", JSON.stringify({ matches: [], betCount: 1 }));
          setTimeout(() => uni.navigateBack({ delta: 1 }), 2000);
        } else {
          this.isPayLoading = false;
          uni.showToast({ title: res.message || "投注失败", icon: "none" });
        }
      } catch (error) {
        this.isPayLoading = false;
        uni.showToast({ title: "网络异常，请稍后重试", icon: "none" });
        console.error("篮球让分胜负投注报错：", error);
      }
    }
  }
};
</script>

<style scoped lang="scss">
/* 全局样式：不变 */
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

/* 核心修改：给match-scroll添加分端的bottom和height，适配你的bet-bar */
.match-scroll {
  position: absolute !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  overflow-y: auto !important;
  background-color: #f5f5f5;
  box-sizing: border-box;
  padding: 10rpx 20rpx 20rpx;

  // 隐藏滚动条：不变
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }

  // ========== 关键：分端设置bottom和height，匹配你的bet-bar ==========
  // 头部高度：动态计算的headerTotalHeight（已转px）
  top: v-bind(headerTotalHeight + 'px') !important;

  // 小程序端：bottom = tabbar(100rpx) + 安全区 + bet-bar高度(90rpx)
  // #ifdef MP-WEIXIN
  bottom: calc(100rpx + env(safe-area-inset-bottom) + 90rpx) !important;
  height: calc(100vh - v-bind(headerTotalHeight + 'px') - 100rpx - env(safe-area-inset-bottom) - 90rpx) !important;
  // #endif

  // APP端：bottom = tabbar(90rpx) + 安全区 + bet-bar高度(90rpx)
  // #ifdef APP-PLUS
  bottom: calc(90rpx + constant(safe-area-inset-bottom) + 90rpx) !important;
  bottom: calc(90rpx + env(safe-area-inset-bottom) + 90rpx) !important;
  height: calc(100vh - v-bind(headerTotalHeight + 'px') - 90rpx - env(safe-area-inset-bottom) - 90rpx) !important;
  // #endif

  // H5端：bottom = 92rpx + 安全区 + bet-bar高度(90rpx)
  // #ifdef H5
  bottom: calc(92rpx + env(safe-area-inset-bottom) + 90rpx) !important;
  height: calc(100vh - v-bind(headerTotalHeight + 'px') - 92rpx - env(safe-area-inset-bottom) - 90rpx) !important;
  // #endif
}

/* match-list及内部样式：完全不变 */
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
    border-bottom: 1rpx solid #eee;
    padding: 12rpx 20rpx;
    align-items: center;
    margin-bottom: 4rpx;
    border-radius: 8rpx;
    box-shadow: 0 2rpx 5rpx rgba(0,0,0,0.05);
    
    .match-category {
      width: 170rpx;
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
          width: 40rpx; 
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
      .serial-number, .match-time {
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
              .handicap-num {
                font-weight:900;
      margin-left: 6rpx;
      // 让分正负颜色区分：+号红色，-号绿色
      .text-red {
        color: #d92929 !important;
        font-weight: 500;
      }
      .text-green {
        color: #31926e !important;
        font-weight: 500;
      }
    }
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
          padding: 12rpx 0;
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

/* bet-bar样式：完全保留你的原有代码 */
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
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 80rpx;
    padding: 10rpx 20rpx;
    border-bottom: 2rpx solid #eee;
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
    .multi-group {
      display: flex;
      align-items: center;
      gap: 10rpx;
      .multi-label {
        font-size: 30rpx;
        color: #333;
      }
      .multi-btn {
        width: 52rpx;
        height: 52rpx;
        background: #ddd;
        color: #333;
        font-size: 32rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1rpx solid #ccc;
        padding: 0;
        margin: 0;
        border-radius: 4rpx;
      }
      .multi-input {
        width: 180rpx;
        height: 52rpx;
        background: #fff;
        color: #333;
        text-align: center;
        font-size: 30rpx;
        border: 1rpx solid #ccc;
        padding: 0;
        box-sizing: border-box;
        border-radius: 4rpx;
        // #ifdef H5
        outline: none;
        // #endif
      }
      .multi-unit {
        font-size: 30rpx;
        color: #333;
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

/* 手机号弹窗：完全不变 */
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
    background: rgba(0,0,0,0.5);
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

/* 全局样式：不变 */
::-webkit-scrollbar {
  display: none;
}
button::after {
  border: none;
}
</style>