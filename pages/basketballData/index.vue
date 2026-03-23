<template>
  <view class="football-data-page">
    <!-- 顶部导航栏 -->
    <CustomHeader
      :showBack="true"
      :ballTitle="''"
      :title="'篮球数据'"
      :isIndex="false"
      :showIcon="false"
      :isSelected="false"
    />
    
    <!-- 特别提醒 + 刷新按钮 -->
    <view class="tip-bar">
      <text class="tip-text">特别提醒：本页面部分数据来源于第三方，仅供参考。</text>
      <!-- 刷新按钮 -->
      <view class="refresh-btn" @click="handleRefresh">
        <text class="refresh-icon">🔄</text>
        <text class="refresh-text">刷新</text>
      </view>
    </view>
    
    <scroll-view class="list-scroll" scroll-y>
      <view class="match-item" v-for="(item, index) in matchList" :key="index">
        <view class="match-left">
          <view class="league-tag">
            <text class="league-text">{{ item.leagueName }}</text>
          </view>
          <text class="time-text">{{ item.raceDate }}</text>
        </view>
        
        <view class="match-center">
          <text class="match-num">{{ item.matchNum }}</text>
          <view class="score-row">
            <text class="team-name home">{{ item.homeName }}</text>
            <text class="score">{{ item.sectionsNo999 }}</text>
            <text class="team-name away">{{ item.awayName }}</text>
          </view>
        </view>
        
        <view class="match-right">
          <text class="status-text">{{ formatStatus(item.statusName) }}</text>
        </view>
      </view>
      
      <view class="empty-state" v-if="matchList.length === 0">
        <text class="empty-text">暂无数据</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import CustomHeader from "@/components/CustomHeader.vue";
// 引入你封装好的接口方法
import {basketLotteryLive} from '@/api/demo'
export default {
  components: {
    CustomHeader
  },
  data() {
    return {
      matchList: [],
      dateTitle: ""
    };
  },
  created() {
    this.getMatchData();
  },
  methods: {
    // 获取比赛数据
    async getMatchData() {
      uni.showLoading({ title: "加载中..." });
      try {
        const res = await basketLotteryLive();
        if (res.code == "200" && res.flag) {
          this.matchList = res.data || [];
        } else {
          uni.showToast({ title: res.msg || "加载失败", icon: "none" });
        }
      } catch (err) {
        uni.showToast({ title: "网络异常", icon: "none" });
      } finally {
        uni.hideLoading();
      }
    },
    
    // 刷新按钮点击事件
    handleRefresh() {
      // 清空旧数据（可选，提升体验）
      this.matchList = [];
      // 重新请求数据
      this.getMatchData();
      // 刷新成功提示
      uni.showToast({ title: "刷新成功", icon: "success", duration: 1500 });
    },
    
    // 格式化状态（"比赛结束" → "已完成"）
    formatStatus(status) {
      if (status === "比赛结束") return "已完成";
      return status;
    },
  }
};
</script>

<style scoped lang="scss">
.football-data-page {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f7fa;
}

// 特别提醒栏 + 刷新按钮布局
.tip-bar {
  background-color: #fff9e8;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #ffe8b3;
  // 弹性布局，让文字左对齐，按钮右对齐
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .tip-text {
    font-size: 24rpx;
    color: #cc8800;
    line-height: 1.4;
  }
  
  // 刷新按钮样式（绿色背景，和截图一致）
  .refresh-btn {
    display: flex;
    align-items: center;
    background-color: #00b42a;
    color: #fff;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
    cursor: pointer;
    
    .refresh-icon {
      font-size: 24rpx;
      margin-right: 8rpx;
    }
    
    .refresh-text {
      font-size: 24rpx;
      font-weight: 500;
    }
    
    // 点击态（可选，提升体验）
    &:active {
      background-color: #009924;
    }
  }
}

// 恢复 tip-bar 对应的高度（calc(100vh - 200rpx)），适配有 tip-bar 的布局
.list-scroll {
  flex: 1;
  height: calc(100vh - 200rpx);
}

.match-item {
  display: flex;
  align-items: center;
  padding: 0rpx 20rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

// 1. 左侧联赛+时间区域高度缩小（仅改这里，保留你的基础样式）
.match-left {
  width: 150rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10rpx 0; // 缩小上下内边距，压缩高度
  
  .league-tag {
    padding: 4rpx 12rpx; // 缩小标签内边距
    border-radius: 8rpx;
    margin-bottom: 8rpx; // 缩小与时间的间距
    
    .league-text {
      font-size: 24rpx;
      color: #999;
      font-weight: 500;
    }
  }
  
  .time-text {
    font-size: 22rpx; // 时间字体缩小
    color: #999;
    line-height: 1.3; // 缩小行高，进一步压缩高度
    text-align: center;
    white-space: pre-line;
  }
}

// 2. 中间区域：球队名+比分缩小 + 球队名居中（核心修改）
.match-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 130rpx; 
  
  .match-num {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 12rpx;
  }
  
  .score-row {
    display: flex;
    align-items: center; 
    justify-content: center; // 球队名称左右居中
    margin-bottom: 8rpx;
    width: 100%; // 占满中间区域，保证居中
    
    .team-name {
      font-size: 28rpx; // 球队名从32rpx缩小到28rpx
      color: #333;
      max-width: 200rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1.2;
      text-align: center; // 队名自身居中
      flex: 1; // 均分左右空间，对称居中
    }
    
    .score {
      font-size: 40rpx; // 比分从48rpx缩小到40rpx
      color: #333;
      font-weight: 400;
      margin: 0 16rpx; // 缩小比分与队名的间距
      line-height: 1; // 冒号垂直居中
    }
  }
}

.match-right {
  width: 120rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .status-text {
    font-size: 26rpx;
    color: #cc3333;
  }
}

.empty-state {
  padding: 100rpx 0;
  text-align: center;
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>