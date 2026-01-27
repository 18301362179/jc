<template>
  <view class="reminder-dialog" v-if="isShow">
    <view class="dialog-content">
      <text class="dialog-title">{{ title }}</text>
      <text class="dialog-message">{{ message }}</text>
      <view class="dialog-buttons">
        <button class="dialog-btn cancel-btn" @tap="handleCancel">取消</button>
        <button class="dialog-btn exchange-btn" @tap="handleExchange">兑换</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ReminderDialog',
  props: {
    // 是否显示弹窗
    isShow: {
      type: Boolean,
      default: false
    },
    // 弹窗标题（默认"提示"）
    title: {
      type: String,
      default: "提示"
    },
    // 弹窗提示内容（默认"您的灵石不足，请兑换！"）
    message: {
      type: String,
      default: "您的灵石不足，请兑换！"
    }
  },
  methods: {
    // 取消按钮回调
    handleCancel() {
      this.$emit('cancel');
    },
    // 兑换按钮回调
    handleExchange() {
      this.$emit('exchange');
    }
  }
};
</script>

<style scoped lang="scss">
.reminder-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999999;

  .dialog-content {
    width: 600rpx;
    background-color: #fff;
    border-radius: 12rpx;
    padding: 30rpx;
    display: flex;
    flex-direction: column;
    align-items: center;

    .dialog-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 20rpx;
    }

    .dialog-message {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 30rpx;
      text-align: center;
    }

    .dialog-buttons {
      display: flex;
      width: 100%;
      justify-content: space-around;

      .dialog-btn {
        width: 200rpx;
        height: 70rpx;
        line-height: 70rpx;
        text-align: center;
        border-radius: 35rpx;
        font-size: 28rpx;
        border: none;
      }

      .exchange-btn {
        background-color: #d92929;
        color: #fff;
      }

      .cancel-btn {
        background-color: #f5f5f5;
        color: #333;
      }
    }
  }
}
</style>