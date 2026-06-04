<template>
  <view class="forecast-page">
    <!-- 头部 -->
    <CustomHeader title="分析数据" :showBack="true" />
    <!-- 顶部赛事信息Header -->
    <view class="match-header">
      <!-- 顶部赛事信息（周四001 国际赛） -->
      <view class="match-top-info">
        <text class="match-code">{{ headerInfo.matchNum || "0" }}</text>
        <text class="league-name">{{ headerInfo.tournamentCnName || "0" }}</text>
      </view>

      <!-- 核心横向对齐区域：队名、VS、胜率、平率、比分 -->
      <view class="match-main">
        <!-- 主队区域 -->
        <view class="team-col">
          <view class="team-name">{{ headerInfo.homeTeamShortName || "0" }}</view>
          <view class="win-rate"> 胜率{{ headerInfo.home_win_rate || "0" }} </view>
          <view class="score-pred">
            {{ headerInfo.home_goal_calculate || "0" }}
          </view>
          <view class="score-pred" v-if="headerInfo.home_goal_calculate1">
            {{ headerInfo.home_goal_calculate1 || "0" }}
          </view>
        </view>

        <!-- 中间VS+平率区域 -->
        <view class="vs-col">
          <view class="vs-text">VS</view>
          <view class="draw-rate">平率{{ headerInfo.draw_rate || "0" }}</view>
          <view class="score-col">:</view>
        </view>

        <!-- 客队区域 -->
        <view class="team-col">
          <view class="team-name">{{ headerInfo.awayTeamShortName || "0" }}</view>
          <view class="win-rate">胜率{{ headerInfo.visiting_win_rate || "0" }}</view>
          <view class="score-pred">{{ headerInfo.visiting_goal_calculate || "0" }}</view>
          <view class="score-pred" v-if="headerInfo.visiting_goal_calculate1">{{ headerInfo.visiting_goal_calculate1 || "0" }}</view>
        </view>
      </view>

      <!-- 底部比赛时间 -->
      <view class="match-bottom-info">
        <text class="match-time">{{ headerInfo.matchDateTime || "0" }}</text>
      </view>
    </view>
    <!-- 吸顶Tab -->
    <scroll-view class="tab-bar-sticky" scroll-x show-scrollbar="false" :scroll-into-view="`tab-${activeTab}`" scroll-with-animation>
      <view v-for="(item, index) in tabList" :key="index" :id="`tab-${index}`" class="tab-item" :class="{ active: activeTab === index }" @tap="switchTab(index)">
        {{ item.name || "0" }}
      </view>
    </scroll-view>

    <!-- 内容滚动区 -->
    <scroll-view class="scroll-content" scroll-y :scroll-into-view="currentSection" @scroll="handleScroll" :scroll-with-animation="true">
      <!-- 特征分析 → 吸顶 + 不遮挡内容 -->
      <view id="section1" class="section feature-sticky">
        <view class="section-title">
          <view class="red-line"></view>
          特征分析
        </view>
        <view class="team-title-row">
          <view class="team-tag home">{{ featureData.homeTeamShortName || "0" }}</view>
          <view class="team-tag away">{{ featureData.awayTeamShortName || "0" }}</view>
        </view>

        <!-- 1. 近场交锋 -->
        <view class="feature-item">
          <view class="row-top">
            <view class="home-text"> {{ (featureData && featureData.last && featureData.last.homeWinGoalMatchCnt) || "0" }}胜/{{ (featureData && featureData.last && featureData.last.homeDrawMatchCnt) || "0" }}平/{{ (featureData && featureData.last && featureData.last.homeLossGoalMatchCnt) || "0" }}负 </view>
            <view class="label-text">近{{ (featureData && featureData.last && featureData.last.totalLegCnt) || "0" }}场交锋</view>
            <view class="away-text"> {{ (featureData && featureData.last && featureData.last.awayWinGoalMatchCnt) || "0" }}胜/{{ (featureData && featureData.last && featureData.last.awayDrawMatchCnt) || "0" }}平/{{ (featureData && featureData.last && featureData.last.awayLossGoalMatchCnt) || "0" }}负 </view>
          </view>
          <view class="progress-bar">
            <view class="half-left">
              <view class="bar-left" :style="{ width: ((featureData && featureData.last && featureData.last.homeScoreRatio) || 0) + '%' }"></view>
            </view>
            <view class="divider"></view>
            <view class="half-right">
              <view class="bar-right" :style="{ width: ((featureData && featureData.last && featureData.last.awayScoreRatio) || 0) + '%' }"></view>
            </view>
          </view>
        </view>

        <!-- 2. 同主客交锋 -->
        <view class="feature-item">
          <view class="row-top">
            <view class="home-text"> {{ (featureData && featureData.sameHomeAway && featureData.sameHomeAway.homeWinGoalMatchCnt) || "0" }}胜/{{ (featureData && featureData.sameHomeAway && featureData.sameHomeAway.homeDrawMatchCnt) || "0" }}平/{{ (featureData && featureData.sameHomeAway && featureData.sameHomeAway.homeLossGoalMatchCnt) || "0" }}负 </view>
            <view class="label-text">同主客交锋</view>
            <view class="away-text"> {{ (featureData && featureData.sameHomeAway && featureData.sameHomeAway.awayWinGoalMatchCnt) || "0" }}胜/{{ (featureData && featureData.sameHomeAway && featureData.sameHomeAway.awayDrawMatchCnt) || "0" }}平/{{ (featureData && featureData.sameHomeAway && featureData.sameHomeAway.awayLossGoalMatchCnt) || "0" }}负 </view>
          </view>
          <view class="progress-bar">
            <view class="half-left">
              <view class="bar-left" :style="{ width: ((featureData && featureData.sameHomeAway && featureData.sameHomeAway.homeScoreRatio) || 0) + '%' }"></view>
            </view>
            <view class="divider"></view>
            <view class="half-right">
              <view class="bar-right" :style="{ width: ((featureData && featureData.sameHomeAway && featureData.sameHomeAway.awayScoreRatio) || 0) + '%' }"></view>
            </view>
          </view>
        </view>

        <!-- 3. 近场战况 -->
        <view class="feature-item">
          <view class="row-top">
            <view class="home-text"> {{ (featureData && featureData.eachHomeAway && featureData.eachHomeAway.homeWinGoalMatchCnt) || "0" }}胜/{{ (featureData && featureData.eachHomeAway && featureData.eachHomeAway.homeDrawMatchCnt) || "0" }}平/{{ (featureData && featureData.eachHomeAway && featureData.eachHomeAway.homeLossGoalMatchCnt) || "0" }}负 </view>
            <view class="label-text">近{{ (featureData && featureData.eachHomeAway && featureData.eachHomeAway.totalLegCnt) || "0" }}场战况</view>
            <view class="away-text"> {{ (featureData && featureData.eachHomeAway && featureData.eachHomeAway.awayWinGoalMatchCnt) || "0" }}胜/{{ (featureData && featureData.eachHomeAway && featureData.eachHomeAway.awayDrawMatchCnt) || "0" }}平/{{ (featureData && featureData.eachHomeAway && featureData.eachHomeAway.awayLossGoalMatchCnt) || "0" }}负 </view>
          </view>
          <view class="progress-bar">
            <view class="half-left">
              <view class="bar-left" :style="{ width: ((featureData && featureData.eachHomeAway && featureData.eachHomeAway.homeScoreRatio) || 0) + '%' }"></view>
            </view>
            <view class="divider"></view>
            <view class="half-right">
              <view class="bar-right" :style="{ width: ((featureData && featureData.eachHomeAway && featureData.eachHomeAway.awayScoreRatio) || 0) + '%' }"></view>
            </view>
          </view>
        </view>

        <!-- 4. 同主客战况 -->
        <view class="feature-item">
          <view class="row-top">
            <view class="home-text"> {{ (featureData && featureData.eachSameHomeAway && featureData.eachSameHomeAway.homeWinGoalMatchCnt) || "0" }}胜/{{ (featureData && featureData.eachSameHomeAway && featureData.eachSameHomeAway.homeDrawMatchCnt) || "0" }}平/{{ (featureData && featureData.eachSameHomeAway && featureData.eachSameHomeAway.homeLossGoalMatchCnt) || "0" }}负 </view>
            <view class="label-text">同主客战况</view>
            <view class="away-text"> {{ (featureData && featureData.eachSameHomeAway && featureData.eachSameHomeAway.awayWinGoalMatchCnt) || "0" }}胜/{{ (featureData && featureData.eachSameHomeAway && featureData.eachSameHomeAway.awayDrawMatchCnt) || "0" }}平/{{ (featureData && featureData.eachSameHomeAway && featureData.eachSameHomeAway.awayLossGoalMatchCnt) || "0" }}负 </view>
          </view>
          <view class="progress-bar">
            <view class="half-left">
              <view class="bar-left" :style="{ width: ((featureData && featureData.eachSameHomeAway && featureData.eachSameHomeAway.homeScoreRatio) || 0) + '%' }"></view>
            </view>
            <view class="divider"></view>
            <view class="half-right">
              <view class="bar-right" :style="{ width: ((featureData && featureData.eachSameHomeAway && featureData.eachSameHomeAway.awayScoreRatio) || 0) + '%' }"></view>
            </view>
          </view>
        </view>

        <!-- 5. 场均进球 -->
        <view class="feature-item">
          <view class="row-top">
            <view class="home-text">{{ (featureData && featureData.goalAvg && featureData.goalAvg.homeGoalAvgCnt) || "0" }}个</view>
            <view class="label-text">场均进球</view>
            <view class="away-text">{{ (featureData && featureData.goalAvg && featureData.goalAvg.awayGoalAvgCnt) || "0" }}个</view>
          </view>
          <view class="progress-bar">
            <view class="half-left">
              <view class="bar-left" :style="{ width: ((featureData && featureData.goalAvg && featureData.goalAvg.homeGoalAvgCntRatio) || 0) + '%' }"></view>
            </view>
            <view class="divider"></view>
            <view class="half-right">
              <view class="bar-right" :style="{ width: ((featureData && featureData.goalAvg && featureData.goalAvg.awayGoalAvgCntRatio) || 0) + '%' }"></view>
            </view>
          </view>
        </view>

        <!-- 6. 场均失球 -->
        <view class="feature-item">
          <view class="row-top">
            <view class="home-text">{{ (featureData && featureData.lossGoalAvg && featureData.lossGoalAvg.homeLossGoalAvgCnt) || "0" }}个</view>
            <view class="label-text">场均失球</view>
            <view class="away-text">{{ (featureData && featureData.lossGoalAvg && featureData.lossGoalAvg.awayLossGoalAvgCnt) || "0" }}个</view>
          </view>
          <view class="progress-bar">
            <view class="half-left">
              <view class="bar-left" :style="{ width: ((featureData && featureData.lossGoalAvg && featureData.lossGoalAvg.homeLossGoalAvgCntRatio) || 0) + '%' }"></view>
            </view>
            <view class="divider"></view>
            <view class="half-right">
              <view class="bar-right" :style="{ width: ((featureData && featureData.lossGoalAvg && featureData.lossGoalAvg.awayLossGoalAvgCntRatio) || 0) + '%' }"></view>
            </view>
          </view>
        </view>
      </view>

      <!-- 历史交锋 -->
      <view id="section2" class="section">
        <view class="section-header">
          <view class="section-title">
            <view class="red-line"></view>
            历史交锋
          </view>
          <view class="filter-group">
            <view class="filter-btn" :class="{ active: historySameHost }" @tap="toggleHistoryFilter('host')"> 同主客 </view>
            <view class="filter-btn" :class="{ active: historySameLeague }" @tap="toggleHistoryFilter('league')"> 同赛制 </view>
            <view class="round-switch">
              <view class="switch-btn" :class="{ active: historyRound === 5 }" @tap="changeHistoryRound(5)">5场</view>
              <view class="switch-btn btn-two" :class="{ active: historyRound === 10 }" @tap="changeHistoryRound(10)">10场</view>
            </view>
          </view>
        </view>

        <view class="record-summary">
          近{{ (historyData && historyData.statistics && historyData.statistics.totalLegCnt) || "0" }}场
          <text class="team-tag-sm">{{ (historyData && historyData.statistics && historyData.statistics.teamShortName) || "0" }}</text>
          <text class="win-text">{{ (historyData && historyData.statistics && historyData.statistics.winGoalMatchCnt) || "0" }}胜({{ (historyData && historyData.statistics && historyData.statistics.winProbability) || "0" }})</text>
          | <text class="draw-text">{{ (historyData && historyData.statistics && historyData.statistics.drawMatchCnt) || "0" }}平({{ (historyData && historyData.statistics && historyData.statistics.drawProbability) || "0" }})</text> | <text class="lose-text">{{ (historyData && historyData.statistics && historyData.statistics.lossGoalMatchCnt) || "0" }}负({{ (historyData && historyData.statistics && historyData.statistics.lossProbability) || "0" }})</text>
        </view>

        <view class="table-header">
          <view class="th">赛制/日期</view>
          <view class="th">主队</view>
          <view class="th">比分</view>
          <view class="th">客队</view>
          <view class="th">总进球</view>
        </view>

        <view class="record-list">
          <view class="record-item" v-for="(item, idx) in ((historyData && historyData.matchList) || []).slice(0, historyRound)" :key="idx">
            <view class="td date-col">
              {{ item.tournamentShortName || "0" }}<br />
              {{ item.matchDate || "0" }}
            </view>
            <view class="td team-col">{{ item.homeTeamShortName || "0" }}</view>
            <view class="td score-col">
              <view class="score">{{ item.fullCourtGoal || "0" }}</view>
              <view class="half-score">半({{ item.halfTimeGoal || "0" }})</view>
            </view>
            <view class="td team-col">{{ item.awayTeamShortName || "0" }}</view>
            <view class="td goal-col">{{ item.totalTeamFullCourtGoalCnt || "0" }}</view>
          </view>
        </view>
      </view>

      <!-- 积分榜 -->
      <view id="section3" class="section rank">
        <view class="section-title-wrap">
          <view class="section-title">
            <view class="red-line"></view>
            积分榜 <text class="extra-text">{{ tablesData.leagueShortName || "0" }} {{ tablesData.seasonName || "0" }}</text>
          </view>
        </view>

        <!-- 无数据时显示 -->
        <view class="no-data-block" v-if="Object.keys(tablesData.homeTables || {}).length === 0 && Object.keys(tablesData.awayTables || {}).length === 0">
          <view class="no-data-txt">暂无积分榜数据</view>
        </view>

        <!-- 有数据时正常显示 -->
        <block v-else>
          <!-- 主队积分榜卡片 -->
          <view class="rank-card">
            <view class="card-header">
              <view class="team-name-tag">{{ (tablesData && tablesData.homeTables && tablesData.homeTables.home && tablesData.homeTables.home.teamShortName) || "0" }}</view>
              <view class="group-rank">{{ (tablesData && tablesData.homeTables && tablesData.homeTables.total && tablesData.homeTables.total.groupName) || "0" }} 第{{ (tablesData && tablesData.homeTables && tablesData.homeTables.total && tablesData.homeTables.total.ranking) || "0" }}名</view>
              <view class="more-btn" @tap="handleClickShowMore(tablesData)">查看更多></view>
            </view>

            <view class="table-header">
              <view class="th"></view>
              <view class="th">场次</view>
              <view class="th">胜/平/负</view>
              <view class="th">胜率</view>
              <view class="th">进球/失球</view>
              <view class="th">净进球</view>
              <view class="th">积分</view>
              <view class="th">排名</view>
            </view>

            <view class="table-row">
              <view class="td type-col">总</view>
              <view class="td">{{ (tablesData && tablesData.homeTables && tablesData.homeTables.total && tablesData.homeTables.total.totalLegCnt) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.homeTables && tablesData.homeTables.total && tablesData.homeTables.total.winGoalMatchCnt) || "0" }}/{{ (tablesData && tablesData.homeTables && tablesData.homeTables.total && tablesData.homeTables.total.drawMatchCnt) || "0" }}/{{ (tablesData && tablesData.homeTables && tablesData.homeTables.total && tablesData.homeTables.total.lossGoalMatchCnt) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.homeTables && tablesData.homeTables.total && tablesData.homeTables.total.winProbability) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.homeTables && tablesData.homeTables.total && tablesData.homeTables.total.goalCnt) || "0" }}/{{ (tablesData && tablesData.homeTables && tablesData.homeTables.total && tablesData.homeTables.total.lossGoalCnt) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.homeTables && tablesData.homeTables.total && tablesData.homeTables.total.netGoal) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.homeTables && tablesData.homeTables.total && tablesData.homeTables.total.points) || "0" }}</view>
              <view class="td red">{{ (tablesData && tablesData.homeTables && tablesData.homeTables.total && tablesData.homeTables.total.ranking) || "0" }}</view>
            </view>
            <view class="table-row">
              <view class="td type-col">主</view>
              <view class="td">{{ (tablesData && tablesData.homeTables && tablesData.homeTables.home && tablesData.homeTables.home.totalLegCnt) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.homeTables && tablesData.homeTables.home && tablesData.homeTables.home.winGoalMatchCnt) || "0" }}/{{ (tablesData && tablesData.homeTables && tablesData.homeTables.home && tablesData.homeTables.home.drawMatchCnt) || "0" }}/{{ (tablesData && tablesData.homeTables && tablesData.homeTables.home && tablesData.homeTables.home.lossGoalMatchCnt) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.homeTables && tablesData.homeTables.home && tablesData.homeTables.home.winProbability) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.homeTables && tablesData.homeTables.home && tablesData.homeTables.home.goalCnt) || "0" }}/{{ (tablesData && tablesData.homeTables && tablesData.homeTables.home && tablesData.homeTables.home.lossGoalCnt) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.homeTables && tablesData.homeTables.home && tablesData.homeTables.home.netGoal) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.homeTables && tablesData.homeTables.home && tablesData.homeTables.home.points) || "0" }}</view>
              <view class="td red">{{ (tablesData && tablesData.homeTables && tablesData.homeTables.home && tablesData.homeTables.home.ranking) || "0" }}</view>
            </view>
            <view class="table-row">
              <view class="td type-col">客</view>
              <view class="td">{{ (tablesData && tablesData.homeTables && tablesData.homeTables.away && tablesData.homeTables.away.totalLegCnt) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.homeTables && tablesData.homeTables.away && tablesData.homeTables.away.winGoalMatchCnt) || "0" }}/{{ (tablesData && tablesData.homeTables && tablesData.homeTables.away && tablesData.homeTables.away.drawMatchCnt) || "0" }}/{{ (tablesData && tablesData.homeTables && tablesData.homeTables.away && tablesData.homeTables.away.lossGoalMatchCnt) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.homeTables && tablesData.homeTables.away && tablesData.homeTables.away.winProbability) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.homeTables && tablesData.homeTables.away && tablesData.homeTables.away.goalCnt) || "0" }}/{{ (tablesData && tablesData.homeTables && tablesData.homeTables.away && tablesData.homeTables.away.lossGoalCnt) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.homeTables && tablesData.homeTables.away && tablesData.homeTables.away.netGoal) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.homeTables && tablesData.homeTables.away && tablesData.homeTables.away.points) || "0" }}</view>
              <view class="td red">{{ (tablesData && tablesData.homeTables && tablesData.homeTables.away && tablesData.homeTables.away.ranking) || "0" }}</view>
            </view>
          </view>

          <!-- 客队积分榜卡片 -->
          <view class="rank-card">
            <view class="card-header">
              <view class="team-name-tag">{{ (tablesData && tablesData.awayTables && tablesData.awayTables.away && tablesData.awayTables.away.teamShortName) || "0" }}</view>
              <view class="group-rank">{{ (tablesData && tablesData.awayTables && tablesData.awayTables.total && tablesData.awayTables.total.groupName) || "0" }} 第{{ (tablesData && tablesData.awayTables && tablesData.awayTables.total && tablesData.awayTables.total.ranking) || "0" }}名</view>
              <view class="more-btn" @tap="handleClickShowMore(tablesData)">查看更多></view>
            </view>

            <view class="table-header">
              <view class="th"></view>
              <view class="th">场次</view>
              <view class="th">胜/平/负</view>
              <view class="th">胜率</view>
              <view class="th">进球/失球</view>
              <view class="th">净进球</view>
              <view class="th">积分</view>
              <view class="th">排名</view>
            </view>

            <view class="table-row">
              <view class="td type-col">总</view>
              <view class="td">{{ (tablesData && tablesData.awayTables && tablesData.awayTables.total && tablesData.awayTables.total.totalLegCnt) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.awayTables && tablesData.awayTables.total && tablesData.awayTables.total.winGoalMatchCnt) || "0" }}/{{ (tablesData && tablesData.awayTables && tablesData.awayTables.total && tablesData.awayTables.total.drawMatchCnt) || "0" }}/{{ (tablesData && tablesData.awayTables && tablesData.awayTables.total && tablesData.awayTables.total.lossGoalMatchCnt) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.awayTables && tablesData.awayTables.total && tablesData.awayTables.total.winProbability) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.awayTables && tablesData.awayTables.total && tablesData.awayTables.total.goalCnt) || "0" }}/{{ (tablesData && tablesData.awayTables && tablesData.awayTables.total && tablesData.awayTables.total.lossGoalCnt) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.awayTables && tablesData.awayTables.total && tablesData.awayTables.total.netGoal) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.awayTables && tablesData.awayTables.total && tablesData.awayTables.total.points) || "0" }}</view>
              <view class="td red">{{ (tablesData && tablesData.awayTables && tablesData.awayTables.total && tablesData.awayTables.total.ranking) || "0" }}</view>
            </view>
            <view class="table-row">
              <view class="td type-col">主</view>
              <view class="td">{{ (tablesData && tablesData.awayTables && tablesData.awayTables.home && tablesData.awayTables.home.totalLegCnt) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.awayTables && tablesData.awayTables.home && tablesData.awayTables.home.winGoalMatchCnt) || "0" }}/{{ (tablesData && tablesData.awayTables && tablesData.awayTables.home && tablesData.awayTables.home.drawMatchCnt) || "0" }}/{{ (tablesData && tablesData.awayTables && tablesData.awayTables.home && tablesData.awayTables.home.lossGoalMatchCnt) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.awayTables && tablesData.awayTables.home && tablesData.awayTables.home.winProbability) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.awayTables && tablesData.awayTables.home && tablesData.awayTables.home.goalCnt) || "0" }}/{{ (tablesData && tablesData.awayTables && tablesData.awayTables.home && tablesData.awayTables.home.lossGoalCnt) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.awayTables && tablesData.awayTables.home && tablesData.awayTables.home.netGoal) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.awayTables && tablesData.awayTables.home && tablesData.awayTables.home.points) || "0" }}</view>
              <view class="td red">{{ (tablesData && tablesData.awayTables && tablesData.awayTables.home && tablesData.awayTables.home.ranking) || "0" }}</view>
            </view>
            <view class="table-row">
              <view class="td type-col">客</view>
              <view class="td">{{ (tablesData && tablesData.awayTables && tablesData.awayTables.away && tablesData.awayTables.away.totalLegCnt) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.awayTables && tablesData.awayTables.away && tablesData.awayTables.away.winGoalMatchCnt) || "0" }}/{{ (tablesData && tablesData.awayTables && tablesData.awayTables.away && tablesData.awayTables.away.drawMatchCnt) || "0" }}/{{ (tablesData && tablesData.awayTables && tablesData.awayTables.away && tablesData.awayTables.away.lossGoalMatchCnt) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.awayTables && tablesData.awayTables.away && tablesData.awayTables.away.winProbability) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.awayTables && tablesData.awayTables.away && tablesData.awayTables.away.goalCnt) || "0" }}/{{ (tablesData && tablesData.awayTables && tablesData.awayTables.away && tablesData.awayTables.away.lossGoalCnt) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.awayTables && tablesData.awayTables.away && tablesData.awayTables.away.netGoal) || "0" }}</view>
              <view class="td">{{ (tablesData && tablesData.awayTables && tablesData.awayTables.away && tablesData.awayTables.away.points) || "0" }}</view>
              <view class="td red">{{ (tablesData && tablesData.awayTables && tablesData.awayTables.away && tablesData.awayTables.away.ranking) || "0" }}</view>
            </view>
          </view>
        </block>
      </view>

      <!-- 比赛近况 -->
      <view id="section4" class="section">
        <view class="section-header">
          <view class="section-title">
            <view class="red-line"></view>
            比赛近况
          </view>
          <view class="filter-group">
            <view class="filter-btn" :class="{ active: matchSameHost }" @tap="toggleMatchFilter('host')"> 同主客 </view>
            <view class="filter-btn" :class="{ active: matchSameLeague }" @tap="toggleMatchFilter('league')"> 同赛制 </view>
            <view class="round-switch">
              <view class="switch-btn" :class="{ active: matchRound === 5 }" @tap="changeMatchRound(5)">5场</view>
              <view class="switch-btn btn-two" :class="{ active: matchRound === 10 }" @tap="changeMatchRound(10)">10场</view>
            </view>
          </view>
        </view>

        <view class="team-status">
          <view class="record-summary">
            <text class="team-tag-sm">{{ (recentData && recentData.home && recentData.home.statistics && recentData.home.statistics.teamShortName) || "0" }}</text>
            近{{ matchRound || "0" }}场
            <text class="win-text">{{ (recentData && recentData.home && recentData.home.statistics && recentData.home.statistics.winGoalMatchCnt) || "0" }}胜({{ (recentData && recentData.home && recentData.home.statistics && recentData.home.statistics.winProbability) || "0" }})</text>
            | <text class="draw-text">{{ (recentData && recentData.home && recentData.home.statistics && recentData.home.statistics.drawMatchCnt) || "0" }}平({{ (recentData && recentData.home && recentData.home.statistics && recentData.home.statistics.drawProbability) || "0" }})</text> |
            <text class="lose-text">{{ (recentData && recentData.home && recentData.home.statistics && recentData.home.statistics.lossGoalMatchCnt) || "0" }}负({{ (recentData && recentData.home && recentData.home.statistics && recentData.home.statistics.lossProbability) || "0" }})</text>
          </view>
          <view class="stat-text"> 进{{ (recentData && recentData.home && recentData.home.statistics && recentData.home.statistics.goalCnt) || "0" }}球，失{{ (recentData && recentData.home && recentData.home.statistics && recentData.home.statistics.lossGoalCnt) || "0" }}球，净进{{ (recentData && recentData.home && recentData.home.statistics && recentData.home.statistics.netGoal) || "0" }}球 </view>
          <view class="table-header">
            <view class="th">赛制/日期</view>
            <view class="th">主队</view>
            <view class="th">VS</view>
            <view class="th">客队</view>
            <view class="th">本队赛果</view>
          </view>
          <view class="match-list">
            <view class="match-item" v-for="(item, idx) in ((recentData && recentData.home && recentData.home.matchList) || []).slice(0, matchRound)" :key="idx">
              <view class="td date-col">{{ item.tournamentShortName || "0" }}<br />{{ item.matchDate || "0" }}</view>
              <view class="td team-col">{{ item.homeTeamShortName || "0" }}</view>
              <view class="td score-col">
                <view class="score">{{ item.fullCourtGoal || "0" }}</view>
                <view class="half-score">半({{ item.halfTimeGoal || "0" }})</view>
              </view>
              <view class="td team-col">{{ item.awayTeamShortName || "0" }}</view>
              <view class="td result-col">
                <view
                  class="result-tag"
                  :class="{
                    win: item.teamMatchResult === 'home',
                    draw: item.teamMatchResult === 'draw',
                    lose: item.teamMatchResult === 'away',
                  }"
                >
                  {{ item.teamMatchResult === "home" ? "胜" : item.teamMatchResult === "draw" ? "平" : "负" }}
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="team-status">
          <view class="record-summary">
            <text class="team-tag-sm">{{ (recentData && recentData.away && recentData.away.statistics && recentData.away.statistics.teamShortName) || "0" }}</text>
            近{{ matchRound || "0" }}场
            <text class="win-text">{{ (recentData && recentData.away && recentData.away.statistics && recentData.away.statistics.winGoalMatchCnt) || "0" }}胜({{ (recentData && recentData.away && recentData.away.statistics && recentData.away.statistics.winProbability) || "0" }})</text>
            | <text class="draw-text">{{ (recentData && recentData.away && recentData.away.statistics && recentData.away.statistics.drawMatchCnt) || "0" }}平({{ (recentData && recentData.away && recentData.away.statistics && recentData.away.statistics.drawProbability) || "0" }})</text> |
            <text class="lose-text">{{ (recentData && recentData.away && recentData.away.statistics && recentData.away.statistics.lossGoalMatchCnt) || "0" }}负({{ (recentData && recentData.away && recentData.away.statistics && recentData.away.statistics.lossProbability) || "0" }})</text>
          </view>
          <view class="stat-text"> 进{{ (recentData && recentData.away && recentData.away.statistics && recentData.away.statistics.goalCnt) || "0" }}球，失{{ (recentData && recentData.away && recentData.away.statistics && recentData.away.statistics.lossGoalCnt) || "0" }}球，净进{{ (recentData && recentData.away && recentData.away.statistics && recentData.away.statistics.netGoal) || "0" }}球 </view>
          <view class="table-header">
            <view class="th">赛制/日期</view>
            <view class="th">主队</view>
            <view class="th">VS</view>
            <view class="th">客队</view>
            <view class="th">本队赛果</view>
          </view>
          <view class="match-list">
            <view class="match-item" v-for="(item, idx) in ((recentData && recentData.away && recentData.away.matchList) || []).slice(0, matchRound)" :key="idx">
              <view class="td date-col">{{ item.tournamentShortName || "0" }}<br />{{ item.matchDate || "0" }}</view>
              <view class="td team-col">{{ item.homeTeamShortName || "0" }}</view>
              <view class="td score-col">
                <view class="score">{{ item.fullCourtGoal || "0" }}</view>
                <view class="half-score">半({{ item.halfTimeGoal || "0" }})</view>
              </view>
              <view class="td team-col">{{ item.awayTeamShortName || "0" }}</view>
              <view class="td result-col">
                <view
                  class="result-tag"
                  :class="{
                    win: item.teamMatchResult === 'home',
                    draw: item.teamMatchResult === 'draw',
                    lose: item.teamMatchResult === 'away',
                  }"
                >
                  {{ item.teamMatchResult === "home" ? "胜" : item.teamMatchResult === "draw" ? "平" : "负" }}
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 未来赛事 -->
      <view id="section5" class="section">
        <view class="section-title">
          <view class="red-line"></view>
          未来赛事
        </view>

        <!-- 主队 -->
        <view class="team-status">
          <view class="record-summary">
            <text class="team-tag-sm">{{ (futureData && futureData.home && futureData.home.teamShortName) || "0" }}</text>
          </view>

          <view class="table-header">
            <view class="th">比赛日期</view>
            <view class="th">赛制</view>
            <view class="th">主队</view>
            <view class="th">VS</view>
            <view class="th">客队</view>
            <view class="th">轮次</view>
          </view>

          <view class="match-list">
            <view class="match-item" v-for="(item, idx) in (futureData && futureData.home && futureData.home.matchList) || []" :key="idx">
              <view class="td date-col">{{ (item.matchDateTime || "0").split(" ")[0] || "0" }}</view>
              <view class="td league-col">{{ item.tournamentShortName || "0" }}</view>
              <view class="td team-col">{{ item.homeTeamShortName || "0" }}</view>
              <view class="td vs-col">VS</view>
              <view class="td team-col">{{ item.awayTeamShortName || "0" }}</view>
              <view class="td round-col"> {{ item.phaseName || "0" }} 第{{ item.gameweek || "0" }}轮 </view>
            </view>
          </view>
        </view>

        <!-- 客队 -->
        <view class="team-status">
          <view class="record-summary">
            <text class="team-tag-sm">{{ (futureData && futureData.away && futureData.away.teamShortName) || "0" }}</text>
          </view>

          <view class="table-header">
            <view class="th">比赛日期</view>
            <view class="th">赛制</view>
            <view class="th">主队</view>
            <view class="th">VS</view>
            <view class="th">客队</view>
            <view class="th">轮次</view>
          </view>

          <view class="match-list">
            <view class="match-item" v-for="(item, idx) in (futureData && futureData.away && futureData.away.matchList) || []" :key="idx">
              <view class="td date-col">{{ (item.matchDateTime || "0").split(" ")[0] || "0" }}</view>
              <view class="td league-col">{{ item.tournamentShortName || "0" }}</view>
              <view class="td team-col">{{ item.homeTeamShortName || "0" }}</view>
              <view class="td vs-col">VS</view>
              <view class="td team-col">{{ item.awayTeamShortName || "0" }}</view>
              <view class="td round-col"> {{ item.phaseName || "0" }} 第{{ item.gameweek || "0" }}轮 </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 射手信息 -->
      <view id="section6" class="section">
        <view class="section-title">
          <view class="red-line"></view>
          射手信息 <text class="extra-text">{{ shooterData.tournamentShortName || "0" }} {{ shooterData.seasonName || "0" }}</text>
        </view>
        <view class="player-group">
          <view class="team-tag-sm">{{ (shooterData && shooterData.home && shooterData.home.teamShortName) || "0" }}</view>
          <scroll-view class="player-scroll" scroll-x show-scrollbar="false">
            <view class="player-card" v-for="(item, idx) in (shooterData && shooterData.home && shooterData.home.playerList) || []" :key="idx">
              <view class="ribbon-wrap" v-if="item.rank === 1">
                <view class="ribbon no1">NO.1</view>
              </view>
              <view class="ribbon-wrap" v-else-if="item.rank === 2">
                <view class="ribbon no2">NO.2</view>
              </view>
              <view class="player-info-wrap">
                <view class="player-avatar">
                  <view class="number">{{ item.uniformNo || "0" }}</view>
                </view>
                <view class="player-text">
                  <view class="player-name">{{ item.personName || "0" }}</view>
                  <view class="player-position">{{ item.playerPositionDesc || "0" }}</view>
                </view>
              </view>
              <view class="stat-row top">
                <view class="stat-item">
                  <view class="stat-label">总场</view>
                  <view class="stat-value">{{ item.appearanceCnt || "0" }}</view>
                </view>
                <view class="stat-item">
                  <view class="stat-label">首发</view>
                  <view class="stat-value">{{ item.startedMatchCnt || "0" }}</view>
                </view>
                <view class="stat-item">
                  <view class="stat-label">替补</view>
                  <view class="stat-value">{{ item.substituteMatchCnt || "0" }}</view>
                </view>
              </view>
              <view class="stat-line">
                <text class="line-label">进球/占本队</text>
                <text class="line-value">{{ item.goalCnt || "0" }}/{{ item.goalProbability || "0" }}</text>
              </view>
              <view class="stat-line">
                <text class="line-label">助攻/占本队</text>
                <text class="line-value">{{ item.assistCnt || "0" }}/{{ item.assistProbability || "0" }}</text>
              </view>
              <view class="stat-line">
                <text class="line-label">场均进球</text>
                <text class="line-value">{{ item.goalAvgCnt || "0" }}</text>
              </view>
              <view class="stat-line">
                <text class="line-label">场均助攻</text>
                <text class="line-value">{{ item.assistAvgCnt || "0" }}</text>
              </view>
            </view>
            <view class="no-data-card" v-if="((shooterData && shooterData.home && shooterData.home.playerList) || []).length === 0">暂无射手</view>
          </scroll-view>
        </view>
        <view class="player-group">
          <view class="team-tag-sm">{{ (shooterData && shooterData.away && shooterData.away.teamShortName) || "0" }}</view>
          <scroll-view class="player-scroll" scroll-x show-scrollbar="false">
            <view class="player-card" v-for="(item, idx) in (shooterData && shooterData.away && shooterData.away.playerList) || []" :key="idx">
              <view class="ribbon-wrap" v-if="item.rank === 1">
                <view class="ribbon no1">NO.1</view>
              </view>
              <view class="ribbon-wrap" v-else-if="item.rank === 2">
                <view class="ribbon no2">NO.2</view>
              </view>
              <view class="player-info-wrap">
                <view class="player-avatar">
                  <view class="number">{{ item.uniformNo || "0" }}</view>
                </view>
                <view class="player-text">
                  <view class="player-name">{{ item.personName || "0" }}</view>
                  <view class="player-position">{{ item.playerPositionDesc || "0" }}</view>
                </view>
              </view>
              <view class="stat-row top">
                <view class="stat-item">
                  <view class="stat-label">总场</view>
                  <view class="stat-value">{{ item.appearanceCnt || "0" }}</view>
                </view>
                <view class="stat-item">
                  <view class="stat-label">首发</view>
                  <view class="stat-value">{{ item.startedMatchCnt || "0" }}</view>
                </view>
                <view class="stat-item">
                  <view class="stat-label">替补</view>
                  <view class="stat-value">{{ item.substituteMatchCnt || "0" }}</view>
                </view>
              </view>
              <view class="stat-line">
                <text class="line-label">进球/占本队</text>
                <text class="line-value">{{ item.goalCnt || "0" }}/{{ item.goalProbability || "0" }}</text>
              </view>
              <view class="stat-line">
                <text class="line-label">助攻/占本队</text>
                <text class="line-value">{{ item.assistCnt || "0" }}/{{ item.assistProbability || "0" }}</text>
              </view>
              <view class="stat-line">
                <text class="line-label">场均进球</text>
                <text class="line-value">{{ item.goalAvgCnt || "0" }}</text>
              </view>
              <view class="stat-line">
                <text class="line-label">场均助攻</text>
                <text class="line-value">{{ item.assistAvgCnt || "0" }}</text>
              </view>
            </view>
            <view class="no-data-card" v-if="((shooterData && shooterData.away && shooterData.away.playerList) || []).length === 0">暂无射手</view>
          </scroll-view>
        </view>
      </view>

      <!-- 伤停一览 -->
      <view id="section7" class="section">
        <view class="section-title">
          <view class="red-line"></view>
          伤停一览
        </view>
        <view class="player-group">
          <view class="team-tag-sm">{{ (injuryData && injuryData.home && injuryData.home.teamShortName) || "0" }}</view>
          <scroll-view class="player-scroll" scroll-x show-scrollbar="false">
            <view class="injury-card" v-for="(item, idx) in (injuryData && injuryData.home && injuryData.home.injuriesAndSuspensionsList) || []" :key="idx">
              <view class="player-info-wrap">
                <view class="player-avatar">
                  <view class="number">{{ item.uniformNo || "0" }}</view>
                  <view class="injury-tag">伤</view>
                </view>
                <view class="player-text">
                  <view class="player-name">{{ item.personName || "0" }}</view>
                  <view class="player-position">{{ item.playerPositionDesc || "0" }}</view>
                </view>
              </view>
              <view class="player-stats">
                <view class="stat-row">
                  <view class="stat-item">总场</view>
                  <view class="stat-item">首发</view>
                  <view class="stat-item">替补</view>
                </view>
                <view class="stat-value">
                  <view class="stat-item">{{ item.appearanceCnt || "0" }}</view>
                  <view class="stat-item">{{ item.startedMatchCnt || "0" }}</view>
                  <view class="stat-item">{{ item.substituteMatchCnt || "0" }}</view>
                </view>
              </view>
            </view>
            <view class="no-data-card" v-if="((injuryData && injuryData.home && injuryData.home.injuriesAndSuspensionsList) || []).length === 0">暂无伤停</view>
          </scroll-view>
        </view>
        <view class="player-group" style="margin-bottom: 40rpx;">
          <view class="team-tag-sm">{{ (injuryData && injuryData.away && injuryData.away.teamShortName) || "0" }}</view>
          <scroll-view class="player-scroll" scroll-x show-scrollbar="false">
            <view class="injury-card" v-for="(item, idx) in (injuryData && injuryData.away && injuryData.away.injuriesAndSuspensionsList) || []" :key="idx">
              <view class="player-info-wrap">
                <view class="player-avatar">
                  <view class="number">{{ item.uniformNo || "0" }}</view>
                  <view class="injury-tag">伤</view>
                </view>
                <view class="player-text">
                  <view class="player-name">{{ item.personName || "0" }}</view>
                  <view class="player-position">{{ item.playerPositionDesc || "0" }}</view>
                </view>
              </view>
              <view class="player-stats">
                <view class="stat-row">
                  <view class="stat-item">总场</view>
                  <view class="stat-item">首发</view>
                  <view class="stat-item">替补</view>
                </view>
                <view class="stat-value">
                  <view class="stat-item">{{ item.appearanceCnt || "0" }}</view>
                  <view class="stat-item">{{ item.startedMatchCnt || "0" }}</view>
                  <view class="stat-item">{{ item.substituteMatchCnt || "0" }}</view>
                </view>
              </view>
            </view>
            <view class="no-data-card" v-if="((injuryData && injuryData.away && injuryData.away.injuriesAndSuspensionsList) || []).length === 0">暂无伤停</view>
          </scroll-view>
        </view>
      </view>
    </scroll-view>

    <!-- 积分榜弹窗 -->
    <view class="modal-mask" v-if="showRankModal" @tap="showRankModal = false">
      <view class="modal-content" @tap.stop>
        <view class="modal-title"> Group Stage {{ (tablesModalData && tablesModalData.homeTables && tablesModalData.homeTables[modalRankTab] && tablesModalData.homeTables[modalRankTab].groupName) || "0" }}排名 </view>
        <scroll-view class="modal-scroll" scroll-y>
          <view class="table-header">
            <view class="th">排名</view>
            <view class="th">球队</view>
            <view class="th">场次</view>
            <view class="th">胜/平/负</view>
            <view class="th">胜率</view>
            <view class="th">进球/失球</view>
            <view class="th">积分</view>
          </view>

          <!-- 主队数据 -->
          <view class="rank-item">
            <view class="td">{{ (tablesModalData && tablesModalData.homeTables && tablesModalData.homeTables[modalRankTab] && tablesModalData.homeTables[modalRankTab].ranking) || "0" }}</view>
            <view class="td">{{ (tablesModalData && tablesModalData.homeTables && tablesModalData.homeTables[modalRankTab] && tablesModalData.homeTables[modalRankTab].teamShortName) || "0" }}</view>
            <view class="td">{{ (tablesModalData && tablesModalData.homeTables && tablesModalData.homeTables[modalRankTab] && tablesModalData.homeTables[modalRankTab].totalLegCnt) || "0" }}</view>
            <view class="td"
              >{{ (tablesModalData && tablesModalData.homeTables && tablesModalData.homeTables[modalRankTab] && tablesModalData.homeTables[modalRankTab].winGoalMatchCnt) || "0" }}/{{ (tablesModalData && tablesModalData.homeTables && tablesModalData.homeTables[modalRankTab] && tablesModalData.homeTables[modalRankTab].drawMatchCnt) || "0" }}/{{ (tablesModalData && tablesModalData.homeTables && tablesModalData.homeTables[modalRankTab] && tablesModalData.homeTables[modalRankTab].lossGoalMatchCnt) || "0" }}</view
            >
            <view class="td">{{ (tablesModalData && tablesModalData.homeTables && tablesModalData.homeTables[modalRankTab] && tablesModalData.homeTables[modalRankTab].winProbability) || "0" }}</view>
            <view class="td">{{ (tablesModalData && tablesModalData.homeTables && tablesModalData.homeTables[modalRankTab] && tablesModalData.homeTables[modalRankTab].goalCnt) || "0" }}/{{ (tablesModalData && tablesModalData.homeTables && tablesModalData.homeTables[modalRankTab] && tablesModalData.homeTables[modalRankTab].lossGoalCnt) || "0" }}</view>
            <view class="td">{{ (tablesModalData && tablesModalData.homeTables && tablesModalData.homeTables[modalRankTab] && tablesModalData.homeTables[modalRankTab].points) || "0" }}</view>
          </view>

          <!-- 客队数据 -->
          <view class="rank-item">
            <view class="td">{{ (tablesModalData && tablesModalData.awayTables && tablesModalData.awayTables[modalRankTab] && tablesModalData.awayTables[modalRankTab].ranking) || "0" }}</view>
            <view class="td">{{ (tablesModalData && tablesModalData.awayTables && tablesModalData.awayTables[modalRankTab] && tablesModalData.awayTables[modalRankTab].teamShortName) || "0" }}</view>
            <view class="td">{{ (tablesModalData && tablesModalData.awayTables && tablesModalData.awayTables[modalRankTab] && tablesModalData.awayTables[modalRankTab].totalLegCnt) || "0" }}</view>
            <view class="td"
              >{{ (tablesModalData && tablesModalData.awayTables && tablesModalData.awayTables[modalRankTab] && tablesModalData.awayTables[modalRankTab].winGoalMatchCnt) || "0" }}/{{ (tablesModalData && tablesModalData.awayTables && tablesModalData.awayTables[modalRankTab] && tablesModalData.awayTables[modalRankTab].drawMatchCnt) || "0" }}/{{ (tablesModalData && tablesModalData.awayTables && tablesModalData.awayTables[modalRankTab] && tablesModalData.awayTables[modalRankTab].lossGoalMatchCnt) || "0" }}</view
            >
            <view class="td">{{ (tablesModalData && tablesModalData.awayTables && tablesModalData.awayTables[modalRankTab] && tablesModalData.awayTables[modalRankTab].winProbability) || "0" }}</view>
            <view class="td">{{ (tablesModalData && tablesModalData.awayTables && tablesModalData.awayTables[modalRankTab] && tablesModalData.awayTables[modalRankTab].goalCnt) || "0" }}/{{ (tablesModalData && tablesModalData.awayTables && tablesModalData.awayTables[modalRankTab] && tablesModalData.awayTables[modalRankTab].lossGoalCnt) || "0" }}</view>
            <view class="td">{{ (tablesModalData && tablesModalData.awayTables && tablesModalData.awayTables[modalRankTab] && tablesModalData.awayTables[modalRankTab].points) || "0" }}</view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import CustomHeader from "@/components/CustomHeader.vue";
