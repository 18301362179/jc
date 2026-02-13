<template>
  <!-- 混合过关页面：让球+胜平负 列表多选布局 -->
  <view class="match-list" :style="{ paddingTop: paddingTopVal + 'rpx' }">
    <!-- 抽屉循环容器 -->
    <view v-for="(drawer, drawerIdx) in finalDrawerList" :key="drawerIdx" class="drawer-wrapper">
      <view class="date-title sticky-header" :style="{ top: stickyHeaderTop + 'rpx' }" @click="toggleDrawer(drawerIdx)" hover-class="none">
        <text class="drawer-title-text">{{ drawer.title }}</text>
        <view class="arrow-icon" :class="[{ rotated: expandedDrawers[drawerIdx] }]">↓</view>
      </view>

      <!-- 抽屉内容：列表多选布局 -->
      <view class="drawer-content" v-show="expandedDrawers[drawerIdx]">
        <view v-for="(item, index) in drawer.lotteryList" :key="index" class="match-row">
          <!-- 状态行 -->
          <view class="match-status-row">
            <view class="status-left">
              <!-- 修复：单场标签显示条件错误，应该是 is_stop == 0 -->
              <text class="single-tag" v-if="item.is_hhgg_single == 1 && item.is_stop == 0">单场</text>
              <!-- 新增：停售标签 -->
              <text class="single-tag" style="background: #dedede" v-if="item.is_stop == 1">停售</text>
            </view>
            <view class="status-right">
              <view class="ai-analysis-btn" v-if="item.home_win_rate && item.visiting_win_rate" @click.stop="goToAiAnalysis(item)"> {{ item.is_buy == 0 ? '5币比分+析' : '比分+析' }}</view>
            </view>
          </view>

          <!-- 核心多层左右布局 -->
          <view class="main-content-row">
            <view class="main-left">
              <view class="top-left">
                <text class="league-name">{{ item.league_name || "未知联赛" }}</text>
              </view>
              <view class="bottom-left">
                <text class="serial-number">{{ item.serial_number }}</text>
                <text class="match-time">{{ item.race_date }}</text>
              </view>
            </view>

            <view class="main-right">
              <view class="top-right-layout">
                <view class="handicap-col">
                  <text class="handicap-text">让</text>
                  <text class="handicap-text">球</text>
                </view>
                <view class="team-rate-col">
                  <view class="team-vs">
                    <text class="team-name away">{{ item.home_name }}</text>
                    <text class="vs-text">VS</text>
                    <text class="team-name home">{{ item.visiting_name }}</text>
                  </view>
                  <view class="rate-row">
                    <text class="rate-text home" style="text-align:right;padding-right: 10px;" v-if="item.home_win_rate">胜率{{ item.home_win_rate || "" }}</text>
                    <text class="vs-text" v-if="item.draw_rate">平率{{ item.draw_rate }}</text>
                    <text class="rate-text away" style="text-align:left;padding-left:10px;" v-if="item.visiting_win_rate">胜率{{ item.visiting_win_rate || "" }}</text>
                  </view>
                </view>
              </view>

              <view class="bottom-right-layout">
                <view class="handicap-value-col">
                  <view class="handicap-value-item">0</view>
                  <!-- 兼容写法：去掉模板字符串，纯数组+方法调用 -->
                  <view class="handicap-value-item" :class="[getHandicapColorClass(item.r_goal)]">
                    {{ item.r_goal !== undefined && item.r_goal !== null ? item.r_goal : "0" }}
                  </view>
                </view>
                <view class="spf-select-col">
                  <view class="spf-row">
                    <!-- 第一行：rowIndex=0，itemIndex依次0/1/2 -->
                    <view class="spf-btn" :class="[{ selected: checkSelected(item.selectedSpf, 'home_0'), disabled: item.is_stop == 1 }]" @click="handleSpfMultiClick(item, 'home_0', 0, 0)">
                      <text class="spf-text">主胜</text>
                      <text class="spf-odds">{{ item.win_multiplier !== undefined && item.win_multiplier !== null ? item.win_multiplier : "--" }}</text>
                    </view>
                    <view class="spf-btn" :class="[{ selected: checkSelected(item.selectedSpf, 'draw_0'), disabled: item.is_stop == 1 }]" @click="handleSpfMultiClick(item, 'draw_0', 0, 1)">
                      <text class="spf-text">平</text>
                      <text class="spf-odds">{{ item.draw_multiplier !== undefined && item.draw_multiplier !== null ? item.draw_multiplier : "--" }}</text>
                    </view>
                    <view class="spf-btn" :class="[{ selected: checkSelected(item.selectedSpf, 'away_0'), disabled: item.is_stop == 1 }]" @click="handleSpfMultiClick(item, 'away_0', 0, 2)">
                      <text class="spf-text">客胜</text>
                      <text class="spf-odds">{{ item.loss_multiplier !== undefined && item.loss_multiplier !== null ? item.loss_multiplier : "--" }}</text>
                    </view>
                  </view>
                  <view class="spf-row">
                    <!-- 第二行：rowIndex=1，itemIndex依次0/1/2 -->
                    <view class="spf-btn" :class="[{ selected: checkSelected(item.selectedSpf, 'home_-1'), disabled: item.is_stop == 1 }]" @click="handleSpfMultiClick(item, 'home_-1', 1, 0)">
                      <text class="spf-text">主胜</text>
                      <text class="spf-odds">{{ item.r_win_multiplier !== undefined && item.r_win_multiplier !== null ? item.r_win_multiplier : "--" }}</text>
                    </view>
                    <view class="spf-btn" :class="[{ selected: checkSelected(item.selectedSpf, 'draw_-1'), disabled: item.is_stop == 1 }]" @click="handleSpfMultiClick(item, 'draw_-1', 1, 1)">
                      <text class="spf-text">平</text>
                      <text class="spf-odds">{{ item.r_draw_multiplier !== undefined && item.r_draw_multiplier !== null ? item.r_draw_multiplier : "--" }}</text>
                    </view>
                    <view class="spf-btn" :class="[{ selected: checkSelected(item.selectedSpf, 'away_-1'), disabled: item.is_stop == 1 }]" @click="handleSpfMultiClick(item, 'away_-1', 1, 2)">
                      <text class="spf-text">客胜</text>
                      <text class="spf-odds">{{ item.r_loss_multiplier !== undefined && item.r_loss_multiplier !== null ? item.r_loss_multiplier : "--" }}</text>
                    </view>
                  </view>
                </view>
                <!-- 新增：展开按钮禁用 -->
                <view class="expand-btn-col" @click="openScorePopup(item)" :class="[{ disabled: item.is_stop == 1 }]">
                  <text class="expand-text">展开</text>
                  <text class="expand-more">全部</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 混合过关弹框：5大板块 -->
    <view class="score-popup-mask" v-if="isPopupShow && currentMatch.data2" @click="closePopup" hover-class="none" @touchmove.stop.prevent></view>
    <view class="score-popup" v-if="isPopupShow && currentMatch.data2" @touchmove.stop.prevent>
      <view v-if="isLoading" class="popup-loading">
        <text>加载赔率中...</text>
      </view>
      <view v-else class="popup-content-wrapper">
        <view class="popup-header">
          <view class="popup-title"> {{ currentMatch.home_name + "(主)" }}VS {{ currentMatch.visiting_name + "(客)" }} </view>
          <!-- 第二行：胜率、平率、负率 横向排列 -->
          <view class="match-stat-info stat-spf">
            <view class="stat-item" v-if="currentMatch.home_win_rate">
              <text class="stat-label">胜率：</text>
              <text class="stat-value">{{ currentMatch.home_win_rate || "--" }}</text>
            </view>
            <view class="stat-item" v-if="currentMatch.draw_rate">
              <text class="stat-label">平率：</text>
              <text class="stat-value">{{ currentMatch.draw_rate || "--" }}</text>
            </view>
            <view class="stat-item" v-if="currentMatch.visiting_win_rate">
              <text class="stat-label">负率：</text>
              <text class="stat-value">{{ currentMatch.visiting_win_rate || "--" }}</text>
            </view>
          </view>
          <!-- 第三行：预测比分 单独居中【核心要求】 -->
          <view class="match-stat-info stat-score" v-if="currentMatch.home_goal_calculate && currentMatch.visiting_goal_calculate">
            <view class="stat-item">
              <text class="stat-label">预测比分：</text>
              <text class="stat-value">{{ currentMatch.home_goal_calculate }}:{{ currentMatch.visiting_goal_calculate }}</text>
            </view>
          </view>
        </view>
        <!-- 中间滚动区域：各玩法板块 -->
        <view class="popup-scroll-content">
          <!-- 胜平负板块 -->
          <view class="score-section">
            <view class="section-label spf-label">胜平负</view>
            <view class="spf-options">
              <view class="spf-item" @click="handleScoreToggle('spf', '胜平负_主胜')" :class="[getScoreClass('spf', '胜平负_主胜', currentMatch.win_multiplier)]">
                <text class="score-text">主胜</text>
                <text class="score-odds">{{ currentMatch.win_multiplier !== undefined && currentMatch.win_multiplier !== null ? currentMatch.win_multiplier : "--" }}</text>
              </view>
              <view class="spf-item" @click="handleScoreToggle('spf', '胜平负_平')" :class="[getScoreClass('spf', '胜平负_平', currentMatch.draw_multiplier)]">
                <text class="score-text">平</text>
                <text class="score-odds">{{ currentMatch.draw_multiplier !== undefined && currentMatch.draw_multiplier !== null ? currentMatch.draw_multiplier : "--" }}</text>
              </view>
              <view class="spf-item" @click="handleScoreToggle('spf', '胜平负_客胜')" :class="[getScoreClass('spf', '胜平负_客胜', currentMatch.loss_multiplier)]">
                <text class="score-text">客胜</text>
                <text class="score-odds">{{ currentMatch.loss_multiplier !== undefined && currentMatch.loss_multiplier !== null ? currentMatch.loss_multiplier : "--" }}</text>
              </view>
            </view>
          </view>

          <!-- 让球胜平负板块 -->
          <view class="score-section">
            <view class="section-label rspf-label">让球</view>
            <view class="rspf-container">
              <view class="rspf-options">
                <view class="rspf-item" @click="handleScoreToggle('rspf', '让胜平负_让主胜')" :class="[getScoreClass('rspf', '让胜平负_让主胜', currentMatch.r_win_multiplier)]">
                  <text class="score-text">主胜【让】</text>
                  <text class="score-odds">{{ currentMatch.r_win_multiplier !== undefined && currentMatch.r_win_multiplier !== null ? currentMatch.r_win_multiplier : "--" }}</text>
                </view>
                <view class="rspf-item" @click="handleScoreToggle('rspf', '让胜平负_让平')" :class="[getScoreClass('rspf', '让胜平负_让平', currentMatch.r_draw_multiplier)]">
                  <text class="score-text">平【让】</text>
                  <text class="score-odds">{{ currentMatch.r_draw_multiplier !== undefined && currentMatch.r_draw_multiplier !== null ? currentMatch.r_draw_multiplier : "--" }}</text>
                </view>
                <view class="rspf-item" @click="handleScoreToggle('rspf', '让胜平负_让客胜')" :class="[getScoreClass('rspf', '让胜平负_让客胜', currentMatch.r_loss_multiplier)]">
                  <text class="score-text">客胜【让】</text>
                  <text class="score-odds">{{ currentMatch.r_loss_multiplier !== undefined && currentMatch.r_loss_multiplier !== null ? currentMatch.r_loss_multiplier : "--" }}</text>
                </view>
              </view>
              <view class="rspf-tip">让球胜平负（主队-1）</view>
            </view>
          </view>

          <!-- 比分板块 -->
          <view class="score-section">
            <view class="section-label bifen-label">比分</view>
            <view class="bifen-options">
              <!-- 主胜比分行 -->
              <view class="bifen-row">
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_1:0')" :class="[getScoreClass('bifen', '比分_1:0')]">
                  <text class="score-text">1:0</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "ybl") }}</text>
                </view>
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_2:0')" :class="[getScoreClass('bifen', '比分_2:0')]">
                  <text class="score-text">2:0</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "ebl") }}</text>
                </view>
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_2:1')" :class="[getScoreClass('bifen', '比分_2:1')]">
                  <text class="score-text">2:1</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "eby") }}</text>
                </view>
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_3:0')" :class="[getScoreClass('bifen', '比分_3:0')]">
                  <text class="score-text">3:0</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "sbl") }}</text>
                </view>
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_3:1')" :class="[getScoreClass('bifen', '比分_3:1')]">
                  <text class="score-text">3:1</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "sby") }}</text>
                </view>
              </view>
              <view class="bifen-row">
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_3:2')" :class="[getScoreClass('bifen', '比分_3:2')]">
                  <text class="score-text">3:2</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "sbe") }}</text>
                </view>
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_4:0')" :class="[getScoreClass('bifen', '比分_4:0')]">
                  <text class="score-text">4:0</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "sibl") }}</text>
                </view>
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_4:1')" :class="[getScoreClass('bifen', '比分_4:1')]">
                  <text class="score-text">4:1</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "siby") }}</text>
                </view>
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_4:2')" :class="[getScoreClass('bifen', '比分_4:2')]">
                  <text class="score-text">4:2</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "sibe") }}</text>
                </view>
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_5:0')" :class="[getScoreClass('bifen', '比分_5:0')]">
                  <text class="score-text">5:0</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "wbl") }}</text>
                </view>
              </view>
              <view class="bifen-row">
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_5:1')" :class="[getScoreClass('bifen', '比分_5:1')]">
                  <text class="score-text">5:1</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "wby") }}</text>
                </view>
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_5:2')" :class="[getScoreClass('bifen', '比分_5:2')]">
                  <text class="score-text">5:2</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "wbe") }}</text>
                </view>
                <view class="bifen-item bifen-other" @click="handleScoreToggle('bifen', '比分_胜其它')" :class="[getScoreClass('bifen', '比分_胜其它')]">
                  <text class="score-text">胜其它</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "sqt") }}</text>
                </view>
              </view>

              <!-- 平比分行 -->
              <view class="bifen-row">
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_0:0')" :class="[getScoreClass('bifen', '比分_0:0')]">
                  <text class="score-text">0:0</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "lwl") }}</text>
                </view>
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_1:1')" :class="[getScoreClass('bifen', '比分_1:1')]">
                  <text class="score-text">1:1</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "yby") }}</text>
                </view>
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_2:2')" :class="[getScoreClass('bifen', '比分_2:2')]">
                  <text class="score-text">2:2</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "ebs") }}</text>
                </view>
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_3:3')" :class="[getScoreClass('bifen', '比分_3:3')]">
                  <text class="score-text">3:3</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "fqt") }}</text>
                </view>
                <view class="bifen-item bifen-other" @click="handleScoreToggle('bifen', '比分_平其它')" :class="[getScoreClass('bifen', '比分_平其它')]">
                  <text class="score-text">平其它</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "pqt") }}</text>
                </view>
              </view>

              <!-- 客胜比分行 -->
              <view class="bifen-row">
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_0:1')" :class="[getScoreClass('bifen', '比分_0:1')]">
                  <text class="score-text">0:1</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "lby") }}</text>
                </view>
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_0:2')" :class="[getScoreClass('bifen', '比分_0:2')]">
                  <text class="score-text">0:2</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "lbe") }}</text>
                </view>
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_1:2')" :class="[getScoreClass('bifen', '比分_1:2')]">
                  <text class="score-text">1:2</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "ybs") }}</text>
                </view>
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_0:3')" :class="[getScoreClass('bifen', '比分_0:3')]">
                  <text class="score-text">0:3</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "lbl") }}</text>
                </view>
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_1:3')" :class="[getScoreClass('bifen', '比分_1:3')]">
                  <text class="score-text">1:3</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "lbe") }}</text>
                </view>
              </view>
              <view class="bifen-row">
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_2:3')" :class="[getScoreClass('bifen', '比分_2:3')]">
                  <text class="score-text">2:3</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "lbsan") }}</text>
                </view>
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_0:4')" :class="[getScoreClass('bifen', '比分_0:4')]">
                  <text class="score-text">0:4</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "lbsi") }}</text>
                </view>
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_1:4')" :class="[getScoreClass('bifen', '比分_1:4')]">
                  <text class="score-text">1:4</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "ybsi") }}</text>
                </view>
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_2:4')" :class="[getScoreClass('bifen', '比分_2:4')]">
                  <text class="score-text">2:4</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "ebsi") }}</text>
                </view>
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_0:5')" :class="[getScoreClass('bifen', '比分_0:5')]">
                  <text class="score-text">0:5</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "lbw") }}</text>
                </view>
              </view>
              <view class="bifen-row">
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_1:5')" :class="[getScoreClass('bifen', '比分_1:5')]">
                  <text class="score-text">1:5</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "ybw") }}</text>
                </view>
                <view class="bifen-item" @click="handleScoreToggle('bifen', '比分_2:5')" :class="[getScoreClass('bifen', '比分_2:5')]">
                  <text class="score-text">2:5</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "ebw") }}</text>
                </view>
                <view class="bifen-item bifen-other" @click="handleScoreToggle('bifen', '比分_负其它')" :class="[getScoreClass('bifen', '比分_负其它')]">
                  <text class="score-text">负其它</text>
                  <text class="score-odds">{{ getScoreValue(currentMatch, "data2", "sqt") }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 总进球板块 -->
          <view class="score-section">
            <view class="section-label zjq-label">总进球</view>
            <view class="zjq-options">
              <view class="zjq-item" @click="handleScoreToggle('zjq', '总进球_0')" :class="[getScoreClass('zjq', '总进球_0', currentMatch.zjq_ling)]">
                <text class="score-text">0</text>
                <text class="score-odds">{{ currentMatch.zjq_ling !== undefined && currentMatch.zjq_ling !== null ? currentMatch.zjq_ling : "--" }}</text>
              </view>
              <view class="zjq-item" @click="handleScoreToggle('zjq', '总进球_1')" :class="[getScoreClass('zjq', '总进球_1', currentMatch.zjq_yi)]">
                <text class="score-text">1</text>
                <text class="score-odds">{{ currentMatch.zjq_yi !== undefined && currentMatch.zjq_yi !== null ? currentMatch.zjq_yi : "--" }}</text>
              </view>
              <view class="zjq-item" @click="handleScoreToggle('zjq', '总进球_2')" :class="[getScoreClass('zjq', '总进球_2', currentMatch.zjq_er)]">
                <text class="score-text">2</text>
                <text class="score-odds">{{ currentMatch.zjq_er !== undefined && currentMatch.zjq_er !== null ? currentMatch.zjq_er : "--" }}</text>
              </view>
              <view class="zjq-item" @click="handleScoreToggle('zjq', '总进球_3')" :class="[getScoreClass('zjq', '总进球_3', currentMatch.zjq_san)]">
                <text class="score-text">3</text>
                <text class="score-odds">{{ currentMatch.zjq_san !== undefined && currentMatch.zjq_san !== null ? currentMatch.zjq_san : "--" }}</text>
              </view>
              <view class="zjq-item" @click="handleScoreToggle('zjq', '总进球_4')" :class="[getScoreClass('zjq', '总进球_4', currentMatch.zjq_si)]">
                <text class="score-text">4</text>
                <text class="score-odds">{{ currentMatch.zjq_si !== undefined && currentMatch.zjq_si !== null ? currentMatch.zjq_si : "--" }}</text>
              </view>
              <view class="zjq-item" @click="handleScoreToggle('zjq', '总进球_5')" :class="[getScoreClass('zjq', '总进球_5', currentMatch.zjq_wu)]">
                <text class="score-text">5</text>
                <text class="score-odds">{{ currentMatch.zjq_wu !== undefined && currentMatch.zjq_wu !== null ? currentMatch.zjq_wu : "--" }}</text>
              </view>
              <view class="zjq-item" @click="handleScoreToggle('zjq', '总进球_6')" :class="[getScoreClass('zjq', '总进球_6', currentMatch.zjq_liu)]">
                <text class="score-text">6</text>
                <text class="score-odds">{{ currentMatch.zjq_liu !== undefined && currentMatch.zjq_liu !== null ? currentMatch.zjq_liu : "--" }}</text>
              </view>
              <view class="zjq-item" @click="handleScoreToggle('zjq', '总进球_7+')" :class="[getScoreClass('zjq', '总进球_7+', currentMatch.zjq_qi_jia)]">
                <text class="score-text">7+</text>
                <text class="score-odds">{{ currentMatch.zjq_qi_jia !== undefined && currentMatch.zjq_qi_jia !== null ? currentMatch.zjq_qi_jia : "--" }}</text>
              </view>
            </view>
          </view>

          <!-- 半全场板块 -->
          <view class="score-section">
            <view class="section-label bqc-label">半全场</view>
            <view class="bqc-options">
              <view class="bqc-row">
                <view class="bqc-item" @click="handleScoreToggle('bqc', '半全场_胜胜')" :class="[getScoreClass('bqc', '半全场_胜胜', currentMatch.ss)]">
                  <text class="score-text">胜胜</text>
                  <text class="score-odds">{{ currentMatch.ss !== undefined && currentMatch.ss !== null ? currentMatch.ss : "--" }}</text>
                </view>
                <view class="bqc-item" @click="handleScoreToggle('bqc', '半全场_胜平')" :class="[getScoreClass('bqc', '半全场_胜平', currentMatch.sp)]">
                  <text class="score-text">胜平</text>
                  <text class="score-odds">{{ currentMatch.sp !== undefined && currentMatch.sp !== null ? currentMatch.sp : "--" }}</text>
                </view>
                <view class="bqc-item" @click="handleScoreToggle('bqc', '半全场_胜负')" :class="[getScoreClass('bqc', '半全场_胜负', currentMatch.sf)]">
                  <text class="score-text">胜负</text>
                  <text class="score-odds">{{ currentMatch.sf !== undefined && currentMatch.sf !== null ? currentMatch.sf : "--" }}</text>
                </view>
              </view>
              <view class="bqc-row">
                <view class="bqc-item" @click="handleScoreToggle('bqc', '半全场_平胜')" :class="[getScoreClass('bqc', '半全场_平胜', currentMatch.ps)]">
                  <text class="score-text">平胜</text>
                  <text class="score-odds">{{ currentMatch.ps !== undefined && currentMatch.ps !== null ? currentMatch.ps : "--" }}</text>
                </view>
                <view class="bqc-item" @click="handleScoreToggle('bqc', '半全场_平平')" :class="[getScoreClass('bqc', '半全场_平平', currentMatch.pp)]">
                  <text class="score-text">平平</text>
                  <text class="score-odds">{{ currentMatch.pp !== undefined && currentMatch.pp !== null ? currentMatch.pp : "--" }}</text>
                </view>
                <view class="bqc-item" @click="handleScoreToggle('bqc', '半全场_平负')" :class="[getScoreClass('bqc', '半全场_平负', currentMatch.pf)]">
                  <text class="score-text">平负</text>
                  <text class="score-odds">{{ currentMatch.pf !== undefined && currentMatch.pf !== null ? currentMatch.pf : "--" }}</text>
                </view>
              </view>
              <view class="bqc-row">
                <view class="bqc-item" @click="handleScoreToggle('bqc', '半全场_负胜')" :class="[getScoreClass('bqc', '半全场_负胜', currentMatch.fs)]">
                  <text class="score-text">负胜</text>
                  <text class="score-odds">{{ currentMatch.fs !== undefined && currentMatch.fs !== null ? currentMatch.fs : "--" }}</text>
                </view>
                <view class="bqc-item" @click="handleScoreToggle('bqc', '半全场_负平')" :class="[getScoreClass('bqc', '半全场_负平', currentMatch.fp)]">
                  <text class="score-text">负平</text>
                  <text class="score-odds">{{ currentMatch.fp !== undefined && currentMatch.fp !== null ? currentMatch.fp : "--" }}</text>
                </view>
                <view class="bqc-item" @click="handleScoreToggle('bqc', '半全场_负负')" :class="[getScoreClass('bqc', '半全场_负负', currentMatch.ff)]">
                  <text class="score-text">负负</text>
                  <text class="score-odds">{{ currentMatch.ff !== undefined && currentMatch.ff !== null ? currentMatch.ff : "--" }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 底部固定按钮栏 -->
        <view class="popup-btn-bar">
          <button class="cancel-btn" @click="closePopup" hover-class="none">取消</button>
          <button class="confirm-btn" @click="confirmSelection" hover-class="none" :disabled="currentMatch.is_stop == 1">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { queryHhgg } from "@/api/demo";
export default {
  props: {
    matchList: { type: Array, default: () => [] },
    statusBarHeight: { type: Number, default: 0 },
    goToAiAnalysis: { type: Function, required: true },
    drawerList: { type: Array, default: () => [] },
  },
  data() {
    return {
      isPopupShow: false,
      currentMatch: { data2: {}, r_goal: -1, is_stop: 0, selectedSpf: [], selectedBifen: [], selectedZjq: [], selectedBqc: [] },
      selectedScores: { bifen: [], zjq: [], bqc: [], spf: [], rspf: [] },
      MAX_SELECT_COUNT: 10,
      MAX_MATCH_COUNT: 8,
      isLoading: false,
      expandedDrawers: [],
      statusBarHeightRpx: 0,
      windowWidth: 0,
      spfMapping: {
        胜平负_主胜: "home_0",
        胜平负_平: "draw_0",
        胜平负_客胜: "away_0",
        让胜平负_让主胜: "home_-1",
        让胜平负_让平: "draw_-1",
        让胜平负_让客胜: "away_-1",
      },
      reverseSpfMapping: {
        home_0: "胜平负_主胜",
        draw_0: "胜平负_平",
        away_0: "胜平负_客胜",
        "home_-1": "让胜平负_让主胜",
        "draw_-1": "让胜平负_让平",
        "away_-1": "让胜平负_让客胜",
      },
    };
  },
  computed: {
    finalDrawerList() {
      if (this.drawerList.length > 0) {
        return this.drawerList;
      } else {
        if (this.matchList.length > 0) {
          return [{ title: `周四 2025-12-04 共${this.matchList.length}场比赛`, lotteryList: this.matchList }];
        } else {
          return [];
        }
      }
    },
    selectedMatchCount() {
      let count = 0;
      this.finalDrawerList.forEach((drawer) => {
        drawer.lotteryList.forEach((item) => {
          const hasSpf = item.selectedSpf && item.selectedSpf.length > 0;
          const hasOther = (item.selectedBifen && item.selectedBifen.length > 0) || (item.selectedZjq && item.selectedZjq.length > 0) || (item.selectedBqc && item.selectedBqc.length > 0);
          if (hasSpf || hasOther) {
            count++;
          }
        });
      });
      return count;
    },
    paddingTopVal() {
      return this.statusBarHeightRpx + 88;
    },
    stickyHeaderTop() {
      return this.statusBarHeightRpx + 88 - 10;
    },
  },
  watch: {
    finalDrawerList(newVal) {
      this.expandedDrawers = [];
      for (var i = 0; i < newVal.length; i++) {
        this.expandedDrawers.push(true);
      }
      // 核心：强制初始化足球玩法的选中数组
      newVal.forEach(
        function (drawer) {
          drawer.lotteryList.forEach(
            function (item) {
              // 胜平负
              if (!item.selectedSpf) {
                this.$set(item, "selectedSpf", []);
              }
              // 比分
              if (!item.selectedBifen) {
                this.$set(item, "selectedBifen", []);
              }
              // 总进球
              if (!item.selectedZongjinqiu) {
                this.$set(item, "selectedZongjinqiu", []);
              }
              // 半全场
              if (!item.selectedBanquan) {
                this.$set(item, "selectedBanquan", []);
              }
            }.bind(this)
          );
        }.bind(this)
      );
    },
    statusBarHeight(newVal) {
      this.statusBarHeightRpx = this.pxToRpx(newVal);
    },
  },
  created() {
    this.initWindowInfo();
    this.statusBarHeightRpx = this.pxToRpx(this.statusBarHeight);
  },
  methods: {
    // 新增方法：判断让球数值颜色类
    getHandicapColorClass(value) {
      const num = Number(value || 0);
      if (num < 0) return "negative";
      if (num > 0) return "positive";
      return "";
    },
    // 兼容版取值方法
    getScoreValue(obj, parentKey, key) {
      if (obj && obj[parentKey] && obj[parentKey][key] !== undefined && obj[parentKey][key] !== null) {
        return obj[parentKey][key];
      } else {
        return "--";
      }
    },
    checkSelected(arr, val) {
      // 兜底：数组不存在/空，直接返回false
      if (!arr || !Array.isArray(arr) || arr.length === 0) {
        return false;
      }
      // 遍历匹配
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] === val) {
          return true;
        }
      }
      return false;
    },
    initWindowInfo() {
      try {
        const systemInfo = uni.getSystemInfoSync();
        this.windowWidth = systemInfo.windowWidth || 375;
      } catch (e) {
        this.windowWidth = 375;
        console.warn("获取窗口信息失败:", e);
      }
    },
    pxToRpx(px) {
      if (!px || !this.windowWidth) {
        return 0;
      } else {
        return Math.round((px / this.windowWidth) * 750 + 0.5);
      }
    },
    toggleDrawer(drawerIdx) {
      this.$set(this.expandedDrawers, drawerIdx, !this.expandedDrawers[drawerIdx]);
    },
    handleSpfMultiClick(item, selectType, rowIndex, itemIndex) {
      // 停售判断
      if (item.is_stop == 1) {
        uni.showToast({ title: "该场次已停售", icon: "none" });
        return;
      }
      this.$emit("toggle-mixed-select", item, selectType);
    },
    getScoreClass(plate, value, multiplier) {
      const arr = this.selectedScores[plate] || [];
      const isDisabled = (() => {
        if (this.currentMatch.is_stop == 1) return true;
        if (plate === "spf" && (multiplier === undefined || multiplier === null)) return true;
        return false;
      })();
      // 小程序兼容：返回字符串类名，而非对象
      let className = "";
      if (this.checkSelected(arr, value)) className += " selected";
      if (isDisabled) className += " disabled";
      return className.trim();
    },
    handleScoreToggle(plate, value) {
      try {
        // 2. 停售/加载中判断日志
        if (this.isLoading || this.currentMatch.is_stop == 1) {
          return;
        }

        // 3. 胜平负赔率校验日志
        if (plate === "spf") {
          const multiplierKey = {
            胜平负_主胜: "win_multiplier",
            胜平负_平: "draw_multiplier",
            胜平负_客胜: "loss_multiplier",
          }[value];
          if (!this.currentMatch[multiplierKey]) {
            uni.showToast({ title: "该选项暂无赔率", icon: "none" });
            return;
          }
        }

        // 确保数组存在
        if (!this.selectedScores[plate]) {
          this.$set(this.selectedScores, plate, []);
        }

        const current = this.selectedScores[plate];
        const isSelected = this.checkSelected(current, value);
        // 4. 选中数量限制+状态变更日志
        if (!isSelected) {
          current.push(value);
        } else {
          this.$set(
            this.selectedScores,
            plate,
            current.filter((val) => val !== value)
          );
        }
      } catch (error) {
        // 5. 异常捕获日志（定位代码报错）
        uni.showToast({ title: "操作失败，请重试", icon: "none" });
      }
    },
    openScorePopup(match) {
      // 停售状态下禁止打开弹窗
      if (match.is_stop == 1) {
        return;
      }
      // 深拷贝避免修改原数据
      this.currentMatch = this.deepClone(match);
      if (!this.currentMatch.data2) {
        this.$set(this.currentMatch, "data2", {});
      }
      this.isLoading = true;
      this.isPopupShow = true;

      const initSpf = [];
      const initRspf = [];
      if (Array.isArray(match.selectedSpf) && match.selectedSpf.length > 0) {
        match.selectedSpf.forEach((val) => {
          const key = this.reverseSpfMapping[val];
          if (key) {
            if (key.indexOf("胜平负_") === 0) {
              initSpf.push(key);
            } else if (key.indexOf("让胜平负_") === 0) {
              initRspf.push(key);
            }
          }
        });
      }

      // 初始化选中状态
      this.selectedScores = {
        bifen: this.deepClone(match.selectedBifen || []),
        zjq: this.deepClone(match.selectedZjq || []),
        bqc: this.deepClone(match.selectedBqc || []),
        spf: this.deepClone(initSpf),
        rspf: this.deepClone(initRspf),
      };

      // 异步请求赔率数据
      queryHhgg({ id: match.id, serialNumber: match.serial_number, dateStr: match.date_str })
        .then((res) => {
          if (res && res.data) {
            // 更新当前匹配数据（拷贝数据）
            Object.keys(res.data.data1 || {}).forEach((key) => {
              this.$set(this.currentMatch, key, res.data.data1[key]);
            });
            if (res.data.data2) {
              Object.keys(res.data.data2).forEach((key2) => {
                this.$set(this.currentMatch.data2, key2, res.data.data2[key2]);
              });
            }
          }
        })
        .catch((err) => {
          console.error("获取赔率失败:", err);
          uni.showToast({ title: "赔率加载失败", icon: "none" });
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    // 深拷贝工具函数
    deepClone(obj) {
      if (obj === null || typeof obj !== "object") {
        return obj;
      }
      if (obj instanceof Array) {
        return obj.map((item) => this.deepClone(item));
      }
      if (obj instanceof Object) {
        const newObj = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            newObj[key] = this.deepClone(obj[key]);
          }
        }
        return newObj;
      }
      return obj;
    },
    confirmSelection() {
      try {
        // 增强：停售状态下禁止确认
        if (!this.currentMatch || this.isLoading || this.currentMatch.is_stop == 1) {
          uni.showToast({ title: "该场次已停售，操作不可用", icon: "none" });
          return;
        }

        // 1. 精准匹配原数组中的目标场次（保留原有逻辑）
        let targetDrawerIdx = -1;
        let targetItemIdx = -1;
        let targetItem = null;

        this.finalDrawerList.some((drawer, drawerIdx) => {
          return drawer.lotteryList.some((item, itemIdx) => {
            if (item.id === this.currentMatch.id) {
              targetDrawerIdx = drawerIdx;
              targetItemIdx = itemIdx;
              targetItem = item;
              return true;
            }
            return false;
          });
        });

        if (!targetItem || targetDrawerIdx === -1 || targetItemIdx === -1) {
          uni.showToast({ title: "未找到对应场次", icon: "none" });
          return;
        }
        // 2. 处理所有类型的选中数据（核心：修复spf/rspf的反向映射）
        const selectedList = [];
        // 处理胜平负/让球胜平负（关键：映射成列表需要的home_0/draw_0等值）
        const mappedSpf = (this.selectedScores.spf || []).map((val) => this.spfMapping[val]).filter(Boolean);
        const mappedRspf = (this.selectedScores.rspf || []).map((val) => this.spfMapping[val]).filter(Boolean);
        mappedSpf.forEach((val) => selectedList.push(val));
        mappedRspf.forEach((val) => selectedList.push(val));

        // 处理比分/总进球/半全场（保留原有逻辑）
        (this.selectedScores.bifen || []).forEach((val) => val && selectedList.push(val));
        (this.selectedScores.zjq || []).forEach((val) => val && selectedList.push(val));
        (this.selectedScores.bqc || []).forEach((val) => val && selectedList.push(val));
        // 3. 深克隆目标场次+赋值正确的选中值（核心修复）
        const updatedItem = this.deepClone(targetItem);

        // 给selectedSpf赋映射后的值（列表能识别的格式）
        updatedItem.selectedSpf = this.deepClone([...mappedSpf, ...mappedRspf]); // 合并胜平负+让球胜平负
        updatedItem.selectedBifen = this.deepClone(this.selectedScores.bifen);
        updatedItem.selectedZjq = this.deepClone(this.selectedScores.zjq);
        updatedItem.selectedBqc = this.deepClone(this.selectedScores.bqc);
        updatedItem.selectedAll = this.deepClone(selectedList);
        // 4. 强制更新数组+触发视图刷新（保留原有逻辑）
        this.$set(this.finalDrawerList[targetDrawerIdx].lotteryList, targetItemIdx, updatedItem);

        // 5. 派发事件通知父组件（保留原有逻辑）
        this.$emit("confirm-mixed-select", {
          serialNumber: this.currentMatch.serial_number,
          id: this.currentMatch.id,
          selectedData: this.deepClone(this.selectedScores),
          finalDrawerList: this.deepClone(this.finalDrawerList),
          updatedItem: updatedItem,
        });

        // 6. 关闭弹窗
        this.closePopup();
      } catch (error) {
        uni.showToast({ title: "确认选中失败，请重试", icon: "none" });
      }
    },
    closePopup() {
      this.isPopupShow = false;
      this.selectedScores = { bifen: [], zjq: [], bqc: [], spf: [], rspf: [] };
    },
  },
};
</script>

