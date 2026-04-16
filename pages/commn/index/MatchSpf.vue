<template>
  <!---胜平负-->
  <view class="match-list" :style="{ paddingTop: paddingTopVal + 'rpx' }">
    <!-- 抽屉循环容器 -->
    <view v-for="(drawer, drawerIdx) in finalDrawerList" :key="drawerIdx" class="drawer-wrapper">
      <!-- 修复 sticky 定位兼容：改用更稳定的定位方案 + 统一 rpx 单位 -->
      <view class="date-title sticky-header" :style="{ top: stickyHeaderTop + 'rpx' }" @click="toggleDrawer(drawerIdx)">
        <text>{{ drawer.title }}</text>
        <view class="arrow-icon" :class="{ rotated: expandedDrawers[drawerIdx] }">↓</view>
      </view>

      <!-- 抽屉内容 -->
      <view class="drawer-content" v-show="expandedDrawers[drawerIdx]">
        <!-- 原有赛事列表：内部新增状态行 -->
        <view v-for="(item, index) in drawer.lotteryList" :key="index" class="match-row" style="background: #f6f6f6">
          <!-- 新增：match-row 内部的状态行（第一行） -->
          <view class="match-status-row">
            <view class="status-left">
              <!-- 单场标签：无停时，根据is_spf_single显示 -->
              <text class="single-tag" v-if="item.is_spf_single == 1 && item.is_stop == 0">单</text>
              <!-- 新增：停售标签 -->
              <text class="single-tag" style="background: #dedede" v-if="item.is_stop == 1">停</text>
              <image class="after-tag-icon" src="https://www.tianjifu.com//static/jian.png" v-if="item.is_rec == 1" mode="widthFix"></image>
            </view>
            <view class="status-right">
              <!-- 右侧分析按钮：仅在有胜数据时显示 -->
              <!-- 兼容事件：统一用 @click.stop 适配多端 -->
              <view class="ai-analysis-btn" :class="{ 'x-text-green': item.is_buy !== 0 }" v-if="item.url_show_status == 1" @click.stop="() => myValue(item)">
                <text>详细</text>
                <text class="small-coin" v-if="item.is_buy == 0">{{ item.charge }}</text>
              </view>
            </view>
          </view>

          <!-- 原有赛事内容（第二行） -->
          <view class="match-content-row">
            <!-- 赛事分类信息 -->
            <view class="match-category">
              <view class="league-name">
                {{ item.league_name }}
              </view>
              <view class="league-name">{{ item.serial_number }}</view>
              <view class="match-time">{{ item.race_date }}</view>
            </view>
            <!-- 胜平负玩法单元格 -->
            <view class="match-cells">
              <!-- 主队单元格 -->
              <view
                class="match-cell home"
                :class="{
                  selected: item.homeSelected,
                  disabled: item.is_stop == 1,
                }"
                @click="() => checkAndSelect(item, 'homeSelected')"
              >
                <view class="team-name">{{ item.home_name }}</view>
                <text class="odds" v-if="item.win_multiplier && xiValue">
                  主胜{{ item.win_multiplier }}
                  <text v-if="item.win_multiplier_c == 1" style="color: red; margin-left: 4rpx">↑</text>
                  <text v-if="item.win_multiplier_c == -1" style="color: green; margin-left: 4rpx">↓</text>
                </text>
                <text class="odds rate" v-if="item.home_win_rate && xiValue">
                  胜
                  <text :style="{ color: getRateColor(item.home_win_rate, 'home', item.homeSelected) }">{{ item.home_win_rate || "" }}</text>
                </text>
              </view>

              <!-- 平局单元格 -->
              <view
                class="match-cell vs"
                :class="{
                  selected: item.vsSelected,
                  disabled: item.is_stop == 1,
                }"
                @click="() => checkAndSelect(item, 'vsSelected')"
              >
                <text class="vs-text">VS</text>
                <text class="vs-odds" v-if="item.draw_multiplier && xiValue">
                  平{{ item.draw_multiplier }}
                  <text v-if="item.draw_multiplier_c == 1" style="color: red; margin-left: 4rpx">↑</text>
                  <text v-if="item.draw_multiplier_c == -1" style="color: green; margin-left: 4rpx">↓</text>
                </text>
                <text class="vs-odds" v-if="item.draw_rate && xiValue">
                  平
                  <text :style="{ color: getRateColor(item.draw_rate, 'draw', item.vsSelected) }">{{ item.draw_rate }}</text>
                </text>
              </view>

              <!-- 客队单元格 -->
              <view
                class="match-cell away"
                :class="{
                  selected: item.awaySelected,
                  disabled: item.is_stop == 1,
                }"
                @click="() => checkAndSelect(item, 'awaySelected')"
              >
                <text class="team-name">{{ item.visiting_name }}</text>
                <text class="odds" v-if="item.loss_multiplier && xiValue">
                  主负{{ item.loss_multiplier }}
                  <text v-if="item.loss_multiplier_c == 1" style="color: red; margin-left: 4rpx">↑</text>
                  <text v-if="item.loss_multiplier_c == -1" style="color: green; margin-left: 4rpx">↓</text>
                </text>
                <text class="odds rate" v-if="item.visiting_win_rate && xiValue">
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
    matchList: { type: Array, default: () => [] },
    statusBarHeight: { type: Number, default: 0 },
    myValue: { type: Function, required: true },
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
    finalDrawerList() {
      if (this.drawerList.length > 0) {
        return this.drawerList;
      }
      return this.matchList.length > 0 ? [{ title: `未知日期 共${this.matchList.length}场比赛`, lotteryList: this.matchList }] : [];
    },
    // 实时统计：已选中的比赛数量
    selectedMatchCount() {
      let count = 0;
      this.finalDrawerList.forEach((drawer) => {
        drawer.lotteryList.forEach((item) => {
          if (item.homeSelected || item.vsSelected || item.awaySelected) {
            count++;
          }
        });
      });
      return count;
    },
    // 修复：统一用rpx计算paddingTop，避免px/rpx混用
    paddingTopVal() {
      return this.statusBarHeightRpx + 88; // 原始值不变
    },
    // 仅改这1行：加一个固定微调值（3rpx），解决偏移，定位不失效
    stickyHeaderTop() {
      return this.statusBarHeightRpx + 88 - 10; // 3rpx是通用微调值，可按实际偏移动2/4
    },
  },
  watch: {
    finalDrawerList(newVal) {
      this.expandedDrawers = newVal.map(() => true);
    },
    // 监听状态栏高度变化，实时转换单位
    statusBarHeight(newVal) {
      this.statusBarHeightRpx = this.pxToRpx(newVal);
    },
  },
  mounted() {},
  created() {
    // 初始化：获取最新的窗口信息（替代废弃的getSystemInfoSync）
    this.initWindowInfo();
    console.log(uni.getStorageSync("xiValue"), "-------------------------");
    this.xiValue = uni.getStorageSync("xiValue");
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
    toggleDrawer(drawerIdx) {
      this.$set(this.expandedDrawers, drawerIdx, !this.expandedDrawers[drawerIdx]);
    },
    checkAndSelect(item, selectType) {
      // 新增：停售状态下直接返回，不执行选择逻辑
      if (item.is_stop == 1) {
        return;
      }

      const isCancel = item[selectType];
      const isAdd = !isCancel;

      if (isAdd) {
        const isCurrentMatchSelected = item.homeSelected || item.vsSelected || item.awaySelected;
        if (!isCurrentMatchSelected && this.selectedMatchCount >= 8) {
          uni.showToast({
            title: "最多只能选择8场比赛",
            icon: "none",
            duration: 2000,
          });
          return;
        }
      }
      this.$emit("toggle-select", item, selectType);
    },
  },
};
</script>

