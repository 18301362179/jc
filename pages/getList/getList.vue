<template>
  <view class="container" style="width: 100%; box-sizing: border-box;">
    <!-- 保留自定义头部，简化配置 -->
    <CustomHeader
      :showBack="true"
      :ballTitle="''"
      :title="'购买记录'"
      :isIndex="false"
      :showIcon="false"
      :isSelected="false"
    />

    <!-- 滚动内容区，只保留购买记录 -->
    <scroll-view class="content-scroll" scroll-y>
      <view class="record-section">
        <!-- 空数据提示 -->
        <no-data v-if="paymentRecord.length === 0" />
        
        <!-- 购买记录列表 -->
        <view class="record-card recharge-card" v-for="(item, index) in paymentRecord" :key="index">
          <view class="record-row">
            <view class="normal-col">
              <text class="label">购买金额</text>
              <text class="value highlight">{{ item.payment || 0 }} 元</text>
            </view>
            <view class="normal-col">
              <text class="label">购买</text>
              <text class="value accent">{{ item.coin_amount || 0 }} 个</text>
            </view>
            <view class="time-col">
              <text class="label">购买时间</text>
              <text class="value">{{ item.update_time }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 移除底部tabbar，因为是独立页面 -->
  </view>
</template>

<script>
import NoData from "@/pages/commn/noData";
import { getTradeRecord } from "@/api/demo";
import CustomHeader from "@/components/CustomHeader.vue";

export default {
  components: { NoData, CustomHeader },
  data() {
    return {
      paymentRecord: [],  // 只保留购买记录数据
      betForm: '',        // 接口需要的参数
    };
  },
  created() {
    this.initBetForm();
    this.getData();
  },
  onShow() {
    // 每次显示页面都重新加载数据，保证数据最新
    this.getData();
  },
  methods: {
    // 初始化终端类型（接口需要）
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
    // 获取购买记录数据
    async getData() {
      uni.showLoading({ title: "加载中..." });
      try {
        const res = await getTradeRecord();
        console.log(res, 'res-------------')
        this.paymentRecord = res.data || [];
      } catch (e) {
        uni.showToast({ title: "加载失败", icon: "none" });
        console.error('获取购买记录失败：', e);
      } finally {
        uni.hideLoading();
      }
    },
  }
};
</script>

<style scoped lang="scss">
.container {
  width: 100%;
  height: 100vh;  // 占满整个屏幕
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

// 内容滚动区
.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20rpx;
  box-sizing: border-box;

  // 隐藏滚动条
  ::-webkit-scrollbar {
    display: none;
  }

  .record-section {
    display: flex;
    flex-direction: column;

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
      padding: 20rpx;
      box-sizing: border-box;
    }
    
    .normal-col {
      flex: 1;
      text-align: center;
    }
    
    .time-col {
      width: 240rpx;
      text-align: center;
      flex: none;
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
    
    .accent { 
      color: #31926e; 
      font-weight: 600; 
    }
    
    .highlight { 
      color: #d92929; 
      font-weight: 600; 
    }
  }
}
</style>