<template>
  <view class="scheme-edit-page">
    <!-- 顶部导航：保留 -->
    <CustomHeader :ballTitle="'足球'" title="总进球" :showBack="true" :showIcon="false" @back-click="handleBack" />

    <!-- 核心优化：基于sysinfo精准计算高度，移除冗余padding -->
    <scroll-view
      class="match-scroll"
      scroll-y
      :style="{
        top: headerTotalHeight + 'px',
        bottom: betBarTotalHeight + 'px',
      }"
    >
      <view class="match-list">
        <view v-for="(item, index) in selectedMatchList" :key="item.id" class="match-row">
          <!-- 顶部：编号 + 队名VS队名 -->
        <view class="match-header">
          <text class="serial-number">{{ item.serial_number }}</text>
          <!-- 重构为弹性布局，VS固定宽度，左右平分剩余空间 -->
          <view class="team-win-rate-wrap">
            <!-- 左侧主队区域：占剩余宽度50%，内容靠右 -->
            <view class="team-item left-team">
              <text class="team-name-text">{{ item.home_name }}</text>
              <text class="rate-text" v-if="item.home_win_rate">胜率{{ item.home_win_rate }}</text>
            </view>
            <!-- VS区域：固定宽度，居中显示 -->
            <view class="vs-item">
              <text class="vs-text">VS</text>
              <text class="rate-text" v-if="item.draw_rate">平率{{ item.draw_rate || "0%" }}</text>
            </view>
            <!-- 右侧客队区域：占剩余宽度50%，内容靠左 -->
            <view class="team-item right-team">
              <text class="team-name-text">{{ item.visiting_name }}</text>
              <text class="rate-text" v-if="item.visiting_win_rate">胜率{{ item.visiting_win_rate }}</text>
            </view>
          </view>
        </view>
          <!-- 底部：选中的进球数（原型图红色显示） -->
          <view class="selected-goals">
            {{ item.selectedGoals && item.selectedGoals.length > 0 ? item.selectedGoals.join(",") : "未选择" }}
          </view>
        </view>

        <view class="empty-tip" v-if="selectedMatchList.length === 0"> 暂无已选赛事 </view>
      </view>
    </scroll-view>

    <!-- 底部投注栏：条件适配paddingBottom，解决两端空白/溢出问题 -->
    <view
      class="bet-bar"
      :style="{
        height: betBarFixedPx + 'px',
        // 核心：仅App端添加安全区padding，小程序端为0，避免底部空白
        paddingBottom: (isApp ? safeAreaBottom : 0) + 'px',
      }"
    >
<view class="bet-bar-top">
  <!-- 新增提示文本 -->
  <view class="tips-text">请输入倍数后截屏给售票人</view>
  <!-- 缩小 top-left 样式 -->
  <view class="top-left">
    {{selectedMatchList.length == 1 ? '单关': selectedMatchList.length + '串1'}}
  </view>
  <view class="collapse-area">
    <view class="multi-group">
      <text class="multi-label">投</text>
      <button class="multi-btn minus" @click="handleMinus"><text>-</text></button>
      <view 
        class="multi-input" 
        @tap="showNumberKeyboard = true"
        :class="{ 'disabled': selectedMatchCount < 1 }"
      >
        {{ betCount }}
      </view>
      <button class="multi-btn plus" @click="handlePlus"><text>+</text></button>
      <text class="multi-unit">倍</text>
    </view>
  </view>
</view>
      <view class="bet-bar-bottom">
        <view class="bottom-middle">
          <text class="select-tip">共{{ betNotes }}注 {{ betCount }}倍 {{ totalBetAmount }}</text>
          <text class="bonus-tip">{{ calculateHalfFullBonus() }}</text>
        </view>
        <!-- <view class="bottom-right">
          <button class="confirm-btn" :disabled="selectedMatchCount === 0 || isPayLoading" @click="handleConfirmBet(false)">
            {{ isPayLoading ? "支付中..." : "模拟投注" }}
          </button>
        </view> -->
      </view>
    </view>

    <!-- 手机号弹窗：保留 -->
    <view class="phone-modal" v-if="showPhoneModal">
      <view class="modal-mask" @click="showPhoneModal = false"></view>
      <view class="modal-content">
        <view class="modal-desc">业务人员通过微信与您联系确认购买及打印彩票后给您发送图片留作兑奖凭证等后续流程</view>
        <view class="input-wrap">
          <label>微信手机号：</label>
          <input type="number" v-model="userPhone" placeholder="请输入手机号" maxlength="11" />
        </view>
        <view class="modal-btns">
          <button class="cancel-btn" @click="showPhoneModal = false">取消</button>
          <button class="confirm-btn" @click="confirmPhone">提交</button>
        </view>
      </view>
    </view>
    <UniNumberKeyboard :show.sync="showNumberKeyboard" :value="betCount + ''" :allowDot="false" confirm-text="确认" :min="1" :max="50" @input="handleKeyboardInput" @confirm="handleKeyboardConfirm" />
  </view>
