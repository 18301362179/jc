<template>
  <view class="football-data-page">
    <!-- 顶部导航栏 -->
    <CustomHeader
      :showBack="true"
      :ballTitle="''"
      :title="'篮 数'"
      :isIndex="false"
      :showIcon="false"
      :isSelected="false"
    />
    
    <!-- 特别提醒 + 刷新按钮 -->
    <view class="tip-bar">

      <!-- 刷新按钮 -->
      <view class="refresh-btn" @click="handleRefresh">
        <text class="refresh-text">刷&nbsp;&nbsp;新</text>
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
          <image v-if="item.showImage == 1" class="gif-icon" src="/static/bg.gif"></image>
          <text class="status-text">{{ item.statusName }}</text>
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
  onLoad() {
    this.getBasketData();
  },
  methods: {
    // 请求篮球外部接口 + 前端复刻Java转换逻辑
    getBasketData() {
      uni.showLoading({ title: "加载中..." });
      // GET参数拼接url，修复小程序GET不识别data传参bug
      const baseUrl = 'https://webapi.sporttery.cn/gateway/uniform/bk/getMatchLiveV1.qry';
      const queryStr = 'eventTc=goals,penalty_shootout&method=live';
      const reqUrl = `${baseUrl}?${queryStr}`;

      uni.request({
        url: reqUrl,
        method: 'GET',
        header: {
          'Referer': 'https://webapi.sporttery.cn',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        success: (res) => {
          const resp = res.data;
          // 匹配接口返回格式：success 数组在value
          if (resp.success === true && Array.isArray(resp.value)) {
            const rawArr = resp.value;
            // 1:1复刻你给的篮球Java解析逻辑
            this.matchList = rawArr.map(item => {
              const map = {};
              // 联赛、主客队简称
              map.leagueName = item.leagueAbbName;
              map.homeName = item.homeTeamAbbName;
              map.awayName = item.awayTeamAbbName;

              // 时间 MM-DD HH:mm
              const datePart = item.matchDate.substring(5);
              const timePart = item.matchTime.substring(0, 5);
              map.raceDate = `${datePart} ${timePart}`;

              // 全场比分
              map.sectionsNo999 = item.sectionsNo999 || "";

              // 赛事编号拼接周几
              let numStr = String(item.matchNum);
              let weekTxt = "";
              const firstChar = numStr.charAt(0);
              if (firstChar === "1") weekTxt = "周一";
              else if (firstChar === "2") weekTxt = "周二";
              else if (firstChar === "3") weekTxt = "周三";
              else if (firstChar === "4") weekTxt = "周四";
              else if (firstChar === "5") weekTxt = "周五";
              else if (firstChar === "6") weekTxt = "周六";
              else if (firstChar === "7") weekTxt = "周日";
              map.matchNum = weekTxt + numStr.substring(1);

              // 状态 + 动图标识
              const status = item.matchStatusName;
              if (status === "赛前" || status === "未开播") {
                map.statusName = "未开始";
                map.showImage = 0;
              } else if (status === "比赛结束" || status === "直播结束" || status === "已完成") {
                map.statusName = "已结束";
                map.showImage = 0;
              } else {
                // 篮球进行中固定文字，不展示分钟
                map.statusName = "进行中";
                map.showImage = 1;
              }
              return map;
            })
          } else {
            this.matchList = [];
            uni.showToast({ title: "暂无篮球赛事", icon: "none" });
          }
        },
        fail: () => {
          this.matchList = [];
          uni.showToast({ title: "接口请求失败", icon: "none" });
        },
        complete: () => {
          uni.hideLoading();
        }
      })
    },

    // 刷新按钮
    handleRefresh() {
      this.matchList = [];
      this.getBasketData();
      uni.showToast({ title: "刷新成功", icon: "success", duration: 1500 });
    },

    formatStatus(status) {
      if (status === "比赛结束") return "已完成";
      return status;
    }
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
  // 弹性布局，让文字左对齐，按钮右对齐
  display: flex;
  justify-content: center;
  align-items: center;
  
  // 刷新按钮样式（绿色背景，和截图一致）
  .refresh-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #00b42a;
    color: #fff;
    padding: 8rpx 26rpx;
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
  height: calc(100vh - 140rpx);
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
  align-items: center;
    .gif-icon {
    width: 32rpx;
    height: 32rpx;
  }
  .status-text {
    font-size: 20rpx;
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