import { purchasingFootballInfo, purchasingFootballPoints } from "@/api/demo";
export default {
  components: {
    CustomHeader,
  },
  data() {
    return {
      //头部
      headerInfo: {},
      //
      featureData: {},
      //积分
      tablesData: {},
      //积分弹框数据
      tablesModalData: {},
      // 接口固定参数
      matchId: 2499430,
      // 历史交锋数据（你给的原样）
      historyData: {},
      // ========== 历史交锋筛选开关 ==========
      historySameHost: false, // 同主客
      historySameLeague: false, // 同赛制
      historyRound: 5, // 展示场次

      // ========== 比赛近况筛选开关 ==========
      matchSameHost: false, // 同主客
      matchSameLeague: false, // 同赛制
      matchRound: 10, // 展示场次
      recentData: {},
      // 2. 特征分析 dataType: feature
      rankTab: "total",
      modalRankTab: "total",
      // 12. 未来赛事 dataType: future
      futureData: {},
      // 13. 射手信息 dataType: player
      shooterData: {},
      // 14. 伤病一览 dataType: injurySuspension
      injuryData: {},

      // 页面原有基础字段
      activeTab: 0,
      tabList: [
        { name: "特征分析", id: "section1" },
        { name: "历史交锋", id: "section2" },
        { name: "积分榜", id: "section3" },
        { name: "比赛近况", id: "section4" },
        { name: "未来赛事", id: "section5" },
        { name: "射手信息", id: "section6" },
        { name: "伤停一览", id: "section7" },
      ],
      currentSection: "section1",
      sectionTopList: [],
      historyFilterIndex: 0,
      showRankModal: false,
      rankList: [],

      // 比赛近况筛选
      matchFilters: [
        { name: "同主客", type: "sameHost" },
        { name: "同赛制", type: "sameLeague" },
      ],
      matchFilterIndex: 0,
      matchRound: 5,
    };
  },
  computed: {
    homeRankData() {
      return this.tablesData.homeTables || {};
    },
    awayRankData() {
      return this.tablesData.awayTables || {};
    },
  },
  onLoad(options) {
    this.matchId = options.id;
    this.getAllMatchData();
  },

  onReady() {
    // 先获取一次位置
    this.getSectionTop();
  },

  methods: {
    async handleClickShowMore(item) {
      await uni.navigateTo({
        url: `/pages/test/tabsAll?seasonId=${item.seasonId}&uniformLeagueId=${item.uniformLeagueId}`,
      });
    },

    // 历史交锋 - 切换同主客/同赛制
    async toggleHistoryFilter(type) {
      if (type === "host") {
        this.historySameHost = !this.historySameHost;
      } else if (type === "league") {
        this.historySameLeague = !this.historySameLeague;
      }
      await this.refreshHistoryData();
    },
    // 历史交锋 - 切换5场/10场
    async changeHistoryRound(num) {
      if (this.historyRound === num) return;
      this.historyRound = num;
      await this.refreshHistoryData();
    },
    // 历史交锋 - 根据筛选条件请求接口并刷新列表
    async refreshHistoryData() {
      const { historySameHost, historySameLeague, historyRound } = this;
      if (!historySameHost && !historySameLeague) {
        await this.getHistoryAllAll();
      } else if (!historySameHost && historySameLeague) {
        await this.getHistorySameAll();
      } else if (historySameHost && !historySameLeague) {
        await this.getHistoryAllSame();
      } else {
        await this.getHistorySameSame();
      }
      // 数据更新后，重新获取区块位置
      this.$nextTick(() => {
        this.getSectionTop();
      });
    },

    // 比赛近况 - 切换同主客/同赛制
    async toggleMatchFilter(type) {
      if (type === "host") {
        this.matchSameHost = !this.matchSameHost;
      } else if (type === "league") {
        this.matchSameLeague = !this.matchSameLeague;
      }
      await this.refreshMatchData();
    },
    // 比赛近况 - 切换5场/10场
    async changeMatchRound(num) {
      if (this.matchRound === num) return;
      this.matchRound = num;
      await this.refreshMatchData();
    },
    // 比赛近况 - 根据筛选条件请求接口刷新
    async refreshMatchData() {
      const { matchSameHost, matchSameLeague, matchRound } = this;
      if (!matchSameHost && !matchSameLeague) {
        await this.getResultAllAll();
      } else if (!matchSameHost && matchSameLeague) {
        await this.getResultSameAll();
      } else if (matchSameHost && !matchSameLeague) {
        await this.getResultAllSame();
      } else {
        await this.getResultSameSame();
      }
      // 数据更新后，重新获取区块位置
      this.$nextTick(() => {
        this.getSectionTop();
      });
    },

    // 统一入口：一次性请求所有接口
    async getAllMatchData() {
      await this.getHeadData("head");
      await this.getHeadData("predictor");
      await this.getFeatureData();
      await this.getHistoryAllAll();
      await this.getResultAllAll();
      await this.getTablesData();
      await this.getFutureData();
      await this.getPlayerData();
      await this.getInjuryData();

      // 所有数据加载完成后，强制刷新区块位置
      this.$nextTick(() => {
        this.getSectionTop();
      });
    },

    // 1. 头部信息
    async getHeadData(param) {
      try {
        const res = await purchasingFootballInfo({
          matchId: this.matchId,
          dataType: param,
        });
        const data = res.data || {};
        this.headerInfo = { ...this.headerInfo, ...data };
      } catch (e) {}
    },
    // 2. 特征分析
    async getFeatureData() {
      try {
        const res = await purchasingFootballInfo({
          matchId: this.matchId,
          dataType: "feature",
        });
        this.featureData = res.data || {};
      } catch (e) {}
    },
    // 3. 历史交锋 全部赛制+不区分主客场
    async getHistoryAllAll() {
      try {
        const res = await purchasingFootballInfo({
          matchId: this.matchId,
          dataType: "historyTournamentHomeAwayAllAll",
        });
        this.historyData = res.data || {};
      } catch (e) {}
    },
    // 4. 历史交锋 全部赛制+相同主客场
    async getHistoryAllSame() {
      try {
        const res = await purchasingFootballInfo({
          matchId: this.matchId,
          dataType: "historyTournamentHomeAwayAllSame",
        });
        this.historyData = res.data || {};
      } catch (e) {}
    },
    // 5. 历史交锋 同赛制+不区分主客场
    async getHistorySameAll() {
      try {
        const res = await purchasingFootballInfo({
          matchId: this.matchId,
          dataType: "historyTournamentHomeAwaySameAll",
        });
        this.historyData = res.data || {};
      } catch (e) {}
    },
    // 6. 历史交锋 同赛制+相同主客场
    async getHistorySameSame() {
      try {
        const res = await purchasingFootballInfo({
          matchId: this.matchId,
          dataType: "historyTournamentHomeAwaySameSame",
        });
        this.historyData = res.data || {};
      } catch (e) {}
    },
    // 7. 比赛近况 全部赛制+不区分主客场
    async getResultAllAll() {
      try {
        const res = await purchasingFootballInfo({
          matchId: this.matchId,
          dataType: "resultTournamentHomeAwayAllAll",
        });
        this.recentData = res.data || {};
      } catch (e) {}
    },
    // 8. 比赛近况 全部赛制+相同主客场
    async getResultAllSame() {
      try {
        const res = await purchasingFootballInfo({
          matchId: this.matchId,
          dataType: "resultTournamentHomeAwayAllSame",
        });
        this.recentData = res.data || {};
      } catch (e) {}
    },
    // 9. 比赛近况 同赛制+不区分主客场
    async getResultSameAll() {
      try {
        const res = await purchasingFootballInfo({
          matchId: this.matchId,
          dataType: "resultTournamentHomeAwaySameAll",
        });
        this.recentData = res.data || {};
      } catch (e) {}
    },
    // 10. 比赛近况 同赛制+相同主客场
    async getResultSameSame() {
      try {
        const res = await purchasingFootballInfo({
          matchId: this.matchId,
          dataType: "resultTournamentHomeAwaySameSame",
        });
        this.recentData = res.data || {};
      } catch (e) {}
    },
    // 11. 积分榜
    async getTablesData() {
      try {
        const res = await purchasingFootballInfo({
          matchId: this.matchId,
          dataType: "tables",
        });
        this.tablesData = res.data || {};
      } catch (e) {}
    },
    // 12. 未来赛事
    async getFutureData() {
      try {
        const res = await purchasingFootballInfo({
          matchId: this.matchId,
          dataType: "future",
        });
        this.futureData = res.data || {};
      } catch (e) {}
    },
    // 13. 射手信息
    async getPlayerData() {
      try {
        const res = await purchasingFootballInfo({
          matchId: this.matchId,
          dataType: "player",
        });
        this.shooterData = res.data || {};
      } catch (e) {}
    },
    // 14. 伤病一览
    async getInjuryData() {
      try {
        const res = await purchasingFootballInfo({
          matchId: this.matchId,
          dataType: "injurySuspension",
        });
        this.injuryData = res.data || {};
      } catch (e) {}
    },

    // 重新获取所有区块高度（关键修复）
    getSectionTop() {
      this.sectionTopList = [];
      const query = uni.createSelectorQuery().in(this);

      this.tabList.forEach((item) => {
        query.select(`#${item.id}`).boundingClientRect();
      });

      query.exec((res) => {
        res.forEach((item, index) => {
          if (item) {
            // 修正偏移量，避开顶部的Tab栏和头部内容
            this.sectionTopList.push({
              id: this.tabList[index].id,
              top: item.top - 350,
            });
          }
        });
      });
    },

    // Tab 切换（关键修复）
    switchTab(index) {
      this.activeTab = index;
      const targetId = this.tabList[index].id;
      // 强制刷新scroll-view
      this.currentSection = "";
      this.$nextTick(() => {
        this.currentSection = targetId;
      });
    },

    // 滚动同步Tab（关键修复）
    handleScroll(e) {
      const scrollTop = e.detail.scrollTop;
      let currentIndex = 0;

      // 从后往前遍历，优先匹配后面的区块
      for (let i = this.sectionTopList.length - 1; i >= 0; i--) {
        if (scrollTop >= this.sectionTopList[i].top) {
          currentIndex = i;
          break;
        }
      }

      if (this.activeTab !== currentIndex) {
        this.activeTab = currentIndex;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.forecast-page {
  width: 100%;
  height: 100vh;
  background: #f5f7fa;
  box-sizing: border-box;
  overflow: hidden;
}
.match-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: url("/static/ai-bg.png") center / cover no-repeat;
  color: rgba(255, 255, 255, 0.7);
  padding: 0rpx 30rpx;
  box-sizing: border-box;

  .match-top-info {
    text-align: center;
    font-size: 28rpx;
    //color: rgba(255,255,255,0.8);
    .match-code {
      margin-right: 20rpx;
    }
  }

  .match-main {
    display: flex;
    justify-content: space-between;
    align-items: center; // 核心：所有列在同一水平线上对齐
    .team-col {
      display: flex;
      flex-direction: column;
      align-items: center; /* 保持整体居中，和客队对称 */
      width: 30%;
      .pre {
        display: inline-block;
        width: 40rpx; /* 固定宽度，让两个“预”的位置对齐 */
        text-align: right; /* 预字靠右，和右边内容拉开距离 */
        margin-right: 10rpx; /* 控制和右边内容的间距，可微调 */
      }
      .team-name {
        height: 40rpx;
        font-size: 26rpx;
        font-weight: 500;
      }

      .win-rate {
        height: 40rpx;
        font-size: 26rpx;
      }

      .score-pred {
        height: 40rpx;
        font-size: 26rpx;
      }
    }

    .vs-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 30%;

      .vs-text {
        font-size: 26rpx;
        font-weight: bold;
      }

      .draw-rate {
        font-size: 26rpx;
      }

      .score-col {
        font-size: 26rpx;
        font-weight: bold;
      }
    }
  }

  .match-bottom-info {
    text-align: center;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.7);
  }
}
.tab-bar-sticky {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  background: #fff;
  padding: 16rpx 20rpx;
  white-space: nowrap;
  box-sizing: border-box;
  z-index: 99;
}

.tab-item {
  display: inline-block;
  padding: 10rpx 26rpx;
  margin-right: 16rpx;
  border-radius: 50rpx;
  font-size: 28rpx;
  color: #999;
  background: #f0f0f0;
}

.tab-item.active {
  color: #fff;
  background: #ff4444;
}

.scroll-content {
  height: calc(100vh - 400rpx);
  box-sizing: border-box;
}

.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 10rpx 30rpx 5rpx;
  margin-bottom: 20rpx;
}

