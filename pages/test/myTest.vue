<template>
  <view class="container">
    <view class="table-title">Uni-app Grid 模拟表格（支持合并）</view>
    
    <!-- 表格容器 -->
    <view class="grid-table">
      <!-- 表头 -->
      <view class="grid-cell header">序号</view>
      <view class="grid-cell header">姓名</view>
      <view class="grid-cell header">年龄</view>
      <view class="grid-cell header">职业</view>

      <!-- 第一行：普通数据 -->
      <view class="grid-cell">1</view>
      <view class="grid-cell">张三</view>
      <view class="grid-cell">25</view>
      <view class="grid-cell">前端</view>

      <!-- 第二行 & 第三行：演示跨行 (Rowspan) -->
      <!-- 跨2行：占据第1列的第2、3行位置 -->
      <view class="grid-cell row-span-2 bg-blue">技术部</view>
      <view class="grid-cell">李四</view>
      <view class="grid-cell">28</view>
      <view class="grid-cell">后端</view>
      
      <!-- 第三行剩余部分（注意：第1列已被上面占用，这里只写后3列） -->
      <view class="grid-cell">王五</view>
      <view class="grid-cell">30</view>
      <view class="grid-cell">测试</view>

      <!-- 第四行：演示跨列 (Colspan) -->
      <view class="grid-cell">4</view>
      <!-- 跨3列：占据第2-4列 -->
      <view class="grid-cell col-span-3 bg-gray">行政人事部 - 统一管理</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {};
  }
};
</script>

<style scoped>
.container {
  padding: 20rpx;
}

.table-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333;
}

/* 核心 Grid 布局 */
.grid-table {
  display: grid;
  /* 定义4列，每列等宽 */
  grid-template-columns: repeat(4, 1fr);
  /* 边框整体包裹 */
  border: 1px solid #ddd;
  background-color: #fff;
}

.grid-cell {
  /* 每个单元格都有边框，利用 gap 或 margin 模拟分割线，或者直接用 border */
  border-right: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  padding: 20rpx;
  text-align: center;
  font-size: 28rpx;
  box-sizing: border-box;
  /* 确保内容垂直居中 */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 去除每行最后一个单元格的右边框，避免双重边框 */
.grid-cell:nth-child(4n) {
  border-right: none;
}

/* 表头样式 */
.header {
  background-color: #f5f7fa;
  font-weight: bold;
  color: #2c3e50;
}

/* 跨行样式：占据2行 */
.row-span-2 {
  grid-row: span 2;
  background-color: #e3f2fd;
  color: #1565c0;
}

/* 跨列样式：占据3列 */
.col-span-3 {
  grid-column: span 3;
  background-color: #f5f5f5;
  color: #666;
}

.bg-blue {
  background-color: #e3f2fd;
}
.bg-gray {
  background-color: #f5f5f5;
}
</style>
