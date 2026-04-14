<template>
  <!-- 模板部分保持不变 -->
  <view class="scheme-edit-page">
    <CustomHeader :ballTitle="''"  :isIndex="false" title="混合过关" :showBack="true" :showIcon="false" @back-click="handleBack" />

    <scroll-view
      class="match-scroll"
      scroll-y
      :style="{
        top: headerTotalHeight + 'px',
        bottom: betBarTotalHeight + 'px',
      }"
    >
      <view class="match-list">
        <view class="empty-tip" v-if="selectedMatchList.length === 0">暂无</view>

        <view v-for="(item, index) in selectedMatchList" :key="index" class="match-row">
          <view class="match-header">
            <text class="serial-number">{{ item.serial_number }}</text>
            <!-- 重构为弹性布局，VS固定宽度，左右平分剩余空间 -->
            <view class="team-win-rate-wrap">
              <!-- 左侧主队区域：占剩余宽度50%，内容靠右 -->
              <view class="team-item left-team">
                <text class="team-name-text">{{ item.home_name }}</text>
                <text class="rate-text" v-if="item.home_win_rate">胜{{ item.home_win_rate }}</text>
              </view>
              <!-- VS区域：固定宽度，居中显示 -->
              <view class="vs-item">
                <text class="vs-text">VS</text>
                <text class="rate-text" v-if="item.draw_rate">平{{ item.draw_rate || "" }}</text>
              </view>
              <!-- 右侧客队区域：占剩余宽度50%，内容靠左 -->
              <view class="team-item right-team">
                <text class="team-name-text">{{ item.visiting_name }}</text>
                <text class="rate-text" v-if="item.visiting_win_rate">胜{{ item.visiting_win_rate }}</text>
              </view>
            </view>
          </view>

          <view class="selected-content">
            <!-- 胜平负 -->
            <view class="bet-item" v-if="getBetItem('spf', item)">
              <text class="bet-label">胜平负：</text>
              <text class="bet-value highlight">{{ getBetItem("spf", item) }}</text>
            </view>
            <!-- 让球胜平负 -->
            <view class="bet-item" v-if="getBetItem('rspf', item)">
              <text class="bet-label">让球胜平负：</text>
              <text class="bet-value highlight">{{ getBetItem("rspf", item) }}</text>
            </view>
            <!-- 比分 -->
            <view class="bet-item" v-if="getBetItem('bf', item)">
              <text class="bet-label">比分：</text>
              <text class="bet-value highlight">{{ getBetItem("bf", item) }}</text>
            </view>
            <!-- 总进球 -->
            <view class="bet-item" v-if="getBetItem('zjq', item)">
              <text class="bet-label">总进球：</text>
              <text class="bet-value highlight">{{ getBetItem("zjq", item) }}</text>
            </view>
            <!-- 半全场 -->
            <view class="bet-item" v-if="getBetItem('bqc', item)">
              <text class="bet-label">半全场：</text>
              <text class="bet-value highlight">{{ getBetItem("bqc", item) }}</text>
            </view>

            <view v-if="!hasAnyBetItem(item)" class="empty-bet">
              <text class="trigger-tip">无选中内容</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view
       v-if="urlValue"
      class="bet-bar"
      :style="{
        height: betBarFixedPx + 'px',
        paddingBottom: (isApp ? safeAreaBottom : 0) + 'px',
      }"
    >
      <view class="bet-bar-top">
        <!-- -->
        <view class="collapse-area">
          <view class="multi-group" style="color: #d92929;">
             <button class="multi-btn minus" @click="handleMinus"><text>-</text></button>
            <view class="multi-input" @tap="showNumberKeyboard = true" :class="{ disabled: selectedMatchCount < 1 }">
              {{ betCount }}
            </view>
            <button class="multi-btn plus" @click="handlePlus"><text>+</text></button> 
            
            <!--  -->
          </view>
        </view>
      </view>
      <view class="bet-bar-bottom">
        <view class="bottom-middle">
          <text class="select-tip">共{{ betNotes }}注 {{ betCount }}倍 {{ totalBetAmount }}</text>
          <text class="bonus-tip">
            {{ calculateHalfFullBonus() }}
            </text>
        </view>
      </view>
    </view>
    <UniNumberKeyboard :show.sync="showNumberKeyboard" :value="betCount + ''" :allowDot="false" confirm-text="确认" :min="1" :max="50" @input="handleKeyboardInput" @confirm="handleKeyboardConfirm" />
  </view>