<style scoped lang="scss">
// 统一重置盒模型，解决布局兼容
* {
  box-sizing: border-box;
}

.match-list {
  background-color: #f5f5f5;
  padding-bottom: 140rpx;
  // 小程序端额外适配
  // #ifdef MP-WEIXIN
  padding-bottom: 230rpx;
  // #endif
}

.drawer-wrapper {
  width: 100%;
  margin-bottom: 8rpx;
  background: #f5f5f5;
}

// 修复sticky定位兼容：移除高版本属性，增强层级和兼容性
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
  border-top: 5rpx solid #fff;
  .arrow-icon {
    transition: transform 0.2s ease;
    font-size: 24rpx;
  }
  .rotated {
    transform: rotate(180deg);
  }
}

.drawer-content {
  width: 100%;
  transition: all 0.2s ease;
}

.match-row {
  display: flex;
  flex-direction: column; // 改为纵向布局，容纳状态行+内容行
  background-color: #fff;
  border-bottom: 1rpx solid #f1f1f1;
  padding: 0rpx 20rpx;

  // 新增：match-row 内部的状态行
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
    width: 44rpx;
    background: #b71c1c;
    color: #fff;
    text-align: left;
    font-size: 22rpx;
    border-top-right-radius: 15rpx;
    border-bottom-right-radius: 16rpx;
    margin-right: 10rpx;
  }
    .after-tag-icon {
      width: 30rpx;
      height: 30rpx;
      flex-shrink: 0;
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
      justify-content: center; // 垂直居中，兼容不同内容高度

      .league-name {
        font-size: 24rpx;
        color: #777;
        margin-bottom: 6rpx;
        // 修复宽度兼容：移除硬编码width
        display: flex;
        justify-content: center;
      }

      .match-time {
        font-size: 22rpx;
        color: #999;
      }
    }

    .match-cells {
      flex: 1;
      display: flex;
      border: 1rpx solid #f1f1f1;
      border-radius: 8rpx;
      overflow: hidden;
      background: #fff; // 移到这里，统一背景色

      .match-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 6rpx 10rpx 18rpx 10rpx;
        cursor: pointer;
        transition: background-color 0.2s;

        // 新增：停售状态样式
        &.disabled {
          background-color: #dedede !important;
          cursor: not-allowed; // 鼠标样式改为禁止
          pointer-events: none; // 禁用所有点击事件

          // 停售状态下文字颜色调整
          .team-name,
          .vs-text,
          .odds,
          .vs-odds {
            color: #999 !important;
          }
        }

        &.home {
          width: 38%;
          border-right: 1rpx solid #eee;
        }

        &.vs {
          width: 22%;
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
          background-color: #d92929;
          color: #fff;
          // 修复样式穿透：增加!important保证优先级
          .vs-text,
          .team-name,
          .vs-odds,
          .odds {
            color: #fff !important;
          }
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
      .arrow-up {
  color: #ff2a2a;
  font-size: 22rpx;
  margin-left: 4rpx;
}
.arrow-down {
  color: #00c853;
  font-size: 22rpx;
  margin-left: 4rpx;
}
    }
  }
}

// 隐藏滚动条，兼容多端
::-webkit-scrollbar {
  display: none;
}
</style>