.feature-sticky {
  position: sticky;
  z-index: 10;
  background: #fff;
  margin-bottom: 0;
  border-radius: 16rpx 16rpx 0 0;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 24rpx;

  .red-line {
    width: 6rpx;
    height: 32rpx;
    background: #ff4444;
    margin-right: 12rpx;
  }

  .extra-text {
    font-size: 26rpx;
    color: #999;
    font-weight: 400;
    margin-left: 10rpx;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;

  .more-btn {
    font-size: 26rpx;
    color: #31926e;
  }
}

.team-title-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;

  .team-tag {
    padding: 8rpx 16rpx;
    background: #2b5496;
    color: #fff;
    border-radius: 8rpx;
    font-size: 26rpx;
  }
}

.feature-item {
  margin-bottom: 30rpx;

  .row-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;

    .home-text,
    .away-text {
      font-size: 26rpx;
      color: #333;
      width: 25%;
    }

    .label-text {
      font-size: 28rpx;
      color: #333;
      text-align: center;
      width: 50%;
    }
  }

  .progress-bar {
    display: flex;
    align-items: center;
    width: 100%;
    height: 12rpx;

    .half-left,
    .half-right {
      width: 49%;
      height: 100%;
      background: #f0f0f0;
      position: relative;
    }

    .half-left {
      border-radius: 6rpx 0 0 6rpx;
      overflow: hidden;
      display: flex;
      justify-content: flex-end;

      .bar-left {
        height: 100%;
        background: #999;
      }
    }

    .divider {
      width: 2%;
      height: 100%;
      background: #fff;
    }

    .half-right {
      border-radius: 0 6rpx 6rpx 0;
      overflow: hidden;
      display: flex;
      justify-content: flex-start;

      .bar-right {
        height: 100%;
        background: #ff4444;
      }
    }
  }
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 16rpx;

  .filter-btn {
    padding: 8rpx 20rpx;
    font-size: 24rpx;
    color: #666;
    background: #f5f7fa;
    border-radius: 20rpx;
    border: 1rpx solid #eee;

    &.active {
      background: #fff;
      color: #ff4444;
      border-color: #ff4444;
    }
  }

  .round-switch {
    display: flex;
    border: 1rpx solid #eee;
    border-radius: 20rpx;
    overflow: hidden;

    .switch-btn {
      padding: 8rpx 20rpx;
      font-size: 24rpx;
      color: #666;

      &.active {
        background: #fff;
        color: #ff4444;
      }
    }
    .btn-two {
      border-left: 1rpx solid #eee;
    }
  }
}

