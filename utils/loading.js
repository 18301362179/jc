// utils/loading.js

// 标记loading状态，防止重复显示/关闭
let isLoadingActive = false;

/**
 * 显示加载提示
 * @param {string} title - 提示文字（默认："加载中..."）
 * @param {boolean} mask - 是否显示遮罩（默认：true，防止用户点击）
 */
export const showLoading = (title = '加载中...', mask = true) => {
    if (!isLoadingActive) {
        uni.showLoading({
            title,
            mask
        });
        isLoadingActive = true;
    }
};

/**
 * 关闭加载提示
 */
export const hideLoading = () => {
    if (isLoadingActive) {
        uni.hideLoading();
        isLoadingActive = false;
    }
};