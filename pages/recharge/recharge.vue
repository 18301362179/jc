<template>
  <view class="recharge-page">
    <CustomHeader
      :title="'KeepSeek'"
      :showBack="true"
      :isIndex="false"
      :showIcon="false"
      :isSelected="false"
      :selectedPlay="''"
      @funnel-click="handleFunnel"
      @back-click="onBackClick"
    />
    <view class="recharge-section">
      <view class="tip-container" v-if="showTip">
        <text class="tip-text">{{ currentTip }}</text>
      </view>

      <view class="stone-options">
        <button 
          class="stone-btn" 
          :class="{ active: selectedIndex === index }" 
          @tap="selectStone(item, index)"
          v-for="(item, index) in list" 
          :key="index"
        >
          {{ item.count }}{{item.countName}}&nbsp;&nbsp;&nbsp;{{ item.bi }}{{item.biName}}
        </button>
      </view>

      <text class="amount-tip" v-if="list[selectedIndex]">{{showText}}：{{ list[selectedIndex].count }}{{countName}}</text>

      <button class="pay-btn" @click="handlePay" :disabled="isPayLoading">
        <text v-if="!isPayLoading">确认</text>
        <text v-if="isPayLoading">加载中...</text>
      </button>
    </view>
  </view>
</template>

<script>
import { login, checkToken } from "@/utils/auth";
import { wxPay, payConfirm, userPage } from "@/api/demo"; 
import CustomHeader from "@/components/CustomHeader.vue";

export default {
  name: "RechargePage",
  components: {
    CustomHeader,
  },
  data() {
    return {
      list: [],
      selectedIndex: 1, 
      showTip: false,
      currentTip: "",
      payExtParams: {
        beFrom: "",
        isLottery: 1, 
      },
      isPayLoading: false,
      showText:'',
      countName:''
    };
  },
  onLoad(options) {
    if (options && options.beFrom) {
      this.payExtParams.beFrom = options.beFrom;
    }
    userPage().then((res)=>{
      console.log(res, 'page-----------')
      this.list = res.data.list;
      this.countName = res.data.list[0].countName;
      this.showText = res.data.showText;
    })
  },
  methods: {
    selectStone(item, index) {
      this.selectedIndex = index;
    },

    async handlePay() {
      if (this.isPayLoading) return;
      this.isPayLoading = true;

      try {
        const selectedItem = this.list[this.selectedIndex];
        if (!selectedItem) {
          uni.showToast({ title: "请先选择", icon: "none" });
          this.isPayLoading = false;
          return;
        }

        const isTokenValid = await checkToken();
        if (!isTokenValid) {
          uni.showToast({ title: "登录态失效，正在重新验证...", icon: "none" });
          const loginResult = await login();
          if (!loginResult.success) {
            uni.showToast({ title: "登录失败，请重试", icon: "none" });
            this.isPayLoading = false;
            return;
          }
        }

        uni.showLoading({ title: "支付中...", mask: true });

        const payParams = await this.getPayParams(selectedItem);
        if (!payParams) {
          uni.hideLoading();
          this.isPayLoading = false;
          return;
        }

        await this.handleMpWeixinPay(payParams);

      } catch (error) {
        console.error("[支付异常]：", error);
        uni.hideLoading();
        this.isPayLoading = false;
        uni.showToast({ title: "支付发起失败，请重试", icon: "none" });
      }
    },

    async getPayParams(selectedItem) {
      try {
        const requestData = {
          coinSum: selectedItem.bi,     
          payment: selectedItem.count,
          channel: "miniProgram"
        };

        const res = await wxPay(requestData);
        if (!res.data) {
          uni.showToast({ title: res.message || "获取支付参数失败", icon: "none" });
          return null;
        }
        return res.data;
      } catch (error) {
        console.error("[获取支付参数失败]：", error);
        uni.showToast({ title: "获取支付参数失败，请重试", icon: "none" });
        return null;
      }
    },

    async handleMpWeixinPay(payParams) {
      try {
        uni.requestPayment({
          provider: "wxpay",
          timeStamp: payParams.paymentResult.timeStamp + "",
          nonceStr: payParams.paymentResult.nonceStr,
          package: payParams.paymentResult.packageVal,
          signType: payParams.paymentResult.signType || "MD5",
          paySign: payParams.paymentResult.paySign,
          success: (payResult) => {
            if (payResult.errMsg === "requestPayment:ok") {
              uni.showToast({ title: "支付成功", icon: "success", duration: 2000 });
              this.confirmPayResult(payParams.order.tradeNo, 1);
              setTimeout(() => {
                uni.navigateBack({ delta: 1 });
              }, 2000);
            }
          },
          fail: (error) => {
            console.error("[小程序支付失败]：", error);
            let status = 0;
            let tip = "您已取消支付";
            if (error.errMsg === "requestPayment:fail cancel") {
              status = 0;
            } else if (error.errMsg === "requestPayment:fail") {
              status = 3;
              tip = "支付失败：" + (error.message || "网络异常");
            } else {
              status = 4;
              tip = error.message || "支付异常，请重试";
            }
            this.confirmPayResult(payParams.order.tradeNo, status);
            uni.showToast({ title: tip, icon: "none" });
          },
          complete: () => {
            uni.hideLoading();
            this.isPayLoading = false;
          }
        });
      } catch (error) {
        throw error;
      }
    },

    async confirmPayResult(tradeNo, status) {
      try {
        await payConfirm({ tradeNo, status });
      } catch (error) {
        console.error("[确认支付结果失败]：", error);
      }
    }
  },
};
</script>

<style lang="scss" scoped>
.recharge-page {
  background-color: #f5f5f5;
  --status-bar-height: var(--status-bar-height);
  overflow: hidden;
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