</template>

<script>
import CustomHeader from "@/components/CustomHeader.vue";
import { purchasingLotteryApply } from "@/api/demo";

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
      safeAreaBottom: 0,
      headerTotalHeight: 0,
      betBarFixedPx: 0,
      betBarTotalHeight: 0,
      isApp: false,
      isMp: false,
      selectedCombo: "",
      showNumberKeyboard: false,
      // 映射表保持不变
      spfTextMap: {
        home_0: "主胜",
        draw_0: "平",
        away_0: "主负",
        3: "主胜",
        1: "平",
        0: "主负",
      },
      rspfTextMap: {
        "home_-1": "主胜",
        "draw_-1": "平",
        "away_-1": "主负",
        3: "主胜",
        1: "平",
        0: "主负",
      },
      zjqTextMap: {
        0: "0",
        1: "1",
        2: "2",
        3: "3",
        4: "4",
        5: "5",
        6: "6",
        "4+": "7+",
        "5+": "7+",
        "6+": "7+",
        "7+": "7+",
        总进球_0: "0",
        总进球_1: "1",
        总进球_2: "2",
        总进球_3: "3",
        总进球_4: "4",
        总进球_5: "5",
        总进球_6: "6",
        "总进球_7+": "7+",
      },
      bqcTextMap: {
        33: "胜胜",
        31: "胜平",
        30: "胜负",
        13: "平胜",
        11: "平平",
        10: "平负",
        "03": "负胜",
        "01": "负平",
        "00": "负负",
        半全场_胜胜: "胜胜",
        半全场_胜平: "胜平",
        半全场_胜负: "胜负",
        半全场_平胜: "平胜",
        半全场_平平: "平平",
        半全场_平负: "平负",
        半全场_负胜: "负胜",
        半全场_负平: "负平",
        半全场_负负: "负负",

      },
      urlValue: false,
    };
  },
  computed: {
    selectedMatchCount() {
      return this.selectedMatchList.filter((item) => this.hasAnyBetItem(item)).length;
    },
    betNotes() {
      if (this.selectedMatchCount === 0) return 0;
      const validMatches = this.selectedMatchList.filter((item) => this.hasAnyBetItem(item));
      if (validMatches.length === 0) return 0;

      return validMatches.reduce((total, item) => {
        let itemCount = 0;
        if (item.spfList && Array.isArray(item.spfList)) itemCount += item.spfList.length;
        if (item.rspfList && Array.isArray(item.rspfList)) itemCount += item.rspfList.length;
        if (item.zjqList && Array.isArray(item.zjqList)) itemCount += item.zjqList.length;
        if (item.bqcList && Array.isArray(item.bqcList)) itemCount += item.bqcList.length;
        if (item.bfList && Array.isArray(item.bfList)) itemCount += item.bfList.length;
        return total * (itemCount > 0 ? itemCount : 1);
      }, 1);
    },
    totalBetAmount() {
      return (this.betNotes * this.betCount * 2).toFixed(2);
    },
  },
  onShow() {
    uni.setTabBarStyle({ height: "0px" });
    this.calcAllHeights();
  },
  created() {
        this.$nextTick(()=>{
    this.urlValue = uni.getStorageSync('urlValue');
    
    })
    this.calcAllHeights();
  },
  onLoad() {
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.on("selectedData", (data) => {
        try {
          const rawMatches = JSON.parse(JSON.stringify(data.matches || []));
          this.selectedMatchList = rawMatches.map((item) => {
            const newItem = { ...item };
            // 1. 拆分胜平负/让球胜平负（保持不变）
            newItem.spfList = [];
            newItem.rspfList = [];
            const allSpfValues = item.selectedSpf || item.selectedAll || [];
            allSpfValues.forEach((val) => {
              if (val.includes("_0")) {
                newItem.spfList.push(val);
              } else if (val.includes("_")) {
                newItem.rspfList.push(val);
              }
            });

            // 2. 修复：拆分比分（核心修改部分）
            newItem.bfList = [];
            // 优先从selectedAll获取，再补充selectedBf（反转优先级）
            const allPossibleBf = [...(item.selectedAll || []), ...(item.selectedBf || [])];
            // 增加类型校验+去空格，避免startsWith报错
            const bfValues = allPossibleBf
              .filter((val) => {
                const valStr = String(val).trim(); // 转字符串+去空格
                return valStr.startsWith("比分_");
              })
              .map((val) => {
                const valStr = String(val).trim();
                const pureBf = valStr.replace("比分_", ""); // 去掉前缀
                return pureBf;
              });

            newItem.bfList = bfValues;
            // 3. 拆分总进球（保持不变）
            newItem.zjqList = (item.selectedZjq || item.selectedAll || []).filter((val) => {
              return String(val).trim().startsWith("总进球_");
            });

            // 4. 拆分半全场（保持不变）
            newItem.bqcList = (item.selectedBqc || item.selectedAll || []).filter((val) => {
              return String(val).trim().startsWith("半全场_");
            });

            return newItem;
          });
        } catch (e) {
          this.selectedMatchList = [];
        }
        this.betCount = Math.max(1, parseInt(data.betCount || 1));
        this.isNeedUserPhone = data.isNeedUserPhone || 1;
        this.selectedCombo = data.combo || "";
      });
    }
  },
  onUnload() {
    if (!this.isSubmitSuccess) this.saveEditedData();
    uni.setTabBarStyle({ height: "auto" });
  },
  methods: {
    hasAnyBetItem(item) {
      if (!item) return false;
      const hasSpf = item.spfList && Array.isArray(item.spfList) && item.spfList.length > 0;
      const hasRspf = item.rspfList && Array.isArray(item.rspfList) && item.rspfList.length > 0;
      const hasZjq = item.zjqList && Array.isArray(item.zjqList) && item.zjqList.length > 0;
      const hasBqc = item.bqcList && Array.isArray(item.bqcList) && item.bqcList.length > 0;
      const hasBf = item.bfList && Array.isArray(item.bfList) && item.bfList.length > 0;
      return hasSpf || hasRspf || hasZjq || hasBqc || hasBf;
    },
    getBetItem(type, item) {
      if (!item) return "";
      switch (type) {
        case "spf": {
          const list = item.spfList || [];
          return list
            .map((t) => this.spfTextMap[t] || t)
            .filter(Boolean)
            .join(",");
        }
        case "rspf": {
          const list = item.rspfList || [];
          return list
            .map((t) => this.rspfTextMap[t] || t)
            .filter(Boolean)
            .join(",");
        }
        case "zjq": {
          const list = item.zjqList || [];
          return list
            .map((t) => this.zjqTextMap[t] || t.replace("总进球_", ""))
            .filter(Boolean)
            .join(",");
        }
        case "bqc": {
          const list = item.bqcList || [];
          return list
            .map((t) => this.bqcTextMap[t] || t.replace("半全场_", ""))
            .filter(Boolean)
            .join(",");
        }
        case "bf": {
          const list = item.bfList || [];
          return list.filter(Boolean).join(",");
        }
        default:
          return "";
      }
    },
    handleKeyboardInput(val) {
      const num = parseInt(val) || 1;
      this.betCount = Math.min(Math.max(num, 1), 50);
    },
    handleKeyboardConfirm(val) {
      const num = parseInt(val) || 1;
      this.betCount = Math.min(Math.max(num, 1), 50);
      this.showNumberKeyboard = false;
    },
    calcAllHeights() {
      const sys = wx.getWindowInfo();
      this.statusBarHeight = sys.statusBarHeight || 20;
      this.safeAreaBottom = (sys.safeAreaInsets && sys.safeAreaInsets.bottom) || 0;
      const navBarFixedRpx = 80;
      const betBarFixedRpx = 200;
      const pxPerRpx = sys.screenWidth / 750;
      this.headerTotalHeight = this.statusBarHeight + navBarFixedRpx * pxPerRpx;
      this.betBarFixedPx = betBarFixedRpx * pxPerRpx;
      this.betBarTotalHeight = this.betBarFixedPx + this.safeAreaBottom;
    },
    calculateHalfFullBonus() {
      if (this.selectedMatchCount === 0) return "预计奖金：0.00 元";
      return "预计奖金：以实际出票为准";
    },
    confirmPhone() {
      const reg = /^1[3-9]\d{9}$/;
      if (!this.userPhone) {
        uni.showToast({ title: "手机号不能为空！", icon: "none" });
        return;
      }
      if (!reg.test(this.userPhone)) {
        uni.showToast({ title: "请输入正确的手机号", icon: "none" });
        return;
      }
      this.showPhoneModal = false;
      this.handleConfirmBet(true);
    },
    handleBack() {
      this.saveEditedData();
      uni.navigateBack({ delta: 1 });
    },
    handleMinus() {
      if (this.betCount > 1) this.betCount--;
    },
    handlePlus() {
      if (this.selectedMatchCount < 1) return;
      if (this.betCount < 50) {
        this.betCount++;
      } else {
        uni.showToast({ title: "最多50倍", icon: "none" });
      }
    },
    async handleConfirmBet(fromPhoneModal) {
      if (this.selectedMatchCount === 0) {
        uni.showToast({ title: "请先选择至少一场", icon: "none" });
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
        leagueName: item.league_name || "",
        homeName: item.home_name || "",
        visitingName: item.visiting_name || "",
        raceDate: item.race_date || "",
        selectedSpf: item.spfList || [],
        selectedRspf: item.rspfList || [],
        selectedZjq: item.zjqList || [],
        selectedBqc: item.bqcList || [],
        selectedBf: item.bfList || [],
        playType: "足球混合过关",
        entityType: "足球混合过关",
      }));
      const payRequestData = {
        contentJson: JSON.stringify(list),
        entityType: "足球混合过关",
        multiple: this.betNotes,
        bet: this.betCount,
        payment: this.totalBetAmount,
        payType: "wechat",
        userPhone: this.userPhone,
      };
      try {
        const res = await purchasingLotteryApply(payRequestData);
        if (res.code == 200) {
          this.isPayLoading = false;
          this.isSubmitSuccess = true;
          uni.showToast({ title: "操作成功！", icon: "success", duration: 2000, mask: true });
          uni.removeStorageSync("editedMatchData");
          this.selectedMatchList = [];
          setTimeout(() => uni.navigateBack({ delta: 1 }), 2000);
        } else {
          this.isPayLoading = false;
          uni.showToast({ title: res.message || "获取支付信息失败", icon: "none" });
        }
      } catch (error) {
        this.isPayLoading = false;
        uni.showToast({ title: "网络异常，请稍后重试", icon: "none" });
        console.error("足球混合过关报错：", error);
      }
    },
    saveEditedData() {
      const editedData = JSON.parse(
        JSON.stringify({
          matches: this.selectedMatchList,
          betCount: this.betCount,
        })
      );
      uni.setStorageSync("editedMatchData", JSON.stringify(editedData));
    },
  },
};
</script>

