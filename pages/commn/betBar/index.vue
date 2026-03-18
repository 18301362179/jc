<template>
  <view class="bet-bar" v-if="isShowStatus">
    <view class="bet-bar-content">
      <!-- 左侧清空按钮 -->
      <view 
        class="clear-btn" 
        @click="handleClear"
        v-if="showClearBtn"
      >
        <image class="trash-icon" src="/static/trash.png" mode="widthFix" />
      </view>
      
      <!-- 中间提示文字：横向不换行 -->
      <view class="tip-text">
        <span v-if="selectedCount > 0" class="count-info">
          已选<text class="red-text">{{ selectedCount }}</text>场，
          还差<text class="red-text">{{ Math.max(0, minMatchCount - selectedCount) }}</text>场
        </span>
        <span v-else>{{ title || `至少选择${minMatchCount}场比赛` }}</span>
      </view>
      
      <!-- 右侧确认按钮 -->
      <button 
        class="confirm-btn" 
        @click="handleConfirm"
        :disabled="!confirmBtnEnabled"
      >
        选好了
      </button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'BetBar',
  props: {
    minMatchCount: { type: Number, default: 9 },
    title: { type: String, default: '' },
    showClearBtn: { type: Boolean, default: true },
    confirmBtnEnabled: { type: Boolean, default: false },
    selectedCount: { type: Number, default: 0 }
  },
  data() {
    return {
      isShowStatus: null,
    }
  },
  created(){
    this.$nextTick(()=>{
    this.isShowStatus = uni.getStorageSync('isShowStatus');
    
    })
  },
  methods: {
    handleClear() { this.$emit('clear'); },
    handleConfirm() {
      if (this.selectedCount < this.minMatchCount) {
        uni.showToast({ title: `请至少选择${this.minMatchCount}场比赛`, icon: "none" });
        return;
      }
      this.$emit('confirm');
    }
  }
};
</script>

<style scoped lang="scss">
.bet-bar {
  position: fixed !important;
  width: 100% !important;
  left: 0 !important;
  z-index: 10 !important;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
  box-sizing: border-box !important;
  // 适配不同端的安全区域
  // #ifdef MP-WEIXIN
  bottom: calc(0rpx + env(safe-area-inset-bottom)) !important;
  // #endif
  // #ifdef APP-PLUS
  bottom: calc(0rpx + constant(safe-area-inset-bottom)) !important;
  bottom: calc(0rpx + env(safe-area-inset-bottom)) !important;
  // #endif
  // #ifdef H5
  bottom: calc(0rpx + env(safe-area-inset-bottom)) !important;
  // #endif
}

.bet-bar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  // 给容器设置固定高度，让按钮可以铺满
  height: 80rpx;
}

.clear-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 20rpx;
}

.trash-icon {
  width: 40rpx;
  height: 40rpx;
}

.tip-text {
  font-size: 28rpx;
  color: #666;
  flex: 1;
  text-align: center;
  margin: 0 20rpx;
  white-space: nowrap;
  > * {
    display: inline;
  }
}

.count-info {
  font-size: 26rpx;
  color: #666;
  width: auto !important;
  .red-text {
    color: #d92929;
    font-weight: 500;
  }
}

// 核心修改：按钮铺满高度
.confirm-btn {
  width: 160rpx;
  height: 100% !important; // 铺满父容器高度
  background-color: #d92929;
  color: #fff;
  border-radius: 4rpx;
  font-size: 28rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 !important; // 清空默认padding
  margin: 0 !important; // 清空默认margin
  line-height: 1; // 保证文字垂直居中
  // 禁用状态样式
  &:disabled {
    background-color: #ccc;
    color: #999;
    cursor: not-allowed;
  }
}
</style>