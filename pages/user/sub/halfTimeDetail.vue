<template>
  <view class="scheme-edit-page">
    <!-- 顶部导航 -->
     <CustomHeader  
      :ballTitle="'竞彩足球'"
      title="详情" 
      :showBack="true" 
      :showIcon="false" 
      @back-click="handleBack"></CustomHeader>

    <!-- 核心内容区 -->
    <view class="main-content">
      <!-- 替换：原顶部卡片改为组件引用 -->
      <BetInfoCard :info="info" defaultBetType="半全场胜平负"></BetInfoCard>

      <!-- 半全场赛事列表：改为上下结构（和编辑页一致） -->
      <view class="match-list">
        <view v-for="(item, index) in selectedMatchList" :key="index" class="match-row">
          <!-- 上排：编号 + 队名VS队名（核心保留） -->
          <view class="match-header">
            <text class="serial-number">{{ item.serial_number || item.serialNumber || '-' }}</text>
            <text class="team-name">
              {{ item.home_name || item.homeName || '-' }} 
              <span class="vs-text">VS</span> 
              {{ item.visiting_name || item.visitingName || '-' }}
            </text>
          </view>
          <!-- 下排：选中的半全场内容（一整行） -->
          <view class="selected-content">
            {{ (item.selectedScores && item.selectedScores.length > 0) 
              ? item.selectedScores.map(val => getHalfFullLabel(val)).join(',') 
              : '无选中投注内容' }}
          </view>
        </view>
        <view class="empty-tip" v-if="selectedMatchList.length == 0">
          暂无已选赛事
        </view>
      </view>
    </view>

    <!-- 底部固定操作按钮 -->
    <view class="fixed-btn-area">
      <view class="card-actions">
        <button class="action-btn confirm-btn" @click="handleConfirm(info.id)"><text>上传照片</text></button>
        <button class="action-btn cancel-btn" @click="handleCancel"><text>弃单</text></button>
      </view>
    </view>
  </view>
</template>

<script>
import CustomHeader from "@/components/CustomHeader.vue";
import BetInfoCard from "@/pages/user/sub/BetInfoCard.vue"; // 引入组件
import { purchasingConfirm, purchasingLotteryQueryById } from "@/api/demo";

export default {
  components: { CustomHeader, BetInfoCard }, // 注册组件
  data() {
    return {
      selectedMatchList: [],
      info: {},
      id: "",
      statusBarHeight: 0,
      // 半全场选项映射（核心：把ss/sp等转成中文）
      halfFullOptions: [
        { label: "胜胜", value: "ss" },
        { label: "胜平", value: "sp" },
        { label: "胜负", value: "sf" },
        { label: "平", value: "ps" },
        { label: "平平", value: "pp" },
        { label: "平负", value: "pf" },
        { label: "负胜", value: "fs" },
        { label: "负平", value: "fp" },
        { label: "负负", value: "ff" }
      ]
    };
  },
  // 以下脚本逻辑完全不动
  onLoad(options) {
    const id = options.id;
    this.id = id;
    purchasingLotteryQueryById({ id }).then((res) => {
      // 兼容JSON解析异常，兜底空数组
      try {
        this.selectedMatchList = JSON.parse(res.data.contentJson) || [];
      } catch (e) {
        this.selectedMatchList = [];
        uni.showToast({ title: "数据解析失败", icon: "none" });
      }
      this.info = res.data;
    });
  },
  created() {
    // 获取状态栏高度（兼容所有端）
    const sysInfo = uni.getWindowInfo ? uni.getWindowInfo() : uni.getSystemInfoSync();
    this.statusBarHeight = sysInfo.statusBarHeight;
  },
  methods: {
    // 新增：根据半全场value获取中文label
    getHalfFullLabel(value) {
      const opt = this.halfFullOptions.find(item => item.value === value);
      return opt ? opt.label : value; // 兜底显示原始值
    },
    // 上传照片逻辑
    handleConfirm(id) {
      uni.chooseImage({
        count: 1,
        sourceType: ['album', 'camera'],
        success: (res) => this.uploadSimple(res.tempFilePaths[0], id),
        fail: (err) => {
          uni.showToast({ 
            title: err.errMsg.includes('permission') ? '请开启相册/相机授权' : '选择失败', 
            icon: 'none' 
          });
        }
      });
    },
    // 上传文件逻辑
    uploadSimple(filePath, ticketId) {
      uni.showLoading({ title: '上传中...' });
      uni.uploadFile({
        url: 'http://www.tianjifu.com/qwxt/outside/common/uploadFile',
        filePath: filePath,
        name: 'file',
        method: 'POST',
        success: (res) => {
          uni.hideLoading();
          try {
            const result = JSON.parse(res.data);
            if (result.code == 200 && result.data) {
              this.submitTicketWithUrl(ticketId, result.data);
            } else {
              uni.showToast({ title: '上传失败：未返回有效URL', icon: 'none' });
            }
          } catch (e) {
            uni.showToast({ title: '上传结果解析失败', icon: 'none' });
          }
        },
        fail: (err) => {
          uni.hideLoading();
          uni.showToast({ title: '网络异常，上传失败', icon: 'none' });
        }
      });
    },
    // 提交投注单逻辑
    submitTicketWithUrl(ticketId, photoUrl) {
      uni.showLoading({ title: '提交中...' });
      purchasingConfirm({
        id: ticketId,
        lotteryImagePaths: photoUrl,
        status: 1
      }).then((res) => {
        uni.hideLoading();
        if (res.code == 200) {
          // 重新拉取最新数据
          purchasingLotteryQueryById({ id: ticketId }).then((res) => {
            try {
              this.selectedMatchList = JSON.parse(res.data.contentJson) || [];
            } catch (e) {
              this.selectedMatchList = [];
            }
            this.info = res.data;
            uni.showToast({ title: '操作成功', icon: 'success' });
          });
        } else {
          uni.showToast({ title: res.message || '提交失败', icon: 'none' });
        }
      }).catch((err) => {
        uni.hideLoading();
        uni.showToast({ title: '提交失败，请重试', icon: 'none' });
      });
    },
    // 弃单逻辑
    async handleCancel() {
      uni.showModal({
        title: "提示",
        content: "确认作废此代购?",
        success: async (modalRes) => {
          if (modalRes.confirm) {
            try {
              await purchasingConfirm({ id: this.id, status: 2 });
              // 重新拉取最新状态
              const res = await purchasingLotteryQueryById({ id: this.id });
              try {
                this.selectedMatchList = JSON.parse(res.data.contentJson) || [];
              } catch (e) {
                this.selectedMatchList = [];
              }
              this.info = res.data;
              uni.showToast({ title: '弃单成功', icon: 'success' });
            } catch (error) {
              uni.showToast({ title: '操作失败，请重试', icon: 'none' });
            }
          }
        },
      });
    },
    handleBack() {
      uni.navigateBack({ delta: 1 });
    }
  }
};
</script>

