<template>
  <view class="scheme-edit-page">
    <!-- 顶部导航 -->
    <CustomHeader :ballTitle="'足球'" title="胜负" :showBack="true" :showIcon="false" @back-click="handleBack" />

    <!-- 滚动展示区域 -->
    <scroll-view class="match-scroll" scroll-y id="poster-content">
      <view class="match-list">
        <view v-for="(item, index) in selectedMatchList" :key="index" class="match-row">
          <view class="main-right">
            <view class="top-right">
              <view class="team-vs">
                <text class="team-name home">{{ item.home_name }}</text>
                <text class="vs-text">VS</text>
                <text class="team-name away">{{ item.visiting_name }}</text>
              </view>
              <view class="team-vs" style="color: #888; padding: 0" v-if="urlValue">
                <text class="team-name home" v-if="item.home_win_rate">胜{{ item.home_win_rate }}</text>
                <text class="vs-text" v-if="item.draw_rate">平{{ item.draw_rate }}</text>
                <text class="team-name away" v-if="item.visiting_win_rate">胜{{ item.visiting_win_rate }}</text>
              </view>
            </view>
            <view class="bottom-right">
              <view class="score-btn-group">
                <view class="score-btn" :class="{ selected: item.homeSelected }">3</view>
                <view class="score-btn" :class="{ selected: item.vsSelected }">1</view>
                <view class="score-btn" :class="{ selected: item.awaySelected }">0</view>
              </view>
            </view>
          </view>
        </view>
        <view class="empty-tip" v-if="selectedMatchList.length === 0"> 暂无 </view>
      </view>
    </scroll-view>

    <view class="bet-bar" v-if="urlValue">
      <view class="bet-bar-top">
        <view class="collapse-area" style="text-align:center; color: #d92929;">
          请截屏
          <!-- <view class="left-tip">请截屏</view>

          <view class="multi-group">
            <button class="multi-btn minus" @click="handleMinus">-</button>
            <view class="multi-input" @tap="showNumberKeyboard = true">
              {{ betCount }}
            </view>
            <button class="multi-btn plus" @click="handlePlus">+</button>
            
          </view> -->
        </view>
      </view>
      <view class="bet-bar-bottom">
        <view class="bottom-middle">
          
        </view>
      </view>
    </view>

    <UniNumberKeyboard :show.sync="showNumberKeyboard" :value="betCount + ''" :allowDot="false" confirm-text="确认" :min="1" :max="50" @input="handleKeyboardInput" @confirm="handleKeyboardConfirm" />

    <!-- 海报预览弹窗 -->
    <view class="poster-preview" v-if="showPosterPreview">
      <view class="preview-content">
        <image :src="posterImageUrl" mode="widthFix" class="poster-image"></image>
        <view class="preview-tip">长按图片保存到手机，手动分享到微信</view>
        <button class="close-btn" @click="showPosterPreview = false">关闭</button>
      </view>
    </view>
  </view>
</template>

<script>
import CustomHeader from "@/components/CustomHeader.vue";
import { formatTimeToMDWeekHM } from "@/utils/data";

