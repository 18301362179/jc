<template>
  <view class="page">
    <!-- 普通表格 -->
    <view class="table-wrap">
      <view class="table-title">基础表格（带完整分割线）</view>
      <!-- 外层容器：整体四周边框 -->
      <view class="table-box">
        <view class="table-head">
          <view class="table-cell cell-border-right">序号</view>
          <view class="table-cell cell-border-right">姓名</view>
          <view class="table-cell cell-border-right">年龄</view>
          <view class="table-cell cell-border-none">职业</view>
        </view>
        <view class="table-body">
          <view class="table-row row-border-bottom">
            <view class="table-cell cell-border-right">1</view>
            <view class="table-cell cell-border-right">张三</view>
            <view class="table-cell cell-border-right">25</view>
            <view class="table-cell cell-border-none">前端</view>
          </view>
          <view class="table-row row-border-bottom">
            <view class="table-cell cell-border-right">2</view>
            <view class="table-cell cell-border-right">李四</view>
            <view class="table-cell cell-border-right">28</view>
            <view class="table-cell cell-border-none">后端</view>
          </view>
          <view class="table-row row-border-none">
            <view class="table-cell cell-border-right">3</view>
            <view class="table-cell cell-border-right">王五</view>
            <view class="table-cell cell-border-right">30</view>
            <view class="table-cell cell-border-none">测试</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 合并单元格表格 -->
    <view class="table-wrap" style="margin-top: 40rpx;">
      <view class="table-title">合并单元格表格</view>
      <view class="table-box">
        <view class="table-head">
          <view class="table-cell cell-border-right">分类</view>
          <view class="table-cell cell-border-right">姓名</view>
          <view class="table-cell cell-border-right">年龄</view>
          <view class="table-cell cell-border-none">职业</view>
        </view>
        <view class="table-body">
          <!-- 列合并（纵向合并2行） -->
          <view class="table-row row-border-bottom">
            <view class="table-cell cell-merge-col cell-border-right">技术岗</view>
            <view class="table-cell cell-border-right">张三</view>
            <view class="table-cell cell-border-right">25</view>
            <view class="table-cell cell-border-none">前端</view>
          </view>
          <view class="table-row row-border-bottom">
            <!-- 占位空单元格 -->
            <view class="table-cell cell-empty"></view>
            <view class="table-cell cell-border-right">李四</view>
            <view class="table-cell cell-border-right">28</view>
            <view class="table-cell cell-border-none">后端</view>
          </view>
          <!-- 行合并（横向整行合并） -->
          <view class="table-row row-border-bottom">
            <view class="table-cell cell-merge-row">行政人员（整行合并）</view>
          </view>
          <view class="table-row row-border-none">
            <view class="table-cell cell-border-right">行政岗</view>
            <view class="table-cell cell-border-right">赵六</view>
            <view class="table-cell cell-border-right">26</view>
            <view class="table-cell cell-border-none">人事</view>
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

/* ========== 1. 表格外层：整体四边完整边框 ========== */
.table-box {
  border: 1rpx solid #ccc;
}

/* ========== 2. 基础布局 ========== */
.table-head,
.table-row {
  display: flex;
}
.table-cell {
  flex: 1;
  padding: 24rpx 10rpx;
  text-align: center;
  font-size: 26rpx;
  color: #333;
}
.table-head .table-cell {
  font-size: 28rpx;
}

/* ========== 3. 单独类控制【单元格竖线】 ========== */
// 右侧竖线
.cell-border-right {
  border-right: 1rpx solid #ccc;
}
// 无右侧竖线（最后一列专用）
.cell-border-none {
  border-right: none;
}

/* ========== 4. 单独类控制【行横线】 ========== */
// 底部横线
.row-border-bottom {
  border-bottom: 1rpx solid #ccc;
}
// 无底部横线（最后一行专用）
.row-border-none {
  border-bottom: none;
}

/* ========== 5. 列合并（纵向合并单元格） ========== */
.cell-merge-col {
  display: flex;
  align-items: center;
  justify-content: center;
  /* 跨两行高度 */
  height: calc(24rpx * 2 * 2);
  /* 清除自身下横线，避免和行边框叠加 */
  border-bottom: none;
}

/* ========== 6. 占位空单元格（被合并遮挡） ========== */
.cell-empty {
  border: none !important;
  padding: 0 !important;
  color: transparent !important;
  background: transparent;
}

/* ========== 7. 行合并（横向整行合并单元格） ========== */
.cell-merge-row {
  flex: 4 !important;
  border-right: none;
}
</style>