</template>

<script>
import CustomHeader from "@/components/CustomHeader.vue";
import { purchasingLotteryApply } from "@/api/demo";
import { validateBetInput } from "@/utils/validate";

export default {
  components: { CustomHeader },
  data() {
    return {
      selectedMatchList: [],
      betCount: 1,
      isPayLoading: false,
      isNeedUserPhone: 1,
      showPhoneModal: false,
      userPhone: "",
      isSubmitSuccess: false,
      statusBarHeight: 0, // 状态栏高度
      safeAreaBottom: 0, // 底部安全区高度
      headerTotalHeight: 0, // 导航栏总高度
      betBarFixedPx: 0, // 投注栏固定高度（180rpx转px）
      betBarTotalHeight: 0, // 投注栏总高度（仅固定高度，不叠加安全区）
      isApp: false, // 标记是否为App端
      isMp: false, // 标记是否为小程序端
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
      selectedCombo: "",
      showNumberKeyboard: false,
    };
  },
  computed: {
    // 选中的赛事数量（有选中进球数的赛事）
    selectedMatchCount() {
      return this.selectedMatchList.filter((item) => item.selectedGoals && item.selectedGoals.length > 0).length;
    },
    // 注数计算（每行选中的进球数数量相乘）
    betNotes() {
      if (this.selectedMatchList.length === 0) return 0;
      let notes = 1;
      this.selectedMatchList.forEach((item) => {
        const count = item.selectedGoals ? item.selectedGoals.length : 0;
        if (count > 0) notes *= count;
      });
      return notes;
    },
    // 总投注金额
    totalBetAmount() {
      return this.betNotes * this.betCount * 2;
    },
  },
  onShow() {
    uni.setTabBarStyle({ height: "0px" });
  },
  created() {
    // 计算所有高度
    this.calcAllHeights();
  },
  onLoad() {
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.on("selectedData", (data) => {
        this.selectedMatchList = data.matches || [];
        this.betCount = data.betCount || 1;
        this.isNeedUserPhone = data.isNeedUserPhone;
        this.selectedCombo = data.combo || "";
      });
    }
  },
  onUnload() {
    if (this.isSubmitSuccess) return;
    uni.setStorageSync(
      "editedMatchData",
      JSON.stringify({
        matches: this.selectedMatchList,
        betCount: this.betCount,
      })
    );
  },
  methods: {
    // 新增：处理自定义软键盘实时输入
    handleKeyboardInput(val) {
      // 过滤非数字，限制1-50
      const num = parseInt(val) || 1;
      if (num < 1) {
        this.betCount = 1;
      } else if (num > 50) {
        this.betCount = 50;
      } else {
        this.betCount = num;
      }
    },

    // 新增：处理自定义软键盘确认
    handleKeyboardConfirm(val) {
      const num = parseInt(val) || 1;
      this.betCount = Math.min(Math.max(num, 1), 50); // 最终限制1-50
      this.showNumberKeyboard = false; // 收起键盘
    },

    // 原有handleBetInput方法可以保留（兼容备用），也可以删除（因为改用自定义键盘了）
    handleBetInput(e) {
      const inputVal = e.detail.value;
      const validVal = validateBetInput(inputVal);
      this.betCount = null;
      this.$nextTick(() => {
        this.betCount = validVal;
      });
    },
    // 核心优化：统一计算所有高度，投注栏总高度仅保留固定高度，不叠加安全区
    calcAllHeights() {
      const sys = wx.getWindowInfo();
      // 1. 状态栏高度
      this.statusBarHeight = sys.statusBarHeight || 20;
      // 2. 底部安全区高度（小程序端后续会强制置0，避免空白）
      this.safeAreaBottom = (sys.safeAreaInsets && sys.safeAreaInsets.bottom) || 0;
      // 3. 导航栏固定高度（设计稿80rpx转px）
      const navBarFixedRpx = 80;
      const navBarFixedPx = (sys.screenWidth / 750) * navBarFixedRpx;
      // 4. 导航栏总高度
      this.headerTotalHeight = this.statusBarHeight + navBarFixedPx;
      // 5. 投注栏固定高度（180rpx转px，匹配原有80+100rpx结构）
      const betBarFixedRpx = 180;
      this.betBarFixedPx = (sys.screenWidth / 750) * betBarFixedRpx;
      // 6. 投注栏总高度：仅固定高度，不叠加安全区！解决两端空白/溢出问题
      this.betBarTotalHeight = this.betBarFixedPx;
    },
    calculateHalfFullBonus() {
      // 1. 边界判断：无有效选中赛事/无投注注数，返回默认提示
      if (this.selectedMatchCount === 0 || this.betNotes === 0) {
        return "预计：0.00";
      }

      // 2. 收集每一行选中进球数对应的有效赔率（核心：利用本地goalsOptions组装goalsOdds）
      const rowOddsList = []; // 二维数组：[[行1选中进球数赔率], [行2选中进球数赔率], ...]

      this.selectedMatchList.forEach((item, itemIdx) => {
        const currentRowOdds = []; // 当前赛事选中进球数对应的赔率集合（用于后续比较大小）
        const selectedGoals = item.selectedGoals || [];

        // ====== 核心修改1：利用本地data中的goalsOptions，直接组装当前赛事的goalsOdds ======
        const goalsOdds = {};
        this.goalsOptions.forEach((option) => {
          // 映射：进球数value → 对应赔率字段（zjq_ling/zjq_yi...），转换为数字并兜底0
          goalsOdds[option.value] = Number(item[option.field]) || 0;
        });
        // 遍历选中的进球数，提取「对应」的赔率（兼容数字/字符串键名，优化提取逻辑）
        selectedGoals.forEach((goal) => {
          // 分步提取，提升可读性，避免无效值干扰
          let odd = 0;
          const goalNum = Number(goal); // 确保进球数为数字类型

          // 兼容：数字键名（优先） + 字符串键名，双重匹配（基于本地组装的goalsOdds）
          if (goalsOdds.hasOwnProperty(goalNum)) {
            odd = Number(goalsOdds[goalNum]);
          } else if (goalsOdds.hasOwnProperty(String(goalNum))) {
            odd = Number(goalsOdds[String(goalNum)]);
          }

          // 仅收集有效赔率（大于0，且为合法数字），排除NaN/0/负数
          if (!isNaN(odd) && odd > 0) {
            currentRowOdds.push(odd);
          }
        });

        // 仅添加有有效赔率的赛事行（确保后续比较大小和乘积计算有意义）
        if (currentRowOdds.length > 0) {
          rowOddsList.push(currentRowOdds);
        }
      });

      if (rowOddsList.length === 0) {
        console.warn("警告：未提取到任何有效赔率，无法计算奖金");
      }

      // 3. 边界判断：无有效赔率数据，无法比较大小和计算奖金，返回默认提示
      if (rowOddsList.length === 0) {
        return "预计：0.00";
      }

      // 4. 判断是否所有赛事都仅选中1个进球数（区分单值/区间奖金，核心依赖赔率大小比较）
      const isAllSingleSelect = rowOddsList.every((oddsArr) => oddsArr.length === 1);

      // 5. 计算最低赔率乘积（区间下限）和 最高赔率乘积（区间上限）—— 核心：比较赔率大小
      let minOddsProduct = 1; // 各行选中赔率的「最小值」乘积（比较大小后取最小）
      let maxOddsProduct = 1; // 各行选中赔率的「最大值」乘积（比较大小后取最大）

      rowOddsList.forEach((oddsArr, arrIdx) => {
        // 安全获取最小值/最大值，避免空数组报错（已有前置判断，双重保障）
        const currentMin = oddsArr.length > 0 ? Math.min(...oddsArr) : 1;
        const currentMax = oddsArr.length > 0 ? Math.max(...oddsArr) : 1;

        // 累积乘积，保留精度（暂时不格式化，最终结果统一格式化）
        minOddsProduct *= currentMin;
        maxOddsProduct *= currentMax;
      });

      // 6. 计算最终奖金（每注2元 × 投注倍数 × 赔率乘积，基于前面比较出的赔率大小）
      const base = 2 * this.betCount; // 基础金额：每注2元 × 投注倍数
      const minBonus = minOddsProduct * base;
      const maxBonus = maxOddsProduct * base;

      // 7. 格式化返回结果（保留2位小数，贴合展示规范，处理超大数值）
      const formatBonus = (bonus) => {
        // 避免数值过大，保留2位小数，兼容科学计数法转换
        const num = Number(bonus);
        if (isNaN(num) || num <= 0) {
          return "0.00";
        }
        return num.toFixed(2);
      };

      const minBonusText = formatBonus(minBonus);
      const maxBonusText = formatBonus(maxBonus);

      if (isAllSingleSelect) {
        // 全单选中：无需多赔率比较，直接返回单值奖金
        return `预计：${minBonusText}`;
      } else {
        // 存在多选中：返回基于赔率大小比较的区间奖金（最小值乘积→下限，最大值乘积→上限）
        return `预计：${minBonusText} ~ ${maxBonusText}`;
      }
    },
    confirmPhone() {
      const reg = /^1[3-9]\d{9}$/;
      if (!reg.test(this.userPhone)) {
        uni.showToast({ title: "请输入正确的手机号", icon: "none" });
        return;
      }
      this.showPhoneModal = false;
      this.handleConfirmBet(true);
    },
    handleBack() {
      uni.setStorageSync(
        "editedMatchData",
        JSON.stringify({
          matches: this.selectedMatchList,
          betCount: this.betCount,
        })
      );
      uni.navigateBack({ delta: 1 });
    },
    handleMinus() {
      if (this.betCount > 1) this.betCount--;
      const v = this.calculateHalfFullBonus();
    },
    handleBetInput(e) {
      const inputVal = e.detail.value;
      const validVal = validateBetInput(inputVal);

      // 关键修复：先赋值为null/空，再赋值目标值（触发输入框重渲染）
      this.betCount = null; // 先清空，打破响应式缓存
      this.$nextTick(() => {
        // 等待DOM更新后赋值
        this.betCount = validVal;
      });
    },
    handlePlus() {
      // 1. 校验：未选中赛事时直接返回
      if (this.selectedMatchCount < 1) return;
      // 2. 修复：先判断是否小于50，再执行++，避免超过50
      if (this.betCount < 50) {
        this.betCount++;
      } else {
        // 可选：提示用户倍数已达上限
        uni.showToast({ title: "倍数最多50倍", icon: "none" });
      }
    },
    async handleConfirmBet(fromPhoneModal) {
      if (this.selectedMatchCount === 0) {
        uni.showToast({ title: "请先选择至少一场赛事的进球数", icon: "none" });
        return;
      }
      if (this.isNeedUserPhone == 1 && !fromPhoneModal) {
        this.showPhoneModal = true;
        return;
      }

      this.isPayLoading = true;
      const list = this.selectedMatchList.map((item) => ({
        courseId: item.id,
        serialNumber: item.serial_number,
        homeName: item.home_name,
        visitingName: item.visiting_name,
        totalGoals: item.selectedGoals && item.selectedGoals.length > 0 ? item.selectedGoals.join(",") : "",
        selectedGoals: item.selectedGoals || [],
      }));

      try {
        const res = await purchasingLotteryApply({
          contentJson: JSON.stringify(list),
          entityType: "足彩总进球",
          multiple: this.betNotes,
          bet: this.betCount,
          payment: this.totalBetAmount,
          payType: "wechat",
          userPhone: this.userPhone,
        });
        if (res.code == 200) {
          this.isPayLoading = false;
          this.isSubmitSuccess = true;
          uni.showToast({
            title: "操作成功！",
            icon: "success", // 四方成功图标
            duration: 2000, // 提示显示2秒
            mask: true, // 显示透明蒙层，防止点击穿透
          });
          // 提交成功清空缓存
          uni.setStorageSync("editedMatchData", JSON.stringify({ matches: [], betCount: 1 }));
          // 4. 延迟2秒后跳转（和提示时长匹配）
          setTimeout(() => {
            uni.navigateBack({ delta: 1 });
          }, 2000);
        } else {
          this.isPayLoading = false;
          uni.showToast({ title: res.msg || "操作失败", icon: "none" });
        }
      } catch (err) {
        this.isPayLoading = false;
        uni.showToast({ title: "网络异常，请稍后重试", icon: "none" });
      }
    },
  },
};
</script>

