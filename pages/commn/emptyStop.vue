<template>
  <!-- 空数据提示组件：无数据时显示（!hasData） -->
  <!-- 只在需要时显示，且只占图片空间，不遮挡其他内容 -->
  <view v-show="hasData" class="empty-stop-container">
    <image 
      class="stop-img" 
      src="/static/stop.png" 
      mode="aspectFit" 
      lazy-load="true"
    ></image>
  </view>
</template>

<script>
export default {
  name: 'EmptyStop',
  props: {
    // true：隐藏组件（有数据）  false：显示组件（无数据）
    hasData: {
      type: Boolean,
      default: true
    }
  }
};
</script>

<style scoped>
/* 核心容器：无定位、只占图片空间，居中显示 */
.empty-stop-container {
  /* 去掉所有定位！改用流式布局 */
  width: 100%;
  /* 让图片在容器里水平居中 */
  text-align: center;
  /* 上下加少量间距，避免和其他内容贴太紧 */
  padding: 400rpx 0;
  /* 层级保留但不遮挡（只在图片区域生效） */
  z-index: 2;
}

/* 图片大小：固定200rpx，不占满页面 */
.stop-img {
  width: 200rpx;
  height: 200rpx;
  /* 图片水平居中（兼容多端） */
  display: inline-block;
}
</style>