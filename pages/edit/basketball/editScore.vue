<template>
  <!-- 篮球胜分差编辑页：统一适配逻辑，对齐其他篮球玩法页面 -->
  <view class="scheme-edit-page">
    <CustomHeader 
      :ballTitle="'篮球'"
      title="篮球-胜分差" 
      :showBack="true" 
      :showIcon="false" 
      @back-click="handleBack" 
    />

    <!-- 核心修改：移除content-wrap嵌套，统一用scroll-view绝对定位 -->
    <scroll-view 
      class="match-scroll" 
      scroll-y 
      :style="{ 
        top: headerTotalHeight + 'px'    // 动态绑定头部总高度
      }"
    >
      <view class="match-list">
        <view class="empty-tip" v-if="selectedMatchList.length === 0">暂无已选赛事</view>
        
        <!-- 胜分差赛事行：保留核心结构，对齐布局样式 -->
        <view v-for="(item, index) in selectedMatchList" :key="index" class="match-row">
          <!-- 左侧分类信息：统一170rpx宽度+居中 -->
          <view class="match-category">
            <view class="league-name-row">
              <!-- <text class="single-tag" v-if="item.is_sfc_single == 1">单</text> -->
              <text class="league-name">{{ item.league_name }}</text>
            </view>
            <view class="serial-number">{{ item.serial_number }}</view>
            <view class="match-time">{{ item.race_date }}</view>
          </view>

          <!-- 右侧核心内容：统一三列布局，保留胜分差特性 -->
          <view class="match-cells">
            <view class="name-row">
              <text class="team-name away">{{ item.visiting_name }}</text>
              <text class="vs-text">VS</text>
              <text class="team-name home">{{ item.home_name }}</text>
            </view>

            <!-- 胜行：保留胜分差胜字段，布局对齐 -->
            <view class="rate-row">
              <text class="rate-text away" v-if="item.visiting_win_rate">
                胜{{ item.visiting_win_rate || '--' }}，约{{ item.home_goal_calculate || '--' }}分
              </text>
              <text class="vs-text"></text>
              <text class="rate-text home" v-if="item.home_win_rate">
                胜{{ item.home_win_rate || '--' }}，约{{ item.visiting_goal_calculate || '--' }}分
              </text>
            </view>

            <!-- 胜分差选中内容：保留核心展示，样式对齐 -->
            <view class="selected-content" :class="{ 'selected-trigger': item.selectedScores && item.selectedScores.length > 0 }">
              <text v-if="item.selectedScores && item.selectedScores.length > 0" class="selected-text">
                {{ item.selectedScores.join(",") }}
              </text>
              <text v-else class="trigger-tip">无选中投注内容</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部投注栏：统一适配逻辑，对齐其他页面 -->
    <view class="bet-bar" :style="{ 
      height: betBarFixedPx + 'px',  
      paddingBottom: safeAreaBottom + 'px', 
      bottom: safeAreaBottom + 'px' 
    }">
      <view class="bet-bar-top">
        <view class="top-left">
          {{selectedMatchList.length == 1 ? '单关': selectedMatchList.length + '串1'}}
        </view>
        <view class="multi-group">
          <text class="multi-label">投</text>
          <button class="multi-btn minus" @click="handleMinus" hover-class="none">-</button>
          <!-- <input class="multi-input" type="number" v-model.number="betCount"  @input="handleBetInput" min="1" inputmode="numeric" /> -->
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
          <button class="confirm-btn" :disabled="selectedMatchCount === 0 || isPayLoading" @click="handleConfirmBet(false)" hover-class="none">
            {{ isPayLoading ? "支付中..." : "模拟投注" }}
          </button>
        </view> -->
      </view>
    </view>

    <!-- 手机号弹窗：样式不变，结构对齐 -->
    <view class="phone-modal" v-if="showPhoneModal">
      <view class="modal-mask" @click="showPhoneModal = false" hover-class="none"></view>
      <view class="modal-content">
        <view class="modal-desc">业务人员通过微信与您联系付款及打印彩票后给您发送图片留作兑奖凭证等后续流程</view>
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
import { purchasingLotteryApply } from "@/api/demo";
import { validateBetInput  } from '@/utils/validate';

