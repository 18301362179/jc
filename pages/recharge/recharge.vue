<template>
  <view class="recharge-page">
    <!-- 充值区域 -->
    <view class="recharge-section">
      <!-- 提示显示区域 -->
      <view class="tip-container" v-if="showTip">
        <text class="tip-text">{{ currentTip }}</text>
      </view>

      <!-- 灵石选择按钮组 -->
      <view class="stone-options">
        <button 
          class="stone-btn" 
          :class="{ active: selectedStone === 5 }" 
          @click="selectStone(5)"
        >
          50灵石
        </button>
        <button 
          class="stone-btn" 
          :class="{ active: selectedStone === 9 }" 
          @click="selectStone(9)"
        >
          1000灵石
        </button>
        <button 
          class="stone-btn" 
          :class="{ active: selectedStone === 35 }" 
          @click="selectStone(35)"
        >
          500灵石
        </button>
        <button 
          class="stone-btn" 
          :class="{ active: selectedStone === 60 }" 
          @click="selectStone(60)"
        >
          1000灵石
        </button>
      </view>

      <!-- 应付金额展示 -->
      <text class="amount-tip">应付金额：{{ amount }}元</text>

      <!-- 付款按钮 -->
      <button class="pay-btn" @click="handlePay" :disabled="isPayLoading">
        <text v-if="!isPayLoading">付款</text>
        <text v-if="isPayLoading">支付中...</text>
      </button>
    </view>
  </view>
</template>

