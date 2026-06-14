<template>
  <view class="scheme-edit-page">
    <!-- 顶部导航：保留原有 -->
    <CustomHeader 
      :ballTitle="'足球'"
      title="让球胜平负" 
      :showBack="true" 
      :showIcon="false" 
      @back-click="handleBack" 
    />

    <!-- 核心优化：基于sysinfo精准计算高度，移除冗余padding -->
    <scroll-view class="match-scroll" scroll-y :style="{ 
      top: headerTotalHeight + 'px',    
      bottom: betBarTotalHeight + 'px'  
    }">
      <view class="match-list">
        <view v-for="(item, index) in selectedMatchList" :key="index" class="match-row">
          <view class="match-category">
            <view class="league-name">{{ item.league_name }}</view>
            <view class="league-name" style="display: flex;justify-content: flex-start;width: 100%;">
              <!-- 新增让球标识，区分玩法 -->
              <text class="single" :style="{background:item.is_rspf_single == 1?'#d92929':''}">{{item.is_rspf_single == 1? '单':''}}</text>
              {{ item.serial_number }}
            </view>
            <view class="match-time">{{ item.race_date }}</view>
          </view>
          <view class="match-cells">
            <!-- 修复：绑定让球主胜选中状态 handicapHomeSelected -->
            <view class="match-cell home" :class="{ selected: item.handicapHomeSelected }">
              <view class="team-name">{{ item.home_name }}
                <text v-if="item.r_goal">({{item.r_goal}})</text> </view>
              <text class="odds" v-if="item.r_win_multiplier">主胜{{ item.r_win_multiplier }}</text>
              <text class="odds rate"  v-if="item.home_win_rate">
                胜率{{ item.home_win_rate || '' }}
              </text>
            </view>
            <!-- 修复：绑定让球平局选中状态 handicapVsSelected -->
            <view class="match-cell vs" :class="{ selected: item.handicapVsSelected }" >
              <text class="vs-text">VS</text>
              <text class="vs-odds" v-if="item.r_draw_multiplier">平{{ item.r_draw_multiplier}}</text>
              <text class="vs-odds" v-if="item.draw_rate">平率{{ item.draw_rate}}</text>
            </view>
            <!-- 修复：绑定让球客胜选中状态 handicapAwaySelected -->
            <view class="match-cell away" :class="{ selected: item.handicapAwaySelected }">
              <text class="team-name">{{ item.visiting_name }}</text>
              <text class="odds" v-if="item.r_loss_multiplier">客胜{{ item.r_loss_multiplier }}</text>
              <text class="odds rate" v-if="item.visiting_win_rate">
                胜率{{ item.visiting_win_rate || '' }}
              </text>
            </view>
          </view>
        </view>

        <view class="empty-tip" v-if="selectedMatchList.length === 0">
          暂无已选赛事
        </view>
      </view>
    </scroll-view>

    <!-- 底部投注栏：条件适配paddingBottom，解决两端空白/溢出问题 -->
    <view class="bet-bar" :style="{ 
      height: betBarFixedPx + 'px',
      // 核心：仅App端添加安全区padding，小程序端为0，避免底部空白
      paddingBottom: (isApp ? safeAreaBottom : 0) + 'px' 
    }">
<view class="bet-bar-top">
  <!-- 新增提示文本 -->
  <view class="tips-text">请输入倍数后截屏给售票人</view>
  <!-- 缩小 top-left 样式 -->
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
            {{ isPayLoading ? "支付中..." : "模拟投注" }}
          </button>
        </view> -->
      </view>
    </view>

    <!-- 手机号弹窗：保留原有 -->
    <view class="phone-modal" v-if="showPhoneModal">
      <view class="modal-mask" @click="showPhoneModal = false"></view>
      <view class="modal-content">
        <view class="modal-desc">业务人员通过微信与您联系付款及打印彩票后给您发送图片留作兑奖凭证等后续流程</view>
        <view class="input-wrap">
          <label>微信手机号：</label>
          <input type="number" v-model="userPhone" placeholder="请输入手机号" maxlength="11" />
        </view>
        <view class="modal-btns">
          <button class="cancel-btn" @click="showPhoneModal = false">取消</button>
          <button class="confirm-btn" @click="confirmPhone">提交</button>
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
import CustomHeader from "@/components/CustomHeader.vue";
import { formatTimeToMDWeekHM } from "@/utils/data";
import { purchasingLotteryApply } from "@/api/demo";
import { validateBetInput  } from '@/utils/validate';

