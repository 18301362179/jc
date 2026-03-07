// utils/h5Auth.js：最终修复版（和小程序逻辑对齐）
import {
	getToken,
	setToken,
	removeToken
} from './storage';
import {
	getH5Token,
	getWxUserInfo
} from '@/api/demo.js';

// 全局锁：防重复授权
let isAuthorizing = false;

// 仅清理URL中的code/state，不删Token（核心修复）
const clearCodeInUrl = () => {
	if (window ?.location) {
		let url = window.location.href;
		url = url.replace(/[?&]code=[^&]*/, '').replace(/[?&]state=[^&]*/, '');
		window.history.replaceState(null, '', url);
		console.log('[clearCodeInUrl] 清除code后的URL：', url);
	}
	console.log('[clearCodeInUrl] 仅清理URL，不删除Token');
};

// 提取URL参数
export const getUrlParam = (name) => {
	console.log('[getUrlParam] ===== 开始提取URL参数 =====');
	if (!window ?.location) {
		console.log('[getUrlParam] 无window.location对象，返回null');
		console.log('[getUrlParam] ===== 提取参数结束 =====');
		return null;
	}
	const fullUrl = window.location.href;
	console.log('[getUrlParam] 当前页面完整URL：', fullUrl);

	const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
	const r = window.location.search.substr(1).match(reg);
	const value = r ? decodeURIComponent(r[2]) : null;
	console.log(`[getUrlParam] 截取${name}的值：`, value);
	console.log('[getUrlParam] ===== 提取参数结束 =====');
	return value;
};

// 跳转微信授权页
const redirectToWechatAuth = () => {
	console.log('[redirectToWechatAuth] ===== 开始跳转授权页 =====');
	const appId = 'wx8e8d3d70ba87e33c';
	const redirectUri = encodeURIComponent('https://www.tianjifu.com');
	const state = Date.now();
	const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=${state}#wechat_redirect`;

	console.log('[redirectToWechatAuth] 即将跳转的微信授权URL：', authUrl);
	window.location.href = authUrl;
	console.log('[redirectToWechatAuth] ===== 跳转授权页结束 =====');
};

// 用code换Token（和小程序login逻辑对齐）
const getTokenByCode = async (code) => {
	console.log('[getTokenByCode] ===== 开始用code换Token =====');
	console.log('[getTokenByCode] 待使用的code：', code);
	console.log('[getTokenByCode] 当前页面URL：', window.location.href);

	if (!code) {
		console.error('[getTokenByCode] 无code，终止Token换取流程');
		console.log('[getTokenByCode] ===== 换Token流程终止 =====');
		return {
			success: false,
			reason: '无授权码'
		};
	}

	try {
		// uni.showLoading({
		// 	title: '授权验证中...',
		// 	mask: true
		// });
		console.log('[getTokenByCode] 开始调用后端getH5Token接口，参数：', {
			jsCode: code
		});

		// 移除内部try/catch，和小程序一样用外层捕获错误
		const res = await getH5Token({
			jsCode: code
		});
		console.log('[getTokenByCode] 后端getH5Token接口返回：', JSON.stringify(res));

		// 和小程序逻辑对齐：判断code+token有效性
		const backendCode = res.code || res.status;
		const backendToken = res.data || res.token;

		if (backendCode != 200 || !backendToken) {
			throw new Error(`后端返回无效Token：${res.msg || "授权失败"}`);
		}

		// 仅存储Token，不调用任何删除操作（核心修复）
		setToken(backendToken);
		console.log('[getTokenByCode] Token存储成功：', backendToken);

		// 仅清理URL，不删Token（核心修复）
		clearCodeInUrl();

		// 同步全局Token（兜底）
		if (getApp() ?.globalData) {
			getApp().globalData.token = backendToken;
			getApp().updateGlobalToken(backendToken);
			console.log('[getTokenByCode] 已同步Token到全局：', backendToken);
		}
		return {
			success: true,
			token: backendToken
		};
	} catch (err) {
		const errMsg = err.message || '接口调用失败';
		uni.showToast({
			title: errMsg,
			icon: 'none',
			duration: 5000
		});
		console.error('[getTokenByCode] 换Token流程异常：', errMsg);
		removeToken(); // 失败才删Token
		console.log('[getTokenByCode] ===== 换Token流程失败 =====');
		return {
			success: false,
			reason: errMsg
		};
	} finally {
		uni.hideLoading();
	}
};

// 校验Token有效性（和小程序checkToken对齐）
export const checkH5Token = async () => {
	console.log('[checkH5Token] ===== 开始校验Token =====');
	const token = getToken();
	const invalidToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1IiwidXNlcklkIjoiNSIsIm9wZW5JZCI6Im9PRGRWMV9qc3VWdHVFRWYxbm9LQTZFbTFZcEUiLCJpc1N5c01hbmFnZSI6IjAiLCJ0aW1lU3RhbXAiOjE3Njk5OTk5MjQ3NDJ9.SDgOKGOnz6v6bMFOOuMP_znqXB-B3lFes6MO4tWWx7Q';

	console.log('[checkH5Token] 当前本地Token：', token);
	console.log('[checkH5Token] 无效Token对比值：', invalidToken);

	const isValid = !!token && token !== invalidToken;
	console.log('[checkH5Token] Token有效性：', isValid);
	console.log('[checkH5Token] ===== 校验Token结束 =====');
	return isValid;
};

// 适配App.vue的clearAllCodeRelated（仅清理URL，不删Token）
export const clearAllCodeRelated = () => {
	console.log('[clearAllCodeRelated] 仅清理URL中的code/state，不删Token');
	clearCodeInUrl();
};

// 核心：自动授权入口
export const h5WechatAuth = async () => {
	console.log('[h5WechatAuth] ===== 自动授权流程开始 =====');

	if (isAuthorizing) {
		console.log('[h5WechatAuth] 授权锁已开启，跳过本次授权');
		console.log('[h5WechatAuth] ===== 自动授权流程终止 =====');
		return false;
	}
	isAuthorizing = true;

	try {
		const h5TokenValid = await checkH5Token();
		if (h5TokenValid) {
			console.log('[h5WechatAuth] Token有效，无需授权');
			console.log('[h5WechatAuth] ===== 自动授权流程结束（Token有效）=====');
			isAuthorizing = false;
			return true;
		}

		const code = getUrlParam('code');
		if (code) {
			console.log('[h5WechatAuth] 检测到URL中有code，执行换Token流程');
			const authResult = await getTokenByCode(code);
			isAuthorizing = false;
			console.log('[h5WechatAuth] ===== 自动授权流程结束（换Token）=====');
			return authResult.success;
		}

		console.log('[h5WechatAuth] URL中无code，跳转微信授权页');
		redirectToWechatAuth();
		isAuthorizing = false;
		console.log('[h5WechatAuth] ===== 自动授权流程结束（跳转授权页）=====');
		return false;
	} catch (error) {
		console.error('[h5WechatAuth] 自动授权流程异常：', error);
		isAuthorizing = false;
		console.log('[h5WechatAuth] ===== 自动授权流程异常终止 =====');
		return false;
	}
};