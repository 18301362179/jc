<template>
  <view class="con" :style="{ height: pageHeight + 'px' }" style="width: 100%; height: 100vh; box-sizing: border-box">
    <CustomHeader
      :showBack="false"
      :ballTitle="''"
      :title="'KeepSeek'"
      :isIndex="false"
      :showIcon="false"
      :isSelected="false"
    />
    <!-- 顶部筛选区（固定不滚动） -->
    <view class="top" ref="top">
      <!-- 大洲名 -->
      <view class="continent-container">
        <view v-for="(item, index) in continentList" :key="index" :class="['continent-item', { active: currentContinentIndex === index }]" @click="handleClickContinent(index)">
          {{ item.continentName }}
          <view class="corner-mark" v-if="currentContinentIndex === index"></view>
        </view>
      </view>

      <!-- 世界排名专属tab（仅点击世界排名时显示） -->
      <view v-if="isWorldRanking" class="world-rank-wrap">
        <!-- 排名类型tab（改为流式布局） -->
        <view class="tab-container">
          <view class="tab-wrap"> <!-- 替换scroll-view为普通view -->
            <view v-for="(item, index) in worldRankTypeList" :key="index" class="tab-item" :class="{ active: worldRankTypeIndex === index }" @tap="clickWorldRankType(index, item)">
              {{ item }}
            </view>
          </view>
        </view>

        <!-- 替换为子组件的搜索框（原父组件搜索按钮位置） -->
        <view class="search-box">
          <input v-model="searchKeyword" type="text" placeholder="请输入球队/国家名称搜索" class="search-input" @confirm="handleSearch" @input="debounceSearch" />
        </view>
      </view>

      <!-- 原有筛选区（仅非世界排名时显示） -->
      <view v-else>
        <!-- 联赛tab（改为流式布局） -->
        <view class="tab-container">
          <view class="tab-wrap"> <!-- 替换scroll-view为普通view -->
            <view v-for="(item, index) in leagueList" :id="'tab' + index" :key="index" class="tab-item" :class="{ active: leagueCurrentIndex === index }" @tap="clickLeague(index, item)">
              {{ item.league_name }}
            </view>
          </view>


        </view>
        
<view class="tab">
  <view class="tab-two">
    <view :class="['tab-item-two', activeIndex == 0 ? 'active' : '']" @click="clickBang(0, 'course')"> 赛程 </view>
    <view :class="['tab-item-two', activeIndex == 1 ? 'active' : '']" @click="clickBang(1, 'points')"> 积分 </view>
    <view  v-if="selectTopTabValue && selectTopTabValue.is_have_scorer == 1"  :class="['tab-item-two', activeIndex == 2 ? 'active' : '']" @click="clickBang(2, 'scorer')">射手榜</view>
    
    <!-- 自定义下拉框（替换原 picker） -->
    <view class="dropdown-box" @click="toggleDropdown">
      <view class="dropdown-content">
        <text class="dropdown-text">{{ selectedCs || "请选择" }}</text>
        <view class="dropdown-arrow" :class="{ rotate: isDropdownOpen }"></view>
      </view>
      
      <!-- 下拉选项列表 -->
      <view class="dropdown-options" v-show="isDropdownOpen" @click.stop>
        <view 
          v-for="(item, index) in csList" 
          :key="index"
          class="dropdown-option"
          :class="{ active: selectedCs === item }"
          @click="selectDropdownItem(index, item)"
        >
          {{ item }}
        </view>
      </view>
    </view>
  </view>
