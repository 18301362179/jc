<template>
  <view class="football-data-page">
    <!-- 顶部导航栏 -->
    <CustomHeader
      :showBack="true"
      :ballTitle="''"
      :title="'KeepSeek'"
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
    
<scroll-view class="list-scroll" scroll-y >
  <view class="match-item" v-for="(item, index) in matchList" :key="index">
    <view class="match-left">
      <view class="league-tag">
        <text class="league-text" >{{ item.leagueAbbName }}</text>
      </view>
      <text class="time-text" >{{ formatTime(item.matchDate + ' ' + item.matchTime) }}</text>
    </view>

    <view class="match-center">
      <text class="match-num" >{{ item.matchNum }}</text>
      <view class="score-row">
        <text class="team-name home" >{{ item.homeTeamAbbName }}</text>
        <text class="score" >{{ item.sectionsNo999 }}</text>
        <text class="team-name away" >{{ item.awayTeamAbbName }}</text>
      </view>
    </view>

    <view class="match-right" >
      <view class="status-wrapper">
        <image v-if="liveEventMap[item.matchNum] && liveEventMap[item.matchNum].length > 0 && urlValue" class="gif-icon" src="https://www.tianjifu.com/static/bg.gif"></image>
        <text class="status-text" v-if="urlValue">{{ item.matchStatusName}}</text>
      </view>
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
      dateTitle: "",
      urlValue: false,
      liveEventMap: {}, // 新增
    };
  },
  created() {
    this.getMatchData();
    this.urlValue = uni.getStorageSync('urlValue');
  },
  methods: {
    // 获取比赛数据
    async getMatchData() {
      uni.showLoading({ title: "加载中..." });
      try {
        // 请求进球/点球大战实时事件接口
        await this.getBasketballLiveEvent();
      } catch (err) {
        uni.showToast({ title: "网络异常", icon: "none" });
      } finally {
        uni.hideLoading();
      }
    },
    /**
    * 篮球实时事件接口 bk/getMatchLiveV1.qry
    */
async getBasketballLiveEvent() {
  try {
    const liveRes = await uni.request({
      url: "https://webapi.sporttery.cn/gateway/uniform/bk/getMatchLiveV1.qry",
      method: "GET",
      data: {
        // 篮球先清空eventTc，不要足球的goals,penalty_shootout，后续确认篮球事件编码再回填
        // eventTc: "",
        method: "live"
      },
      header: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.sporttery.cn/"
      }
    });
    // uni.request [err, response]
    const response = liveRes[1];
    const resJson = response.data;
    console.log(resJson, 'bk接口返回--------------------------');
    const data = resJson.value;
    this.matchList = data;
  } catch (err) {
    console.error("【bk/getMatchLiveV1.qry】请求异常：", err);
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
    // 新增时间格式化方法，和足球保持一致
    formatTime(timeStr) {
      if (!timeStr) return "";
      const date = new Date(timeStr);
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${month}-${day}\n${hours}:${minutes}`;
    },
  }
};
</script>


<style scoped lang="scss">
.football-data-page {
  width: 100%;
  height: 100vh; // 页面撑满屏幕，避免嵌套滚动
  background-color: #f5f7fa;
  display: flex; // 弹性布局，让 scroll-view 自适应高度
  flex-direction: column;
  overflow: hidden; // 隐藏页面级滚动
}

// 特别提醒栏 + 刷新按钮布局
.tip-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0; // 固定高度，不被压缩
  
  .tip-text {
    font-size: 24rpx;
    color: #cc8800;
    line-height: 1.4;
  }
  
  .refresh-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #00b42a;
    color: #fff;
    padding: 8rpx 26rpx;
    border-radius: 8rpx;
    cursor: pointer;
    

    
    .refresh-text {
      font-size: 24rpx;
      font-weight: 500;
    }
    
    &:active {
      background-color: #009924;
    }
  }
}

// 关键修复：scroll-view 自适应高度 + 隐藏滚动条
.list-scroll {
  flex: 1; // 自动占满剩余高度（替代固定 calc 计算）
  width: 100%;
  overflow: hidden; // 隐藏外层滚动
  /* 核心：隐藏小程序滚动条 */
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; // 标准写法
  -ms-overflow-style: none; // IE写法
  
  // 微信小程序专属：隐藏滚动条
  &::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }
}

// 以下样式不变，保留你的原有设置
.match-item {
  display: flex;
  align-items: center;
  padding: 0rpx 20rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.match-left {
  width: 150rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10rpx 0;
  
  .league-tag {
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
    margin-bottom: 8rpx;
    
    .league-text {
      font-size: 24rpx;
      color: #999;
      font-weight: 500;
    }
  }
  
  .time-text {
    font-size: 22rpx;
    color: #999;
    line-height: 1.3;
    text-align: center;
    white-space: pre-line;
  }
}

.match-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 160rpx; 
  
  .match-num {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 12rpx;
  }
  
  .score-row {
    display: flex;
    align-items: center; 
    justify-content: center;
    margin-bottom: 8rpx;
    width: 100%;
    
    .team-name {
      font-size: 28rpx;
      color: #333;
      max-width: 200rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1.2;
      text-align: center;
      flex: 1;
    }
    
    .score {
      font-size: 40rpx;
      color: #333;
      font-weight: 400;
      margin: 0 16rpx;
      line-height: 1;
    }
  }
  
  .half-score {
    font-size: 24rpx;
    color: #999;
  }
}

.match-right {
  width: 120rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .status-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
  }
  
  .status-text {
    font-size: 20rpx;
    color: #cc3333;
  }
  
  .gif-icon {
    width: 32rpx;
    height: 32rpx;
  }

  .analyze-btn {
    .analyze-icon {
      font-size: 32rpx;
    }
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