// utils/storage.js：Token 本地存储（uni-app 跨环境兼容）
const TOKEN_KEY = 'wx_miniprogram_token'; // 定义 Token 存储的 key

// 存储 Token 到本地
export const setToken = (token) => {
	if (!token || typeof token !== 'string') {
		console.warn("存储 Token 失败：无效的 Token 格式");
		return false;
	}
	try {
		uni.setStorageSync(TOKEN_KEY, token); // 同步存储，确保后续能立即读取
		return true;
	} catch (error) {
		console.error("存储 Token 到本地失败：", error);
		return false;
	}
};

// 从本地读取 Token
export const getToken = () => {
	try {
		return uni.getStorageSync(TOKEN_KEY) || '';
	} catch (error) {
		console.error("从本地读取 Token 失败：", error);
		return '';
	}
};

// 从本地删除 Token
export const removeToken = () => {
	try {
		uni.removeStorageSync(TOKEN_KEY);
		return true;
	} catch (error) {
		console.error("从本地删除 Token 失败：", error);
		return false;
	}
};