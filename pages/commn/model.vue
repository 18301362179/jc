<template>
  <view class="coupon-modal" v-if="showModal">
    <view class="modal-mask"></view>
    <view class="modal-content">
      <view class="modal-title">解锁</view>
      <view class="input-container">
        <input 
          v-model="code"
          placeholder="请输入大写字母+数字（必须10位）" 
          class="code-input"
          maxlength="10"
          @input="handleInput"
          placeholder-class="placeholder-style"
          clearable
        />
        <view class="error-tip">{{ errorMsg }}</view>
      </view>
      <view class="modal-desc">每个解锁码仅限使用一次</view>
      <view class="modal-buttons">
        <button class="confirm-btn" @click="confirmCode">解锁</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: { showModal: { type: Boolean, default: false } },
  data() {
    return { code: '', showError: false, errorMsg: '' }
  },
  methods: {
    closeModal() {
      this.code = ''
      this.showError = false
      this.errorMsg = ''
      this.$emit('update:showModal', false)
    },
    handleInput() {
      // 输入时检测：含无效字符 或 长度≠10位，均显示错误提示
      const hasInvalidChar = /[^A-Z0-9]/.test(this.code)
      const isLengthInvalid = this.code.length !== 10
      
      if (hasInvalidChar) {
        this.showError = true
        this.errorMsg = '格式错误'
      } else if (isLengthInvalid) {
        this.showError = true
        this.errorMsg = '格式错误'
      } else {
        this.showError = false
        this.errorMsg = ''
      }
    },
    confirmCode() {
      // 1. 校验是否为空
      if (!this.code.trim()) {
        this.showError = true
        this.errorMsg = '请输入解锁码'
        return
      }
      // 2. 严格校验：仅允许大写字母+数字，且长度必须10位（合并正则）
      const validReg = /^[A-Z0-9]{10}$/
      if (!validReg.test(this.code)) {
        this.showError = true
        this.errorMsg = '格式错误'
        return
      }
      // 3. 校验通过，提交解锁码
      this.$emit('confirm', this.code)
      // 提交后重置状态（可选，根据需求决定是否关闭弹窗）
      // this.closeModal()
    }
  },
  watch: {
    showModal(newVal) {
      if (newVal) {
        this.code = ''
        this.showError = false
        this.errorMsg = ''
      }
    }
  }
}
</script>

<style scoped>
/* 样式保持不变 */
.coupon-modal { position: relative; }
.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 9999999;
}
.modal-content {
  position: fixed;
  top: 46%; left: 50%;
  transform: translate(-50%, -50%);
  width: 650rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  z-index: 99999999;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.2);
}
.modal-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 30rpx;
}
.input-container {
  position: relative;
  margin-bottom: 24rpx;
}
.code-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #eee;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}
.code-input:focus { border-color: #007aff; }
.placeholder-style { color: #ccc; font-size: 28rpx; }
.error-tip {
  font-size: 22rpx;
  color: #ff4d4f;
  margin-top: 8rpx;
  height: 34rpx;
}
.modal-desc {
  font-size: 24rpx;
  color: #999;
  text-align: center;
  margin-bottom: 40rpx;
}
.modal-buttons { display: flex; justify-content: center; }
.confirm-btn {
  width: 280rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: #ff4d4f;
  color: #fff;
  font-size: 28rpx;
  border-radius: 10rpx;
  border: none;
}
</style>