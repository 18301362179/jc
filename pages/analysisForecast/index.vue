<template>
  <view class="con" :style="{ height: pageHeight + 'px' }" @touchstart="onTouchStart" 
    @touchend="onTouchEnd"
    style="width: 100%; height: 100vh; box-sizing: border-box;">
    <!-- 顶部筛选区（固定不滚动） -->
    <view class="top" ref="top">
      <!-- 大洲名 -->
      <view class="continent-container">
        <view 
          v-for="(item, index) in continentList" 
          :key="index" 
          :class="['continent-item', { active: currentContinentIndex === index }]" 
          @click="handleClickContinent(index)"
        >
          {{ item.continentName }}
          <view class="corner-mark" v-if="currentContinentIndex === index"></view>
        </view>
      </view>
      
      <!-- 世界排名专属tab（仅点击世界排名时显示） -->
      <view v-if="isWorldRanking" class="world-rank-wrap">
        <!-- 排名类型tab -->
        <view class="tab-container">
          <scroll-view scroll-x class="tab-scroll" scroll-with-animation>
            <view 
              v-for="(item, index) in worldRankTypeList" 
              :key="index" 
              class="tab-item" 
              :class="{ active: worldRankTypeIndex === index }" 
              @tap="clickWorldRankType(index, item)"
            >
              {{ item }}
            </view>
          </scroll-view>
        </view>
        
        <!-- 替换为子组件的搜索框（原父组件搜索按钮位置） -->
        <view class="search-box">
          <input 
            v-model="searchKeyword" 
            type="text" 
            placeholder="请输入球队/国家名称搜索" 
            class="search-input"
            @confirm="handleSearch"
            @input="debounceSearch"
          />
        </view>
      </view>
      
      <!-- 原有筛选区（仅非世界排名时显示） -->
      <view v-else>
        <!-- 原有逻辑不变 -->
        <view class="tab-container">
          <scroll-view scroll-x class="tab-scroll" scroll-with-animation>
            <view 
              v-for="(item, index) in leagueList" 
              :id="'tab' + index" 
              :key="index" 
              class="tab-item" 
              :class="{ active: leagueCurrentIndex === index }" 
              @tap="clickLeague(index, item)"
            >
              {{ item.league_name }}
            </view>
          </scroll-view>
        </view>
        <view class="tab">
          <view class="tab-two">
            <view 
              :class="['tab-item-two', activeIndex == 0 ? 'active' : '']" 
              @click="clickBang(0, 'course')"
            > 赛程 </view>
            <view 
              v-if="selectTopTabValue.is_have_points == 1" 
              :class="['tab-item-two', activeIndex == 1 ? 'active' : '']" 
              @click="clickBang(1, 'points')"
            > 积分 </view>
            <view 
              v-if="selectTopTabValue.is_have_scorer == 1" 
              :class="['tab-item-two', activeIndex == 2 ? 'active' : '']" 
              @click="clickBang(2, 'scorer')"
            >射手榜</view>
            <view class="picker-box">
              <picker mode="selector" :range="csList" @change="handleChangeCs">
                <view class="picker-content">
                  <text class="picker-text">{{ selectedCs || "请选择" }}</text>
                  <view class="picker-arrow"></view>
                </view>
              </picker>
            </view>
          </view>
        </view>
        <scroll-view 
          v-if="activeIndex == 0 && stageList && stageList.length > 1" 
          class="tabs-scroll-container" 
          scroll-x 
          show-scrollbar="false"
          style="padding-bottom:0;"
          :scroll-with-animation="true"
        >
          <view class="match-tabs">
            <view 
              v-for="(tab, index) in filteredStageList" 
              :key="index" 
              :class="['other-tab', stageSelectIndex === getOriginalIndex(index) ? 'active' : '']" 
              @click="handleClickStage(getOriginalIndex(index), tab, 'stage')"
            >
              {{ tab }}
            </view>
          </view>
        </scroll-view>
        <template v-if="activeIndex == 0 && groupList && groupList.length > 0">
          <view class="group-container" scroll-x show-scrollbar="false" :scroll-with-animation="true">
            <view 
              :class="['tab-stage-t', { active: groupIndex == -1 }]" 
              @click="handleClickGroupAll()"
            >总览</view>
            <scroll-view scroll-x class="t-scroll" scroll-with-animation>
              <view 
                v-for="(tab, index) in groupList" 
                :key="index" 
                :class="['t-stage', groupIndex == index ? 'active' : '']" 
                @click="handleClickGroup(index, tab)"
              >
                {{ tab }}
              </view>
            </scroll-view>
          </view>
        </template>
        <template v-if="activeIndex == 0 && roundList && roundList.length > 0">
          <view class="tab-container">
            <scroll-view scroll-x class="stage-scroll" scroll-with-animation :scroll-left="scrollLeft">
              <view 
                v-for="(item, index) in roundList" 
                :key="index" 
                class="tab-stage-base" 
                :class="[roundIndex == index ? 'active' : '']" 
                @tap="handleClickRound(index, item, 'roundNo')"
              >
                {{ item.no }}
              </view>
            </scroll-view>
          </view>
        </template>
      </view>
    </view>

    <!-- 内容滚动区：动态设置padding-bottom -->
    <scroll-view 
      class="content-scroll" 
      scroll-y 
      :scroll-with-animation="false"
      :style="{ paddingBottom: contentScrollPaddingBottom + 'px' }"
    >
      <!-- 世界排名区域（仅点击世界排名时显示） -->
      <view v-if="isWorldRanking" class="world-ranking">
        <!-- 子组件仅保留列表展示，搜索框已移到父组件 -->
        <WordRanking :rankingList="wordRankingList" />
      </view>
      
      <!-- 原有内容区域（仅非世界排名时显示） -->
      <view v-else>
        <view v-if="activeIndex == 0" class="saicheng">
          <SaiCheng ref="saiCheng" @detail-click="handleClickDetail"></SaiCheng>
        </view>
        <view class="jifen" v-if="activeIndex === 1">
          <JiFen ref="jiFen"> </JiFen>
        </view>
        <view class="sheshou" v-if="activeIndex == 2">
          <SheShou ref="sheShou"></SheShou>
        </view>
        <view class="load-more">
          <text>已经到底了...</text>
        </view>
        <view 
          v-if="(courseList.length == 0 && activeIndex == 0) || (activeIndex == 1 && jifenList.length == 0) || (activeIndex == 2 && sheshouList.length == 0)"
        >
          <noData> </noData>
        </view>
      </view>
    </scroll-view>

    <ReminderDialog :is-show="isDialogShow" @cancel="handleCancel" @exchange="handleExchange" />
    <NativeTabbar ref="nativeTabbar" />
  </view>
