<template>
  <view @touchstart="onTouchStart" 
    @touchend="onTouchEnd"
    style="width: 100%; height: 100vh; box-sizing: border-box;">
    <!-- 顶部导航 -->
    <CustomHeader
      :title="'14'"
      :showBack="true"
      :isIndex="false"
      :showIcon="false"
      :isSelected="false"
      :selectedPlay="''"
      @funnel-click="handleFunnel"
      @back-click="onBackClick"
    />
    <!-- 🌟 新增：期数选择组件（和4/6/9场一致） -->
    <DrawNumSelector
      :title="title"
      :draw-num-list="drawNumList"
      :current-draw-num="currentDrawNum"
      :nav-bar-total-height="navBarTotalHeight"
      @draw-num-change="onDrawNumChange"
      @rule-click="handleFunnel"/>

    <!-- 滚动列表区域：修改top为动态绑定 -->
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

    <!-- 底部投注栏组件：保留14场核心规则 -->
    <BetBar
      :min-match-count="14"
      title="胜负"       
      :show-clear-btn="true"
      :confirmBtnEnabled="true"
      :confirm-btn-enabled="selectedMatchCount >= 9"
      :selected-count="selectedMatchCount"
      @clear="handleClearAll"
      @confirm="goToSchemeEdit"
    />

    <!-- 必要的弹窗组件：保持原有 -->
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
        
  </view>
</template>

<script>
// 核心组件引入：🌟 新增DrawNumSelector
import List from "@/pages/fourteenIndex/list.vue";
import CustomHeader from "@/components/CustomHeader.vue";
import TipsPopup from "@/pages/commn/playTip";
import EmptyStop from '@/pages/commn/emptyStop.vue';
import BetBar from "@/pages/commn/betBar/index.vue";
import DrawNumSelector from '@/pages/commn/DrawNumSelector/index.vue' // 新增期数组件

// API和工具函数引入：🌟 新增footballLotteryTraditionDrawNum
import { footballLotteryTradition, checkSelect, recharge, footballLotteryTraditionDrawNum } from "@/api/demo";
import { formatTimeToMDWeekHM } from "@/utils/data";


