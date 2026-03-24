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

    <!-- 列表内容区 -->
    <scroll-view class="list-scroll" scroll-y>
      <!-- 无数据占位 -->
      <no-data v-if="coinRecordList.length === 0" />

      <!-- 列表表头 -->
      <view class="list-header" v-if="coinRecordList.length > 0">
        <view class="header-col type-col">类型</view>
        <view class="header-col desc-col">描述</view>
        <view class="header-col num-col">数量</view>
        <view class="header-col time-col">时间</view>
      </view>

      <!-- 列表项 -->
      <view class="list-item" v-for="(item, index) in coinRecordList" :key="index">
        <view class="item-col type-col">
          <text class="value" :class="{ add: item.type === '增加', reduce: item.type === '减少' }">
            {{ item.type || '未知' }}
          </text>
        </view>
        <view class="item-col desc-col">
          <text class="value">{{ item.desc || '无描述' }}</text>
        </view>
        <view class="item-col num-col">
          <text class="value" :class="{ add: item.type === '增加', reduce: item.type === '减少' }">
            {{ item.coinNum || 0 }}
          </text>
        </view>
        <view class="item-col time-col">
          <text class="value">{{ item.createTime || '' }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部tabbar（如需保留则加，不需要可删除） -->
    <NativeTabbar ref="nativeTabbar" />
  </view>
</template>

<script>
import CustomHeader from "@/components/CustomHeader.vue";
import NativeTabbar from "@/components/tabbar.vue";
import NoData from "@/pages/commn/noData";
// 引入币明细接口（需根据你的实际接口调整）
import { userTradeRecord } from "@/api/demo";

export default {
  components: { CustomHeader, NativeTabbar, NoData },
  data() {
    return {
      coinRecordList: [], // 币明细列表
      betForm: '', // 终端类型（和主页面保持一致）
      getRemark: false // 控制权限（和主页面同步）
    };
  },
  created() {
    // 初始化终端类型
    this.initBetForm();
    // 获取权限标识（和主页面同步）
    this.getRemark = uni.getStorageSync('urlValue');
    // 加载数据
    this.getCoinRecordData();
  },
  methods: {
    // 初始化终端类型（和主页面逻辑一致）
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

    // 获取币明细列表数据
    async getCoinRecordData() {
      // 无权限时直接返回
      if (!this.getRemark) {
        uni.showToast({ title: "暂无访问权限", icon: "none" });
        return;
      }

      uni.showLoading({ title: "加载中..." });
      try {
        // 调用币明细接口（参数根据你的实际接口调整）
        const res = await userTradeRecord();
        // 适配接口返回格式
        this.coinRecordList = res.data || [];
      } catch (e) {
        uni.showToast({ title: "加载失败", icon: "none" });
        console.error("币明细加载失败：", e);
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

// 导航栏样式（固定顶部）
::v-deep .custom-header {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  z-index: 10 !important;
  background-color: #f5f7fa;
}

// 滚动列表样式
.list-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20rpx;
  padding-top: 120rpx; // 避开导航栏
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom) + 20rpx); // 避开底部tabbar
  box-sizing: border-box;
}

// 列表表头
.list-header {
  display: flex;
  width: 100%;
  height: 60rpx;
  background: #f8f9fa;
  border-radius: 8rpx 8rpx 0 0;
  align-items: center;
  margin-bottom: 2rpx;

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

  .type-col { width: 120rpx; flex: none; }
  .desc-col { flex: 1; }
  .num-col { width: 150rpx; flex: none; }
  .time-col { width: 200rpx; flex: none; }
}

// 列表项
.list-item {
  display: flex;
  width: 100%;
  background: #fff;
  border-radius: 8rpx;
  margin-bottom: 12rpx;
  padding: 20rpx 0;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);

  .item-col {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 70rpx;
  }

  .type-col { width: 120rpx; flex: none; }
  .desc-col { flex: 1; padding: 0 10rpx; }
  .num-col { width: 150rpx; flex: none; }
  .time-col { width: 200rpx; flex: none; }

  .value {
    font-size: 22rpx;
    color: #666;
    &.add { color: #31926e; font-weight: 600; } // 增加为绿色
    &.reduce { color: #d92929; font-weight: 600; } // 减少为红色
  }
}

// 隐藏滚动条
::-webkit-scrollbar { display: none; }

// 适配底部tabbar
::v-deep .tabbar-container {
  height: calc(100rpx + env(safe-area-inset-bottom)) !important;
  box-sizing: border-box !important;
}
::v-deep .tabbar {
  height: 100rpx !important;
  margin-bottom: env(safe-area-inset-bottom) !important;
}
</style>