</view>
        
        <!-- 阶段tab（改为流式布局） -->
        <view v-if="activeIndex == 0 && stageList && stageList.length > 1" class="tabs-wrap-container">
          <view class="match-tabs">
            <view v-for="(tab, index) in filteredStageList" :key="index" :class="['other-tab', stageSelectIndex === getOriginalIndex(index) ? 'active' : '']" @click="handleClickStage(getOriginalIndex(index), tab, 'stage')">
              {{ tab }}
            </view>
          </view>
        </view>
        
        <!-- 分组tab（改为流式布局） -->
        <template v-if="activeIndex == 0 && groupList && groupList.length > 0">
          <view class="group-wrap-container">
            <view :class="['tab-stage-t', { active: groupIndex == -1 }]" @click="handleClickGroupAll()">总览</view>
            <view class="t-wrap"> <!-- 替换scroll-view为普通view -->
              <view v-for="(tab, index) in groupList" :key="index" :class="['t-stage', groupIndex == index ? 'active' : '']" @click="handleClickGroup(index, tab)">
                {{ tab }}
              </view>
            </view>
          </view>
        </template>
        
        <!-- 轮次tab（改为流式布局） -->
        <template v-if="activeIndex == 0 && roundList && roundList.length > 0">
          <view class="tab-container">
            <view class="stage-wrap"> <!-- 替换scroll-view为普通view -->
              <view v-for="(item, index) in roundList" :key="index" class="tab-stage-base" :class="[roundIndex == index ? 'active' : '']" @tap="handleClickRound(index, item, 'roundNo')">
                {{ item.no }}
              </view>
            </view>
          </view>
        </template>
      </view>
    </view>

    <!-- 内容滚动区：动态设置padding-bottom -->
    <scroll-view class="content-scroll" scroll-y :scroll-with-animation="false" :style="{ paddingBottom: contentScrollPaddingBottom + 'px' }">
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
          <text></text>
        </view>
        <view v-if="(courseList.length == 0 && activeIndex == 0) || (activeIndex == 1 && jifenList.length == 0) || (activeIndex == 2 && sheshouList.length == 0)">
          <noData> </noData>
        </view>
      </view>
    </scroll-view>
    <NativeTabbar ref="nativeTabbar" />
    <SystemMsgModal/>
  </view>
</template>

