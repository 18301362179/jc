<template>
  <view class="scheme-edit-page">
    <!-- 顶部导航：适配4场标题 -->
    <CustomHeader :ballTitle="''"  :isIndex="false" title="4场" :showBack="true" :showIcon="false" @back-click="handleBack" />

    <!-- 滚动展示区域：沿用模板布局逻辑，保留4场业务展示 + 胜显示条件 -->
    <scroll-view class="match-scroll" scroll-y id="poster-content">
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
              <!-- 胜展示：添加模板同款v-if显示条件 -->
              <view class="team-vs" style="color: #888; padding: 0" v-if="urlValue">
                <text class="team-name home" v-if="item.home_win_rate">胜{{ item.home_win_rate }}</text>
                <text class="vs-text" v-if="item.draw_rate">平{{ item.draw_rate }}</text>
                <text class="team-name away" v-if="item.visiting_win_rate">胜{{ item.visiting_win_rate }}</text>
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

        <view class="empty-tip" v-if="selectedMatchList.length === 0"> 暂无 </view>
      </view>
    </scroll-view>

    <view class="bet-bar" v-if="urlValue">
      <view class="bet-bar-top">
        <view class="collapse-area" style="text-align:center; color: #d92929;">
          
          <!-- <view class="left-tip"></view> -->

          <view class="multi-group">
            <button class="multi-btn minus" @click="handleMinus">-</button>
            <view class="multi-input" @tap="showNumberKeyboard = true">
              {{ betCount }}
            </view>
            <button class="multi-btn plus" @click="handlePlus">+</button>
            
          </view>
        </view>
      </view>
      <view class="bet-bar-bottom">
        <view class="bottom-middle">
          <text class="select-tip">共{{ betNotes }}注 {{ betCount }}倍 {{ totalBetAmount }}</text>
        </view>
      </view>
    </view>

    <!-- 自定义数字键盘：限制1-50倍 -->
    <UniNumberKeyboard :show.sync="showNumberKeyboard" :value="betCount + ''" :allowDot="false" confirm-text="确认" :min="1" :max="50" @input="handleKeyboardInput" @confirm="handleKeyboardConfirm" />
  </view>
</template>

