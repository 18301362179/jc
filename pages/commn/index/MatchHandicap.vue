<template>
  <!---让胜平负-->
  <!-- 仅改：paddingTop 从 px 计算改为 rpx 计算（新增paddingTopVal） -->
  <view class="match-list" :style="{ paddingTop: paddingTopVal + 'rpx' }">
    <!-- 抽屉循环容器（兼容原有matchList，无侵入） -->
    <view v-for="(drawer, drawerIdx) in finalDrawerList" :key="drawerIdx" class="drawer-wrapper">
      <!-- 吸顶标题栏（适配statusBarHeight，点击展开/收起） -->
      <!-- 仅改：top 值从 px 计算改为 rpx 计算（stickyHeaderTop） -->
      <view class="date-title sticky-header" :style="{ top: stickyHeaderTop + 'rpx' }" @click="toggleDrawer(drawerIdx)">
        <text>{{ drawer.title }}</text>
        <view class="arrow-icon" :class="{ rotated: expandedDrawers[drawerIdx] }">↓</view>
      </view>

      <!-- 抽屉内容：让胜平负列表（保留原有让胜平负字段，替换点击事件为校验方法） -->
      <view class="drawer-content" v-show="expandedDrawers[drawerIdx]">
        <view v-for="(item, index) in drawer.lotteryList" :key="index" class="match-row" style="background: #f6f6f6">
          <!-- 新增：match-row 内部的状态行（第一行） -->
          <view class="match-status-row">
            <view class="status-left">
              <!-- 单场标签：无停时，根据is_rspf_single显示 -->
              <text class="single" v-if="item.is_rspf_single == 1 && item.is_stop == 0">单</text>
              <text class="single" style="background: #dedede" v-if="item.is_stop == 1">停</text>
            </view>
            <view class="status-right">
              <!-- 右侧分析按钮：仅在有胜数据时显示 -->
              <!-- 仅改：@tap.stop 改为 @click.stop -->
<view class="ai-analysis-btn" :class="{ 'x-text-green': item.is_buy !== 0}" v-if="item.url_show_status==1" @click.stop="() => goToAiAnalysis(item)">
  <text>详细</text>
  <text class="small-coin" v-if="item.is_buy == 0">1币</text>
