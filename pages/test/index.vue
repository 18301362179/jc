<template>
  <view class="match-info-container" v-if="info" :style="{ overflow: showPlayerModal ? 'hidden' : 'auto' }">
    <view class="match-header">
      <view class="match-title">
        <view v-if="courseMap.league_name">{{courseMap.league_name}}{{courseMap.stage && !courseMap.stage!='小组赛'  ? courseMap.stage:''}}{{courseMap.sub_group  ? courseMap.sub_group:''}}{{courseMap.round_no  ? '第'+courseMap.round_no+'轮':''}}</view>
        <view class="match-time"> {{forateData(courseMap.race_date)}}</view>
      </view>

      <view class="match-teams">
        <text class="home-team" style="text-align: right;">{{courseMap.home_name}}</text>
        <text v-if="info.homeHandicap" style="margin-left:6rpx; color: red;">{{ info.homeHandicap }}</text>
        <text class="vs-text" style="width: 20%;padding:0 40rpx;padding-left:60rpx;">VS</text>
        <text class="home-team" style="text-align: left; margin-left: 30rpx">{{courseMap.visiting_name}}</text>
        <text v-if="info.visitingHandicap" style="margin-left:6rpx; color: red;">{{ info.visitingHandicap }}</text>
      </view>
      <view class="prediction-section">
        <view class="win-probability">
          <text class="pro-text">预测:</text>
          <view class="probability-bars" style="flex: 1; display: flex; align-items: center;">
            <view class="probability-bar home-bar" :style="{ width: '30%' }">
              <text class="bi">胜率{{decimalToPercentage(winRateAndGoalCalculate.home_win_rate,0)}}约{{winRateAndGoalCalculate.homeGoalCalculate}}球</text>
            </view>
            <view class="colon-wrapper">平率{{decimalToPercentage(winRateAndGoalCalculate.draw_rate)}}</view>
            <view class="probability-bar away-bar" :style="{ width: '40%' }">
              <text class="bi" style="text-align: left">胜率{{decimalToPercentage(winRateAndGoalCalculate.visiting_win_rate,0)}}约{{winRateAndGoalCalculate.visitingGoalCalculate}}球</text>
            </view>
          </view>
        </view>

        <view class="win-prompt">{{info.prompt}}</view>
      </view>
    </view>


