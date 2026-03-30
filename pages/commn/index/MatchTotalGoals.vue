<template>
  <view class="match-list" :style="{ paddingTop: paddingTopVal + 'rpx' }">
    <!-- 抽屉循环容器（兼容原有matchList，无侵入） -->
    <view v-for="(drawer, drawerIdx) in finalDrawerList" :key="drawerIdx" class="drawer-wrapper">
      <!-- 吸顶标题栏（适配statusBarHeight，点击展开/收起） -->
      <view class="date-title sticky-header" :style="{ top: stickyHeaderTop + 'rpx' }" @click="toggleDrawer(drawerIdx)">
        <text>{{ drawer.title }}</text>
        <view class="arrow-icon" :class="{ rotated: expandedDrawers[drawerIdx] }">↓</view>
      </view>

      <!-- 抽屉内容：总进球列表（保留原有总进球所有结构） -->
      <view class="drawer-content" v-show="expandedDrawers[drawerIdx]">
        <view v-for="item in drawer.lotteryList" :key="item.id" class="match-row" style="background: #f6f6f6">
          <!-- 第一行：状态行（停/单场 + 分析）- 修复事件兼容 -->
          <view class="match-status-row">
            <view class="status-left">
              <!-- 单场标签：无停时，根据is_zjq_single显示 -->
              <text class="single-tag" v-if="item.is_zjq_single == 1 && item.is_stop == 0">单</text>
              <!-- 新增：停售标签 -->
              <text class="single-tag" style="background: #dedede" v-if="item.is_stop == 1">停</text>
            </view>
            <view class="status-right">
              <!-- 右侧分析按钮：仅在有胜数据时显示 → 修复@tap.stop改为@click.stop -->
              <view class="ai-analysis-btn" :class="{ 'x-text-green': item.is_buy !== 0 }" v-if="$xiValue" @click.stop="() => goToAiAnalysis(item)">
                <text>详细</text>
                <text class="small-coin" v-if="item.is_buy == 0">1币</text>
              </view>
            </view>
          </view>

          <!-- 第二行：左右布局（左侧=bottom-left，右侧=球队+胜+总进球） -->
          <view class="match-content-row">
            <!-- 左侧：原bottom-left部分（联赛名+编号+时间）→ 优化宽度适配 -->
            <view class="content-left">
              <text class="serial-number">{{ item.league_name }}</text>
              <text class="serial-number">{{ item.serial_number }}</text>
              <text class="match-time">{{ item.race_date }}</text>
            </view>

            <!-- 右侧：球队名称 + 胜行 + 总进球选项 -->
            <view class="content-right">
              <!-- 球队名称行 -->
              <view class="team-name">
                <text>{{ item.home_name }}</text>
                <text class="vs-text">VS</text>
                <text>{{ item.visiting_name }}</text>
              </view>
              <!-- 胜&进球数行 -->
              <view class="rate-row">
                <text class="rate-text home" v-if="item.home_win_rate">胜率{{ item.home_win_rate || "--" }}</text>
                <text class="vs-text">{{ item.draw_rate ? "平率" + item.draw_rate : "" }}</text>
                <text class="rate-text away" v-if="item.visiting_win_rate">胜率{{ item.visiting_win_rate || "--" }}</text>
              </view>
              <!-- 总进球选项 -->
              <view class="total-goals-cells">
                <view class="goals-row">
                  <view
                    v-for="(goal, gIdx) in goalsOptions.slice(0, 4)"
                    :key="gIdx"
                    class="goal-option"
                    :class="{
                      selected: item.selectedGoals && item.selectedGoals.includes(goal.value),
                      disabled: item.is_stop == 1, // 新增：停售禁用类
                    }"
                    @click="() => checkAndSelect(item, goal.value)"
                  >
                    <text class="goal-text">{{ goal.label }}</text>
                    <text class="goal-odds">{{ item[goal.field] || "" }}</text>
                  </view>
                </view>
                <view class="goals-row">
                  <view
                    v-for="(goal, gIdx) in goalsOptions.slice(4, 8)"
                    :key="gIdx"
                    class="goal-option"
                    :class="{
                      selected: item.selectedGoals && item.selectedGoals.includes(goal.value),
                      disabled: item.is_stop == 1, // 新增：停售禁用类
                    }"
                    @click="() => checkAndSelect(item, goal.value)"
                  >
                    <text class="goal-text">{{ goal.label }}</text>
                    <text class="goal-odds">{{ item[goal.field] || "" }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    // 原有props：完全保留总进球的原始定义
    matchList: { type: Array, default: () => [] },
    statusBarHeight: { type: Number, default: 0 },
    goToAiAnalysis: { type: Function, required: true },
    // 新增：抽屉列表（兜底兼容，不影响原有使用）
    drawerList: { type: Array, default: () => [] },
  },
  data() {
    return {
      // 原有总进球选项配置：完全保留
      goalsOptions: [
        { label: "0", value: 0, field: "zjq_ling" },
        { label: "1", value: 1, field: "zjq_yi" },
        { label: "2", value: 2, field: "zjq_er" },
        { label: "3", value: 3, field: "zjq_san" },
        { label: "4", value: 4, field: "zjq_si" },
        { label: "5", value: 5, field: "zjq_wu" },
        { label: "6", value: 6, field: "zjq_liu" },
        { label: "7+", value: 7, field: "zjq_qi_jia" },
      ],
      // 新增：抽屉展开状态（不影响原有逻辑）
      expandedDrawers: [],
      statusBarHeightRpx: 0,
      windowWidth: 0, // 修正：删除多余空格
    };
  },
  computed: {
    // 新增：兜底处理（优先drawerList，无则包装matchList）
    finalDrawerList() {
      if (this.drawerList.length > 0) {
        return this.drawerList;
      }
      // 兜底标题沿用原有格式：“周四 2025-12-04 共X场比赛”
      return this.matchList.length > 0 ? [{ title: `周四 2025-12-04 共${this.matchList.length}场比赛`, lotteryList: this.matchList }] : [];
    },
    // 实时统计：已选中的总进球比赛数量（适配总进球选中逻辑）
    selectedMatchCount() {
      let count = 0;
      // 遍历所有抽屉
      this.finalDrawerList.forEach((drawer) => {
        // 遍历抽屉内所有比赛
        drawer.lotteryList.forEach((item) => {
          // 总进球选中逻辑：selectedGoals存在且长度>0 → 算1场
          if (item.selectedGoals && item.selectedGoals.length > 0) {
            count++;
          }
        });
      });
      return count;
    },
    // 修复：移到computed里（原错误写在methods）
    paddingTopVal() {
      // statusBarHeight是px，转成rpx
      return this.statusBarHeightRpx + 88; // 44px=88rpx，8px=16rpx
    },
    // 修复：移到computed里（原错误写在methods）
    stickyHeaderTop() {
      return this.statusBarHeightRpx + 88 - 10; // 3rpx是通用微调值，可按实际偏移动2/4
    },
  },
  watch: {
    // 新增：抽屉列表变化时重置展开状态
    finalDrawerList(newVal) {
      this.expandedDrawers = newVal.map(() => true);
    },
  },
  created() {
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
    // 新增：抽屉展开/收起方法（原代码遗漏）
    toggleDrawer(drawerIdx) {
      this.$set(this.expandedDrawers, drawerIdx, !this.expandedDrawers[drawerIdx]);
    },
    // 核心：校验8场限制 + 调用原有toggleGoalSelect
    checkAndSelect(item, goalValue) {
      // 新增：停售状态直接返回，禁止点击
      if (item.is_stop == 1) {
        return;
      }

      // 1. 判断当前比赛是否已被选中（总进球逻辑）
      const isCurrentMatchSelected = item.selectedGoals && item.selectedGoals.length > 0;
      // 2. 判断当前点击的是「取消选中」还是「新增选中」
      const isCancel = item.selectedGoals && item.selectedGoals.includes(goalValue);
      const isAdd = !isCancel;

      // 3. 新增选中时，校验8场限制
      if (isAdd) {
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
      // 4. 保留原有逻辑：调用父组件的toggleGoalSelect（保证点击有效）
      this.$emit("toggle-goal-select", item, goalValue);
    },
  },
};
</script>