<style scoped lang="scss">
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

// 基础布局样式（不影响弹框内板块）
.match-list {
  background-color: #f5f5f5;
  padding-bottom: 140rpx;
  // #ifdef MP-WEIXIN
  padding-bottom: 230rpx;
  // #endif
}

.drawer-wrapper {
  width: 100%;
  margin-bottom: 8rpx;
  background: #f5f5f5;
}

.sticky-header {
  position: sticky;
  z-index: 999;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8rpx 20rpx 12rpx;
  background-color: #f5f5f5;
  border-bottom: 1rpx solid #eee;
  font-size: 26rpx;
  color: #333;

  .drawer-title-text {
    font-size: 24rpx;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.arrow-icon {
  transition: transform 0.2s;
  font-size: 24rpx;
  color: #666;
}

.rotated {
  transform: rotate(180deg);
}

.drawer-content {
  width: 100%;
  transition: all 0.2s ease;
}

.match-row {
  background-color: #f6f6f6;
  border-bottom: 1rpx solid #dedede;
  box-sizing: border-box;
  padding: 0 20rpx;
  display: flex;
  flex-direction: column;
  margin-bottom: 4rpx;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.05);
  width: 100%;
  overflow: hidden;
}
.match-status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border-bottom: 1rpx solid #f5f5f5;
  .status-left {
    width: 200rpx;
    display: flex;
    align-items: center;
  }

  .single-tag {
    display: inline-block;
    padding-left: 6rpx;
    width: 60rpx;
    background: #b71c1c;
    color: #fff;
    text-align: left;
    font-size: 22rpx;
    border-top-right-radius: 15rpx;
    border-bottom-right-radius: 16rpx;
    margin-right: 10rpx;
  }

  .status-right {
    .ai-analysis-btn {
      font-size: 24rpx;
      color: #06f;
      cursor: pointer;
      transition: opacity 0.2s;
      letter-spacing: 4rpx;
      &:active {
        opacity: 0.8;
      }
    }
  }
}

