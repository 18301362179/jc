<template>
  <view class="get-list-container">
    <!-- 自定义导航栏 -->
    <CustomHeader
      :showBack="true"
      :ballTitle="''"
      :title="'明  细'"
      :isIndex="false"
      :showIcon="false"
      :isSelected="false"
    />

    <!-- 列表表头：全机型兼容，贴在导航栏正下方 -->
    <view class="list-header" v-if="coinRecordList.length > 0" :style="{ top: navBarHeight + 'px' }">
      <view class="header-col type-col">编号</view>
      <view class="header-col desc-col">额</view>
      <view class="header-col num-col">币</view>
      <view class="header-col time-col">时间</view>
    </view>

    <!-- 列表内容区 -->
    <scroll-view class="list-scroll" scroll-y :style="{ paddingTop:  28 + 'px' }">
      <no-data v-if="coinRecordList.length === 0" />

      <view class="list-item" v-for="(item, index) in coinRecordList" :key="index">
        <view class="item-col type-col">
          <text class="value">{{ item.trade_no || '' }}</text>
        </view>
        <view class="item-col desc-col">
          <text class="value">{{ item.payment || '' }}</text>
        </view>
        <view class="item-col num-col">
          <text class="value">{{ item.coin_sum || 0 }}</text>
        </view>
        <view class="item-col time-col">
          <text class="value">{{ item.update_time || '' }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import CustomHeader from "@/components/CustomHeader.vue";
import NoData from "@/pages/commn/noData";
import { userTradeRecord } from "@/api/demo";

export default {
  components: { CustomHeader, NoData },
  data() {
    return {
      coinRecordList: [],
      betForm: '',
      getRemark: false,
      statusBarHeight: 0,
      navBarHeight: 0,
    };
  },
  created() {
    this.initBetForm();
    this.getRemark = uni.getStorageSync('urlValue');

    // 全机型兼容：获取状态栏 + 导航栏真实高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight;
    this.navBarHeight = this.statusBarHeight + 44;

    this.getCoinRecordData();
  },
  methods: {
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
    async getCoinRecordData() {
      if (!this.getRemark) {
        uni.showToast({ title: "暂无访问权限", icon: "none" });
        return;
      }
      uni.showLoading({ title: "加载中..." });
      try {
        const res = await userTradeRecord();
        this.coinRecordList = res.data || [];
      } catch (e) {
        uni.showToast({ title: "加载失败", icon: "none" });
      } finally {
        uni.hideLoading();
      }
    }
  }
};
</script>

<style scoped lang="scss">
.get-list-container {
  width: 100%;
  height: 100vh;
  background: #f5f7fa;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

::v-deep .custom-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  background-color: #f5f7fa;
}

/* 表头：固定定位，全机型自动适配位置 */
.list-header {
  position: fixed;
  left: 20rpx;
  right: 20rpx;
  z-index: 5;
  display: flex;
  height: 60rpx;
  background: #f9f9f9;
  border-radius: 8rpx 8rpx 0 0;
  align-items: center;

  .header-col {
    font-size: 24rpx;
    color: #333;
    font-weight: 600;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  .type-col { flex:1; }
  .desc-col { width: 80rpx;}
  .num-col { width: 80rpx; flex: none; }
  .time-col { width: 280rpx; flex: none; }
}

.list-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0 20rpx;
  padding-bottom: calc( env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.list-item {
  display: flex;
  width: 100%;
  background: #fff; /* 默认白色 */
  border-radius: 8rpx;
  margin-bottom: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);

  .item-col {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 70rpx;
  }
  .type-col { flex:1;}
  .desc-col { width: 80rpx; }
  .num-col { width: 80rpx; flex: none; }
  .time-col { width: 280rpx; flex: none; }

  .value {
    font-size: 22rpx;
    color: #666;
    &.add { color: #31926e; font-weight: 600; }
    &.reduce { color: #d92929; font-weight: 600; }
  }
}

/* 奇数行 浅灰色背景 */
.list-item:nth-child(odd) {
   background: #f9f9f9;
}
.list-item:nth-child(1) {
  margin-top: 16rpx;
}
::-webkit-scrollbar { display: none; }
</style>