<template>
  <view class="scheme-edit-page">
    <!-- 顶部导航 -->
    <CustomHeader 
      :ballTitle="'足球'" 
      title="任9" 
      :showBack="true" 
      :showIcon="false" 
      @back-click="handleBack" 
    />

    <!-- 滚动展示区域：仅保留main-right核心内容，无任何操作 -->
    <scroll-view
      class="match-scroll"
      scroll-y
      :style="{
        top: headerTotalHeight + 'px',
        bottom: betBarTotalHeight + 'px',
      }"
    >
      <view class="match-list">
        <!-- 循环展示选中的赛事，仅渲染main-right内容 -->
        <view v-for="(item, index) in selectedMatchList" :key="index" class="match-row">
          <!-- 仅保留main-right核心结构，和List子组件样式对齐 -->
          <view class="main-right">
            <view class="top-right">
              <!-- 队名VS -->
              <view class="team-vs">
                <text class="team-name home">{{ item.home_name }}</text>
                <text class="vs-text">VS</text>
                <text class="team-name away">{{ item.visiting_name }}</text>
              </view>
              <view class="team-vs" style="color:#888;padding:0;">
                <text class="team-name home">胜{{ item.home_win_rate }}</text>
                <text class="vs-text">平{{item.draw_rate}}</text>
                <text class="team-name away">胜{{ item.visiting_win_rate }}</text>
              </view>
            </view>

            <!-- 3/1/0展示：仅显示选中状态，无点击 -->
            <view class="bottom-right">
              <view class="score-btn-group">
                <view 
                  class="score-btn" 
                  :class="{ selected: item.homeSelected }"
                >3</view>
                <view 
                  class="score-btn" 
                  :class="{ selected: item.vsSelected }"
                >1</view>
                <view 
                  class="score-btn" 
                  :class="{ selected: item.awaySelected }"
                >0</view>
              </view>
            </view>
          </view>
        </view>

        <view class="empty-tip" v-if="selectedMatchList.length === 0"> 暂无已选赛事 </view>
      </view>
    </scroll-view>

    <!-- 简化版bet-bar：仅展示，无操作（移除加减、输入、投注按钮） -->
    <view
      class="bet-bar"
      :style="{
        height: betBarFixedPx + 'px',
        paddingBottom: (isApp ? safeAreaBottom : 0) + 'px',
      }"
    >
      <view class="bet-bar-top">
        <!-- 移除倍数操作区，仅展示固定倍数 -->
        <view class="collapse-area">
          <view class="multi-group">
            <text class="multi-label">投</text>
            <button class="multi-btn minus" @click="handleMinus">-</button>
            <view class="multi-input" @tap="showNumberKeyboard = true" :class="{ disabled: selectedMatchCount < 1 }">
              {{ betCount }}
            </view>
            <button class="multi-btn plus" @click="handlePlus">+</button>
            <text class="multi-unit">倍</text>
          </view>
        </view>
      </view>
      <view class="bet-bar-bottom">
        <view class="bottom-middle">
          <text class="select-tip">共{{ betNotes }}注 {{ betCount }}倍 {{ totalBetAmount }}元</text>
        </view>
      </view>
    </view>
        <UniNumberKeyboard :show.sync="showNumberKeyboard" :value="betCount + ''" :allowDot="false" confirm-text="确认" :min="1" :max="50" @input="handleKeyboardInput" @confirm="handleKeyboardConfirm" />
  </view>
</template>

<script>
import CustomHeader from "@/components/CustomHeader.vue";
import { formatTimeToMDWeekHM } from "@/utils/data";

