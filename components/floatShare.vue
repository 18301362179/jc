<template>
  <view
    class="float-wrap"
    :style="{ top: top + 'px', right: right + 'px' }"
    @touchstart="handleTouchStart"
    @touchmove.stop="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <button class="share-btn" @click.stop="handleShareClick">
      分享海报
    </button>

    <!-- 海报弹窗 -->
    <view class="poster-mask" v-show="showPoster" @click="closePoster">
      <view class="poster-box" @click.stop>
        <image 
          class="poster-img" 
          :src="posterUrl" 
          mode="widthFix"
          @longpress="showSendTips"
        ></image>
        <view class="tip">长按图片可发送给朋友</view>
        <view class="close-btn" @click="closePoster">×</view>
      </view>
    </view>
  </view>
</template>

<script>
import {  getH5ShareInfo } from '@/api/demo';

export default {
  data() {
    return {
      top: 400,
      right: 10,
      startY: 0,
      isDragging: false,
      screenHeight: uni.getWindowInfo ? uni.getWindowInfo().windowHeight : 667,
      btnHeight: 35,
      showPoster: false,
      posterUrl: 'https://www.tianjifu.com/static/share-logo.jpg', // 替换为你的海报地址
      isWxConfigReady: false
    };
  },

  mounted() {
    // H5环境下初始化微信分享配置
    if (process.env.VUE_APP_PLATFORM === 'h5') {
      this._initWxShareConfig();
    }
  },

  methods: {
    // 初始化微信分享配置（适配jWeixin）
    async _initWxShareConfig() {
      if (!/MicroMessenger/i.test(navigator.userAgent)) return;

      // 优先使用内置的jWeixin
      const wx = window.jWeixin || window.wx;
      if (!wx) {
        console.error('微信JS-SDK不可用');
        return;
      }

      try {
        const currentUrl = window.location.href.split('#')[0];
        const res = await getH5ShareInfo({
          shareUrl: currentUrl
        });
        const wxConfig = res.data;

        wx.config({
          debug: true,
          appId: wxConfig.appId,
          timestamp: wxConfig.timestamp,
          nonceStr: wxConfig.nonceStr,
          signature: wxConfig.signature,
          jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData', 'showOptionMenu']
        });

        wx.ready(() => {
          this.isWxConfigReady = true;
          // 配置分享链接卡片（兜底）
          wx.updateAppMessageShareData({
            title: '云竞慧博体服务号',
            desc: '足球、篮球分析预测',
            link: currentUrl,
            imgUrl: this.posterUrl,
            success: () => {
              console.log('分享链接卡片配置成功');
            }
          });
        });

        wx.error((err) => {
          console.error('微信SDK配置失败：', err);
          this.isWxConfigReady = false;
        });
      } catch (err) {
        console.error('获取分享配置失败：', err);
      }
    },

    // 点击分享按钮
    async handleShareClick() {
      // 显示海报弹窗（核心分享方式）
      this.showPoster = true;
      // 调用赠币接口
      await this._callUserShareApi();

      // 兜底：唤起微信原生分享菜单（链接卡片）
      const wx = window.jWeixin || window.wx;
      if (this.isWxConfigReady && wx) {
        try {
          wx.showOptionMenu();
        } catch (e) {}
      }
    },

    // 关闭海报弹窗
    closePoster() {
      this.showPoster = false;
    },

    // 显示长按发送提示
    showSendTips() {
      uni.showToast({
        title: '长按可发送给好友',
        icon: 'none',
        duration: 1500
      });
    },

    // 赠币接口
    async _callUse8rShareApi() {
      try {
        await userShare();
        uni.showToast({ title: '赠币成功！', icon: 'success' });
      } catch (err) {
        console.error('赠币接口失败：', err);
        uni.showToast({ title: '赠币失败，请重试', icon: 'none' });
      }
    },

    // 拖拽逻辑（保留）
    handleTouchStart(e) {
      this.isDragging = true;
      this.startY = e.touches[0].clientY;
    },
    handleTouchMove(e) {
      if (!this.isDragging) return;
      const moveY = e.touches[0].clientY - this.startY;
      this.top = Math.max(10, Math.min(this.top + moveY, this.screenHeight - this.btnHeight - 10));
      this.startY = e.touches[0].clientY;
    },
    handleTouchEnd() {
      this.isDragging = false;
    }
  }
};
</script>

<style scoped>
/* 悬浮按钮样式 */
.float-wrap {
  position: fixed;
  z-index: 9999;
  width: 70rpx;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.share-btn {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 35rpx;
  background: linear-gradient(135deg, #45b88e, #31926e);
  color: #fff;
  font-size: 22rpx;
  font-weight: bold;
  line-height: 70rpx;
  text-align: center;
  padding: 0;
  margin: 0;
  box-shadow: 0 4rpx 12rpx rgba(49, 146, 110, 0.4);
}
.share-btn:active {
  background: linear-gradient(135deg, #3aa97e, #287d5c);
  box-shadow: 0 2rpx 6rpx rgba(49, 146, 110, 0.2);
}

/* 海报弹窗样式 */
.poster-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.poster-box {
  position: relative;
  width: 85%;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
}
.poster-img {
  width: 100%;
  border-radius: 8rpx;
}
.tip {
  text-align: center;
  font-size: 28rpx;
  color: #666;
  margin-top: 20rpx;
}
.close-btn {
  position: absolute;
  top: -20rpx;
  right: -20rpx;
  width: 60rpx;
  height: 60rpx;
  background: #000;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}
</style>