<style scoped lang="scss">
.scheme-edit-page {
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
  box-sizing: border-box;
  padding-bottom: 120rpx; // 给底部按钮留空间
  position: relative; // 作为底部按钮的定位参考
}

// 顶部导航（强制固定）
::v-deep .custom-header {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  z-index: 99 !important;
}

// 主内容区（避开导航+底部按钮）
.main-content {
  width: 100%;
  box-sizing: border-box;
  padding: calc(var(--status-bar-height) + 90rpx) 20rpx 0; // 适配顶部导航高度
}

// 半全场赛事列表：复用编辑页上下结构样式
.match-list {
  width: 100%;
  box-sizing: border-box;

  // 赛事行：上下结构（和编辑页一致）
  .match-row {
    background-color: #fff;
    border-radius: 8rpx;
    margin-bottom: 15rpx;
    padding: 20rpx;
    box-shadow: 0 2rpx 5rpx rgba(0,0,0,0.05);
    display: block !important; // 覆盖原有flex布局
  }

  // 上排：编号 + 队名VS队名
  .match-header {
    display: flex;
    align-items: center;
    margin-bottom: 15rpx;
    font-size: 28rpx;
    color: #333;

    .serial-number {
      margin-right: 20rpx;
      font-weight: 400;
      color: #999;
      font-size: 28rpx;
    }

    .team-name {
      flex: 1;
      text-align: center;

      .vs-text {
        margin: 0 10rpx;
        color: #999;
      }
    }
  }

  // 下排：选中的半全场内容（一整行）
  .selected-content {
    text-align: center;
    font-size: 32rpx;
    color: #d92929;
    font-weight: 500;
    background: #f1f1f1;
    border-radius: 10rpx;
    padding: 16rpx 0;
  }

  // 空状态提示（和编辑页一致）
  .empty-tip {
    text-align: center;
    padding: 50rpx 0;
    font-size: 26rpx;
    color: #999;
    background-color: #fff;
    border-radius: 8rpx;
    margin: 20rpx;
  }
}

// 底部固定按钮（保留原有样式）
.fixed-btn-area {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20rpx;
  background: #fff;
  z-index: 999; // 最高层级
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.1);

  .card-actions {
    display: flex;
    gap: 20rpx;
    width: 100%;

    .action-btn {
      flex: 1;
      height: 72rpx;
      border-radius: 12rpx;
      font-size: 28rpx;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;

      &.confirm-btn {
        background: #31926e;
        color: #fff;
      }
      &.cancel-btn {
        background: #f5f5f5;
        color: #666;
      }
    }
  }
}

// 隐藏滚动条
::-webkit-scrollbar {
  display: none;
}
</style>