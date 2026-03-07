// 全局微信分享配置工具 - 解决快速点击导致的失败问题
import {
    getH5ShareInfo
} from '@/api/demo';

// 全局状态管理
const shareState = {
    isReady: false, // 分享是否就绪（config成功）
    isLoading: false, // 是否正在初始化分享
    retryCount: 0, // 重试次数
    maxRetry: 3, // 最大重试次数
    shareLock: false, // 分享锁：防止重复点击
    wxInstance: null // 缓存jWeixin实例
};

/**
 * 初始化微信分享配置（预加载 + 自动重试）
 * @param {Object} shareConfig 分享卡片配置（title/desc/posterUrl）
 * @returns {Promise} 初始化结果
 */
export async function initWxShare(shareConfig) {
    // 非H5/非微信环境直接返回成功（不影响其他环境）
    if (process.env.VUE_APP_PLATFORM !== 'h5' || !/MicroMessenger/i.test(navigator.userAgent)) {
        shareState.isReady = true;
        return Promise.resolve();
    }

    // 正在加载中，直接返回等待中的Promise
    if (shareState.isLoading) {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (!shareState.isLoading) {
                    clearInterval(checkInterval);
                    resolve(shareState.isReady);
                }
            }, 100);
        });
    }

    // 已就绪，直接返回成功
    if (shareState.isReady) {
        return Promise.resolve(true);
    }

    shareState.isLoading = true;
    shareState.retryCount = 0;

    try {
        // 1. 等待jWeixin加载完成（带超时）
        shareState.wxInstance = await waitForJWeixinReady();
        // 2. 延迟获取URL（等路由/参数稳定，避免URL不匹配）
        const currentUrl = await getStableUrl();
        // 3. 执行签名 + 配置（带重试）
        await doWxConfig(shareState.wxInstance, currentUrl, shareConfig);
        shareState.isReady = true;
        return Promise.resolve(true);
    } catch (err) {
        console.error('微信分享初始化失败：', err);
        shareState.isReady = false;
        return Promise.reject(err);
    } finally {
        shareState.isLoading = false;
    }
}

/**
 * 安全执行分享操作（带锁 + 就绪检查）
 * @param {Object} shareConfig 分享配置
 * @param {Function} successCallback 分享成功回调（赠币）
 */
export async function safeShare(shareConfig, successCallback) {
    // 1. 加分享锁，防止重复点击
    if (shareState.shareLock) {
        uni.showToast({
            title: '分享中，请稍候...',
            icon: 'none'
        });
        return;
    }

    // 2. 检查分享是否就绪，未就绪则先初始化 + 提示
    if (!shareState.isReady) {
        uni.showToast({
            title: '分享配置加载中...',
            icon: 'none',
            duration: 1500
        });
        try {
            await initWxShare(shareConfig);
        } catch (err) {
            uni.showToast({
                title: '分享配置加载失败，请重试',
                icon: 'none'
            });
            return;
        }
    }

    // 3. 执行分享配置 + 监听
    shareState.shareLock = true;
    try {
        setWxShareContent(shareState.wxInstance, shareConfig, () => {
            // 执行赠币回调
            if (typeof successCallback === 'function') {
                successCallback();
            }
            // 解锁
            shareState.shareLock = false;
        });
    } catch (err) {
        console.error('执行分享操作失败：', err);
        shareState.shareLock = false;
        uni.showToast({
            title: '分享失败，请重试',
            icon: 'none'
        });
    }
}

/**
 * 等待jWeixin加载完成（带超时5秒）
 */
async function waitForJWeixinReady(timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkTimer = setInterval(() => {
            // 强制使用jWeixin，拒绝uni-app的wx对象
            if (window.jWeixin && typeof window.jWeixin.config === 'function') {
                clearInterval(checkTimer);
                resolve(window.jWeixin);
            }
            // 超时失败
            if (Date.now() - startTime > timeout) {
                clearInterval(checkTimer);
                reject(new Error('微信SDK加载超时，请检查网络'));
            }
        }, 50);
    });
}

/**
 * 获取稳定的URL（延迟300ms + 监听hash变化）
 */
async function getStableUrl(delay = 300) {
    // 延迟等待路由稳定
    await new Promise(resolve => setTimeout(resolve, delay));
    // 获取#前的完整URL
    return window.location.href.split('#').shift();
}

/**
 * 执行wx.config配置（带自动重试）
 */
async function doWxConfig(wx, url, shareConfig) {
    return new Promise(async (resolve, reject) => {
        try {
            // 调用后端签名接口（加时间戳防缓存）
            const res = await getH5ShareInfo({
                shareUrl: url,
                _t: Date.now() // 禁用接口缓存
            });
            const wxConfig = res.data;

            // 执行config配置
            wx.config({
                debug: false,
                appId: wxConfig.appId,
                timestamp: wxConfig.timestamp,
                nonceStr: wxConfig.nonceStr,
                signature: wxConfig.signature,
                jsApiList: [
                    'updateAppMessageShareData',
                    'updateTimelineShareData',
                    'onMenuShareAppMessage',
                    'onMenuShareTimeline'
                ],
                beta: true // 提高兼容性
            });

            // config成功回调
            wx.ready(() => {
                console.log('微信config配置成功');
                resolve();
            });

            // config失败回调（带重试）
            wx.error(async (err) => {
                console.error(`微信config失败（第${shareState.retryCount + 1}次）：`, err);
                // 签名无效且未到最大重试次数，重试
                if (err.errMsg.includes('invalid signature') && shareState.retryCount < shareState.maxRetry) {
                    shareState.retryCount++;
                    setTimeout(async () => {
                        try {
                            await doWxConfig(wx, await getStableUrl(500), shareConfig);
                            resolve();
                        } catch (retryErr) {
                            reject(retryErr);
                        }
                    }, 500);
                } else {
                    reject(new Error(`微信config失败：${err.errMsg}（已重试${shareState.maxRetry}次）`));
                }
            });
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * 设置分享内容 + 监听分享成功
 */
function setWxShareContent(wx, shareConfig, successCallback) {
    const {
        title,
        desc,
        posterUrl
    } = shareConfig;
    const link = window.location.href.split('#').shift();

    // 校验必填参数
    if (!title || !posterUrl) {
        throw new Error('分享配置缺失：title和posterUrl为必填项');
    }

    // 新版接口
    wx.updateAppMessageShareData({
        title,
        desc: desc || '',
        link,
        imgUrl: posterUrl,
        success: () => {
            console.log('分享给朋友成功');
            successCallback();
        }
    });

    wx.updateTimelineShareData({
        title,
        link,
        imgUrl: posterUrl,
        success: () => {
            console.log('分享到朋友圈成功');
            successCallback();
        }
    });

    // 兼容旧版接口
    wx.onMenuShareAppMessage({
        title,
        desc: desc || '',
        link,
        imgUrl: posterUrl,
        success: () => {
            console.log('旧版分享给朋友成功');
            successCallback();
        }
    });

    wx.onMenuShareTimeline({
        title,
        link,
        imgUrl: posterUrl,
        success: () => {
            console.log('旧版分享到朋友圈成功');
            successCallback();
        }
    });
}

/**
 * 重置分享状态（页面切换时调用）
 */
export function resetShareState() {
    shareState.isReady = false;
    shareState.shareLock = false;
    shareState.retryCount = 0;
}