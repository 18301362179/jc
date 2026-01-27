<template>
  <view class="scheme-edit-page">
    <!-- 顶部导航：保留原有 -->
    <CustomHeader  
      :ballTitle="'竞彩足球'"
      title="详情" 
      :showBack="true" 
      :showIcon="false" 
      @back-click="handleBack"></CustomHeader>

    <!-- 中间内容区：修改为index页面的样式结构 -->
    <view class="content-wrap">
      <scroll-view class="match-scroll" scroll-y>
        <!-- 替换：原顶部卡片改为组件引用 -->
        <view class="section section-1" >
          <view class="purchase-card-list" :style="{ paddingTop: statusBarHeight + 16 + 'px' }">
            <BetInfoCard :info="info" defaultBetType="足彩胜平负" />
          </view>
        </view>

        <!-- 第二部分：list的card（完全不动） -->
        <view class="section section-2">
          <view class="match-list">
            <view v-for="(item, index) in selectedMatchList" :key="index" class="match-row">
              <view class="match-category">
                <view class="league-name">{{ item.leagueName }}</view>
                <view class="league-name" style="display: flex; justify-content: flex-start; width: 100%"> <text class="single"></text>{{ item.serialNumber }}</view>
                <view class="match-time">{{ item.raceDate }}</view>
              </view>
              <view class="match-cells">
                <view class="match-cell home" :class="{ selected: item.isSelectWin }">
                  <view class="team-name">{{ item.homeName }}</view>
                  <text class="odds" v-if="item.winMultiplier">主胜{{ item.winMultiplier }}</text>
                  <text class="odds rate" v-if="item.homeWinRate"
                    >胜率{{ item.homeWinRate || "" }}</text
                  >
                </view>
                <view class="match-cell vs" :class="{ selected: item.isSelectDraw }">
                  <text class="vs-text">VS</text>
                  <text class="vs-odds" v-if="item.drawMultiplier">平{{ item.drawMultiplier }}</text>
                  <text class="vs-odds" v-if="item.drawRate">平率{{ item.drawRate }}</text>
                </view>
                <view class="match-cell away" :class="{ selected: item.isSelectLoss }">
                  <text class="team-name">{{ item.visitingName }}</text>
                  <text class="odds" v-if="item.lossMultiplier">客胜{{ item.lossMultiplier }}</text>
                  <text class="odds rate" v-if="item.visitingWinRate"
                    >胜率{{ item.visitingWinRate || "" }}</text
                  >
                </view>
              </view>
            </view>
            <view class="empty-tip" v-if="selectedMatchList.length === 0"> 暂无已选赛事 </view>
          </view>
        </view>

        <!-- 第三部分：操作按钮（完全不动） -->
        <view class="section section-3" v-if="info.status == 0">
          <view class="card-actions">
            <button class="action-btn confirm-btn" @click="handleConfirm(info.id)">上传照片</button>
            <button class="action-btn cancel-btn" @click="handleCancel">弃单</button>
          </view>
        </view>
      </scroll-view>
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
  // 以下所有脚本逻辑完全不动
  onLoad(options) {
    const id = options.id;
    this.id = id;
    purchasingLotteryQueryById({ id }).then((res) => {
      this.selectedMatchList = JSON.parse(res.data.contentJson);
      this.info = res.data;
    });
  },
  created() {
    if (uni.getWindowInfo) {
      const windowInfo = uni.getWindowInfo();
      this.statusBarHeight = windowInfo.statusBarHeight;
    } else {
      const systemInfo = uni.getSystemInfoSync();
      this.statusBarHeight = systemInfo.statusBarHeight;
    }
  },
  methods: {
handleConfirm(id) {
  uni.chooseImage({
    count: 1,
    sourceType: ['album', 'camera'],
    success: (res) => this.uploadSimple(res.tempFilePaths[0], id),
    fail: (err) => {
      console.error('选择照片失败：', err);
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
      console.error('上传接口失败：', err);
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
      uni.showToast({ title: '打票成功' });
      purchasingLotteryQueryById({ id: ticketId }).then((res) => {
        this.selectedMatchList = JSON.parse(res.data.contentJson);
        this.info = res.data;
      });
    } else {
      uni.showToast({ title: '提交失败：' + res.msg, icon: 'none' });
    }
  }).catch((err) => {
    uni.hideLoading();
    console.error('提交接口失败：', err);
    uni.showToast({ title: '提交失败，请重试', icon: 'none' });
  });
},
async handleCancel() {
  uni.showModal({
    title: "提示",
    content: "确认作废此代购?",
    showCancel: true,
    confirmText: "确认",
    cancelText: "取消",
    success: async (modalRes) => {
      if (modalRes.confirm) {
        try {
          await purchasingConfirm({ id: this.id, status: 2 });
          const res = await purchasingLotteryQueryById({ id: this.id });
          this.selectedMatchList = JSON.parse(res.data.contentJson);
          this.info = res.data;
          uni.showToast({ title: "作废成功", icon: "success" });
        } catch (error) {
          console.error("作废失败：", error);
          uni.showToast({ title: "操作失败，请重试", icon: "none" });
        }
      }
    },
  });
},
    handleBack() {
      uni.navigateBack({ delta: 1 });
    },
    handleGotoHome() {
      uni.navigateBack({ delta: 1 });
    },
  },
};
</script>

