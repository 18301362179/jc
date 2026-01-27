<template>
  <view class="scheme-edit-page">
    <!-- 顶部导航 -->
    <CustomHeader 
      :ballTitle="'竞彩篮球'"
      title="详情" 
      :showBack="true" 
      :showIcon="false" 
      @back-click="handleBack"></CustomHeader>

    <!-- 核心内容区 -->
    <view class="main-content" :style="{ paddingTop: statusBarHeight + 48 + 'px' }">
      <!-- 投注信息卡片 -->
      <BetInfoCard :info="info" defaultBetType="大小分"></BetInfoCard>

      <!-- 大小分赛事列表 -->
      <view class="match-list">
        <view v-for="(item, index) in selectedMatchList" :key="index" class="match-row">
          <!-- 上排：编号 + 队名VS队名 + 预设分数 -->
          <view class="match-header">
            <text class="serial-number">{{ item.serial_number || item.serialNumber || '-' }}</text>
            <text class="team-name">
              {{ item.visiting_name || item.visitingName || '-' }} 
              <span class="vs-text">VS</span> 
              {{ item.home_name || item.homeName || '-' }}
              <text class="goal-text">({{ item.dxf_goal || '-' }})</text>
            </text>
          </view>
          <!-- 下排：选中的大小分内容 -->
          <view class="selected-content">
            <text v-if="item.awaySelected" class="selected-item">大分{{ item.dxf_d_multiplier || '-' }}</text>
            <text v-if="item.homeSelected" class="selected-item">小分{{ item.dxf_x_multiplier || '-' }}</text>
            <text v-if="!item.awaySelected && !item.homeSelected">无选中投注内容</text>
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
import BetInfoCard from "@/pages/user/sub/BetInfoCard.vue";
import { purchasingLotteryConfirm, purchasingLotteryQueryById } from "@/api/demo";

export default {
  components: { CustomHeader, BetInfoCard },
  data() {
    return {
      selectedMatchList: [],
      info: {},
      id: "",
      statusBarHeight: 0
    };
  },
onLoad(options) {
  const id = options.id;
  this.id = id;
  purchasingLotteryQueryById({ id }).then((res) => {
    try {
      // ========== 仅修改这部分解析逻辑 ==========
      let rawList = JSON.parse(res.data.contentJson) || [];
      // 字段映射：把接口属性转成模板使用的属性名（不新增代码，只补全属性）
      this.selectedMatchList = rawList.map(item => ({
        ...item,
        // 核心：映射选中状态（接口→模板）
        awaySelected: item.isBigScore === 1 || item.is_big_score === 1, // 大分选中
        homeSelected: item.isSmallScore === 1 || item.is_small_score === 1, // 小分选中
        // 映射赔率/预设分/赛事信息（兼容接口不同命名）
        dxf_d_multiplier: item.dxf_d_multiplier || item.bigScoreOdds || item.dxfDMultiplier,
        dxf_x_multiplier: item.dxf_x_multiplier || item.smallScoreOdds || item.dxfXMultiplier,
        dxf_goal: item.dxf_goal || item.scoreGoal || item.dxfGoal,
        serial_number: item.serial_number || item.serialNumber,
        visiting_name: item.visiting_name || item.visitingName,
        home_name: item.home_name || item.homeName
      }));
      // ========== 解析逻辑修改结束 ==========
    } catch (e) {
      this.selectedMatchList = [];
      uni.showToast({ title: "数据解析失败", icon: "none" });
    }
    this.info = res.data;
  });
},
  created() {
    const sysInfo = uni.getWindowInfo ? uni.getWindowInfo() : uni.getSystemInfoSync();
    this.statusBarHeight = sysInfo.statusBarHeight;
  },
  methods: {
    // 返回上一页
    handleBack() {
      uni.navigateBack({ delta: 1 });
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
      purchasingLotteryConfirm({
        id: ticketId,
        lotteryImagePaths: photoUrl,
        status: 1
      }).then((res) => {
        uni.hideLoading();
        if (res.code == 200) {
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
              await purchasingLotteryConfirm({ id: this.id, status: 2 });
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
  padding-bottom: 120rpx;
  position: relative;
}

// 顶部导航固定
::v-deep .custom-header {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  z-index: 99 !important;
}

// 主内容区
.main-content {
  width: 100%;
  box-sizing: border-box;
  padding: calc(var(--status-bar-height) + 90rpx) 20rpx 0;
}

// 大小分赛事列表
.match-list {
  width: 100%;
  box-sizing: border-box;

  .match-row {
    background-color: #fff;
    border-radius: 8rpx;
    margin-bottom: 15rpx;
    padding: 20rpx;
    box-shadow: 0 2rpx 5rpx rgba(0,0,0,0.05);
    display: block !important;
  }

  // 上排：编号+队名
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

      .goal-text {
        font-size: 22rpx;
        color: #d92929;
        margin-left: 10rpx;
      }
    }
  }

  // 下排：选中内容
  .selected-content {
    text-align: center;
    font-size: 32rpx;
    color: #d92929;
    font-weight: 500;
    background: #f1f1f1;
    border-radius: 10rpx;
    padding: 16rpx 0;

    .selected-item {
      margin: 0 10rpx;
    }
  }

  // 空状态
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

// 底部固定按钮
.fixed-btn-area {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20rpx;
  background: #fff;
  z-index: 999;
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