<!-- 仅修改这部分:基础信息板块（行式对称布局 + 字段规则） -->
<view class="compare-section" v-if="homeTeam && visitingTeam">
  <view class="section-title">
    <text>基础信息</text>
  </view>

  <!-- 布局:left-td(固定) + mid-wrapper(平均分配) + right-td(固定) -->
  <view class="compare-table">
    <view class="compare-tr name-tr">
      <text class="compare-td left-td team-name">{{ homeTeam.team_name }}</text>
      <view class="mid-wrapper name-gap">:</view>
      <text class="compare-td right-td team-name">{{ visitingTeam.team_name }}</text>
    </view>

      <!-- 1. 主教练行 (修改后) -->
      <view class="compare-tr">
        <view class="mid-wrapper">
          <text class="compare-td mid-td home-td">{{ homeTeam.jl_xm || '-' }}</text>
          <text class="colon">:</text> <!-- 保留中间冒号 -->
          <text class="compare-td mid-td away-td">{{ visitingTeam.jl_xm || '-' }}</text>
        </view>
      </view>

    <!-- 2. 习惯阵型行 -->
    <view class="compare-tr">
      <text class="compare-td left-td">习惯阵型</text>
      <view class="mid-wrapper">
        <text class="compare-td mid-td home-td">{{ homeTeam.jl_xgzx || '-' }}</text>
        <text class="colon">:</text>
        <text class="compare-td mid-td away-td">{{ visitingTeam.jl_xgzx || '-' }}</text>
      </view>
      <text class="compare-td right-td">习惯阵型</text>
    </view>
    <!-- 球员列表行 -->
    <view class="compare-tr">
      <text class="compare-td left-td">球员列表</text>
      <view class="mid-wrapper">
        <text class="compare-td mid-td home-td look" @click="openPlayerModal(homeTeam.team_name)">查看</text>
        <text class="colon">:</text>
        <text class="compare-td mid-td away-td look" @click="openPlayerModal(visitingTeam.team_name)">查看</text>
      </view>
      <text class="compare-td right-td">球员列表</text>
    </view>
    <!-- 4. 积分行 -->
    <view class="compare-tr">
      <text class="compare-td left-td">积分</text>
      <view class="mid-wrapper">
        <text class="compare-td mid-td home-td">{{ homeTeam.league_points || '-' }}</text>
        <text class="colon">:</text>
        <text class="compare-td mid-td away-td">{{ visitingTeam.league_points || '-' }}</text>
      </view>
      <text class="compare-td right-td">积分</text>
    </view>

    <!-- 胜率组:win_rate存在则全显 -->
    <template v-if="homeTeam.win_rate || visitingTeam.win_rate">
      <view class="compare-tr">
        <text class="compare-td left-td">胜率</text>
        <view class="mid-wrapper">
          <text class="compare-td mid-td home-td">{{ homeTeam.win_rate ? homeTeam.win_rate : '-' }}</text>
          <text class="colon">:</text>
          <text class="compare-td mid-td away-td">{{ visitingTeam.win_rate ? visitingTeam.win_rate : '-' }}</text>
        </view>
        <text class="compare-td right-td">胜率</text>
      </view>
      <view class="compare-tr">
        <text class="compare-td left-td">平率</text>
        <view class="mid-wrapper">
          <text class="compare-td mid-td home-td">{{ homeTeam.win_rate ? homeTeam.equality_rate : '-' }}</text>
          <text class="colon">:</text>
          <text class="compare-td mid-td away-td">{{ visitingTeam.win_rate ? visitingTeam.equality_rate : '-' }}</text>
        </view>
        <text class="compare-td right-td">平率</text>
      </view>
      <view class="compare-tr">
        <text class="compare-td left-td">负率</text>
        <view class="mid-wrapper">
          <text class="compare-td mid-td home-td">{{ homeTeam.win_rate ? homeTeam.fail_rate : '-' }}</text>
          <text class="colon">:</text>
          <text class="compare-td mid-td away-td">{{ visitingTeam.win_rate ? visitingTeam.fail_rate : '-' }}</text>
        </view>
        <text class="compare-td right-td">负率</text>
      </view>
      <view class="compare-tr">
        <text class="compare-td left-td">进球</text>
        <view class="mid-wrapper">
          <text class="compare-td mid-td home-td">{{ homeTeam.win_rate ? homeTeam.avg_goal : '-' }}</text>
          <text class="colon">:</text>
          <text class="compare-td mid-td away-td">{{ visitingTeam.win_rate ? visitingTeam.avg_goal : '-' }}</text>
        </view>
        <text class="compare-td right-td">进球</text>
      </view>
      <view class="compare-tr">
        <text class="compare-td left-td">失球</text>
        <view class="mid-wrapper">
          <text class="compare-td mid-td home-td">{{ homeTeam.win_rate ? homeTeam.avg_fumble_goal : '-' }}</text>
          <text class="colon">:</text>
          <text class="compare-td mid-td away-td">{{ visitingTeam.win_rate ? visitingTeam.avg_fumble_goal : '-' }}</text>
        </view>
        <text class="compare-td right-td">失球</text>
      </view>
    </template>

    <!-- 主场/客场组 -->
    <view class="compare-tr">
      <text class="compare-td left-td">主场胜率</text>
      <view class="mid-wrapper">
        <text class="compare-td mid-td home-td">{{ homeTeam.home_win_rate_ ? homeTeam.home_win_rate_ : '-' }}</text>
        <text class="colon">:</text>
        <text class="compare-td mid-td away-td">{{ visitingTeam.visiting_win_rate_ ? visitingTeam.visiting_win_rate_ : '-' }}</text>
      </view>
      <text class="compare-td right-td">客场胜率</text>
    </view>
    <view class="compare-tr">
      <text class="compare-td left-td">主场平率</text>
      <view class="mid-wrapper">
        <text class="compare-td mid-td home-td">{{ homeTeam.home_win_rate_ ? homeTeam.home_equality_rate_ : '-' }}</text>
        <text class="colon">:</text>
        <text class="compare-td mid-td away-td">{{ visitingTeam.visiting_win_rate_ ? visitingTeam.visiting_equality_rate_ : '-' }}</text>
      </view>
      <text class="compare-td right-td">客场平率</text>
    </view>
    <view class="compare-tr">
      <text class="compare-td left-td">主场负率</text>
      <view class="mid-wrapper">
        <text class="compare-td mid-td home-td">{{ homeTeam.home_win_rate_ ? homeTeam.home_loss_rate_ : '-' }}</text>
        <text class="colon">:</text>
        <text class="compare-td mid-td away-td">{{ visitingTeam.visiting_win_rate_ ? visitingTeam.visiting_loss_rate_ : '-' }}</text>
      </view>
      <text class="compare-td right-td">客场负率</text>
    </view>
    <view class="compare-tr">
      <text class="compare-td left-td">主场进球</text>
      <view class="mid-wrapper">
        <text class="compare-td mid-td home-td">{{ homeTeam.home_win_rate_ ? homeTeam.home_avg_goal_ : '-' }}</text>
        <text class="colon">:</text>
        <text class="compare-td mid-td away-td">{{ visitingTeam.visiting_win_rate_ ? visitingTeam.visiting_avg_goal_ : '-' }}</text>
      </view>
      <text class="compare-td right-td">客场进球</text>
    </view>
    <view class="compare-tr">
      <text class="compare-td left-td">主场失球</text>
      <view class="mid-wrapper">
        <text class="compare-td mid-td home-td">{{ homeTeam.home_win_rate_ ? homeTeam.home_avg_fumble_goal_ : '-' }}</text>
        <text class="colon">:</text>
        <text class="compare-td mid-td away-td">{{ visitingTeam.visiting_win_rate_ ? visitingTeam.visiting_avg_fumble_goal_ : '-' }}</text>
      </view>
      <text class="compare-td right-td">客场失球</text>
    </view>


  </view>