<script>
// 引入登录/Token 工具方法（与 app.vue 保持一致）
import { login, checkToken } from '@/utils/auth';
import { getToken, setToken } from '@/utils/storage';
import { wxPay } from "@/api/demo";
export default {
  name: "RechargePage",
  data() {
    return {
      // 选中的灵石档位（对应金额：5=5元/50灵石、9=9元/100灵石、35=35元/500灵石、60=60元/1000灵石）
      selectedStone: 9,
      // 应付金额（元）
      amount: 9,
      // 提示相关
      showTip: false,
      currentTip: "",
      // 灵石-金额映射表
      stoneAmountMap: {
        5: 5,   // 50灵石 = 5元
        9: 9,   // 100灵石 = 9元
        35: 35, // 500灵石 = 35元
        60: 60  // 1000灵石 = 60元
      },
      // 提示文案配置
      tips: {
        5: "您要兑换的灵石数量：50颗",
        9: "您要兑换的灵石数量：100颗",
        35: "您要兑换的灵石数量：500颗",
        60: "您要兑换的灵石数量：1000颗"
      },
      // 支付透传参数
      payExtParams: {
        beFrom: "",     // football/basketball（来源：足球/篮球）
        isLottery: 1,   // 固定值：1
        userId: getToken() ? JSON.parse(getToken()).userId || "" : "" // 从Token解析用户ID（与app.vue登录逻辑对齐）
      },
      // 支付加载状态（防止重复点击）
      isPayLoading: false,
      // 全局应用实例（复用app.vue的全局配置）
      appInstance: getApp()
    };
  },
  onLoad(options) {
    // 接收上个页面传递的参数
    if (options.beFrom) {
      this.payExtParams.beFrom = options.beFrom;
    }
    if (options.isLottery) {
      this.payExtParams.isLottery = options.isLottery;
    }
    console.log("[充值页] 接收参数：", this.payExtParams);
  },
  methods: {
    /**
     * 1. 选择灵石数量
     * @param {Number} stone - 灵石档位（5/9/35/60）
     */
    selectStone(stone) {
      this.selectedStone = stone;
      this.amount = this.stoneAmountMap[stone];
      this.currentTip = this.tips[stone];
      this.showTip = true;
      uni.vibrateShort();
    },

    /**
     * 2. 核心：处理付款逻辑（适配app.vue全局配置）
     */
    async handlePay() {
      // 防止重复点击
      if (this.isPayLoading) return;
      this.isPayLoading = true;

      try {
        // ========== 前置校验 ==========
        // 校验1：是否选择灵石
        if (!this.selectedStone || !this.amount) {
          uni.showToast({ title: "请先选择灵石数量", icon: "none" });
          this.isPayLoading = false;
          return;
        }

        // 校验2：登录态校验（复用app.vue的checkToken方法）
        const isTokenValid = await checkToken();
        if (!isTokenValid) {
          // Token无效：执行自动登录（与app.vue登录逻辑对齐）
          uni.showToast({ title: "登录态失效，正在重新登录...", icon: "none" });
          const loginResult = await login();
          if (!loginResult.success) {
            uni.showToast({ title: "登录失败，请重试", icon: "none" });
            this.isPayLoading = false;
            return;
          }
          // 登录成功后更新全局Token和用户ID
          this.appInstance.updateGlobalToken(getToken());
          this.payExtParams.userId = JSON.parse(getToken()).userId || "";
        }

        // ========== 发起支付 ==========
        uni.showLoading({ title: "发起支付中...", mask: true });

        // 步骤1：调用后端接口，获取微信支付参数（使用app.vue的全局baseUrl）
        const payParams = await this.getWXPay();
        if (!payParams) {
          uni.hideLoading();
          this.isPayLoading = false;
          return;
        }

        // 步骤2：调用uni-app统一支付接口，调起微信支付
        const payResult = await uni.requestPayment({
          provider: "wxpay", // 指定微信支付
          timeStamp: payParams.timeStamp + "", // 时间戳（必须是字符串）
          nonceStr: payParams.nonceStr, // 随机字符串
          package: payParams.package, // 格式：prepay_id=xxx
          signType: payParams.signType || "MD5", // 签名类型
          paySign: payParams.paySign, // 支付签名
        });

        // ========== 支付成功处理 ==========
        if (payResult.errMsg === "requestPayment:ok") {
          uni.showToast({ title: "支付成功", icon: "success", duration: 2000 });
          
          // 步骤3：主动调用后端接口，确认支付结果（防漏单）
          await this.confirmPayResult(payParams.outTradeNo);
          
          // 步骤4：支付成功后跳转（返回上一页）
          setTimeout(() => {
            uni.navigateBack({ delta: 1 });
          }, 2000);
        }

      } catch (error) {
        // ========== 支付异常处理 ==========
        console.error("[支付失败] 详情：", error);
        
        if (error.errMsg === "requestPayment:fail cancel") {
          uni.showToast({ title: "您已取消支付", icon: "none" });
        } else if (error.errMsg === "requestPayment:fail") {
          uni.showToast({ title: "支付失败：" + (error.message || "网络异常"), icon: "none" });
        } else {
          uni.showToast({ title: error.message || "支付异常，请重试", icon: "none" });
        }
      } finally {
        // 重置状态
        uni.hideLoading();
        this.isPayLoading = false;
      }
    },

    /**
     * 辅助方法：调用后端接口获取微信支付参数（复用app.vue的全局baseUrl）
     * @returns {Object} 微信支付参数
     */
    async getWXPay() {
      try {
        // 组装请求参数
        const requestData = {
          outTradeNo: "PAY_" + Date.now() + Math.floor(Math.random() * 1000), // 商户订单号
          totalFee: this.amount * 100, // 支付金额（单位：分）
          body: `${this.tips[this.selectedStone]}充值`, // 订单描述
          attach: JSON.stringify(this.payExtParams), // 透传参数
          userId: this.payExtParams.userId,
          // 跨端兼容：获取平台类型（与app.vue逻辑对齐）
          scene: this.getPlatformType()
        };

        // 调用后端接口（使用app.vue的全局baseUrl，无需硬编码）
        const res = await wxPay(requestData)

        // 接口返回校验
        if (res.data.code !== 200 || !res.data.data) {
          uni.showToast({ title: res.data.message || "获取支付参数失败", icon: "none" });
          return null;
        }

        return res.data.data;
      } catch (error) {
        console.error("[获取支付参数失败]：", error);
        uni.showToast({ title: "获取支付参数失败，请重试", icon: "none" });
        return null;
      }
    },

    /**
     * 辅助方法：确认支付结果
     * @param {String} outTradeNo - 商户订单号
     */
    async confirmPayResult(outTradeNo) {
      try {
        await uni.request({
          url: `${this.appInstance.globalData.baseUrl}/api/pay/confirmPay`, // 复用全局baseUrl
          method: "POST",
          header: {
            "Content-Type": "application/json",
            "token": this.appInstance.globalData.token || getToken()
          },
          data: {
            outTradeNo: outTradeNo,
            userId: this.payExtParams.userId,
            stoneNum: this.getRealStoneNum(),
            amount: this.amount
          }
        });
      } catch (error) {
        console.error("[确认支付结果失败]：", error);
        // 仅打印日志，不影响用户体验
      }
    },

    /**
     * 辅助方法：转换为实际灵石数量
     * @returns {Number} 50/100/500/1000
     */
    getRealStoneNum() {
      switch (this.selectedStone) {
        case 5: return 50;
        case 9: return 100;
        case 35: return 500;
        case 60: return 1000;
        default: return 100;
      }
    },

    /**
     * 辅助方法：获取平台类型（与app.vue的跨端兼容逻辑对齐）
     * @returns {String} mini_program/android/ios/h5
     */
    getPlatformType() {
      let systemInfo = {};
      // 优先使用微信最新 API（与app.vue逻辑一致）
      if (wx && wx.getDeviceInfo) {
        const deviceInfo = wx.getDeviceInfo();
        systemInfo = {
          uniPlatform: deviceInfo.platform || ''
        };
      } else {
        systemInfo = uni.getSystemInfoSync();
      }

      const platform = systemInfo.uniPlatform || systemInfo.platform;
      if (platform === 'mp-weixin') return 'mini_program';
      if (platform === 'android') return 'android';
      if (platform === 'ios') return 'ios';
      return 'h5';
    }
  }
};
</script>

