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
      <BetInfoCard :info="info" defaultBetType="胜分差"></BetInfoCard>

      <!-- 胜分差赛事列表 -->
      <view class="match-list">
        <view v-for="(item, index) in selectedMatchList" :key="index" class="match-row">
          <!-- 上排：单场标识+联赛名 + 队名VS队名 -->
          <view class="top-row">
            <view class="top-left">
              <view class="league-name-row">
                <text class="single-tag" v-if="item.is_sfc_single == 1">单</text>
                <text class="league-name">{{ item.league_name || '-' }}</text>
              </view>
            </view>
            <view class="top-right">
              <text class="team-vs">{{ item.visiting_name || '-' }} VS {{ item.home_name || '-' }}</text>
            </view>
          </view>
          <!-- 下排：编号+时间 + 选中的胜分差内容 -->
          <view class="bottom-row">
            <view class="bottom-left">
              <text class="serial-number">{{ item.serial_number || '-' }}</text>
              <!-- <text class="match-time">{{ item.race_date || '-' }}</text> -->
            </view>
            <view class="selected-content">
              <text v-if="item.selectedScores && item.selectedScores.length > 0" class="selected-text">
                {{ item.selectedScores.join(",") }}
              </text>
              <text v-else>无选中投注内容</text>
            </view>
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
      let rawList = JSON.parse(res.data.contentJson) || [];
      this.selectedMatchList = rawList.map(item => {
        // 1. 兼容接口不同的选中字段名（根据实际日志里的字段名调整）
        let selectedData = item.selectedScores || item.selectedScoreDiff || item.sfc_selected || [];
        
        // 2. 如果是字符串（比如"1-5,6-10"），转成数组
        if (typeof selectedData === 'string' && selectedData) {
          selectedData = selectedData.split(",");
        }
        
        // 3. 兜底：确保最终是数组
        const finalSelected = Array.isArray(selectedData) ? selectedData : [];

        return {
          ...item,
          is_sfc_single: item.is_sfc_single || item.isSfcSingle || 0,
          league_name: item.league_name || item.leagueName || '',
          visiting_name: item.visiting_name || item.visitingName || '',
          home_name: item.home_name || item.homeName || '',
          serial_number: item.serial_number || item.serialNumber || '',
          race_date: item.race_date || item.raceDate || '',
          selectedScores: finalSelected // 最终赋值给模板用的字段
        };
      });
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
          let rawList = JSON.parse(res.data.contentJson) || [];
          this.selectedMatchList = rawList.map(item => {
            let selectedData = item.selectedScores || item.selectedScoreDiff || item.sfc_selected || [];
            if (typeof selectedData === 'string' && selectedData) {
              selectedData = selectedData.split(",");
            }
            const finalSelected = Array.isArray(selectedData) ? selectedData : [];
            
            return {
              ...item,
              is_sfc_single: item.is_sfc_single || item.isSfcSingle || 0,
              league_name: item.league_name || item.leagueName || '',
              visiting_name: item.visiting_name || item.visitingName || '',
              home_name: item.home_name || item.homeName || '',
              serial_number: item.serial_number || item.serialNumber || '',
              race_date: item.race_date || item.raceDate || '',
              selectedScores: finalSelected
            };
          });
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
                // 弃单后数据解析也做字段映射
                let rawList = JSON.parse(res.data.contentJson) || [];
                this.selectedMatchList = rawList.map(item => ({
                  ...item,
                  is_sfc_single: item.is_sfc_single || item.isSfcSingle || 0,
                  league_name: item.league_name || item.leagueName || '',
                  visiting_name: item.visiting_name || item.visitingName || '',
                  home_name: item.home_name || item.homeName || '',
                  serial_number: item.serial_number || item.serialNumber || '',
                  race_date: item.race_date || item.raceDate || '',
                  selectedScores: Array.isArray(item.selectedScores) ? item.selectedScores : []
                }));
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

// 胜分差赛事列表
.match-list {
  width: 100%;
  box-sizing: border-box;

  .match-row {
    background-color: #fff;
    border-radius: 8rpx;
    margin-bottom: 15rpx;
    padding: 8rpx 20rpx;
    box-shadow: 0 2rpx 5rpx rgba(0,0,0,0.05);
    display: block !important;

    // 上排
    .top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;

      .top-left {
        flex-shrink: 0;

        .league-name-row {
          display: flex;
          align-items: center;

          .single-tag {
            display: inline-block;
            width: 40rpx;
            background: #b71c1c;
            color: #fff;
            text-align: center;
            border-top-right-radius: 15rpx;
            border-bottom-right-radius: 16rpx;
            margin-right: 10rpx;
            font-size: 20rpx;
            padding: 2rpx 0;
          }

          .league-name {
            font-size: 22rpx;
            color: #777;
          }
        }
      }

      .top-right {
        flex: 1;
        text-align: center;

        .team-vs {
          font-size: 28rpx;
          font-weight: 500;
          color: #333;
        }
      }
    }
// 下排
.bottom-row {
  display: flex;
  gap: 16rpx;
  align-items: center; // 新增：让两个子元素垂直居中对齐（高度一致）

  .bottom-left {
    width: 120rpx;
    display: flex;
    flex-direction: column;
    align-items: center; // 水平居中
    justify-content: center; // 垂直居中
    text-align: center; // 文字水平居中
    gap: 2rpx;
    flex-shrink: 0;
    padding: 16rpx 0; // 与 selected-content 保持相同上下内边距，确保高度一致

    .serial-number {
      font-size: 20rpx;
      color: #777;
      margin-bottom: 0; // 去掉底部间距，避免影响居中
      width: 100%;
    }
  }

  .selected-content {
    flex: 1;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1rpx solid #66cdaa;
    border-radius: 8rpx;
    padding: 16rpx 0;
    background: #f9f9f9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    min-width: 0;

    .selected-text {
      font-size: 28rpx;
      color: #d92929;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0 10rpx;
      width: 100%;
      display: block;
    }

    text {
      font-size: 28rpx;
      color: #999;
    }
  }
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