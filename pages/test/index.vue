<template>
  <view class="page-container">
    <!-- 固定头部 -->
    <CustomHeader :title="'析'" :showBack="true" :isIndex="false" :showIcon="false" :isSelected="false" :selectedPlay="''" @funnel-click="handleFunnel" @back-click="onBackClick" />

    <!-- 可滚动的内容区域 -->
    <scroll-view class="content-scroll" scroll-y="true">
      <view class="match-info-container">
        <!-- 赛事头部信息 -->
        <view class="match-header">
          <view class="match-title">
            <view v-if="courseMap.league_name">
              {{ courseMap.league_name }}
              {{ courseMap.stage && courseMap.stage != "小组赛" ? courseMap.stage : "" }}
              {{ courseMap.sub_group ? courseMap.sub_group : "" }}
              {{ courseMap.round_no ? "第" + courseMap.round_no + "轮" : "" }}
            </view>
            <view class="match-time"> {{ forateData(courseMap.race_date) }}</view>
          </view>

          <!-- 调整对战队伍布局结构 -->
          <view class="match-teams-container">
            <view class="team-column home-column">
              <text class="team-name">{{ courseMap.home_name_title }}</text>
              <text v-if="info.homeHandicap" class="handicap-text">{{ info.homeHandicap }}</text>
            </view>
            <view class="vs-column">
              <text class="vs-text">VS</text>
            </view>
            <view class="team-column away-column">
              <text class="team-name">{{ courseMap.visiting_name_title }}</text>
              <text v-if="info.visitingHandicap" class="handicap-text">{{ info.visitingHandicap }}</text>
            </view>
          </view>

          <!-- 调整预测模块布局结构 -->
          <view class="prediction-section" v-if="urlValue">
            <view class="prediction-row">
              <text class="pro-text">数据分析</text>
              <view class="prediction-content">
                <view class="home-prediction">
                  <text class="prediction-value">胜{{ decimalToPercentage(baseMap.home_win_rate, 0) }}</text>
                </view>
                <view class="draw-prediction">
                  <text class="prediction-value">平{{ decimalToPercentage(baseMap.draw_rate) }}</text>
                </view>
                <view class="away-prediction">
                  <text class="prediction-value">胜{{ decimalToPercentage(baseMap.visiting_win_rate, 0) }}</text>
                </view>
              </view>
            </view>

            <!-- 数据分析 -->
            <view class="prediction-row">
              <text class="pro-text">数据分析</text>
              <view class="prediction-content">
                <view class="home-prediction">
                  <text class="prediction-value">{{ baseMap.homeGoalCalculate === null || baseMap.homeGoalCalculate === undefined ? "-" : baseMap.homeGoalCalculate }}</text>
                </view>
                <view class="draw-prediction">
                  <text class="prediction-value">:</text>
                </view>
                <view class="away-prediction">
                  <text class="prediction-value">{{ baseMap.visitingGoalCalculate === null || baseMap.visitingGoalCalculate === undefined ? "-" : baseMap.visitingGoalCalculate }}</text>
                </view>
              </view>
            </view>

            <view class="win-prompt">{{ info.prompt || "" }}</view>
          </view>
        </view>

        <view class="ranking-section">
          <view class="section-title">
            <text>积分数据</text>
          </view>
          <view class="ranking-table scorer-table">
            <view class="table-header">
              <text class="cell player-cell">球队</text>
              <text class="cell num-cell">场次</text>
              <text class="cell num-cell">积分</text>
              <text class="cell point-num-cell">胜/平</text>
              <text class="cell point-num-cell">胜/平负</text>
            </view>
            <view class="scorer-row-wrap" v-for="(item, i) in pointsData" :key="i">
              <view class="table-row">
                <text class="cell player-cell">{{ item.teamName || "-" }}</text>
                <text class="cell num-cell">{{ item.matchesNumber || "-" }}</text>
                <text class="cell num-cell">{{ item.points || "-" }}</text>
                <text class="cell point-num-cell">{{ item.winDrawRate || "-" }}</text>
                <text class="cell point-num-cell">{{ item.winDrawLoss || "-" }}</text>
              </view>
            </view>
          </view>
        </view>
