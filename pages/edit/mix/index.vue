<template>
  <view class="football-data-page">
    <!-- 顶部导航 -->
    <CustomHeader
      :showBack="false"
      :title="'数据编辑'"
    />

    <!-- TAB 切换 -->
    <view class="tab-box">
      <view class="tab" :class="{ active: tabIndex === 0 }" @click="switchTab(0)">
        足球
      </view>
      <view class="tab" :class="{ active: tabIndex === 1 }" @click="switchTab(1)">
        篮球
      </view>
    </view>
    
    <scroll-view class="content-scroll" scroll-y>
      <!-- 表头吸顶 + 居中 -->
      <view class="trade-header">
        <view class="trade-header-col type-col">赛事</view>
        <view class="trade-header-col match-col">对阵</view>
        <view class="trade-header-col opt-col">操作</view>
      </view>

      <view class="record-card" v-for="(item, index) in matchList" :key="index">
        <view class="record-row">
          <!-- 赛事列：三行 + margin分开 -->
          <view class="type-col">
            <text class="league">{{ item.league_name || '--' }}</text>
            <text class="serial">{{ item.serial_number || '' }}</text>
            <text class="time">{{ item.race_date || '--' }}</text>
          </view>

          <!-- 对阵列 -->
          <view class="match-col">
            <text class="team">{{ item.home_name }} VS {{ item.visiting_name }}</text>
            <view class="input-line">
              <text class="label">主胜：</text>
              <input v-model="item['home_win_rate']" class="input" type="number" oninput="value=value.replace(/[^\d]/g,'')" />
              <text class="pct">%</text>
              
              <text class="label">平：</text>
              <input v-model="item['draw_win_rate']" class="input" type="number" oninput="value=value.replace(/[^\d]/g,'')" />
              <text class="pct">%</text>
              
              <text class="label">客胜：</text>
              <input v-model="item['visiting_win_rate']" class="input" type="number" oninput="value=value.replace(/[^\d]/g,'')" />
              <text class="pct">%</text>
            </view>
            <view class="input-line">
              <!-- 和上面的label用同样宽度、同样对齐 -->
              <text class="label">主进球：</text>
              <input v-model="item.home_goal_calculate" class="input" type="number" oninput="value=value.replace(/[^\d]/g,'')" />
              <!-- 用一个空白span，和上面的 % 符号宽度一致，把位置占住 -->
              <text class="pct"></text>

              <text class="label">客进球：</text>
              <input v-model="item.visiting_goal_calculate" class="input" type="number" oninput="value=value.replace(/[^\d]/g,'')" />
              <text class="pct"></text>
            </view>
          </view>

          <!-- 操作列 -->
          <view class="opt-col">
            <button class="confirm-btn" @click="handleSingleConfirm(item)">确认</button>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import CustomHeader from "@/components/CustomHeader.vue";
import NoData from "@/pages/commn/noData";
import {
  queryFootballForEntry,
  queryBasketballForEntry,
  footballLotteryEntry,
  basketballLotteryEntry
} from '@/api/demo'

