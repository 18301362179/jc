<template>
  <view>
    <view v-for="(item, index) in courseList" :key="index" class="item">
      <view class="time">
        <text>{{ forateData(item.race_date) }}</text>
<view v-if="item.is_over == 0 && item.home_win_rate != 0&&xiValue" :class="{ 'x-text-green': item.is_buy !== 0 }" class="ai" @tap.stop="toDetail(item)">
  <text>详细</text>
  <text class="small-coin" v-if="item.is_buy == 0">1币</text>
</view>
      </view>
      <view class="score">
        <!-- 左侧区域：主队名 + 左侧小项（自动撑开） -->
        <view class="left-area">
          <text class="name-l">{{ item.home_name }}</text>
          <view class="left-items">
            <!-- <view v-if="item.is_over == 0 && item.homeHandicap" class="handicap-group">
              <text class="score-con" style="color: red;box-sizing:border-box;">{{ item.homeHandicap }}</text>
            </view> -->
            <text class="score-con" v-if="item.home_goal || item.home_goal == 0">{{ item.home_goal }}</text>
            <!-- <text class="score-con p-l" style="color:#3993D4;" v-if="item.home_win_rate">{{ item.home_win_rate }}</text> -->
          </view>
        </view>
        
        <!-- 冒号（位置固定） -->
        <text class="score-con colon" style="padding: 0;">:</text>
        
        <!-- 右侧区域：客队名 + 右侧小项（自动撑开） -->
        <view class="right-area">
          <view class="right-items">
            <!-- <text class="score-con p-r" style="color:#3993D4;" v-if="item.visiting_win_rate">{{ item.visiting_win_rate }}</text> -->
            <text class="score-con" v-if="item.visiting_goal || item.visiting_goal == 0">{{ item.visiting_goal }}</text>
            <!-- <view v-if="item.is_over == 0 && item.visitingHandicap" class="handicap-group">
              <text class="score-con" style="color: red;box-sizing:border-box;">{{ item.visitingHandicap }}</text>
            </view> -->
          </view>
          <text class="name-r">{{ item.visiting_name }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { formatDateWithWeekday } from "@/utils/data";
export default {
  data() {
    return {
      courseList: [],
      goal: '比分',
      xiValue: false,
    }
  },
  created(){
    this.$nextTick(()=>{
    this.xiValue = uni.getStorageSync('xiValue');
    
    })
  },
  methods: {
    forateData(time) {
      return formatDateWithWeekday(time);
    },
    open(r) {
      this.courseList = r;
    },
    handleBack() {
      this.$router.go(-1)
    },
    async toDetail(item) {
      this.$emit("detail-click",item)
    },
    getSign(handicap) {
      if (!handicap) return '';
      const str = String(handicap);
      return str.startsWith('-') ? '-' : '+';
    },
    getNumber(handicap) {
      if (!handicap) return '';
      const str = String(handicap).replace(/^[+-]/, '');
      return str || '0';
    }
  }
}
</script>

<style scoped lang="scss">
.item {
  padding: 0 20rpx;
  border-radius: 2rpx;
  .time {
    font-size: 24rpx;
    color: #777;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    height: 40rpx; 
.ai {
  font-size: 22rpx;
  color: #06f;
  padding: 6rpx 16rpx;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
  letter-spacing: 4rpx;
  &:active {
    opacity: 0.8;
    box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.05);
  }
}
/* 👇 就在 .ai 下面加这个 👇 */
.small-coin {
  font-size: 18rpx !important;
  margin-left: 4rpx;
}
  }
}

.item:nth-child(even) {
  background: #fff;
}

.score {
  width: 100%;
  min-height: 64rpx;
  display: flex;
  align-items: center; 
  /* 左右区域 + 冒号 总宽度100% */
}

/* 左侧区域：占比 (100% - 冒号宽度)/2 */
.left-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end; /* 内容右对齐（贴近冒号） */
  padding-right: 10rpx; /* 与冒号保持原有间距 */
}

/* 右侧区域：占比 (100% - 冒号宽度)/2 */
.right-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 内容左对齐（贴近冒号） */
  padding-left: 10rpx; /* 与冒号保持原有间距 */
}

/* 左侧小项容器（自动撑开） */
.left-items {
  display: flex;
  align-items: center;
  margin-left: 10rpx; /* 与主队名保持间距 */
}

/* 右侧小项容器（自动撑开） */
.right-items {
  display: flex;
  align-items: center;
  margin-right: 10rpx; /* 与客队名保持间距 */
}

.name-l {
  font-size: 24rpx;
  color: #666;
  white-space: nowrap; /* 防止队名换行 */
}

.name-r {
  font-size: 24rpx;
  color: #666;
  white-space: nowrap; /* 防止队名换行 */
}

/* 冒号样式（位置固定，宽度不变） */
.score-con.colon {
  width: 19rpx;
  color: #d04052;
  font-size: 24rpx;
  text-align: center; 
  line-height: 64rpx; 
  /* 保持原有间距，不添加额外margin */
}

.score-con {
  width: auto; 
  color: #d04052;
  font-size: 24rpx;
  font-variant-numeric: tabular-nums;
  font-weight: 400; 
  padding: 0 5rpx; /* 小项之间的基础间距 */
}

.p-r {
  box-sizing: border-box;
  padding-right: 15rpx;
}

.p-l {
  box-sizing: border-box;
  padding-left: 15rpx;
}

.p-t {
  box-sizing: border-box;
  padding-top: 15rpx;
};

.handicap-group {
  display: inline-flex;
  align-items: center;
  font-size: 28rpx;
}

.handicap-sign {
  margin-right: 2rpx;
  line-height: 1;
}

.handicap-number {
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
</style>