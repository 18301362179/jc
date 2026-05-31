<template>
  <view class="forecast-page">
    <CustomHeader title="积分榜" :showBack="true" />

    <!-- 顶部切换Tab -->
    <view class="tab-bar">
      <view
        v-for="(tab, index) in tabList"
        :key="index"
        class="tab-item"
        :class="{ active: activeTab === index }"
        @tap="switchTab(index)"
      >
        {{ tab.name }}
      </view>
    </view>

    <scroll-view class="scroll-content" scroll-y>
      <view class="content">
        <!-- 根据当前Tab显示对应数据 -->
        <template v-if="currentTablesData && currentTablesData.length !== 0">
          <view v-for="(phase, pIdx) in currentTablesData" :key="pIdx">
            <view v-for="(group, gIdx) in phase.groups" :key="gIdx" class="rank-section">
              <view class="section-title">
                {{ phase.phaseName }} {{ group.groupName }}
                {{ activeTab === 0 ? '主客场' : activeTab === 1 ? '主场' : '客场' }}排名
              </view>
              <view class="table-header">
                <view class="th">排名</view>
                <view class="th">球队</view>
                <view class="th">场次</view>
                <view class="th">胜/平/负</view>
                <view class="th">胜率</view>
                <view class="th">进球/失球</view>
                <view class="th">积分</view>
              </view>
              <view class="rank-item" v-for="(team, tIdx) in group.tables" :key="tIdx">
                <view class="td rank-col">
                  <view v-if="team.ranking === '1'" class="rank-tag gold">{{ team.ranking }}</view>
                  <view v-else-if="team.ranking === '2'" class="rank-tag silver">{{ team.ranking }}</view>
                  <view v-else-if="team.ranking === '3'" class="rank-tag bronze">{{ team.ranking }}</view>
                  <view v-else class="rank-tag normal">{{ team.ranking }}</view>
                </view>
                <view class="td team-col">{{ team.abbCnName }}</view>
                <view class="td">{{ team.totalLegCnt }}</view>
                <view class="td">{{ team.winGoalMatchCnt }}/{{ team.drawMatchCnt }}/{{ team.lossGoalMatchCnt }}</view>
                <view class="td">{{ team.winProbability }}</view>
                <view class="td">{{ team.goalCnt }}/{{ team.lossGoalCnt }}</view>
                <view class="td">{{ team.points }}</view>
              </view>
            </view>
          </view>
        </template>

        <view v-else class="empty-tip">暂无数据</view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import CustomHeader from "@/components/CustomHeader.vue";
import { purchasingFootballPoints } from "@/api/demo";

export default {
  components: {
    CustomHeader
  },
  data() {
    return {
      seasonId: "",
      uniformLeagueId: "",
      tablesData: {},
      // Tab配置
      tabList: [
        { name: "主客场", key: "totalTables" },
        { name: "主场", key: "homeTables" },
        { name: "客场", key: "awayTables" }
      ],
      activeTab: 0
    };
  },
  computed: {
    // 根据activeTab自动切换数据源
    currentTablesData() {
      const key = this.tabList[this.activeTab].key;
      return this.tablesData[key] || [];
    }
  },
  onLoad(options) {
    if (options.seasonId !== undefined) {
      this.seasonId = options.seasonId;
    }
    if (options.uniformLeagueId !== undefined) {
      this.uniformLeagueId = options.uniformLeagueId;
    }
    if (options.type == 'football') {
    this.getRankFootballData();
    } else {
      this.getRankBasketballData();
    };
  },
  methods: {
    async getRankFootballData() {
      if (this.seasonId === "" || this.uniformLeagueId === "") {
        return;
      }
      const res = await purchasingFootballPoints({
        seasonId: this.seasonId,
        uniformLeagueId: this.uniformLeagueId
      });
      this.tablesData = res.data || {};
    },
      async getRankBasketballData() {
      if (this.seasonId === "" || this.uniformLeagueId === "") {
        return;
      }
      const res = await purchasingFootballPoints({
        seasonId: this.seasonId,
        uniformLeagueId: this.uniformLeagueId
      });
      this.tablesData = res.data || {};
    },
    switchTab(index) {
      this.activeTab = index;
    }
  }
};
</script>

<style scoped lang="scss">
.forecast-page {
  width: 100%;
  height: 100vh;
  background: #f5f7fa;
  overflow: hidden;
}

/* Tab切换栏 */
.tab-bar {
  display: flex;
  background: #fff;
  padding: 16rpx;
  box-sizing: border-box;
  .tab-item {
    flex: 1;
    text-align: center;
    padding: 10rpx 0;
    border-radius: 50rpx;
    font-size: 28rpx;
    color: #666;
    &.active {
      background: #f0f0f0;
      color: #333;
    }
  }
}

.scroll-content {
  height: calc(100vh - 160rpx);
  padding: 20rpx;
  box-sizing: border-box;
}

.content {
  padding-bottom: 40rpx;
}

.rank-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  margin-bottom: 20rpx;
  color: #333;
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

.rank-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
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
  .rank-col {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .rank-tag {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    &.gold {
      background: #ffd700;
      color: #fff;
    }
    &.silver {
      background: #c0c0c0;
      color: #fff;
    }
    &.bronze {
      background: #cd7f32;
      color: #fff;
    }
    &.normal {
      background: transparent;
      color: #333;
    }
  }
}

.empty-tip {
  text-align: center;
  font-size: 28rpx;
  color: #999;
  margin-top: 100rpx;
}
</style>