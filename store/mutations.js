// store/mutations.js
export default {
	// 修改彩票 Tab 显隐状态
	SET_SHOW_LOTTERY(state, value) {
		state.isShowLottery = value;
	},
	// 修改 TabBar 当前选中索引
	SET_CURRENT_TAB_INDEX(state, index) {
		state.currentTabIndex = index;
	},
	// 可扩展其他同步修改方法
	SET_USER_INFO(state, userInfo) {
		state.userInfo = userInfo;
	}
};