export default {
  components: { CustomHeader, NoData },
  data() {
    return { tabIndex:0, matchList:[] }
  },
  onLoad() { this.getMatchData() },
  methods:{
    switchTab(idx){
      this.tabIndex=idx;
      this.matchList=[];
      this.getMatchData();
    },
    async getMatchData(){
      uni.showLoading();
      try {
        let res = this.tabIndex === 0
          ? await queryFootballForEntry()
          : await queryBasketballForEntry();
        if (res.data) {
          this.matchList = res.data;
        }
      } catch (e) {
        uni.showToast({title:"加载失败",icon:"none"})
      }
      uni.hideLoading();
    },
    async handleSingleConfirm(item) {
      uni.showModal({
        title: '提示',
        content: '确定要保存修改吗？',
        success: async (res) => {
          if (res.confirm) {
            let params = {
              id: item.id,
              homeWinRate: item['home_win_rate'],
              drawRate: item['draw_rate'],
              visitingWinRate: item['visiting_win_rate'],
              homeGoalCalculate: item.home_goal_calculate,
              visitingGoalCalculate: item.visiting_goal_calculate
            };
            let result = this.tabIndex === 0
              ? await footballLotteryEntry(params)
              : await basketballLotteryEntry(params);
            if (result.code === 200) {
              uni.showToast({ title: '保存成功', icon: 'success' });
            } else {
              uni.showToast({ title: '保存失败', icon: 'none' });
            }
          }
        }
      })
    }
  }
}
</script>
<style scoped lang="scss">
.football-data-page {
  width: 100%;
  min-height: 100vh;
  height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-scroll {
  flex: 1;
  overflow-y: auto;
}

.tab-box{
  display:flex;
  background:#fff;
  .tab{
    width: 50%;
    text-align:center;
    line-height:70rpx;
    font-size:28rpx;
    color:#666;
    &.active{
      color:#31926e;
      border-bottom:3rpx solid #31926e;
    }
  }
}

.trade-header{
  display:flex;
  width:100%;
  height:70rpx;
  background:#f8f9fa;
  position:sticky;
  top:0;
  z-index:9;
  align-items:center;
  .trade-header-col{
    font-size:26rpx;
    color:#333;
    font-weight:60;
    text-align:center;
  }
  .type-col{
    width: 15%;
    flex:none;
  }
  .match-col{
    width: 70%;
    flex:none;
    display:flex;
    justify-content:center;
  }
  .opt-col{
    width: 15%;
    flex:none;
  }
}

.record-card{
  width:100%;
  background:#fff;
  border-radius:12rpx;
  margin-bottom:16rpx;
}
.record-row{
  display:flex;
  align-items:center;
  width:100%;
  padding:0 2%;
  box-sizing:border-box;
}

.type-col{
  width: 15%;
  flex:none;
  text-align:center;
  display:flex;
  flex-direction:column;
  .league{
    font-size:22rpx;
    color:#999;
    margin-bottom:8rpx;
  }
  .serial{
    font-size:22rpx;
    color:#999;
    margin-bottom:8rpx;
  }
  .time{
    font-size:21rpx;
    color:#999;
  }
}

.match-col {
  width: 70%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1%;

  .team {
    font-size: 26rpx;
    color: #31926e;
    font-weight: 500;
    margin-bottom: 10rpx;
    text-align: center;
  }

  .input-line {
    display: flex;
    align-items: center;
    margin: 6rpx 0;
    width: 100%;
  }

  // 主胜/平/客胜行，保持原逻辑
  .input-line:first-child {
    justify-content: space-between;
  }

  // 主进球/客进球行，按 50% 平分
  .input-line:last-child {
    justify-content: space-between;
  }

  // 细化 label：只给固定宽度，其余给输入框
  .label {
    font-size: 20rpx;
    color: #666;
    white-space: nowrap;
    width: 14%; // 只占固定宽度，其余空间给输入框
    text-align: right;
    padding-right: 10rpx;
  }

  .input {
    flex: 1; // 关键：占 label 以外的全部剩余宽度
    height: 40rpx;
    border: 1rpx solid #eee;
    border-radius: 6rpx;
    text-align: center;
    font-size: 22rpx;
    box-sizing: border-box;
  }

  .pct {
    font-size: 20rpx;
    color: #666;
    white-space: nowrap;
    width: 5%;
    text-align: left;
  }
}

.opt-col{
  width: 15%;
  flex:none;
  text-align:center;
}
.confirm-btn{
  font-size:22rpx;
  background:#31926e;
  color:#fff;
  border:none;
  border-radius:6rpx;
  padding:10rpx 16rpx;
  white-space:nowrap;
}

::-webkit-scrollbar{display:none;}
</style>