<style scoped lang="scss">
.scheme-edit-page {
  background-color: #f5f5f5;
  height: 100vh;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  // 兼容H5端滚动穿透
  // #ifdef H5
  overflow: hidden;
  // #endif
}

// 滚动区样式：保留原有逻辑，基于JS计算的top/bottom定位
.match-scroll {
  position: absolute !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  height: auto !important;
  overflow-y: auto !important;
  background-color: #f5f5f5;
  box-sizing: border-box;
  padding: 10rpx 20rpx 20rpx;

  // 隐藏滚动条
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
}

.match-list {
  width: 100%;
  box-sizing: border-box;
}

/* 赛事行：原型图样式 */
.match-row {
  background-color: #fff;
  border-radius: 8rpx;
  margin-bottom: 15rpx;
  margin-top: 20rpx;
  padding: 26rpx 20rpx;
  box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.05);
}

/* 赛事顶部：编号+队名VS队名 */
.match-header {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
  font-size: 28rpx;
  color: #333;

  .serial-number {
    margin-right: 20rpx;
    font-weight: 400;
    color: #999;
  }

  // 核心：外层容器 - VS固定宽度，左右平分剩余空间
  .team-win-rate-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    width: 100%;
  }

  // 左右队容器：平分剩余宽度
  .team-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
  }

  // 左侧队：内容靠右对齐
  .left-team {
    align-items: flex-end;
    padding-right: 10rpx; // 和VS保持少量间距
  }

  // 右侧队：内容靠左对齐
  .right-team {
    align-items: flex-start;
    padding-left: 10rpx; // 和VS保持少量间距
  }

  // VS容器：固定宽度，居中显示
  .vs-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 120rpx; // 固定VS宽度，保证始终居中
    flex-shrink: 0; // 不被压缩
  }

  // 队名字体样式
  .team-name-text {
    font-size: 28rpx;
    color: #333;
    line-height: 1.2;
  }

  // 胜率/平率字体样式
  .rate-text {
    font-size: 22rpx;
    color: #666;
    margin-top: 4rpx;
    line-height: 2;
  }

  // VS文本样式
  .vs-text {
    color: #999;
    font-size: 28rpx;
    line-height: 1.2;
  }
}
/* 选中的进球数：原型图红色显示 */
.selected-goals {
  text-align: center;
  font-size: 32rpx;
  color: #d92929; /* 原型图红色 */
  font-weight: 500;
  background: #f1f1f1;
  border-radius: 10rpx;
  padding: 10rpx 0;
}