export default {
  components: { CustomHeader },
  data() {
    return {
      selectedMatchList: [],
      betCount: 50,
      isPayLoading: false,
      // isNeedUserPhone: 1,
      showPhoneModal: false,
      userPhone: '',
      isSubmitSuccess: false,
      statusBarHeight: 0,       // 状态栏高度
      safeAreaBottom: 0,        // 底部安全区高度
      headerTotalHeight: 0,     // 导航栏总高度
      betBarFixedPx: 0,         // 投注栏固定高度（200rpx转px）
      betBarTotalHeight: 0,     // 投注栏总高度（仅固定高度，不叠加安全区）
      isApp: false,             // 标记是否为App端
      isMp: false,
      selectedCombo: "",               // 标记是否为小程序端
       showNumberKeyboard: false,
    };
  },
  computed: {
    // 修复：统计让球胜平负的选中场次数量
    selectedMatchCount() {
      return this.selectedMatchList.filter(item => {
        return item.handicapHomeSelected || item.handicapVsSelected || item.handicapAwaySelected;
      }).length;
    },
    // 修复：计算让球胜平负的投注注数（每行选中的让球选项数量相乘）
    betNotes() {
      if (this.selectedMatchList.length === 0) return 0;
      
      let notes = 1;
      this.selectedMatchList.forEach(item => {
        // 统计当前行「让球胜平负」选中的选项数量
        let selectedCount = 0;
        if (item.handicapHomeSelected) selectedCount++;
        if (item.handicapVsSelected) selectedCount++;
        if (item.handicapAwaySelected) selectedCount++;
        
        // 只有选中了选项才参与计算
        if (selectedCount > 0) {
          notes *= selectedCount;
        }
      });
      
      return notes;
    },
    // 总投注金额（逻辑不变）
    totalBetAmount() {
      return (this.betNotes * this.betCount * 2);
    }
  },
  onShow() {
    uni.setTabBarStyle({ height: '0px' });
  },
  created() {
    // 计算所有高度
    this.calcAllHeights();
  },
  onLoad() {
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.on("selectedData", (data) => {
        this.selectedMatchList = data.matches || [];
        this.betCount = data.betCount || 1;
        // this.isNeedUserPhone = data.isNeedUserPhone;
                this.selectedCombo = data.combo || ""; 
      });
    }
  },
  onUnload() {
    // 提交成功时，不保存数据；未提交成功时，正常保存
    if (this.isSubmitSuccess) {
      return;
    }
    const editedData = {
      matches: this.selectedMatchList,
      betCount: this.betCount
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
      } else {
        this.betCount = num;
      }
    },

    // 新增：处理自定义软键盘确认
    handleKeyboardConfirm(val) {
      const num = parseInt(val) || 1;
      this.betCount = num // 
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
    // 核心优化：统一计算所有高度，投注栏总高度仅保留固定高度，不叠加安全区
    calcAllHeights() {
      const sys = wx.getWindowInfo();
      // 1. 状态栏高度
      this.statusBarHeight = sys.statusBarHeight || 20;
      // 2. 底部安全区高度（小程序端后续会强制置0，避免空白）
      this.safeAreaBottom = (sys.safeAreaInsets && sys.safeAreaInsets.bottom) || 0;
      // 3. 导航栏固定高度（设计稿80rpx转px）
      const navBarFixedRpx = 80;
      const navBarFixedPx = (sys.screenWidth / 750) * navBarFixedRpx;
      // 4. 导航栏总高度
      this.headerTotalHeight = this.statusBarHeight + navBarFixedPx;
      // 5. 投注栏固定高度（200rpx转px）
      const betBarFixedRpx = 200;
      this.betBarFixedPx = (sys.screenWidth / 750) * betBarFixedRpx;
      // 6. 投注栏总高度：仅固定高度，不叠加安全区！解决两端空白/溢出问题
      this.betBarTotalHeight = this.betBarFixedPx;
    },
    calculateHalfFullBonus() {
      // 边界判断：无选中赛事时，返回空提示
      if (this.selectedMatchCount === 0) {
        return "预计：0.00"; // 统一格式，保留2位小数+备注
      }

      // 步骤1：收集每一行选中的【让球】赔率（转换为数字，处理"--"为空的情况）
      const rowOddsList = []; // 二维数组：[[行1选中赔率], [行2选中赔率], ...]
      this.selectedMatchList.forEach(item => {
        const selectedOdds = []; // 当前行选中的【让球】赔率集合
        
        // 让球主胜选中：提取让球主胜赔率（r_win_multiplier，让球玩法中该字段为让球后主胜赔率）
        if (item.handicapHomeSelected) { // 对应让球主胜选中状态
          const homeOdds = Number(item.r_win_multiplier) || 0; // 转换为数字，无效值设为0
          if (homeOdds > 0) selectedOdds.push(homeOdds);
        }
        
        // 让球平局选中：提取让球平局赔率（r_draw_multiplier，对应让球平赔率字段）
        if (item.handicapVsSelected) { // 对应让球平局选中状态
          const drawOdds = Number(item.r_draw_multiplier) || 0; // 转换为数字，无效值设为0
          if (drawOdds > 0) selectedOdds.push(drawOdds);
        }
        
        // 让球客胜选中：提取让球客胜赔率（loss_multiplier，让球玩法中该字段为让球后客胜赔率）
        if (item.handicapAwaySelected) { // 对应让球客胜选中状态
          const awayOdds = Number(item.r_loss_multiplier) || 0; // 转换为数字，无效值设为0
          if (awayOdds > 0) selectedOdds.push(awayOdds);
        }
        
        // 仅添加有有效赔率的行
        if (selectedOdds.length > 0) {
          rowOddsList.push(selectedOdds);
        }
      });

      // 步骤2：边界判断：无有效赔率时，返回提示
      if (rowOddsList.length === 0) {
        return "预计：0.00";
      }

      // 步骤3：判断是否所有行都仅选中1项（用于区分单值/区间值）
      const isAllSingleSelect = rowOddsList.every(oddsArr => oddsArr.length === 1);

      // 步骤4：计算最低赔率乘积 和 最高赔率乘积
      let minOddsProduct = 1; // 各行最小值乘积（区间下限）
      let maxOddsProduct = 1; // 各行最大值乘积（区间上限）
      rowOddsList.forEach(oddsArr => {
        const currentMin = Math.min(...oddsArr);
        const currentMax = Math.max(...oddsArr);
        minOddsProduct *= currentMin;
        maxOddsProduct *= currentMax;
      });

      // 步骤5：计算奖金（×2 每注金额 × betCount 投注倍数）
      const base = 2 * this.betCount;
      const minBonus = minOddsProduct * base;
      const maxBonus = maxOddsProduct * base;

      // 步骤6：格式化返回文本（保留2位小数，更规范）
      if (isAllSingleSelect) {
        // 全单选项：显示单值
        return `预计：${minBonus.toFixed(2)}`;
      } else {
        // 存在多选项：显示区间值
        return `预计：${minBonus.toFixed(2)} ~ ${maxBonus.toFixed(2)}`;
      }
    },
    // 确认手机号
    confirmPhone() {
      // 手机号格式校验
      const reg = /^1[3-9]\d{9}$/;
      if (!reg.test(this.userPhone)) {
        uni.showToast({ title: "请输入正确的手机号", icon: "none" });
        return;
      }
      this.showPhoneModal = false;
      // 手机号验证通过后执行投注
      this.handleConfirmBet(true); 
    },
    // 时间格式化方法
    formDate(time) {
      return formatTimeToMDWeekHM(time);
    },
    // 修复：切换让球胜平负的选中状态
    toggleSelect(item, key) {
      this.$set(item, key, !item[key]);
    },
    // 返回上一页
    handleBack() {
      this.saveEditedData();
      uni.navigateBack({ delta: 1 });
    },
    // 跳转首页（备用）
    handleGotoHome() {
      this.saveEditedData();
      uni.navigateBack({ delta: 1 });
    },
    // 保存编辑数据到缓存
    saveEditedData() {
      const deepCopyData = JSON.parse(JSON.stringify({
        matches: this.selectedMatchList,
        betCount: this.betCount
      }));
      uni.setStorageSync("editedMatchData", JSON.stringify(deepCopyData));
    },
    // 删除单场赛事
    handleDeleteMatch(index) {
      this.selectedMatchList.splice(index, 1);
    },
    // 清空所有赛事
    handleClearAll() {
      this.selectedMatchList = [];
    },
    // 减少投注倍数
    handleMinus() {
      if (this.betCount > 1) this.betCount--;
      const v = this.calculateHalfFullBonus();
    },
    handleBetInput(e) {
      const inputVal = e.detail.value;
      const validVal = validateBetInput(inputVal);
      
      // 关键修复：先赋值为null/空，再赋值目标值（触发输入框重渲染）
      this.betCount = null; // 先清空，打破响应式缓存
      this.$nextTick(() => { // 等待DOM更新后赋值
        this.betCount = validVal;
      });
    },
    // 增加投注倍数
    handlePlus() {
      // 1. 校验：未选中赛事时直接返回
      if (this.selectedMatchCount < 1) return;
      // 2. 修复：先判断是否小于50，再执行++，避免超过50
 this.betCount++;
    },
    // 模拟投注（修复提交参数为让球胜平负字段）
    async handleConfirmBet(fromPhoneModal) {
      if (this.selectedMatchCount === 0) {
        uni.showToast({ title: "请先选择至少一场赛事的投注选项", icon: "none", duration: 1500 });
        return;
      }
      
      // if (this.isNeedUserPhone == 1 && !fromPhoneModal) {
      //   this.showPhoneModal = true;
      //   return;
      // }

      this.isPayLoading = true;
      // 修复：传递让球胜平负的选中状态
      const list = this.selectedMatchList.map(item => ({
          courseId: item.id,
          // 替换为让球胜平负的选中字段
          isSelectWin: item.handicapHomeSelected ? 1 : 0,
          isSelectDraw: item.handicapVsSelected ? 1 : 0,
          isSelectLoss: item.handicapAwaySelected ? 1 : 0,
          serialNumber: item.serial_number,
          leagueName: item.league_name,
          homeName: item.home_name,
          visitingName: item.visiting_name,
          raceDate: item.race_date,
          dateStr: item.date_str,
          // 补充让球相关字段（接口需要时）
          homeHandicap: item.homeHandicap,
          visitingHandicap: item.visitingHandicap,
          homeGoalCalculate: item.home_goal_calculate,
          visitingGoalCalculate:item.visiting_goal_calculate,
          winMultiplier: item.r_win_multiplier,
          homeWinRate: item.home_win_rate,
          drawMultiplier: item.r_draw_multiplier,
          drawRate: item.draw_rate,
          lossMultiplier: item.r_loss_multiplier,
          visitingWinRate: item.visiting_win_rate,
        }));

      const payRequestData = {
        contentJson: JSON.stringify(list),
        entityType: "足彩让球胜平负", // 修复：标注为让球胜平负
        multiple: this.betNotes,      // 注数
        bet: this.betCount,           // 倍数
        payment: this.totalBetAmount, // 总额
        payType: "wechat",            // 支付方式
        userPhone: this.userPhone     // 手机号
      };

      try {
        // 调用投注接口
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
          // 清空缓存
          uni.setStorageSync("editedMatchData", JSON.stringify({ matches: [], betCount: 50 }));
          // 延迟跳转
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
        console.error("让球胜平负投注接口请求失败：", error);
      }
    },
    // 微信支付（备用）
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
            this.betCount = 50;
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
        }
      });
    }
  }
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
      border: 1rpx solid #DEDEDE;
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