<view class="ranking-section">
  <view class="section-title">
    <text>交锋数据</text>
  </view>
  <!-- 只改这个ranking-table的结构和类名 -->
  <view class="ranking-table head-data-table">
    <!-- 重写的表头 - 左侧球队 + 右侧双列两行 -->
    <view class="head-table-header">
      <view class="header-col left-col">
        <text class="header-text">球队</text>
      </view>
      <view class="header-col right-col">
        <text class="header-text top-text">同主客交锋</text>
        <text class="header-text bottom-text">胜/均进球</text>
      </view>
      <view class="header-col right-col">
        <text class="header-text top-text">全部交锋</text>
        <text class="header-text bottom-text">胜/均进球</text>
      </view>
    </view>
    
    <!-- 数据行保持原样，仅调整类名适配新布局 -->
    <view class="scorer-row-wrap" v-for="(item, i) in headData" :key="i">
      <view class="head-table-row">
        <text class="cell left-cell">{{ item.teamName || "-" }}</text>
        <text class="cell right-cell">{{ item.tzkHeadWinRateAndGoal || "-" }}</text>
        <text class="cell right-cell">{{ item.allHeadWinRateAndGoal || "-" }}</text>
      </view>
    </view>
  </view>
</view>
        <view class="ranking-section">
          <view class="section-title">
            <text>相同主客场数据</text>
          </view>
          <view class="ranking-table scorer-table">
            <view class="table-header">
              <!-- <text class="cell ranking-cell">排名</text> -->
              <text class="cell player-cell">球队</text>
              <text class="cell point-num-cell">胜/平</text>
              <text class="cell point-num-cell">均进/失球</text>
            </view>
            <view class="scorer-row-wrap" v-for="(item, i) in tzkDataList" :key="i">
              <view class="table-row">
                <!-- <text class="cell ranking-cell">{{ item.ranking_no || "-" }}</text> -->
                <text class="cell player-cell">{{ item.teamName || "-" }}</text>
                <text class="cell point-num-cell">{{ item.winDrawRate || "-" }}</text>
                <text class="cell point-num-cell">{{ item.goalLoss || "-" }}</text>
              </view>
            </view>
          </view>
        </view>



        <view class="record-section">
          <view class="tab-buttons">
            <view class="tab-btn" :class="{ active: currentTab === '全部' }" @click="switchTab('全部')"> 全部对战 </view>
            <view class="tab-btn" :class="{ active: currentTab === '同主客' }" @click="switchTab('同主客')"> 同主客对战 </view>
          </view>
          <view class="empty-tip" v-if="filteredRecords.length === 0">暂无交手记录</view>
          <view v-if="filteredRecords.length > 0">
            <view class="history-item" v-for="(item, index) in filteredRecords" :key="index">
              <view class="history-header">
                <text class="competition">
                  {{ [item.league_name, item.stage && !["小组赛", "联赛"].includes(item.stage) ? item.stage : "", item.round_no ? `第${item.round_no}轮` : ""].filter(Boolean).join("") || "-" }}
                </text>
                <text class="date"></text>
                <text class="time">{{ item.race_date || "-" }}</text>
              </view>
              <view class="match-result">
                <text class="team" style="text-align: right">{{ item.home_name || "-" }}</text>
                <text class="score-colon">{{ item.home_goal || 0 }} : {{ item.visiting_goal || 0 }}</text>
                <text class="team" style="text-align: left">{{ item.visiting_name || "-" }}</text>
              </view>
            </view>
          </view>
        </view>
        <!-- 新增：球队伤停情况模块 -->
        <view class="ranking-section">
          <view class="section-title">
            <text>{{ courseMap.home_name || "" }}伤停情况</text>
          </view>
          <view class="ranking-table scorer-table">
            <view class="table-header">
              <text class="cell player-cell">号码-球员-位置</text>
              <text class="cell num-cell">总出场</text>
              <text class="cell num-cell">首发出场</text>
              <text class="cell point-num-cell">状态</text>
            </view>
            <view v-if="homeInjurySuspension && homeInjurySuspension.length > 0">
              <view class="scorer-row-wrap" v-for="(item, i) in homeInjurySuspension" :key="i">
                <view class="table-row">
                  <text class="cell player-cell">{{ item.uniform_no || "-" }}-{{ item.person_name || "-" }}-{{ item.position_desc || "-" }}</text>
                  <text class="cell num-cell">{{ item.appearance_cnt || 0 }}</text>
                  <text class="cell num-cell">{{ item.started_match_cnt || 0 }}</text>
                  <text class="cell point-num-cell">{{ item.injury_flag === 0 ? "停" : "伤" }}</text>
                </view>
              </view>
            </view>
            <view v-else class="scorer-row-wrap">
              <view class="table-row">
                <text class="cell player-cell" style="width: 100%;">无</text>
              </view>
            </view>
          </view>
        </view>

        <view class="ranking-section">
          <view class="section-title">
            <text>{{ courseMap.visiting_name || "" }}伤停情况</text>
          </view>
          <view class="ranking-table scorer-table">
            <view class="table-header">
              <text class="cell player-cell">号码-球员-位置</text>
              <text class="cell num-cell">总出场</text>
              <text class="cell num-cell">首发出场</text>
              <text class="cell point-num-cell">状态</text>
            </view>
            <view v-if="visitingInjurySuspension && visitingInjurySuspension.length > 0">
              <view class="scorer-row-wrap" v-for="(item, i) in visitingInjurySuspension" :key="i">
                <view class="table-row">
                  <text class="cell player-cell">{{ item.uniform_no || "-" }}-{{ item.person_name || "-" }}-{{ item.position_desc || "-" }}</text>
                  <text class="cell num-cell">{{ item.appearance_cnt || 0 }}</text>
                  <text class="cell num-cell">{{ item.started_match_cnt || 0 }}</text>
                  <text class="cell point-num-cell">{{ item.injury_flag === 0 ? "停" : "伤" }}</text>
                </view>
              </view>
            </view>
            <view v-else class="scorer-row-wrap">
              <view class="table-row">
                <text class="cell player-cell" style="width: 100%;">无</text>
              </view>
            </view>
          </view>
        </view>
        <view class="history-section" v-if="homeLastCourses && homeLastCourses.length > 0">
          <view class="section-title">
            <text>{{ info.home_lastRemark || "" }}</text>
          </view>
          <view class="history-item" v-for="(item, i) in homeLastCourses" :key="i">
            <view class="history-header">
              <text class="competition">
                {{ [item.league_name, item.stage, item.sub_group ? `${item.sub_group}组` : "", item.round_no ? `第${item.round_no}轮` : ""].filter(Boolean).join("") }}
              </text>
              <text class="date"></text>
              <text class="time">{{ item.race_date }}</text>
            </view>
            <view class="match-result">
              <text class="team" style="text-align: right">{{ item.home_name }}</text>
              <text class="score-colon">{{ item.home_goal || 0 }} : {{ item.visiting_goal || 0 }}</text>
              <text class="team" style="text-align: left">{{ item.visiting_name }}</text>
            </view>
          </view>
        </view>

        <view class="history-section" v-if="visitingLastCourses && visitingLastCourses.length > 0">
          <view class="section-title">
            <text>{{ info.visiting_lastRemark || "" }}</text>
          </view>
          <view class="history-item" v-for="(item, i) in visitingLastCourses" :key="i">
            <view class="history-header">
              <text class="competition">
                {{ [item.league_name, item.stage, item.sub_group ? `${item.sub_group}组` : "", item.round_no ? `第${item.round_no}轮` : ""].filter(Boolean).join("") }}
              </text>
              <text class="date"></text>
              <text class="time">{{ item.race_date }}</text>
            </view>
            <view class="match-result">
              <text class="team" style="text-align: right">{{ item.home_name }}</text>
              <text class="score-colon">{{ item.home_goal || 0 }} : {{ item.visiting_goal || 0 }}</text>
              <text class="team" style="text-align: left">{{ item.visiting_name }}</text>
            </view>
          </view>
        </view>

        <view class="ranking-section" v-if="homeScorers && homeScorers.length > 0">
          <view class="section-title">
            <text>{{ courseMap.home_name || "" }}-射手榜球员</text>
          </view>
          <view class="ranking-table scorer-table">
            <view class="table-header">
              <text class="cell ranking-cell">排名</text>
              <text class="cell player-cell">球员</text>
              <text class="cell num-cell">进球</text>
              <text class="cell num-cell">点球</text>
            </view>
            <view class="scorer-row-wrap" v-for="(item, i) in homeScorers" :key="i">
              <view class="table-row">
                <text class="cell ranking-cell">{{ item.ranking_no || "-" }}</text>
                <text class="cell player-cell">{{ item.player_name || "-" }}</text>
                <text class="cell num-cell">{{ item.total_goal || 0 }}</text>
                <text class="cell num-cell">{{ item.penalty_kick_goal || 0 }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="ranking-section" v-if="visitingScorers && visitingScorers.length > 0">
          <view class="section-title">
            <text>{{ courseMap.visiting_name || "" }}-射手榜球员</text>
          </view>
          <view class="ranking-table scorer-table">
            <view class="table-header">
              <text class="cell ranking-cell">排名</text>
              <text class="cell player-cell">球员</text>
              <text class="cell num-cell">进球</text>
              <text class="cell num-cell">点球</text>
            </view>
            <view class="scorer-row-wrap" v-for="(item, i) in visitingScorers" :key="i">
              <view class="table-row">
                <text class="cell ranking-cell">{{ item.ranking_no || "-" }}</text>
                <text class="cell player-cell">{{ item.player_name || "-" }}</text>
                <text class="cell num-cell">{{ item.total_goal || 0 }}</text>
                <text class="cell num-cell">{{ item.penalty_kick_goal || 0 }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getAi, queryPlayer } from "@/api/demo";
import { formatDateWithWeekday } from "@/utils/data";

import CustomHeader from "@/components/CustomHeader.vue";
export default {
  components: { CustomHeader },
  data() {
    return {
      info: {},
      courseMap: {},
      baseMap: {},
      goalCalculate: {},
      homeTeam: {},
      visitingTeam: {},
      homeLastCourses: [],
      visitingLastCourses: [],
      homeScorers: [],
      visitingScorers: [],
      currentTeamName: "",
      currentTab: "全部",
      filteredRecords: [],
      tzkHeadRecord: [],
      allHeadRecord: [],
      pointsData: [],
      tzkDataList:[],
      headData: [],
      // 新增：伤停数据列表
      homeInjurySuspension: [],
      visitingInjurySuspension: [],
      urlValue: false,
    };
  },
  onLoad(options) {
    let param = {};
    param.id = options.id;
    param.isLottery = options.isLottery;
    if (options.isTradition) {
      param.isTradition = 1;
    }
    this.getAiDetail(param);
    // 强制显示分享菜单，立刻解除置灰
    wx.showShareMenu({
      menus: ["shareAppMessage", "shareTimeline"],
    });
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
    switchTab(tab) {
      if (tab == "全部") {
        this.filteredRecords = this.allHeadRecord;
      } else {
        this.filteredRecords = this.tzkHeadRecord;
      }
      this.currentTab = tab;
    },
    forateData(time) {
      return formatDateWithWeekday(time) || "-";
    },
    decimalToPercentage(decimal, fixed = 0, defaultValue = "-") {
      if (typeof decimal !== "number" || isNaN(decimal)) {
        return defaultValue;
      }
      const percentage = decimal * 100;
      return `${percentage.toFixed(fixed)}%`;
    },
    async getAiDetail(param) {
      this.showLoading();
      try {
        const res = await getAi(param);
        const data = res.data.data || {};
        this.courseMap = data.baseMap || {};
        this.baseMap = data.baseMap || {};
        this.goalCalculate = data.goalCalculate || {};
        this.homeTeam = data.homeTeam || {};
        this.visitingTeam = data.visitingTeam || {};
        this.homeLastCourses = data.homeLastCourses || [];
        this.visitingLastCourses = data.visitingLastCourses || [];
        this.homeScorers = data.homeScorers || [];
        this.visitingScorers = data.visitingScorers || [];
        this.allHeadRecord = data.all_headRecord || [];
        this.tzkHeadRecord = data.tzk_headRecord || [];
        this.filteredRecords = data.all_headRecord || [];
        this.pointsData = data.pointsData|| [];
        this.headData = data.headData|| [];
        this.tzkDataList =  data.tzkDataList||[];
        this.info = JSON.parse(JSON.stringify(data));
        // 新增：赋值伤停数据
        this.homeInjurySuspension = data.homeInjurySuspension || [];
        this.visitingInjurySuspension = data.visitingInjurySuspension || [];
      } catch (error) {
        console.error("获取AI详情失败:", error);
      } finally {
        this.hideLoading();
      }
    },
    showLoading() {
      uni.showLoading({ title: "加载中...", mask: true });
    },
    hideLoading() {
      uni.hideLoading();
    },
    // 补充缺失的事件处理方法
    handleFunnel() {},
    onBackClick() {},
  },
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

// 容器基础样式
.match-info-container {
  color: #444;
  padding: 20rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
  // 移除原有的height: 100vh和overflow-y: auto
}

// 赛事头部样式
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

  .match-time {
    display: flex;
    justify-content: center;
    font-size: 24rpx;
    margin-left: 30rpx;
  }

  // 新增对战队伍容器样式
  .match-teams-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 8rpx 0;
    padding: 0 20rpx;

    .team-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-end; // 默认右对齐（主队）
      gap: 4rpx;

      &.away-column {
        align-items: flex-start; // 客队左对齐
      }

      .team-name {
        font-size: 26rpx;
      }

      .handicap-text {
        font-size: 22rpx;
        color: red;
      }
    }

    .vs-column {
      width: 120rpx;
      display: flex;
      justify-content: center;
      align-items: center;

      .vs-text {
        font-size: 26rpx;
        color: #444;
      }
    }
  }
}