<style scoped lang="scss">
// 注意：删除原页面中top-card相关样式（已移到组件），其他样式完全不动
.scheme-edit-page {
  background-color: #f5f5f5;
  box-sizing: border-box;
  height: 100vh;
  margin: 0;
  padding: 0;
}

::v-deep .custom-header {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  z-index: 10 !important;
}

.content-wrap {
  height: calc(100vh - 90rpx);
  overflow: hidden;
}

.match-scroll {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding-top: 90rpx;

  .section {
    width: 100%;
    margin-bottom: 20rpx;
    padding: 0 20rpx;
    box-sizing: border-box;
  }

  .section-1 {
  }

  .section-2 {
  }

  .section-3 {
    padding-bottom: 30rpx;
  }
}

.match-list {
  overflow: hidden;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);

  .match-row {
    display: flex;
    background-color: #fff;
    border-bottom: 1rpx solid #3cb371;
    padding: 8rpx 20rpx 8rpx 20rpx;

    .match-category {
      width: 180rpx;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;

      .league-name {
        font-size: 24rpx;
        color: #777;
        margin-bottom: 6rpx;
        .single {
          display: inline-block;
          box-sizing: border-box;
          padding-left: 6rpx;
          width: 40rpx;
          color: #fff;
          text-align: left;
          border-top-right-radius: 15rpx;
          border-bottom-right-radius: 16rpx;
          margin-right: 10rpx;
        }
      }

      .match-time {
        font-size: 22rpx;
        color: #999;
      }
    }

    .match-cells {
      flex: 1;
      display: flex;
      border: 1rpx solid #66cdaa;
      border-radius: 8rpx;
      overflow: hidden;

      .match-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 16rpx 10rpx;
        cursor: pointer;
        transition: background-color 0.2s;

        &.home {
          width: 38%;
          border-right: 1rpx solid #eee;
        }

        &.vs {
          width: 22%;
          flex-direction: column;
          gap: 4rpx;

          .vs-text {
            font-size: 24rpx;
            font-weight: 400;
            color: #333;
            margin-bottom: 0;
          }
          .vs-odds {
            font-weight: 400;
            font-size: 24rpx;
            color: #999;
          }
        }
        &.away {
          width: 38%;
          border-left: 1rpx solid #eee;
        }

        &.selected {
          background-color: #d92929;
          color: #fff;
          .vs-text,
          .team-name,
          .vs-odds,
          .odds {
            color: #fff !important;
          }
        }

        .team-name {
          font-size: 24rpx;
          color: #666;
          margin-bottom: 8rpx;
          font-weight: 400;
          text-align: center;
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .odds {
          font-size: 24rpx;
          color: #999;
          margin-bottom: 4rpx;

          &.rate {
            color: #999;
            font-size: 22rpx;
          }
        }
      }
    }
  }

  .empty-tip {
    text-align: center;
    padding: 50rpx 0;
    font-size: 26rpx;
    color: #999;
    background-color: #fff;
    border-top: 1rpx solid #f2f2f2;
  }
}

::-webkit-scrollbar {
  display: none;
}

.purchase-card-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

// 操作按钮样式（移到最下方）
.card-actions {
  display: flex;
  gap: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  padding: 20rpx;

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
      background-color: #31926e;
      color: #fff;
    }

    &.cancel-btn {
      background-color: #f5f5f5;
      color: #666;
    }
  }
}
</style>