</template>

<script>
import NativeTabbar from "@/components/tabbar.vue";
import { login, checkToken } from "@/utils/auth.js";
import { 
  queryContinentList, 
  queryLeagueList, 
  getSaiCheng, 
  getJiFen, 
  getSheShou, 
  getTimeList, 
  queryStageList, 
  queryGroupAndRoundList, 
  queryTeamWordRanking 
} from "@/api/demo";
import { formatDateWithWeekday } from "@/utils/data";
import noData from "@/pages/commn/noData";
import SaiCheng from "@/pages/commn/saiCheng.vue";
import JiFen from "@/pages/commn/jiFen.vue";
import SheShou from "@/pages/commn/sheShou.vue";
import ReminderDialog from "@/pages/commn/ReminderDialog.vue";
import WordRanking from "@/pages/commn/WordRanking.vue";

export default {
  components: {
    NativeTabbar,
    noData,
    SaiCheng,
    JiFen,
    SheShou,
    ReminderDialog,
    WordRanking
  },
  data() {
    return {
      leagueList: [],
      csList: [],
      courseList: [],
      activeIndex: 0,
      status: {
        0: "未开始",
        1: "已结束",
      },
      selectedCs: "",
      param: {},
      leagueCurrentIndex: 0,
      selectTopTabValue: {},
      jifenList: [],
      sheshouList: [],
      roundList: [],
      stageSelectIndex: 0,
      isDialogShow: false,
      scrollLeft: 0,
      groupIndex: -1,
      roundIndex: -1,
      groupList: [],
      currentContinentIndex: 0,
      continentList: [],
      stageList: [],
      topHeight: 0,
      
      // 世界排名相关（核心修改：新增原始数据存储）
      worldRankTypeList: ["俱乐部排名", "国家排名"],
      worldRankTypeIndex: 0,
      wordRankingList: [], // 展示用的过滤后列表
      originalWordRankingList: [], // 原始排名数据（本地检索用）
      searchKeyword: "",
      searchTimer: null, // 防抖定时器

      // 新增：高度计算相关变量
      windowWidth: 0,          // 屏幕宽度
      windowHeight: 0,         // 屏幕高度
      safeAreaBottom: 0,       // 底部安全区域高度
      tabbarHeight: 0,         // TabBar总高度（含安全区域）
      pageHeight: 0,           // 页面总高度
      contentScrollPaddingBottom: 0, // 内容滚动区底部内边距
      
      // 新增：存储窗口resize回调函数（解决offWindowResize报错）
      windowResizeCallback: null,
      touchStartX: 0, // 新增：触摸起始X坐标
      swipeThreshold: 50, // 新增：滑动判定阈值（px）
    };
  },
  onShow() {
    // 重新计算高度（页面切换后适配）
    this.calcAllHeights();
    queryContinentList().then((res) => {
      this.continentList = res.data;
    });
    this.loadData();
  },
  onLoad() {
    // 获取系统基础信息
    const systemInfo = uni.getSystemInfoSync();
    this.windowWidth = systemInfo.windowWidth;
    this.windowHeight = systemInfo.windowHeight;
    this.safeAreaBottom = systemInfo.safeAreaInsets?.bottom || 0;
    this.pageHeight = this.windowHeight; // 页面总高度 = 屏幕高度
    
    // 初始化窗口resize回调函数（关键：保存引用）
    this.windowResizeCallback = (res) => {
      this.windowWidth = res.size.windowWidth;
      this.windowHeight = res.size.windowHeight;
      this.pageHeight = this.windowHeight;
      this.calcAllHeights();
    };
  },
  mounted() {
    this.initScrollData();
    this.calcAllHeights(); // 计算所有高度
    
    // 监听窗口尺寸变化（适配旋转/分屏）- 使用保存的回调函数
    uni.onWindowResize(this.windowResizeCallback);
  },
  onUnload() {
    // 移除监听 - 传入对应的回调函数（核心修复）
    if (this.windowResizeCallback) {
      uni.offWindowResize(this.windowResizeCallback);
      // 清空回调引用，避免内存泄漏
      this.windowResizeCallback = null;
    }
  },
  computed: {
    filteredStageList() {
      const list = [...this.stageList];
      if (list.length > 0 && !list[0]) {
        return list.slice(1);
      }
      return list;
    },
    isWorldRanking() {
      const currentItem = this.continentList[this.currentContinentIndex];
      return currentItem && currentItem.continentName === "世界排名";
    }
  },
  methods: {
        onTouchStart(e) {
      // 记录触摸起始X坐标
      this.touchStartX = e.changedTouches[0].clientX;
    },
    onTouchEnd(e) {
      const touchEndX = e.changedTouches[0].clientX;
      const diffX = touchEndX - this.touchStartX; // 差值：正=右滑，负=左滑
      
      // 判定有效滑动（超过阈值）
      if (Math.abs(diffX) < this.swipeThreshold) return;
      
      // 获取Tabbar组件实例，调用切换方法
      const tabbar = this.$refs.nativeTabbar;
      if (!tabbar) return;
      
      // 左滑（diffX<0）→ 下一个Tab；右滑（diffX>0）→ 上一个Tab
      if (diffX < 0) {
        tabbar.switchTabBySwipe('left'); // 左滑切换下一个
      } else {
        tabbar.switchTabBySwipe('right'); // 右滑切换上一个
      }
    },
    // 新增：统一计算所有高度（核心修复）
    calcAllHeights() {
      const rpx2px = this.windowWidth / 750; // rpx转px比例
      
      // 1. 计算TabBar高度（100rpx + 安全区域）
      this.tabbarHeight = (100 * rpx2px) + this.safeAreaBottom;
      
      // 2. 内容滚动区底部内边距 = TabBar总高度 + 额外16rpx（避免内容贴边）
      this.contentScrollPaddingBottom = this.tabbarHeight + (16 * rpx2px);
      // #ifdef MP-WEIXIN
      this.contentScrollPaddingBottom = 0;
      // #endif
    },
    // 防抖搜索（仅本地检索，无接口请求）
    debounceSearch() {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.handleSearch();
      }, 500);
    },
    showLoading() {
      uni.showLoading({
        title: "加载中...",
        mask: true
      });
    },
    hideLoading() {
      uni.hideLoading();
    },
    // 切换排名类型（仅首次请求接口，保存原始数据）
    async clickWorldRankType(index, item) {
      this.showLoading();
      this.worldRankTypeIndex = index;
      const teamType = index === 0 ? "club" : "country";
      try {
        const res = await queryTeamWordRanking({ teamType });
        // 保存原始数据 + 初始化展示列表
        this.originalWordRankingList = res.data || [];
        this.wordRankingList = [...this.originalWordRankingList];
      } catch (error) {
        console.error("获取世界排名失败:", error);
        this.originalWordRankingList = [];
        this.wordRankingList = [];
        uni.showToast({ title: "获取数据失败", icon: "none" });
      } finally {
        this.hideLoading();
      }
    },
    // 本地检索核心方法（无任何接口请求）
    handleSearch() {
      const keyword = this.searchKeyword.trim();
      // 清空关键词 → 恢复原始列表
      if (!keyword) {
        this.wordRankingList = [...this.originalWordRankingList];
        return;
      }
      // 本地过滤：匹配球队名称（不区分大小写）
      this.wordRankingList = this.originalWordRankingList.filter(item => {
        if (!item.team_name) return false;
        return item.team_name.toLowerCase().includes(keyword.toLowerCase());
      });
      // 无匹配结果提示
      if (this.wordRankingList.length === 0) {
        uni.showToast({ title: "未找到相关排名", icon: "none" });
      }
    },
    async handleClickDetail(id, amount) {
      try {
        // 修复TabBar跳转失败：非TabBar页面改用navigateTo
        uni.navigateTo({ url: `/pages/test/index?id=${id}&isLottery=0` });
      } catch (err) {
        console.error("toDetail error:", err);
      }
    },
    getOriginalIndex(filteredIndex) {
      if (this.stageList.length > 0 && !this.stageList[0]) {
        return filteredIndex + 1;
      }
      return filteredIndex;
    },
    async getCommonCsList(leagueName, dataType) {
      try {
        const res = await getTimeList({ leagueName, dataType });
        return res.data || [];
      } catch (err) {
        console.error("getCommonCsList error:", err);
        return [];
      }
    },
    async getCommonStageList(leagueName, cs) {
      try {
        const res = await queryStageList({ leagueName, cs });
        return res.data || [];
      } catch (err) {
        console.error("getCommonStageList error:", err);
        return [];
      }
    },
    async getCommonRoundGroup(leagueName, stage, cs, roundNo, subGroup) {
      try {
        const res = await queryGroupAndRoundList({ leagueName, stage, cs, roundNo, subGroup });
        const { roundList = [], groupList = [] } = res.data || {};
        const formattedRoundList = roundList.map((item, i) => ({
          no: item,
          id: i,
          left: 0,
          width: 0,
        }));
        return { roundList: formattedRoundList, groupList };
      } catch (err) {
        console.error("getCommonRoundGroup error:", err);
        return { roundList: [], groupList: [] };
      }
    },
    async getCommonSaiCheng(params) {
      try {
        const res = await getSaiCheng(params);
        return res.data || [];
      } catch (err) {
        console.error("getCommonSaiCheng error:", err);
        return [];
      }
    },
    async getCommonRankData(apiFn, leagueName, cs) {
      try {
        const res = await apiFn({ leagueName, cs });
        return res.data || [];
      } catch (err) {
        console.error(`getCommonRankData (${apiFn.name}) error:`, err);
        return [];
      }
    },
    async handleClickContinent(index) {
      this.showLoading();
      this.currentContinentIndex = index;
      this.activeIndex = 0;
      
      const currentItem = this.continentList[index];
      if (currentItem && currentItem.continentName === "世界排名") {
        try {
          const res = await queryTeamWordRanking({ teamType: "club" });
          // 初始化原始数据和展示列表
          this.originalWordRankingList = res.data || [];
          this.wordRankingList = [...this.originalWordRankingList];
          this.worldRankTypeIndex = 0;
          this.searchKeyword = "";
        } catch (error) {
          console.error("获取世界排名失败:", error);
          this.originalWordRankingList = [];
          this.wordRankingList = [];
        } finally {
          this.hideLoading();
        }
        return;
      }
      
      try {
        const leagueRes = await queryLeagueList({
          fromContinent: this.continentList[this.currentContinentIndex].continentName,
        });
        this.leagueList = leagueRes.data || [];
        if (this.leagueList.length === 0) return;
        this.selectTopTabValue = this.leagueList[0];
        this.leagueCurrentIndex = 0;
        const csList = await this.getCommonCsList(this.selectTopTabValue.league_name, "course");
        this.csList = csList;
        this.selectedCs = csList[0] || "";
        if (!this.selectedCs) return;
        const stageList = await this.getCommonStageList(this.selectTopTabValue.league_name, this.selectedCs);
        this.stageList = stageList;
        this.stageSelectIndex = stageList.findIndex((item) => item === this.selectTopTabValue.stage) || 0;
        const roundGroupData = await this.getCommonRoundGroup(this.selectTopTabValue.league_name, this.stageList[this.stageSelectIndex] || "", this.selectedCs, this.selectTopTabValue.round_no || "");
        this.roundList = roundGroupData.roundList;
        if (roundGroupData.roundList && roundGroupData.roundList.length > 0) {
          roundGroupData.roundList.forEach((item, i) => {
            if (item.no == this.selectTopTabValue.round_no) {
              this.roundIndex = i;
            }
          });
        } else {
          this.roundIndex = -1;
        }
        this.groupIndex = -1;
        this.groupList = roundGroupData.groupList;
        const courseList = await this.getCommonSaiCheng({ leagueName: this.selectTopTabValue.league_name, cs: this.selectedCs, roundNo: this.selectTopTabValue.round_no || "", stage: this.stageList[this.stageSelectIndex] || "", subGroup: "" });
        this.courseList = courseList;
        this.$nextTick(() => {
          this.$refs.saiCheng.open(courseList);
        });
        this.initScrollData();
      } catch (err) {
        this.hideLoading();
      } finally {
        this.hideLoading();
      }
    },
    async handleClickGroupAll() {
      this.showLoading();
      try {
        const params = {
          leagueName: this.selectTopTabValue.league_name,
          cs: this.selectedCs,
          stage: this.stageList[this.stageSelectIndex] || "",
          subGroup: "",
          roundNo: this.selectTopTabValue.round || "",
        };
        params.roundNo = this.selectTopTabValue.roundNo || "";
        const courseList = await this.getCommonSaiCheng(params);
        this.courseList = courseList;
        this.groupIndex = -1;
        this.$nextTick(() => {
          this.$refs.saiCheng.open(courseList);
        });
      } catch (error) {
        this.hideLoading();
      } finally {
        this.hideLoading();
      }
    },
    async handleClickGroup(index, item) {
      this.showLoading();
      try {
        const params = {
          leagueName: this.selectTopTabValue.league_name,
          cs: this.selectedCs,
          stage: this.stageList[this.stageSelectIndex] || "",
          subGroup: "",
          roundNo: this.selectTopTabValue.round || "",
        };
        params.subGroup = item;
        params.roundNo = this.selectTopTabValue.roundNo || "";
        const courseList = await this.getCommonSaiCheng(params);
        this.groupIndex = index;
        this.courseList = courseList;
        this.$nextTick(() => {
          this.$refs.saiCheng.open(courseList);
        });
      } catch (error) {
        this.hideLoading();
      } finally {
        this.hideLoading();
      }
    },
    async handleClickStage(index, item, type) {
      this.showLoading();
      try {
        const params = {
          leagueName: this.selectTopTabValue.league_name,
          stage: item,
          cs: this.selectedCs,
          roundNo: this.selectTopTabValue.round_no || "",
          subGroup: "",
        };
        const roundGroupData = await this.getCommonRoundGroup(this.selectTopTabValue.league_name, item, this.selectedCs, this.selectTopTabValue.round_no || "");
        this.roundList = roundGroupData.roundList;
        if (roundGroupData.roundList && roundGroupData.roundList.length > 0) {
          roundGroupData.roundList.forEach((item, i) => {
            if (item.no == this.selectTopTabValue.round_no) {
              this.roundIndex = i;
            }
          });
        } else {
          this.roundIndex = -1;
        }
        this.groupList = roundGroupData.groupList;
        this.groupIndex = -1;
        this.stageSelectIndex = index;
        const courseList = await this.getCommonSaiCheng(params);
        this.courseList = courseList;
        this.$nextTick(() => {
          this.$refs.saiCheng.open(courseList);
        });
      } catch (error) {
        this.hideLoading();
      } finally {
        this.hideLoading();
      }
    },
    decimalToPercentage(decimal, fixed = 0, defaultValue = "--") {
      if (typeof decimal !== "number" || isNaN(decimal)) return defaultValue;
      return `${(decimal * 100).toFixed(fixed)}%`;
    },
    initScrollData() {
      this.scrollLeft = 0;
      this.$nextTick(() => {
        setTimeout(() => {
          this.getScrollW();
        }, 300);
        setTimeout(() => {
          if (this.roundList[this.roundIndex]) {
            this.scrollLeft = this.roundList[this.roundIndex].left - this.contentScrollW / 2 + this.roundList[this.roundIndex].width / 2;
          }
        }, 500);
      });
    },
    getScrollW() {
      const query = uni.createSelectorQuery().in(this);
      query
        .select(".stage-scroll")
        .boundingClientRect((data) => {
          this.contentScrollW = data?.width || 0;
        })
        .exec();
      query
        .selectAll(".tab-stage-base")
        .boundingClientRect((data) => {
          if (data.length && this.roundList.length) {
            data.forEach((item, i) => {
              this.roundList[i] = { ...this.roundList[i], left: item.left, width: item.width };
            });
          }
        })
        .exec();
    },
    handleExchange() {
      // 修复TabBar跳转失败：非TabBar页面改用navigateTo
      uni.navigateTo({ url: "/pages/recharge/recharge" });
      this.isDialogShow = false;
    },
    handleCancel() {
      this.isDialogShow = false;
    },
    forateData(time) {
      return formatDateWithWeekday(time);
    },
    async handleChangeCs(e) {
      const leagueName = this.selectTopTabValue.league_name;
      this.selectedCs = this.csList[e.detail.value] || "";
      if (!this.selectedCs) return;
      this.showLoading();
      try {
        if (this.activeIndex === 0) {
          const stageList = await this.getCommonStageList(this.selectTopTabValue.league_name, this.selectedCs);
          this.stageList = stageList;
          this.stageSelectIndex = stageList.findIndex((item) => item === this.selectTopTabValue.stage) || 0;
          const roundGroupData = await this.getCommonRoundGroup(this.selectTopTabValue.league_name, this.stageList[this.stageSelectIndex] || "", this.selectedCs, this.selectTopTabValue.round_no || "");
          this.roundList = roundGroupData.roundList;
          if (roundGroupData.roundList && roundGroupData.roundList.length > 0) {
            roundGroupData.roundList.forEach((item, i) => {
              if (item.no == this.selectTopTabValue.round_no) {
                this.roundIndex = i;
              }
            });
          } else {
            this.roundIndex = -1;
          }
          this.groupIndex = -1;
          this.groupList = roundGroupData.groupList;
          const courseList = await this.getCommonSaiCheng({ leagueName: this.selectTopTabValue.league_name, cs: this.selectedCs, roundNo: this.selectTopTabValue.round_no || "", stage: this.stageList[this.stageSelectIndex] || "", subGroup: "" });
          this.courseList = courseList;
          this.$nextTick(() => {
            this.$refs.saiCheng.open(courseList);
          });
          this.initScrollData();
        } else if (this.activeIndex === 1) {
          const jifenList = await this.getCommonRankData(getJiFen, leagueName, this.selectedCs);
          this.jifenList = jifenList;
          this.$nextTick(() => {
            this.$refs.jiFen.open(jifenList);
          });
        } else {
          const sheshouList = await this.getCommonRankData(getSheShou, leagueName, this.selectedCs);
          this.sheshouList = sheshouList;
          this.$nextTick(() => {
            this.$refs.sheShou.open(sheshouList);
          });
        }
      } catch (error) {
        this.hideLoading();
      } finally {
        this.hideLoading();
      }
    },
    async checkLogin() {
      const tokenValid = await checkToken();
      if (!tokenValid) await login();
    },
    async clickBang(index, dataType) {
      this.showLoading();
      this.activeIndex = index;
      this.roundList = [];
      const leagueName = this.selectTopTabValue.league_name;
      try {
        const csList = await this.getCommonCsList(this.selectTopTabValue.league_name, dataType);
        this.csList = csList;
        this.selectedCs = csList[0] || "";
        if (!this.selectedCs) return;
        const stageList = await this.getCommonStageList(this.selectTopTabValue.league_name, this.selectedCs);
        this.stageList = stageList;
        this.stageSelectIndex = stageList.findIndex((item) => item === this.selectTopTabValue.stage) || 0;
        const roundGroupData = await this.getCommonRoundGroup(this.selectTopTabValue.league_name, this.stageList[this.stageSelectIndex] || "", this.selectedCs, this.selectTopTabValue.round_no || "");
        this.roundList = roundGroupData.roundList;
        if (roundGroupData.roundList && roundGroupData.roundList.length > 0) {
          roundGroupData.roundList.forEach((item, i) => {
            if (item.no == this.selectTopTabValue.round_no) {
              this.roundIndex = i;
            }
          });
        } else {
          this.roundIndex = -1;
        }
        this.groupIndex = -1;
        this.groupList = roundGroupData.groupList;
        switch (index) {
          case 0:
            const courseList = await this.getCommonSaiCheng({ leagueName: this.selectTopTabValue.league_name, cs: this.selectedCs, roundNo: this.selectTopTabValue.round_no || "", stage: this.stageList[this.stageSelectIndex] || "", subGroup: this.groupList[0] ? this.groupList[0] : "" });
            this.courseList = courseList;
            this.$nextTick(() => {
              this.$refs.saiCheng.open(courseList);
            });
            break;
          case 1:
            const jifenList = await this.getCommonRankData(getJiFen, leagueName, this.selectedCs);
            this.jifenList = jifenList;
            this.$nextTick(() => {
              this.$refs.jiFen.open(jifenList);
            });
            break;
          case 2:
            const sheshouList = await this.getCommonRankData(getSheShou, leagueName, this.selectedCs);
            this.sheshouList = sheshouList;
            this.$nextTick(() => {
              this.$refs.sheShou.open(sheshouList);
            });
            break;
        }
      } catch (error) {
        this.hideLoading();
        
      } finally {
        this.hideLoading();
      }
    },
    async initData() {
      this.showLoading();
      try {
        const continentResult = await queryContinentList();
        this.continentList = continentResult.data || [];
        this.currentContinentIndex = this.continentList.findIndex((item) => item.isSelect === 1) || 0;
        if (this.continentList.length === 0) return;
        const leagueRes = await queryLeagueList({
          fromContinent: this.continentList[this.currentContinentIndex].continentName,
        });
        this.leagueList = leagueRes.data || [];
        if (this.leagueList.length === 0) return;
        this.selectTopTabValue = this.leagueList[0];
        this.leagueCurrentIndex = 0;
        const csList = await this.getCommonCsList(this.selectTopTabValue.league_name, "course");
        this.csList = csList;
        this.selectedCs = csList[0] || "";
        if (!this.selectedCs) return;
        const stageList = await this.getCommonStageList(this.selectTopTabValue.league_name, this.selectedCs);
        this.stageList = stageList;
        this.stageSelectIndex = stageList.findIndex((item) => item === this.selectTopTabValue.stage) || 0;
        const roundGroupData = await this.getCommonRoundGroup(this.selectTopTabValue.league_name, this.stageList[this.stageSelectIndex] || "", this.selectedCs, this.selectTopTabValue.round_no || "");
        this.roundList = roundGroupData.roundList;
        if (roundGroupData.roundList && roundGroupData.roundList.length > 0) {
          roundGroupData.roundList.forEach((item, i) => {
            if (item.no == this.selectTopTabValue.round_no) {
              this.roundIndex = i;
            }
          });
        } else {
          this.roundIndex = -1;
        }
        this.groupIndex = -1;
        this.groupList = roundGroupData.groupList;
        const courseList = await this.getCommonSaiCheng({ leagueName: this.selectTopTabValue.league_name, cs: this.selectedCs, roundNo: this.selectTopTabValue.round_no || "", stage: this.stageList[this.stageSelectIndex] || "", subGroup: "" });
        this.courseList = courseList;
        this.$nextTick(() => {
          this.$refs.saiCheng.open(courseList);
        });
        this.initScrollData();
      } catch (error) {
        this.hideLoading();
      } finally {
        this.hideLoading();
      }
    },
    loadData() {
      this.initData();
    },
    async handleClickRound(index, item) {
      this.showLoading();
      this.roundIndex = index;
      try {
        const courseList = await this.getCommonSaiCheng({
          leagueName: this.selectTopTabValue.league_name,
          cs: this.selectedCs,
          roundNo: item.no,
          stage: this.stageList[this.stageSelectIndex] || "",
          subGroup: this.groupList[this.groupIndex] || "",
        });
        this.courseList = courseList;
        this.$nextTick(() => {
          this.$refs.saiCheng.open(courseList);
          setTimeout(() => {
            if (this.roundList[this.roundIndex]) {
              this.scrollLeft = this.roundList[this.roundIndex].left - this.contentScrollW / 2 + this.roundList[this.roundIndex].width / 2;
            }
          }, 500);
        });
      } catch (error) {
        this.hideLoading();
      } finally {
        this.hideLoading();
      }
    },
    async clickLeague(index, item) {
      if (this.leagueCurrentIndex === index) return;
      this.showLoading();
      try {
        this.scrollLeft = 0;
        this.roundList = [];
        this.activeIndex = 0;
        this.selectTopTabValue = item;
        this.leagueCurrentIndex = index;
        const csList = await this.getCommonCsList(this.selectTopTabValue.league_name, "course");
        this.csList = csList;
        this.selectedCs = csList[0] || "";
        if (!this.selectedCs) return;
        const stageList = await this.getCommonStageList(this.selectTopTabValue.league_name, this.selectedCs);
        this.stageList = stageList;
        this.stageSelectIndex = stageList.findIndex((item) => item === this.selectTopTabValue.stage) || 0;
        const roundGroupData = await this.getCommonRoundGroup(this.selectTopTabValue.league_name, this.stageList[this.stageSelectIndex] || "", this.selectedCs, this.selectTopTabValue.round_no || "");
        if (roundGroupData.roundList && roundGroupData.roundList.length > 0) {
          roundGroupData.roundList.forEach((item, i) => {
            if (item.no == this.selectTopTabValue.round_no) {
              this.roundIndex = i;
            }
          });
        } else {
          this.roundIndex = -1;
        }
        this.roundList = roundGroupData.roundList;
        this.groupIndex = -1;
        this.groupList = roundGroupData.groupList;
        const courseList = await this.getCommonSaiCheng({ leagueName: this.selectTopTabValue.league_name, cs: this.selectedCs, roundNo: this.selectTopTabValue.round_no || "", stage: this.stageList[this.stageSelectIndex] || "", subGroup: "" });
        this.courseList = courseList;
        this.$nextTick(() => {
          this.$refs.saiCheng.open(courseList);
        });
        this.initScrollData();
        this.hideLoading();
      } catch (error) {
        this.hideLoading();
      } finally {
        this.hideLoading();
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import "../../styles/variables.scss";
.con {
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  
  .world-ranking {
    width: 100%;
    padding: 10rpx;
    box-sizing: border-box;
  }

  .top {
    width: 100%;
    z-index: 999;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
    
    .world-rank-wrap {
      background: #fff;
      
      // 子组件搜索框样式（适配原父组件搜索位置）
      .search-box {
        padding: 0rpx 20rpx;
        margin: 0;
        
        .search-input {
          width: 100%;
          height: 70rpx;
          line-height: 70rpx;
          padding: 0 20rpx;
          background: #f5f7fa;
          border-radius: 35rpx;
          font-size: 28rpx;
          color: #333;
          border: none;
          box-sizing: border-box;
          
          &::placeholder {
            color: #999;
          }
        }
      }
    }
    
    .page {
      width: 100%;
      background: #fff;
      overflow-y: auto;

      .custom-swiper {
        width: 100%;
        height: 180rpx;
        margin: 10rpx 0;

        .swiper-item {
          width: 100%;
          height: 100%;
          background-color: #ffffff;
          border-radius: 16rpx;
          box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;

          .item-text {
            width: 85%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
          }

          .match-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;

            .match-round {
              font-size: 32rpx;
              font-weight: bold;
              color: #333;
            }

            .match-date {
              font-size: 30rpx;
              color: #7f8c8d;
            }
          }

          .teams-container {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;

            .team-name {
              font-size: 32rpx;
              font-weight: bold;
              padding: 0 30rpx;
              color: #333;
            }
            .home {
              width: 41%;
              text-align: right;
            }
            .away {
              text-align: left;
              width: 41%;
            }
            .vs-separator {
              width: 6%;
              font-size: 36rpx;
              color: #d04052;
              font-weight: 500;
            }
          }

          .odds-container {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            margin-bottom: 10rpx;

            .odds {
              font-size: 32rpx;
              font-weight: bold;
              padding: 4rpx 40rpx;
              border-radius: 8rpx;
              color: #2c3e50;
            }

            .odds-separator {
              width: 6%;
              font-size: 32rpx;
              color: #d04052;
              padding: 0 15rpx;
            }

            .home-odds {
              text-align: right;
              width: 41%;
              color: $active-color;
            }

            .away-odds {
              width: 41%;
              color: $active-color;
            }
          }
        }
      }
    }

.continent-container {
  display: flex;
  background-color: $active-color;
  box-sizing: border-box;
  padding: 0 6rpx;
  width: 100%; // 确保父容器占满宽度

  .continent-item {
    flex: 1; // 核心：自动均分父容器宽度，所有item宽度一致
    box-sizing: border-box;
    padding: 0 4rpx; // 减小左右内边距，给文字更多空间（可根据需求调整）
    height: 60rpx;
    line-height: 60rpx; // 单行垂直居中
    text-align: center;
    color: #fff;
    font-size: 28rpx; // 下调字体大小，适配窄宽度场景（可选，根据你的文字长度调整）
    position: relative;
    transition: all 0.3s ease;
    white-space: nowrap; // 强制单行（避免换行导致高度变化）
    overflow: hidden; // 溢出隐藏
    text-overflow: ellipsis; // 文字溢出时显示省略号（兜底）

    &.active {
      background-color: #fff;
      color: $active-color;
      border-radius: 6rpx;
    }

    .corner-mark {
      position: absolute;
      top: 0;
      right: 0;
      width: 20rpx;
      height: 20rpx;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cpath fill='%2331926e' d='M0 0 L20 0 L0 20 Z'/%3EC/svg%3%3E");
      background-size: 100% 100%;
      z-index: 1;
      transition: transform 0.3s ease;
    }
    
    &.active .corner-mark {
      transform: rotate(90deg);
    }
  }
}

    .tab-container {
      position: relative;
      width: 100%;
      background: #ffffff;
      box-sizing: border-box;
      
      .tab-scroll {
        white-space: nowrap;
        width: 100%;
        
        .tab-item {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 60rpx;
          line-height: 60rpx;
          font-size: 30rpx;
          color: #333;
          position: relative;
          display: inline-block;
          vertical-align: middle;
          box-sizing: border-box;
          text-align: center;
          padding: 0 20rpx;
          
          &.active {
            color: $active-color;
          }
        }
      }
      
      .stage-scroll {
        white-space: nowrap;
        width: 100%;
        height: 60rpx;
        box-sizing: border-box;
        padding: 0 42rpx;
        background: #fff;
        
        .tab-stage-base {
          height: 60rpx;
          line-height: 60rpx;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 26rpx;
          color: #333;
          position: relative;
          box-sizing: border-box;
          padding-top: 6rpx;
          padding-right: 25rpx;
          
          &.active {
            color: $active-color !important;
          }
        }
      }
    }

    .tab {
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      padding-left: 42rpx;
      width: 100%;
      background: #fff;
      
      .tab-two {
        flex: 1;
        display: flex;
        justify-content: flex-start;
        height: 60rpx;

        .tab-item-two {
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 28rpx;
          color: #666;
          position: relative;
          transition: all 0.3s;
          padding: 0 20rpx;
          
          &.active {
            color: $active-color;
          }
        }
        
        .tab-item-two:nth-child(1) {
          padding-left: 0;
        }
        
        .picker-box {
          flex: 1;
          padding: 0 15rpx;
          display: flex;
          align-items: center;
          justify-content: flex-end;

          .picker-content {
            display: flex;
            align-items: center;
            padding: 8rpx 12rpx;
            background-color: #f5f5f5;
            border-radius: 8rpx;
            min-width: 150rpx;
            cursor: pointer;

            .picker-text {
              font-size: 28rpx;
              color: $active-color;
              flex: 1;
            }

            .picker-arrow {
              width: 0;
              height: 0;
              border-left: 10rpx solid transparent;
              border-right: 10rpx solid transparent;
              border-top: 10rpx solid $active-color;
              transition: transform 0.3s;
              margin-left: 6rpx;
            }
          }
        }
      }
    }

    .tabs-scroll-container {
      position: relative;
      width: 100%;
      background: #ffffff;
      height: 60rpx;
      box-sizing: border-box;
      padding: 0 24rpx;
      
      .match-tabs {
        display: inline-flex;
        align-items: center;
        background: #fff;
        box-sizing: border-box;
        
        .other-tab {
          height: 60rpx;
          line-height: 60rpx;
          box-sizing: border-box;
          padding: 0 14rpx;
          color: #333;
          transition: all 0.3s ease;
          white-space: nowrap;
          position: relative;
          font-size: 26rpx;
          
          &.active {
            color: $active-color;
          }
        }
        
        .other-tab:nth-child(1) {
          padding-left: 18rpx;
        }
      }
    }
    
    .group-container {
      position: relative;
      width: 100%;
      background: #ffffff;
      box-sizing: border-box;
      display: flex;
      justify-content: flex-start;
      
      .tab-stage-t {
        display: inline-flex;
        align-items: center;
        justify-content: left;
        width: 100rpx;
        height: 50rpx;
        font-size: 26rpx;
        color: #333;
        z-index: 99;
        box-sizing: border-box;
        padding-left: 42rpx;
        
        &.active {
          background-color: #fff;
          color: $active-color;
        }
      }

      .t-scroll {
        flex: 1;
        white-space: nowrap;
        width: 100%;
        height: 50rpx;
        box-sizing: border-box;
        background: #fff;
        
        .t-stage {
          box-sizing: border-box;
          padding-right: 25rpx;
          height: 50rpx;
          line-height: 50rpx;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 26rpx;
          color: #333;
          margin-left: 2rpx;
          position: relative;
          
          &.active {
            color: $active-color;
          }
        }
        
        .t-stage:nth-child(1) {
          padding-left: 25rpx;
        }
      }
    }
  }

  // 核心修改：滚动区样式优化
  .content-scroll {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    box-sizing: border-box;
    width: 100%;
    // 移除硬编码的padding-bottom，改为动态绑定
    background-color: #f5f5f5;
    
    .saicheng,
    .jifen,
    .sheshou {
      width: 100%;
      box-sizing: border-box;
    }
    
    .sheshou {
      box-sizing: border-box;
      padding: 0rpx 10rpx 0 10rpx;
    }
    
    .load-more {
      padding: 50rpx 0;
      text-align: center;
      font-size: 26rpx;
      color: #999;
      background-color: #fff;
      border-top: 1rpx solid #f2f2f2;
    }
  }
}

/* 隐藏滚动条 */
.con ::-webkit-scrollbar {
  display: none;
}

button {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
}
</style>