<template>
  <view class="scheme-edit-page">
    <!-- 顶部导航 -->
    <CustomHeader  
      :ballTitle="'足球'"
      title="详情" 
      :showBack="true" 
      :showIcon="false" 
      @back-click="handleBack"></CustomHeader>

    <!-- 核心内容区 -->
    <view class="main-content" :style="{ paddingTop: statusBarHeight + 48 + 'px' }">
      <!-- 替换：原顶部卡片改为组件引用 -->
      <BetInfoCard :info="info" defaultBetType="比分"></BetInfoCard>

      <!-- 2. 比分列表（结构不变，仅修复标签闭合） -->
      <view class="match-list">
        <view v-for="(item, index) in selectedMatchList" :key="index" class="match-row">
          <!-- 顶部：赛事编号 + 对阵双方 -->
          <view class="match-top">
            <text class="match-serial">{{ item.serial_number || item.serialNumber }}</text>
            <text class="match-vs">{{ item.home_name || item.homeName }} VS {{ item.visiting_name || item.visitingName }}</text>
          </view>
          <!-- 底部：选中比分（去掉?.，改用传统判断） -->
          <view class="match-score" :class="{ 'selected': item.selectedScores && item.selectedScores.length > 0 }">
            <text v-if="item.selectedScores && item.selectedScores.length > 0">{{ item.selectedScores.join(',') }}</text>
            <text v-else class="score-tip">无选中投注内容</text>
          </view>
        </view>
        <view class="empty-tip" v-if="selectedMatchList.length == 0">
          <text>暂无已选赛事</text>
        </view>
      </view>
    </view>

    <!-- 3. 底部固定操作按钮 -->
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
      statusBarHeight: 0
    };
  },
  // 以下脚本逻辑完全不动
  onLoad(options) {
    const id = options.id;
    this.id = id;
    purchasingLotteryQueryById({ id }).then((res) => {
      this.selectedMatchList = JSON.parse(res.data.contentJson);
      this.info = res.data;
    });
  },
  created() {
    // 获取状态栏高度（兼容所有端）
    const sysInfo = uni.getWindowInfo ? uni.getWindowInfo() : wx.getWindowInfo();
    this.statusBarHeight = sysInfo.statusBarHeight;
  },
  methods: {
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
    submitTicketWithUrl(ticketId, photoUrl) {
      uni.showLoading({ title: '提交中...' });
      purchasingConfirm({
        id: ticketId,
        lotteryImagePaths: photoUrl,
        status: 1
      }).then((res) => {
        uni.hideLoading();
        if (res.code == 200) {
          purchasingLotteryQueryById({ id: ticketId }).then((res) => {
            this.selectedMatchList = JSON.parse(res.data.contentJson);
            this.info = res.data;
          });
        } else {
          uni.showToast({ title: res.message || '提交失败', icon: 'none' });
        }
      }).catch((err) => {
        uni.hideLoading();
        uni.showToast({ title: '提交失败，请重试', icon: 'none' });
      });
    },
    async handleCancel() {
      uni.showModal({
        title: "提示",
        content: "确认作废此代购?",
        success: async (modalRes) => {
          if (modalRes.confirm) {
            try {
              await purchasingConfirm({ id: this.id, status: 2 });
              const res = await purchasingLotteryQueryById({ id: this.id });
              this.selectedMatchList = JSON.parse(res.data.contentJson);
              this.info = res.data;
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
// 删除原top-card样式（已移到组件），其他样式完全不动
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
  padding: 0 20rpx;
}

// 比分列表样式（替换为总进球样式，仅改这里）
.match-list {
  width: 100%;
  box-sizing: border-box;

  // 赛事行：总进球同款样式
  .match-row {
    background-color: #fff;
    border-radius: 8rpx;
    margin-bottom: 15rpx;
    padding: 20rpx;
    box-shadow: 0 2rpx 5rpx rgba(0,0,0,0.05);
  }

  // 赛事顶部：编号+队名VS队名（总进球样式）
  .match-top {
    display: flex;
    align-items: center;
    margin-bottom: 15rpx;
    font-size: 28rpx;
    color: #333;

    .match-serial {
      margin-right: 20rpx;
      font-weight: 400;
      color:#999;
    }

    .match-vs {
      flex: 1;
      text-align: center;
    }
  }

  // 选中的比分：总进球同款样式
  .match-score {
    text-align: center;
    font-size: 32rpx;
    color: #999; /* 默认灰色 */
    font-weight: 500;
    background:#f1f1f1;
    border-radius: 10rpx;
    padding: 8rpx 0;

    // 选中比分样式（总进球同款红色）
    &.selected {
      color: #d92929; 
    }

    .score-tip {
      color: #999;
    }
  }

  .empty-tip {
    text-align: center;
    padding: 50rpx 0;
    font-size: 26rpx;
    color: #999;
    background: #fff;
    border-radius: 8rpx;
    margin-top: 20rpx;
  }
}

// 底部固定按钮（完全保留）
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