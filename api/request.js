import Vue from 'vue'
import {
	getToken,
	removeToken,
	setToken
} from '@/utils/storage';
import {
	login
} from '@/utils/auth';

let token = getToken() || '';
let isApp = false;
let isH5 = false;
let isMpWeixin = false;

// ========== 日志：环境检测开始 ==========
console.log('[Request封装] 开始检测运行环境');
// 环境检测逻辑
try {
	if (typeof plus !== 'undefined') {
		isApp = true;
		console.log('[Request封装] 检测到App环境');
	}
} catch (e) {
	isApp = false;
	console.warn('[Request封装] 检测App环境失败：', e.message);
}

if (!isApp) {
	try {
		if (typeof window !== 'undefined' && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
			isH5 = true;
			console.log('[Request封装] 检测到H5环境');
		}
	} catch (e) {
		isH5 = false;
		console.warn('[Request封装] 检测H5环境失败：', e.message);
	}
}

try {
	if (typeof wx !== 'undefined' && wx.getAccountInfoSync) {
		isMpWeixin = true;
		console.log('[Request封装] 检测到微信小程序环境');
	}
} catch (e) {
	isMpWeixin = false;
	console.warn('[Request封装] 检测微信小程序环境失败：', e.message);
}
console.log('[Request封装] 环境检测完成 - App：%s，H5：%s，微信小程序：%s', isApp, isH5, isMpWeixin);
// ========== 日志：环境检测结束 ==========

// 域名/协议逻辑
const domain = 'www.tianjifu.com/qwxt';
const protocol = process.env.NODE_ENV === 'production' ? 'https:' : 'https:';
const apiDomain = `${protocol}//${domain}`;
console.log('[Request封装] 拼接接口域名 - 协议：%s，域名：%s，最终：%s', protocol, domain, apiDomain);

let baseUrl = '';
if (isH5) {
	baseUrl = process.env.NODE_ENV === 'development' ? '' : apiDomain;
} else if (isApp || isMpWeixin) {
	baseUrl = apiDomain;
} else {
	baseUrl = apiDomain;
	console.warn('[Request封装] 未知环境，使用默认接口地址：%s', baseUrl);
}
console.log('[Request封装] 最终基础接口地址：%s', baseUrl);

// 白名单
const NO_TOKEN_WHITE_LIST = [
	'/auth/login/weChatMiniProgram',
	'/auth/login/weChatServiceAccount/getAppInfo',
	'/auth/login/weChatServiceAccount'
];
console.log('[Request封装] Token豁免白名单：', NO_TOKEN_WHITE_LIST);

// 全局锁 + 重试队列
let isRefreshingToken = false; // 防重复授权/登录
let retryRequests = []; // 存储401后等待重试的请求
console.log('[Request封装] 初始化全局状态 - 刷新Token锁：%s，重试队列长度：%d', isRefreshingToken, retryRequests.length);

// 封装授权/登录逻辑（抽离复用）
const refreshToken = async () => {
	console.log('[Request封装][refreshToken] 开始执行重新授权/登录逻辑');
	if (isRefreshingToken) {
		console.log('[Request封装][refreshToken] 已有正在进行的授权/登录操作，直接返回');
		return;
	}
	isRefreshingToken = true;
	console.log('[Request封装][refreshToken] 刷新Token锁已开启');

	try {
		let newToken = '';
		// H5环境：微信公众号重新授权
		if (isH5) {
			console.log('[Request封装][refreshToken] H5环境，调用微信公众号重新授权');
			const {
				h5WechatAuth
			} = await import('@/utils/h5Auth.js');
			const authSuccess = await h5WechatAuth();
			newToken = getToken() || '';
			console.log('[Request封装][refreshToken] H5授权结果 - 成功：%s，新Token：%s', authSuccess, newToken ? '已获取' : '未获取');
			if (!authSuccess || !newToken) {
				throw new Error("H5微信授权失败，未获取到新Token");
			}
		}
		// 小程序/App环境：原有登录逻辑
		else if (isApp || isMpWeixin) {
			console.log('[Request封装][refreshToken] %s环境，执行原有登录逻辑', isApp ? 'App' : '微信小程序');
			const loginResult = await login();
			if (!loginResult.success) {
				throw new Error(`小程序/App重新登录失败：${loginResult.msg || '未知错误'}`);
			}
			newToken = loginResult.token;
			setToken(newToken); // 存储新Token
			console.log('[Request封装][refreshToken] %s登录成功，新Token已存储', isApp ? 'App' : '微信小程序');
		}

		// 授权/登录成功：重试所有等待的请求
		console.log('[Request封装][refreshToken] 重新授权/登录成功，开始重试队列中的请求（数量：%d）', retryRequests.length);
		retryRequests.forEach((cb, index) => {
			console.log('[Request封装][refreshToken] 重试第%d个请求', index + 1);
			cb(newToken);
		});
		retryRequests = [];
		console.log('[Request封装][refreshToken] 重试队列已清空');
		return newToken;
	} catch (err) {
		console.error('[Request封装][refreshToken] 重新授权/登录失败：', err.message);
		// 失败：拒绝所有等待的请求
		console.log('[Request封装][refreshToken] 开始拒绝队列中的请求（数量：%d）', retryRequests.length);
		retryRequests.forEach((cb, index) => {
			console.log('[Request封装][refreshToken] 拒绝第%d个请求', index + 1);
			cb(null);
		});
		retryRequests = [];
		throw err;
	} finally {
		isRefreshingToken = false;
		console.log('[Request封装][refreshToken] 刷新Token锁已关闭');
	}
};