</view>
            </view>
          </view>

          <!-- 原有赛事内容（第二行） -->
          <view class="match-content-row">
            <!-- 赛事分类信息（保留让胜平负原有字段） -->
            <view class="match-category">
              <view class="league-name" style="display: flex; justify-content: center; width: 100%">
                {{ item.league_name }}
              </view>
              <view class="league-name">{{ item.serial_number }}</view>
              <view class="match-time">{{ item.race_date }}</view>
            </view>
            <!-- 让胜平负玩法单元格（保留原有字段，点击事件替换为校验方法） -->
            <view class="match-cells" style="background: #fff">
              <view class="match-cell home" :class="{ selected: item.handicapHomeSelected, disabled: item.is_stop == 1 }" @click="item.is_stop != 1 && checkAndSelect(item, 'handicapHomeSelected')">
                <view class="team-name">
                  {{ item.home_name }}
                  <text v-if="item.r_goal && item.r_goal !== ''" class="handicap-num">
                    (
                    <!-- 第二步：先判断r_goal存在，再调用includes，彻底规避undefined报错 -->
                    <text
                      :class="{
                        'text-red': item.r_goal && item.r_goal.includes('+'),
                        'text-green': item.r_goal && !item.r_goal.includes('+'),
                      }"
                    >
                      {{ item.r_goal }}
                    </text>
                    )</text
                  ></view
                >
                <text class="odds" v-if="item.r_win_multiplier&&xiValue">主胜{{ item.r_win_multiplier }}</text>
                <text class="odds rate" v-if="item.home_win_rate&&xiValue">
                  胜
                  <text :style="{ color: getRateColor(item.home_win_rate, 'home', item.handicapHomeSelected) }">{{ item.home_win_rate || "" }}</text>
                </text>
              </view>
              <view class="match-cell vs" :class="{ selected: item.handicapVsSelected, disabled: item.is_stop == 1 }" @click="item.is_stop != 1 && checkAndSelect(item, 'handicapVsSelected')">
                <text class="vs-text">VS</text>
                <text class="vs-odds" v-if="item.r_draw_multiplier">平{{ item.r_draw_multiplier }}</text>
                <text class="vs-odds" v-if="item.draw_rate&&xiValue">
                  平
                  <text :style="{ color: getRateColor(item.draw_rate, 'draw', item.handicapVsSelected) }">{{ item.draw_rate }}</text>
                </text>
              </view>
              <view class="match-cell away" :class="{ selected: item.handicapAwaySelected, disabled: item.is_stop == 1 }" @click="item.is_stop != 1 && checkAndSelect(item, 'handicapAwaySelected')">
                <text class="team-name">{{ item.visiting_name }}</text>
                <text class="odds" v-if="item.r_loss_multiplier">主负{{ item.r_loss_multiplier }}</text>
                <text class="odds rate" v-if="item.visiting_win_rate&&xiValue">
                  胜
                  <text :style="{ color: getRateColor(item.visiting_win_rate, 'away', item.awaySelected) }">{{ item.visiting_win_rate || "" }}</text>
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getRateColor } from "@/utils/index.js";
export default {
  props: {
    // 原有props：完全保留让胜平负的原始定义
    matchList: { type: Array, default: () => [] },
    statusBarHeight: { type: Number, default: 0 },
    goToAiAnalysis: { type: Function, required: true },
    // 新增：抽屉列表（兜底兼容，不影响原有使用）
    drawerList: { type: Array, default: () => [] },
  },
  data() {
    return {
      expandedDrawers: [],
      // 缓存转换后的状态栏高度（px转rpx，适配多端）
      statusBarHeightRpx: 0,
      windowWidth: 0,
      xiValue: false,
    };
  },
  computed: {
    // 新增：兜底处理（优先drawerList，无则包装matchList）
    finalDrawerList() {
      if (this.drawerList.length > 0) {
        return this.drawerList;
      }
      return this.matchList.length > 0 ? [{ title: `未知日期 共${this.matchList.length}场比赛`, lotteryList: this.matchList }] : [];
    },
    // 新增：实时统计已选中的让胜平负比赛数量（适配让胜平负选中逻辑）
    selectedMatchCount() {
      let count = 0;
      // 遍历所有抽屉
      this.finalDrawerList.forEach((drawer) => {
        // 遍历抽屉内所有比赛
        drawer.lotteryList.forEach((item) => {
          // 让胜平负选中逻辑：主胜/平/客胜任意一个选中 → 算1场
          if (item.handicapHomeSelected || item.handicapVsSelected || item.handicapAwaySelected) {
            count++;
          }
        });
      });
      return count;
    },
    // 仅新增：计算rpx版paddingTop（和胜平负一致）
    paddingTopVal() {
      return this.statusBarHeightRpx + 88; // 44px=88rpx，8px=16rpx
    },
    // 仅新增：计算rpx版sticky header top值（和胜平负一致）
    stickyHeaderTop() {
      return this.statusBarHeightRpx + 88 - 10; // 3rpx是通用微调值，可按实际偏移动2/4
    },
  },
  watch: {
    // 新增：抽屉列表变化时重置展开状态
    finalDrawerList(newVal) {
      this.expandedDrawers = newVal.map(() => true);
    },
    // 仅新增：监听状态栏高度变化，转换单位
    statusBarHeight(newVal) {
      this.statusBarHeightRpx = this.pxToRpx(newVal);
    },
  },
  created() {
        this.$nextTick(()=>{
    this.xiValue = uni.getStorageSync('xiValue');
    
    })
    // 初始化：获取最新的窗口信息（替代废弃的getSystemInfoSync）
    this.initWindowInfo();
    this.statusBarHeightRpx = this.pxToRpx(this.statusBarHeight);
    this.expandedDrawers = this.finalDrawerList.map(() => true);
  },
  methods: {
    // 新增：初始化窗口信息（替代废弃API）
    initWindowInfo() {
      try {
       
        const windowInfo = wx.getWindowInfo();
        this.windowWidth = windowInfo.windowWidth || 375; // 兜底默认值
      } catch (e) {
        // 兼容旧版本微信：降级使用uni.getSystemInfo（避免报错）
        const systemInfo = wx.getWindowInfo();
        this.windowWidth = systemInfo.windowWidth || 375;
        console.warn("当前微信版本不支持wx.getWindowInfo，已降级兼容", e);
      }
    },
    // 修正后的px转rpx：使用新API获取的windowWidth，优化精度
    pxToRpx(px) {
      if (!px || !this.windowWidth) return 0;
      // 计算后四舍五入，减少1-2px的机型偏差
      return Math.round((px / this.windowWidth) * 750 + 0.5);
    },
    getRateColor: getRateColor,
    // 新增：切换抽屉展开/收起
    toggleDrawer(drawerIdx) {
      this.$set(this.expandedDrawers, drawerIdx, !this.expandedDrawers[drawerIdx]);
    },
    // 核心：校验8场限制 + 调用原有toggleSelect
    checkAndSelect(item, selectType) {
      if (item.is_stop == 1) {
        return;
      }
      // 1. 判断当前点击的是「取消选中」还是「新增选中」
      const isCancel = item[selectType]; // 已有选中状态 → 取消
      const isAdd = !isCancel; // 无选中状态 → 新增

      // 2. 新增选中时，校验8场限制
      if (isAdd) {
        // 先判断当前比赛是否已被选中（避免重复计数）
        const isCurrentMatchSelected = item.handicapHomeSelected || item.handicapVsSelected || item.handicapAwaySelected;
        // 未被选中 → 新增会占用1个名额
        if (!isCurrentMatchSelected && this.selectedMatchCount >= 8) {
          uni.showToast({
            title: "最多只能选择8场比赛",
            icon: "none",
            duration: 2000,
          });
          return; // 超过限制，阻止选中
        }
      }
      this.$emit("toggle-select", item, selectType);
      // 3. 保留原有逻辑：调用父组件的toggleSelect（保证点击有效）
    },
  },
};
</script>

