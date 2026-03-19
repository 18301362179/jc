<template>
  <view class="scheme-edit-page">
    <!-- 顶部导航：保留 -->
    <CustomHeader :ballTitle="'足球'" title="比分" :showBack="true" :showIcon="false" @back-click="handleBack" />

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
        <!-- 赛事行：上下结构（和总进球示例一致） -->
        <view v-for="(item, index) in selectedMatchList" :key="index" class="match-row">
          <!-- 上排：编号 + 队名VS队名 -->
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
                <text class="rate-text" v-if="item.draw_rate">平率{{ item.draw_rate }}</text>
              </view>
              <!-- 右侧客队区域：占剩余宽度50%，内容靠左 -->
              <view class="team-item right-team">
                <text class="team-name-text">{{ item.visiting_name }}</text>
                <text class="rate-text" v-if="item.visiting_win_rate">胜率{{ item.visiting_win_rate }}</text>
              </view>
            </view>
          </view>
          <!-- 下排：选中的比分内容（一整行） -->
          <view class="selected-content">
            {{ item.selectedScores && item.selectedScores.length > 0 ? item.selectedScores.join(",") : "无选中投注内容" }}
          </view>
        </view>

        <view class="empty-tip" v-if="selectedMatchList.length === 0"> 暂无 </view>
      </view>
    </scroll-view>

    <!-- <view
      class="bet-bar"
      :style="{
        height: betBarFixedPx + 'px',
        paddingBottom: (isApp ? safeAreaBottom : 0) + 'px',
      }"
    >
      <view class="bet-bar-top">
        <view class="top-left">
          {{ selectedMatchList.length == 1 ? "单关" : selectedMatchList.length + "串1" }}
        </view>
        <view class="collapse-area">
          <view class="multi-group">
            <button class="multi-btn minus" @click="handleMinus"><text>-</text></button>
            <view class="multi-input" @tap="showNumberKeyboard = true" :class="{ disabled: selectedMatchCount < 1 }">
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
          <text class="bonus-tip">{{ calculateScoreBonus() }}</text>
        </view>
      </view>
    </view> -->

    <!-- 手机号弹窗：保留 -->
    <view class="phone-modal" v-if="showPhoneModal">
      <view class="modal-mask" @click="showPhoneModal = false"></view>
      <view class="modal-content">
        <view class="modal-desc">业务人员通过微信与您联系确认购买及打印彩票后给您发送图片留作兑奖凭证等后续流程</view>
        <view class="input-wrap">
          <label>微信手机号：</label>
          <input type="number" v-model="userPhone" placeholder="请输入手机号（必填）" maxlength="11" />
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
// 脚本部分保留专属逻辑，新增高度计算/多端适配
import CustomHeader from "@/components/CustomHeader.vue";
import { purchasingLotteryApply } from "@/api/demo";
import { validateBetInput } from "@/utils/validate";
export default {
  components: { CustomHeader },
  data() {
    return {
      selectedMatchList: [],
      betCount: 50,
      isPayLoading: false,
      isNeedUserPhone: 1,
      showPhoneModal: false,
      userPhone: "",
      isSubmitSuccess: false,
      statusBarHeight: 0,
      safeAreaBottom: 0, // 底部安全区高度
      headerTotalHeight: 0, // 导航栏总高度
      betBarFixedPx: 0, // 投注栏固定高度（180rpx转px）
      betBarTotalHeight: 0, // 投注栏总高度（仅固定高度，不叠加安全区）
      isApp: false, // 标记是否为App端
      isMp: false, // 标记是否为小程序端
      // 主队胜配置（添加「胜其它」）
      mainWinScores: [
        { label: "1:0", value: "1:0", odds: "" },
        { label: "2:0", value: "2:0", odds: "" },
        { label: "2:1", value: "2:1", odds: "" },
        { label: "3:0", value: "3:0", odds: "" },
        { label: "3:1", value: "3:1", odds: "" },
        { label: "3:2", value: "3:2", odds: "" },
        { label: "4:0", value: "4:0", odds: "" },
        { label: "4:1", value: "4:1", odds: "" },
        { label: "4:2", value: "4:2", odds: "" },
        { label: "5:0", value: "5:0", odds: "" },
        { label: "5:1", value: "5:1", odds: "" },
        { label: "5:2", value: "5:2", odds: "" },
        { label: "胜其它", value: "胜其它", odds: "" }, // 新增：胜其它
      ],
      // 平局配置（添加「平其它」）
      drawScores: [
        { label: "0:0", value: "0:0", odds: "" },
        { label: "1:1", value: "1:1", odds: "" },
        { label: "2:2", value: "2:2", odds: "" },
        { label: "3:3", value: "3:3", odds: "" },
        { label: "平其它", value: "平其它", odds: "" }, // 新增：平其它
      ],
      // 客队胜配置（添加「负其它」，注意：客队胜对应「负其它」，字段名保持一致）
      awayWinScores: [
        { label: "0:1", value: "0:1", odds: "" },
        { label: "0:2", value: "0:2", odds: "" },
        { label: "1:2", value: "1:2", odds: "" },
        { label: "0:3", value: "0:3", odds: "" },
        { label: "1:3", value: "1:3", odds: "" },
        { label: "2:3", value: "2:3", odds: "" },
        { label: "0:4", value: "0:4", odds: "" },
        { label: "1:4", value: "1:4", odds: "" },
        { label: "2:4", value: "2:4", odds: "" },
        { label: "0:5", value: "0:5", odds: "" },
        { label: "1:5", value: "1:5", odds: "" },
        { label: "2:5", value: "2:5", odds: "" },
        { label: "负其它", value: "负其它", odds: "" }, // 新增：负其它
      ],
      selectedCombo: "",
      showNumberKeyboard: false,
    };
  },
  computed: {
    // 选中的赛事数量（有选中比分的赛事）
    selectedMatchCount() {
      return this.selectedMatchList.filter((item) => {
        return item.selectedScores && item.selectedScores.length > 0;
      }).length;
    },
    // 注数计算（每行选中的比分数量相乘）
    betNotes() {
      const selectedRows = this.selectedMatchList.filter((item) => item.selectedScores && Array.isArray(item.selectedScores) && item.selectedScores.length > 0);

      if (selectedRows.length === 0) return 0;

      return selectedRows.reduce((total, row) => {
        const rowSelectedCount = row.selectedScores.length;
        return total * rowSelectedCount;
      }, 1);
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
    // 接收列表页传递的「含selectedScores的赛事列表」
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.on("selectedData", (data) => {
        // 深拷贝，避免修改影响原列表
        this.selectedMatchList = JSON.parse(JSON.stringify(data.matches || []));
        this.betCount = data.betCount || 1;
        this.isNeedUserPhone = data.isNeedUserPhone;
        this.selectedCombo = data.combo || "";
      });
    }
  },
  onUnload() {
    // 提交成功则清空缓存，未成功则保存当前注数（选中状态不变）
    if (this.isSubmitSuccess) return;
    const editedData = {
      matches: this.selectedMatchList, // 选中状态原样保存
      betCount: this.betCount, // 仅保存修改后的注数
    };
    uni.setStorageSync("editedMatchData", JSON.stringify(editedData));
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
    calculateScoreBonus() {
      // 1. 边界判断：无有效赛事/注数，返回默认提示（修正变量笔误：betCount → betNotes，保持与组件状态一致）
      if (this.selectedMatchCount === 0 || this.betNotes === 0) {
        return "0.00元 ~ 0.00元（仅供参考以彩票奖金为主）";
      }

      // 2. 核心：【比分 - 纯赔率字段】精准映射规则（完全基于持久化的赔率数据）
      // 编码规则：y=1、e=2、s=3、si=4、w=5、l=0，字段与接口返回完全一致
      const scoreToOddsFieldMap = {
        // 主胜比分
        "1:0": "ybl", // 1:0 → y=1、l=0 → ybl: "7.00"
        "2:0": "ebl", // 2:0 → e=2、l=0 → ebl: "7.55"
        "2:1": "eby", // 2:1 → e=2、y=1 → eby: "6.90"
        "3:0": "sbl", // 3:0 → s=3、l=0 → sbl: "11.00"
        "3:1": "sby", // 3:1 → s=3、y=1 → sby: "10.50"
        "3:2": "sbe", // 3:2 → s=3、e=2 → sbe: "19.00"
        "4:0": "sibl", // 4:0 → si=4、l=0 → sibl: "22.00"
        "4:1": "siby", // 4:1 → si=4、y=1 → siby: "22.00"
        "4:2": "sibe", // 4:2 → si=4、e=2 → sibe: "45.00"
        "5:0": "wbl", // 5:0 → w=5、l=0 → wbl: "60.00"
        "5:1": "wby", // 5:1 → w=5、y=1 → wby: "55.00"
        "5:2": "wbe", // 5:2 → w=5、e=2 → wbe: "90.00"
        // 平局比分
        "0:0": "lbl", // 0:0 → l=0、l=0 → lbl: "14.00"
        "1:1": "yby", // 1:1 → y=1、y=1 → yby: "8.00"
        "2:2": "ebe", // 2:2 → e=2、e=2 → ebe: "13.50"
        "3:3": "sbs", // 3:3 → s=3、s=3 → sbs: "60.00"
        // 客胜比分
        "0:1": "lby", // 0:1 → l=0、y=1 → lby: "14.50"
        "0:2": "lbe", // 0:2 → l=0、e=2 → lbe: "29.00"
        "1:2": "ybe", // 1:2 → y=1、e=2 → ybe: "14.00"
        "0:3": "lbs", // 0:3 → l=0、s=3 → lbs: "85.00"
        "1:3": "ybs", // 1:3 → y=1、s=3 → ybs: "40.00"
        "2:3": "ebs", // 2:3 → e=2、s=3 → ebs: "40.00"
        "0:4": "lbsi", // 0:4 → l=0、si=4 → lbsi: "300.00"
        "1:4": "ybsi", // 1:4 → y=1、si=4 → ybsi: "150.00"
        "2:4": "ebsi", // 2:4 → e=2、si=4 → ebsi: "150.00"
        "0:5": "lbw", // 0:5 → l=0、w=5 → lbw: "600.00"
        "1:5": "ybw", // 1:5 → y=1、w=5 → ybw: "400.00"
        "2:5": "ebw", // 2:5 → e=2、w=5 → ebw: "500.00"
      };

      // 3. 收集每场赛事选中比分的有效赔率
      const matchValidOddsList = [];

      // 遍历已选中的比赛列表（确保使用持久化数据的列表：selectedMatchList）
      this.selectedMatchList.forEach((match, matchIndex) => {
        const currentMatchValidOdds = [];
        // 容错：获取当前比赛的选中比分，避免数组不存在
        const selectedScores = Array.isArray(match.selectedScores) ? [...match.selectedScores] : [];
        // 容错：获取当前比赛的其它赔率（胜/平/负其它），避免属性不存在
        const scoreOdds = match.score_odds || { winOther: "", drawOther: "", loseOther: "" };
        // 核心：获取持久化存储的完整赔率数据（优先从 oddsData 取值，这是之前弹窗确定时保存的）
        const matchOddsData = match.oddsData || {};

        // 4. 遍历当前场选中的所有比分，提取纯赔率数据
        selectedScores.forEach((scoreValue) => {
          let validOdds = 0;

          // 4.1 优先处理「其它」比分（对应 sqt/pqt/fqt，从 oddsData 取值）
          if (["胜其它", "平其它", "负其它"].includes(scoreValue)) {
            switch (scoreValue) {
              case "胜其它":
                validOdds = scoreOdds.winOther || matchOddsData.sqt ? (isNaN(Number(scoreOdds.winOther || matchOddsData.sqt)) ? 0 : Number(scoreOdds.winOther || matchOddsData.sqt)) : 0;
                break;
              case "平其它":
                validOdds = scoreOdds.drawOther || matchOddsData.pqt ? (isNaN(Number(scoreOdds.drawOther || matchOddsData.pqt)) ? 0 : Number(scoreOdds.drawOther || matchOddsData.pqt)) : 0;
                break;
              case "负其它":
                validOdds = scoreOdds.loseOther || matchOddsData.fqt ? (isNaN(Number(scoreOdds.loseOther || matchOddsData.fqt)) ? 0 : Number(scoreOdds.loseOther || matchOddsData.fqt)) : 0;
                break;
            }
          }
          // 4.2 处理具体比分：从映射表获取对应赔率字段，从 oddsData 提取有效值（核心修复）
          else if (scoreToOddsFieldMap[scoreValue]) {
            const targetOddsField = scoreToOddsFieldMap[scoreValue];
            // 关键：从持久化的 matchOddsData 中取值，而非 match 根节点
            const rawOdds = matchOddsData[targetOddsField];

            // 严格容错：非空、非空字符串、可转数字才提取有效赔率
            if (rawOdds !== undefined && rawOdds !== null && rawOdds !== "" && !isNaN(Number(rawOdds))) {
              validOdds = Number(rawOdds);
            }
          }
          // 4.3 未知比分容错
          else {
            return;
          }

          // 4.4 筛选有效赔率：仅保留大于0的合法数字，存入当前场次赔率集合
          if (!isNaN(validOdds) && validOdds > 0) {
            currentMatchValidOdds.push(validOdds);
          } else {
          }
        });

        // 4.5 存入有效赔率集合（仅保留有数据的场次，避免空数组干扰后续计算）
        if (currentMatchValidOdds.length > 0) {
          matchValidOddsList.push(currentMatchValidOdds);
        } else {
        }
      });

      // 5. 边界判断：无任何有效赔率数据，返回默认提示
      if (matchValidOddsList.length === 0) {
        return "0.00元 ~ 0.00元（仅供参考以彩票奖金为主）";
      }

      // 6. 核心逻辑：提取每场最小/最大赔率，计算全局乘积（单场/多场均翻倍）
      let totalMinOddsProduct = 1;
      let totalMaxOddsProduct = 1;
      const coreMultiplier = 2; // 固定乘数：无论单场/多场，最终都翻倍（乘以2）

      // 6.1 遍历所有场次，计算纯场次乘积（每场最小/最大赔率分别相乘）
      matchValidOddsList.forEach((oddsArr) => {
        const currentMatchMin = Math.min(...oddsArr); // 提取当前场最小赔率
        const currentMatchMax = Math.max(...oddsArr); // 提取当前场最大赔率
        totalMinOddsProduct *= currentMatchMin; // 累积：所有场次最小赔率相乘
        totalMaxOddsProduct *= currentMatchMax; // 累积：所有场次最大赔率相乘
      });

      // 6.2 应用固定乘数：单场/多场均翻倍（乘以2），实现核心需求
      totalMinOddsProduct *= coreMultiplier;
      totalMaxOddsProduct *= coreMultiplier;

      // 7. 计算奖金区间，格式化结果（保证金额精度，符合展示规范）
      const perNotePrice = 2; // 固定2元/注
      const validBetCount = Number(this.betNotes) || 1; // 修正变量：betCount → betNotes，保持状态一致
      const bonusBase = perNotePrice * validBetCount; // 奖金计算基数

      // 格式化奖金工具函数（解决toFixed四舍五入误差，兜底0.00）
      const formatBonusAmount = (bonus) => {
        const bonusNum = Number(bonus);
        if (isNaN(bonusNum) || bonusNum <= 0) {
          return "0.00";
        }
        // 先四舍五入到分，再转字符串保留2位小数，避免toFixed的精度问题
        return (Math.round(bonusNum * 100) / 100).toFixed(2);
      };

      // 计算并格式化最终奖金
      const minBonus = formatBonusAmount(totalMinOddsProduct * bonusBase);
      const maxBonus = formatBonusAmount(totalMaxOddsProduct * bonusBase);

      // 9. 返回最终结果（保留比分玩法专属提示语，便于页面展示）
      return `${minBonus} ~ ${maxBonus}（仅供参考以彩票奖金为主）`;
    },
    // 确认手机号（强化必填验证）
    confirmPhone() {
      // 强化验证：isNeedUserPhone=1时，手机号不能为空且格式正确
      if (this.isNeedUserPhone == 1) {
        const reg = /^1[3-9]\d{9}$/;
        if (!this.userPhone) {
          uni.showToast({ title: "手机号不能为空！", icon: "none", duration: 1500 });
          return;
        }
        if (!reg.test(this.userPhone)) {
          uni.showToast({ title: "请输入正确的手机号", icon: "none", duration: 1500 });
          return;
        }
      }
      this.showPhoneModal = false;
      this.handleConfirmBet(true);
    },
    // 返回上一页（保存当前注数）
    handleBack() {
      this.saveEditedData();
      uni.navigateBack({ delta: 1 });
    },
    // 保存编辑页数据（仅注数，选中状态不可改）
    saveEditedData() {
      const deepCopyData = JSON.parse(
        JSON.stringify({
          matches: this.selectedMatchList,
          betCount: this.betCount,
        })
      );
      uni.setStorageSync("editedMatchData", JSON.stringify(deepCopyData));
    },
    // 注数减1（仅允许≥1）
    handleMinus() {
      if (this.betCount > 1) this.betCount--;
      const v = this.calculateScoreBonus();
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
    // 注数加1
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
    // 模拟投注（提交选中的比分数据）
    async handleConfirmBet(fromPhoneModal) {
      // 1. 先判断是否选中赛事
      if (this.selectedMatchCount === 0) {
        uni.showToast({ title: "请先选择至少一场赛事的投注内容", icon: "none", duration: 1500 });
        return;
      }
      // 2. 判断是否需要手机号（未填写则弹出手机号弹窗）
      if (this.isNeedUserPhone == 1 && !fromPhoneModal) {
        this.showPhoneModal = true;
        return;
      }

      this.isPayLoading = true;
      // 3. 构造提交数据：传递选中的比分列表
      const list = this.selectedMatchList.map((item) => ({
        courseId: item.id,
        serialNumber: item.serial_number,
        leagueName: item.league_name,
        homeName: item.home_name,
        visitingName: item.visiting_name,
        raceDate: item.race_date,
        dateStr: item.date_str,
        homeAndVisitingGaols: item.selectedScores,
        selectedScores: item.selectedScores || [], // 提交选中的比分
        playType: "比分", // 标识玩法类型
      }));

      const payRequestData = {
        contentJson: JSON.stringify(list),
        entityType: "比分",
        multiple: this.betNotes, // 注数（选中比分数量相乘）
        bet: this.betCount, // 倍数（仅可修改）
        payment: this.totalBetAmount, // 总额（注数×倍数×2）
        payType: "wechat",
        userPhone: this.userPhone,
      };

      try {
        const res = await purchasingLotteryApply(payRequestData);
        if (res.code == 200) {
          this.isPayLoading = false;
          this.isSubmitSuccess = true;
          // 4. 投注成功：弹出四方提示（success样式）
          uni.showToast({
            title: "操作成功！",
            icon: "success", // 四方成功图标
            duration: 2000, // 提示显示2秒
            mask: true, // 显示透明蒙层，防止点击穿透
          });
          // 提交成功清空缓存
          uni.setStorageSync("editedMatchData", JSON.stringify({ matches: [], betCount: 50 }));
          // 5. 延迟2秒后跳转（和提示时长匹配）
          setTimeout(() => {
            uni.navigateBack({ delta: 1 });
          }, 2000);
        } else {
          this.isPayLoading = false;
          uni.showToast({ title: res.message || "获取支付信息失败", icon: "none", duration: 1500 });
        }
      } catch (error) {
        this.isPayLoading = false;
        uni.showToast({ title: "网络异常，请稍后重试", icon: "none", duration: 1500 });
      }
    },
    // 微信支付（保留原有逻辑）
    invokeWxPayment(payParams) {
      const { timeStamp, nonceStr, package: prepayPackage, signType, paySign, orderId } = payParams;

      uni.requestPayment({
        provider: "wxpay",
        timeStamp: timeStamp + "",
        nonceStr: nonceStr,
        package: prepayPackage,
        signType: signType,
        paySign: paySign,
        success: (res) => {
          this.isPayLoading = false;
          uni.showToast({ title: "支付成功", icon: "success", duration: 1500 });
          setTimeout(() => {
            uni.navigateTo({ url: `/pages/orderDetail/orderDetail?orderId=${orderId}` });
            this.selectedMatchList = [];
            this.betCount = 1;
          }, 1500);
        },
        fail: (err) => {
          this.isPayLoading = false;
          if (err.errMsg.includes("cancel")) {
            uni.showToast({ title: "已取消支付", icon: "none", duration: 1500 });
          } else {
            uni.showToast({ title: "支付失败，请重试", icon: "none", duration: 1500 });
          }
        },
        complete: () => {
          this.isPayLoading = false;
        },
      });
    },
  },
};
</script>

<style scoped lang="scss">
// 基础布局：和标准版统一
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

/* 赛事行：原型图样式，保留比分专属样式 */
.match-row {
  background-color: #fff;
  border-radius: 8rpx;
  margin-bottom: 15rpx;
  margin-top: 20rpx;
  padding: 26rpx 20rpx;
  box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.05);
}

/* 上排：编号 + 队名VS队名 */
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

/* 下排：选中内容（一整行）- 比分专属样式 */
.selected-content {
  text-align: center;
  font-size: 32rpx;
  color: #d92929;
  font-weight: 500;
  background: #f1f1f1;
  border-radius: 10rpx;
  padding: 16rpx 0;
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