</view>
    <!-- 球员列表弹窗 -->
    <view class="custom-modal-mask" v-if="showPlayerModal" @click="closePlayerModal" @touchmove.prevent></view>
    <view class="custom-modal" v-if="showPlayerModal">
      <view class="modal-header">
        <text class="modal-title">球员名单</text>
        <text class="modal-close" @click="closePlayerModal">×</text>
      </view>
      <view class="modal-content">
        <view class="player-table-wrap" v-if="playerList.length > 0">
            <view class="player-table-header">
              <text class="table-cell table-single">号码</text>
              <text class="table-cell">位置</text>
              <text class="table-cell">球员</text>
              <text class="table-cell">籍贯</text>
              <text class="table-cell">出生日期</text>
              <text class="table-cell table-single">身高</text>
              <text class="table-cell table-single">体重</text>
           </view>
          <view class="player-table">
            <view class="player-table-row" v-for="(item, i) in playerList" :key="i">
              <text class="table-cell table-single">{{item.hm || '-'}}</text>
              <text class="table-cell">{{item.wz || '-'}}</text>
              <text class="table-cell">{{item.player_name || '-'}}</text>
              <text class="table-cell">{{item.jg || '-'}}</text>
              <text class="table-cell">{{item.csrq || '-'}}</text>
              <text class="table-cell table-single">{{item.sg || '-'}}</text>
              <text class="table-cell table-single">{{item.tz || '-'}}</text>
            </view>
          </view>
        </view>
        <view class="empty-tip" v-else>
          暂无数据
        </view>
      </view>
    </view>

    <!-- 以下内容保持不变 -->
    <view class="history-section" v-if="info.home_headToHeadRemark&& info.headToHeadRecord">
      <view class="section-title">
        <text>对战记录</text>
        <text style="margin-left: 20rpx;">{{info.home_headToHeadRemark}}</text>
      </view>

      <view class="history-item" v-for="(item,i) in info.headToHeadRecord" :key="i">
        <view class="history-header">
          <text class="competition">              {{ 
                [
                  item.league_name,
                  item.stage,
                  item.sub_group ? `${item.sub_group}组` : '',
                  item.round_no ? `第${item.round_no}轮` : ''
                ].filter(Boolean).join('') 
              }}</text>
          <text class="date"></text>
          <text class="time">{{item.race_date}}</text>
        </view>
        <view class="match-result">
          <text class="team" style="text-align: right;">{{item.home_name}}</text>
          <text class="score-colon">{{item.home_goal}} : {{item.visiting_goal}}</text>
          <text class="team" style="text-align: left;">{{item.visiting_name}}</text>
        </view>
      </view>
    </view>

    <view class="history-section" v-if="info.homeLastCourses&&info.homeLastCourses.length>0">
      <view class="section-title">
        <text>{{info.home_lastRemark}}</text>
      </view>

      <view class="history-item" v-for="(item,i) in info.homeLastCourses" :key="i">
        <view class="history-header">
          <text class="competition">
              {{ 
                [
                  item.league_name,
                  item.stage,
                  item.sub_group ? `${item.sub_group}组` : '',
                  item.round_no ? `第${item.round_no}轮` : ''
                ].filter(Boolean).join('') 
              }}
          </text>
          <text class="date"></text>
          <text class="time">{{item.race_date}}</text>
        </view>
        <view class="match-result">
          <text class="team" style="text-align: right;">{{item.home_name}}</text>
          <text class="score-colon">{{item.home_goal}} : {{item.visiting_goal}}</text>
          <text class="team" style="text-align: left;">{{item.visiting_name}}</text>
        </view>
      </view>
    </view>
    <view class="history-section" v-if="info.visitingLastCourses&&info.visitingLastCourses.length>0">
      <view class="section-title">
        <text>{{info.visiting_lastRemark}}</text>
      </view>

      <view class="history-item" v-for="(item,i) in info.visitingLastCourses" :key="i">
        <view class="history-header">
          <text class="competition">
            {{ 
                [
                  item.league_name,
                  item.stage,
                  item.sub_group ? `${item.sub_group}组` : '',
                  item.round_no ? `第${item.round_no}轮` : ''
                ].filter(Boolean).join('') 
              }}
          </text>
          <text class="date"></text>
          <text class="time">{{item.race_date}}</text>
        </view>
        <view class="match-result">
          <text class="team" style="text-align: right;">{{item.home_name}}</text>
          <text class="score-colon">{{item.home_goal}} : {{item.visiting_goal}}</text>
          <text class="team" style="text-align: left;">{{item.visiting_name}}</text>
        </view>
      </view>
    </view>
    <view class="ranking-section" v-if="homeScorers&&homeScorers.length>0">
      <view class="section-title">
       <text>{{courseMap.home_name}}-射手榜球员</text>
      </view>

      <view class="ranking-table scorer-table">
        <view class="table-header">
          <text class="cell ranking-cell">排名</text>
          <text class="cell player-cell">球员</text>
          <text class="cell num-cell">进球</text>
          <text class="cell num-cell">点球</text>
        </view>
        <view class="scorer-row-wrap" v-for="(item,i) in homeScorers" :key="i">
        <view class="table-row">
          <text class="cell ranking-cell">{{item.ranking_no}}</text>
          <text class="cell player-cell">{{item.player_name}}</text>
          <text class="cell num-cell">{{item.total_goal}}</text>
          <text class="cell num-cell">{{item.penalty_kick_goal}}</text>
        </view>
        </view>
      </view>
    </view>
    <view class="ranking-section" v-if="visitingScorers&&visitingScorers.length > 0">
      <view class="section-title">
        <text>{{courseMap.visiting_name}}-射手榜球员</text>
      </view>

      <view class="ranking-table scorer-table">
        <view class="table-header">
          <text class="cell ranking-cell">排名</text>
          <text class="cell player-cell">球员</text>
          <text class="cell num-cell">进球</text>
          <text class="cell num-cell">点球</text>
        </view>
        <view class="scorer-row-wrap" v-for="(item,i) in visitingScorers" :key="i">
        <view class="table-row">
          <text class="cell ranking-cell">{{item.ranking_no}}</text>
          <text class="cell player-cell">{{item.player_name}}</text>
          <text class="cell num-cell">{{item.total_goal}}</text>
          <text class="cell num-cell">{{item.penalty_kick_goal}}</text>
        </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getAi, queryPlayer } from "@/api/demo";