.record-summary {
  font-size: 26rpx;
  margin-bottom: 20rpx;

  .team-tag-sm {
    display: inline-block;
    padding: 4rpx 12rpx;
    background: #2b5496;
    color: #fff;
    border-radius: 6rpx;
    font-size: 24rpx;
    margin: 0 8rpx;
  }

  .win-text {
    color: #ff4444;
  }

  .draw-text {
    color: #31926e;
  }

  .lose-text {
    color: #4285f4;
  }
}

.table-header {
  display: flex;
  font-size: 24rpx;
  color: #999;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  .th {
    flex: 1;
    text-align: center;
  }
}

.record-list,
.match-list {
  .record-item,
  .match-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    font-size: 26rpx;

    &:last-child {
      border-bottom: none;
    }

    .td {
      flex: 1;
      text-align: center;
    }

    .date-col {
      color: #999;
      line-height: 1.5;
    }

    .score-col {
      .score {
        font-weight: 500;
        color: #333;
      }
      .half-score {
        font-size: 22rpx;
        color: #999;
        margin-top: 6rpx;
      }
    }

    .goal-col {
      color: #666;
    }

    .team-col.win-text {
      color: #ff4444;
    }
    .team-col.draw-text {
      color: #31926e;
    }
    .team-col.lose-text {
      color: #4285f4;
    }

    .result-tag {
      padding: 6rpx 16rpx;
      border-radius: 6rpx;
      color: #fff;
      font-size: 24rpx;

      &.win {
        background: #ff4444;
      }
      &.draw {
        background: #31926e;
      }
      &.lose {
        background: #999;
      }
    }
  }
}

