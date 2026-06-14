<template>
  <view class="scheme-edit-page">
    <!-- 顶部导航 -->
    <CustomHeader 
      :ballTitle="'足球'" 
      title="6半全" 
      :showBack="true" 
      :showIcon="false" 
      @back-click="handleBack" 
    />

    <!-- 滚动展示区域：适配6场的赛事展示 -->
    <scroll-view
      class="match-scroll"
      scroll-y
      id="poster-content"
    >
      <view class="match-list">
        <!-- 循环展示选中的6场赛事 -->
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
                <text class="team-name home" v-if="item.home_win_rate&&$urlValue">胜率{{ item.home_win_rate }}</text>
                <text class="vs-text" v-if="item.draw_rate">平率{{item.draw_rate}}</text>
                <text class="team-name away" v-if="item.visiting_win_rate&&$urlValue">胜率{{ item.visiting_win_rate }}</text>
              </view>
            </view>

            <!-- 半全场3/1/0展示：仅显示选中状态，无点击 -->
            <view class="bottom-right">
              <!-- 半场行 -->
              <view class="score-row half-row">
                <text class="row-label">半</text>
                <view class="score-btn-group">
                  <view class="score-btn" :class="{ selected: item.halfHomeSelected }">3</view>
                  <view class="score-btn" :class="{ selected: item.halfVsSelected }">1</view>
                  <view class="score-btn" :class="{ selected: item.halfAwaySelected }">0</view>
                </view>
              </view>
              <!-- 全场行 -->
              <view class="score-row full-row">
                <text class="row-label">全</text>
                <view class="score-btn-group">
                  <view class="score-btn" :class="{ selected: item.fullHomeSelected }">3</view>
                  <view class="score-btn" :class="{ selected: item.fullVsSelected }">1</view>
                  <view class="score-btn" :class="{ selected: item.fullAwaySelected }">0</view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="empty-tip" v-if="selectedMatchList.length === 0"> 暂无已选赛事 </view>
      </view>
    </scroll-view>

    <!-- 6场专属投注栏：保留倍数操作，适配6串1规则 -->
    <view class="bet-bar">
      <view class="bet-bar-top">
        <view class="collapse-area">
          <!-- 左边提示文字：适配6场规则 -->
          <view class="left-tip">请输入倍数后截屏给售票人</view>
          
          <!-- 右边投注倍数 -->
          <view class="multi-group">
            <text class="multi-label">投</text>
            <button class="multi-btn minus" @click="handleMinus">-</button>
            <view class="multi-input" @tap="showNumberKeyboard = true">
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
      selectedMatchList: [], // 接收父组件传递的6场选中赛事
      betCount: 50, // 投注倍数（1-50）
      statusBarHeight: 0, // 状态栏高度
      safeAreaBottom: 0, // 底部安全区高度
      headerTotalHeight: 0, // 导航栏总高度
      isApp: false, // 是否为App端
      showNumberKeyboard: false, // 数字键盘显示状态
      isNeedUserPhone: 1 // 是否需要手机号（父组件传递）
    };
  },
  computed: {
    // 统计选中的有效赛事数量（需有半场/全场选中）
    selectedMatchCount() {
      return this.selectedMatchList.filter((item) => {
        return item.halfHomeSelected || item.halfVsSelected || item.halfAwaySelected ||
               item.fullHomeSelected || item.fullVsSelected || item.fullAwaySelected;
      }).length;
    },
    // 计算6场注数：每个赛事的选中项数乘积（6串1规则）
    betNotes() {
      if (this.selectedMatchList.length !== 6) return 0;
      
      let notes = 1;
      this.selectedMatchList.forEach((item) => {
        let selectedCount = 0;
        // 统计半场选中数
        if (item.halfHomeSelected) selectedCount++;
        if (item.halfVsSelected) selectedCount++;
        if (item.halfAwaySelected) selectedCount++;
        // 统计全场选中数
        if (item.fullHomeSelected) selectedCount++;
        if (item.fullVsSelected) selectedCount++;
        if (item.fullAwaySelected) selectedCount++;
        
        // 无选中项则注数为0
        if (selectedCount === 0) {
          notes = 0;
          return false; // 终止循环
        }
        notes *= selectedCount;
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
    const sys = uni.getSystemInfoSync();
    this.isApp = sys.platform === "android" || sys.platform === "ios";
    this.statusBarHeight = sys.statusBarHeight || 20;
    this.safeAreaBottom = (sys.safeAreaInsets && sys.safeAreaInsets.bottom) || 0;
    this.calcAllHeights(); // 计算适配高度
  },
  onLoad() {
    // 接收父组件传递的数据
    const eventChannel = this.getOpenerEventChannel ? this.getOpenerEventChannel() : null;
    if (eventChannel) {
      eventChannel.on("selectedData", (data) => {
        this.selectedMatchList = data.matches || [];
        this.betCount = data.betCount || 1;
       // this.isNeedUserPhone = data.isNeedUserPhone || 1;
      });
    }
  },
  methods: {
    // 计算适配高度（兼容App/小程序/H5）
    calcAllHeights() {
      const sys = uni.getSystemInfoSync();
      // 导航栏高度（80rpx转px）
      const navBarFixedRpx = 80;
      const navBarFixedPx = (sys.screenWidth / 750) * navBarFixedRpx;
      this.headerTotalHeight = this.statusBarHeight + navBarFixedPx;
    },
    // 返回上一页
    handleBack() {
      // 回传修改后的倍数数据给父组件
      const eventChannel = this.getOpenerEventChannel ? this.getOpenerEventChannel() : null;
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
 this.betCount++;
    },
    // 数字键盘实时输入处理
    handleKeyboardInput(val) {
      // 过滤非数字，限制1-50
      const pureNum = val.replace(/\D/g, '');
      if (!pureNum) return;
      
      const num = parseInt(pureNum) || 1;
      if (num < 1) {
        this.betCount = 1;
      } else {
        this.betCount = num;
      }
    },
    // 数字键盘确认
    handleKeyboardConfirm(val) {
      const num = parseInt(val) || 1;
      this.betCount = num // 
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
  position: relative;
  // 全局禁止滚动穿透
  overflow: hidden;
}

// 滚动区样式：适配6场展示（沿用模板核心逻辑）
.match-scroll {
  box-sizing: border-box;
  // 给顶部导航留固定高度
  padding-top: v-bind(headerTotalHeight + 'px');
  // 给底部栏留高度
  padding-bottom: 120rpx;
  // 固定高度 = 屏幕高度 - 底部留白
  height: calc(100vh - 120rpx);
  background-color: #f5f5f5;
  padding-left: 20rpx;
  padding-right: 20rpx;

  /* 隐藏滚动条 */
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.match-list {
  width: 100%;
  box-sizing: border-box;
  padding-bottom: 50rpx;

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

  // 复用6场子组件的main-right样式
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
      width: 120rpx;
      text-align: center;
      flex-shrink: 0;
      font-weight: 500;
    }
  }

  // 6场半全场专属样式
  .bottom-right {
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10rpx 0;
    gap: 4rpx;
  }

  .score-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0;
  }

  .row-label {
    width: 40rpx;
    height: 60rpx;
    line-height: 60rpx;
    text-align: center;
    font-size: 24rpx;
    color: #666;
    flex-shrink: 0;
  }

  .score-btn-group {
    display: flex;
    width: calc(100% - 40rpx);
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
    pointer-events: none; // 禁用点击（仅展示）
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

// ========== 6场专属投注栏样式（沿用模板布局逻辑） ==========
.bet-bar {
  position: fixed !important;
  width: 100% !important;
  left: 0 !important;
  bottom: 0 !important;
  z-index: 10 !important;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
  box-sizing: border-box !important;

  // 安全区适配（仅APP/小程序）
  // #ifdef MP-WEIXIN || APP-PLUS
  padding-bottom: env(safe-area-inset-bottom) !important;
  // #endif

  // H5端适配
  // #ifdef H5
  height: auto !important;
  // #endif

  .bet-bar-top {
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10rpx 30rpx;
    box-sizing: border-box;

    .collapse-area {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: auto;
      box-sizing: border-box;
      border-bottom: 2rpx solid #eee;
      padding: 10rpx 0;

      // 左边提示文字（适配6场规则）
      .left-tip {
        font-size: 24rpx;
        color: #d92929;
        flex: 1;
        margin-right: 20rpx;
        line-height: 1.4;
      }

      // 倍数选择组（缩小宽度，适配6场规则）
      .multi-group {
        display: flex;
        align-items: center;
        gap: 6rpx;
        flex-shrink: 0;

        .multi-label {
          font-size: 26rpx;
          color: #333;
        }

        .multi-btn {
          width: 44rpx;
          height: 44rpx;
          background-color: #ddd;
          color: #333;
          font-size: 28rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1rpx solid #ccc;

          // #ifdef H5
          line-height: 1;
          outline: none;
          -webkit-appearance: none;
          // #endif
        }

        // 输入框缩小，且未选满6场时禁用
        .multi-input {
          width: 100rpx;
          height: 44rpx;
          background-color: #fff;
          color: #333;
          text-align: center;
          font-size: 26rpx;
          border: 1rpx solid #ccc;
          display: flex;
          align-items: center;
          justify-content: center;

          // #ifdef H5
          outline: none;
          -webkit-appearance: none;
          // #endif

          &.disabled {
            color: #999;
            background-color: #f5f5f5;
            pointer-events: none;
          }
        }

        .multi-unit {
          font-size: 26rpx;
          color: #333;
        }
      }
    }
  }

  .bet-bar-bottom {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 80rpx; // H5端降低高度
    background-color: #232323;
    color: #fff;
    box-sizing: border-box;
    padding: 0 20rpx;
    // H5端适配：调整高度和内边距
    // #ifdef H5
    height: 70rpx;
    // #endif

    .bottom-middle {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin: 0;
      height: 100%;

      .select-tip {
        height: 100%;
        font-size: 28rpx;
        color: #fff;
        text-align: center;
        display: flex;
        align-items: center;
        // H5端适配：调整字体大小
        // #ifdef H5
        font-size: 26rpx;
        // #endif
      }
    }
  }
}

// 隐藏滚动条
::-webkit-scrollbar {
  display: none;
}

// H5端全局样式重置（解决按钮/输入框默认样式问题）
// #ifdef H5
::v-deep button {
  -webkit-appearance: none;
  appearance: none;
  outline: none;
  border: none;
}
::v-deep input {
  -webkit-appearance: none;
  appearance: none;
  outline: none;
}
// #endif
</style>