<style scoped lang="scss">
/* 原有让胜平负样式 + 新增状态行样式（和上一页完全一致） */
.match-row {
  display: flex;
  flex-direction: column; /* 改为纵向布局，容纳状态行+内容行 */
  background-color: #fff;
  border-bottom: 1rpx solid #dedede;
  padding: 0rpx 20rpx;

  // 新增：match-row 内部的状态行（和上一页样式完全一致）
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

    .stop-sale {
      display: inline-block;
      padding: 2rpx 8rpx;
      background: #999;
      color: #fff;
      font-size: 22rpx;
      border-radius: 4rpx;
      margin-right: 10rpx;
    }

    .single {
      display: inline-block;
      padding-left: 6rpx;
      width: 44rpx;
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
/* 加在这里 */
.small-coin {
  font-size: 20rpx !important;
  margin-left: 4rpx;
}
    }
  }

  // 原有赛事内容行（横向布局）
  .match-content-row {
    display: flex;
    width: 100%;

    .match-category {
      width: 180rpx;
      display: flex;
      flex-direction: column;
      text-align: center;

      .league-name {
        font-size: 24rpx;
        color: #777;
        margin-bottom: 6rpx;
      }

      .match-time {
        font-size: 22rpx;
        color: #999;
      }
    }

    .match-cells {
      flex: 1;
      display: flex;
      border: 1rpx solid #dedede;
      border-radius: 8rpx;
      overflow: hidden;

      .match-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 16rpx 10rpx;
        cursor: pointer;
        transition: background-color 0.2s;

        &.home {
          width: 38%;
          border-right: 1rpx solid #eee;
        }

        &.vs {
          width: 22%;
          flex-direction: column;
          gap: 4rpx;

          .vs-text {
            font-size: 24rpx;
            font-weight: 400;
            color: #333;
            margin-bottom: 0;
          }
          .vs-odds {
            font-weight: 400;
            font-size: 24rpx;
            color: #999;
          }
        }
        &.away {
          width: 38%;
          border-left: 1rpx solid #eee;
          position: relative;
        }

        &.selected {
          background-color: #d92929 !important;
          color: #fff !important;
          .vs-text,
          .team-name,
          .vs-odds,
          .odds {
            color: #fff !important;
          }
          .text-red,
          .text-green {
            color: #fff !important;
          }
        }
        &.disabled {
          background-color: #eaeaea !important;
          cursor: not-allowed;
          pointer-events: none; /* 彻底禁止点击 */
        }
        .team-name {
          font-size: 24rpx;
          color: #666;
          margin-bottom: 8rpx;
          font-weight: 400;
          text-align: center;
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          .handicap-num {
            margin-left: 4rpx;
            font-size: 20rpx;
          }
          // +号红色
          .text-red {
            color: #d92929;
            font-weight: 900;
          }
          // -号绿色
          .text-green {
            color: #00b578;
            font-weight: 900;
          }
        }

        .odds {
          font-size: 24rpx;
          color: #999;
          margin-bottom: 4rpx;

          &.rate {
            color: #999;
            font-size: 22rpx;
          }
        }
      }
    }
  }
}

/* 新增：抽屉+吸顶样式（和胜平负完全一致） */
.match-list {
  background-color: #f5f5f5;
  box-sizing: border-box;
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
  z-index: 999; // 仅改：从999999999降为999
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  padding: 8rpx 20rpx 12rpx 20rpx;
  background-color: #f5f5f5;
  border-bottom: 1rpx solid #eee;
  font-size: 26rpx;
  color: #333;
  .arrow-icon {
    transition: transform 0.2s;
  }
  .rotated {
    transform: rotate(180deg);
  }
}

.drawer-content {
  width: 100%;
  transition: all 0.2s ease;
}

::-webkit-scrollbar {
  display: none;
}
</style>