import { formatDateWithWeekday } from "@/utils/data";

export default {
  data() {
    return {
      info: {},
      courseMap: {},
      winRateAndGoalCalculate: {},
      goalCalculate: {},
      homeTeam: {},
      visitingTeam: {},
      homeLastCourses:[],
      visitingLastCourses:[],
      homeScorers: [],
      visitingScorers: [],
      playerList: [],
      currentTeamName: '',
      showPlayerModal: false
    };
  },
  onLoad(options) {
    let param = {};
    param.id = options.id; 
    param.isLottery = options.isLottery;
    if (options.isTradition) {
      param.isTradition = 1

    };
    this.getAiDetail(param)
  },
  onShow() {
    uni.hideTabBar();
  },
  methods: {
    forateData(time) {
      return formatDateWithWeekday(time);
    },
    decimalToPercentage(decimal, fixed = 0, defaultValue = '-') {
      if (typeof decimal !== 'number' || isNaN(decimal)) {
        return defaultValue;
      }
      const percentage = decimal * 100;
      return `${percentage.toFixed(fixed)}%`;
    },
    async getAiDetail(param) {
      this.showLoading();
      try {
        const res = await getAi(param);
        this.courseMap = res.data.data.baseMap;
        this.winRateAndGoalCalculate = res.data.data.winRateAndGoalCalculate;
        this.goalCalculate = res.data.data.goalCalculate;
        this.homeTeam = res.data.data.homeTeam;
        this.visitingTeam = res.data.data.visitingTeam;
        this.homeLastCourses = res.data.data.homeLastCourses;
        this.visitingLastCourses = res.data.data.visitingLastCourses;
        this.homeScorers = res.data.data.homeScorers;
        this.visitingScorers = res.data.data.visitingScorers;
        this.info = JSON.parse(JSON.stringify(res.data.data));
      } catch (error) {
        console.error("获取AI详情失败:", error);
        this.hideLoading();
      } finally {
        this.hideLoading();
      }
    },
    async openPlayerModal(teamName) {
      if (!teamName) {
        uni.showToast({ title: '球队名称无效', icon: 'none' });
        return;
      }
      this.currentTeamName = teamName;
      this.playerList = [];
      this.showPlayerModal = true;
      
      this.showLoading();
      try {
        const res = await queryPlayer({ teamName });
        this.playerList = (res.data) || [];
      } catch (error) {
        console.error("查询球员列表失败:", error);
        uni.showToast({ title: '获取球员数据失败', icon: 'none' });
      } finally {
        this.hideLoading();
      }
    },
    closePlayerModal() {
      this.showPlayerModal = false;
      this.playerList = [];
    },
    showLoading() {
      uni.showLoading({ title: '加载中...', mask: true });
    },
    hideLoading() {
      uni.hideLoading();
    }
  }
};
</script>