<script>
import CustomHeader from "@/components/CustomHeader.vue";
export default {
  components: { CustomHeader },
  data() {
    return {
      selectedMatchList: [], // 接收父组件传递的4场选中赛事
      betCount: 50, 
      statusBarHeight: 0, // 状态栏高度
      safeAreaBottom: 0, // 底部安全区高度
      headerTotalHeight: 0, // 导航栏总高度
      betBarFixedPx: 0, // 
      betBarTotalHeight: 0, // 
      isApp: false, // 是否为App端
      showNumberKeyboard: false, // 数字键盘显示状态
       // 是否需要手机号（父组件传递）
      urlValue: false,
    };
  },
  computed: {
    selectedMatchCount() {
      return this.selectedMatchList.filter((item) => {
        const homeValid = Array.isArray(item.homeScoreSelected) && item.homeScoreSelected.length > 0;
        const awayValid = Array.isArray(item.awayScoreSelected) && item.awayScoreSelected.length > 0;
        return homeValid && awayValid;
      }).length;
    },

    // 计算4场注数：4串1规则（每场单场注数相乘，核心正确逻辑）
    betNotes() {
      // 必须选够4场比赛，否则注数为0
      if (this.selectedMatchList.length !== 4) return 0;

      let totalNotes = 1;
      this.selectedMatchList.forEach((item) => {
        // 这一行就是你说的“主选的加客选的（1场）”
        const oneMatchTotal = ((item.homeScoreSelected && item.homeScoreSelected.length) || 0) + ((item.awayScoreSelected && item.awayScoreSelected.length) || 0);

        // 只要有1场没选，总注数直接为0
        if (oneMatchTotal === 0) {
          totalNotes = 0;
          return false;
        }

        // 4场的总数相乘
        totalNotes *= oneMatchTotal;
      });

      return totalNotes;
    },
    // 计算总金额（注数 ×  × 2元/注）
    totalBetAmount() {
      // 空值保护：注数/为0时金额为0
      return Math.max(this.betNotes * this.betCount * 2, 0);
    },
  },
  created() {
        this.$nextTick(()=>{
    this.urlValue = uni.getStorageSync('urlValue');
    
    })
    // 替换为模板的系统信息获取逻辑（兼容全端）
    const sys = uni.getSystemInfoSync();
    this.isApp = sys.platform === "android" || sys.platform === "ios";
    this.statusBarHeight = sys.statusBarHeight || 20;
    this.safeAreaBottom = (sys.safeAreaInsets && sys.safeAreaInsets.bottom) || 0;
    this.calcAllHeights(); // 计算适配高度
  },
  onLoad() {
    // 保留4场的接收数据逻辑，兼容模板的写法
    const eventChannel = this.getOpenerEventChannel ? this.getOpenerEventChannel() : null;
    if (eventChannel) {
      eventChannel.on("selectedData", (data) => {
        this.selectedMatchList = data.matches || [];
        this.betCount = data.betCount || 50;
      });
    }
  },
  methods: {
    // 适配模板的高度计算逻辑（兼容全端）
    calcAllHeights() {
      const sys = uni.getSystemInfoSync();
      // 导航栏高度（80rpx转px）
      const navBarFixedRpx = 80;
      const navBarFixedPx = (sys.screenWidth / 750) * navBarFixedRpx;
      this.headerTotalHeight = this.statusBarHeight + navBarFixedPx;

      // （模板同款逻辑）
      const betBarFixedRpx = this.isApp ? 200 : 180;
      this.betBarFixedPx = (sys.screenWidth / 750) * betBarFixedRpx;
      this.betBarTotalHeight = this.betBarFixedPx + (this.isApp ? this.safeAreaBottom : 0);
    },
    // 返回上一页 + 回传数据
    handleBack() {
      // 回传修改后的数据给父组件
      const eventChannel = this.getOpenerEventChannel ? this.getOpenerEventChannel() : null;
      if (eventChannel) {
        eventChannel.emit("updateSelectedMatches", {
          matches: this.selectedMatchList,
          betCount: this.betCount,
        });
      }
      uni.navigateBack({ delta: 1 });
    },
    // 减（模板同款逻辑）
    handleMinus() {
      const num = this.betCount - 1;
      this.betCount = num < 1 ? 1 : num;
    },
    // 加（模板同款逻辑）
    handlePlus() {
      const num = this.betCount + 1;
      this.betCount = num > 50 ? 50 : num;
    },
    // 数字键盘实时输入处理
    handleKeyboardInput(val) {
      // 过滤非数字，限制1-50
      const pureNum = val.replace(/\D/g, "");
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
      this.betCount = num // 最终限制1-50
      this.showNumberKeyboard = false; // 收起键盘
    },
  },
};
</script>

<style scoped lang="scss">
// 完全复用模板的全局样式
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

// 替换为模板的滚动区样式（放弃absolute定位，用模板的calc高度）
.match-scroll {
  box-sizing: border-box;
  padding-top: v-bind(headerTotalHeight + "px");
  background-color: #f5f5f5;
  padding-left: 20rpx;
  padding-right: 20rpx;

  // 隐藏滚动条
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
    border-bottom: 1rpx solid #dedede;
    box-sizing: border-box;
    padding: 8rpx 20rpx;
    margin-bottom: 10rpx;
    border-radius: 8rpx;
    width: 100%;
  }

  // 保留4场的main-right样式，对齐模板
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

    .team-name.home {
      text-align: right;
      padding-right: 10rpx;
    }
    .team-name.away {
      text-align: left;
      padding-left: 10rpx;
    }
    .vs-text {
      width: 120rpx;
      text-align: center;
      flex-shrink: 0;
      font-weight: 500;
    }
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

// ========== 复用模板的bet-bar样式 ==========
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
    justify-content: center;
    align-items: center;
    padding: 10rpx 30rpx;
    box-sizing: border-box;

    .collapse-area {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: auto;
      box-sizing: border-box;
      border-bottom: 2rpx solid #eee;
      padding: 10rpx 0;

      // 模板同款左边提示文字
      .left-tip {
        font-size: 24rpx;
        color: #d92929;
        flex: 1;
        margin-right: 20rpx;
        line-height: 1.4;
      }

      // 模板同款缩小版操作区
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
    height: 80rpx;
    background-color: #232323;
    color: #fff;
    box-sizing: border-box;
    padding: 0 20rpx;
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
        // #ifdef H5
        font-size: 26rpx;
        // #endif
      }

      .combo-tip {
        font-size: 20rpx;
        color: #999;
        text-align: center;
        line-height: 1;
        margin-top: 4rpx;
      }
    }
  }
}

// 隐藏滚动条
::-webkit-scrollbar {
  display: none;
}

// H5端全局样式重置（模板同款）
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