<style lang="scss" scoped>
// 继承app.vue的全局样式规范，避免冲突
.recharge-page {
  box-sizing: border-box;
  padding: 0 20rpx 20rpx 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
  // 复用app.vue定义的全局变量
  --status-bar-height: var(--status-bar-height);

  .recharge-section {
    background-color: #fff;
    border-radius: 12rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
    margin-top: calc(var(--status-bar-height) + 40rpx); // 适配状态栏高度

    .tip-container {
      background-color: #fff8e1;
      border-left: 4rpx solid #ffc107;
      padding: 15rpx 20rpx;
      margin-bottom: 20rpx;
      border-radius: 6rpx;
      animation: fadeIn 0.3s ease;
    }

    .tip-text {
      font-size: 28rpx;
      color: #e6a23c;
      line-height: 40rpx;
    }

    .stone-options {
      display: flex;
      flex-wrap: wrap;
      gap: 15rpx;
      margin-bottom: 20rpx;
      padding-left: 10rpx;
      margin-top: 40rpx;

      .stone-btn {
        width: 42%;
        float: left;
        height: 80rpx;
        line-height: 80rpx;
        text-align: center;
        border: 1rpx solid #eee;
        border-radius: 8rpx;
        font-size: 28rpx;
        background-color: transparent;
        margin-bottom: 50rpx;

        &.active {
          background-color: #007aff;
          color: #fff;
          border-color: #007aff;
        }
      }

      .stone-btn:nth-child(2n-1) {
        margin-right: 40rpx;
      }
    }

    .amount-tip {
      font-size: 32rpx;
      color: #333;
      margin-bottom: 30rpx;
      display: block;
      margin-top: 120rpx;
      margin-bottom: 40rpx;
    }

    .pay-btn {
      width: 100%;
      height: 80rpx;
      line-height: 80rpx;
      background-color: #007aff;
      color: #fff;
      border-radius: 40rpx;
      font-size: 32rpx;
      margin-bottom: 20rpx;

      &:disabled {
        background-color: #ccc;
        color: #999;
      }
    }
  }
}

// 提示显示动画
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>