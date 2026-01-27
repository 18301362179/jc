<template>
  <view @touchstart="onTouchStart" 
    @touchend="onTouchEnd"
    style="width: 100%; height: 100vh; box-sizing: border-box;">
    <!-- 顶部导航 -->
    <CustomHeader
      :title="'4场进球'"
      :showBack="true"
      :isIndex="false"
      :showIcon="false"
      :isSelected="false"
      :selectedPlay="''"
      @funnel-click="handleFunnel"
      @back-click="onBackClick"
    />
    <!-- 期数选择组件 -->
    <DrawNumSelector
      :draw-num-list="drawNumList"
      :current-draw-num="currentDrawNum"
      :nav-bar-total-height="navBarTotalHeight"
      @draw-num-change="onDrawNumChange"
      @rule-click="handleFunnel"/>
    <!-- 滚动列表区域 -->
    <scroll-view 
      class="match-scroll" 
      scroll-y
      :style="{ 
        top: (navBarTotalHeight + 70 ) + 'rpx', // 动态适配期数选择器下方位置
        bottom: '90rpx' 
      }"
    >
      <List
        ref="spfRef"
        :drawer-list="drawerList"
        :status-bar-height="statusBarHeight"
        @toggle-select="toggleSelect"
        :go-to-ai-analysis="goToAiAnalysis"
      />
    </scroll-view>

    <!-- 底部投注栏组件 -->
    <BetBar
      :min-match-count="4"
      title="4场进球"       
      :show-clear-btn="true"
      :confirmBtnEnabled="true"
      :confirm-btn-enabled="selectedMatchCount >= 4"
      :selected-count="selectedMatchCount"
      @clear="handleClearAll"
      @confirm="goToSchemeEdit"
    />

    <!-- 必要的弹窗组件 -->
    <TipsPopup
      :visible.sync="isPopupShow"
      :title="tipsTitle"
      :content-list="tipsContentList"
      :header-height="headerHeight"
      :popup-width="700"
      border-color="#07c160"
      @close="handlePopupClose"
      :max-height="popupMaxHeight"
    />
    <EmptyStop 
      :hasData="!hasData" 
    />
    <ReminderDialog :isShow="isDialogShow" @cancel="handleCancel" @exchange="handleRecharge" />
  </view>
</template>

<script>
// 核心组件引入
import List from "@/pages/fourIndex/list.vue";
import CustomHeader from "@/components/CustomHeader.vue";
import ReminderDialog from "@/pages/commn/ReminderDialog.vue";
import TipsPopup from "@/pages/commn/playTip";
import EmptyStop from '@/pages/commn/emptyStop.vue';
import BetBar from "@/pages/commn/betBar/index.vue";
import DrawNumSelector from '@/pages/commn/DrawNumSelector/index.vue'
// API和工具函数引入
import { footballLotteryTradition, checkSelect, recharge,footballLotteryTraditionDrawNum } from "@/api/demo";
import { formatTimeToMDWeekHM } from "@/utils/data";