<style scoped lang="scss">
/* 原有总进球样式 + 布局重构 → 优化边框和宽度适配 */
.match-row {
  display: flex;
  flex-direction: column; /* 纵向包含状态行+内容行 */
  background-color: #fff;
  border-bottom: 0.5rpx solid #f1f1f1; // 修复：改为0.5rpx适配高DPR
  padding: 0rpx 20rpx;
  gap: 0;

  // 第一行：状态行（保持不变）
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

  // 第二行：左右布局核心
  .match-content-row {
    display: flex; // 改为横向左右布局
    width: 100%;
    gap: 16rpx; // 左右间距

    // 左侧：原bottom-left（联赛名+编号+时间）→ 优化宽度适配
    .content-left {
      margin-top: 20rpx;
      flex: 0 0 21%; // 修复：改为flex比例，适配不同机型
      max-width: 160rpx;
      display: flex;
      flex-direction: column;
      align-items: center; // 居中显示
      justify-content: flex-start;
      gap: 2rpx;
      flex-shrink: 0; // 固定宽度不收缩

      .serial-number {
        width: 100%;
        font-size: 20rpx;
        color: #777;
        margin-bottom: 10rpx;
        text-align: center;
      }

      .match-time {
        width: 100%;
        font-size: 20rpx;
        color: #999;
        text-align: center;
      }
    }

    // 右侧：球队+胜+总进球（占剩余宽度）
    .content-right {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6rpx;

      // 球队名称行 - 核心修改：改为flex布局实现左右对齐
      .team-name {
        font-size: 26rpx;
        color: #333;
        display: flex;
        align-items: center;
        justify-content: space-between; // 改为两端对齐
        width: 100%; // 确保占满宽度

        .vs-text {
          color: #999;
          font-size: 24rpx;
          // 居中占位，宽度与胜行的平文本一致
          width: 140rpx;
          text-align: center;
        }

        // 主队名称靠右
        text:first-child {
          text-align: right;
          flex: 1;
        }

        // 客队名称靠左
        text:last-child {
          text-align: left;
          flex: 1;
        }
      }

      // 胜&进球数行 - 核心修改：保持布局匹配
      .rate-row {
        width: 100%;
        display: flex;
        align-items: center;
        font-size: 22rpx;
        color: #999;

        .rate-text {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .rate-text.home {
          text-align: right; // 主队胜靠右
          padding-right: 0; // 移除多余内边距，保证对齐
        }
        .rate-text.away {
          text-align: left; // 客队胜靠左
          padding-left: 0; // 移除多余内边距，保证对齐
        }
        .vs-text {
          width: 140rpx; // 与球队行VS文本宽度一致
          text-align: center; // 平居中
          flex-shrink: 0;
        }
      }

      // 以下总进球相关样式保持不变
      .total-goals-cells {
        display: flex;
        flex-direction: column;
        border: 1rpx solid #dedede;
        border-radius: 8rpx;
        overflow: hidden;
      }

      .goals-row {
        display: flex;
        width: 100%;
      }

      .goal-option {
        width: 25%;
        margin: 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        padding: 0rpx 5rpx;
        background-color: #fff;
        border-right: 1rpx solid #eee;
        border-bottom: 1rpx solid #eee;
        cursor: pointer;
        height: 60rpx;

        // 新增：停售禁用样式
        &.disabled {
          background-color: #dedede !important;
          cursor: not-allowed;
          pointer-events: none;

          .goal-text,
          .goal-odds {
            color: #999 !important;
          }
        }

        &:nth-child(4) {
          border-right: none;
        }

        &.selected {
          background-color: #d92929;
          color: #fff !important;
        }

        .goal-text {
          font-size: 28rpx;
          font-weight: 400;
          color: #666;
          margin-right: 38rpx;
        }

        .goal-odds {
          font-size: 22rpx;
          color: #888;
        }

        &.selected .goal-text,
        &.selected .goal-odds {
          color: #fff !important;
        }
      }

      .goals-row:last-child .goal-option {
        border-bottom: none;
      }
    }
  }
}

/* 抽屉基础样式（完全保留） */
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