// 封装实际的请求逻辑（内部使用）
const doRequest = (options, token) => {
	const isNeedToken = !NO_TOKEN_WHITE_LIST.some(item => {
		return options.url.includes(item);
	});
	console.log('[Request封装][doRequest] 开始处理请求 - URL：%s，是否需要Token：%s，当前Token：%s',
		options.url, isNeedToken, token ? '有' : '无');

	return new Promise((resolve, reject) => {
		// 构造请求头
		const header = {
			'Content-Type': 'application/json',
			...options.header
		};

		// 核心调整：仅需要Token的接口才携带Token
		if (isNeedToken && token) {
			header['Authorization'] = token;
			console.log('[Request封装][doRequest] 已为请求添加Authorization头');
		}

		console.log('[Request封装][doRequest] 发起请求 - 完整URL：%s，请求方法：%s', baseUrl + options.url, options.method || 'GET');
		uni.request({
			url: baseUrl + options.url,
			method: options.method || 'GET',
			data: options.data || {},
			header,
			success: (res) => {
				console.log('[Request封装][doRequest] 请求响应 - 状态码：%s，业务码：%s', res.statusCode, res.data.code || '无');

				// 处理401 Token失效
				if ((res.data.code == 401 || res.code == 401) && isNeedToken) {
					console.error('[Request封装][doRequest] 检测到401 Token失效 - URL：%s', options.url);
					removeToken(); // 清除失效Token
					console.log('[Request封装][doRequest] 已清除本地失效Token');

					// 核心修改：401后加入重试队列
					console.log('[Request封装][doRequest] 将请求加入重试队列 - URL：%s', options.url);
					retryRequests.push((newToken) => {
						if (newToken) {
							console.log('[Request封装][doRequest] 重试请求 - URL：%s（新Token已获取）', options.url);
							doRequest(options, newToken).then(resolve).catch(reject);
						} else {
							console.error('[Request封装][doRequest] 拒绝重试请求 - URL：%s（重新授权/登录失败）', options.url);
							reject(new Error("Token失效，重新授权/登录失败"));
						}
					});

					// 首次触发：执行授权/登录逻辑
					if (!isRefreshingToken) {
						console.log('[Request封装][doRequest] 首次触发401，调用refreshToken()重新授权/登录');
						refreshToken().catch(err => {
							console.error('[Request封装][doRequest] refreshToken执行失败：', err.message);
						});
					} else {
						console.log('[Request封装][doRequest] 已有正在进行的refreshToken操作，等待完成后重试');
					}
					return;
				}

				// 正常返回逻辑
				if (res.data.code == 200) {
					console.log('[Request封装][doRequest] 请求成功 - URL：%s，响应数据：%o', options.url, res.data);
					resolve(res.data)
				} else {
					console.warn('[Request封装][doRequest] 请求业务失败 - URL：%s，错误码：%s，错误信息：%s',
						options.url, res.data.code, res.data.msg || '无');
					reject(res.data)
				}
			},
			fail: (err) => {
				console.error('[Request封装][doRequest] 请求网络失败 - URL：%s，错误信息：%o', options.url, err);
				reject(err)
			}
		})
	})
}

