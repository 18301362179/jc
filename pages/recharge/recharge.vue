<template>
  <view class="recharge-page">
    <CustomHeader
      :title="'服务币'"
      :showBack="true"
      :isIndex="false"
      :showIcon="false"
      :isSelected="false"
      :selectedPlay="''"
      @funnel-click="handleFunnel"
      @back-click="onBackClick"
    />
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
          {{ item.count }}元&nbsp;{{ item.bi }}服务币
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
// H5授权相关（新增）
import { checkH5Token } from "@/utils/h5Auth";
import { getToken, setToken } from "@/utils/storage";
// 只保留 wxPay（统一获取支付参数），删除 h5Pay
import { wxPay, payConfirm } from "@/api/demo"; 
import CustomHeader from "@/components/CustomHeader.vue";
export default {
  name: "RechargePage",
  components: {
    CustomHeader,
  },
  data() {
    return {
      // 灵石档位列表
      list: [
        { count: 10, bi: 50 },    
        { count: 19, bi: 100 },   
        { count: 45, bi: 250 },  
        { count: 80, bi: 500 }  
      ],
      // 选中的列表索引
      selectedIndex: 1, 
      // 提示相关
      showTip: false,
      currentTip: "",
      // 支付透传参数
      payExtParams: {
        beFrom: "",
        isLottery: 1, 
      },
      // 支付加载状态（防止重复点击）
      isPayLoading: false,
    };
  },
  onLoad(options) {
    // 接收透传参数（如来源）
    if (options && options.beFrom) {
      this.payExtParams.beFrom = options.beFrom;
    }
  },
  methods: {
    /**
     * 选择灵石档位
     */
    selectStone(item, index) {
      this.selectedIndex = index;
    },

    /**
     * 核心：处理付款逻辑（多端适配，只用 wxPay）
     */
    async handlePay() {
      if (this.isPayLoading) return;
      this.isPayLoading = true;

      try {
        // ========== 前置校验 ==========
        const selectedItem = this.list[this.selectedIndex];
        if (!selectedItem) {
          uni.showToast({ title: "请先选择灵石数量", icon: "none" });
          this.isPayLoading = false;
          return;
        }

        // 多端登录态校验
        let isTokenValid = false;
        if (process.env.UNI_PLATFORM === 'h5') {
          isTokenValid = await checkH5Token();
        } else if (process.env.UNI_PLATFORM === 'mp-weixin') {
          isTokenValid = await checkToken();
        }

        // 登录态失效：重新登录/授权
        if (!isTokenValid) {
          uni.showToast({ title: "登录态失效，正在重新验证...", icon: "none" });
          if (process.env.UNI_PLATFORM === 'h5') {
            await import('@/utils/h5Auth').then(mod => mod.h5WechatAuth());
            this.isPayLoading = false;
            return;
          } else if (process.env.UNI_PLATFORM === 'mp-weixin') {
            const loginResult = await login();
            if (!loginResult.success) {
              uni.showToast({ title: "登录失败，请重试", icon: "none" });
              this.isPayLoading = false;
              return;
            }
          }
        }

        uni.showLoading({ title: "支付中...", mask: true });

        // ========== 统一调用 wxPay 获取支付参数 ==========
        const payParams = await this.getPayParams(selectedItem);
        if (!payParams) {
          uni.hideLoading();
          this.isPayLoading = false;
          return;
        }
        console.log(payParams, 'payParams2222222222222222222')
        // ========== 分端处理支付 ==========
        // 1. 小程序支付
        if (process.env.UNI_PLATFORM === 'mp-weixin') {
          await this.handleMpWeixinPay(payParams);
        }
        // 2. H5公众号支付（用 wxPay 返回的参数）
        else if (process.env.UNI_PLATFORM === 'h5') {
          await this.handleH5Pay(payParams);
        }
        // 3. 其他端
        else {
          uni.showToast({ title: "当前平台暂不支持支付", icon: "none" });
          uni.hideLoading();
          this.isPayLoading = false;
        }

      } catch (error) {
        console.error("[支付异常]：", error);
        uni.hideLoading();
        this.isPayLoading = false;
        uni.showToast({ title: "支付发起失败，请重试", icon: "none" });
      }
    },

    /**
     * 统一获取支付参数（只用 wxPay，不分小程序/H5）
     */
    async getPayParams(selectedItem) {
      try {
        // 组装请求参数（区分端，给后端传标识）
        const requestData = {
          coinSum: selectedItem.bi,     
          payment: selectedItem.count,
          channel: 'serviceAccount'
        };

        // 只调用 wxPay 接口
        const res = await wxPay(requestData);
        console.log("支付参数：", res);
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

    /**
     * 小程序微信支付
     */
    async handleMpWeixinPay(payParams) {
      try {
        uni.requestPayment({
          provider: "wxpay",
          timeStamp: payParams.paymentResult.timeStamp + "",
          nonceStr: payParams.paymentResult.nonceStr,
          package: payParams.paymentResult.packageVal,
          signType: payParams.paymentResult.signType || "MD5",
          paySign: payParams.paymentResult.paySign,
          // 支付成功
          success: (payResult) => {
            if (payResult.errMsg === "requestPayment:ok") {
              uni.showToast({ title: "支付成功", icon: "success", duration: 2000 });
              this.confirmPayResult(payParams.order.tradeNo, 1);
              setTimeout(() => {
                uni.navigateBack({ delta: 1 });
              }, 2000);
            }
          },
          // 支付失败
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
          // 完成
          complete: () => {
            uni.hideLoading();
            this.isPayLoading = false;
          }
        });
      } catch (error) {
        throw error;
      }
    },

/**
 * H5公众号支付
 */
async handleH5Pay(payParams) {
  try {
    if (!window.jWeixin) {
      throw new Error("微信支付插件未加载，请刷新页面");
    }

    const pr = payParams.paymentResult;
    const config = {
      appId: pr.appId,
      timestamp: pr.timeStamp,
      nonceStr: pr.nonceStr,
      signature: pr.paySign,
      jsApiList: ['chooseWXPay'],
    };

    window.jWeixin.config({
      ...config
    });

    window.jWeixin.ready(() => {
      window.jWeixin.chooseWXPay({
        appId: pr.appId,
        timestamp: pr.timeStamp,
        nonceStr: pr.nonceStr,
        package: pr.packageVal,
        signType: pr.signType || 'MD5',
        paySign: pr.paySign,
        success: async (res) => {
          console.log('【支付成功】', res);
         
          
          await new Promise(resolve => setTimeout(resolve, 500));
          // 确认支付结果（不会被阻拦，await 保证执行）
          await this.confirmPayResult(payParams.order.tradeNo, 1);
          uni.showToast({ title: '支付成功', icon: 'success' });
        },
        fail: async (err) => {
          console.error('【支付失败】', err);

          // 失败也用 await 确保接口调用
          await this.confirmPayResult(payParams.order.tradeNo, 0);
            uni.showModal({
            title: '支付失败',
            content: `支付异常：${err.errMsg || ''}`,
            showCancel: false
          });
        },
        cancel: async () => {
          // 用户取消：0
          await this.confirmPayResult(payParams.order.tradeNo, 0);
          uni.showToast({ title: '已取消支付', icon: 'none' });
        },
        complete: () => {
          this.isPayLoading = false;
          uni.hideLoading();
        }
      });
    });

    window.jWeixin.error(async (err) => {
      console.error("微信SDK配置失败：", err);
      await this.confirmPayResult(payParams.order.tradeNo, 2);
      uni.showToast({ title: "支付验证失败", icon: "none" });
      this.isPayLoading = false;
      uni.hideLoading();
    });

  } catch (error) {
    uni.hideLoading();
    this.isPayLoading = false;
    await this.confirmPayResult(payParams.order.tradeNo, 2);
    uni.showToast({ title: "支付发起失败：" + error.message, icon: "none" });
  }
},

    /**
     * 确认支付结果
     */
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