export default {
  components: { CustomHeader },
  data() {
    return {
      selectedMatchList: [],
      betCount: 50,
      statusBarHeight: 0,
      safeAreaBottom: 0,
      headerTotalHeight: 0,
      betBarFixedPx: 0,
      betBarTotalHeight: 0,
      isApp: false,
      selectedCombo: "",
      showNumberKeyboard: false,
      showPosterPreview: false,
      posterImageUrl: "",
      urlValue: false,
    };
  },
  computed: {
    selectedMatchCount() {
      return this.selectedMatchList.filter((item) => {
        return item.homeSelected || item.vsSelected || item.awaySelected;
      }).length;
    },
    betNotes() {
      if (this.selectedMatchList.length === 0) return 0;
      let notes = 1;
      this.selectedMatchList.forEach((item) => {
        let selectedCount = 0;
        if (item.homeSelected) selectedCount++;
        if (item.vsSelected) selectedCount++;
        if (item.awaySelected) selectedCount++;
        if (selectedCount > 0) {
          notes *= selectedCount;
        }
      });
      return notes;
    },
    totalBetAmount() {
      return this.betNotes * this.betCount * 2;
    },
  },
  created() {
        this.$nextTick(()=>{
    this.urlValue = uni.getStorageSync('urlValue');
    
    })
    // H5端适配：统一获取系统信息
    const sys = uni.getSystemInfoSync();
    this.isApp = sys.platform === "android" || sys.platform === "ios";
    this.calcAllHeights();
  },
  onLoad() {
    const eventChannel = this.getOpenerEventChannel ? this.getOpenerEventChannel() : null;
    if (eventChannel) {
      eventChannel.on("selectedData", (data) => {
        this.selectedMatchList = data.matches || [];
        this.betCount = data.betCount || 50;
        this.selectedCombo = data.combo || "";
      });
    }
  },
  methods: {
    handleKeyboardConfirm(val) {
      const num = parseInt(val) || 1;
      this.betCount = Math.min(Math.max(num, 1), 50);
      this.showNumberKeyboard = false;
    },
    handleKeyboardInput(val) {
      const num = parseInt(val) || 1;
      if (num < 1) {
        this.betCount = 1;
      } else if (num > 50) {
        this.betCount = 50;
      } else {
        this.betCount = num;
      }
    },
    calcAllHeights() {
      const sys = uni.getSystemInfoSync();
      this.statusBarHeight = sys.statusBarHeight || 20;
      this.safeAreaBottom = (sys.safeAreaInsets && sys.safeAreaInsets.bottom) || 0;
      const navBarFixedRpx = 80;
      const navBarFixedPx = (sys.screenWidth / 750) * navBarFixedRpx;
      this.headerTotalHeight = this.statusBarHeight + navBarFixedPx;

      // H5端适配：动态计算bet-bar高度
      const betBarFixedRpx = this.isApp ? 200 : 180;
      this.betBarFixedPx = (sys.screenWidth / 750) * betBarFixedRpx;
      this.betBarTotalHeight = this.betBarFixedPx + (this.isApp ? this.safeAreaBottom : 0);
    },
    handleBack() {
      uni.navigateBack({ delta: 1 });
    },
    handleMinus() {
      const num = this.betCount - 1;
      this.betCount = num < 1 ? 1 : num;
    },
    handlePlus() {
      const num = this.betCount + 1;
      this.betCount = num > 50 ? 50 : num;
    },
    async generatePoster() {
      // #ifdef H5
      try {
        uni.showLoading({ title: "生成海报中...", mask: true });
        const posterContent = document.getElementById("poster-content");
        if (!posterContent) {
          uni.hideLoading();
          uni.showToast({ title: "未找到海报内容", icon: "none" });
          return;
        }

        const tempContainer = document.createElement("div");
        tempContainer.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          z-index: -9999;
          width: ${posterContent.offsetWidth}px;
          background: #fff;
          padding: 20px;
          box-sizing: border-box;
        `;
        tempContainer.innerHTML = posterContent.innerHTML;
        document.body.appendChild(tempContainer);

        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(tempContainer, {
          width: tempContainer.offsetWidth,
          height: tempContainer.scrollHeight,
          useCORS: true,
          allowTaint: true,
          scale: 2,
          logging: false,
          backgroundColor: "#ffffff",
          scrollX: 0,
          scrollY: 0,
          windowWidth: tempContainer.offsetWidth,
          windowHeight: tempContainer.scrollHeight,
        });

        this.posterImageUrl = canvas.toDataURL("image/jpeg", 0.8);
        document.body.removeChild(tempContainer);
        uni.hideLoading();
        this.showPosterPreview = true;
      } catch (err) {
        console.error("生成海报失败：", err);
        uni.hideLoading();
        uni.showToast({ title: "生成失败，请重试", icon: "none" });
      }
      // #endif

      // #ifndef H5
      uni.showToast({ title: "仅H5端支持生成海报", icon: "none" });
      // #endif
    },
  },
};
</script>

<style scoped lang="scss">
.scheme-edit-page {
  background-color: #f5f5f5;
  box-sizing: border-box;
  height: 100vh;
  margin: 0;
  padding: 0;
  position: relative;
  // 全局禁止滚动穿透
  overflow: hidden;
}

// 替换 .match-scroll 样式
.match-scroll {
  box-sizing: border-box;
  padding-top: v-bind(headerTotalHeight + "px");
  padding-bottom: 120rpx;
  // 就按你说的写！
  height: calc(100vh - 120rpx);
  background-color: #f5f5f5;
  padding-left: 20rpx;
  padding-right: 20rpx;

  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.match-list {
  width: 100%;
  box-sizing: border-box;
  padding-bottom: 50rpx;
  .match-row {
    display: flex;
    background-color: #fff;
    border-bottom: 1rpx solid #dedede;
    box-sizing: border-box;
    padding: 8rpx 20rpx;
    margin-bottom: 10rpx;
    border-radius: 8rpx;
    width: 100%;
  }

  .main-right {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    background: #fff;
    box-sizing: border-box;
    overflow: hidden;
  }

  .top-right {
    flex: 1;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

  .team-vs {
    font-size: 24rpx;
    color: #333;
    text-align: center;
    padding: 4rpx 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;

    .team-name {
      flex: 1;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .team-name.home {
      text-align: right;
      padding-right: 10rpx;
    }
    .team-name.away {
      text-align: left;
      padding-left: 10rpx;
    }
    .vs-text {
      width: 120rpx;
      text-align: center;
      flex-shrink: 0;
      font-weight: 500;
    }
  }

  .bottom-right {
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10rpx 0;
  }

  .score-btn-group {
    display: flex;
    width: 100%;
    justify-content: space-around;
    gap: 0;
  }

  .score-btn {
    width: 33.33%;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: #333;
    border: 1rpx solid #ddd;
    background-color: #fff;
    pointer-events: none;
    &.selected {
      background-color: #d92929;
      color: #fff;
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

// ========== H5端重点适配：bet-bar样式 ==========
.bet-bar {
  position: fixed !important;
  width: 100% !important;
  left: 0 !important;
  bottom: 0 !important;
  z-index: 10 !important;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
  box-sizing: border-box !important;

  // 安全区适配（仅APP/小程序）
  // #ifdef MP-WEIXIN || APP-PLUS
  padding-bottom: env(safe-area-inset-bottom) !important;
  // #endif

  // H5端适配
  // #ifdef H5
  height: auto !important;
  // #endif

  .bet-bar-top {
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10rpx 30rpx;
    box-sizing: border-box;

    .collapse-area {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: auto;
      box-sizing: border-box;
      border-bottom: 2rpx solid #eee;
      padding: 10rpx 0;

      // 左边提示文字
      .left-tip {
        font-size: 24rpx;
        color: #d92929;
        flex: 1;
        margin-right: 20rpx;
        line-height: 1.4;
      }

      // 选择组（缩小宽度）
      .multi-group {
        display: flex;
        align-items: center;
        gap: 6rpx;
        flex-shrink: 0;

        .multi-label {
          font-size: 26rpx;
          color: #333;
        }

        .multi-btn {
          width: 44rpx;
          height: 44rpx;
          background-color: #ddd;
          color: #333;
          font-size: 28rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1rpx solid #ccc;

          // #ifdef H5
          line-height: 1;
          outline: none;
          -webkit-appearance: none;
          // #endif
        }

        // 输入框缩小
        .multi-input {
          width: 100rpx;
          height: 44rpx;
          background-color: #fff;
          color: #333;
          text-align: center;
          font-size: 26rpx;
          border: 1rpx solid #ccc;
          display: flex;
          align-items: center;
          justify-content: center;

          // #ifdef H5
          outline: none;
          -webkit-appearance: none;
          // #endif

          &.disabled {
            color: #999;
            background-color: #f5f5f5;
          }
        }

        .multi-unit {
          font-size: 26rpx;
          color: #333;
        }
      }
    }
  }

  .bet-bar-bottom {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 80rpx; // H5端降低高度
    background-color: #232323;
    color: #fff;
    box-sizing: border-box;
    padding: 0 20rpx;
    // H5端适配：调整高度和内边距
    // #ifdef H5
    height: 70rpx;
    // #endif

    .bottom-middle {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin: 0;
      height: 100%;

      .select-tip {
        height: 100%;
        font-size: 28rpx;
        color: #fff;
        text-align: center;
        display: flex;
        align-items: center;
        // H5端适配：调整字体大小
        // #ifdef H5
        font-size: 26rpx;
        // #endif
      }
    }
  }
}

.poster-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  box-sizing: border-box;

  .preview-content {
    width: 90%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20rpx;
  }

  .poster-image {
    width: 100%;
    border-radius: 8rpx;
  }

  .preview-tip {
    font-size: 24rpx;
    color: #fff;
    text-align: center;
    line-height: 1.5;
  }

  .close-btn {
    padding: 12rpx 40rpx;
    background-color: #fff;
    color: #333;
    border: none;
    border-radius: 8rpx;
    font-size: 28rpx;
    margin-top: 10rpx;
    // H5端适配：移除默认按钮样式
    // #ifdef H5
    -webkit-appearance: none;
    outline: none;
    // #endif
  }
}

// 隐藏滚动条
::-webkit-scrollbar {
  display: none;
}

// H5端全局样式重置（解决按钮/输入框默认样式问题）
// #ifdef H5
::v-deep button {
  -webkit-appearance: none;
  appearance: none;
  outline: none;
  border: none;
}
::v-deep input {
  -webkit-appearance: none;
  appearance: none;
  outline: none;
}
// #endif
</style>
