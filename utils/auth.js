// utils/auth.js：完整版（兼容无 ?. 环境），实现传 code 拿 Token 并存储
import {
	setToken,
	getToken,
	removeToken
} from './storage';
// 引入你 api 文件中的 wxLogin 方法
import {
	wxLogin
} from '@/api/demo.js'; // 替换为你的 api 文件名（如 api/football.js）

// 登录锁：防止重复请求
let isLoggingIn = false;

export const login = async () => {
	// 已有登录流程执行中，等待其完成
	if (isLoggingIn) {
		return new Promise((resolve) => {
			const checkLoginStatus = setInterval(() => {
				if (!isLoggingIn) {
					clearInterval(checkLoginStatus);
					resolve(login());
				}
			}, 50);
		});
	}

	isLoggingIn = true;

	try {
		// 步骤1：调用 uni.login() 获取 code（适配二元数组返回格式）
		const loginRes = await uni.login({
			timeout: 5000
		});
		console.log("uni.login() 原始返回结果：", loginRes);

		// 提取有效结果（适配对象/二元数组两种格式）
		let loginResult = null;
		if (Array.isArray(loginRes)) {
			loginResult = loginRes[1]; // 二元数组：取第 1 项
		} else {
			loginResult = loginRes; // 常规格式：直接使用
		}

		// 校验 code 是否有效
		if (!loginResult || !loginResult.code) {
			throw new Error("未获取到有效微信 code，无法继续登录");
		}
		const validCode = loginResult.code;
		console.log("成功提取有效 code：", validCode);

		// 步骤2：调用你的 wxLogin() 方法，将 code 传递给后端
		console.log("开始调用后端 wxLogin 接口，传递 code 获取 Token");
		const backendRes = await wxLogin({
			jsCode: validCode // 传递 code 给后端，参数名按后端要求调整（默认传 code）
		});

		// 步骤3：校验后端返回结果，提取 Token（替换 ?.，使用 && 做兼容判断）
		console.log("后端 wxLogin 接口返回结果：", backendRes);
		// 此处根据你的后端实际返回格式调整，示例：后端返回 { code: 200, data: { token: "xxx" }, msg: "成功" }
		const backendCode = backendRes.code || backendRes.status;

		// 逻辑：先判断 backendRes.data 是否存在，存在再取其 token 属性，不存在则返回 undefined
		const backendToken = (backendRes.data) || backendRes.token;

		if (backendCode != 200 || !backendToken) {
			throw new Error(`后端返回无效 Token：${backendRes.msg || "登录失败"}`);
		}

		// 步骤4：将 Token 存储到本地（持久化）
		const isStoreSuccess = setToken(backendToken);
		if (!isStoreSuccess) {
			throw new Error("Token 存储到本地失败");
		}

		// 步骤5：返回结构化成功结果
		console.log("完整登录流程成功：code 传后端 → 拿 Token → 存本地 全部完成");
		return {
			success: true,
			code: validCode,
			token: backendToken,
			data: backendRes.data
		};

	} catch (error) {
		console.error("登录流程异常：", error);
		// 异常时清除无效 Token，避免残留
		removeToken();
		return {
			success: false,
			message: error.message || "登录失败，请重试"
		};
	} finally {
		// 无论成功/失败，释放登录锁
		isLoggingIn = false;
	}
};

// 恢复 Token 校验方法（用于 App.vue 启动时校验）
export const checkToken = async () => {
	const token = getToken();
	// 简单校验：本地存在 Token 即视为有效（复杂校验可后续对接后端 Token 验证接口）
	if (!token) {
		
		return false;
	}
	console.log("本地存在有效 Token");
	return true;
};