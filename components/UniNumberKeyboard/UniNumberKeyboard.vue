<template>
  <view class="keyboard-wrapper" v-show="show" @touchmove.stop.prevent>
    <view class="keyboard-mask" @tap="handleClose"></view>
    <view class="keyboard-content">
      <view 
        class="keyboard-preview" 
        @tap="handlePreviewTap"
        @touchstart="handlePreviewTouchStart"
        @touchmove="handlePreviewTouchMove"
        @touchend="handlePreviewTouchEnd"
      >
        <view 
          class="native-input-container"
          :class="{ 'input-focused': isInputFocused }"
          ref="inputContainer"
        >
          <!-- Placeholder -->
          <view class="input-placeholder" v-show="!currentValue && !isInputFocused">
            {{ placeholder }}
          </view>
          
          <!-- 可视文本区域 -->
          <view class="input-text-wrapper">
            <view class="input-text" :style="{ transform: `translateX(${textTranslateX}px)` }">
              <span 
                class="num-char" 
                v-for="(char, index) in formatPreviewValue().split('')" 
                :key="index"
                :data-index="index"
              >
                {{ char }}
              </span>
            </view>
            
            <!-- 优化后的光标 -->
            <view 
              class="input-cursor" 
              v-show="showCursor && isInited" 
              :style="{ left: cursorLeft + 'px' }"
            ></view>
          </view>
        </view>
      </view>
      
      <view class="keyboard-btns">
        <view 
          class="keyboard-btn" 
          v-for="num in [1,2,3,4,5,6,7,8,9]" 
          :key="num"
          @touchstart="setActiveKey(num)"
          @touchend="clearActiveKey"
          @tap="handleKeyTap(num)"
          :class="{ active: activeKey === num }"
        >
          {{ num }}
        </view>
        <view 
          class="keyboard-btn" 
          @touchstart="setActiveKey(0)"
          @touchend="clearActiveKey"
          @tap="handleKeyTap(0)"
          :class="{ active: activeKey === 0 }"
        >
          0
        </view>
        <view 
          class="keyboard-btn keyboard-btn-delete"
          @touchstart="setActiveKey('delete')"
          @touchend="clearActiveKey"
          @tap="handleDelete"
          :class="{ active: activeKey === 'delete' }"
        >
          🗑
        </view>
        <view 
          class="keyboard-btn keyboard-btn-confirm"
          @touchstart="setActiveKey('confirm')"
          @touchend="clearActiveKey"
          @tap="handleConfirm"
          :class="{ active: activeKey === 'confirm' }"
        >
          {{ confirmText || '确认' }}
        </view>
      </view>
      <view 
        class="keyboard-close-btn"
        @touchstart="setActiveKey('close')"
        @touchend="clearActiveKey"
        @tap="handleClose"
        :class="{ active: activeKey === 'close' }"
      >
        收起
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'UniNumberKeyboard',
  props: {
    show: { type: Boolean, default: false },
    value: { type: [String, Number], default: '' },
    confirmText: { type: String, default: '确认' },
    allowDot: { type: Boolean, default: false },
    max: { type: Number, default: 50 },
    min: { type: Number, default: 0 },
    placeholder: { type: String, default: '请输入数字' }
  },
  data() {
    return {
      currentValue: '',
      activeKey: '',
      isInputFocused: true,
      showCursor: true,
      cursorPosition: 0,
      cursorLeft: 0,
      touchStartX: 0,
      touchStartPos: 0,
      selectionStart: 0,
      selectionEnd: 0,
      textTranslateX: 0,
      containerWidth: 0,
      totalTextWidth: 0,
      cursorTimer: null,
      isInited: false,
      charWidth: 12, 
      cursorOffset: 0 
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        if (newVal && !this.currentValue) {
          this.currentValue = this.formatValue(newVal + '');
          this.$nextTick(() => {
            if (this.isInited) {
              this.updateCursorPosition(this.currentValue.length);
            }
          });
        }
      }
    },
    show: {
      handler(newVal) {
        if (newVal) {
          this.isInputFocused = true;
          setTimeout(() => {
            this.isInited = true;
            this.calcContainerWidth();
            this.updateCursorPosition(this.currentValue.length);
            this.startCursorBlink();
          }, 100);
        } else {
          this.stopCursorBlink();
          this.resetSelection();
          this.isInited = false;
        }
      }
    },
    currentValue() {
      if (!this.isInited) return;
      this.$nextTick(() => {
        this.totalTextWidth = this.currentValue.length * this.charWidth;
        this.updateCursorPosition(Math.min(this.cursorPosition, this.currentValue.length));
        this.adjustTextScroll();
      });
    }
  },
  mounted() {
    setTimeout(() => {
      this.isInited = true;
      this.calcContainerWidth();
      this.startCursorBlink();
    }, 100);
  },
  beforeDestroy() {
    this.stopCursorBlink();
    this.isInited = false;
  },
  methods: {
    setActiveKey(key) { 
      this.activeKey = key; 
      this.showCursor = true;
      this.resetSelection();
    },
    clearActiveKey() { 
      this.$nextTick(() => this.activeKey = ''); 
    },
    formatValue(val) {
      if (!val) return '';
      let formattedVal = this.allowDot ? val : val.replace(/\./g, '').replace(/^0+(?=\d)/, '');
      formattedVal = formattedVal || '0';
      const num = Number(formattedVal);
      return num > this.max ? this.max + '' : formattedVal;
    },
    formatPreviewValue() {
      return this.currentValue || '';
    },
    calcContainerWidth() {
      if (!this.isInited || !this.$refs.inputContainer) {
        this.containerWidth = 300;
        return;
      }
      uni.createSelectorQuery().in(this)
        .select('.native-input-container')
        .boundingClientRect(rect => {
          if (rect) {
            this.containerWidth = rect.width - 12;
            this.maxShowChars = Math.floor(this.containerWidth / this.charWidth);
          }
        }).exec();
    },
    updateCursorPosition(pos) {
      if (!this.isInited) return;
      this.cursorPosition = Math.max(0, Math.min(pos, this.currentValue.length));
      this.cursorLeft = this.cursorPosition * this.charWidth + this.cursorOffset;
      this.adjustTextScroll();
    },
    adjustTextScroll() {
      if (this.totalTextWidth <= this.containerWidth) {
        this.textTranslateX = 0;
        return;
      }
      if (this.cursorLeft > this.containerWidth - this.charWidth) {
        this.textTranslateX = this.containerWidth - this.cursorLeft - this.charWidth;
      }
      if (this.cursorLeft < -this.textTranslateX) {
        this.textTranslateX = -this.cursorLeft;
      }
      this.textTranslateX = Math.max(-(this.totalTextWidth - this.containerWidth), Math.min(0, this.textTranslateX));
    },
    startCursorBlink() {
      this.stopCursorBlink();
      this.showCursor = true;
      this.cursorTimer = setInterval(() => {
        this.showCursor = this.isInputFocused && !this.showCursor;
      }, 500);
    },
    stopCursorBlink() {
      if (this.cursorTimer) {
        clearInterval(this.cursorTimer);
        this.cursorTimer = null;
      }
    },
    resetSelection() {
      this.selectionStart = this.selectionEnd = this.cursorPosition;
    },
    updateSelection(start, end) {
      if (!this.isInited) return;
      this.selectionStart = Math.min(start, end);
      this.selectionEnd = Math.max(start, end);
      this.updateCursorPosition(this.selectionEnd);
    },
    handlePreviewTap(e) {
      if (!this.isInited) return;
      this.isInputFocused = true;
      uni.createSelectorQuery().in(this)
        .select('.native-input-container')
        .boundingClientRect(rect => {
          if (!rect) return;
          const clickX = e.touches[0].clientX - rect.left - 12 - this.textTranslateX;
          const targetPos = Math.round(clickX / this.charWidth);
          this.updateCursorPosition(Math.min(targetPos, this.currentValue.length));
          this.resetSelection();
        }).exec();
    },
    handlePreviewTouchStart(e) {
      if (!this.isInited) return;
      this.touchStartX = e.touches[0].clientX;
      this.touchStartPos = this.cursorPosition;
    },
    handlePreviewTouchMove(e) {
      if (!this.isInited) return;
      const moveX = e.touches[0].clientX - this.touchStartX;
      const movePos = Math.round(moveX / this.charWidth);
      this.updateSelection(this.touchStartPos, this.touchStartPos + movePos);
    },
    handlePreviewTouchEnd() {
      if (this.selectionStart === this.selectionEnd) {
        this.resetSelection();
      }
    },
    handleKeyTap(val) {
      if (!this.isInited) return;
      if (val === '.' && (!this.allowDot || this.currentValue.includes('.'))) return;

      let tempValue = this.currentValue;
      if (this.selectionStart !== this.selectionEnd) {
        tempValue = tempValue.substring(0, this.selectionStart) + tempValue.substring(this.selectionEnd);
        this.updateCursorPosition(this.selectionStart);
      }
      const before = tempValue.substring(0, this.cursorPosition);
      const after = tempValue.substring(this.cursorPosition);
      tempValue = this.formatValue(before + val + after);
      this.currentValue = tempValue;
      this.updateCursorPosition(this.cursorPosition + 1);
      this.$emit('input', this.currentValue || '0');
    },
    handleDelete() {
      if (!this.isInited || !this.currentValue || this.currentValue === '0') return;

      let tempValue = this.currentValue;
      if (this.selectionStart !== this.selectionEnd) {
        tempValue = tempValue.substring(0, this.selectionStart) + tempValue.substring(this.selectionEnd);
        this.updateCursorPosition(this.selectionStart);
      } else if (this.cursorPosition > 0) {
        tempValue = tempValue.substring(0, this.cursorPosition - 1) + tempValue.substring(this.cursorPosition);
        this.updateCursorPosition(this.cursorPosition - 1);
      } else if (this.currentValue.length === 1) {
        tempValue = '';
        this.updateCursorPosition(0);
      }
      this.$nextTick(()=>{
        this.currentValue = this.formatValue(tempValue);
      })
      this.$emit('input', this.currentValue || '0');
    },
    handleConfirm() {
      const finalValue = this.currentValue || '0';
      this.$emit('confirm', finalValue);
      this.handleClose();
    },
    handleClose() {
      this.$emit('update:show', false);
      this.currentValue = '';
      this.updateCursorPosition(0);
      this.isInputFocused = false;
    }
  }
}
</script>

