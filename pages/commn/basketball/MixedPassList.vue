<template>
  <!-- 胜分差页面：让球+胜平负 列表多选布局 -->
  <view class="match-list" :style="{ paddingTop: paddingTopVal + 'rpx'  }">
    <!-- 抽屉循环容器 -->
    <view v-for="(drawer, drawerIdx) in finalDrawerList" :key="drawerIdx" class="drawer-wrapper">
      <view 
        class="date-title sticky-header" 
        :style="{ top: stickyHeaderTop + 'rpx'  }"
        @click="toggleDrawer(drawerIdx)"
        hover-class="none"
      >
        <text class="drawer-title-text">{{ drawer.title }}</text>
        <view class="arrow-icon" :class="[{rotated: expandedDrawers[drawerIdx]}]">↓</view>
      </view>

      <!-- 抽屉内容：列表多选布局 -->
      <view class="drawer-content" v-show="expandedDrawers[drawerIdx]">
        <view v-for="(item, index) in drawer.lotteryList" :key="index" class="match-row">
          <!-- 状态行 -->
          <view class="match-status-row">
            <view class="status-left">
              <text class="single-tag" v-if="item.is_sfc_single == 1 && item.is_stop == 1">单场</text>
            </view>
            <view class="status-right">
              <view class="ai-analysis-btn" v-if="item.home_win_rate && item.visiting_win_rate"
                @click.stop="goToAiAnalysis.bind(null, item)">分析</view>
            </view>
          </view>

          <!-- 核心多层左右布局 -->
          <view class="main-content-row">
            <view class="main-left">
              <view class="top-left">
                  <text class="league-name">{{ item.league_name || '未知联赛' }}</text>
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
                    <text class="team-name away">{{ item.visiting_name }}</text>
                    <text class="vs-text">VS</text>
                    <text class="team-name home">{{ item.home_name }}</text>
                  </view>
                  <view class="rate-row">
                    <text class="rate-text away">胜率{{ item.visiting_win_rate !== undefined && item.visiting_win_rate !== null ? item.visiting_win_rate : '--' }} </text>
                    <text class="vs-text"></text>
                    <text class="rate-text home">胜率{{ item.home_win_rate !== undefined && item.home_win_rate !== null ? item.home_win_rate : '--' }} </text>
                  </view>
                </view>
              </view>
              
              <view class="bottom-right-layout">
                <view class="handicap-value-col">
                  <view class="handicap-value-item">0</view>
                  <!-- 兼容写法：去掉模板字符串，纯数组+方法调用 -->
                  <view class="handicap-value-item" :class="[getHandicapColorClass(item.r_goal)]">
                    {{ item.r_goal !== undefined && item.r_goal !== null ? item.r_goal : '0' }}
                  </view>
                </view>
                <view class="spf-select-col">
                  <view class="spf-row">
                    <view class="spf-btn" :class="[{selected: checkSelected(item.selectedSpf, 'home_0'), disabled: item.is_stop == 1 || !item.win_multiplier}]" @click="handleSpfMultiClick.bind(null, item, 'home_0')">
                      <text class="spf-text">主胜</text>
                      <text class="spf-odds">{{ item.win_multiplier !== undefined && item.win_multiplier !== null ? item.win_multiplier : '--' }}</text>
                    </view>
                    <view class="spf-btn" :class="[{selected: checkSelected(item.selectedSpf, 'draw_0'), disabled: item.is_stop == 1 || !item.draw_multiplier}]" @click="handleSpfMultiClick.bind(null, item, 'draw_0')">
                      <text class="spf-text">平</text>
                      <text class="spf-odds">{{ item.draw_multiplier !== undefined && item.draw_multiplier !== null ? item.draw_multiplier : '--' }}</text>
                    </view>
                    <view class="spf-btn" :class="[{selected: checkSelected(item.selectedSpf, 'away_0'), disabled: item.is_stop == 1 || !item.loss_multiplier}]" @click="handleSpfMultiClick.bind(null, item, 'away_0')">
                      <text class="spf-text">客胜</text>
                      <text class="spf-odds">{{ item.loss_multiplier !== undefined && item.loss_multiplier !== null ? item.loss_multiplier : '--' }}</text>
                    </view>
                  </view>
                  <view class="spf-row">
                    <view class="spf-btn" :class="[{selected: checkSelected(item.selectedSpf, 'home_-1'), disabled: item.is_stop == 1}]" @click="handleSpfMultiClick.bind(null, item, 'home_-1')">
                      <text class="spf-text">主胜</text>
                      <text class="spf-odds">{{ item.r_win_multiplier !== undefined && item.r_win_multiplier !== null ? item.r_win_multiplier : '--' }}</text>
                    </view>
                    <view class="spf-btn" :class="[{selected: checkSelected(item.selectedSpf, 'draw_-1'), disabled: item.is_stop == 1}]" @click="handleSpfMultiClick.bind(null, item, 'draw_-1')">
                      <text class="spf-text">平</text>
                      <text class="spf-odds">{{ item.r_draw_multiplier !== undefined && item.r_draw_multiplier !== null ? item.r_draw_multiplier : '--' }}</text>
                    </view>
                    <view class="spf-btn" :class="[{selected: checkSelected(item.selectedSpf, 'away_-1'), disabled: item.is_stop == 1}]" @click="handleSpfMultiClick.bind(null, item, 'away_-1')">
                      <text class="spf-text">客胜</text>
                      <text class="spf-odds">{{ item.r_loss_multiplier !== undefined && item.r_loss_multiplier !== null ? item.r_loss_multiplier : '--' }}</text>
                    </view>
                  </view>
                </view>
                <view class="expand-btn-col" @click="openScorePopup.bind(null, item)">
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
    <view class="score-popup-mask" v-show="isPopupShow && currentMatch" @click="closePopup" hover-class="none"></view>
    <view class="score-popup" v-show="isPopupShow && currentMatch">
      <view v-if="isLoading" class="popup-loading">
        <text>加载赔率中...</text>
      </view>
      <view v-else>
        <view class="popup-title"> 
          {{ currentMatch.visiting_name + '(客)' }} VS {{ currentMatch.home_name + '(主)' }}
        </view>
        <!-- 胜平负板块 -->
        <view class="score-section">
          <view class="section-label spf-label">胜平负</view>
          <view class="spf-options">
            <view class="spf-item" @click="handleScoreToggle.bind(null, 'spf', '胜平负_主胜')" :class="[getScoreClass('spf', '胜平负_主胜', currentMatch.win_multiplier)]">
              <text class="score-text">主胜</text>
              <text class="score-odds">{{ currentMatch.win_multiplier !== undefined && currentMatch.win_multiplier !== null ? currentMatch.win_multiplier : '--' }}</text>
            </view>
            <view class="spf-item" @click="handleScoreToggle.bind(null, 'spf', '胜平负_平')" :class="[getScoreClass('spf', '胜平负_平', currentMatch.draw_multiplier)]">
              <text class="score-text">平</text>
              <text class="score-odds">{{ currentMatch.draw_multiplier !== undefined && currentMatch.draw_multiplier !== null ? currentMatch.draw_multiplier : '--' }}</text>
            </view>
            <view class="spf-item" @click="handleScoreToggle.bind(null, 'spf', '胜平负_客胜')" :class="[getScoreClass('spf', '胜平负_客胜', currentMatch.loss_multiplier)]">
              <text class="score-text">客胜</text>
              <text class="score-odds">{{ currentMatch.loss_multiplier !== undefined && currentMatch.loss_multiplier !== null ? currentMatch.loss_multiplier : '--' }}</text>
            </view>
          </view>
        </view>

        <!-- 让球胜平负板块 -->
        <view class="score-section">
          <view class="section-label rspf-label">让球</view>
          <view class="rspf-container">
            <view class="rspf-options">
              <view class="rspf-item" @click="handleScoreToggle.bind(null, 'rspf', '让胜平负_让主胜')" :class="[getScoreClass('rspf', '让胜平负_让主胜')]">
                <text class="score-text">主胜【让】</text>
                <text class="score-odds">{{ currentMatch.r_win_multiplier !== undefined && currentMatch.r_win_multiplier !== null ? currentMatch.r_win_multiplier : '--' }}</text>
              </view>
              <view class="rspf-item" @click="handleScoreToggle.bind(null, 'rspf', '让胜平负_让平')" :class="[getScoreClass('rspf', '让胜平负_让平')]">
                <text class="score-text">平【让】</text>
                <text class="score-odds">{{ currentMatch.r_draw_multiplier !== undefined && currentMatch.r_draw_multiplier !== null ? currentMatch.r_draw_multiplier : '--' }}</text>
              </view>
              <view class="rspf-item" @click="handleScoreToggle.bind(null, 'rspf', '让胜平负_让客胜')" :class="[getScoreClass('rspf', '让胜平负_让客胜')]">
                <text class="score-text">客胜【让】</text>
                <text class="score-odds">{{ currentMatch.r_loss_multiplier !== undefined && currentMatch.r_loss_multiplier !== null ? currentMatch.r_loss_multiplier : '--' }}</text>
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
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_1:0')" :class="[getScoreClass('bifen', '比分_1:0')]">
                <text class="score-text">1:0</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'ybl') }}</text>
              </view>
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_2:0')" :class="[getScoreClass('bifen', '比分_2:0')]">
                <text class="score-text">2:0</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'ebl') }}</text>
              </view>
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_2:1')" :class="[getScoreClass('bifen', '比分_2:1')]">
                <text class="score-text">2:1</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'eby') }}</text>
              </view>
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_3:0')" :class="[getScoreClass('bifen', '比分_3:0')]">
                <text class="score-text">3:0</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'sbl') }}</text>
              </view>
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_3:1')" :class="[getScoreClass('bifen', '比分_3:1')]">
                <text class="score-text">3:1</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'sby') }}</text>
              </view>
            </view>
            <view class="bifen-row">
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_3:2')" :class="[getScoreClass('bifen', '比分_3:2')]">
                <text class="score-text">3:2</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'sbe') }}</text>
              </view>
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_4:0')" :class="[getScoreClass('bifen', '比分_4:0')]">
                <text class="score-text">4:0</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'sibl') }}</text>
              </view>
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_4:1')" :class="[getScoreClass('bifen', '比分_4:1')]">
                <text class="score-text">4:1</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'siby') }}</text>
              </view>
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_4:2')" :class="[getScoreClass('bifen', '比分_4:2')]">
                <text class="score-text">4:2</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'sibe') }}</text>
              </view>
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_5:0')" :class="[getScoreClass('bifen', '比分_5:0')]">
                <text class="score-text">5:0</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'wbl') }}</text>
              </view>
            </view>
            <view class="bifen-row">
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_5:1')" :class="[getScoreClass('bifen', '比分_5:1')]">
                <text class="score-text">5:1</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'wby') }}</text>
              </view>
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_5:2')" :class="[getScoreClass('bifen', '比分_5:2')]">
                <text class="score-text">5:2</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'wbe') }}</text>
              </view>
              <view class="bifen-item bifen-other" @click="handleScoreToggle.bind(null, 'bifen', '比分_胜其它')" :class="[getScoreClass('bifen', '比分_胜其它')]">
                <text class="score-text">胜其它</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'sqt') }}</text>
              </view>
            </view>

            <!-- 平比分行 -->
            <view class="bifen-row">
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_0:0')" :class="[getScoreClass('bifen', '比分_0:0')]">
                <text class="score-text">0:0</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'lwl') }}</text>
              </view>
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_1:1')" :class="[getScoreClass('bifen', '比分_1:1')]">
                <text class="score-text">1:1</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'yby') }}</text>
              </view>
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_2:2')" :class="[getScoreClass('bifen', '比分_2:2')]">
                <text class="score-text">2:2</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'ebs') }}</text>
              </view>
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_3:3')" :class="[getScoreClass('bifen', '比分_3:3')]">
                <text class="score-text">3:3</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'fqt') }}</text>
              </view>
              <view class="bifen-item bifen-other" @click="handleScoreToggle.bind(null, 'bifen', '比分_平其它')" :class="[getScoreClass('bifen', '比分_平其它')]">
                <text class="score-text">平其它</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'pqt') }}</text>
              </view>
            </view>

            <!-- 客胜比分行 -->
            <view class="bifen-row">
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_0:1')" :class="[getScoreClass('bifen', '比分_0:1')]">
                <text class="score-text">0:1</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'lby') }}</text>
              </view>
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_0:2')" :class="[getScoreClass('bifen', '比分_0:2')]">
                <text class="score-text">0:2</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'lbe') }}</text>
              </view>
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_1:2')" :class="[getScoreClass('bifen', '比分_1:2')]">
                <text class="score-text">1:2</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'ybs') }}</text>
              </view>
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_0:3')" :class="[getScoreClass('bifen', '比分_0:3')]">
                <text class="score-text">0:3</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'lbl') }}</text>
              </view>
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_1:3')" :class="[getScoreClass('bifen', '比分_1:3')]">
                <text class="score-text">1:3</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'lbe') }}</text>
              </view>
            </view>
            <view class="bifen-row">
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_2:3')" :class="[getScoreClass('bifen', '比分_2:3')]">
                <text class="score-text">2:3</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'lbsan') }}</text>
              </view>
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_0:4')" :class="[getScoreClass('bifen', '比分_0:4')]">
                <text class="score-text">0:4</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'lbsi') }}</text>
              </view>
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_1:4')" :class="[getScoreClass('bifen', '比分_1:4')]">
                <text class="score-text">1:4</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'ybsi') }}</text>
              </view>
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_2:4')" :class="[getScoreClass('bifen', '比分_2:4')]">
                <text class="score-text">2:4</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'ebsi') }}</text>
              </view>
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_0:5')" :class="[getScoreClass('bifen', '比分_0:5')]">
                <text class="score-text">0:5</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'lbw') }}</text>
              </view>
            </view>
            <view class="bifen-row">
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_1:5')" :class="[getScoreClass('bifen', '比分_1:5')]">
                <text class="score-text">1:5</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'ybw') }}</text>
              </view>
              <view class="bifen-item" @click="handleScoreToggle.bind(null, 'bifen', '比分_2:5')" :class="[getScoreClass('bifen', '比分_2:5')]">
                <text class="score-text">2:5</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'ebw') }}</text>
              </view>
              <view class="bifen-item bifen-other" @click="handleScoreToggle.bind(null, 'bifen', '比分_负其它')" :class="[getScoreClass('bifen', '比分_负其它')]">
                <text class="score-text">负其它</text>
                <text class="score-odds">{{ getScoreValue(currentMatch, 'data2', 'sqt') }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 总进球板块 -->
        <view class="score-section">
          <view class="section-label zjq-label">总进球</view>
          <view class="zjq-options">
            <view class="zjq-item" @click="handleScoreToggle.bind(null, 'zjq', '总进球_0')" :class="[getScoreClass('zjq', '总进球_0')]">
              <text class="score-text">0</text>
              <text class="score-odds">{{ currentMatch.zjq_ling !== undefined && currentMatch.zjq_ling !== null ? currentMatch.zjq_ling : '--' }}</text>
            </view>
            <view class="zjq-item" @click="handleScoreToggle.bind(null, 'zjq', '总进球_1')" :class="[getScoreClass('zjq', '总进球_1')]">
              <text class="score-text">1</text>
              <text class="score-odds">{{ currentMatch.zjq_yi !== undefined && currentMatch.zjq_yi !== null ? currentMatch.zjq_yi : '--' }}</text>
            </view>
            <view class="zjq-item" @click="handleScoreToggle.bind(null, 'zjq', '总进球_2')" :class="[getScoreClass('zjq', '总进球_2')]">
              <text class="score-text">2</text>
              <text class="score-odds">{{ currentMatch.zjq_er !== undefined && currentMatch.zjq_er !== null ? currentMatch.zjq_er : '--' }}</text>
            </view>
            <view class="zjq-item" @click="handleScoreToggle.bind(null, 'zjq', '总进球_3')" :class="[getScoreClass('zjq', '总进球_3')]">
              <text class="score-text">3</text>
              <text class="score-odds">{{ currentMatch.zjq_san !== undefined && currentMatch.zjq_san !== null ? currentMatch.zjq_san : '--' }}</text>
            </view>
            <view class="zjq-item" @click="handleScoreToggle.bind(null, 'zjq', '总进球_4')" :class="[getScoreClass('zjq', '总进球_4')]">
              <text class="score-text">4</text>
              <text class="score-odds">{{ currentMatch.zjq_si !== undefined && currentMatch.zjq_si !== null ? currentMatch.zjq_si : '--' }}</text>
            </view>
            <view class="zjq-item" @click="handleScoreToggle.bind(null, 'zjq', '总进球_5')" :class="[getScoreClass('zjq', '总进球_5')]">
              <text class="score-text">5</text>
              <text class="score-odds">{{ currentMatch.zjq_wu !== undefined && currentMatch.zjq_wu !== null ? currentMatch.zjq_wu : '--' }}</text>
            </view>
            <view class="zjq-item" @click="handleScoreToggle.bind(null, 'zjq', '总进球_6')" :class="[getScoreClass('zjq', '总进球_6')]">
              <text class="score-text">6</text>
              <text class="score-odds">{{ currentMatch.zjq_liu !== undefined && currentMatch.zjq_liu !== null ? currentMatch.zjq_liu : '--' }}</text>
            </view>
            <view class="zjq-item" @click="handleScoreToggle.bind(null, 'zjq', '总进球_7+')" :class="[getScoreClass('zjq', '总进球_7+')]">
              <text class="score-text">7+</text>
              <text class="score-odds">{{ currentMatch.zjq_qi_jia !== undefined && currentMatch.zjq_qi_jia !== null ? currentMatch.zjq_qi_jia : '--' }}</text>
            </view>
          </view>
        </view>

        <!-- 半全场板块 -->
        <view class="score-section">
          <view class="section-label bqc-label">半全场</view>
          <view class="bqc-options">
            <view class="bqc-row">
              <view class="bqc-item" @click="handleScoreToggle.bind(null, 'bqc', '半全场_胜胜')" :class="[getScoreClass('bqc', '半全场_胜胜')]">
                <text class="score-text">胜胜</text>
                <text class="score-odds">{{ currentMatch.ss !== undefined && currentMatch.ss !== null ? currentMatch.ss : '--' }}</text>
              </view>
              <view class="bqc-item" @click="handleScoreToggle.bind(null, 'bqc', '半全场_胜平')" :class="[getScoreClass('bqc', '半全场_胜平')]">
                <text class="score-text">胜平</text>
                <text class="score-odds">{{ currentMatch.sp !== undefined && currentMatch.sp !== null ? currentMatch.sp : '--' }}</text>
              </view>
              <view class="bqc-item" @click="handleScoreToggle.bind(null, 'bqc', '半全场_胜负')" :class="[getScoreClass('bqc', '半全场_胜负')]">
                <text class="score-text">胜负</text>
                <text class="score-odds">{{ currentMatch.sf !== undefined && currentMatch.sf !== null ? currentMatch.sf : '--' }}</text>
              </view>
            </view>
            <view class="bqc-row">
              <view class="bqc-item" @click="handleScoreToggle.bind(null, 'bqc', '半全场_平胜')" :class="[getScoreClass('bqc', '半全场_平胜')]">
                <text class="score-text">平胜</text>
                <text class="score-odds">{{ currentMatch.ps !== undefined && currentMatch.ps !== null ? currentMatch.ps : '--' }}</text>
              </view>
              <view class="bqc-item" @click="handleScoreToggle.bind(null, 'bqc', '半全场_平平')" :class="[getScoreClass('bqc', '半全场_平平')]">
                <text class="score-text">平平</text>
                <text class="score-odds">{{ currentMatch.pp !== undefined && currentMatch.pp !== null ? currentMatch.pp : '--' }}</text>
              </view>
              <view class="bqc-item" @click="handleScoreToggle.bind(null, 'bqc', '半全场_平负')" :class="[getScoreClass('bqc', '半全场_平负')]">
                <text class="score-text">平负</text>
                <text class="score-odds">{{ currentMatch.pf !== undefined && currentMatch.pf !== null ? currentMatch.pf : '--' }}</text>
              </view>
            </view>
            <view class="bqc-row">
              <view class="bqc-item" @click="handleScoreToggle.bind(null, 'bqc', '半全场_负胜')" :class="[getScoreClass('bqc', '半全场_负胜')]">
                <text class="score-text">负胜</text>
                <text class="score-odds">{{ currentMatch.fs !== undefined && currentMatch.fs !== null ? currentMatch.fs : '--' }}</text>
              </view>
              <view class="bqc-item" @click="handleScoreToggle.bind(null, 'bqc', '半全场_负平')" :class="[getScoreClass('bqc', '半全场_负平')]">
                <text class="score-text">负平</text>
                <text class="score-odds">{{ currentMatch.fp !== undefined && currentMatch.fp !== null ? currentMatch.fp : '--' }}</text>
              </view>
              <view class="bqc-item" @click="handleScoreToggle.bind(null, 'bqc', '半全场_负负')" :class="[getScoreClass('bqc', '半全场_负负')]">
                <text class="score-text">负负</text>
                <text class="score-odds">{{ currentMatch.ff !== undefined && currentMatch.ff !== null ? currentMatch.ff : '--' }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 底部按钮栏 -->
        <view class="popup-btn-bar">
          <button class="cancel-btn" @click="closePopup" hover-class="none">取消</button>
          <button class="confirm-btn" @click="confirmSelection" hover-class="none" :disabled="currentMatch.is_stop == 1">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
import { queryHomeAndVisitingGoalOdds, queryHhgg } from "@/api/demo";
export default {
  props: {
    matchList: { type: Array, default: function() { return []; } },
    statusBarHeight: { type: Number, default: 0 },
    goToAiAnalysis: { type: Function, required: true },
    drawerList: { type: Array, default: function() { return []; } }
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
        '胜平负_主胜': 'home_0', '胜平负_平': 'draw_0', '胜平负_客胜': 'away_0',
        '让胜平负_让主胜': 'home_-1', '让胜平负_让平': 'draw_-1', '让胜平负_让客胜': 'away_-1'
      },
      reverseSpfMapping: {
        'home_0': '胜平负_主胜', 'draw_0': '胜平负_平', 'away_0': '胜平负_客胜',
        'home_-1': '让胜平负_让主胜', 'draw_-1': '让胜平负_让平', 'away_-1': '让胜平负_让客胜'
      }
    };
  },
  computed: {
    finalDrawerList() {
      if (this.drawerList.length > 0) {
        return this.drawerList;
      } else {
        if (this.matchList.length > 0) {
          return [{ title: '周四 2025-12-04 共' + this.matchList.length + '场比赛', lotteryList: this.matchList }]; // 修复：模板字符串改为拼接
        } else {
          return [];
        }
      }
    },
    selectedMatchCount() {
      var count = 0;
      this.finalDrawerList.forEach(function(drawer) {
        drawer.lotteryList.forEach(function(item) {
          var hasSpf = item.selectedSpf && item.selectedSpf.length > 0;
          var hasOther = (item.selectedBifen && item.selectedBifen.length > 0) || 
                         (item.selectedZjq && item.selectedZjq.length > 0) || 
                         (item.selectedBqc && item.selectedBqc.length > 0);
          if (hasSpf || hasOther) {
            count++;
          }
        });
      });
      return count;
    },
    paddingTopVal() { return this.statusBarHeightRpx + 88; },
    stickyHeaderTop() { return this.statusBarHeightRpx + 88; }
  },
  watch: {
    finalDrawerList(newVal) {
      this.expandedDrawers = [];
      for (var i = 0; i < newVal.length; i++) {
        this.expandedDrawers.push(true);
      }
      newVal.forEach(function(drawer) {
        drawer.lotteryList.forEach(function(item) {
          // 强制初始化选中数组，避免undefined
          if (!item.selectedSpf) {
            this.$set(item, 'selectedSpf', []);
          }
          if (!item.selectedBifen) {
            this.$set(item, 'selectedBifen', []);
          }
          if (!item.selectedZjq) {
            this.$set(item, 'selectedZjq', []);
          }
          if (!item.selectedBqc) {
            this.$set(item, 'selectedBqc', []);
          }
        }.bind(this));
      }.bind(this));
    },
    statusBarHeight(newVal) { this.statusBarHeightRpx = this.pxToRpx(newVal); }
  },
  created() {
    this.initWindowInfo();
    this.statusBarHeightRpx = this.pxToRpx(this.statusBarHeight);
    this.expandedDrawers = [];
    for (var i = 0; i < this.finalDrawerList.length; i++) {
      this.expandedDrawers.push(true);
    }
    this.finalDrawerList.forEach(function(drawer) {
      drawer.lotteryList.forEach(function(item) {
        // 强制初始化选中数组，避免undefined
        if (!item.selectedSpf) {
          this.$set(item, 'selectedSpf', []);
        }
        if (!item.selectedBifen) {
          this.$set(item, 'selectedBifen', []);
        }
        if (!item.selectedZjq) {
          this.$set(item, 'selectedZjq', []);
        }
        if (!item.selectedBqc) {
          this.$set(item, 'selectedBqc', []);
        }
      }.bind(this));
    }.bind(this));
  },
  methods: {
    // 新增方法：判断让球数值颜色类
    getHandicapColorClass(value) {
      // 处理空值/默认值
      var num = Number(value || 0); // 修复：const改为var兼容
      if (num < 0) return 'negative'; // 负数绿色
      if (num > 0) return 'positive'; // 正数红色
      return ''; // 0无特殊颜色
    },
    // 兼容版取值方法（核心：替代?.和??）
    getScoreValue(obj, parentKey, key) {
      if (obj && obj[parentKey] && obj[parentKey][key] !== undefined && obj[parentKey][key] !== null) {
        return obj[parentKey][key];
      } else {
        return '--';
      }
    },
    // 检查列表选中状态（核心修复：列表不显示选中的关键）
    checkSelected(arr, val) {
      // 确保数组存在，避免报错
      if (!arr || arr.length === 0) {
        return false;
      }
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] === val) {
          return true;
        }
      }
      return false;
    },
    initWindowInfo() {
      try {
        var systemInfo = uni.getSystemInfoSync();
        this.windowWidth = systemInfo.windowWidth || 375;
      } catch (e) {
        this.windowWidth = 375;
        console.warn('获取窗口信息失败:', e);
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
    handleSpfMultiClick(item, spfType) {
      if (item.is_stop == 1) {
        uni.showToast({ title: '该场次已停售', icon: 'none' });
        return;
      }
      // 新增：胜平负类型额外判断赔率值
      var isSpfType = ['home_0', 'draw_0', 'away_0'].indexOf(spfType) > -1; // 修复：includes改为indexOf兼容
      if (isSpfType) {
        var multiplierKey = {
          home_0: 'win_multiplier',
          draw_0: 'draw_multiplier',
          away_0: 'loss_multiplier'
        }[spfType];
        if (!item[multiplierKey]) {
          uni.showToast({ title: '该选项暂无赔率', icon: 'none' });
          return;
        }
      }
      var isSelected = this.checkSelected(item.selectedSpf, spfType);
      if (!isSelected) {
        var currentSelected = (item.selectedSpf && item.selectedSpf.length > 0) || 
                             (item.selectedBifen && item.selectedBifen.length > 0) || 
                             (item.selectedZjq && item.selectedZjq.length > 0) || 
                             (item.selectedBqc && item.selectedBqc.length > 0);
        if (!currentSelected && this.selectedMatchCount >= this.MAX_MATCH_COUNT) {
          uni.showToast({ title: '最多选' + this.MAX_MATCH_COUNT + '场', icon: 'none' }); // 修复：模板字符串改为拼接
          return;
        }
        // 新增选中值
        item.selectedSpf.push(spfType);
      } else {
        // 删除选中值
        var newArr = [];
        for (var i = 0; i < item.selectedSpf.length; i++) {
          if (item.selectedSpf[i] !== spfType) {
            newArr.push(item.selectedSpf[i]);
          }
        }
        item.selectedSpf = newArr;
      }
      this.$emit("toggle-spf-multi-select", item);
    },
    // 修改：getScoreClass增加赔率值参数，支持胜平负禁用判断
    getScoreClass(plate, value, multiplier) {
      var arr = this.selectedScores[plate] || [];
      var isDisabled = (function() { // 修复：箭头函数改为普通函数
        // 基础禁用条件：停售
        if (this.currentMatch.is_stop == 1) return true;
        // 胜平负额外判断赔率值
        if (plate === 'spf' && multiplier === undefined) return true;
        return false;
      }).bind(this)();
      return { 
        selected: this.checkSelected(arr, value), 
        disabled: isDisabled
      };
    },
    handleScoreToggle(plate, value) {
      if (this.isLoading || this.currentMatch.is_stop == 1) {
        uni.showToast({ title: '操作不可用', icon: 'none' });
        return;
      }
      // 新增：胜平负类型额外判断赔率值
      if (plate === 'spf') {
        var multiplierKey = {
          '胜平负_主胜': 'win_multiplier',
          '胜平负_平': 'draw_multiplier',
          '胜平负_客胜': 'loss_multiplier'
        }[value];
        if (!this.currentMatch[multiplierKey]) {
          uni.showToast({ title: '该选项暂无赔率', icon: 'none' });
          return;
        }
      }
      // 确保数组存在
      if (!this.selectedScores[plate]) {
        this.$set(this.selectedScores, plate, []);
      }
      var current = this.selectedScores[plate];
      var isSelected = this.checkSelected(current, value);
      if (!isSelected) {
        if (current.length >= this.MAX_SELECT_COUNT) {
          uni.showToast({ title: '最多选' + this.MAX_SELECT_COUNT + '个', icon: 'none' }); // 修复：模板字符串改为拼接
          return;
        }
        current.push(value);
      } else {
        var newArr = [];
        for (var i = 0; i < current.length; i++) {
          if (current[i] !== value) {
            newArr.push(current[i]);
          }
        }
        this.$set(this.selectedScores, plate, newArr);
      }
    },
    openScorePopup(match) {
      var currentSelected = (match.selectedSpf && match.selectedSpf.length > 0) || 
                           (match.selectedBifen && match.selectedBifen.length > 0) || 
                           (match.selectedZjq && match.selectedZjq.length > 0) || 
                           (match.selectedBqc && match.selectedBqc.length > 0);
      if (!currentSelected && this.selectedMatchCount >= this.MAX_MATCH_COUNT) {
        uni.showToast({ title: '最多选' + this.MAX_MATCH_COUNT + '场', icon: 'none' }); // 修复：模板字符串改为拼接
        return;
      }
      // 深拷贝避免修改原数据
      this.currentMatch = JSON.parse(JSON.stringify(match));
      // 确保data2存在
      if (!this.currentMatch.data2) {
        this.currentMatch.data2 = {};
      }
      this.isLoading = true;
      this.isPopupShow = true;
      
      var initSpf = [];
      var initRspf = [];
      if (match.selectedSpf) {
        match.selectedSpf.forEach(function(val) {
          var key = this.reverseSpfMapping[val];
          if (key) {
            if (key.indexOf('胜平负_') === 0) {
              initSpf.push(key);
            } else {
              initRspf.push(key);
            }
          }
        }.bind(this));
      }
      
      // 强制初始化selectedScores的每个属性
      this.selectedScores = {
        bifen: match.selectedBifen ? match.selectedBifen.concat() : [],
        zjq: match.selectedZjq ? match.selectedZjq.concat() : [],
        bqc: match.selectedBqc ? match.selectedBqc.concat() : [],
        spf: initSpf,
        rspf: initRspf
      };

      // 异步请求赔率数据
      queryHhgg({ id: match.id, serialNumber: match.serial_number, dateStr: match.date_str }).then(function(res) {
        if (res && res.data) {
          for (var key in res.data.data1) {
            if (res.data.data1.hasOwnProperty(key)) {
              this.currentMatch[key] = res.data.data1[key];
            }
          }
          if (res.data.data2) {
            for (var key2 in res.data.data2) {
              if (res.data.data2.hasOwnProperty(key2)) {
                this.currentMatch.data2[key2] = res.data.data2[key2];
              }
            }
          }
        }
      }.bind(this)).catch(function(err) {
        console.error("获取赔率失败:", err);
        uni.showToast({ title: "赔率加载失败", icon: "none" });
      }).finally(function() {
        this.isLoading = false;
      }.bind(this));
    },
    confirmSelection() {
      if (!this.currentMatch || this.isLoading || this.currentMatch.is_stop == 1) return;
      this.finalDrawerList.forEach(function(drawer) {
        drawer.lotteryList.forEach(function(item) {
          if (item.serial_number === this.currentMatch.serial_number) {
            this.$set(item, 'selectedBifen', this.selectedScores.bifen.concat());
            this.$set(item, 'selectedZjq', this.selectedScores.zjq.concat());
            this.$set(item, 'selectedBqc', this.selectedScores.bqc.concat());
            
            var spfList = [];
            if (this.selectedScores.spf) {
              for (var i = 0; i < this.selectedScores.spf.length; i++) {
                var val = this.spfMapping[this.selectedScores.spf[i]];
                if (val) {
                  spfList.push(val);
                }
              }
            }
            if (this.selectedScores.rspf) {
              for (var j = 0; j < this.selectedScores.rspf.length; j++) {
                var val2 = this.spfMapping[this.selectedScores.rspf[j]];
                if (val2) {
                  spfList.push(val2);
                }
              }
            }
            this.$set(item, 'selectedSpf', spfList);
          }
        }.bind(this));
      }.bind(this));
      this.$emit("toggle-multi-select", { 
        serialNumber: this.currentMatch.serial_number, 
        selectedData: JSON.parse(JSON.stringify(this.selectedScores)) 
      });
      this.closePopup();
      uni.showToast({ title: '选择成功', icon: 'success' });
    },
    closePopup() {
      this.isPopupShow = false;
      this.selectedScores = { bifen: [], zjq: [], bqc: [], spf: [], rspf: [] };
    }
  }
};
</script>


