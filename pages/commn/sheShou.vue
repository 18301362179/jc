<template>
  <!-- 核心修复1：添加外层父类 .sheshou，让scoped样式生效 -->
  <view class="sheshou">
    <view class="table-container">
      <view class="table-header">
        <view class="header-border"></view>
        <!-- 核心修复2：替换行内width为flex分配，和积分列表保持一致 -->
        <view class="header-item rank">排名</view>
        <view class="header-item player">球员</view>
        <view class="header-item team">球队</view>
        <view class="header-item num">总</view>
        <view class="header-item num">点</view>
      </view>
      <view class="table-body">
        <view class="table-row" v-for="(item, index) in sheshouList" :key="index">
          <view class="row-border first-rank"></view>
          <view class="body-item rank">{{ item.ranking_no }}</view>
          <view class="body-item player team-name">{{ item.player_name }}</view>
          <view class="body-item team">{{ item.team_name }}</view>
          <view class="body-item num">{{ item.total_goal }}</view>
          <view class="body-item num">{{ item.penalty_kick_goal }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      sheshouList: [
        // 测试数据，方便调试
        { ranking_no: 1, player_name: "张三", team_name: "球队A", total_goal: 10, penalty_kick_goal: 2 },
        { ranking_no: 2, player_name: "李四", team_name: "球队B", total_goal: 8, penalty_kick_goal: 1 }
      ]
    };
  },
  methods: {
    open(r) {
      this.sheshouList = r;
    }
  }
};
</script>

<style scoped lang="scss">
// 核心修复3：补全盒模型、宽度、flex布局，和积分列表对齐
.sheshou {
  box-sizing: border-box;
  padding: 0rpx 16rpx 16rpx 16rpx; // 和积分列表保持一致的内边距
  width: 100%; // 占满父容器

  .table-container {
    background-color: #fff;
    border-radius: 12rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
    width: 100%; // 核心：固定容器宽度，避免自适应错乱
    box-sizing: border-box;
  }

  .table-header {
    display: flex;
    width: 100%; // 补全宽度
    padding: 10rpx 0;
    position: relative;
    box-sizing: border-box;

    .header-item {
      text-align: center;
      font-size: 28rpx;
      font-weight: bold;
      box-sizing: border-box;
    }

    // 核心修复4：用flex分配列宽（和行内width百分比一致，更稳定）
    .rank { flex: 0 0 10%; }
    .player { flex: 0 0 43%; }
    .team { flex: 0 0 27%; }
    .num { flex: 0 0 10%; }
  }

  .header-border {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6rpx;
    background-color: #fff;
  }

  .table-body {
    background-color: #fff;
    width: 100%; // 补全宽度
  }

  .table-row {
    display: flex;
    width: 100%; // 补全宽度
    padding: 16rpx 0;
    border-bottom: 1rpx solid #eee;
    position: relative;
    box-sizing: border-box;

    &:last-child {
      border-bottom: none;
    }

    .body-item {
      text-align: center;
      font-size: 26rpx;
      color: #666;
      box-sizing: border-box;
      // 核心修复5：替换margin-top:auto为flex垂直居中，和积分列表一致
      display: flex;
      align-items: center;
      justify-content: center;
    }

    // 列宽和表头严格对齐
    .rank { flex: 0 0 10%; }
    .player { flex: 0 0 43%; }
    .team { flex: 0 0 27%; }
    .num { flex: 0 0 10%; }
  }

  .row-border {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6rpx;
  }

  .team-name {
    color: #007d70!important;
  }

  // 奇偶行背景色，和积分列表一致
  .table-row:nth-child(odd) {
    background-color: #fafafa;
  }
}
</style>