<style scoped lang="scss">
.keyboard-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}
.keyboard-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
}
.keyboard-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -2rpx 12rpx rgba(0,0,0,0.1);
}

.keyboard-preview {
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20rpx;
  background: #f8f9fa;

  .native-input-container {
    width: 90%;
    height: 70rpx;
    background: #ffffff;
    border: 2rpx solid #e5e7eb;
    border-radius: 12rpx;
    padding: 0 12rpx;
    position: relative;
    overflow: hidden;
    transition: all 0.2s ease;

    &.input-focused {
      border-color: #007aff;
      box-shadow: 0 0 0 4rpx rgba(0, 122, 255, 0.15);
    }

    .input-placeholder {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      line-height: 70rpx;
      font-size: 32rpx;
      color: #9ca3af;
      text-align: center;
      z-index: 1;
      font-weight: 400;
    }

    .input-text-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .input-text {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      line-height: 70rpx;
      font-size: 36rpx;
      font-family: 'PingFang SC', 'Helvetica Neue', sans-serif;
      white-space: nowrap;
      z-index: 2;
    }

    .num-char {
      display: inline-block;
      width: 12px;
      text-align: center;
      color: #666;
      letter-spacing: 0;
    }

    .input-cursor {
      width: 3rpx;
      height: 48rpx;
      background: #007aff;
      position: absolute;
      top: 11rpx;
      z-index: 3;
      transition: left 0.1s ease, opacity 0.1s ease;
      border-radius: 1rpx;
    }
  }
}

.keyboard-btns {
  display: flex;
  flex-wrap: wrap;
  padding: 15rpx 10rpx;
}
.keyboard-btn {
  width: 33.333%;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 38rpx;
  box-sizing: border-box;
  border: 1px solid #f0f0f0;
  margin: 4rpx;
  width: calc(33.333% - 8rpx);
  background: #fff;
  transition: all 0.1s ease;
  border-radius: 8rpx;
  &.active {
    background: #eef2ff;
    transform: scale(0.97);
  }
}
.keyboard-btn-delete {
  background: #f9fafb;
  &.active { background: #f3f4f6; }
}
.keyboard-btn-confirm {
  background: #007aff;
  color: #fff;
  &.active { background: #0066cc; }
}
.keyboard-close-btn {
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 32rpx;
  background: #f3f4f6;
  color: #4b5563;
  transition: all 0.1s ease;
  &.active { background: #e5e7eb; }
}

// 平台适配
// #ifdef MP-WEIXIN
.keyboard-content { border-radius: 0; }
// #endif
// #ifdef APP-PLUS
.keyboard-btn { font-size: 40rpx; }
.native-input-container .input-text { font-size: 38rpx; }
// #endif
</style>