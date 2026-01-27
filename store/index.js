// store/index.js
import Vue from 'vue';
import Vuex from 'vuex';
import state from './state';
import mutations from './mutations';
import actions from './actions';

// 注册 Vuex 插件
Vue.use(Vuex);

// 创建并导出 Store 实例
export default new Vuex.Store({
	state,
	mutations,
	actions,
	// 若后续状态多，可拆分 modules（当前简单场景暂不用）
	modules: {}
});