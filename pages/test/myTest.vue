<template>
  <view class="page">
    <!-- 普通表格（带完整分割线） -->
    <view class="table-wrap">
      <view class="table-title">基础表格（带完整分割线）</view>
      <!-- 表格主体容器，负责整体外边框 -->
      <view class="table-container">
        <view class="table-head">
          <view class="table-cell">序号</view>
          <view class="table-cell">姓名</view>
          <view class="table-cell">年龄</view>
          <view class="table-cell">职业</view>
        </view>
        <view class="table-body">
          <view class="table-row">
            <view class="table-cell">1</view>
            <view class="table-cell">张三</view>
            <view class="table-cell">25</view>
            <view class="table-cell">前端</view>
          </view>
          <view class="table-row">
            <view class="table-cell">2</view>
            <view class="table-cell">李四</view>
            <view class="table-cell">28</view>
            <view class="table-cell">后端</view>
          </view>
          <view class="table-row">
            <view class="table-cell">3</view>
            <view class="table-cell">王五</view>
            <view class="table-cell">30</view>
            <view class="table-cell">测试</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 合并单元格表格 -->
    <view class="table-wrap" style="margin-top: 40rpx;">
      <view class="table-title">合并单元格表格</view>
      <view class="table-container">
        <view class="table-head">
          <view class="table-cell">分类</view>
          <view class="table-cell">姓名</view>
          <view class="table-cell">年龄</view>
          <view class="table-cell">职业</view>
        </view>
        <view class="table-body">
          <!-- 纵向合并单元格：第一列合并2行 -->
          <view class="table-row">
            <view class="table-cell cell-merge-vertical">技术岗</view>
            <view class="table-cell">张三</view>
            <view class="table-cell">25</view>
            <view class="table-cell">前端</view>
          </view>
          <view class="table-row">
            <!-- 空单元格，被上方合并遮挡 -->
            <view class="table-cell" colspan="2">李四</view>
            <view class="table-cell">28</view>
            <view class="table-cell">后端</view>
          </view>
          <!-- 横向合并单元格：整行合并 -->
          <view class="table-row">
            <view class="table-cell cell-merge-horizontal" colspan="4">行政人员（整行合并）</view>
          </view>
          <view class="table-row">
            <view class="table-cell">行政岗</view>
            <view class="table-cell">赵六</view>
            <view class="table-cell">26</view>
            <view class="table-cell">人事</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
.page {
  padding: 20rpx;
  background: #f5f5f5;
  min-height: 100vh;
}

.table-wrap {
  background: #fff;
  border-radius: 8rpx;
  overflow: hidden;
}

.table-title {
  padding: 20rpx;
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

/* 核心：表格外层容器，实现整体四条外边框 */
.table-container {
  border: 1rpx solid #ccc;
}

/* 表头布局 */
.table-head {
  display: flex;
  .table-cell {
    flex: 1;
    padding: 24rpx 10rpx;
    text-align: center;
    font-size: 28rpx;
    /* 单元格右侧分割竖线 */
    border-right: 1rpx solid #ccc;
  }
  /* 最后一列清除右侧边框，避免和外框叠加 */
  .table-cell:last-child {
    border-right: none;
  }
}

/* 表格主体 */
.table-body {
  .table-row {
    display: flex;
    /* 行底部分割横线 */
    border-bottom: 1rpx solid #ccc;

    .table-cell {
      flex: 1;
      padding: 24rpx 10rpx;
      text-align: center;
      font-size: 26rpx;
      color: #333;
      /* 单元格右侧分割竖线 */
      border-right: 1rpx solid #ccc;
    }
    /* 每行最后一列清除右侧边框 */
    .table-cell:last-child {
      border-right: none;
    }
  }
  /* 最后一行清除底部横线，避免和外框叠加 */
  .table-row:last-child {
    border-bottom: none;
  }
}

/* 纵向合并单元格：跨两行 */
.cell-merge-vertical {
  display: flex;
  align-items: center;
  justify-content: center;
  /* 高度自适应两行内容 */
  height: calc(24rpx * 2 + 1rpx);
  /* 取消自身下边框，由行边框统一控制 */
  border-bottom: none;
}

/* 被合并的空占位单元格：清空所有样式与边框 */
.cell-empty {
  border: none !important;
  padding: 0 !important;
  color: transparent !important;
  background: transparent !important;
}

/* 横向合并单元格：跨四列 */
.cell-merge-horizontal {
  flex: 4 !important;
  border-right: none !important;
}
</style>