<template>
  <view class="container" style="width: 100%; box-sizing: border-box;">
      <CustomHeader
      :showBack="false"
      :ballTitle="''"
      :title="'我的'"
      :isIndex="false"
      :showIcon="false"
      :isSelected="false"
    />
    <view class="header">
      <image class="avatar" v-if="userInfo.headImgUrl" :src="userInfo.headImgUrl" mode="aspectFill"></image>
      <image class="avatar" v-else src="https://www.tianjifu.com/static/mine1.png" mode="aspectFill"></image>
      <view class="user-info">
        <text class="username">{{ userInfo.remarkName || '' }}</text>
        <text class="value stone-count" v-if="urlValue" @click="getList">{{ userInfo.coinAmount || 0 }} 币</text>
      </view>
      <button class="recharge-btn" v-if="urlValue" @click="getUrl">获取</button>
    </view>

    <view class="tab-bar">
      <view class="tab-item" :class="{ active: currentTab === 1 }" v-if="urlValue" @click="switchTab(1)">分析</view>
    </view>

    <scroll-view class="content-scroll" scroll-y>
      <view v-if="currentTab === 1&&urlValue" class="record-section">
        <no-data v-if="tradeRecord.length === 0" />
        <view class="trade-header" v-if="tradeRecord.length > 0">
          <view class="trade-header-col type-col">类型</view>
          <view class="trade-header-col match-col">比赛</view>
          <view class="trade-header-col time-col">时间</view>
        </view>
        <view class="record-card" v-for="(item, index) in tradeRecord" :key="index">
          <view class="record-row">
            <view class="normal-col type-col">
              <text class="value">{{ item.goods_type || '' }}</text>
            </view>
            <view class="normal-col match-col">
              <text class="value accent">{{ item.show_str || '' }}</text>
            </view>
            <view class="time-col">
              <text class="value">{{ item.update_time }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    <NativeTabbar ref="nativeTabbar" />
  </view>
</template>

<script>
import NativeTabbar from "@/components/tabbar.vue";
import NoData from "@/pages/commn/noData";
import { getUser, purchasingLotteryConfirm } from "@/api/demo";
import CustomHeader from "@/components/CustomHeader.vue";
export default {
  components: { NoData, NativeTabbar,CustomHeader },
  data() {
    return {
      currentTab: 1,
      userInfo: {},
      lotteryPurchasing: [],
      isImagePreviewVisible: false,
      previewImageUrl: '',
      defaultLotteryImageUrl: 'http://www.tianjifu.com/qwxt/outside/common/fileDownload?fileFullPathName=',
      tradeRecord: [],
      touchStartX: 0,
      swipeThreshold: 50,
      betForm: '',
      urlValue: false,
    };
  },
  created() {
    this.initBetForm();
    this.getData();
            this.$nextTick(()=>{
    this.urlValue = uni.getStorageSync('urlValue');
    
    })
  },
  onShow() {
    this.getData();
  },
  methods: {
    getList() {
      if (this.urlValue) {
        uni.navigateTo({
          url: '/pages/getList/getList'
        });
      };
    },
    initBetForm() {
      // #ifdef APP-PLUS
      this.betForm = 'app';
      // #endif
      // #ifdef MP-WEIXIN
      this.betForm = 'weChatMiniProgram';
      // #endif
      // #ifdef H5
      this.betForm = 'weChatMiniProgram';
      // #endif
    },
    getUrl() {
      if(this.urlValue) {
        uni.navigateTo({
          url: '/pages/recharge/recharge'
        });
      };

    },
    switchTab(tabIndex) {
      this.currentTab = tabIndex;
    },
    async getData() {
      uni.showLoading({ title: "加载中..." });
      try {
        const res = await getUser({ betForm: this.betForm });
        this.userInfo = res.data.user || res.data.userInfo || {};
        this.lotteryPurchasing = res.data.lotteryPurchasing || [];
        this.tradeRecord = res.data.tradeRecord || [];
      } catch (e) {
        uni.showToast({ title: "加载失败", icon: "none" });
      } finally {
        uni.hideLoading();
      }
    },
  }
};
</script>

<style scoped lang="scss">
// 核心样式 - 极简
.container {
  width: 100%;
  height: calc(100vh - (100rpx + env(safe-area-inset-bottom)));
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  .header {
    background: #fff;
    box-sizing: border-box;
    padding: 60rpx;
    display: flex;
    align-items: center;
    border-bottom: 1rpx solid #eaecef;
    position: relative;
    .avatar {
      width: 110rpx;
      height: 110rpx;
      border-radius: 50%;
      margin-right: 24rpx;
    }
    .user-info {
      .username { font-size: 26rpx; color: #333; display: block; margin-bottom: 6rpx; }
      .stone-count { font-size: 24rpx; color: #31926e; }
    }
    .recharge-btn {
      background: #31926e;
      color: #fff;
      border: none;
      border-radius: 8rpx;
      padding: 12rpx 24rpx;
      font-size: 26rpx;
      height: auto;
      line-height: 1;
      position: absolute;
      right: 40rpx;
      bottom:60rpx;
      margin:atuo;
    }
  }

  // Tab栏
  .tab-bar {
    background: #fff;
    display: flex;
    height: 120rpx;
    align-items: center;
    padding-left: 20rpx;
    border-bottom: 1rpx solid #eaecef;

    .tab-item {
      font-size: 34rpx;
      color: #666;
      padding: 0 40rpx;
      position: relative;
      &.active {
        color: #31926e;
        font-weight: 600;
        &::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 25%;
          width: 50%;
          height: 6rpx;
          background: #31926e;
          border-radius: 3rpx;
        }
      }
    }
  }

  // 内容区
  .content-scroll {
    touch-action: pan-y;
    flex: 1;
    overflow-y: auto;
    padding: 20rpx;
    // #ifdef APP-PLUS
    padding-bottom: calc(100rpx + env(safe-area-inset-bottom) + 20rpx) !important;
    // #endif
    // #ifdef MP-WEIXIN
    padding-bottom: calc(100rpx + env(safe-area-inset-bottom) + 20rpx) !important;
    // #endif
    box-sizing: border-box !important;

    .record-section {
      display: flex;
      flex-direction: column;
      
      // 交易记录专属表头：窄高度、列宽和列表严格对齐
      .trade-header {
        display: flex;
        width: 100%;
        height: 60rpx; // 小高度（比列表行矮）
        background: #f8f9fa;
        border-radius: 12rpx 12rpx 0 0;
        margin-bottom: 2rpx;
        align-items: center;
        
        .trade-header-col {
          font-size: 24rpx;
          color: #333;
          font-weight: 600;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }
        
        // 表头列宽和列表列1:1对齐
        .from-col { width: 100rpx; flex: none; }
        .type-col { width: 100rpx; flex: none; }
        .time-col { width: 240rpx; flex: none; }
        .match-col { flex: 1; }
      }

      .record-card {
        width: 100%;
        background: #fff;
        border-radius: 12rpx;
        margin-bottom: 16rpx;
        box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
      }
      .record-row {
        display: flex;
        width: 100%;
        align-items: center;
      }
      .time-col {
        width: 240rpx;
        text-align: center;
        flex: none;
      }
      .normal-col {
        flex: 1;
        text-align: center;
      }
      .label {
        font-size: 24rpx;
        color: #999;
        display: block;
        margin-bottom: 8rpx;
      }
      .value {
        font-size: 22rpx;
        color: #999;
      }
      .accent { color: #31926e; font-weight: 600; }
      .highlight { color: #d92929; font-weight: 600; }

      // 交易记录列宽（和表头严格一致）
      .record-card:not(.recharge-card) {
        .record-row {
          .from-col {
            width: 100rpx;
            flex: none;
            min-height: 80rpx;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .type-col {
            width: 100rpx;
            flex: none;
            min-height: 80rpx;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .match-col {
            flex: 1;
            min-height: 80rpx;
            display: flex;
            flex-direction: column;
            justify-content: center;
            text-align: center;
            white-space: normal;
            word-wrap: break-word;
            word-break: break-all;
          }
          .time-col {
            min-height: 80rpx;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
        }
      }

      .recharge-card {
        .normal-col {
          flex: 1;
          width: auto;
        }
      }
    }

    // （原代购）
    .purchase-section {
      .purchase-card {
        background: #fff;
        border-radius: 16rpx;
        padding: 30rpx;
        margin-bottom: 20rpx;
        box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);

        .bet-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20rpx;

          .bet-nums {
            display: flex;
            gap: 30rpx;
            .num-item {
              text-align: center;
              .num-label { font-size: 24rpx; color: #999; display: block; }
              .num-value { font-size: 32rpx; color: #333; }
            }
          }
          .bet-header-right {
            display: flex;
            align-items: center;
            gap: 16rpx;
            .status-tag {
              padding: 8rpx 20rpx;
              border-radius: 20rpx;
              font-size: 24rpx;
              &.pending { background: #fff8e1; color: #ff9800; }
              &.success { background: #e8f5e9; color: #4caf50; }
              &.failed { background: #ffebee; color: #f44336; }
            }
            .view-img-btn {
              background: #409eff;
              color: #fff;
              border: none;
              border-radius: 12rpx;
              padding: 8rpx 20rpx;
              font-size: 24rpx;
            }
          }
        }
        .card-divider {
          height: 1rpx;
          background: #f5f5f5;
          margin: 20rpx 0;
        }
        .user-info-card {
          display: flex;
          align-items: center;
          margin-bottom: 20rpx;
          .user-avatar {
            width: 60rpx;
            height: 60rpx;
            border-radius: 50%;
            background: #31926e;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20rpx;
            .avatar-text { font-size: 28rpx; color: #fff; }
          }
          .user-detail {
            .user-name { font-size: 30rpx; color: #333; }
            .user-phone { font-size: 24rpx; color: #999; }
          }
        }
        .bet-type-wrap {
          .type-label { font-size: 24rpx; color: #666; }
          .type-value { font-size: 26rpx; color: #333; margin-left: 10rpx; }
        }
        .card-actions {
          display: flex;
          gap: 10rpx;
          margin-top: 20rpx;
          .action-btn {
            flex: 1;
            height: 72rpx;
            border-radius: 12rpx;
            font-size: 28rpx;
            border: none;
            &.confirm-btn { background: #31926e; color: #fff; }
            &.cancel-btn { background: #f5f5f5; color: #666; }
          }
        }
      }
    }

    // 图片预览
    .preview-mask {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.9);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;

      .preview-container {
        width: 90%;
        .close-btn {
          position: absolute;
          top: 20rpx;
          right: 20rpx;
          width: 60rpx;
          height: 60rpx;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          color: #fff;
          font-size: 40rpx;
          text-align: center;
          line-height: 60rpx;
        }
        .preview-img {
          max-width: 100%;
          max-height: 80vh;
        }
      }
    }
  }
}

// 隐藏滚动条
::-webkit-scrollbar { display: none; }
::v-deep .tabbar-container {
  height: calc(100rpx + env(safe-area-inset-bottom)) !important;
  box-sizing: border-box !important;
}
::v-deep .tabbar {
  height: 100rpx !important;
  margin-bottom: env(safe-area-inset-bottom) !important;
}
</style>