// 预测模块样式调整
.prediction-section {
  background: #ffffff;
  border-radius: 12rpx;
  padding-bottom: 10rpx;

  .prediction-row {
    display: flex;
    align-items: center;
    margin: 8rpx 0;

    .pro-text {
      color: red;
      box-sizing: border-box;
      padding-left: 22rpx;
      font-size: 26rpx;
      flex-shrink: 0;
      width: 140rpx;
    }

    .prediction-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 0 20rpx;

      .home-prediction {
        display: flex;
        justify-content: flex-end; // 主队内容右对齐
        width: 26%;
      }

      .draw-prediction {
        width: 120rpx;
        display: flex;
        justify-content: center; // 平局/比分分隔符居中
      }

      .away-prediction {
        flex: 1;
        display: flex;
        justify-content: flex-start; // 客队内容左对齐
      }

      .prediction-value {
        font-size: 20rpx;
        color: #31926e;
      }
    }
  }

  .win-prompt {
    color: red;
    text-align: left;
    padding-left: 20rpx;
    font-size: 29.5rpx;
    margin-top: 8rpx;
  }
}

// 以下样式保持不变
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
      &.table-single {
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
      &.table-single {
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
.players-section,
.statistic-section,
.record-section {
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
  &.head-data-fix {
    .table-header {
      align-items: center; // 单元格垂直居中
      height: 48rpx; // 统一表头行高
      
      &:first-of-type .player-cell {
        display: flex;
        align-items: center;
        justify-content: center; // 空白单元格水平居中
      }
    }
  }
}

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
    .point-num-cell {
      width: 130rpx;
      flex: none;
    }
    .headData-point-num-cell {
      width: 200rpx;
      flex: none;
    }
    .player-cell {
      flex: 1;
      text-align: cen;
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
  padding: 0 20rpx 16rpx 20rpx;
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

.statistic-section {
  .statistic-table {
    border: 1rpx solid #eee;
    .table-header {
      display: flex;
      background: #f5f7fa;
      padding: 12rpx 0;
      border-bottom: 1rpx solid #eee;
    }
    .table-row {
      display: flex;
      padding: 12rpx 0;
      border-bottom: 1rpx solid #eee;
      &:last-child {
        border-bottom: none;
      }
    }
    .cell {
      text-align: center;
      font-size: 24rpx;
      color: #444;
    }
    .item-cell {
      width: 40%;
      flex: none;
      text-align: left;
      padding-left: 20rpx;
    }
    .team-cell {
      width: 30%;
      flex: none;
      font-weight: bold;
    }
    .data-cell {
      width: 30%;
      flex: none;
    }
    .table-row:nth-child(even) {
      background: #f2f2f2;
    }
  }
}

.record-section {
  background: #ffffff;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

  .tab-buttons {
    display: flex;
    border-bottom: 1rpx solid #eee;
    .tab-btn {
      flex: 1;
      text-align: center;
      padding: 16rpx 0;
      font-size: 26rpx;
      color: #666;
      background: #f5f7fa;
      cursor: pointer;
      transition: all 0.3s;
      &.active {
        color: #31926e;
        background: #ffffff;
        border-bottom: 2rpx solid #31926e;
      }
    }
  }
}
// 交锋数据表格专属样式 - 完全独立，不影响其他表格
.head-data-table {
  border: 1rpx solid #eee;
  
  // 表头样式
  .head-table-header {
    display: flex;
    background: #f5f7fa;
    
    .header-col {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border-left: 1rpx solid #eee;
      padding: 8rpx 0;
      
      // 左侧球队列
      &.left-col {
        flex: 1; // 自适应宽度
      }
      
      // 右侧双列（同宽）
      &.right-col {
        width: 200rpx; // 固定相同宽度
      }
      
      .header-text {
        font-size: 26rpx;
        color: #444;
        height: 50%;
        display: flex;
        align-items: center;
        
        &.top-text {
          margin-bottom: 4rpx;
        }
        
        &.bottom-text {
          margin-top: 4rpx;
        }
      }
    }
  }
  
  // 数据行样式
  .head-table-row {
    display: flex;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #eee;
    
    &:nth-child(odd) {
      background: #f2f2f2;
    }
    
    &:last-child {
      border-bottom: none;
    }
    
    .cell {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 26rpx;
      border-left: 1rpx solid #eee;
      
      &.left-cell {
        flex: 1;
        padding-left: 20rpx;
      }
      
      &.right-cell {
        width: 200rpx;
        text-align: center;
      }
    }
  }
  .scorer-row-wrap:nth-child(odd) .head-table-row {
    background: #f2f2f2 !important;
  }
  .scorer-row-wrap:nth-child(even) .head-table-row {
    background: transparent !important;
  }
}
</style>