<template>
  <view class="guide-popup" :class="{ show: isShow }">
    <view class="guide-mask" @tap="handleClose" :class="{ disabled: !canClose }"></view>
    <view class="guide-box">
      <view class="guide-title">{{ title }}</view>
      <scroll-view class="guide-content" scroll-y>
        <view class="guide-item" v-for="(item, index) in contentList" :key="index">
          <text class="item-number">{{ index + 1 }}、</text>
          <text class="item-text">{{ item }}</text>
        </view>
      </scroll-view>
      <button 
        class="guide-close-btn" 
        @tap="handleClose"
        :class="{ active: canClose }"
        :disabled="!canClose"
      >
        {{ canClose ? confirmText : `请阅读(${countDown}s)` }}
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      title: "竞彩攻略",
      contentList: [
        "胜率越高可信度越高。",
        "主场作战+胜率高，可信度更高。",
        "多串一，以主场作战+胜率高的为最佳,无这样组合，可考虑其他两头堵。",
        "本站只基于大数据做胜率分析，未考虑伤病，求胜欲、人为干扰等等其他场外因素。",
        "本站内容只供参考,请结合您的智慧或其他相关分析系统做出您自身的判断与选择。",
        "系统每日9点半前同步最新预测数据。"
      ],
      confirmText: "我已阅读",
      storageKey: "hasShownGuessGuide",
      countdownSeconds: 5,
      isShow: false, // 恢复默认隐藏，通过存储判断是否显示
      canClose: false,
      countDown: 5,
      timer: null
    };
  },
  created() {
    this.checkShow(); // 初始化时执行显示判断
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
  },
  methods: {
    // 恢复「首次显示、后续隐藏」逻辑
    checkShow() {
      try {
        const hasShown = uni.getStorageSync(this.storageKey);
        // 未显示过则触发弹窗
        if (!hasShown) {
          this.isShow = true;
          this.startCountdown();
        }
      } catch (e) {
        console.error("读取存储失败，强制显示弹窗：", e);
        this.isShow = true;
        this.startCountdown();
      }
    },
    startCountdown() {
      this.canClose = false;
      this.countDown = this.countdownSeconds;
      
      this.timer = setInterval(() => {
        this.countDown--;
        if (this.countDown <= 0) {
          clearInterval(this.timer);
          this.canClose = true;
        }
      }, 1000);
    },
    handleClose() {
      if (!this.canClose) return;
      this.isShow = false;
      // 关闭后存储标记，后续不再显示
      try {
        uni.setStorageSync(this.storageKey, "1");
      } catch (e) {
      }
    }
  }
};
</script>

<style scoped lang="scss">
.guide-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999999 !important;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;

  &.show {
    opacity: 1 !important;
    pointer-events: auto !important;
    .guide-box {
      transform: translate(-50%, -50%) scale(1) !important;
    }
  }

  .guide-mask {
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7) !important;
    &.disabled {
      background: rgba(0, 0, 0, 0.4);
      cursor: not-allowed;
    }
  }

  .guide-box {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.9);
    transition: transform 0.3s ease;
    width: 85%;
    max-width: 650rpx;
    background: #fff !important;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.3);
  }

  .guide-title {
    height: 90rpx;
    line-height: 90rpx;
    text-align: center;
    font-size: 36rpx;
    font-weight: 700;
    color: #333;
    border-bottom: 1rpx solid #f5f5f5;
    background-color: #fffaf0;
  }

  .guide-content {
    max-height: 60vh;
    padding: 40rpx 30rpx;
    box-sizing: border-box;

    .guide-item {
      font-size: 30rpx;
      line-height: 56rpx;
      margin-bottom: 16rpx;
      display: flex;
      align-items: flex-start;

      .item-number {
        font-weight: 700;
        color: #d92929;
        margin-right: 8rpx;
        min-width: 36rpx;
      }

      .item-text {
        color: #555;
        flex: 1;
      }
    }
  }

  .guide-close-btn {
    width: 90%;
    height: 90rpx;
    margin: 0 auto 40rpx;
    font-size: 32rpx;
    border-radius: 10rpx;
    border: none;
    background-color: #e0e0e0;
    color: #9e9e9e;
    opacity: 0.8;
    cursor: not-allowed;
    transition: all 0.3s ease;

    &.active {
      background-color: #d92929;
      color: #fff;
      opacity: 1;
      cursor: pointer;
      &:active {
        background-color: #b71c1c;
        transform: scale(0.98);
      }
    }

    &:disabled {
      background-color: #e0e0e0 !important;
      color: #9e9e9e !important;
    }
  }
}
</style>