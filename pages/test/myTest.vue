<template>
  <view class="page-container">
    <!-- 固定头部 -->
    <CustomHeader :title="'预测数据'" :showBack="true" :isIndex="false" :showIcon="false" :isSelected="false" :selectedPlay="''" @funnel-click="handleFunnel" @back-click="onBackClick" />
    <view class="test">
      <view class="c1"></view>
      <view class="c2"></view>
    </view>
  </view>
</template>

<script>
import CustomHeader from "@/components/CustomHeader.vue";
export default {
  components: { CustomHeader },
  data() {
    return {
    };
  },

};
</script>

<style lang="scss" scoped>
.test {
  width: 100%;
  height: 200rpx;
  background:gray;
  .c1{
    float:left;
    width: 50%;
    height: 50rpx;
    background:green;
  }
}
</style>
