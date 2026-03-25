<template>
  <view class="scheme-edit-page">
    <!-- 顶部导航 -->
    <CustomHeader :ballTitle="'足 球'" title="6场半全" :showBack="true" :showIcon="false" @back-click="handleBack" />

    <scroll-view class="match-scroll" scroll-y id="poster-content">
      <view class="match-list">
        <view v-for="(item, index) in selectedMatchList" :key="index" class="match-row">
          <view class="main-right">
            <view class="top-right">
              <view class="team-vs">
                <text class="team-name home">{{ item.home_name }}</text>
                <text class="vs-text">VS</text>
                <text class="team-name away">{{ item.visiting_name }}</text>
              </view>
              <view class="team-vs" style="color: #888; padding: 0" v-if="urlValue">
                <text class="team-name home" v-if="item.home_win_rate">胜{{ item.home_win_rate }}</text>
                <text class="vs-text" v-if="item.draw_rate">平{{ item.draw_rate }}</text>
                <text class="team-name away" v-if="item.visiting_win_rate">胜{{ item.visiting_win_rate }}</text>
              </view>
            </view>

            <view class="bottom-right">
              <view class="score-row half-row">
                <text class="row-label">半</text>
                <view class="score-btn-group">
                  <view class="score-btn" :class="{ selected: item.halfHomeSelected }">3</view>
                  <view class="score-btn" :class="{ selected: item.halfVsSelected }">1</view>
                  <view class="score-btn" :class="{ selected: item.halfAwaySelected }">0</view>
                </view>
              </view>
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

        <view class="empty-tip" v-if="selectedMatchList.length === 0"> 暂无 </view>
      </view>
    </scroll-view>

    <view class="bet-bar" v-if="urlValue">
      <view class="bet-bar-top">
        <view class="collapse-area" style="text-align:center; color: #d92929;">
          请截屏
          <!-- <view class="left-tip">请截屏</view>

          <view class="multi-group">
            <button class="multi-btn minus" @click="handleMinus">-</button>
            <view class="multi-input" @tap="showNumberKeyboard = true">
              {{ betCount }}
            </view>
            <button class="multi-btn plus" @click="handlePlus">+</button>
            
          </view> -->
        </view>
      </view>
      <view class="bet-bar-bottom">
        <view class="bottom-middle">
          
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
      selectedMatchList: [], // 接收父组件传递的6场选中赛事
      betCount: 50, 
      statusBarHeight: 0, // 状态栏高度
      safeAreaBottom: 0, // 底部安全区高度
      headerTotalHeight: 0, // 导航栏总高度
      isApp: false, // 是否为App端
      showNumberKeyboard: false, // 数字键盘显示状态
      isNeedUserPhone: 1, // 是否需要手机号（父组件传递）
      urlValue: false,
    };
  },
  computed: {
    selectedMatchCount() {
      return this.selectedMatchList.filter((item) => {
        return item.halfHomeSelected || item.halfVsSelected || item.halfAwaySelected || item.fullHomeSelected || item.fullVsSelected || item.fullAwaySelected;
      }).length;
    },
    betNotes() {
      if (this.selectedMatchList.length !== 6) return 0;

      let notes = 1;
      this.selectedMatchList.forEach((item) => {
        let selectedCount = 0;
        if (item.halfHomeSelected) selectedCount++;
        if (item.halfVsSelected) selectedCount++;
        if (item.halfAwaySelected) selectedCount++;
        if (item.fullHomeSelected) selectedCount++;
        if (item.fullVsSelected) selectedCount++;
        if (item.fullAwaySelected) selectedCount++;

        if (selectedCount === 0) {
          notes = 0;
          return false; // 终止循环
        }
        notes *= selectedCount;
      });
      return notes;
    },
    totalBetAmount() {
      return this.betNotes * this.betCount * 2;
    },
  },
  created() {
        this.$nextTick(()=>{
    this.urlValue = uni.getStorageSync('urlValue');
    
    })
  },
  onLoad() {
    // 接收父组件传递的数据
    const eventChannel = this.getOpenerEventChannel ? this.getOpenerEventChannel() : null;
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
    // 返回上一页
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
    // 减
    handleMinus() {
      if (this.betCount > 1) {
        this.betCount--;
      }
    },
    // 加
    handlePlus() {
      if (this.betCount < 50) {
        this.betCount++;
      }
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
      this.betCount = Math.min(Math.max(num, 1), 50); // 最终限制1-50
      this.showNumberKeyboard = false; // 收起键盘
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
  position: relative;
  // 全局禁止滚动穿透
  overflow: hidden;
}

// 滚动区样式：适配6场展示（沿用模板核心逻辑）
.match-scroll {
  box-sizing: border-box;
  // 给顶部导航留固定高度
  padding-top: v-bind(headerTotalHeight + "px");
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
    border-bottom: 1rpx solid #dedede;
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

// ========== 6场专属栏样式（沿用模板布局逻辑） ==========
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

      // 选择组（缩小宽度，适配6场规则）
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