<style lang="scss" scoped>
.match-info-container {
  color: #444;
  padding: 20rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  height: 100vh; 
  box-sizing: border-box;
  overflow-y: auto;
}

.match-header {
  text-align: center;
  background: #ffffff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 4rpx;

  .match-title {
    font-size: 24rpx;
    margin-bottom: 10rpx;
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 0 20rpx;
    color: #444;
  }

  .match-teams {
    display: flex;
    align-items: center;
    margin: 8rpx 0;

    .home-team {
      font-size: 26rpx;
      width: 45%;
    }

    .vs-text {
      flex: 1;
      font-size: 26rpx;
      color: #444;
    }
  }

  .match-time {
    display: flex;
    justify-content: center;
    font-size: 24rpx;
    margin-left: 30rpx;
  }
}

.prediction-section {
  background: #ffffff;
  border-radius: 12rpx;
  .win-probability {
    display: flex;
    .pro-text {
      color: red;box-sizing: border-box;padding-left: 22rpx;font-size: 26rpx;
    }
    .probability-bars {
      display: flex;
      overflow: hidden;
      .colon-wrapper {
        color: #444;
        width: 25%;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 20rpx;
        font-size: 20rpx;
        color: #31926e;
      }

      .probability-bar {
        display: flex;
        align-items: center;
        height: 100%;
        font-size: 20rpx;
        color: white;
        text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3);
        
        .bi {
          position: relative;
          color: #31926e;
        }
      }
      .home-bar {
        justify-content: flex-end;
      }
      .away-bar {
        justify-content: flex-start;
      }
    }
  }
  .win-prompt {
    color: red; text-align:left;padding-left: 20rpx;font-size: 29.5rpx;
  }
}