export default {
  components: {
    List,
    CustomHeader,
    ReminderDialog,
    TipsPopup,
    EmptyStop,
    BetBar,
    DrawNumSelector
  },
  data() {
    return {
      currentDrawNum: '', // 当前选中的期数
      drawNumList: [], // 期数列表（从接口data.drawNumList获取）
      currentPlay: "胜平负",
      isPopupShow: false,
      drawerList: [],
      isLoading: false,
      headerHeight: 0,
      isDialogShow: false,
      statusBarHeight: 0,
      playTypeMap: {
        "胜平负": "spf"
      },
      isRefreshing: false,
      // 提示弹窗配置
      tipsTitle: "重要提示",
      tipsContentList: [
        "1、挑选胜率差较大的比赛，进入《分析》查看对战情况、近期表现等因素综合评估预测比赛（半年内的数据采信度比较高）。",
        "2、建议选择欧洲五大联赛、各洲杯赛等不容易被操纵的比赛作为参考目标。",
        "3、本软件提供竞彩足球、竞彩篮球比赛胜负、比分预测以及详细球队对比信息，预测数据仅供参考。",
        "4、本系统预测数据仅供参考，无准确率保证。",
        "5、建议多处验证一下比赛预测结果，多方比较后得到的结论更可信。",
        "6、本系统处于公测阶段，有任何好的提议或意见请加入《数算体育》微信群进行交流指导。",
        "7、关于体彩相关玩法、规则请到中国体育彩票网站或app自行参阅。",
        "8、每天上午11点10分后本应用正式可用。"
      ],
      windowHeight: 0,
      windowWidth: 0,
      popupMaxHeight: 0,
      touchStartX: 0,
      swipeThreshold: 50,
      hasData: false,
      navBarTotalHeight: 88 // 🌟 补全缺失的变量声明，兜底默认值
    };
  },
  async onPullDownRefresh() {
    try {
      this.isRefreshing = true;
      await this.loadMatchData();
    } catch (err) {
      console.error("下拉刷新失败：", err);
      uni.showToast({ title: "刷新失败", icon: "none" });
    } finally {
      this.isRefreshing = false;
      uni.stopPullDownRefresh();
    }
  },
  computed: {
    targetLotteryType() {
      return this.playTypeMap[this.currentPlay] || "spf";
    },
    // 选中场次计数：只要主/客有一个比分被选中（数组长度>0），即算该场次选中
    selectedMatchCount() {
      let count = 0;
      this.drawerList.forEach(function(drawer) {
        drawer.lotteryList.forEach(function(item) {
          if (item.homeScoreSelected.length > 0 || item.awayScoreSelected.length > 0) count++;
        });
      });
      return count;
    }
  },
  watch: {
    currentPlay(newVal) {
      this.loadMatchData();
    }
  },
  created() {
    // 统一获取系统信息，兼容多端
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight;
    this.windowWidth = systemInfo.windowWidth;
    this.windowHeight = systemInfo.windowHeight;
    
    // 🌟 计算导航栏总高度（适配所有机型）
    this.calcNavBarTotalHeight();
  },
  mounted() {
    this.calcHeaderHeight();
    this.calcPopupMaxHeight();
  },
  onShow() {
    const editedData = uni.getStorageSync("editedMatchData");
    if (editedData) {
      let parsedData = editedData;
      if (typeof editedData === "string") {
        parsedData = JSON.parse(editedData);
      }
      this.syncUpdatedMatches(parsedData);
      uni.removeStorageSync("editedMatchData");
    } else {
      // 初始化清空期数，重新请求最新数据
      this.drawNumList = [];
      this.currentDrawNum = '';
      this.loadMatchData();
    }
  },
  methods: {
    calcNavBarTotalHeight() {
      const systemInfo = uni.getSystemInfoSync();
      // 1. 获取状态栏高度（px）
      const statusBarHeight = systemInfo.statusBarHeight || 0;
      // 2. 自定义导航栏高度（通常是44px，小程序默认导航栏高度）
      const navBarHeight = 44;
      // 3. 转成rpx（px转rpx公式：px * 750 / 屏幕宽度）
      const totalHeightPx = statusBarHeight + navBarHeight;
      const totalHeightRpx = Math.round(totalHeightPx * 750 / (systemInfo.windowWidth || 375));
      // 4. 赋值（如果CustomHeader是自定义高度，替换navBarHeight为实际值）
      this.navBarTotalHeight = totalHeightRpx;
    },
    // 期数切换回调：接收子组件传递的选中期数，重新加载对应数据
    onDrawNumChange(num) {
      // 过滤空值，避免无效切换
      if (!num || num.trim() === "") return;
      
      // 1. 先更新当前选中的期数（响应式）
      this.currentDrawNum = num;
      
      // 2. 立即提示用户正在切换期数（提升体验）
      uni.showToast({
        title: "切换至" + num + "期",
        icon: "none",
        duration: 800
      });

      // 3. 重新加载对应期数的赛事数据（核心逻辑）
      this.loadMatchData(num)
        .catch(function(err) {
          // 4. 异常处理：加载失败时回退到原期数
          console.error("切换期数失败：", err);
          uni.showToast({
            title: "加载" + num + "期数据失败",
            icon: "none"
          });
          // 回退到切换前的期数（避免显示空数据）
          if (this.drawNumList.length > 0) {
            this.currentDrawNum = this.drawNumList[0];
          }
        }.bind(this));
    },
    onBackClick(){
      uni.navigateBack({
        delta: 1 // 返回的页面数，默认为1
      });
    },
    // 清空所有选中：主/客比分选中状态重置为空数组
    handleClearAll() {
      this.drawerList.forEach(function(drawer, drawerIdx) {
        drawer.lotteryList.forEach(function(item, matchIdx) {
          this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "homeScoreSelected", []);
          this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "awayScoreSelected", []);
        }.bind(this));
      }.bind(this));
      uni.showToast({
        title: "已清空选择",
        icon: "success"
      });
    },
    onTouchStart(e) {
      this.touchStartX = e.changedTouches[0].clientX;
    },
    onTouchEnd(e) {
      const touchEndX = e.changedTouches[0].clientX;
      const diffX = touchEndX - this.touchStartX;
      if (Math.abs(diffX) < this.swipeThreshold) return;
    },
    calcPopupMaxHeight() {
      const systemInfo = uni.getSystemInfoSync();
      let windowHeight = systemInfo.windowHeight;
      let safeAreaInsets = systemInfo.safeAreaInsets || { bottom: 0 };
      let safeAreaBottom = safeAreaInsets.bottom || 0;
      this.popupMaxHeight = windowHeight - safeAreaBottom - this.headerHeight - 90;
      // #ifdef MP-WEIXIN
      let safeArea = systemInfo.safeArea || { height: 0 };
      let safeAreaHeight = safeArea.height || this.popupMaxHeight;
      this.popupMaxHeight = Math.min(this.popupMaxHeight, safeAreaHeight - 90);
      // #endif
    },
    handlePopupClose() {
      this.isPopupShow = false;
    },
    // 获取选中的比赛列表（整场次选中）
    getSelectedMatches() {
      const selected = [];
      this.drawerList.forEach(function(drawer) {
        drawer.lotteryList.forEach(function(item) {
          const isSelected = item.homeScoreSelected.length > 0 || item.awayScoreSelected.length > 0;
          if (isSelected) {
            selected.push(item);
          }
        });
      });
      return selected;
    },
    // 跳转到方案编辑页
    async goToSchemeEdit() {
      try {
        const selectedMatches = this.getSelectedMatches();
        const totalSelectedCount = selectedMatches.length;
        
        if (totalSelectedCount !== 4) { // 强制等于4，满足“必须选满4场”
          uni.showToast({ title: "请选择4场赛事", icon: "none" });
          return;
        }

        const matchIds = selectedMatches.map(function(item) {
          return item.id;
        }).join(",");
        this.showLoading();
        const res = await checkSelect({ lotteryIds: matchIds });
        // 兼容无res.data的情况，替换?.
        let isNeedUserPhone = 1;
        if (res.data && res.data.isNeedUserPhone !== undefined) {
          isNeedUserPhone = res.data.isNeedUserPhone;
        }
        
        if (res.data) {
          await uni.navigateTo({
            url: "/pages/edit/football/index",
            events: { updateSelectedMatches: function(updatedData) {
              this.syncUpdatedMatches(updatedData);
            }.bind(this) },
            success: function(res) {
              res.eventChannel.emit("selectedData", { 
                matches: selectedMatches, 
                isNeedUserPhone: isNeedUserPhone,
                comboText: totalSelectedCount + "串1",
              });
            }.bind(this)
          });
        } else {
          uni.showModal({
            title: "提示",
            content: "抱歉存在停场次，请重新选择！",
            showCancel: false,
            confirmText: "我知道了",
            success: function(modalRes) {
              if (modalRes.confirm) {
                this.drawerList = [];
                this.loadMatchData();
              }
            }.bind(this)
          });
        }
      } catch (error) {
        console.error("checkSelect接口调用失败:", error);
        uni.showModal({
          title: "错误",
          content: "验证失败，请稍后重试",
          showCancel: false,
          confirmText: "我知道了",
          success: function(modalRes) {
            if (modalRes.confirm) {
              this.drawerList = [];
              this.loadMatchData();
            }
          }.bind(this)
        });
      } finally {
        this.hideLoading();
      }
    },
    // 同步更新选中状态（适配多选数组格式）
    syncUpdatedMatches(updatedData) {
      // 兼容无updatedData/updatedData.matches的情况，替换?.
      if (!updatedData || !updatedData.matches) return;
      // 先清空所有选中状态（重置为空数组）
      this.drawerList.forEach(function(drawer, drawerIdx) {
        drawer.lotteryList.forEach(function(item, matchIdx) {
          this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "homeScoreSelected", []);
          this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "awayScoreSelected", []);
        }.bind(this));
      }.bind(this));
      // 同步新的选中状态（数组格式）
      updatedData.matches.forEach(function(updatedItem) {
        this.drawerList.forEach(function(drawer, drawerIdx) {
          const targetMatchIdx = drawer.lotteryList.findIndex(function(item) {
            return item.id === updatedItem.id;
          });
          if (targetMatchIdx !== -1) {
            // 确保是数组格式
            const homeSelections = Array.isArray(updatedItem.homeScoreSelected) 
              ? updatedItem.homeScoreSelected 
              : [];
            const awaySelections = Array.isArray(updatedItem.awayScoreSelected) 
              ? updatedItem.awayScoreSelected 
              : [];
              
            this.$set(this.drawerList[drawerIdx].lotteryList[targetMatchIdx], "homeScoreSelected", homeSelections);
            this.$set(this.drawerList[drawerIdx].lotteryList[targetMatchIdx], "awayScoreSelected", awaySelections);
          }
        }.bind(this));
      }.bind(this));
    },
    // 子组件选中事件回调：同步比分选中状态（适配数组）
    toggleSelect(targetItem, key) {
      this.drawerList.forEach(function(drawer, drawerIdx) {
        const matchIdx = drawer.lotteryList.findIndex(function(item) {
          return item.id === targetItem.id;
        });
        if (matchIdx !== -1) {
          // 深拷贝数组确保响应式
          this.$set(drawer.lotteryList[matchIdx], key, [].concat(drawer.lotteryList[matchIdx][key]));
        }
      }.bind(this));
    },
    handleRecharge() {
      uni.navigateTo({ 
        url: "/pages/recharge/recharge?beFrom=football&isLottery=1"
      });
      this.isDialogShow = false;
    },
    handleCancel() {
      this.isDialogShow = false;
    },
    // 核心：适配接口原始数据格式，初始化比分选中状态为数组（兼容无?.）
    async loadMatchData(drawNum = '') {
      try {
        this.drawerList = [];
        this.isLoading = true;
        this.showLoading();
        // 请求参数：传递期数，兼容无传入的情况
        const reqParams = { playMethod: 4 };
        
        // 1. 请求期数列表并过滤空值
        const resNum =  await footballLotteryTraditionDrawNum({playMethod: 4});
        // 🌟 过滤空字符串，只保留有效期数
        this.drawNumList = (resNum && resNum.data ? resNum.data : []).filter(function(num) {
          return num && num.trim() !== "";
        });
        
        // 2. 赋值请求期数（优先用传入的，无则用过滤后的第一个有效期数）
        let targetDrawNum = drawNum || this.currentDrawNum;
        if (!targetDrawNum && this.drawNumList.length > 0) {
          targetDrawNum = this.drawNumList[0];
        }
        if (targetDrawNum) {
          reqParams.drawNum = targetDrawNum;
          // 初始化当前选中的期数
          this.currentDrawNum = targetDrawNum;
        }

        // 3. 请求赛事列表（兼容返回数组的情况）
        const res = await footballLotteryTradition(reqParams);
        // 🌟 适配赛事列表返回数组的场景
        let matchData = [];
        if (Array.isArray(res)) {
          matchData = res; // 返回的是数组直接使用
        } else if (res && res.data) {
          matchData = res.data.dataList || res.data || []; // 兼容原对象格式
        }
        
        // 4. 格式化赛事列表
        this.drawerList = this.formatDrawerList(matchData, this.currentDrawNum);
        this.hasData = this.drawerList.length > 0;
        if (!this.hasData) {
          uni.showToast({ title: "暂无赛事数据", icon: "none" });
        }
      } catch (err) {
        console.error("加载赛事失败:", err);
        uni.showToast({ title: "加载失败，请重试", icon: "none" });
        this.hasData = false;
      } finally {
        this.isLoading = false;
        this.hideLoading();
      }
    },
    // 🌟 重构：适配数组格式的赛事列表，参数1为赛事数组，参数2为期数
    formatDrawerList(matchArray, drawNum) {
      // 兼容无赛事数据的情况
      if (!Array.isArray(matchArray) || matchArray.length === 0) return [];
      
      // 1. 拼接统一的Title
      const totalCount = matchArray.length;
      // 取第一个赛事的截止时间（如果有）
      let endTime = "";
      if (matchArray[0] && matchArray[0].sale_end_time) {
        endTime = matchArray[0].sale_end_time;
      }
      const unifiedTitle = drawNum + "期 |  共" + totalCount + "场比赛 " + "截止时间：" + endTime;

      // 2. 处理所有比赛数据，保留原始字段+初始化选中状态
      const allMatches = matchArray.map(function(item) {
        // 初始化选中数组，防止无此字段的情况
        item.homeScoreSelected = item.homeScoreSelected || [];
        item.awayScoreSelected = item.awayScoreSelected || [];
        return item;
      });

      // 3. 返回单抽屉结构（只有一个Title）
      return [{
        title: unifiedTitle,
        lotteryList: allMatches
      }];
    },
    calcHeaderHeight() {
      const systemInfo = uni.getSystemInfoSync();
      const statusBarHeight = systemInfo.statusBarHeight || 0;
      const customHeaderHeight = (88 / 750) * (systemInfo.windowWidth || 375);
      this.headerHeight = statusBarHeight + customHeaderHeight;
    },
    handleFunnel() {
      this.isPopupShow = true;
    },
    async goToAiAnalysis(item) {
      try {
        this.showLoading();
        const reqParams = {
          id: item.id,
          beFrom: 'football',
          serialNumber: item.serial_number || '',
          isLottery: 1
        };
        const res = await recharge(reqParams);
        // 兼容无res.data的情况
        if (res && res.data) {
          this.isDialogShow = true;
          this.hideLoading();
          return;
        }
        await uni.navigateTo({ 
          url: "/pages/test/index?id=" + item.id + "&isLottery=1&serialNumber=" + reqParams.serialNumber + "&beFrom=" + reqParams.beFrom
        });
      } catch (err) {
        console.error('[AI分析] 失败:', err);
        uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
      } finally {
        this.hideLoading();
      }
    },
    showLoading() {
      uni.showLoading({
        title: "加载中...",
        mask: true,
      });
    },
    hideLoading() {
      uni.hideLoading();
    },
  },
};
</script>

