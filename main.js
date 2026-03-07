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
// 
// ========== 核心1：加载 static 目录下的本地 vConsole 文件（原有逻辑） ==========
	// 仅 H5 端执行，避免小程序/App 报错
	// #ifdef H5
	// try {
	// 	// 创建脚本标签，加载 static/js 下的本地 vConsole
	// 	const scriptVConsole = document.createElement('script');
	// 	// 路径对应 static/js/vconsole.min.js（绝对路径，必加 /static）
	// 	scriptVConsole.src = '/static/js/vconsole.min.js';

	// 	// 加载成功后实例化
	// 	scriptVConsole.onload = function () {
	// 		// 先销毁旧实例，避免重复创建
	// 		if (window.vConsole) window.vConsole.destroy();
	// 		// 实例化 vConsole
	// 		window.vConsole = new window.VConsole();
	// 		console.log('✅ 本地 vConsole 加载成功（static/js/vconsole.min.js）');
	// 	};

	// 	// 加载失败提示（方便排查）
	// 	scriptVConsole.onerror = function () {
	// 		console.error('❌ 本地 vConsole 加载失败！请检查：');
	// 		console.error('1. 文件路径是否为 static/js/vconsole.min.js');
	// 		console.error('2. 路径是否写对：/static/js/vconsole.min.js（必须以 / 开头）');
	// 	};

	// 	// 插入到页面头部
	// 	document.head.appendChild(scriptVConsole);
	// } catch (error) {
	// 	console.error('⚠️ vConsole 初始化异常：', error);
	// }
	// // #endif


// ========== 核心2：加载 static 目录下的本地微信 JS-SDK（新增逻辑） ==========
// 仅 H5 端加载，小程序/App 无需加载
// #ifdef H5
try {
	// 创建脚本标签，加载 static/js 下的本地微信 JS-SDK
	const scriptWxJssdk = document.createElement('script');
	// 路径对应 static/js/jweixin-1.6.0.js（本地文件路径）
	scriptWxJssdk.src = '/static/js/jweixin-1.6.0.js';

	// 加载成功后处理：避免覆盖 uni 的 wx 对象
	scriptWxJssdk.onload = function () {
		// 把微信的 wx 重命名为 wxJssdk，防止覆盖 uni 的 wx
		window.wxJssdk = window.wx;
		// 恢复 uni 的 wx 别名（关键：不影响小程序 API）
		window.wx = uni;
		console.log('✅ 本地微信 JS-SDK 加载成功（static/js/jweixin-1.6.0.js）');
	};

	// 加载失败兜底：切回微信官方 CDN
	scriptWxJssdk.onerror = function () {
		console.warn('⚠️ 本地微信 JS-SDK 加载失败，切回官方 CDN');
		const scriptCdn = document.createElement('script');
		scriptCdn.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js';
		scriptCdn.onload = function () {
			window.wxJssdk = window.wx;
			window.wx = uni;
			console.log('✅ 微信 JS-SDK CDN 加载成功');
		};
		document.head.appendChild(scriptCdn);
	};

	// 插入到页面头部（和 vConsole 同级）
	document.head.appendChild(scriptWxJssdk);
} catch (error) {
	console.error('⚠️ 微信 JS-SDK 初始化异常：', error);
}
// #endif

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