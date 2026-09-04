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
    
<scroll-view class="list-scroll" scroll-y>
  <view class="match-item" v-for="(item, index) in matchList" :key="index">
    <view class="match-left">
      <view class="league-tag">
        <text class="league-text">{{ item.leagueAbbName }}</text>
      </view>
      <text class="time-text">{{ formatTime(item.matchDate + ' ' + item.matchTime) }}</text>
    </view>

    <view class="match-center">
      <text class="match-num">{{ item.matchNum }}</text>
      <view class="score-row">
        <text class="team-name home">{{ item.homeTeamAbbName }}</text>
        <text class="score">{{ item.sectionsNo999 }}</text>
        <text class="team-name away">{{ item.awayTeamAbbName }}</text>
      </view>
      <text class="half-score">半&nbsp;场 {{ item.sectionsNo1 }}</text>
    </view>

    <view class="match-right" v-if="urlValue">
      <view class="status-wrapper">
        <!-- 动图：这里用liveEventMap判断是否有实时事件，有则显示gif -->
        <image v-if="liveEventMap[item.matchNum] && liveEventMap[item.matchNum].length > 0 && urlValue" class="gif-icon" src="https://www.tianjifu.com/static/fg.gif"></image>
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
import {footLotteryLive} from '@/api/demo'
export default {
  components: {
    CustomHeader
  },
  data() {
    return {
      matchList: [],
      dateTitle: "",
      urlValue:false,
      // 新增：实时事件接口返回数据
      liveEventMap: {},
    };
  },
  created() {
    this.getMatchData();
    this.urlValue = uni.getStorageSync('urlValue');
  },
  methods: {
    async getMatchData() {
      uni.showLoading({ title: "加载中..." });
      try {
        const res = await footLotteryLive();
        if (res.data && res.data.length > 0) {
          this.matchList = res.data || [];
        } else {
           await this.getMatchLiveEvent();
        }     
      } catch (err) {
        uni.showToast({ title: "网络异常", icon: "none" });
      } finally {
        uni.hideLoading();
      }
    },

    /**
     * 请求实时进球、点球大战事件接口
     * 接口地址：https://webapi.sporttery.cn/gateway/uniform/fb/getMatchLiveV1.qry?eventTc=goals,penalty_shootout&method=live
     */
    /**
     * 请求实时进球、点球大战事件接口
     * 接口地址：https://webapi.sporttery.cn/gateway/uniform/fb/getMatchLiveV1.qry?eventTc=goals,penalty_shootout&method=live
     */
async getMatchLiveEvent() {
  try {
    const liveRes = await uni.request({
      url: "https://webapi.sporttery.cn/gateway/uniform/fb/getMatchLiveV1.qry",
      method: "GET",
      data: {
        eventTc: "goals,penalty_shootout",
        method: "live"
      },
      header: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.sporttery.cn/"
      }
    });
    // 重点：uni.request返回 [null, response]，取第二个元素
    const response = liveRes[1];
    const resJson = response.data;
    console.log(resJson, 'josn--------------------------')
    const data = resJson.value;
    this.matchList = data;
  } catch (error) {
    console.log("【getMatchLiveV1.qry】接口请求异常", error);
  }
},
    handleRefresh() {
      this.matchList = [];
      this.getMatchData();
      uni.showToast({ title: "刷新成功", icon: "success", duration: 1500 });
    },
    
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
  height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tip-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
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

.list-scroll {
  flex: 1;
  width: 100%;
  overflow: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }
}

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
  
  /* 动图样式 */
  .gif-icon {
    width: 32rpx;
    height: 32rpx;
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