.rank-list {
  .rank-item {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
    font-size: 26rpx;
    color: #333;

    .td {
      flex: 1;
      text-align: center;
    }
  }
}

.team-status {
  margin-bottom: 30rpx;

  .stat-text {
    font-size: 24rpx;
    color: #666;
    margin-bottom: 16rpx;
    padding: 8rpx 12rpx;
    background: #f9f9f9;
    border-radius: 6rpx;
  }
}

.future-item {
  margin-bottom: 30rpx;

  .team-tag-sm {
    display: inline-block;
    padding: 4rpx 12rpx;
    background: #2b5496;
    color: #fff;
    border-radius: 6rpx;
    font-size: 24rpx;
    margin-bottom: 16rpx;
  }

  .no-data {
    font-size: 26rpx;
    color: #999;
    text-align: center;
  }
  .future-item-row {
    display: flex;
    justify-content: space-between;
    padding: 10rpx 0;
    border-bottom: 1rpx solid #eee;
    font-size: 26rpx;
  }
}

.player-group {
  margin-bottom: 30rpx;

  .team-tag-sm {
    display: inline-block;
    padding: 4rpx 12rpx;
    background: #2b5496;
    color: #fff;
    border-radius: 6rpx;
    font-size: 24rpx;
    margin-bottom: 16rpx;
  }

  .player-scroll {
    width: 100%;
    white-space: nowrap;
  }
  .no-data-card {
    display: inline-block;
    width: 200rpx;
    text-align: center;
    font-size: 26rpx;
    color: #999;
    line-height: 120rpx;
  }
  .player-card {
    display: inline-block;
    width: 260rpx;
    background: #fff;
    border-radius: 12rpx;
    padding: 20rpx;
    margin-right: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
    position: relative;
    vertical-align: top;
    position: relative;
    .ribbon-wrap {
      position: absolute;
      top: 0;
      right: 0;
      width: 60rpx;
      height: 60rpx;
      overflow: hidden;
    }

    .ribbon {
      position: absolute;
      top: 12rpx;
      right: -12rpx;
      width: 70rpx;
      padding: 4rpx 0;
      font-size: 20rpx;
      color: #fff;
      text-align: center;
      transform: rotate(45deg);

      &.no1 {
        background: linear-gradient(135deg, #ffc107, #ff9800);
      }
      &.no2 {
        background: linear-gradient(135deg, #999, #666);
      }
    }

    .player-avatar {
      width: 70rpx;
      height: 70rpx;
      background: #f0f0f0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10rpx;

      .number {
        font-size: 24rpx;
        color: #333;
      }
    }

    .player-name {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
      margin-bottom: 4rpx;
    }
    .player-info-wrap {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
    }
    .player-text {
      margin-left: 12rpx;
    }
    .player-avatar {
      margin: 0 !important;
    }
    .player-position {
      font-size: 24rpx;
      color: #666;
      margin-bottom: 16rpx;
    }

    .stat-row.top {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16rpx;
      border-bottom: 1rpx solid #eee;
      padding-bottom: 12rpx;

      .stat-item {
        flex: 1;
        text-align: center;

        .stat-label {
          font-size: 22rpx;
          color: #999;
          margin-bottom: 4rpx;
        }

        .stat-value {
          font-size: 26rpx;
          color: #333;
          font-weight: 500;
        }
      }
    }

    .stat-line {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6rpx;
      font-size: 24rpx;

      .line-label {
        color: #666;
      }

      .line-value {
        color: #333;
        font-weight: 500;
      }
    }
  }
  .injury-card {
    display: inline-block;
    width: 280rpx;
    background: #fff;
    border-radius: 12rpx;
    padding: 20rpx;
    margin-right: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    position: relative;
    vertical-align: top;
    .player-info-wrap {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;
    }
    .player-text {
      margin-left: 12rpx;
    }
    .player-avatar {
      margin-bottom: 0 !important;
    }
    .player-position {
      margin-bottom: 0 !important;
    }
    .ribbon-wrap {
      position: absolute;
      top: 0;
      right: 0;
      width: 60rpx;
      height: 60rpx;
      overflow: hidden;
    }

    .player-avatar {
      position: relative;
      width: 80rpx;
      height: 80rpx;
      background: #f0f0f0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12rpx;

      .number {
        font-size: 28rpx;
        color: #333;
      }
      .injury-tag {
        position: absolute;
        bottom: 0;
        right: 0;
        background: #999;
        color: #fff;
        font-size: 20rpx;
        padding: 2rpx 6rpx;
        border-radius: 50%;
      }
    }

    .player-name {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
      margin-bottom: 6rpx;
    }

    .player-position {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 16rpx;
    }

    .player-stats {
      .stat-row,
      .stat-value {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8rpx;

        .stat-item {
          flex: 1;
          text-align: center;
          font-size: 24rpx;
          color: #666;
        }
      }
      .stat-value .stat-item {
        font-weight: 500;
        color: #333;
      }
    }
  }
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;

  .modal-content {
    width: 90%;
    max-height: 70%;
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
  }
  .modal-title {
    font-size: 30rpx;
    font-weight: 500;
    color: #333;
    padding: 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
  }

  .modal-scroll {
    max-height: 600rpx;
  }

  .table-header {
    display: flex;
    font-size: 24rpx;
    color: #999;
    padding: 12rpx 20rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .th {
      flex: 1;
      text-align: center;
    }
  }

  .rank-item {
    display: flex;
    padding: 16rpx 20rpx;
    font-size: 26rpx;
    color: #333;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .td {
      flex: 1;
      text-align: center;
    }
  }
}
.no-data {
  font-size: 26rpx;
  color: #999;
  text-align: center;
  line-height: 60rpx;
}
.rank {
  .section-title-wrap {
    margin-bottom: 16rpx;
  }

  .rank-card {
    background: #fff;
    border-radius: 12rpx;
    padding: 16rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;
  }

  .team-name-tag {
    background: #2b5496;
    color: #fff;
    padding: 8rpx 16rpx;
    border-radius: 6rpx;
    font-size: 26rpx;
  }

  .group-rank {
    font-size: 26rpx;
    color: #333;
    margin-left: 12rpx;
  }

  .more-btn {
    font-size: 26rpx;
    color: #31926e;
  }

  .table-header {
    display: flex;
    font-size: 24rpx;
    color: #999;
    padding: 10rpx 0;
    border-bottom: 1rpx solid #eee;
  }

  .th {
    flex: 1;
    text-align: center;
  }

  .table-row {
    display: flex;
    padding: 14rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    font-size: 26rpx;

    &:last-child {
      border-bottom: none;
    }
  }

  .td {
    flex: 1;
    text-align: center;
  }

  .type-col {
    width: 60rpx;
    font-weight: bold;
  }

  .red {
    color: red;
  }
}
.no-data-block {
  width: 100%;
  padding: 60rpx 0;
  text-align: center;
  .no-data-txt {
    font-size: 28rpx;
    color: #999;
  }
}
</style>
