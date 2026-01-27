<template>
  <view class="word-ranking-container">
    <!-- 排名列表 -->
    <view class="ranking-table scorer-table">
      <view class="table-header">
        <text class="cell ranking-cell">排名</text>
        <text class="cell player-cell">名称</text>
        <text class="cell num-cell">积分</text>
      </view>
      
      <!-- 空数据 -->
      <view v-if="rankingList.length === 0" class="empty-tip">
        <text>暂无相关排名数据</text>
      </view>
      
      <!-- 列表项 -->
      <view v-for="(item, i) in rankingList" :key="i" class="table-row">
        <text class="cell ranking-cell">{{item.ranking_no}}</text>
        <text class="cell player-cell">{{item.team_name}}</text>
        <text class="cell num-cell">{{item.points}}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    // 接收父组件传递的排名数据
    rankingList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {};
  },
  watch: {
    rankingList: {
      immediate: true,
      handler(val) {}
    }
  },
  methods: {}
};
</script>

<style scoped lang="scss">
.word-ranking-container {
  width: 100%;
  padding:0rpx 20rpx 20rpx;
  box-sizing: border-box;
  
  .empty-tip {
    padding: 50rpx 0;
    text-align: center;
    font-size: 26rpx;
    color: #999;
  }
  
  .ranking-table {
    border: 1rpx solid #eee;
    .table-header {
      display: flex;
      background: #f5f7fa;
      padding: 12rpx 0;
      .cell {
        text-align: center; // 表头单元格强制居中
        font-size: 24rpx;
        border-left: 1rpx solid #eee;
        color: #666;
      }
    }
    .table-row {
      display: flex;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #eee;
      &:last-child {
        border-bottom: none;
      }
      .cell {
        text-align: center; // 列表单元格强制居中
        font-size: 26rpx;
      }
    }
    .table-row:nth-child(odd){
      background:#f5f7fa;
    }
  }
  
  .scorer-table {
    .table-header,
    .table-row {
      // 排名列宽度放宽一倍（60rpx → 120rpx）
      .ranking-cell {
        width: 120rpx; 
        flex: none; 
      }
      // 积分列宽度放宽一倍（60rpx → 120rpx）
      .num-cell {
        width: 120rpx; 
        flex: none; 
      }
      // 名称列占剩余宽度，居中显示（取消左内边距）
      .player-cell {
        flex: 1; 
        text-align: center; // 改为居中
        padding-left: 0; // 移除左内边距
        color: #007d70;
      }
    }
  }
}
</style>