export default {
  components: { CustomHeader },
  data() {
    return {
      selectedMatchList: [], // 接收父组件传递的选中赛事
      betCount: 1, // 固定倍数，无修改
      statusBarHeight: 0, // 状态栏高度
      safeAreaBottom: 0, // 底部安全区高度
      headerTotalHeight: 0, // 导航栏总高度
      betBarFixedPx: 0, // 投注栏固定高度
      betBarTotalHeight: 0, // 投注栏总高度
      isApp: false, // 是否为App端
      selectedCombo: "", // 串关类型
      showNumberKeyboard: false,
    };
  },
  computed: {
    // 仅统计选中赛事数量，无修改逻辑
    selectedMatchCount() {
      return this.selectedMatchList.filter((item) => {
        return item.homeSelected || item.vsSelected || item.awaySelected;
      }).length;
    },
    // 计算投注注数：仅展示，无修改
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
    // 计算总投注金额：仅展示
    totalBetAmount() {
      return this.betNotes * this.betCount * 2;
    },
  },
  created() {
    const sys = wx.getWindowInfo();
    this.isApp = sys.platform === "android" || sys.platform === "ios";
    this.calcAllHeights(); // 计算适配高度
  },
  onLoad() {
    // 接收父组件传递的选中数据
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.on("selectedData", (data) => {
        this.selectedMatchList = data.matches || [];
        this.betCount = data.betCount || 1;
        this.selectedCombo = data.combo || "";
      });
    }
  },
  methods: {
        // 新增：处理自定义软键盘确认
    handleKeyboardConfirm(val) {
      const num = parseInt(val) || 1;
      this.betCount = Math.min(Math.max(num, 1), 50); // 最终限制1-50
      this.showNumberKeyboard = false; // 收起键盘
    },

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
    // 计算适配高度（兼容App/小程序）
    calcAllHeights() {
      const sys = wx.getWindowInfo();
      this.statusBarHeight = sys.statusBarHeight || 20;
       this.safeAreaBottom = (sys.safeAreaInsets && sys.safeAreaInsets.bottom) || 0;
      
      // 导航栏高度（80rpx转px）
      const navBarFixedRpx = 80;
      const navBarFixedPx = (sys.screenWidth / 750) * navBarFixedRpx;
      this.headerTotalHeight = this.statusBarHeight + navBarFixedPx;
      
      // 投注栏高度（200rpx转px）
      const betBarFixedRpx = 200;
      this.betBarFixedPx = (sys.screenWidth / 750) * betBarFixedRpx;
      this.betBarTotalHeight = this.betBarFixedPx + this.safeAreaBottom;
    },
    // 仅返回，无其他操作
    handleBack() {
      uni.navigateBack({ delta: 1 });
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
  // H5端滚动穿透兼容
  // #ifdef H5
  overflow: hidden;
  // #endif
}

// 滚动区样式：适配多端
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

  // 隐藏滚动条（全端）
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
    border-bottom: 1rpx solid #DEDEDE;
    box-sizing: border-box;
    padding: 8rpx 20rpx;
    margin-bottom: 10rpx;
    border-radius: 8rpx;
    width: 100%;
  }

  // 完全复用List子组件的main-right样式
  .main-right {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    background: #fff;
    box-sizing: border-box;
    overflow: hidden;
  }

  .top-right {
    flex: 1;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

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
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .team-name.home { text-align: right; padding-right: 10rpx; }
    .team-name.away { text-align: left; padding-left: 10rpx; }
    .vs-text {
      width: 80rpx;
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
    justify-content: space-between;
    padding-right: 10rpx;

    .rate-text {
      flex: 1;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rate-text.home { text-align: right; padding-right: 10rpx; }
    .rate-text.away { text-align: left; padding-left: 10rpx; }
    .vs-text {
      width: 80rpx;
      text-align: center;
      flex-shrink: 0;
      color: #999;
      font-size: 20rpx;
    }
    .ai-analysis-text {
      font-size: 24rpx;
      color: #06f;
      letter-spacing: 4rpx;
      flex-shrink: 0;
    }
  }

  .bottom-right {
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10rpx 0;
  }

  .score-btn-group {
    display: flex;
    width: 100%;
    justify-content: space-around;
    gap: 0;
  }

  .score-btn {
    width: 33.33%;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: #333;
    border: 1rpx solid #ddd;
    background-color: #fff;
    pointer-events: none; // 禁用点击
    &.selected {
      background-color: #d92929;
      color: #fff;
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

// 简化版bet-bar：仅展示，无操作
.bet-bar {
  position: fixed !important;
  width: 100% !important;
  left: 0 !important;
  bottom: 0 !important;
  z-index: 10 !important;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
  box-sizing: border-box !important;

  // 小程序/App安全区兼容
  // #ifdef MP-WEIXIN
  bottom: env(safe-area-inset-bottom) !important;
  // #endif
  // #ifdef APP-PLUS
  bottom: constant(safe-area-inset-bottom) !important;
  bottom: env(safe-area-inset-bottom) !important;
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
    height: 100rpx;
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
  }
}

// 隐藏滚动条（全端）
::-webkit-scrollbar {
  display: none;
}
</style>