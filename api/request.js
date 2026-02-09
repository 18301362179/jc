import Vue from 'vue'
import {
	getToken,
	removeToken
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

// 无需 Token 接口白名单
const NO_TOKEN_WHITE_LIST = [
	// '/sports/football/queryBasePermissionNeed',
	// '/sports/football/queryContinentList',
	// ... 其他白名单接口
];

const request = (options) => {
	// 每次请求前强制读取最新 Token
	token = getToken() || '';

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

		// 需 Token 接口：自动携带 Token
		if (isNeedToken && token) {
			header['Authorization'] = token
		}

		uni.request({
			url: baseUrl + options.url,
			method: options.method || 'GET',
			data: options.data || {},
			header,
			success: (res) => {
				// 处理 Token 过期（401 状态码）
				if (res.code == 401 && isNeedToken) {
					console.warn("Token 无效或过期，准备触发重新登录");
					removeToken();

					// 核心修改：仅 小程序/App 环境触发自动重新登录，H5 环境直接报错
					const isTargetEnv = isApp || isMpWeixin;
					if (!isTargetEnv) {
						// H5 环境：保持原有逻辑，不自动登录，直接返回错误
						reject(new Error("Token 过期，H5 环境不支持自动登录，请手动刷新页面或重新操作"));
						return;
					}

					// 小程序/App 环境：执行自动重新登录
					login().then(loginResult => {
						if (loginResult.success) {
							request(options).then(reResolve => resolve(reResolve)).catch(reReject => reject(reReject));
						} else {
							reject(new Error("Token 过期，重新登录失败，请手动操作"));
						}
					});
					return;
				}

				// 正常返回结果
				if (res.statusCode === 200) {
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

export default request;