export default {
  components: { CustomHeader },
  data() {
    return {
      selectedMatchList: [], // 接收列表的selectedScores数组
      betCount: 1,
      isPayLoading: false,
      isNeedUserPhone: 1,
      showPhoneModal: false,
      userPhone: '',
      isSubmitSuccess: false,
      statusBarHeight: 0,
      safeAreaBottom: 0,      // 新增：底部安全区高度
      headerTotalHeight: 0,   // 新增：头部总高度
      betBarFixedPx: 0,       // 新增：投注栏固定高度
      isApp: false,           // 新增：是否为APP端
      isMp: false,             // 新增：是否为小程序端'
      selectedCombo: "", // 用于接收串关类型，显示单关/几串几
       showNumberKeyboard: false,
    };
  },
  computed: {
    // 统计选中的胜分差赛事（匹配列表的selectedScores）
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
      return selectedRows.reduce((total, row) => total * row.selectedScores.length, 1);
    },
    totalBetAmount() {
      return this.betNotes * this.betCount * 2;
    }
  },
  onShow() {
    uni.setTabBarStyle({ height: '0px' });
  },
  created() {

    this.calcAllHeights(); // 统一计算高度
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
      this.saveEditedData(); // 统一保存数据方法
    }
    uni.setTabBarStyle({ height: 'auto' }); // 恢复tabbar
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
    // 统一高度计算逻辑，对齐其他篮球玩法页面
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

    // 统一保存数据方法
    saveEditedData() {
      const editedData = JSON.parse(JSON.stringify({
        matches: this.selectedMatchList,
        betCount: this.betCount
      }));
      uni.setStorageSync("editedMatchData", JSON.stringify(editedData));
    },

    // AI分析方法（保留空实现，避免报错）
    handleAiAnalysis(item) {
      // 可补充AI分析逻辑，此处保留空方法
      console.log("AI分析：", item);
    },

    // 篮球胜分差 - 优化版奖金计算方法（保留核心逻辑，统一格式）
    calculateBonusText() {
      // 边界判断：无选中赛事时，返回空提示
      if (this.selectedMatchCount === 0) {
        return "预计：0.00";
      }

      // 步骤1：胜分差赔率映射表（匹配后端返回的字段名）
      const oddsMap = {
        '1-5': { home: 'h_sfc1_5', away: 'v_sfc1_5' },
        '6-10': { home: 'h_sfc6_10', away: 'v_sfc6_10' },
        '11-15': { home: 'h_sfc11_15', away: 'v_sfc11_15' },
        '16-20': { home: 'h_sfc16_20', away: 'v_sfc16_20' },
        '21-25': { home: 'h_sfc21_25', away: 'v_sfc21_25' },
        '26+': { home: 'h_sfc26_jia', away: 'v_sfc26_jia' }
      };

      // 步骤2：收集「每一场所有选中的主/客队赔率」
      const perMatchMinMax = [];
      this.selectedMatchList.forEach(item => {
        const allSelectedOdds = [];
        
        // 解构响应式对象，获取真实值
        const itemRaw = JSON.parse(JSON.stringify(item));
        const selectedScores = itemRaw.selectedScores || [];

        if (selectedScores.length > 0) {
          selectedScores.forEach(score => {
            if (!score) return;
            const pureScore = String(score).trim();
            
            // 适配「客胜xxx」/「主胜xxx」格式
            let isAway = false;
            let cleanScore = pureScore;
            
            if (pureScore.startsWith('主负')) {
              isAway = true;
              cleanScore = pureScore.slice(2).trim().replace(/\s+/g, '');
            } else if (pureScore.startsWith('主胜')) {
              isAway = false;
              cleanScore = pureScore.slice(2).trim().replace(/\s+/g, '');
            }

            // 匹配赔率映射表
            const mapItem = oddsMap[cleanScore];
            if (!mapItem) return;
            
            // 提取对应赔率值
            const oddsField = isAway ? mapItem.away : mapItem.home;
            const oddsValue = item[oddsField];

            // 过滤无效值，转换为数字
            const validOdds = Number(oddsValue);
            if (!isNaN(validOdds) && validOdds > 0 && oddsValue !== '--') {
              allSelectedOdds.push(validOdds);
            }
          });
        }

        // 记录本场最小/最大赔率
        if (allSelectedOdds.length > 0) {
          perMatchMinMax.push({
            min: Math.min(...allSelectedOdds),
            max: Math.max(...allSelectedOdds)
          });
        }
      });

      // 边界判断：无有效赔率
      if (perMatchMinMax.length === 0) {
        return "预计：0.00";
      }

      // 步骤3：计算总乘积
      let totalMin = 1;
      let totalMax = 1;
      perMatchMinMax.forEach(match => {
        totalMin *= match.min;
        totalMax *= match.max;
      });

      // 步骤4：计算奖金（统一保留2位小数）
      const validBetCount = Number(this.betCount) || 1;
      const base = 2 * validBetCount;
      const minBonus = (totalMin * base).toFixed(2);
      const maxBonus = (totalMax * base).toFixed(2);

      // 步骤5：返回结果
      return `预计：${minBonus} ~ ${maxBonus}`;
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

    // 返回列表页（统一逻辑）
    handleBack() {
      this.saveEditedData();
      uni.navigateBack({ delta: 1 });
    },

    // 减少投注倍数（统一逻辑）
    handleMinus() {
      if (this.betCount > 1) {
        this.betCount--;
      }
    },

    // 倍数输入校验（统一逻辑）
    handleBetInput(e) {
      const inputVal = e.detail.value;
      const validVal = validateBetInput(inputVal);
      
      this.betCount = null;
      this.$nextTick(() => {
        this.betCount = validVal;
      });
    },

    // 增加投注倍数（统一逻辑）
    handlePlus() {
      if (this.selectedMatchCount < 1) return;
      if (this.betCount < 50) {
        this.betCount++;
      } else {
        uni.showToast({ title: "倍数最多50倍", icon: "none" });
      }
    },

    // 模拟投注（保留胜分差字段，统一逻辑）
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
      // 构造胜分差提交数据
      const list = this.selectedMatchList.map(item => ({
        courseId: item.id,
        serialNumber: item.serial_number,
        leagueName: item.league_name,
        homeName: item.home_name,
        visitingName: item.visiting_name,
        raceDate: item.race_date,
        dateStr: item.date_str,
        selectedScoreDiff: item.selectedScores,
        // 胜分差赔率
        homeScoreDiffOdds: {
          '1-5': item.h_sfc1_5,
          '6-10': item.h_sfc6_10,
          '11-15': item.h_sfc11_15,
          '16-20': item.h_sfc16_20,
          '21-25': item.h_sfc21_25,
          '26+': item.h_sfc26_jia
        },
        awayScoreDiffOdds: {
          '1-5': item.v_sfc1_5,
          '6-10': item.v_sfc6_10,
          '11-15': item.v_sfc11_15,
          '16-20': item.v_sfc16_20,
          '21-25': item.v_sfc21_25,
          '26+': item.v_sfc26_jia
        },
        // 胜/分数字段
        away_win_rate: item.away_win_rate,
        home_win_rate: item.home_win_rate,
        away_goal_calculate: item.away_goal_calculate,
        home_goal_calculate: item.home_goal_calculate,
        playType: "胜分差",
        entityType: "篮球胜分差"
      }));

      const payRequestData = {
        contentJson: JSON.stringify(list),
        entityType: "篮球胜分差",
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
          uni.showToast({ title: "投注成功！", icon: "success", duration: 2000, mask: true });
          uni.setStorageSync("editedMatchData", JSON.stringify({ matches: [], betCount: 1 }));
          setTimeout(() => uni.navigateBack({ delta: 1 }), 2000);
        } else {
          this.isPayLoading = false;
          uni.showToast({ title: res.message || "获取支付信息失败", icon: "none" });
        }
      } catch (error) {
        this.isPayLoading = false;
        uni.showToast({ title: "网络异常，请稍后重试", icon: "none" });
        console.error("胜分差投注报错：", error);
      }
    }
  }
};
</script>

