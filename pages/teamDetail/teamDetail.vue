<template>
  <view class="scheme-edit-page">
    <CustomHeader :ballTitle="''" title="详  情" :showBack="true" :showIcon="false" @back-click="handleBack" />

    <scroll-view class="match-scroll" scroll-y :style="{ top: headerTotalHeight + 'px' }">
      <!-- 球队名称 + 市值 -->
<view class="coach-card" style="text-align:center;">
  {{info.team_name}} 
  <text style="font-size:24rpx;">市值: {{info.team_value}}</text>
</view>

      <!-- 主教练信息（修复版） -->
      <view class="coach-card">
        <view class="coach-row coach-header">
          <text class="coach-label">主教练</text>
          <text class="coach-label">出生日期</text>
          <text class="coach-label">国籍</text>
          <text class="coach-label">习惯阵型</text>
          <text class="coach-label">薪资</text>
        </view>
        <view class="coach-row coach-content">
          <text class="coach-value">{{ info.jl_xm }}</text>
          <text class="coach-value">{{ info.jl_csrq }}</text>
          <text class="coach-value">{{ info.jl_jg }}</text>
          <text class="coach-value">{{ info.jl_xgzx }}</text>
          <text class="coach-value">{{ info.jl_value }}</text>
        </view>
      </view>

      <!-- 球员名单 -->
      <view class="player-list">
        <view class="player-header">
          <text class="header-item number">号码</text>
          <text class="header-item name">姓名</text>
          <text class="header-item birth">出生日期</text>
          <text class="header-item height">身高</text>
          <text class="header-item weight">体重</text>
        </view>

        <view 
          v-for="(player, index) in info.players" 
          :key="index" 
          class="player-row"
          :class="{ odd: index % 2 === 0 }"
        >
          <text class="player-item number">{{ player.hm }}</text>
          <view class="player-name-item name">
            <text class="player-name">{{ player.player_name }}</text>
          </view>
          <text class="player-item birth">{{ player.csrq }}</text>
          <text class="player-item height">{{ player.sg }}</text>
          <text class="player-item weight">{{ player.tz || '0' }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import CustomHeader from "@/components/CustomHeader.vue";
import { teamInfo } from "@/api/demo";
export default {
  components: { CustomHeader },
  data() {
    return {
      headerTotalHeight: 0,
      teamName: '',
      info: {}
    };
  },
  onLoad(options) {
    this.teamName = options.teamName;
    teamInfo({ teamName: options.teamName }).then((res) => {
      this.info = res.data.data;
    })
  },
  created() {
    this.calcAllHeights();
  },
  methods: {
    calcAllHeights() {
      const sys = wx.getWindowInfo();
      const statusBarHeight = sys.statusBarHeight || 20;
      const navBarFixedPx = (sys.screenWidth / 750) * 80;
      this.headerTotalHeight = statusBarHeight + navBarFixedPx;
    },
    handleBack() {
      uni.navigateBack({ delta: 1 });
    }
  }
};
</script>

<style scoped lang="scss">
.scheme-edit-page {
  background-color: #f5f5f5;
  height: 100vh;
}

.match-scroll {
  position: absolute;
  left: 0;
  right: 0;
  top: v-bind(headerTotalHeight + "px");
  bottom: 0;
  width: 100%;
  overflow-y: auto;
  padding:0 20rpx 20rpx;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    display: none;
  }
}

/* 主教练卡片 - 完全修复 */
.coach-card {
  background: #fff;
  border-radius: 8rpx;
  padding: 0;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 5rpx rgba(0,0,0,0.05);
  overflow: hidden;

  .coach-row {
    display: flex;
    align-items: center;
    padding: 20rpx 10rpx;
    box-sizing: border-box;
    
    &.coach-header {
      background: #f8f8f8;
      border-bottom: 1rpx solid #eee;
    }
    &.coach-content {
      background: #fff;
    }
  }
  .coach-label {
    flex: 1;
    text-align: center;
    font-size: 26rpx;
    color: #333;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 5rpx;
  }
  .coach-value {
    flex: 1;
    text-align: center;
    font-size: 26rpx;
    color: #666;
    padding: 0 5rpx;
  }
}

/* 球员列表 */
.player-list {
  background: #fff;
  border-radius: 8rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 5rpx rgba(0,0,0,0.05);

  .player-header {
    display: flex;
    background: #f8f8f8;
    padding: 20rpx 10rpx;
    border-bottom: 2rpx solid #eee;
    box-sizing: border-box;
    .header-item {
      text-align: center;
      font-size: 26rpx;
      color: #333;
      font-weight: 500;
      white-space: nowrap;
      
      &.number { width: 60rpx; flex: none; }
      &.height { width: 70rpx; flex: none; }
      &.weight { width: 70rpx; flex: none; }
      &.name { flex: 2; }
      &.birth { flex: 1.5; }
    }
  }

  .player-row {
    display: flex;
    align-items: center;
    padding: 20rpx 10rpx;
    border-bottom: 1rpx solid #f0f0f0;
    box-sizing: border-box;

    &.odd {
      background-color: #fafafa !important;
    }
    
    .player-item {
      text-align: center;
      font-size: 26rpx;
      color: #333;
      white-space: nowrap;
      
      &.number { width: 60rpx; flex: none; }
      &.height { width: 70rpx; flex: none; }
      &.weight { width: 70rpx; flex: none; }
    }

    .player-name-item {
      flex: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      .player-name {
        font-size: 26rpx;
        color: #333;
        white-space: nowrap;
      }
    }
    .birth {
      flex: 1.5;
      text-align: center;
      white-space: nowrap;
    }
  }
}
</style>