.compare-section {
  background: #ffffff;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  height: 630rpx;
  overflow:auto;
  .section-title {
    background: #31926e;
    color: white;
    padding: 8rpx 20rpx;
    font-size: 26rpx;
    left:0;
    top:0;
  }

  .compare-table {
    box-sizing: border-box;
    width: 100%;
    padding: 20rpx;
    padding-top: 0;
    display: flex;
    flex-direction: column;
    gap: 4rpx;

    .compare-tr {
      width: 100%;
      display: flex;
      align-items: center;
      padding: 8rpx 0;
      border-bottom: 1rpx dashed #eee;
      font-size: 24rpx;

      // 球队名称行样式（保持不变）
      &.name-tr {
        font-size: 26rpx;
        font-weight: 500;
        padding: 12rpx 0;
        
        .compare-td.left-td,
        .compare-td.right-td {
          flex: 1 !important;
          width: auto !important;
          padding: 0 !important;
        }
        .left-td.team-name {
          text-align: right !important;
        }
        .right-td.team-name {
          text-align: left !important;
        }
        .mid-wrapper.name-gap {
          flex: 0 0 20rpx;
        }
        .team-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      &:last-child {
        border-bottom: none;
      }

      // 左侧列:固定宽度 + 强制右对齐
      .compare-td.left-td {
        flex: none !important;
        width: 140rpx !important;
        text-align: right !important;
        padding-right: 10rpx;
        color: #444;
      }

      // 中间容器:调整布局，适配冒号
      .mid-wrapper {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center; // 整体居中

        // 新增:冒号样式
        .colon {
          font-size: 24rpx;
          color: #444;
          margin: 0 10rpx; // 冒号和左右数据的间距
          flex: none; // 不占用额外空间
          text-align: center;
        }

        .compare-td.mid-td {
          flex: 1; // 左右数据区域平均分
          color: #666;
          min-width: 80rpx;

          &.home-td {
            text-align: right; // 主队数据右对齐
            padding-right: 0;
          }
          &.away-td {
            text-align: left; // 客队数据左对齐
            padding-left: 0;
          }
        }
      }

      // 右侧列:固定宽度 + 强制左对齐
      .compare-td.right-td {
        flex: none !important;
        width: 140rpx !important;
        text-align: left !important;
        padding-left: 10rpx;
        color: #444;
      }

      .look {
        color: #06f!important;
        cursor: pointer;
        text-align: center!important;
      }
    }
  }
}
// 自定义弹窗样式
.custom-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.custom-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  background: #fff;
  border-radius: 12rpx;
  z-index: 1000;
  max-height: 90vh;
  overflow: hidden;

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 20rpx;
    border-bottom: 1rpx solid #eee;

    .modal-title {
      font-size: 26rpx;
      font-weight: bold;
      color: #333;
    }

    .modal-close {
      font-size: 32rpx;
      color: #999;
      width: 40rpx;
      height: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover {
        color: #333;
      }
    }
  }

  .modal-content {
    padding: 20rpx;
    padding-top: 0;
    max-height: calc(90vh - 80rpx);
    overflow-y: auto;
  }
}