const request = (options) => {
	// 每次请求前强制读取最新 Token
	token = getToken() || '';
	console.log('[Request封装][request] 发起新请求 - URL：%s，本地最新Token：%s', options.url, token ? '有' : '无');

	const isNeedToken = !NO_TOKEN_WHITE_LIST.some(item => {
		return options.url.includes(item);
	});
	console.log('[Request封装][request] 请求URL：%s，是否在白名单（无需Token）：%s', options.url, !isNeedToken);

	if (!isNeedToken) {
		// login接口：直接请求，无需Token
		console.log('[Request封装][request] 请求在白名单内，直接发起请求 - URL：%s', options.url);
		return doRequest(options, token);
	} else {
		// 非login接口：需要Token
		if (token) {
			// 有Token，直接发起请求
			console.log('[Request封装][request] 本地有Token，直接发起请求 - URL：%s', options.url);
			return doRequest(options, token);
		} else {
			// 无Token：分环境处理
			console.warn('[Request封装][request] 本地无Token，先执行登录/授权逻辑 - URL：%s', options.url);
			return new Promise(async (resolve, reject) => {
				try {
					let loginResult = {};
					// H5环境：调用微信公众号授权
					if (isH5) {
						console.log('[Request封装][request] H5环境，执行微信公众号授权');
						const {
							h5WechatAuth
						} = await import('@/utils/h5Auth.js');
						const isAuthSuccess = await h5WechatAuth();
						loginResult = {
							success: isAuthSuccess,
							token: getToken() || ''
						};
						console.log('[Request封装][request] H5授权结果 - 成功：%s，Token：%s', isAuthSuccess, loginResult.token ? '有' : '无');
					}
					// 小程序/App环境：保留原有login逻辑
					else if ( isMpWeixin) {
						console.log('[Request封装][request] %s环境，执行登录逻辑', isApp ? 'App' : '微信小程序');
						loginResult = await login();
						console.log('[Request封装][request] %s登录结果 - 成功：%s，Token：%s',
							isApp ? 'App' : '微信小程序', loginResult.success, loginResult.token ? '有' : '无');
					} else {
						// App端微信授权登录
						// uni.login({
						// 	provider: 'weixin', // 指定微信登录
						// 	success: (res) => {
						// 		// 获取微信登录临时凭证code
						// 		const code = res.code;
						// 		// 将code传给后端，后端调用微信开放平台接口换取openid/unionid
						// 		uni.request({
						// 			url: '你的后端接口/weixin/app/login',
						// 			method: 'POST',
						// 			data: {
						// 				code
						// 			},
						// 			success: (response) => {
						// 				// 后端返回用户信息，完成登录
						// 				console.log('授权成功：', response.data);
						// 			},
						// 			fail: (err) => {
						// 				console.error('授权失败：', err);
						// 			}
						// 		});
						// 	},
						// 	fail: (err) => {
						// 		console.error('微信登录调用失败：', err);
						// 	}
						// });
						let t = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI3NyIsInVzZXJJZCI6Ijc3Iiwib3BlbklkIjoib29iNk4yR210S3V2c1dxTW1fb19wSzI4LUxmMCIsImlzU3lzTWFuYWdlIjoiMCIsInRpbWVTdGFtcCI6MTc3MjU4ODE5MDQwNn0.ULO_i27weyfFPIEFzCxhy0OWzGjVFe0JwAyrwOSQxBg"
						token = t;
						setToken(t);
						loginResult = {
							success: true,
							token: t
						};	
					}

					if (loginResult.success) {
						token = loginResult.token;
						setToken(token);
						console.log('[Request封装][request] 登录/授权成功，存储Token并发起原请求 - URL：%s', options.url);
						resolve(await doRequest(options, token));
					} else {
						console.error('[Request封装][request] 登录/授权失败，无法发起请求 - URL：%s', options.url);
						reject(new Error("获取Token失败，无法发起请求，请检查登录逻辑"));
					}
				} catch (err) {
					console.error('[Request封装][request] 登录/授权过程异常 - URL：%s，错误信息：%s', options.url, err.message);
					reject(new Error(`登录获取Token出错：${err.message}`));
				}
			});
		}
	}
}

export default request;