import Vue from 'vue'
import {
	getToken,
	removeToken,
	setToken // 保留setToken，用于存储登录获取的Token
} from '@/utils/storage';
import {
	login
} from '@/utils/auth';

// 统一 Token 键名，和 storage.js 保持一致
let token = getToken() || ''; // 移除兜底 Token，仅目标环境自动获取

let isApp = false;
let isH5 = false;
let isMpWeixin = false; // 新增：标记微信小程序环境

// 检测各环境
try {
	if (typeof plus !== 'undefined') {
		isApp = true;
	}
} catch (e) {
	isApp = false;
}

if (!isApp) {
	try {
		if (typeof window !== 'undefined' && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
			isH5 = true;
		}
	} catch (e) {
		isH5 = false;
	}
}

// 检测微信小程序环境
try {
	if (typeof wx !== 'undefined' && wx.getAccountInfoSync) {
		isMpWeixin = true;
	}
} catch (e) {
	isMpWeixin = false;
}

// 核心改动1：拆分域名和协议，方便根据环境切换http/https
const domain = 'www.tianjifu.com/qwxt';
// 【唯一核心修改】修复协议写反的问题：生产环境用https，开发环境用http
const protocol = process.env.NODE_ENV === 'production' ? 'https:' : 'https:';
// 拼接最终的基础域名（带协议）
const apiDomain = `${protocol}//${domain}`;

// 根据环境设置基础路径
let baseUrl = '';
if (isH5) {
	// H5环境：保持原有逻辑不变，开发用代理，生产用真实域名
	baseUrl = process.env.NODE_ENV === 'development' ? '' : apiDomain;
} else if (isApp || isMpWeixin) {
	// 小程序/App 环境：直接使用拼接好的域名（开发http，生产https）
	baseUrl = apiDomain;
} else {
	baseUrl = apiDomain;
	console.warn('未知环境，使用默认接口地址');
}

// 新增：无需 Token 接口白名单（仅login接口豁免）
// 请替换为你项目中实际的login接口路径（比如/api/user/login）
const NO_TOKEN_WHITE_LIST = [
	'/auth/login/weChatMiniProgram',
	'/auth/login/weChatServiceAccount/getAppInfo',
	'/auth/login/weChatServiceAccount'
];

// 封装实际的请求逻辑（内部使用）
const doRequest = (options, token) => {
	// 判断当前接口是否需要携带 Token
	const isNeedToken = !NO_TOKEN_WHITE_LIST.some(item => {
		return options.url.includes(item);
	});

	return new Promise((resolve, reject) => {
		// 构造请求头
		const header = {
			'Content-Type': 'application/json',
			...options.header
		};

		// 核心调整：仅需要Token的接口才携带Token
		if (isNeedToken && token) {
			header['Authorization'] = token;
		}

		uni.request({
			url: baseUrl + options.url,
			method: options.method || 'GET',
			data: options.data || {},
			header,
			success: (res) => {
				// 处理 Token 过期（401 状态码）：兼容小程序(statusCode)和后端自定义code
				if ((res.data.code == 401 || res.data.code == 401) && isNeedToken) {
					console.warn("Token 无效或过期，准备触发重新登录");
					removeToken();

					// H5环境：触发微信公众号重新授权
					if (isH5) {
						reject(new Error("Token 过期，H5 环境正在重新授权..."));
						// 异步调用H5授权逻辑，不阻塞主流程
						import('@/utils/h5Auth.js').then(({
							h5WechatAuth
						}) => {
							h5WechatAuth().catch(err => console.error("H5重新授权失败：", err));
						});
						return;
					}
					// 小程序/App 环境：保留原有重新登录逻辑
					else if (isApp || isMpWeixin) {
						login().then(loginResult => {
							if (loginResult.success) {
								setToken(loginResult.token); // 存储新Token
								doRequest(options, loginResult.token).then(reResolve => resolve(reResolve)).catch(reReject => reject(reReject));
							} else {
								reject(new Error("Token 过期，重新登录失败，请手动操作"));
							}
						});
						return;
					}
				}

				// 正常返回结果（保留原有逻辑）
				if (res.data.code == 200) {
					resolve(res.data)
				} else {
					reject(res.data)
				}
			},
			fail: (err) => {
				reject(err)
			}
		})
	})
}

const request = (options) => {
	// 每次请求前强制读取最新 Token（从本地存储）
	token = getToken() || '';
	// 判断当前接口是否需要Token
	const isNeedToken = !NO_TOKEN_WHITE_LIST.some(item => {
		return options.url.includes(item);
	});

	// 核心逻辑：
	// 1. 无需Token的接口（login）：直接请求，不校验Token
	// 2. 需要Token的接口：有Token直接请求，无Token先登录获取Token再请求
	if (!isNeedToken) {
		// login接口：直接请求，无需Token
		return doRequest(options, token);
	} else {
		// 非login接口：需要Token
		if (token) {
			// 有Token，直接发起请求
			return doRequest(options, token);
		} else {
			// 无Token：分环境处理（H5走微信授权，小程序/App走原有login）
			console.warn("本地无Token，先执行登录逻辑获取Token");
			return new Promise(async (resolve, reject) => {
				try {
					let loginResult = {};
					// H5环境：调用微信公众号授权
					if (isH5) {
						const {
							h5WechatAuth
						} = await import('@/utils/h5Auth.js');
						const isAuthSuccess = await h5WechatAuth();
						loginResult = {
							success: isAuthSuccess,
							token: getToken() || ''
						};
					}
					// 小程序/App环境：保留原有login逻辑
					else if (isApp || isMpWeixin) {
						loginResult = await login();
					}

					if (loginResult.success) {
						// 登录/授权成功，存储Token并发起原请求
						token = loginResult.token;
						setToken(token);
						resolve(await doRequest(options, token));
					} else {
						reject(new Error("获取Token失败，无法发起请求，请检查登录逻辑"));
					}
				} catch (err) {
					reject(new Error(`登录获取Token出错：${err.message}`));
				}
			});
		}
	}
}

export default request;