<script>
import NativeTabbar from "@/components/tabbar.vue";
import { login, checkToken } from "@/utils/auth.js";
import { queryContinentList, queryLeagueList, getSaiCheng, getJiFen, getSheShou, getTimeList, queryStageList, queryGroupAndRoundList, queryTeamWordRanking, recharge } from "@/api/demo";
import { formatDateWithWeekday } from "@/utils/data";
import noData from "@/pages/commn/noData";
import SaiCheng from "@/pages/commn/saiCheng.vue";
import JiFen from "@/pages/commn/jiFen.vue";
import SheShou from "@/pages/commn/sheShou.vue";
import WordRanking from "@/pages/commn/WordRanking.vue";
import CustomHeader from "@/components/CustomHeader.vue";
import SystemMsgModal from "@/components/SystemMsgModal.vue";
export default {
  components: {
    NativeTabbar,
    noData,
    SaiCheng,
    JiFen,
    SheShou,
    WordRanking,
    CustomHeader,
    SystemMsgModal
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
      // 移除scrollLeft相关变量
      groupIndex: -1,
      roundIndex: -1,
      groupList: [],
      currentContinentIndex: 0,
      continentList: [],
      stageList: [],
      topHeight: 0,

      // 世界排名相关
      worldRankTypeList: ["俱乐部排名", "国家排名"],
      worldRankTypeIndex: 0,
      wordRankingList: [], 
      originalWordRankingList: [], 
      searchKeyword: "",
      searchTimer: null, 

      // 高度计算相关变量
      windowWidth: 0, 
      windowHeight: 0, 
      safeAreaBottom: 0, 
      tabbarHeight: 0, 
      pageHeight: 0, 
      contentScrollPaddingBottom: 0, 

      // 窗口resize回调函数
      windowResizeCallback: null,
      touchStartX: 0, 
      swipeThreshold: 50, 
      isDropdownOpen: false, // 控制下拉框展开/收起
      newList: [
  {
    cs: "2025/26",
    url_show_status: 0,
    is_over: 0,
    charge: "5币",
    stage: "总决赛",
    home_name: "EDG",
    league_name: "LPL英雄联盟",
    visiting_name: "TES",
    id: 9001,
    race_date: "2026/04/11 20:00:00",
    round_no: 1,
    is_buy: 0
  },
  {
    cs: "2025/26",
    url_show_status: 0,
    is_over: 0,
    charge: "5币",
    stage: "半决赛",
    home_name: "WBG",
    league_name: "王者荣耀KPL",
    visiting_name: "AG超玩会",
    id: 9002,
    race_date: "2026/04/11 21:00:00",
    round_no: 2,
    is_buy: 0
  }
],
    };
  },
  onShow() {
    this.calcAllHeights();
    queryContinentList().then((res) => {
      this.continentList = res.data;
    });
    this.loadData();
    
  },
  onLoad() {
    const systemInfo =  uni.getWindowInfo()
    this.windowWidth = systemInfo.windowWidth;
    this.windowHeight = systemInfo.windowHeight;
    this.safeAreaBottom = (systemInfo.safeAreaInsets && systemInfo.safeAreaInsets.bottom) || 0;
    this.pageHeight = this.windowHeight;

    this.windowResizeCallback = (res) => {
      this.windowWidth = res.size.windowWidth;
      this.windowHeight = res.size.windowHeight;
      this.pageHeight = this.windowHeight;
      this.calcAllHeights();
    };
  },
  mounted() {
    // 移除initScrollData调用（横向滚动相关）
    this.calcAllHeights();
    uni.onWindowResize(this.windowResizeCallback);
  },
  onUnload() {
    if (this.windowResizeCallback) {
      uni.offWindowResize(this.windowResizeCallback);
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
    },
  },
  methods: {
    toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    // 点击其他区域关闭下拉框
    if (this.isDropdownOpen) {
      uni.nextTick(() => {
        document.addEventListener('click', this.closeDropdown);
      });
    } else {
      document.removeEventListener('click', this.closeDropdown);
    }
  },
  // 关闭下拉框
  closeDropdown() {
    this.isDropdownOpen = false;
    document.removeEventListener('click', this.closeDropdown);
  },
  // 选择下拉框选项
  selectDropdownItem(index, item) {
    this.selectedCs = item;
    this.isDropdownOpen = false;
    // 触发原有选择逻辑
    this.handleChangeCs({ detail: { value: index } });
    document.removeEventListener('click', this.closeDropdown);
  },
    // 高度计算
    calcAllHeights() {
      const rpx2px = this.windowWidth / 750;
      this.tabbarHeight = 100 * rpx2px + this.safeAreaBottom;
      this.contentScrollPaddingBottom = this.tabbarHeight + 16 * rpx2px;
      // #ifdef MP-WEIXIN
      this.contentScrollPaddingBottom = 0;
      // #endif
    },
    // 防抖搜索
    debounceSearch() {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.handleSearch();
      }, 500);
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
    // 切换排名类型
    async clickWorldRankType(index, item) {
      this.showLoading();
      this.worldRankTypeIndex = index;
      const teamType = index === 0 ? "club" : "country";
      try {
        const res = await queryTeamWordRanking({ teamType });
        this.originalWordRankingList = res.data || [];
        this.wordRankingList = [...this.originalWordRankingList];
      } catch (error) {
        console.error("获取世界排名失败:", error);
        this.originalWordRankingList = [];
        this.wordRankingList = [];
        // uni.showToast({ title: "获取数据失败", icon: "none" });
      } finally {
        this.hideLoading();
      }
    },
    // 本地检索
    handleSearch() {
      const keyword = this.searchKeyword.trim();
      if (!keyword) {
        this.wordRankingList = [...this.originalWordRankingList];
        return;
      }
      this.wordRankingList = this.originalWordRankingList.filter((item) => {
        if (!item.team_name) return false;
        return item.team_name.toLowerCase().includes(keyword.toLowerCase());
      });
      if (this.wordRankingList.length === 0) {
        // uni.showToast({ title: "未找到相关排名", icon: "none" });
      }
    },
    async handleClickDetail(item) {
      try {
        this.showLoading();
        const reqParams = {
          id: item.id,
          isLottery: 0,
          isTradition: 1,
          beFrom:"football",
          serialNumber: item.serial_number,
          dateStr: item.date_str
        };
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
                uni.navigateTo({ url: `/pages/recharge/recharge?beFrom=football&isLottery=1` });
              }
            }
          });
          return;
        } else {
                if (item.is_buy == 0) {
        this.$set(item, 'is_buy' ,1)
      }
          await uni.navigateTo({
            url: `/pages/test/index?id=${item.id}&isLottery=0&isTradition=1`,
          });
        }
      } catch (err) {
        // uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
      } finally {
        this.hideLoading();
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
          // 移除left/width属性（横向滚动相关）
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
          if (uni.getStorageSync("urlValue")) {
            this.$refs.saiCheng.open(courseList);
          } else {
            this.$refs.saiCheng.open(this.newList);
            this.courseList = this.newList;
          };
        });
        // 移除initScrollData调用
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
                    if (uni.getStorageSync("urlValue")) {
            this.$refs.saiCheng.open(courseList);
          } else {
            this.$refs.saiCheng.open(this.newList);
            this.courseList = this.newList;
          };
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
                    if (uni.getStorageSync("urlValue")) {
            this.$refs.saiCheng.open(courseList);
          } else {
            this.$refs.saiCheng.open(this.newList);
            this.courseList = this.newList;
          };
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
                    if (uni.getStorageSync("urlValue")) {
            this.$refs.saiCheng.open(courseList);
          } else {
            this.$refs.saiCheng.open(this.newList);
            this.courseList = this.newList;
          };
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
    // 移除initScrollData方法（横向滚动相关）
    // 移除getScrollW方法（横向滚动相关）
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
                      if (uni.getStorageSync("urlValue")) {
            this.$refs.saiCheng.open(courseList);
          } else {
            this.$refs.saiCheng.open(this.newList);
            this.courseList = this.newList;
          };
            
          });
          // 移除initScrollData调用
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
                        if (uni.getStorageSync("urlValue")) {
            this.$refs.saiCheng.open(courseList);
          } else {
            this.$refs.saiCheng.open(this.newList);
            this.courseList = this.newList;
          };
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
                    if (uni.getStorageSync("urlValue")) {
            this.$refs.saiCheng.open(courseList);
          } else {
            this.$refs.saiCheng.open(this.newList);
            this.courseList = this.newList;
          };
        });
        // 移除initScrollData调用
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
            if (uni.getStorageSync("urlValue")) {
            this.$refs.saiCheng.open(courseList);
          } else {
            this.$refs.saiCheng.open(this.newList);
            this.courseList = this.newList;
          };
          // 移除scrollLeft相关逻辑
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
        // 移除scrollLeft重置
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
                    if (uni.getStorageSync("urlValue")) {
            this.$refs.saiCheng.open(courseList);
          } else {
            this.$refs.saiCheng.open(this.newList);
            this.courseList = this.newList;
          };
        });
        // 移除initScrollData调用
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
      flex-wrap: wrap; // 新增：自动换行
      background-color: $active-color;
      box-sizing: border-box;
      padding: 0 6rpx;
      width: 100%;

      .continent-item {
        flex: 0 0 auto; // 修改：取消均分，按内容宽度
        box-sizing: border-box;
        padding: 0 15rpx; // 调整内边距
        height: 60rpx;
        line-height: 60rpx;
        text-align: center;
        color: #fff;
        font-size: 28rpx;
        position: relative;
        transition: all 0.3s ease;
        white-space: nowrap;
        margin: 5rpx; // 新增：添加间距
        border-radius: 6rpx;

        &.active {
          background-color: #fff;
          color: $active-color;
        }

.corner-mark {
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  z-index: 1;
  transition: transform 0.3s ease;
  // // 纯 CSS 实现右上小三角，颜色 #31926e
  // border-top: 20rpx solid #31926e;
  // border-left: 20rpx solid transparent;
}


      }
    }

    .tab-container {
      position: relative;
      width: 100%;
      background: #ffffff;
      box-sizing: border-box;

      // 联赛/排名类型tab容器样式
      .tab-wrap {
        display: flex;
        flex-wrap: wrap; // 核心：自动换行
        padding: 5rpx 10rpx;
        box-sizing: border-box;
      }

      .tab-item {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 60rpx;
        line-height: 60rpx;
        font-size: 30rpx;
        color: #333;
        position: relative;
        box-sizing: border-box;
        text-align: center;
        padding: 0 14rpx;
        white-space: nowrap;

        &.active {
          color: $active-color;
        }
      }

      // 轮次tab容器样式
      .stage-wrap {
        display: flex;
        flex-wrap: wrap; // 核心：自动换行
        padding: 5rpx 42rpx;
        background: #fff;
        box-sizing: border-box;
      }

      .tab-stage-base {
        width: 50rpx;
        height: 60rpx;
        line-height: 60rpx;
        display: inline-flex;
        align-items: center;
        font-size: 26rpx;
        color: #333;
        position: relative;
        box-sizing: border-box;
        padding-top: 6rpx;
        white-space: nowrap;
        text-align: left;
        &.active {
          color: $active-color !important;
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
        flex-wrap: wrap; // 新增：防止赛程/积分/射手榜换行溢出
        height: auto; // 修改：高度自适应
        padding: 5rpx 0;

        .tab-item-two {
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 28rpx;
          color: #666;
          position: relative;
          transition: all 0.3s;
          padding: 0 20rpx;
          height: 60rpx;
          margin: 5rpx 0; // 新增：添加间距
          white-space: nowrap;

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

    // 阶段tab容器样式
    .tabs-wrap-container {
      position: relative;
      width: 100%;
      background: #ffffff;
      box-sizing: border-box;
      padding: 5rpx 24rpx;

      .match-tabs {
        display: flex;
        flex-wrap: wrap; // 核心：自动换行
        background: #fff;
        box-sizing: border-box;
      }

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
        margin: 5rpx; // 新增：添加间距

        &.active {
          color: $active-color;
        }
      }

      .other-tab:nth-child(1) {
        padding-left: 18rpx;
      }
    }

    // 分组tab容器样式
    .group-wrap-container {
      position: relative;
      width: 100%;
      background: #ffffff;
      box-sizing: border-box;
      display: flex;
      flex-wrap: wrap; // 核心：自动换行
      padding: 5rpx 0;

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
        margin: 5rpx 0; // 新增：添加间距

        &.active {
          background-color: #fff;
          color: $active-color;
        }
      }

      .t-wrap {
        flex: 1;
        display: flex;
        flex-wrap: wrap; // 核心：自动换行
        box-sizing: border-box;
        background: #fff;
        padding: 0 10rpx;
      }

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
        margin: 5rpx; // 新增：添加间距
        position: relative;
        white-space: nowrap;

        &.active {
          color: $active-color;
        }
      }

      .t-stage:nth-child(1) {
        padding-left: 25rpx;
      }
    }
  }

  .content-scroll {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    box-sizing: border-box;
    width: 100%;
    background-color: #f5f5f5;

    .saicheng,
    .jifen,
    .sheshou {
      width: 100%;
      box-sizing: border-box;
    }
    .load-more {
      padding: 50rpx 0;
      text-align: center;
      font-size: 26rpx;
      color: #999;
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
.con {
  uni-modal,
  .uni-mask {
    z-index: 99 !important;
  }
}
.dropdown-box {
  position: relative;
  flex: 1;
  padding: 0 15rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  z-index: 999; // 确保下拉列表在最上层

  .dropdown-content {
    display: flex;
    align-items: center;
    padding: 8rpx 12rpx;
    background-color: #f5f5f5;
    border-radius: 8rpx;
    min-width: 150rpx;
    cursor: pointer;
  }

  .dropdown-text {
    font-size: 28rpx;
    color: $active-color;
    flex: 1;
  }

  .dropdown-arrow {
    width: 0;
    height: 0;
    border-left: 10rpx solid transparent;
    border-right: 10rpx solid transparent;
    border-top: 10rpx solid $active-color;
    transition: transform 0.3s;
    margin-left: 6rpx;
  }

  .dropdown-arrow.rotate {
    transform: rotate(180deg);
  }

  // 下拉选项列表
  .dropdown-options {
    position: absolute;
    top: 70rpx;
    right: 15rpx;
    min-width: 170rpx;
    max-height: 300rpx;
    overflow-y: auto;
    background: #fff;
    border-radius: 8rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
    z-index: 1000;

    .dropdown-option {
      padding: 0 20rpx;
      height: 60rpx;
      line-height: 60rpx;
      font-size: 28rpx;
      color: #333;
      white-space: nowrap;

      &.active {
        color: $active-color;
        background-color: #f5f7fa;
      }

      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
}
</style>