<template>
  <view class="page-container">
    <!-- 固定头部 -->
    <CustomHeader
      :title="'析'"
      :showBack="true"
      :isIndex="false"
      :showIcon="false"
      :isSelected="false"
      :selectedPlay="''"
      @funnel-click="handleFunnel"
      @back-click="onBackClick"
    />
    
    <!-- 可滚动的内容区域 -->
    <scroll-view class="content-scroll" scroll-y="true">
      <view class="match-info-container" v-if="info">
        <!-- 赛事头部 -->
        <view class="match-header">
          <view class="match-title">
            <view v-if="courseMap.league_name">{{courseMap.league_name}}{{courseMap.stage || '常规赛'}}</view>
            <view class="match-time"> {{formatDateWithWeekday(courseMap.race_date)}}</view>
          </view>

          <!-- 客队前置：森林狼(客) VS 掘金(主) -->
          <view class="match-teams">
            <text class="away-team" style="text-align: right;">{{courseMap.visiting_name}}(客)</text>
            <text class="vs-text">VS</text>
            <text class="home-team" style="text-align: left;">{{courseMap.home_name}}(主)</text>
          </view>
          <view class="prediction-section">
            <view class="win-probability">
              <text class="pro-text"></text>
              <view class="probability-bars">

                <view class="probability-bar away-bar" :style="{ width: `${winRateAndGoalCalculate.visitingWinRate * 100}%` }">
                  <text class="bi">{{decimalToPercentage(winRateAndGoalCalculate.visitingWinRate,0)}}</text>
                </view>
                <view class="probability-bar home-bar" :style="{ width: `${winRateAndGoalCalculate.homeWinRate * 100}%` }">
                  <text class="bi">{{decimalToPercentage(winRateAndGoalCalculate.homeWinRate,0)}}</text>
                </view>
              </view>
            </view>
            <view class="win-prompt">
              {{courseMap.visiting_goal_calculate}} : {{courseMap.home_goal_calculate}}
            </view>
          </view>
        </view>

        <!-- 球队信息表格（7列：球队/排名/胜/得分/篮板/助攻/抢断，客队前置） -->
        <view class="ranking-section" v-if="homeTeam && visitingTeam && urlValue">
          <view class="section-title">
            <text>胜</text>
          </view>
          <view class="ranking-table team-data-table">
            <view class="table-header">
              <text class="cell">球队</text>
              <text class="cell">胜</text>
              <text class="cell">场均得分</text>
              <text class="cell">场均失分</text>
            </view>
            <!-- 客队行（前置） -->
            <view class="table-row">
              <text class="cell team-cell">{{visitingTeam.teamName}}</text>
              <text class="cell">{{decimalToPercentage(visitingTeam.winRate, 1)}}</text>
              <text class="cell">{{visitingTeam.avgGoal || '-'}}</text>
              <text class="cell">{{visitingTeam.avgFumbleGoal || '-'}}</text>
            </view>
            <!-- 主队行 -->
            <view class="table-row">
              <text class="cell team-cell">{{homeTeam.teamName}}</text>
              <text class="cell">{{decimalToPercentage(homeTeam.winRate, 1)}}</text>
              <text class="cell">{{homeTeam.avgGoal || '-'}}</text>
              <text class="cell">{{homeTeam.avgFumbleGoal || '-'}}</text>
            </view>
          </view>
        </view>

        <!-- 对战记录（客队前置，保留你修改的score-colon样式） -->
        <view class="history-section" v-if="info.home_headToHeadRemark&&info.headToHeadRecord.length>0">
          <view class="section-title">
            <text>对战记录</text>
            <text style="margin-left: 20rpx;">{{info.home_headToHeadRemark}}</text>
          </view>
          <view class="history-item" v-for="(item,i) in info.headToHeadRecord" :key="i">
            <view class="history-header">
              <text class="competition">{{courseMap.league_name}}{{item.stage}}</text>
              <text class="time">{{item.race_date}}</text>
            </view>
            <view class="match-result">
              <!-- 客队前置 -->
              <text class="team away-team">{{item.visiting_name}}</text>
              <text class="score-colon">{{item.visiting_goal}} : {{item.home_goal}}</text>
              <text class="team home-team">{{item.home_name}}</text>
            </view>
          </view>
        </view>

        <!-- 客队近期战绩（前置） -->
        <view class="history-section" v-if="info.visitingLastCourses&&info.visitingLastCourses.length>0">
          <view class="section-title">
            <text>{{info.visiting_lastRemark}}</text>
          </view>
          <view class="history-item" v-for="(item,i) in info.visitingLastCourses" :key="i">
            <view class="history-header">
              <text class="competition">
                {{ [item.league_name, item.stage].filter(Boolean).join('') }}
              </text>
              <text class="time">{{item.race_date}}</text>
            </view>
            <view class="match-result">
              <!-- 客队前置（森林狼作为客队） -->
              <text class="team away-team">{{item.visiting_name}}</text>
              <text class="score-colon">{{item.visiting_goal}} : {{item.home_goal}}</text>
              <text class="team home-team">{{item.home_name}}</text>
            </view>
          </view>
        </view>

        <!-- 主队近期战绩 -->
        <view class="history-section" v-if="info.homeLastCourses&&info.homeLastCourses.length>0">
          <view class="section-title">
            <text>{{info.home_lastRemark}}</text>
          </view>
          <view class="history-item" v-for="(item,i) in info.homeLastCourses" :key="i">
            <view class="history-header">
              <text class="competition">
                {{ [item.league_name, item.stage].filter(Boolean).join('') }}
              </text>
              <text class="time">{{item.race_date}}</text>
            </view>
            <view class="match-result">
              <!-- 客队前置（掘金作为客队时） -->
              <text class="team away-team">{{item.visiting_name}}</text>
              <text class="score-colon">{{item.visiting_goal}} : {{item.home_goal}}</text>
              <text class="team home-team">{{item.home_name}}</text>
            </view>
          </view>
        </view>

        <!-- 得分榜球员（替换原得分榜，客队前置，无数据隐藏） -->
        <view class="ranking-section" v-if="visitingScorers.length>0 || homeScorers.length>0">
          <view class="section-title">
            <text>得分榜球员</text> <!-- 得分榜球员 -->
          </view>
          <view class="ranking-table stats-table"> <!-- 类名语义化调整：scorer-table → stats-table -->
            <view class="table-header">
              <text class="cell">球员</text>
              <text class="cell">排名</text>
              <text class="cell">得分</text>
              <text class="cell">篮板</text>
              <text class="cell">助攻</text>
              <text class="cell">抢断</text>
              <!-- 你补充新属性后，可在此添加/修改列标题 -->
            </view>
            <!-- 客队统计榜（前置） -->
            <view class="table-row" v-for="(item,i) in visitingScorers" :key="i">
              <text class="cell player-cell">{{item.player_name || '-'}}</text>
              <text class="cell">{{item.ranking_no || '-'}}</text>
              <text class="cell">{{item.total_goal || '-'}}</text>
              <text class="cell">{{item.avg_backboard || '-'}}</text>
              <text class="cell">{{item.avg_assist || '-'}}</text>
              <text class="cell">{{item.avg_tackle || '-'}}</text>
              <!-- 你补充新属性后，替换上述字段即可 -->
            </view>
            <!-- 主队统计榜 -->
            <view class="table-row" v-for="(item,i) in homeScorers" :key="i">
              <text class="cell player-cell">{{item.player_name || '-'}}</text>
              <text class="cell">{{item.ranking_no || '-'}}</text>
              <text class="cell">{{item.total_goal || '-'}}</text>
              <text class="cell">{{item.avg_backboard || '-'}}</text>
              <text class="cell">{{item.avg_assist || '-'}}</text>
              <text class="cell">{{item.avg_tackle || '-'}}</text>
              <!-- 你补充新属性后，替换上述字段即可 -->
            </view>
          </view>
        </view>
        
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getbasketballAi } from "@/api/demo";


