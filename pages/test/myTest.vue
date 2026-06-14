<template>
  <view class="page">
    <view class="base-table">
      <view class="table-thead">
        <view class="table-tr">
          <view class="table-th">序号</view>
          <view class="table-th">姓名</view>
          <view class="table-th">年龄</view>
          <view class="table-th">职业</view>
        </view>
      </view>
      <view class="table-tbody">
        <view class="table-tr">
          <view class="table-td">1</view>
          <view class="table-td">张三</view>
          <view class="table-td">25</view>
          <view class="table-td">前端</view>
        </view>
        <view class="table-tr">
          <view class="table-td">2</view>
          <view class="table-td">李四</view>
          <view class="table-td">28</view>
          <view class="table-td">后端</view>
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

.base-table {
  display: table;
  width: 100%;
  //border-collapse: collapse;
  background: #fff;
  border-radius: 8rpx;
  overflow: hidden;

  .table-thead {
    display: table-header-group;
    background: #2979ff;
    color: #fff;

    .table-tr {
      display: table-row;

      .table-th {
        display: table-cell;
        padding: 24rpx 16rpx;
        text-align: center;
        font-size: 28rpx;
        border-bottom: 2rpx solid #e0e0e0;
      }
    }
  }

  .table-tbody {
    display: table-row-group;

    .table-tr {
      display: table-row;

      &:nth-child(even) {
        background: #f9f9f9;
      }

      .table-td {
        display: table-cell;
        padding: 24rpx 16rpx;
        text-align: center;
        font-size: 26rpx;
        color: #333;
        border-bottom: 1rpx solid #f0f0f0;
      }
    }
  }
}
</style>