export default {
   
  components: {
    List,
    CustomHeader,
    TipsPopup,
    EmptyStop,
    BetBar,
    DrawNumSelector, // 注册期数组件
    
  },
  data() {
    return {
      // 🌟 新增期数相关变量（和4/6/9场一致）
      currentDrawNum: '', 
      drawNumList: [], 
      navBarTotalHeight: 88, // 兜底默认值
      
      currentPlay: "胜平负",
      isPopupShow: false,
      drawerList: [],
      isLoading: false,
      headerHeight: 0,
      statusBarHeight: 0,
      playTypeMap: {
        "胜平负": "spf"
      },
      isRefreshing: false,
      // 提示弹窗配置：保留原有
      tipsTitle: "重要提示",
      tipsContentList: [
        "1、挑选胜差较大的比赛，进入《分析》查看对战情况、近期表现等因素综合评估预测比赛（半年内的数据采信度比较高）。",
        "2、建议选择欧洲五大联赛、各洲杯赛等不容易被操纵的比赛作为参考目标。",
        "3、本软件提供足球、篮球比赛胜负、比分预测以及详细球队对比信息，预测数据仅供参考。",
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
      title:""
    };
  },
    onLoad() {
  // 强制显示分享菜单，立刻解除置灰
  wx.showShareMenu({
    menus: ['shareAppMessage', 'shareTimeline']
  })
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
    // 保留14场原有选中计数逻辑（3/1/0任意一个选中算一场）
    selectedMatchCount() {
      let count = 0;
      this.drawerList.forEach((drawer) => {
        drawer.lotteryList.forEach((item) => {
          if (item.homeSelected || item.vsSelected || item.awaySelected) count++;
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
    const systemInfo = wx.getWindowInfo();
    this.statusBarHeight = systemInfo.statusBarHeight;
    this.windowWidth = systemInfo.windowWidth;
    this.windowHeight = systemInfo.windowHeight;
    // 🌟 新增：计算导航栏总高度（统一模板）
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
      // 初始化清空期数，重新请求最新数据（统一模板）
      this.drawNumList = [];
      this.currentDrawNum = '';
      this.loadMatchData();
    }
  },
  methods: {
    // 🌟 新增：计算导航栏总高度（和4/6/9场完全一致）
    calcNavBarTotalHeight() {
      const systemInfo = wx.getWindowInfo();
      const statusBarHeight = systemInfo.statusBarHeight || 0;
      const navBarHeight = 44;
      const totalHeightPx = statusBarHeight + navBarHeight;
      const totalHeightRpx = Math.round(totalHeightPx * 750 / (systemInfo.windowWidth || 375));
      this.navBarTotalHeight = totalHeightRpx;
    },
    // 🌟 新增：期数切换回调（统一模板逻辑）
    onDrawNumChange(num) {
      if (!num || num.trim() === "") return;
      
      this.currentDrawNum = num;
      
      uni.showToast({
        title: "切换至" + num + "期",
        icon: "none",
        duration: 800
      });

      this.loadMatchData(num)
        .catch(function(err) {
          console.error("切换期数失败：", err);
          uni.showToast({
            title: "加载" + num + "期数据失败",
            icon: "none"
          });
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
    // 保留14场原有清空逻辑
    handleClearAll() {
      this.drawerList.forEach((drawer, drawerIdx) => {
        drawer.lotteryList.forEach((item, matchIdx) => {
          this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "homeSelected", false);
          this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "vsSelected", false);
          this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "awaySelected", false);
        });
      });
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
      const systemInfo = wx.getWindowInfo();
      const { windowHeight, safeAreaInsets } = systemInfo;
      this.popupMaxHeight = windowHeight - safeAreaInsets.bottom - this.headerHeight - 90;
      // #ifdef MP-WEIXIN
      this.popupMaxHeight = Math.min(this.popupMaxHeight, systemInfo.safeArea.height - 90);
      // #endif
    },
    handlePopupClose() {
      this.isPopupShow = false;
    },
    // 保留14场原有获取选中赛事逻辑
    getSelectedMatches() {
      const selected = [];
      this.drawerList.forEach((drawer) => {
        drawer.lotteryList.forEach((item) => {
          const isSelected = !!item.homeSelected || !!item.vsSelected || !!item.awaySelected;
          if (isSelected) {
            selected.push(item);
          }
        });
      });
      return selected;
    },
    // 保留14场核心投注逻辑（选9场即可），仅修正comboText为14串1
    async goToSchemeEdit() {
      try {
        const selectedMatches = this.getSelectedMatches();
        const totalSelectedCount = selectedMatches.length;
        if (totalSelectedCount < 14) {
          uni.showToast({ title: "请至少选择14场赛事", icon: "none" });
          return;
        }
          await uni.navigateTo({
            url: `/pages/fourteenIndex/editFourteen`,
            events: { updateSelectedMatches: (updatedData) => this.syncUpdatedMatches(updatedData) },
            success: (res) => {
              res.eventChannel.emit("selectedData", { 
                matches: selectedMatches, 
                isNeedUserPhone,
                comboText: "14串1", // 🌟 修正：14场对应14串1
              });
            },
          });
      } catch (error) {
        console.error("checkSelect接口调用失败:", error);
        uni.showModal({
          title: "错误",
          content: "验证失败，请稍后重试",
          showCancel: false,
          confirmText: "我知道了",
          success: (modalRes) => {
            if (modalRes.confirm) {
              this.drawerList = [];
              this.loadMatchData();
            }
          },
        });
      } finally {
        this.hideLoading();
      }
    },
    // 保留14场原有同步选中状态逻辑
    syncUpdatedMatches(updatedData) {
      if (!updatedData || !updatedData.matches) return;
      this.drawerList.forEach((drawer, drawerIdx) => {
        drawer.lotteryList.forEach((item, matchIdx) => {
          this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "homeSelected", false);
          this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "vsSelected", false);
          this.$set(this.drawerList[drawerIdx].lotteryList[matchIdx], "awaySelected", false);
        });
      });
      updatedData.matches.forEach((updatedItem) => {
        this.drawerList.forEach((drawer, drawerIdx) => {
          const targetMatchIdx = drawer.lotteryList.findIndex((item) => item.id === updatedItem.id);
          if (targetMatchIdx !== -1) {
            this.$set(this.drawerList[drawerIdx].lotteryList[targetMatchIdx], "homeSelected", updatedItem.homeSelected || false);
            this.$set(this.drawerList[drawerIdx].lotteryList[targetMatchIdx], "vsSelected", updatedItem.vsSelected || false);
            this.$set(this.drawerList[drawerIdx].lotteryList[targetMatchIdx], "awaySelected", updatedItem.awaySelected || false);
          }
        });
      });
    },
    // 保留14场原有选中同步逻辑
    toggleSelect(targetItem, key) {
      this.drawerList.forEach((drawer, drawerIdx) => {
        const matchIdx = drawer.lotteryList.findIndex((item) => item.id === targetItem.id);
        if (matchIdx !== -1) {
          this.$set(drawer.lotteryList[matchIdx], key, targetItem[key]);
        }
      });
    },
    // 🌟 核心修改：loadMatchData兼容期数参数（统一模板逻辑）
    async loadMatchData(drawNum = '') {
      try {
        this.drawerList = [];
        this.isLoading = true;
        this.showLoading();
        // 请求参数：传递期数，兼容无传入的情况
        const reqParams = { playMethod: 14 };
        
        // 1. 请求期数列表并过滤空值（统一模板）
        const resNum =  await footballLotteryTraditionDrawNum({playMethod: 14});
        
        if (resNum.data&& resNum.data.length == 0) {return;}
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
          this.currentDrawNum = targetDrawNum;
        }

        // 3. 请求赛事列表（兼容返回数组的情况，统一模板）
        const res = await footballLotteryTradition(reqParams);
          if (res.data && res.data.length > 0) {
            this.title = "截止时间：" + res.data[0].sale_end_time;
          };
          
        // 4. 格式化赛事列表（保持14场原有初始化逻辑，仅对齐格式）
        this.drawerList = this.formatDrawerList(res.data, this.currentDrawNum);
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
    // 🌟 调整formatDrawerList，对齐统一模板的格式
    formatDrawerList(matchArray, drawNum) {
      if (!Array.isArray(matchArray) || matchArray.length === 0) return [];
      
      // 1. 拼接统一的Title（新增截止时间，对齐4/6/9场）
      const totalCount = matchArray.length;
      let endTime = "";
      if (matchArray[0] && matchArray[0].sale_end_time) {
        endTime = matchArray[0].sale_end_time;
      }
      const unifiedTitle = drawNum + "期 |  共" + totalCount + "场比赛 " + "截止时间：" + endTime;

      // 2. 处理所有比赛数据，保留14场原有胜平负初始化逻辑
      const allMatches = matchArray.map(item => ({
        ...item,
        homeSelected: false, // 3（主胜）
        vsSelected: false,   // 1（平）
        awaySelected: false  // 0（客胜）
      }));

      // 3. 返回单抽屉结构（统一模板）
      return [{
        title: unifiedTitle,
        lotteryList: allMatches
      }];
    },
    calcHeaderHeight() {
      const systemInfo = wx.getWindowInfo();
      const statusBarHeight = systemInfo.statusBarHeight;
      const customHeaderHeight = (88 / 750) * systemInfo.windowWidth;
      this.headerHeight = statusBarHeight + customHeaderHeight;
    },
    handleFunnel() {
      this.isPopupShow = true;
    },
    // 保留14场原有AI分析逻辑
    async goToAiAnalysis(item) {
      try {
        this.showLoading();
        const reqParams = {
          id: item.id,
          isLottery: 1,
          isTradition: 1,
          beFrom:"football",
          serialNumber: item.draw_num,
          dateStr: item.match_num
        };
    // 调用recharge接口
    const res = await recharge(reqParams);
    if (res.data.status == 'fail') {
          this.hideLoading();
          uni.showModal({
                title: "提示",
                content: "您的服务币不足，请获取！",
                cancelText: "取消",
                confirmText: "获取",
                confirmColor: "#d92929",
                success: (res) => {
                  if (res.confirm) {
                    
                    uni.navigateTo({ url: `/pages/recharge/recharge?beFrom=basketball&isLottery=1` });
                  }
                }
              });
        return;
    } else {
            // 有灵石，正常跳转分析页
          await uni.navigateTo({
            url: `/pages/test/index?id=${item.id}&isLottery=1&isTradition=1`,
          });
    }
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

// 🌟 修改scroll-view样式，对齐统一模板（删除原有多端适配）
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
  // 隐藏滚动条
  ::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
}

// 提示弹窗样式：保留原有
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

// 弹窗按钮栏：保留原有
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

// 原生tabbar适配：保留原有
::v-deep .native-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 9;
}

// 隐藏滚动条：保留原有
::-webkit-scrollbar {
  display: none;
}

// 模态框样式：保留原有
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