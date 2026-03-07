<template>
  <!-- 外层容器添加类名，确保样式作用域正确 -->
  <view class="jifen">
    <view class="table-container">
      <view class="table-header">
        <view class="header-border"></view>
        <!-- 统一使用 flex 分配宽度，避免 inline 样式冲突 -->
        <view class="header-item rank">排名</view>
        <view class="header-item team">球队</view>
        <view class="header-item num">场次</view>
        <view class="header-item num">胜</view>
        <view class="header-item num">平</view>
        <view class="header-item num">负</view>
        <view class="header-item num">积分</view>
      </view>
      <view class="table-body">
        <view class="table-row" v-for="(team, index) in jifenList" :key="index">
          <!-- 修复定位边框冲突，区分排名样式 -->
          <view class="row-border first-rank"></view>
          <view class="body-item rank">{{ team.ranking_no }}</view>
          <view class="body-item team team-name">{{ team.team_name }}</view>
          <view class="body-item num">{{ team.matches_number }}</view>
          <view class="body-item num">{{ team.vin_number }}</view>
          <view class="body-item num">{{ team.equality_number }}</view>
          <view class="body-item num">{{ team.fail_number }}</view>
          <view class="body-item num">{{ team.points }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      jifenList: []
    };
  },
  methods: {
    open(r) {
      this.jifenList = r;
    }
  }
};
</script>

<style scoped lang="scss">
.jifen {
  width: 100%; // 确保占满父容器

  .table-container {
    background-color: #fff;
    border-radius: 12rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
    width: 100%; // 固定容器宽度
  }

  // 表头 Flex 布局：均匀分配宽度
  .table-header {
    display: flex;
    width: 100%;
    padding: 10rpx 0;
    position: relative;
    box-sizing: border-box;

    .header-item {
      text-align: center;
      font-size: 28rpx;
      font-weight: bold;
      box-sizing: border-box;
    }

    // 宽度分配：排名15%、球队25%、其余6个12%（15+25+12*5=100）
    .rank { flex: 0 0 15%; }
    .team { flex: 0 0 25%; }
    .num { flex: 0 0 12%; }
  }

  .header-border {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6rpx;
  }

  // 表体 Flex 布局，与表头对齐
  .table-body {
    background-color: #fff;
    width: 100%;
  }

  .table-row {
    display: flex;
    width: 100%;
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
      // 垂直居中（替代 margin-top: auto）
      display: flex;
      align-items: center;
      justify-content: center;
    }

    // 与表头宽度保持一致
    .rank { flex: 0 0 15%; }
    .team { flex: 0 0 25%; }
    .num { flex: 0 0 12%; }
  }

  // 行边框：修复定位冲突
  .row-border {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6rpx;
    background-color: transparent; // 默认透明
  }

  .team-name {
    color: #007d70!important;
  }

  // 奇偶行背景色优化
  .table-row:nth-child(odd) {
    background-color: #fafafa;
  }
}
</style>