// 球员表格样式
.player-table-wrap {
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  .player-table-header {
    display: flex;
    background: #f5f7fa;
    padding: 12rpx 0;
    padding-top: 0;
    border-bottom: 1rpx solid #eee;
    position: sticky;
    top: 0;
    z-index: 10;
    width: 100%;

    .table-cell {
      flex: 1;
      text-align: center;
      font-size: 22rpx;
      font-weight: bold;
      color: #444;
      &.table-single{
        flex: none !important;
        width: 60rpx !important;
      }
    }
  }
}

.player-table {
  width: 100%;

  .player-table-row {
    display: flex;
    padding: 12rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:nth-child(even) {
      background: #f9f9f9;
    }

    .table-cell {
      flex: 1;
      text-align: center;
      font-size: 20rpx;
      color: #666;
      &.table-single{
        flex: none !important;
        width: 60rpx !important;
      }
    }
  }
}

.empty-tip {
  text-align: center;
  padding: 40rpx 0;
  font-size: 24rpx;
  color: #999;
}

.ranking-section,
.history-section,
.players-section {
  background: #ffffff;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  background: #31926e;
  color: white;
  padding: 8rpx 20rpx;
  font-size: 26rpx;
}

// 通用表格基础样式
.ranking-table {
  border: 1rpx solid #eee;
  .table-header {
    display: flex;
    background: #f5f7fa;
    padding: 12rpx 0;
    .cell {
      text-align: center;
      font-size: 26rpx;
      border-left: 1rpx solid #eee;
      color: #444;
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
      text-align: center;
      font-size: 26rpx;
    }
  }
  .table-row:nth-child(even) {
    background: #f2f2f2;
}
}

// 射手榜专属样式
.scorer-table {
  .table-header,
  .table-row {
    .ranking-cell {
      width: 100rpx;
      flex: none;
    }
    .num-cell {
      width: 100rpx;
      flex: none;
    }
    .player-cell {
      flex: 1;
      text-align: left;
      padding-left: 20rpx;
    }
  }
  .scorer-row-wrap:nth-child(odd) .table-row {
    background: #f2f2f2 !important;
  }
  .scorer-row-wrap:nth-child(even) .table-row {
    background: transparent !important;
  }
}

.history-item {
  padding:0 20rpx 16rpx 20rpx;
  border-bottom: 4rpx solid #eee;
  
  .history-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6rpx;
    padding-top: 4rpx;
    font-size: 26rpx;
    color: #777;
  }

  .match-result {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 26rpx;
    box-sizing: border-box;
    color: #444;
    
    .team {
      width: 42%;
      text-align: center;
      color: #444;
      box-sizing: border-box;
      padding-bottom: 10rpx;
      font-size: 26rpx;
    }

    .score-colon {
      flex: 1;
      font-weight: bold;
      color: red;
      font-size: 26rpx;
      letter-spacing: 4rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8rpx;
    }
  }
}
.history-item:nth-child(even) {
    background: #f2f2f2;
}
</style>