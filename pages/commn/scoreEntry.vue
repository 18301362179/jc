<template>
  <!-- Score Input Dialog Component -->
  <view class="score-input-dialog">
    <!-- Mask Layer -->
    <view class="dialog-mask" v-if="isVisible" @tap="handleMaskClick" :class="{ 'mask-visible': isVisible }"></view>

    <!-- Dialog Box -->
    <view class="dialog-box" v-if="isVisible" :class="{ 'box-visible': isVisible }">
      <!-- Title Area: Time -->
      <view class="dialog-title-area">
        <text class="dialog-title-text">{{ formattedTime }}</text>
      </view>

      <view class="dialog-content">
        <!-- Home Team Input -->
        <view class="input-row">
          <text class="team-name">{{ currentMatch.home_name }}</text>
          <input 
            type="number" 
            class="score-input" 
            v-model="homeScore" 
            placeholder="0" 
            maxlength="2" 
            @input="handleHomeScoreInput" 
          />
        </view>

        <!-- VS Separator (与队名左对齐) -->
        <view class="vs-separator">VS</view>

        <!-- Away Team Input -->
        <view class="input-row">
          <text class="team-name">{{ currentMatch.visiting_name }}</text>
          <input 
            type="number" 
            class="score-input" 
            v-model="awayScore" 
            placeholder="0" 
            maxlength="2" 
            @input="handleAwayScoreInput" 
          />
        </view>
      </view>

      <view class="dialog-footer">
        <button class="dialog-btn cancel-btn" @tap="handleCancel">取消</button>
        <button class="dialog-btn confirm-btn" @tap="handleConfirm">确定</button>
      </view>
    </view>
  </view>
</template>

<script>
// 脚本部分保持不变
import { formatDateWithWeekday } from "@/utils/data";
export default {
  name: "ScoreInputDialog",
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    currentMatch: {
      type: Object,
      default: () => ({
        home_name: "",
        visiting_name: "",
        home_goal: "",
        visiting_goal: "",
        race_date: ""
      }),
      required: true,
    },
    dialogTitle: {
      type: String,
      default: "比分录入",
    },
  },
  computed: {
    formattedTime() {
      if (this.currentMatch.race_date) {
        return formatDateWithWeekday(this.currentMatch.race_date);
      }
      return "2025-11-26 周三 01:45";
    }
  },
  data() {
    return {
      homeScore: "",
      awayScore: "",
    };
  },
  watch: {
    isVisible(newVal) {
      if (!newVal) {
        this.homeScore = "";
        this.awayScore = "";
      }
    },
  },
  methods: {
    handleHomeScoreInput(e) {
      const value = e.detail.value;
      if (value && value < 0) this.homeScore = "";
    },
    handleAwayScoreInput(e) {
      const value = e.detail.value;
      if (value && value < 0) this.awayScore = "";
    },
    handleCancel() {
      this.$emit("score-input-cancel");
    },
    handleConfirm() {
      if (!this.homeScore || !this.awayScore) {
        uni.showToast({
          title: "请输入完整比分",
          icon: "none",
          duration: 1500,
        });
        return;
      }
      this.$emit("score-input-confirm", {
        matchId: this.currentMatch.id,
        homeScore: parseInt(this.homeScore),
        awayScore: parseInt(this.awayScore),
      });
    },
    handleMaskClick() {
      this.$emit("score-input-cancel");
    },
  },
};
</script>

<style scoped lang="scss">
/* 核心调整：VS与队名右对齐 */
.dialog-content {
  padding: 40rpx 30rpx 50rpx;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.input-row {
  width: 100%;
  display: flex;
  justify-content: space-between; /* 队名左、输入框右，形成队名右对齐视觉效果 */
  align-items: center;
}

.team-name {
  font-size: 26rpx;
  color: #666;
  white-space: nowrap;
  text-align: right; /* 队名右对齐 */
  flex: 1; /* 占据输入框左侧所有空间，实现右对齐 */
  margin-right: 10rpx;
}

/* VS强制与队名右对齐 */
.vs-separator {
  font-size: 28rpx;
  color: #d92929;
  font-weight: 600;
  line-height: 1;
  /* 关键：与队名保持相同的右侧对齐位置 */
  margin-left: auto; /* 推到右侧 */
  margin-right: calc(180rpx + 10rpx); /* 与输入框左侧对齐（输入框宽度+间距） */
}

/* 其他样式保持不变 */
.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999999;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.mask-visible { opacity: 1; }

.dialog-box {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 600rpx;
  max-height: 80vh; /* 限制最大高度 */
  height: auto; /* 自动高度，也可以设置固定高度如450rpx */
  background: #fff;
  border-radius: 8rpx;
  box-shadow: 0 6rpx 20rpx rgba(0,0,0,0.1);
  z-index: 99999999;
  transform: translate(-50%, -50%) scale(0.8);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  border-radius: 20rpx;
  /* 如果需要固定高度，可以使用： */
  /* height: 450rpx; */
}
.box-visible { transform: translate(-50%, -50%) scale(1); opacity: 1; }

.dialog-title-area {
  padding: 30rpx;
  background: #f5f5f5;
  border-bottom: 1rpx solid #eee;
  text-align: center;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
}
.dialog-title-text {
  display: block;
  font-size: 24rpx;
  font-weight: 400;
  color: #666;
}

.score-input {
  width: 150rpx;
  height: 70rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 6rpx;
  font-size: 28rpx;
  text-align: center;
  color: #333;
  box-sizing: border-box;
  margin-right: 50rpx;
  &:focus { border-color: #d92929; outline: none; }
}

.dialog-footer {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20rpx;
}
.dialog-btn {
  width:40%;
  height: 90rpx;
  line-height: 90rpx;
  font-size: 28rpx;
  border: none;
  margin: 0;
  padding: 0;
  &:focus { outline: none; }
}
.cancel-btn {
  background: #f5f5f5;
  color: #666;
  border-right: 1rpx solid #eee;
}
.confirm-btn {
  background: #d92929;
  color: #fff;
}
</style>