<style scoped lang="scss">
* {
  box-sizing: border-box;
}

// 列表基础布局
.match-list { 
  background-color: #f5f5f5;
  padding-bottom: 140rpx;
  // 微信小程序适配底部tab
  // #ifdef MP-WEIXIN
  padding-bottom: 230rpx;
  //#endif
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
  background-color: #F6F6F6; 
  border-bottom: 1rpx solid #DEDEDE;
  padding: 0 20rpx; 
  display: flex; 
  flex-direction: column; 
  gap: 0;
  margin-bottom: 4rpx; 
  border-radius: 8rpx; 
  box-shadow: 0 2rpx 5rpx rgba(0,0,0,0.05);
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
  
  .status-right .ai-analysis-btn {
    font-size: 24rpx; 
    color: #06f; 
    cursor: pointer; 
    transition: opacity 0.2s;
    letter-spacing: 4rpx; 
    &:active { opacity: 0.8; }
  }
}

.main-content-row {
  display: flex; 
  width: 100%; 
  gap: 16rpx; 
  padding: 8rpx 0; 
  overflow: hidden; 
  box-sizing: border-box;
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
  
  .serial-number, .match-time {
    width: 100%; 
    font-size: 20rpx; 
    color: #999; 
    text-align: center;
    white-space: nowrap; 
    overflow: hidden; 
    text-overflow: ellipsis;
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
  box-sizing: border-box;
}

.top-right-layout {
  display: flex; 
  width: 100%; 
  border-bottom: 1rpx solid #eee; 
  padding-bottom: 8rpx;
  
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
        width: 40rpx; 
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
}

// 核心修改：胜负/让分标签栏样式
.spf-type-col {
  width: 34rpx;
  border: 1rpx solid #f1f1f1;
  background: #fff;
  border-radius: 4rpx 0 0 4rpx;
  .spf-type-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    // 文字竖排
    writing-mode: vertical-rl;
    font-size: 18rpx;
    color: #666;
    font-weight: 400;
    &:last-child {
      color:#6AB284;
      border-top: 1rpx solid #f1f1f1;
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
      
      &:first-child { border-right: 1rpx solid #fff; }
      &:last-child { border-left: 1rpx solid #fff; }
      &.selected { 
        background: #d92929; 
        color: #fff; 
        // 选中后所有子元素文字变白
        * {
          color: #fff !important;
        }
      }
      &.disabled { 
        background: #cccccc !important; 
        color: #999999 !important; 
        cursor: not-allowed; 
        pointer-events: none; 
      }
      
      .spf-text { flex: 1; text-align: left; }
      .spf-odds { flex: 0 0 auto; margin-left: 8rpx; font-size: 20rpx; }
      // 让分数字颜色（未选中时）
      .negative { color: green; }
      .positive { color: red; }
      // 核心修复1：选中时让分数字强制变白
      .negative.selected, .positive.selected {
        color: #fff !important;
      }
    }
    
    &:first-child { 
      border-bottom: 1rpx solid #fff; 
      border-radius: 0 4rpx 0 0; 
    }
    
    &:last-child { border-radius: 0 0 4rpx 0; }
  }
}

.expand-btn-col {
  background: #FEEEDF;
  width: 80rpx; 
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  align-items: center;
  border-left: 1rpx solid #eee; 
  cursor: pointer;
  
  .expand-text { font-size: 22rpx; color: #999; margin-bottom: 5rpx; }
  .expand-more { font-size: 20rpx; color: #999; }
}

// 弹框基础样式
.score-popup-mask { 
  position: fixed; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  background: rgba(0, 0, 0, 0.6); 
  z-index: 999999; 
}

.score-popup { 
  position: fixed; 
  top: 50%; 
  left: 50%; 
  transform: translate(-50%, -50%); 
  width: 90%; 
  max-height: 80vh; 
  background: #fff; 
  border-radius: 12rpx; 
  z-index: 9999999; 
  overflow-y: auto; 
  box-sizing: border-box; 
  padding: 20rpx; 
}

.popup-title { 
  font-size: 28rpx; 
  font-weight: 500; 
  color: #333; 
  text-align: center; 
  padding: 8rpx 0; 
  border-bottom: 1rpx solid #eee; 
  margin-bottom: 16rpx;
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis;
}

// 弹框板块通用样式
.score-section {
  display: flex; 
  align-items: stretch; 
  gap: 0; 
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
  box-sizing: border-box;
}

// 各板块标签背景色（匹配篮球原型）
.spf-label { background: #6FBDBD; }
.rspf-label { background: #6AB284; }
.dx-label { background: #6AB284; }
.sfc-away-label { background: #6FBDBD; } // 客胜分差标签色（和胜负客胜一致）
.sfc-home-label { background: #6AB284; } // 主胜分差标签色（和让分主胜一致）

// 1. 胜负板块样式
.spf-options {
  flex: 1; 
  display: flex;
}

.spf-item {
  flex: 1; 
  box-sizing: border-box; 
  padding: 16rpx 0;
  background: #f9f9f9; 
  border: 1rpx solid #eee; 
  text-align: center;
  cursor: pointer; 
  color: #999; 
  transition: all 0.2s ease;
  
  .score-text { font-size: 24rpx; display: block; margin-bottom: 4rpx; }
  .score-odds { font-size: 20rpx; color: #666; }
  
  &.selected { 
    background: #d92929; 
    color: #fff !important; 
    .score-odds {
      color: #fff !important; // 选中后赔率文字变白
    }
  }
  &.disabled { 
    background: #ccc !important; 
    color: #999 !important; 
    cursor: not-allowed; 
    pointer-events: none; 
  }
}

// 2. 让分胜负板块样式
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
  box-sizing: border-box; 
  padding: 16rpx 0;
  background: #f9f9f9; 
  border: 1rpx solid #eee; 
  text-align: center;
  cursor: pointer; 
  color: #999; 
  transition: all 0.2s ease;
  
  .score-text { font-size: 24rpx; display: block; margin-bottom: 4rpx; }
  .score-odds { font-size: 20rpx; color: #666; }
  
  &.selected { 
    background: #d92929; 
    color: #fff !important; 
    .score-odds {
      color: #fff !important; // 选中后赔率文字变白
    }
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

// 3. 大小分板块样式
.dx-options {
  flex: 1; 
  display: flex;
}

.dx-item {
  flex: 1; 
  box-sizing: border-box; 
  padding: 16rpx 0;
  background: #f9f9f9; 
  border: 1rpx solid #eee; 
  text-align: center;
  cursor: pointer; 
  color: #999; 
  transition: all 0.2s ease;
  
  .score-text { font-size: 22rpx; display: block; margin-bottom: 4rpx; }
  .score-odds { font-size: 20rpx; color: #666; }
  
  &.selected { 
    background: #d92929; 
    color: #fff !important; 
    .score-odds {
      color: #fff !important; // 选中后赔率文字变白
    }
  }
  &.disabled { 
    background: #ccc !important; 
    color: #999 !important; 
    cursor: not-allowed; 
    pointer-events: none; 
  }
}

// 4. 胜分差板块样式（客胜+主胜独立板块）
.sfc-container {
  flex: 1;
  width: 100%;
  padding: 8rpx;
}

// 胜分差网格容器，一行4个
.sfc-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  justify-content: flex-start;
}

.sfc-item {
  width: calc(25% - 6rpx); // 一行4个，减去gap间距
  box-sizing: border-box;
  padding: 12rpx 8rpx;
  background: #f9f9f9;
  border: 1rpx solid #eee;
  border-radius: 4rpx;
  text-align: center;
  cursor: pointer;
  color: #999;
  transition: all 0.2s ease;
  // 内部文字上下排列
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  // 主队胜分差底色区分
  &.home {
    background: #f0f8f0 !important;
  }

  &.selected {
    background: #d92929 !important;
    color: #fff !important;
    .score-odds {
      color: #fff !important;
    }
  }

  &.disabled {
    background: #ccc !important;
    color: #999 !important;
    cursor: not-allowed;
    pointer-events: none;
  }
}

// 胜分差文字和赔率上下结构
.score-text {
  font-size: 22rpx;
  font-weight: 500;
  margin-bottom: 4rpx;
}
.score-odds {
  font-size: 18rpx;
  color: #666;
}

// 弹框底部按钮
.popup-btn-bar { 
  display: flex; 
  gap: 16rpx; 
  margin-top: 10rpx; 
  padding: 8rpx 0;
}

.cancel-btn {
  flex: 1; 
  height: 88rpx; 
  line-height: 88rpx;
  background: #f5f5f5; 
  color: #333; 
  border-radius: 8rpx;
  font-size: 28rpx; 
  border: none;
}

.confirm-btn {
  flex: 1; 
  height: 88rpx; 
  line-height: 88rpx;
  background: #d92929; 
  color: #fff; 
  border-radius: 8rpx;
  font-size: 28rpx; 
  border: none;
  &[disabled] { 
    background: #ccc !important; 
    color: #999 !important; 
  }
}

// 隐藏滚动条
::-webkit-scrollbar { display: none; }

// 适配底部安全区
// #ifdef APP-PLUS
.score-popup {
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom)); 
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); 
}
// #endif

// 去除uni-app button默认边框
button::after { border: none; }
</style>