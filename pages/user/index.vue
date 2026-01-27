<template>
  <view class="container" @touchstart="onTouchStart" 
    @touchend="onTouchEnd"
    style="width: 100%; height: 100vh; box-sizing: border-box;">
    <!-- 头部 -->
    <view class="header">
      <image class="avatar" src="@/static/mine1.png" mode="aspectFill"></image>
      <view class="user-info">
        <text class="username">{{ userInfo.remarkName || '' }}</text>
        <text class="stone-count">{{ userInfo.coinAmount || 0 }} 灵石</text>
      </view>
    </view>

    <!-- Tab栏：调整顺序，竞猜放第一个 -->
    <view class="tab-bar">
      <!-- <view class="tab-item" :class="{ active: currentTab === 0 }" @click="switchTab(0)">模拟</view> -->
      <view class="tab-item" :class="{ active: currentTab === 1 }" @click="switchTab(1)">交易记录</view>
      <view class="tab-item" :class="{ active: currentTab === 2 }" @click="switchTab(2)">充值记录</view>
    </view>

    <!-- 内容区 -->
    <scroll-view class="content-scroll" scroll-y>
      <!-- 1. 竞猜（原代购，移到第一个Tab） -->
      <view v-if="currentTab === 0" class="purchase-section">
        <no-data v-if="lotteryPurchasing.length === 0" />
        <view class="purchase-card" v-for="(item, index) in lotteryPurchasing" :key="index">
          <view class="bet-header">
            <view class="bet-nums">
              <view class="num-item">
                <text class="num-label">投注注数</text>
                <text class="num-value">{{ item.multiple || 0 }}</text>
              </view>
              <view class="num-item">
                <text class="num-label">倍数</text>
                <text class="num-value">{{ item.bet || 0 }}</text>
              </view>
              <view class="num-item">
                <text class="num-label">总金额</text>
                <text class="num-value">{{ item.payment || 0 }}</text>
              </view>
            </view>
            <view class="bet-header-right">
              <view class="status-tag" :class="[getStatusClass(item.status)]">
                {{ getStatusText(item.status) }}
              </view>
              <button class="view-img-btn" v-if="item.lotteryImagePaths" @click="openImagePreview(item.lotteryImagePaths)">
                查看彩票
              </button>
            </view>
          </view>
          <view class="card-divider"></view>
          <view class="user-info-card">
            <view class="user-avatar">
              <text class="avatar-text">{{ getAvatarText(item.remarkName) }}</text>
            </view>
            <view class="user-detail">
              <text class="user-name">{{ item.remarkName || '匿名用户' }}</text>
              <text class="user-phone">{{ item.userPhone || '未填写' }}</text>
            </view>
          </view>
          <view class="bet-type-wrap">
            <text class="type-label">投注类型：</text>
            <text class="type-value">{{ item.entityType || '足彩胜平负' }}</text>
          </view>
          <view class="card-actions" v-if="item.status == 0 && userInfo.isSysManage == 1" >
            <button class="action-btn confirm-btn" @click="handleConfirm(item.id,item)">确认打票</button>
            <!-- <button class="action-btn cancel-btn" :style="{background: item.is_accurate==1? '#31926e':'red'}" @click="handleCancel(item.id,index)">弃单</button> -->
          </view>
        </view>
      </view>

      <!-- 2. 交易（原第一个Tab，移到第二个） -->
      <view v-if="currentTab === 1" class="record-section">
        <no-data v-if="tradeRecord.length === 0" />
        <view class="record-card" v-for="(item, index) in tradeRecord" :key="index">
          <view class="record-row">
            <view class="normal-col">
              <text class="label">支付灵石</text>
              <text class="value accent">{{ item.payment_coin || 0 }} 个</text>
            </view>
            <view class="normal-col">
              <text class="label">商品类型</text>
              <text class="value">{{ item.goods_type || '' }}</text>
            </view>
            <view class="normal-col">
              <text class="label">来源</text>
              <text class="value">{{ item.be_from || '' }}</text>
            </view>
            <view class="time-col">
              <text class="label">时间</text>
              <text class="value">{{ item.update_time }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 3. 充值（原第二个Tab，移到第三个） -->
      <view v-if="currentTab === 2" class="record-section">
        <no-data v-if="paymentRecord.length === 0" />
        <view class="record-card" v-for="(item, index) in paymentRecord" :key="index">
          <view class="record-row">
            <view class="normal-col">
              <text class="label">付款金额</text>
              <text class="value highlight">{{ item.payment || 0 }} 元</text>
            </view>
            <view class="normal-col">
              <text class="label">获得灵石</text>
              <text class="value accent">{{ item.coin_amount || 0 }} 个</text>
            </view>
            <view class="time-col">
              <text class="label">充值时间</text>
              <text class="value">{{ item.update_time }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 图片预览弹窗 -->
      <view class="preview-mask" v-if="isImagePreviewVisible" @click="closeImagePreview">
        <view class="preview-container" @click.stop>
          <view class="close-btn" @click="closeImagePreview">×</view>
          <image class="preview-img" :src="previewImageUrl" mode="widthFix"></image>
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

export default {
  components: { NoData, NativeTabbar },
  data() {
    return {
      currentTab: 1, // 默认显示第一个Tab（竞猜）
      userInfo: {},
      lotteryPurchasing: [],
      isImagePreviewVisible: false,
      previewImageUrl: '',
      defaultLotteryImageUrl: 'http://www.tianjifu.com/qwxt/outside/common/fileDownload?fileFullPathName=',
      tradeRecord: [],
      paymentRecord: [],
            touchStartX: 0, // 新增：触摸起始X坐标
      swipeThreshold: 50, // 新增：滑动判定阈值（px）
    };
  },
  created() {
    this.getData();
  },
  onShow() {
    this.getData();
  },
  methods: {
        onTouchStart(e) {
      // 记录触摸起始X坐标
      this.touchStartX = e.changedTouches[0].clientX;
    },
    onTouchEnd(e) {
      const touchEndX = e.changedTouches[0].clientX;
      const diffX = touchEndX - this.touchStartX; // 差值：正=右滑，负=左滑
      
      // 判定有效滑动（超过阈值）
      if (Math.abs(diffX) < this.swipeThreshold) return;
      
      // 获取Tabbar组件实例，调用切换方法
      const tabbar = this.$refs.nativeTabbar;
      if (!tabbar) return;
      
      // 左滑（diffX<0）→ 下一个Tab；右滑（diffX>0）→ 上一个Tab
      if (diffX < 0) {
        tabbar.switchTabBySwipe('left'); // 左滑切换下一个
      } else {
        tabbar.switchTabBySwipe('right'); // 右滑切换上一个
      }
    },
    openImagePreview(imagePath) {
      if (!imagePath) return uni.showToast({ title: '暂无彩票图片', icon: 'none' });
      this.previewImageUrl = this.defaultLotteryImageUrl + imagePath;
      this.isImagePreviewVisible = true;
      uni.previewImage({ urls: [this.previewImageUrl], current: 0 });
    },
    closeImagePreview() {
      this.isImagePreviewVisible = false;
    },
    switchTab(tabIndex) {
      this.currentTab = tabIndex;
    },
    async getData() {
      uni.showLoading({ title: "加载中..." });
      try {
        const betForm = uni.getSystemInfoSync().platform === 'ios' || uni.getSystemInfoSync().platform === 'android' ? 'app' : 'weChatMiniProgram';
        const res = await getUser({ betForm });
        this.userInfo = res.data.user || res.data.userInfo || {};
        this.lotteryPurchasing = res.data.lotteryPurchasing || [];
        this.paymentRecord = res.data.paymentRecord || [];
        this.tradeRecord = res.data.tradeRecord || [];
      } catch (e) {
        uni.showToast({ title: "加载失败", icon: "none" });
      } finally {
        uni.hideLoading();
      }
    },
    handleConfirm(id, item) {
      // 统一替换为规范化后的路径，全部指向 pages/user/sub 目录
      const pathMap = {
        '比分':'/pages/user/sub/scoreDetail?id=',
        '足彩总进球':'/pages/user/sub/totalGoalsDetail?id=',
        '半全场':'/pages/user/sub/halfTimeDetail?id=',
        '篮球胜负':'/pages/user/sub/basketballSf?id=',
        '篮球胜分差':'/pages/user/sub/basketballSfc?id=',
        '篮球让分胜负':'/pages/user/sub/basketballHandicapDetail?id=',
        '篮球大小分':'/pages/user/sub/overUnderDetail?id='
      };
      // 拼接最终跳转路径（把id拼接到对应路径后）
      uni.navigateTo({ 
        url: (pathMap[item.entityType] || `/pages/user/sub/buyDetail?id=`) + id 
      });
    },
    async handleCancel(id) {
      uni.showModal({
        title: '提示',
        content: "确认作废此代购?",
        success: async (res) => {
          if (res.confirm) {
            await purchasingLotteryConfirm({ id, status: 2 });
            this.getData();
            uni.showToast({ title: "操作成功", icon: "success" });
          }
        }
      });
    },
    getStatusText(status) {
      return { 0: '待打票', 1: '代购成功', 2: '已弃单' }[status] || '未知状态';
    },
    getStatusClass(status) {
      return { 0: 'pending', 1: 'success', 2: 'failed' }[status] || '';
    },
    getAvatarText(name) {
      return (name && name.trim().charAt(0)) || '用';
    }
  }
};
</script>

<style scoped lang="scss">
// 核心样式 - 极简
.container {
  width: 100%;
  height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;

  // 头部
  .header {
    background: #fff;
    padding: 60rpx;
    display: flex;
    align-items: center;
    border-bottom: 1rpx solid #eaecef;

    .avatar {
      width: 110rpx;
      height: 110rpx;
      border-radius: 50%;
      margin-right: 24rpx;
    }
    .user-info {
      .username { font-size: 26rpx; color: #333; display: block; margin-bottom: 6rpx; }
      .stone-count { font-size: 24rpx; color: #666; }
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
  // 关键：分端设置底部间距，避开NativeTabbar
  // #ifdef APP-PLUS
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom) + 20rpx) !important;
  // #endif
  
  // #ifdef H5
  padding-bottom: calc(100rpx + 20rpx) !important;
  // #endif
  
  // #ifdef MP-WEIXIN
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom) + 20rpx) !important;
  // #endif
  box-sizing: border-box !important; // 确保padding不撑开高度

    // 交易/充值通用样式
    .record-section {
      .record-card {
        background: #fff;
        border-radius: 12rpx;
        padding: 20rpx;
        margin-bottom: 16rpx;
        box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
      }
      .record-row {
        display: flex;
        width: 100%;
      }
      // 时间列 - 固定140rpx（不宽且能放下时间）
      .time-col {
        width: 240rpx;
        text-align: center;
      }
      // 普通列 - 均分剩余宽度
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
    }

    // 竞猜（原代购）
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