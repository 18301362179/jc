<template>
  <view class="tips-popup-container" v-if="visible">
    <view class="popup-mask" @tap="handleClose"></view>
    <view
      class="popup-content"
      :style="{
        width: popupWidth + 'rpx',
      }"
    >
      <view class="close-btn" @tap="handleClose">×</view>
      <view class="tips-title">提&nbsp;&nbsp;&nbsp;示</view>
      <view class="tips-content">
        <!-- 1-7条：序号+内容双对齐 -->
        <view class="tips-item" v-for="(item, index) in normalList" :key="index">
          <view class="item-num">{{ item.num }}、</view>
          <view class="item-content">{{ item.content }}</view>
        </view>

        <!-- 第8条：序号+内容对齐 + 步骤递进 -->
        <!-- <view class="tips-item step-wrap">
          <view class="item-num">8、</view>
          <view class="item-content">
            <view class="step-title">系统操作提示:</view>
            <view class="step-list">
              <view class="step-item" v-for="(step, idx) in stepList" :key="idx">
                <view class="step-num">{{ step.num }}</view>
                <view class="step-text">{{ step.text }}</view>
              </view>
            </view>
          </view>
        </view> -->
        <view class="blank-area"></view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "TipsPopup",
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: "重要提示" },
    headerHeight: { type: Number, default: 0 },
    popupWidth: { type: Number, default: 700 },
    borderColor: { type: String, default: "#07c160" },
    maxHeight: { type: Number, default: 80 }, // 改为百分比，适配不同机型
  },
  data() {
    return {
      // 替换为新的3条基础说明（对应新的1、2、3点）
      normalList: [
        { num: 1, content: "每天上午11点10分前更新最新数据。" },
        { num: 2, content: "足球、篮球比赛胜负、球队实力、历史数据详细对比分析。" },
        { num: 3, content: "系统数据仅是历史数据分析，对于球队求胜欲望情况、是否有策略性控制胜负以规避对手等等场外因素没有纳入分析，所有数据仅供参考" },
        { num: 4, content: "给服务号随便发送一条信息，信息列表就会有记录，方便使用。" },
        { 
        num: 5, 
        content: "每次分享可获得免费数据分析服务权益，24小时内最多可获得两次。所有赛事数据均由数据专员手工采集录入，感谢您的理解与支持！" 
      },
      ]
    };
  },
  methods: {
    handleClose() {
      this.$emit("update:visible", false);
      this.$emit("close");
    },
  },
};
</script>

<style scoped lang="scss">
.tips-popup-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999999;
  display: flex;
  justify-content: center;
  align-items: center; // 容器层面先做居中兜底
}
.popup-mask {
  position: absolute; // 修改为absolute，避免遮盖居中布局
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
}
.popup-content {
  position: relative; // 改为relative，配合外层flex居中
  z-index: 1; // 确保在遮罩层上方
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 5rpx 20rpx rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  padding: 2rpx;
  background-color: v-bind(borderColor);
  max-height: v-bind('maxHeight + "vh"'); // 使用视口高度，适配不同机型
  overflow-y: auto; // 内容超出最大高度时滚动
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    border-radius: 10rpx;
    z-index: -1;
  }
}
.close-btn {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  color: #666;
  font-size: 40rpx;
  text-align: center;
  line-height: 60rpx;
  cursor: pointer;
  z-index: 10;
}
.tips-title {
  font-size: 28rpx;
  color: #d92929;
  font-weight: bold;
  margin: 20rpx 0;
  text-align: center;
}
.tips-content {
  padding: 0 30rpx 20rpx;
  box-sizing: border-box;
}

// ========== 核心对齐样式 ==========
.tips-item {
  display: flex;
  margin-bottom: 20rpx;
  line-height: 1.6;
  font-size: 22rpx;
  color: #333;
}
// 序号固定宽度，保证1/2/3...完全对齐
.item-num {
  width: 40rpx;
  flex-shrink: 0;
  text-align: right;
  margin-right: 10rpx;
  color: #333;
}
.item-content {
  flex: 1;
  word-break: break-all;
  text-align: justify;
}

// ========== 第8条步骤样式 ==========
.step-wrap {
  margin-bottom: 0;
}
.step-title {
  margin-bottom: 10rpx;
}
.step-list {
  box-sizing: border-box;
  padding-left: 40rpx; // 步骤整体缩进，和截图一致
}
.step-item {
  display: flex;
  margin-bottom: 10rpx;
}
// 步骤序号（第一步/第二步）固定宽度，保证对齐
.step-num {
  width: 80rpx;
  flex-shrink: 0;
  text-align: right;
  margin-right: 10rpx;
  color: #333;
}
.step-text {
  flex: 1;
  word-break: break-all;
  text-align: justify;
}

.blank-area {
  height: 26rpx;
  width: 100%;
}
</style>
