// main.js（你原有的入口文件）
import App from './App'
import env from './config/env'
import Vue from 'vue'
// 1. 导入创建好的 Store 实例
import store from './store' // 关键：引入 store
import {
	showLoading,
	hideLoading
} from './utils/loading.js'
import {
	uniIcons
} from '@dcloudio/uni-ui'
Vue.component('uni-icons', uniIcons) // 单独注册uni-icons（避免全局注册遗漏）
Vue.prototype.$bus = new Vue();

// 引入全局软键盘组件
import UniNumberKeyboard from '@/components/UniNumberKeyboard/UniNumberKeyboard.vue'
// 全局注册组件
Vue.component('UniNumberKeyboard', UniNumberKeyboard)
// 环境配置校验（你的原有代码）
if (!env || typeof env !== 'object') {
	console.error('⚠️ 环境配置异常，请检查 ./config/env.js 文件是否正确导出对象');
	window.$defaultEnv = {
		baseUrl: '',
		env: process.env.NODE_ENV || 'development'
	};
}
uni.hideTabBar();
// Vue2 全局配置（你的原有代码）
Vue.config.productionTip = false;
Vue.prototype.$env = env || window.$defaultEnv;
Vue.prototype.showLoading = showLoading;
Vue.prototype.hideLoading = hideLoading;

// 2. 实例化 Vue 时，将 store 注入（关键步骤）
App.mpType = 'app';
const app = new Vue({
	store, // 注入 Store，让所有组件可通过 this.$store 访问
	...App
});

// 挂载 Vue 实例（你的原有代码）
try {
	app.$mount();
	console.log('Vue2 应用初始化成功（已注入 Vuex Store）');
} catch (error) {
	console.error('Vue2 应用挂载失败：', error);
	uni.showToast({
		title: '应用加载失败，请重启',
		icon: 'none',
		duration: 3000
	});
}