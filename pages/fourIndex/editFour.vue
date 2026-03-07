<template>
  <view class="scheme-edit-page">
    <!-- 顶部导航 -->
    <CustomHeader 
      :ballTitle="'足球'" 
      title="4场" 
      :showBack="true" 
      :showIcon="false" 
      @back-click="handleBack" 
    />

    <!-- 滚动展示区域：适配4场的赛事展示 -->
    <scroll-view
      class="match-scroll"
      scroll-y
      :style="{
        top: headerTotalHeight + 'px',
        bottom: betBarTotalHeight + 'px',
      }"
    >
      <view class="match-list">
        <!-- 循环展示选中的4场赛事 -->
        <view v-for="(item, index) in selectedMatchList" :key="index" class="match-row">
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

            <!-- 4场核心：主/客进球数矩阵展示（仅展示，无点击） -->
            <view class="bottom-right">
              <view class="score-matrix">
                <!-- 主队行 -->
                <view class="matrix-row">
                  <view class="matrix-label">主</view>
                  <view class="matrix-cell" :class="{ selected: item.homeScoreSelected.includes(0) }">0</view>
                  <view class="matrix-cell" :class="{ selected: item.homeScoreSelected.includes(1) }">1</view>
                  <view class="matrix-cell" :class="{ selected: item.homeScoreSelected.includes(2) }">2</view>
                  <view class="matrix-cell" :class="{ selected: item.homeScoreSelected.includes('3+') }">3+</view>
                </view>

                <!-- 客队行 -->
                <view class="matrix-row">
                  <view class="matrix-label">客</view>
                  <view class="matrix-cell" :class="{ selected: item.awayScoreSelected.includes(0) }">0</view>
                  <view class="matrix-cell" :class="{ selected: item.awayScoreSelected.includes(1) }">1</view>
                  <view class="matrix-cell" :class="{ selected: item.awayScoreSelected.includes(2) }">2</view>
                  <view class="matrix-cell" :class="{ selected: item.awayScoreSelected.includes('3+') }">3+</view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="empty-tip" v-if="selectedMatchList.length === 0"> 暂无已选赛事 </view>
      </view>
    </scroll-view>

    <!-- 4场专属投注栏：保留倍数操作，适配4串1规则 -->
    <view
      class="bet-bar"
      :style="{
        height: betBarFixedPx + 'px',
        paddingBottom: (isApp ? safeAreaBottom : 0) + 'px',
      }"
    >
      <view class="bet-bar-top">
        <view class="collapse-area">
          <view class="multi-group">
            <text class="multi-label">投</text>
            <button class="multi-btn minus" @click="handleMinus">-</button>
            <view class="multi-input" @tap="showNumberKeyboard = true" :class="{ disabled: selectedMatchCount < 4 }">
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
          <text class="combo-tip">4串1 | 4场</text>
        </view>
      </view>
    </view>
    
    <!-- 自定义数字键盘：限制1-50倍 -->
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
export default {
  components: { CustomHeader },
  data() {
    return {
      selectedMatchList: [], // 接收父组件传递的4场选中赛事
      betCount: 1, // 投注倍数（1-50）
      statusBarHeight: 0, // 状态栏高度
      safeAreaBottom: 0, // 底部安全区高度
      headerTotalHeight: 0, // 导航栏总高度
      betBarFixedPx: 0, // 投注栏固定高度
      betBarTotalHeight: 0, // 投注栏总高度
      isApp: false, // 是否为App端
      showNumberKeyboard: false, // 数字键盘显示状态
      isNeedUserPhone: 1 // 是否需要手机号（父组件传递）
    };
  },
  computed: {
    // 统计选中的有效赛事数量（需有主/客进球数选中）
    selectedMatchCount() {
      return this.selectedMatchList.filter((item) => {
        return item.homeScoreSelected.length > 0 || item.awayScoreSelected.length > 0;
      }).length;
    },
    // 计算4场注数：每个赛事的主/客选中项数乘积之和（4串1规则）
    betNotes() {
      if (this.selectedMatchList.length !== 4) return 0;
      
      let notes = 1;
      this.selectedMatchList.forEach((item) => {
        // 单场注数 = 主队选中数 × 客队选中数
        const homeCount = item.homeScoreSelected.length || 0;
        const awayCount = item.awayScoreSelected.length || 0;
        const singleNotes = homeCount * awayCount;
        
        // 无选中项则总注数为0
        if (singleNotes === 0) {
          notes = 0;
          return false; // 终止循环
        }
        notes *= singleNotes;
      });
      return notes;
    },
    // 计算总投注金额（注数 × 倍数 × 2元/注）
    totalBetAmount() {
      return this.betNotes * this.betCount * 2;
    }
  },
  created() {
    // 获取系统信息，适配多端
    const sys = wx.getWindowInfo();
    this.isApp = sys.platform === "android" || sys.platform === "ios";
    this.statusBarHeight = sys.statusBarHeight || 20;
    this.safeAreaBottom = (sys.safeAreaInsets && sys.safeAreaInsets.bottom) || 0;
    this.calcAllHeights(); // 计算适配高度
  },
  onLoad() {
    // 接收父组件传递的数据
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.on("selectedData", (data) => {
        this.selectedMatchList = data.matches || [];
        this.betCount = data.betCount || 1;
        this.isNeedUserPhone = data.isNeedUserPhone || 1;
      });
    }
  },
  methods: {
    // 计算适配高度（兼容App/小程序/H5）
    calcAllHeights() {
      const sys = wx.getWindowInfo();
      // 导航栏高度（80rpx转px）
      const navBarFixedRpx = 80;
      const navBarFixedPx = (sys.screenWidth / 750) * navBarFixedRpx;
      this.headerTotalHeight = this.statusBarHeight + navBarFixedPx;
      
      // 投注栏高度（200rpx转px）
      const betBarFixedRpx = 200;
      this.betBarFixedPx = (sys.screenWidth / 750) * betBarFixedRpx;
      this.betBarTotalHeight = this.betBarFixedPx + this.safeAreaBottom;
    },
    // 返回上一页
    handleBack() {
      // 回传修改后的倍数数据给父组件
      const eventChannel = this.getOpenerEventChannel();
      if (eventChannel) {
        eventChannel.emit("updateSelectedMatches", {
          matches: this.selectedMatchList,
          betCount: this.betCount
        });
      }
      uni.navigateBack({ delta: 1 });
    },
    // 倍数减
    handleMinus() {
      if (this.betCount > 1) {
        this.betCount--;
      }
    },
    // 倍数加
    handlePlus() {
      if (this.betCount < 50) {
        this.betCount++;
      }
    },
    // 数字键盘实时输入处理
    handleKeyboardInput(val) {
      // 过滤非数字，限制1-50
      const pureNum = val.replace(/\D/g, '');
      if (!pureNum) return;
      
      const num = parseInt(pureNum) || 1;
      if (num < 1) {
        this.betCount = 1;
      } else if (num > 50) {
        this.betCount = 50;
      } else {
        this.betCount = num;
      }
    },
    // 数字键盘确认
    handleKeyboardConfirm(val) {
      const num = parseInt(val) || 1;
      this.betCount = Math.min(Math.max(num, 1), 50); // 最终限制1-50
      this.showNumberKeyboard = false; // 收起键盘
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
  // H5端滚动穿透兼容
  // #ifdef H5
  overflow: hidden;
  // #endif
}

// 滚动区样式：适配4场展示
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

  // 复用4场子组件的main-right样式
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

  .match-num-tip {
    font-size: 20rpx;
    color: #999;
    text-align: center;
    padding: 2rpx 0;
  }

  // 4场专属矩阵样式
  .bottom-right {
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1rpx solid #f1f1f1;
  }

  .score-matrix {
    width: 100%;
    border-collapse: collapse;
    background-color: #fff;
  }

  .matrix-row {
    display: flex;
    width: 100%;
    border-bottom: 1rpx solid #ddd;
    &:last-child {
      border-bottom: none;
    }
  }

  .matrix-label {
    width: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    border-right: 1rpx solid #ddd;
    font-size: 26rpx;
    color: #333;
  }

  .matrix-cell {
    flex: 1;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26rpx;
    color: #333;
    border-right: 1rpx solid #ddd;
    pointer-events: none; // 禁用点击（仅展示）
    &:last-child {
      border-right: none;
    }
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

// 投注栏样式：适配4场规则
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
    display: flex;
    justify-content: space-around;
    align-items: center;

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
          
          &.disabled {
            background-color: #f5f5f5;
            color: #999;
            pointer-events: none;
          }
        }

        .multi-unit {
          font-size: 30rpx;
          color: #333;
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
        line-height: 50rpx;
      }

      .combo-tip {
        font-size: 20rpx;
        color: #999;
        text-align: center;
        line-height: 1;
      }
    }
  }
}

// 隐藏滚动条（全端）
::-webkit-scrollbar {
  display: none;
}
</style>