<template>
  <view class="recharge-page">
    <!-- 充值区域 -->
    <view class="recharge-section">
      <!-- 提示显示区域 -->
      <view class="tip-container" v-if="showTip">
        <text class="tip-text">{{ currentTip }}</text>
      </view>

      <!-- 灵石选择按钮组（按index控制选中） -->
      <view class="stone-options">
        <button 
          class="stone-btn" 
          :class="{ active: selectedIndex === index }" 
          @tap="selectStone(item, index)"
          v-for="(item, index) in list" 
          :key="index"
        >
          {{ item.count }}元&nbsp;&nbsp;&nbsp;{{ item.bi }}币
        </button>
      </view>

      <!-- 应付金额展示（通过选中的index取值） -->
      <text class="amount-tip" v-if="list[selectedIndex]">应付金额：{{ list[selectedIndex].count }}元</text>

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
import { login, checkToken } from "@/utils/auth";
import { getToken, setToken } from "@/utils/storage";
import { wxPay,payConfirm } from "@/api/demo";
export default {
  name: "RechargePage",
  data() {
    return {
      // 灵石档位列表（按你要求的字段：count=钱数，bi=灵石数）
      list: [
        { count: 10, bi: 100 },    // 5元=50灵石
        { count: 19, bi: 200 },   // 9元=100灵石
        { count: 45, bi: 500 },  // 35元=500灵石
        { count: 80, bi: 1000 }  // 60元=1000灵石
      ],
      // 选中的列表索引（核心：用index控制选中状态）
      selectedIndex: 1, // 默认选中第2项（9元/100灵石）
      // 提示相关
      showTip: false,
      currentTip: "",
      // 支付透传参数
      payExtParams: {
        beFrom: "",
        isLottery: 1, // 固定值：1
      },
      // 支付加载状态（防止重复点击）
      isPayLoading: false,
    };
  },
  onLoad(options) {

  },
  methods: {
    /**
     * 选择灵石档位（接收item和index）
     * @param {Object} item - 当前选中的档位对象
     * @param {Number} index - 当前选中的列表索引
     */
    selectStone(item, index) {
      this.selectedIndex = index; // 存储选中的索引
      // 如需缓存选中的item，也可新增变量存储：this.selectedItem = item;
    },

    /**
     * 核心：处理付款逻辑
     */
async handlePay() {
  // 防止重复点击
  if (this.isPayLoading) return;
  this.isPayLoading = true;

  try {
    // ========== 前置校验（完全不变） ==========
    const selectedItem = this.list[this.selectedIndex];
    if (!selectedItem) {
      uni.showToast({ title: "请先选择灵石数量", icon: "none" });
      this.isPayLoading = false;
      return;
    }

    const isTokenValid = await checkToken();
    if (!isTokenValid) {
      uni.showToast({ title: "登录态失效，正在重新登录...", icon: "none" });
      const loginResult = await login();
      if (!loginResult.success) {
        uni.showToast({ title: "登录失败，请重试", icon: "none" });
        this.isPayLoading = false;
        return;
      }
    }

    // ========== 发起支付（回调写法 + 适配普通对象） ==========
    uni.showLoading({ title: "支付中...", mask: true });

    const payParams = await this.getWXPay();
    if (!payParams) {
      uni.hideLoading();
      this.isPayLoading = false;
      return;
    }

    // 调用支付接口，使用success/fail回调处理结果
    uni.requestPayment({
      provider: "wxpay",
      timeStamp: payParams.paymentResult.timeStamp + "",
      nonceStr: payParams.paymentResult.nonceStr,
      package: payParams.paymentResult.packageVal,
      signType: payParams.paymentResult.signType || "MD5",
      paySign: payParams.paymentResult.paySign,
      // ========== success回调：直接用普通对象 ==========
      success: (payResult) => {
        console.log(payResult, 'payResult结果--------------')
        // 去掉数组处理，直接判断errMsg
        if (payResult.errMsg === "requestPayment:ok") {
          uni.showToast({ title: "支付成功", icon: "success", duration: 2000 });
          // 确认支付结果，传status=1
          this.confirmPayResult(payParams.order.tradeNo, 1);
          // 跳转页面
          setTimeout(() => {
            uni.navigateBack({ delta: 1 });
          }, 2000);
        }
      },
      // ========== fail回调：直接用普通对象 ==========
      fail: (error) => {
        console.error("[支付失败] 详情：", error);
        // 去掉数组处理，直接判断errMsg
        if (error.errMsg === "requestPayment:fail cancel") {
          // 取消支付，传status=0
          this.confirmPayResult(payParams.order.tradeNo, 0);
          uni.showToast({ title: "您已取消支付", icon: "none" });
        } else if (error.errMsg === "requestPayment:fail") {
          // 支付失败，传status=3
          this.confirmPayResult(payParams.order.tradeNo, 3);
          uni.showToast({ title: "支付失败：" + (error.message || "网络异常"), icon: "none" });
        } else {
          // 支付异常，传status=4
          this.confirmPayResult(payParams.order.tradeNo, 4);
          uni.showToast({ title: error.message || "支付异常，请重试", icon: "none" });
        }
      },
      // ========== complete回调：重置状态 ==========
      complete: () => {
        uni.hideLoading();
        this.isPayLoading = false;
      }
    });

  } catch (error) {
    // 仅处理前置逻辑的异常
    console.error("[前置逻辑异常] 详情：", error);
    uni.hideLoading();
    this.isPayLoading = false;
    uni.showToast({ title: "支付发起失败，请重试", icon: "none" });
  }
},

    /**
     * 辅助方法：调用后端接口获取微信支付参数（通过index取选中项）
     * @returns {Object} 微信支付参数
     */
    async getWXPay() {
      try {
        // 通过选中的index获取当前档位的字段
        const selectedItem = this.list[this.selectedIndex];
        // 组装请求参数
        const requestData = {
          coinSum: selectedItem.bi,     // 灵石数（bi字段）
          payment: selectedItem.count,  // 支付金额（count字段）
        };

        // 调用后端接口
        const res = await wxPay(requestData);
        console.log(res, "res----------------");
        // 接口返回校验
        if (!res.data) {
          uni.showToast({ title: res.message || "获取支付参数失败", icon: "none" });
          return null;
        }
        console.log(res.data, "data---------------");
        return res.data;
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
    async confirmPayResult(tradeNo,status) {
      try {
        await payConfirm({tradeNo,status})
      } catch (error) {
        console.error("[确认支付结果失败]：", error);
        // 仅打印日志，不影响用户体验
      }
    }
  },
};
</script>

<style lang="scss" scoped>
// 样式无核心变化，保持原有样式即可
.recharge-page {
  box-sizing: border-box;
  padding: 0 20rpx 20rpx 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
  --status-bar-height: var(--status-bar-height);

  .recharge-section {
    background-color: #fff;
    border-radius: 12rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
    margin-top: calc(var(--status-bar-height) + 40rpx);

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