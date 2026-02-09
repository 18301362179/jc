<template>
  <!-- 核心改：行内绑定top值，小程序唯一兼容的动态样式方式 -->
  <view class="draw-num-selector" :style="{ top: navBarTotalHeight + 'rpx' }">
    <!-- 左侧游戏规则按钮 -->
    <view class="rule-btn">游戏规则</view>
    <!-- 右侧期数选择器：增加空数据兜底 -->
    <view class="selector-wrap" @click="toggleDropdown">
      <text class="current-num">{{ currentDrawNum || "暂无" }}期</text>
      <text class="arrow-icon" :class="{ 'arrow-rotate': isDropdownShow }">▼</text>
    </view>
    <!-- 下拉弹窗：空数据提示 -->
    <view v-if="isDropdownShow" class="dropdown-menu" @click.stop>
      <view v-if="drawNumList.length === 0" class="empty-item">暂无可选期数</view>
      <view v-else v-for="(num) in drawNumList" :key="num" class="dropdown-item" :class="{ active: num === currentDrawNum }" @click="selectDrawNum(num)"> {{ num }}期 </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    drawNumList: {
      type: Array,
      default: () => [],
    },
    currentDrawNum: {
      type: [String, Number], // 兼容数字类型的期数
      default: "",
    },
    // 接收父组件传递的导航栏总高度（rpx单位）
    navBarTotalHeight: {
      type: Number,
      default: 88, // 兜底默认值
    },
  },
  data() {
    return {
      isDropdownShow: false,
    };
  },
  methods: {
    toggleDropdown() {
      this.isDropdownShow = !this.isDropdownShow;
    },
    selectDrawNum(num) {
      this.isDropdownShow = false;
      this.$emit("draw-num-change", num);
    },
  },
};
</script>

<style scoped lang="scss">
.draw-num-selector {
  position: fixed;
  left: 0;
  width: 100%;
  height: 70rpx;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24rpx;
  box-sizing: border-box;
  border-bottom: 1rpx solid #eee;
  z-index: 999; // 提高层级，避免被覆盖
  // 小程序兼容：强制硬件加速渲染
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.rule-btn {
  font-size: 28rpx;
  color: #d92929;
  padding: 10rpx; // 扩大点击区域
}

.selector-wrap {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  color: #333;
  padding: 10rpx; // 扩大点击区域
}

.current-num {
  // 空数据时的样式提示
  color: #333;
  &:empty {
    color: #999;
  }
}

.arrow-icon {
  font-size: 24rpx;
  transition: transform 0.2s;
}

.arrow-rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 70rpx; // 相对于父组件的高度，固定值即可
  right: 24rpx;
  background: #fff;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 1000; // 高于父容器
  min-width: 120rpx; // 兜底宽度
}

.dropdown-item {
  padding: 16rpx 28rpx;
  font-size: 26rpx;
  color: #333;
  white-space: nowrap;
  &.active {
    background: #f5f5f5;
    color: #d92929;
  }
  &:active {
    background: #f0f0f0;
  }
}

// 空数据提示样式
.empty-item {
  padding: 16rpx 28rpx;
  font-size: 26rpx;
  color: #999;
  text-align: center;
}
</style>