.empty-tip {
  text-align: center;
  padding: 50rpx 0;
  font-size: 26rpx;
  color: #999;
  background-color: #fff;
  border-radius: 8rpx;
  margin: 20rpx 0;
}

// 核心优化：投注栏强制固定高度，解决两端溢出/空白问题
.bet-bar {
  position: fixed !important;
  width: 100% !important;
  left: 0 !important;
  z-index: 10 !important;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
  padding-bottom: 0 !important;
  box-sizing: border-box !important;
  height: 80rpx !important;

  // #ifdef MP-WEIXIN
  bottom: calc(100rpx + env(safe-area-inset-bottom)) !important;
  // #endif

  // #ifdef APP-PLUS
  bottom: calc(100rpx + constant(safe-area-inset-bottom)) !important;
  bottom: calc(100rpx + env(safe-area-inset-bottom)) !important;
  // #endif

  // #ifdef H5
  bottom: calc(102rpx + env(safe-area-inset-bottom)) !important;
  // #endif

.bet-bar-top {
    background: #fff;
    display: flex;
    justify-content: space-around;
    align-items: center;
    
    // 新增提示文本样式
    .tips-text {
      font-size: 24rpx;
      color: #d92929;
      flex: 1;
      margin-left: 20rpx;
      line-height: 1.4;
    }

    // 缩小 top-left 样式
    .top-left {
      font-size: 24rpx; // 从28rpx改小
      color: #333;
      padding: 8rpx 12rpx;
      margin-left: 10rpx; // 缩小左边距
      max-width: 150rpx; // 缩小最大宽度
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .collapse-area {
      display: flex;
      align-items: center;
      justify-content: space-around;
      height: 80rpx;
      box-sizing: border-box;
      padding: 10rpx 20rpx;
      border-bottom: 2rpx solid #eee;

      .multi-group {
        display: flex;
        align-items: center;
        gap: 10rpx;

        .multi-label {
          height: 100%;
          font-size: 26rpx; // 略缩小
          color: #333;
        }

        .multi-btn {
          width: 44rpx; // 从52rpx改小
          height: 44rpx; // 从52rpx改小
          background-color: #ddd;
          color: #333;
          font-size: 28rpx; // 从32rpx改小
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1rpx solid #ccc;
          padding: 0;
          margin: 0;
          border-radius: 0;
          // #ifdef MP-WEIXIN
          line-height: 1;
          // #endif
        }

        // 缩小输入框
        .multi-input {
          width: 120rpx; // 从180rpx改小
          height: 44rpx; // 从52rpx改小
          background-color: #fff;
          color: #333;
          text-align: center;
          font-size: 26rpx; // 从30rpx改小
          border: 1rpx solid #ccc;
          padding: 0;
          box-sizing: border-box;
          border-radius: 0;
          // #ifdef H5
          outline: none;
          // #endif
        }
      }
    }
  }


  .bet-bar-bottom {
    display: flex;
    align-items: center;
    height: 100rpx; // 和bet-bar-top合计200rpx，匹配固定高度
    background-color: #232323;
    color: #fff;
    box-sizing: border-box;
    padding: 0 20rpx;

    .bottom-middle {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin: 0 20rpx;
      height: 100%;

      .select-tip {
        height: 50rpx;
        font-size: 28rpx;
        color: #fff;
        text-align: center;
      }

      .bonus-tip {
        font-size: 18rpx;
        color: #999;
        line-height: 1.2;
        text-align: center;
      }
    }

    .bottom-right {
      width: 200rpx;

      .confirm-btn {
        width: 100%;
        height: 76rpx;
        background-color: #d92929;
        color: #fff;
        border-radius: 8rpx;
        font-size: 28rpx;
        border: none;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        &[disabled] {
          background-color: #666;
          color: #aaa;
          cursor: not-allowed;
        }
        // 小程序按钮点击态
        // #ifdef MP-WEIXIN
        &:active {
          opacity: 0.8;
        }
        // #endif
      }
    }
  }
}
/* 手机号弹窗：保留原有样式，优化多端兼容 */
.phone-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;

  .modal-mask {
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
  }

  .modal-content {
    width: 80%;
    background: #fff;
    border-radius: 16rpx;
    padding: 40rpx;
    position: relative;

    .modal-desc {
      font-size: 28rpx;
      color: #666;
      line-height: 1.5;
      margin-bottom: 30rpx;
    }

    .input-wrap {
      display: flex;
      align-items: center;
      margin-bottom: 40rpx;

      label {
        font-size: 28rpx;
        color: #333;
        width: 180rpx;
      }

      input {
        flex: 1;
        height: 70rpx;
        border: 1rpx solid #eee;
        border-radius: 8rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
        // H5输入框兼容
        // #ifdef H5
        outline: none;
        // #endif
      }
    }

    .modal-btns {
      display: flex;
      gap: 20rpx;

      button {
        flex: 1;
        height: 80rpx;
        border-radius: 8rpx;
        font-size: 28rpx;
        // 小程序按钮兼容
        // #ifdef MP-WEIXIN
        line-height: 1;
        &:active {
          opacity: 0.8;
        }
        // #endif
      }

      .cancel-btn {
        background: #f5f5f5;
        color: #666;
      }

      .confirm-btn {
        background: #d92929;
        color: #fff;
      }
    }
  }
}

// 隐藏滚动条（全端兼容）
::-webkit-scrollbar {
  display: none;
}
</style>