<style scoped lang="scss">
/* 全局样式：统一对齐其他篮球玩法页面 */
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

/* 核心修改：修复适配逻辑，确保内容区高度正确 */
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

  // 统一分端设置bottom和height（修复计算逻辑）
  top: v-bind(headerTotalHeight + 'px') !important;

  // 小程序端
  // #ifdef MP-WEIXIN
  bottom: calc(100rpx + env(safe-area-inset-bottom) + 90rpx) !important;
  height: calc(100vh - v-bind(headerTotalHeight + 'px') - 100rpx - env(safe-area-inset-bottom) - 90rpx) !important;
  // #endif

  // APP端
  // #ifdef APP-PLUS
  bottom: calc(90rpx + constant(safe-area-inset-bottom) + 90rpx) !important;
  bottom: calc(90rpx + env(safe-area-inset-bottom) + 90rpx) !important;
  height: calc(100vh - v-bind(headerTotalHeight + 'px') - 90rpx - env(safe-area-inset-bottom) - 90rpx) !important;
  // #endif

  // H5端
  // #ifdef H5
  bottom: calc(92rpx + env(safe-area-inset-bottom) + 90rpx) !important;
  height: calc(100vh - v-bind(headerTotalHeight + 'px') - 92rpx - env(safe-area-inset-bottom) - 90rpx) !important;
  // #endif
}

