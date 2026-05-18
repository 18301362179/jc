<template>
  <view v-if="visible" class="modal-mask" @click.self="close">
    <view class="modal-box">
      <view class="modal-header">
        <text class="title">{{ msg.ms_title || '系统通知' }}</text>
        <text class="time">{{ msg.ms_time || '' }}</text>
      </view>

      <view class="modal-content">
        <view class="content-text">{{ msg.ms_content || '暂无内容' }}</view>
      </view>

      <view class="modal-footer">
        <button class="close-btn" @click="handleKnow" :loading="loading">我知道了</button>
      </view>
    </view>
  </view>
</template>

<script>
// 组件内部自己引入所有接口
import { platformSysMessageRead, platformSysMessageQuery } from "@/api/demo.js";

export default {
  name: "SystemMsgModal",
  // 删掉所有 props
  data() {
    return {
      visible: false, // 组件内部自己控制显示隐藏
      msg: {},
      loading: false
    };
  },
  mounted() {
    // 组件挂载自动请求消息
    this.getMsgList();
  },
  methods: {
    // 获取消息列表
    async getMsgList() {
      try {
        const res = await platformSysMessageQuery();
        const list = res.data || [];
        // 有未读消息直接弹出
        if(list.length > 0){
          this.msg = list[0];
          this.visible = true;
        }
      } catch (err) {}
    },
    // 关闭弹框
    close() {
      this.visible = false;
    },
    // 已读 + 关闭
    async handleKnow() {
      if(this.loading) return;
      this.loading = true;
      try {
        if(this.msg.id){
          await platformSysMessageRead({msId: this.msg.id});
        }
      } catch (e) {}
      finally {
        this.loading = false;
        this.close();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-box {
  width: 80%;
  min-height: 500rpx;
  max-height: 90vh;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.modal-header {
  padding: 24rpx 30rpx;
  display: flex;
  justify-content: space-between;
  border-bottom: 1rpx solid #eee;
  flex-shrink: 0;
  .title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
  }
  .time {
    font-size: 22rpx;
    color: #999;
  }
}
.modal-content {
  padding: 30rpx;
  flex: 1;
  overflow-y: auto;
}
.content-text {
  font-size: 26rpx;
  color: #444;
  line-height: 2;
  word-break: break-all;
  white-space: pre-line;
  text-indent: 2em;
}
.modal-footer {
  padding: 0 30rpx 24rpx;
  flex-shrink: 0;
  .close-btn {
    width: 100%;
    height: 80rpx;
    background: #31926e;
    color: #fff;
    border-radius: 10rpx;
    font-size: 28rpx;
    border: none;
  }
}
</style>