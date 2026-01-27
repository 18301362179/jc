<template>
  <view class="top-card">
    <view class="purchase-card">
      <view class="bet-header">
        <view class="bet-nums">
          <view class="num-item">
            <text class="num-label">投注注数</text>
            <text class="num-value">{{ info.multiple || 0 }}</text>
          </view>
          <view class="num-item">
            <text class="num-label">倍数</text>
            <text class="num-value">{{ info.bet || 0 }}</text>
          </view>
          <view class="num-item">
            <text class="num-label">总金额</text>
            <text class="num-value">{{ info.payment || 0 }}</text>
          </view>
        </view>
        <view class="status-tag" :class="[getStatusClass(info.status)]">
          {{ getStatusText(info.status) }}
        </view>
      </view>
      <view class="card-divider"></view>
      <view class="user-info-card">
        <view class="user-avatar">
          <text class="avatar-text">{{ getAvatarText(info.remarkName) }}</text>
        </view>
        <view class="user-detail">
          <text class="user-name">{{ info.remarkName || "匿名用户" }}</text>
          <text class="user-phone">{{ info.userPhone || "未填写" }}</text>
        </view>
      </view>
      <view class="bet-type-wrap">
        <text class="type-label">投注类型：</text>
        <text class="type-value">{{ info.entityType || defaultBetType }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "BetInfoCard",
  props: {
    // 核心数据（透传原页面的info对象）
    info: {
      type: Object,
      required: true,
      default: () => ({})
    },
    // 投注类型默认值（不同页面传不同默认值）
    defaultBetType: {
      type: String,
      default: "足彩胜平负"
    }
  },
  methods: {
    // 状态样式映射（通用逻辑）
    getStatusClass(status) {
      const classMap = { 0: "status-pending", 1: "status-success", 2: "status-failed" };
      return classMap[status] || "";
    },
    // 状态文字映射（通用逻辑）
    getStatusText(status) {
      const statusMap = { 0: "待打票", 1: "代购成功", 2: "已弃单" };
      return statusMap[status] || "未知状态";
    },
    // 头像文字处理（通用逻辑）
    getAvatarText(name) {
      if (!name || !name.trim()) return "用";
      const firstChar = name.trim().charAt(0);
      const reg = /^[\s\W_]+$/;
      return reg.test(firstChar) ? "用" : firstChar;
    }
  }
};
</script>

<style scoped lang="scss">
// 顶部卡片样式（完全复用原样式）
.top-card {
  .purchase-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);

    .bet-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      .bet-nums {
        display: flex;
        gap: 30rpx;

        .num-item {
          display: flex;
          flex-direction: column;
          align-items: center;

          .num-label {
            font-size: 24rpx;
            color: #999;
            margin-bottom: 4rpx;
          }
          .num-value {
            font-size: 32rpx;
            color: #333;
          }
        }
      }

      .status-tag {
        padding: 8rpx 20rpx;
        border-radius: 20rpx;
        font-size: 24rpx;
        font-weight: 500;
        &.status-pending { background: #fff8e1; color: #ff9800; }
        &.status-success { background: #e8f5e9; color: #4caf50; }
        &.status-failed { background: #ffebee; color: #f44336; }
      }
    }

    .card-divider {
      height: 1rpx;
      background: #f5f5f5;
      margin: 20rpx 0;
    }

    .user-info-card {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;

      .user-avatar {
        width: 60rpx;
        height: 60rpx;
        border-radius: 50%;
        background: #31926e;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20rpx;

        .avatar-text {
          font-size: 28rpx;
          font-weight: 600;
        }
      }

      .user-detail {
        .user-name {
          font-size: 30rpx;
          font-weight: 600;
          color: #333;
        }
        .user-phone {
          font-size: 24rpx;
          color: #999;
        }
      }
    }

    .bet-type-wrap {
      display: flex;
      align-items: center;
      .type-label {
        font-size: 26rpx;
        color: #666;
      }
      .type-value {
        font-size: 26rpx;
        color: #333;
        font-weight: 500;
        margin-left: 10rpx;
      }
    }
  }
}
</style>