.main-content-row {
  display: flex;
  width: 100%;
  gap: 16rpx;
  padding: 8rpx 0;
  overflow: hidden;
}

.main-left {
  width: 160rpx;
  display: flex;
  flex-direction: column;
  flex: none;
  gap: 8rpx;

  .top-left {
    margin-top: 8rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  .league-name {
    font-size: 22rpx;
    color: #777;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .bottom-left {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2rpx;
    width: 100%;
  }

  .serial-number,
  .match-time {
    width: 100%;
    font-size: 20rpx;
    color: #999;
    text-align: center;
  }

  .serial-number {
    margin-bottom: 10rpx;
  }
}

.main-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  background: #fff;
  overflow: hidden;
}

.top-right-layout {
  display: flex;
  width: 100%;
  border-bottom: 1rpx solid #eee;
  padding-bottom: 8rpx;

  .handicap-col {
    width: 40rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-right: 1rpx solid #eee;

    .handicap-text {
      font-size: 22rpx;
      color: #666;
      line-height: 1.2;
    }
  }

  .team-rate-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    padding: 0 10rpx;

    .team-vs {
      font-size: 24rpx;
      color: #333;
      text-align: center;
      padding: 4rpx 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;

      .team-name {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .team-name.away {
        text-align: right;
        padding-right: 10rpx;
      }

      .team-name.home {
        text-align: left;
        padding-left: 10rpx;
      }

      .vs-text {
        width: 100rpx;
        text-align: center;
        flex-shrink: 0;
        font-weight: 500;
      }
    }

    .rate-row {
      width: 100%;
      display: flex;
      align-items: center;
      font-size: 22rpx;
      color: #999;
      justify-content: center;

      .rate-text {
        flex: 1;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}

.bottom-right-layout {
  color: #666;
  display: flex;
  width: 100%;
  align-items: stretch;

  .handicap-value-col {
    width: 60rpx;
    display: flex;
    flex-direction: column;
    border-right: 1rpx solid #eee;

    .handicap-value-item {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e8e8e8;
      font-size: 24rpx;
      color: #666;

      &:first-child {
        border-radius: 4rpx 0 0 0;
        border-bottom: 1rpx solid #fff;
      }

      &:last-child {
        border-radius: 0 0 0 4rpx;
      }

      // 让球数值颜色样式
      &.positive {
        color: red;
      }

      &.negative {
        color: green;
      }
    }
  }

  .spf-select-col {
    flex: 1;
    display: flex;
    flex-direction: column;

    .spf-row {
      flex: 1;
      display: flex;

      .spf-btn {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 10rpx;
        background: #e8e8e8;
        font-size: 22rpx;
        color: #666;
        cursor: pointer;

        &:first-child {
          border-right: 1rpx solid #fff;
        }

        &:last-child {
          border-left: 1rpx solid #fff;
        }

        &.selected {
          background: #d92929;
          color: #fff;
        }

        &.disabled {
          background: #cccccc !important;
          color: #999999 !important;
          cursor: not-allowed;
          pointer-events: none;
        }

        .spf-text {
          flex: 1;
          text-align: left;
        }

        .spf-odds {
          flex: 0 0 auto;
          margin-left: 8rpx;
          font-size: 20rpx;
        }
      }

      &:first-child {
        border-bottom: 1rpx solid #fff;
        border-radius: 0 4rpx 0 0;
      }

      &:last-child {
        border-radius: 0 0 4rpx 0;
      }
    }
  }

  .expand-btn-col {
    background: #feeedf;
    width: 80rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-left: 1rpx solid #eee;
    cursor: pointer;

    .expand-text {
      font-size: 22rpx;
      color: #999;
      margin-bottom: 5rpx;
    }

    .expand-more {
      font-size: 20rpx;
      color: #999;
    }

    &.disabled {
      background: #e0e0e0 !important;
      cursor: not-allowed;
      pointer-events: none;

      .expand-text,
      .expand-more {
        color: #aaa;
      }
    }
  }
}

// ====================== 修复后弹窗布局（核心：头/底固定，中间滚动） ======================
.score-popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999999;
  touch-action: none; // 禁止遮罩滑动穿透
}

.score-popup {
  position: fixed;
  top: 52%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 85%;
  max-height: 75vh;
  height: 75vh; // 关键：补充height，让flex布局计算高度
  background: #fff;
  border-radius: 12rpx;
  z-index: 9999999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}

// 弹窗加载中样式
.popup-loading {
  padding: 40rpx 0;
  text-align: center;
  font-size: 26rpx;
  color: #999;
  flex-shrink: 0;
}

// 弹窗内容容器
.popup-content-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1; // 关键：替换height:100%，继承父级flex高度
  width: 100%;
  height: 100%;
}

.popup-header {
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
  flex-shrink: 0; // 核心：不被flex压缩，固定高度
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

// 第一行：队名VS队名
.popup-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  text-align: center;
  padding: 8rpx 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  // 停售标签
  .popup-stop-tag {
    display: inline-block;
    font-size: 22rpx;
    color: #fff;
    background: #999;
    border-radius: 4rpx;
    padding: 2rpx 8rpx;
    margin-left: 12rpx;
    vertical-align: middle;
    line-height: 1;
  }
}

// 胜率/平率/负率 样式（第二行）
.match-stat-info.stat-spf {
  display: flex;
  justify-content: center;
  gap: 30rpx;
  font-size: 24rpx;
  color: #666;
}

// 预测比分 样式（第三行 - 单独居中【核心】）
.match-stat-info.stat-score {
  display: flex;
  justify-content: center;
  font-size: 24rpx;
  color: #666;
}

// 统计项通用样式
.stat-item {
  display: flex;
  align-items: center;
}
.stat-label {
  margin-right: 4rpx;
  color: #888;
}
.stat-value {
  color: #666;
}

// 中间滚动区域 - 仅这里可滚动
.popup-scroll-content {
  flex: 1; // 占满剩余空间
  overflow-y: auto; // 垂直滚动
  -webkit-overflow-scrolling: touch; // 小程序弹性滚动
  padding: 0 20rpx;
  // 隐藏所有内核滚动条
  scrollbar-width: none; // 火狐
  -ms-overflow-style: none; // IE/Edge
  ::-webkit-scrollbar {
    display: none; // 微信小程序内核
  }
}

// 弹窗内玩法模块样式（补充完整，确保滚动内容有样式）
.score-section {
  display: flex;
  align-items: stretch;
  padding: 0;
  border-bottom: 1rpx solid #f5f5f5;
  margin-bottom: 14rpx;
}

.section-label {
  flex: 0 0 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx 4rpx;
  border-radius: 4rpx 0 0 4rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 500;
  color: #fff;
  writing-mode: vertical-rl;
  letter-spacing: 2rpx;
}

.bifen-label {
  background: #6fbdbd;
}
.spf-label {
  background: #6fbdbd;
}
.rspf-label {
  background: #6ab284;
}
.zjq-label {
  background: #6ab284;
}
.bqc-label {
  background: #6fbdbd;
}

.bifen-options {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.bifen-row {
  display: flex;
  width: 100%;
  border-bottom: 1rpx solid #eee;

  &:last-child {
    border-bottom: none;
  }
}

.bifen-item {
  flex: 1;
  padding: 12rpx 0;
  background: #f9f9f9;
  border: 1rpx solid #eee;
  text-align: center;
  cursor: pointer;
  color: #999;
  transition: all 0.2s ease;

  .score-text {
    font-size: 22rpx;
    display: block;
  }
  .score-odds {
    font-size: 18rpx;
  }

  &.selected {
    background: #d92929;
    color: #fff !important;
  }
  &.disabled {
    background: #ccc !important;
    color: #999 !important;
    cursor: not-allowed;
    pointer-events: none;
  }
}

.bifen-other {
  flex: 3;
  background: #f8f8f8;
}

.spf-options {
  flex: 1;
  display: flex;
}
.spf-item {
  flex: 1;
  padding: 12rpx 0;
  background: #f9f9f9;
  border: 1rpx solid #eee;
  text-align: center;
  cursor: pointer;
  color: #999;
  transition: all 0.2s;
  .score-text {
    font-size: 22rpx;
    display: block;
  }
  .score-odds {
    font-size: 18rpx;
  }
  &.selected {
    background: #d92929;
    color: #fff !important;
  }
  &.disabled {
    background: #ccc !important;
    color: #999 !important;
    cursor: not-allowed;
    pointer-events: none;
  }
}

.rspf-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.rspf-options {
  display: flex;
  width: 100%;
}
.rspf-item {
  flex: 1;
  padding: 12rpx 0;
  background: #f9f9f9;
  border: 1rpx solid #eee;
  text-align: center;
  cursor: pointer;
  color: #999;
  transition: all 0.2s;
  .score-text {
    font-size: 22rpx;
    display: block;
  }
  .score-odds {
    font-size: 18rpx;
  }
  &.selected {
    background: #d92929;
    color: #fff !important;
  }
  &.disabled {
    background: #ccc !important;
    color: #999 !important;
    cursor: not-allowed;
    pointer-events: none;
  }
}
.rspf-tip {
  font-size: 20rpx;
  color: #999;
  padding: 8rpx 12rpx;
  background: #f5f5f5;
  border-top: 1rpx solid #eee;
  text-align: center;
}

.zjq-options {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
}
.zjq-item {
  width: 25%;
  padding: 12rpx 0;
  background: #f9f9f9;
  border: 1rpx solid #eee;
  text-align: center;
  cursor: pointer;
  color: #999;
  transition: all 0.2s;
  .score-text {
    font-size: 22rpx;
    display: block;
  }
  .score-odds {
    font-size: 18rpx;
  }
  &.selected {
    background: #d92929;
    color: #fff !important;
  }
  &.disabled {
    background: #ccc !important;
    color: #999 !important;
    cursor: not-allowed;
    pointer-events: none;
  }
}

.bqc-options {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.bqc-row {
  display: flex;
  width: 100%;
}
.bqc-item {
  flex: 1;
  padding: 12rpx 0;
  background: #f9f9f9;
  border: 1rpx solid #eee;
  text-align: center;
  cursor: pointer;
  color: #999;
  transition: all 0.2s;
  .score-text {
    font-size: 22rpx;
    display: block;
  }
  .score-odds {
    font-size: 18rpx;
  }
  &.selected {
    background: #d92929;
    color: #fff !important;
  }
  &.disabled {
    background: #ccc !important;
    color: #999 !important;
    cursor: not-allowed;
    pointer-events: none;
  }
}

// 弹窗底部按钮栏 - 固定不滚动
.popup-btn-bar {
  display: flex;
  gap: 8rpx;
  padding: 12rpx 20rpx 20rpx;
  flex-shrink: 0; // 固定高度，不滚动
  margin-top: 0;
}

.cancel-btn {
  flex: 1;
  height: 60rpx;
  line-height: 60rpx;
  background: #f5f5f5;
  color: #333;
  border-radius: 8rpx;
  font-size: 26rpx;
  border: none;
}

.confirm-btn {
  flex: 1;
  height: 60rpx;
  line-height: 60rpx;
  background: #d92929;
  color: #fff;
  border-radius: 8rpx;
  font-size: 26rpx;
  border: none;

  &[disabled] {
    background: #ccc !important;
    color: #999 !important;
  }
}

// 小程序兼容样式
::-webkit-scrollbar {
  display: none;
}

/* #ifdef APP-PLUS */
.popup-btn-bar {
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}
/* #endif */

button::after {
  border: none;
}
</style>