<style scoped lang="scss">
page {
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

.match-scroll {
  touch-action: pan-y;
  position: absolute !important;
  left: 0;
  right: 0;
  width: 100% !important;
  overflow-y: auto !important;
  background-color: #f5f5f5;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  // APP端适配
  // #ifdef APP-PLUS
  height: calc(100vh - var(--status-bar-height) - 90rpx - 70rpx) !important;
  // #endif
  // 非APP端适配：删除固定top，改用动态绑定
  // #ifndef APP-PLUS
  bottom: 90rpx !important;
  // #endif
}
.match-scroll::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

// 提示弹窗样式
::v-deep .tips-container {
  width: 100%;
  box-sizing: border-box;
  padding: 10rpx 0;
}
::v-deep .tips-title {
  font-size: 32rpx;
  color: #d92929;
  font-weight: bold;
  margin-bottom: 20rpx;
  text-align: center;
}
::v-deep .tips-list {
  width: 100%;
}
::v-deep .tips-item {
  font-size: 26rpx;
  color: #333;
  line-height: 1.8;
  margin-bottom: 16rpx;
  text-align: justify;
  padding: 0 10rpx;
  word-break: break-all;
}
::v-deep .tips-item:last-child {
  margin-bottom: 0;
}

// 弹窗按钮栏
.popup-btn-bar {
  display: flex;
  padding: 20rpx 24rpx;
  gap: 20rpx;
  background-color: #fff;
  margin-top: 20rpx;
  box-sizing: border-box;

  .popup-btn {
    flex: 1;
    height: 80rpx;
    border-radius: 8rpx;
    font-size: 30rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    transition: all 0.2s ease;
  }
  .cancel-btn {
    background-color: #fff;
    color: #666;
    border: 1rpx solid #ddd;
    &:hover { background-color: #f5f5f5; }
    &:active { background-color: #eee; }
  }
  .confirm-btn {
    background-color: #d92929;
    color: #fff;
    border: none;
    &:hover { background-color: #c62828; }
    &:active { background-color: #b71c1c; }
  }
}

// 原生tabbar适配
::v-deep .native-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 9;
}

// 隐藏滚动条
::-webkit-scrollbar {
  display: none;
}

// 模态框样式
.uni-modal-wrapper .uni-modal {
  border-radius: 20rpx !important;
  background-color: #fff !important;
}
.uni-modal-wrapper .uni-modal-header {
  font-size: 32rpx !important;
  color: #d92929 !important;
  font-weight: bold !important;
}
.uni-modal-wrapper .uni-modal-body {
  font-size: 28rpx !important;
  color: #666 !important;
  padding: 30rpx 20rpx !important;
}
.uni-modal-wrapper .uni-modal-footer .uni-modal-btn {
  border-radius: 40rpx !important;
}
.uni-modal-wrapper .uni-modal-footer .uni-modal-btn.uni-modal-confirm {
  background-color: #d92929 !important;
  color: #fff !important;
}
</style>