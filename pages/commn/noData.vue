
<template>
  <view class="empty-container">
    <view class="empty-card">
      <!-- <view class="empty-wave">
        <view class="wave"></view>
      </view> -->
      <text class="empty-title">暂无数据</text>
      <!-- <button 
        v-if="showButton" 
        class="empty-button" 
        @click="handleRefresh"
      >刷新试试</button> -->
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    handleRefresh() {
      this.$emit('refresh')
    }
  }
}
</script>

<style lang="scss">
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  padding: 20rpx;
  
  .empty-card {
    width: 100%;
    max-width: 500rpx;
    background: #fff;
    border-radius: 24rpx;
    padding: 60rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    overflow: hidden;
  }
  
  .empty-icon {
    width: 180rpx;
    height: 180rpx;
    margin-bottom: 40rpx;
    opacity: 0.9;
  }
  
  .empty-wave {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 10rpx;
    overflow: hidden;
    
    .wave {
      width: 200%;
      height: 100%;
      background: linear-gradient(
        90deg,
        rgba(100, 175, 255, 0.5) 0%,
        rgba(65, 145, 255, 0.8) 50%,
        rgba(100, 175, 255, 0.5) 100%
      );
      animation: wave 2s linear infinite;
    }
  }
  
  .empty-title {
    font-size: 36rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 16rpx;
  }
  
  .empty-desc {
    font-size: 28rpx;
    color: #999;
    text-align: center;
    margin-bottom: 40rpx;
  }
  
  .empty-button {
    background: linear-gradient(135deg, #5b8cff, #3a6eff);
    color: white;
    border: none;
    border-radius: 50rpx;
    padding: 0 60rpx;
    height: 80rpx;
    line-height: 80rpx;
    font-size: 30rpx;
    box-shadow: 0 6rpx 12rpx rgba(58, 110, 255, 0.2);
    transition: all 0.3s;
    
    &:active {
      transform: scale(0.95);
      opacity: 0.9;
    }
  }
  
  @keyframes wave {
    0% { transform: translateX(-50%); }
    100% { transform: translateX(0%); }
  }
}
</style>