<style scoped lang="scss">
/* 样式部分保持不变 */
.scheme-edit-page {
  background-color: #f5f5f5;
  box-sizing: border-box;
  height: 100vh;
  margin: 0;
  padding: 0;
  /* #ifdef H5 */
  overflow: hidden;
  /* #endif */
}

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

  .match-row {
    background-color: #fff;
    margin-bottom: 15rpx;
    padding: 26rpx 20rpx;
    box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.05);
    border-radius: 8rpx;

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

      // 胜/平字体样式
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

    .selected-content {
      background: #f9f9f9;
      border-radius: 4rpx;
      padding: 12rpx;

      .bet-item {
        display: flex;
        align-items: center;
        margin-bottom: 8rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .bet-label {
          font-size: 24rpx;
          color: #666;
          width: 180rpx;
        }

        .bet-value {
          font-size: 24rpx;
          color: #333;
          flex: 1;
        }

        .highlight {
          color: #d92929;
          font-weight: 500;
        }
      }

      .empty-bet {
        text-align: center;
        padding: 10rpx 0;
        .trigger-tip {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }

  .empty-tip {
    text-align: center;
    padding: 50rpx 0;
    font-size: 26rpx;
    color: #999;
    background-color: #fff;
    border-radius: 8rpx;
    margin-top: 20rpx;
  }
}

.bet-bar {
  position: fixed !important;
  width: 100% !important;
  left: 0 !important;
  z-index: 10 !important;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
  padding-bottom: 0 !important;
  box-sizing: border-box !important;
  height: auto !important;
  bottom: 0 !important;

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
    height: 100rpx;
    background: #232323;
    color: #fff;
    padding: 0 40rpx;

    .bottom-middle {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin: 0 20rpx;

      .select-tip {
        font-size: 28rpx;
        color: #fff;
        text-align: center;
      }

      .bonus-tip {
        font-size: 18rpx;
        color: #999;
        text-align: center;
        line-height: 1.2;
      }
    }
  }
}

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

::-webkit-scrollbar {
  display: none;
}

button::after {
  border: none;
}

.disabled {
  color: #999 !important;
  border-color: #eee !important;
}
</style>