/* 赛事列表样式：修复selected-content布局 */
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

  /* 赛事行：调整内边距，避免拥挤 */
  .match-row {
    display: flex;
    background-color: #fff;
    border-radius: 8rpx;
    padding: 16rpx 20rpx; /* 增加内边距，优化间距 */
    align-items: flex-start; /* 改为顶部对齐，避免内容被压缩 */
    margin-bottom: 15rpx;
    box-shadow: 0 2rpx 5rpx rgba(0,0,0,0.05);

    /* 左侧分类信息：统一170rpx宽度+居中 */
    .match-category {
      width: 170rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6rpx; /* 增加间距，优化排版 */

      .league-name-row {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        font-size: 24rpx;
        color: #777;

        .single-tag {
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

      .serial-number, .match-time {
        font-size: 22rpx;
        color: #999;
        text-align: center;
        width: 100%;
      }
      .match-time {
        font-size: 16rpx;
        margin-top: 20rpx;
      }
    }

    /* 右侧核心内容：修复selected-content布局 */
    .match-cells {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8rpx; /* 增加间距，优化排版 */
      padding-left: 16rpx;

      // 队名行：调整字体大小，避免拥挤
      .name-row {
        width: 100%;
        display: flex;
        align-items: center;
        font-size: 26rpx; /* 减小字体，优化排版 */
        font-weight: 500;
        color: #333;
        cursor: pointer;

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
        &:active {
          color: #d92929;
        }
      }

      // 胜行：调整字体大小
      .rate-row {
        width: 100%;
        display: flex;
        align-items: center;
        font-size: 20rpx; /* 减小字体，优化排版 */
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

      // 胜分差选中内容：修复布局，支持换行
      .selected-content {
        box-sizing: border-box;
        width: 100%; /* 横向填满父容器 */
        border: 1rpx solid #66cdaa;
        border-radius: 8rpx;
        padding: 12rpx 16rpx; /* 调整内边距 */
        background-color: #f9f9f9;
        min-height: 60rpx; /* 固定最小高度 */
        max-height: 120rpx; /* 限制最大高度，避免占用过多空间 */
        display: -webkit-box; /* 核心：多行省略需要的弹性盒 */
        -webkit-box-orient: vertical; /* 垂直排列 */
        -webkit-line-clamp: 1; /* 最多显示2行，超出省略 */
        overflow: hidden; /* 隐藏超出内容 */
        text-overflow: ellipsis; /* 省略号 */

        .trigger-tip {
          font-size: 24rpx;
          color: #999;
        }

        &.selected-trigger {
          background-color: #d92929;
          border-color: #d92929;
          color: #fff;
        }

        .selected-text {
          font-size: 24rpx;
          color: #fff;
          line-height: 36rpx; /* 增加行高，优化换行排版 */
          margin-right: 10rpx; /* 增加选项之间的间距 */
          width: 100%;
          

        }
      }
    }
  }
}

/* 底部投注栏：保持不变 */
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
        
        &:active {
          background: #c62828;
        }
      }
    }
  }
}

/* 手机号弹窗：保持不变 */
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
    background: rgba(0,0,0,0.6);
  }
  
  .modal-content {
    width: 90%;
    max-height: 80vh;
    background: #fff;
    border-radius: 12rpx;
    z-index: 9999999;
    overflow-y: auto;
    box-sizing: border-box;
    padding: 20rpx;
    // #ifdef APP-PLUS
    padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    // #endif

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
      gap: 8rpx;
      
      button {
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
        background: #f0f0f0;
        color: #333;
        &:active { background: #e0e0e0; }
      }
      
      .confirm-btn {
        background: #d92929;
        color: #fff;
        &:active { background: #c62828; }
      }
    }
  }
}

/* 全局样式兼容 */
::-webkit-scrollbar {
  display: none;
}

button::after {
  border: none;
}
</style>