import CustomHeader from "@/components/CustomHeader.vue";
export default {
   
  components: {CustomHeader},
  data() {
    return {
      info: {},
      courseMap: {},
      winRateAndGoalCalculate: {},
      homeTeam: {},
      visitingTeam: {},
      homeLastCourses: [],
      visitingLastCourses: [],
      homeScorers: [],
      visitingScorers: [],
      urlValue: false,
    };
  },
  onLoad(options) {
    this.getAiDetail(options.id,options.isLottery,options.serialNumber,options.dateStr)
  wx.showShareMenu({
    menus: ['shareAppMessage', 'shareTimeline']
  })

  },
  created() {
        this.$nextTick(()=>{
    this.urlValue = uni.getStorageSync('urlValue');
    
    })
  },
  onShow() {
    uni.hideTabBar();
  },

  methods: {
    formatDateWithWeekday(time) {
      if (!time) return '-';
      const date = new Date(time.replace(/\//g, '-'));
      const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${week[date.getDay()]} ${hour}:${minute}`;
    },
    // 小数转百分比
    decimalToPercentage(decimal, fixed = 0, defaultValue = '-') {
      // 第一步：将入参转为数字（兼容字符串/数字）
      const num = parseFloat(decimal);
      // 第二步：判断是否为有效数字
      if (isNaN(num)) {
        return defaultValue;
      }
      // 第三步：计算百分比并格式化
      const percentage = num * 100;
      return `${percentage.toFixed(fixed)}%`;
    },
    // 获取AI分析数据
    async getAiDetail(id,isLottery) {
      uni.showLoading({ title: '加载中...' });
      try {
        const res = await getbasketballAi({ id, isLottery });
        const data = res.data.data;
        // 核心数据赋值
        this.courseMap = data.baseMap || {};
        this.winRateAndGoalCalculate = data.winRateAndGoalCalculate || {};
        this.homeTeam = data.homeTeam || {};
        this.visitingTeam = data.visitingTeam || {};
        this.homeLastCourses = data.homeLastCourses || [];
        this.visitingLastCourses = data.visitingLastCourses || [];
        this.homeScorers = data.homeScorers || [];
        this.visitingScorers = data.visitingScorers || [];
        this.info = JSON.parse(JSON.stringify(data));
      } catch (error) {
        uni.showToast({ title: '数据加载失败', icon: 'none' });
      } finally {
        uni.hideLoading();
      }
    },
    // 补充缺失的方法（避免报错）
    handleFunnel() {},
    onBackClick() {}
  }
};
</script>

<style lang="scss" scoped>
// 页面整体容器
.page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

// 可滚动内容区域
.content-scroll {
  flex: 1;
  overflow-y: auto; // 兼容多端
  -webkit-overflow-scrolling: touch; // 移动端顺滑滚动
}

.match-info-container {
  color: #444;
  padding: 20rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
  // 移除原有的height: 100vh和overflow-y: auto
}

// 赛事头部
.match-header {
  text-align: center;
  background: #ffffff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 24rpx;

  .match-title {
    font-size: 24rpx;
    margin-bottom: 16rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #444;
  }

  .match-teams {
    display: flex;
    align-items: center;
    margin: 16rpx 0;

    .away-team, .home-team {
      font-size: 28rpx;
      width: 40%;
      font-weight: 500;
    }

    .vs-text {
      width: 20%;
      font-size: 28rpx;
      color: #d92929;
      font-weight: bold;
    }
  }

  .match-time {
    font-size: 22rpx;
    color: #666;
  }
}

// 分析
.prediction-section {
  background: #ffffff;
  border-radius: 8rpx;
  padding: 16rpx;
  margin-top: 12rpx;

  .win-probability {
    display: flex;
    align-items: center;
    margin-bottom: 8rpx;

    .pro-text {
      color: #d92929;
      font-size: 26rpx;
      flex: none;
      padding-right: 12rpx;
    }

    .probability-bars {
      flex: 1;
      display: flex;
      height: 32rpx;
      background: #f0f0f0;
      border-radius: 16rpx;
      overflow: hidden;

      .probability-bar {
        display: flex;
        align-items: center;
        height: 100%;
        font-size: 20rpx;
        color: #fff;

        .bi {
          padding: 0 8rpx;
          text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.2);
        }
      }

      .away-bar {
        background: #31926e;
        justify-content: flex-start;
      }

      .home-bar {
        background: #d92929;
        justify-content: flex-end;
      }
    }
  }

  .win-prompt {
    color: #d92929;
    text-align: left;
    font-size: 24rpx;
    margin-top: 8rpx;
  }
}

// 通用板块样式
.ranking-section, .history-section {
  background: #ffffff;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  background: #31926e;
  color: white;
  padding: 12rpx 20rpx;
  font-size: 26rpx;
  font-weight: 500;
}

// 球队数据表格（7列）
.team-data-table {
  border: 1rpx solid #eee;

  .table-header {
    display: flex;
    background: #f5f7fa;
    padding: 12rpx 0;

    .cell {
      flex: 1;
      text-align: center;
      font-size: 24rpx;
      border-left: 1rpx solid #eee;
      color: #333;
      &:first-child {
        border-left: none;
      }
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
      flex: 1;
      text-align: center;
      font-size: 24rpx;
      &.team-cell {
        font-weight: 500;
      }
    }
  }

  .table-row:nth-child(odd) {
    background: #f9f9f9;
  }
}

// 历史记录样式（保留你修改的score-colon样式）
.history-item {
  padding: 16rpx 20rpx;
  border-bottom: 1rpx solid #eee;
  &:last-child {
    border-bottom: none;
  }

  .history-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8rpx;
    font-size: 22rpx;
    color: #666;
  }

  .match-result {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;

    .team {
      width: 40%;
      text-align: center;
      &.away-team {
        text-align: right;
        padding-right: 12rpx;
      }
      &.home-team {
        text-align: left;
        padding-left: 12rpx;
      }
    }

    // 保留你修改后的score-colon样式
    .score-colon {
      width: 26%;
      text-align: center;
      font-weight: bold;
      color: #d92929;
      letter-spacing: 4rpx;
    }
  }
}

.history-item:nth-child(even) {
  background: #f9f9f9;
}

// 统计榜球员表格（替换原得分榜样式类名，样式逻辑不变）
.stats-table {
  border: 1rpx solid #eee;

  .table-header {
    display: flex;
    background: #f5f7fa;
    padding: 12rpx 0;

    .cell {
      flex: 1;
      text-align: center;
      font-size: 24rpx;
      border-left: 1rpx solid #eee;
      color: #333;
      &:first-child {
        border-left: none;
      }
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
      flex: 1;
      text-align: center;
      font-size: 24rpx;
      &.player-cell {
        text-align: left;
        padding-left: 20rpx;
        font-weight: 500;
      }
    }
  }

  .table-row:nth-child(odd) {
    background: #f9f9f9;
  }
}
</style>