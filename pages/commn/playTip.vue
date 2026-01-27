<template>
  <view class="tips-popup-container" v-if="visible">
    <view class="popup-mask" @tap="handleClose"></view>
    <view 
      class="popup-content" 
      :style="{ 
        width: popupWidth + 'rpx'
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
        <view class="tips-item step-wrap">
          <view class="item-num">8、</view>
          <view class="item-content">
            <view class="step-title">系统操作提示:</view>
            <!-- 步骤列表：和截图一致的缩进 -->
            <view class="step-list">
              <view class="step-item" v-for="(step, idx) in stepList" :key="idx">
                <view class="step-num">{{ step.num }}</view>
                <view class="step-text">{{ step.text }}</view>
              </view>
            </view>
          </view>
        </view>
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
    maxHeight: { type: Number, default: 80 } // 改为百分比，适配不同机型
  },
  data() {
    return {
      // 替换为新的3条基础说明（对应新的1、2、3点）
      normalList: [
        { num: 1, content: "上午11点前更新当天最新数据,偶会稍有延迟。" },
        { num: 2, content: "足球、篮球比赛胜负比分预测,以及比赛球队详细对比信息。" },
        { num: 3, content: "系统数据仅供参考,需智慧分析判断。" },
      ],
      // 替换为新的3步操作指引（对应新的第4点）
      stepList: [
        { num: "第一步", text: "首选胜率较大的场次。" },
        { num: "第二步", text: "查看分析，参考球队积分、胜率、场均进球、场均失球、相同主客场数据、对战记录，近期表现等因素智慧分析判断。" },
        { num: "第三步", text: "选好投注，点击预览进入确认页面后截图。" },
      ]  
    }
  },
  methods: {
    handleClose() {
      this.$emit("update:visible", false);
      this.$emit("close");
    }
  }
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
  background: rgba(0,0,0,0.1);
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