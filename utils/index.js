// utils/index.js

/**
 * 计算胜文字的显示颜色
 * @param {string} rateStr - 胜字符串（如"60%"）
 * @param {string} type - 类型：home/away（主/客胜）、draw（平局）
 * @param {boolean} isSelected - 是否被选中（新增参数）
 * @returns {string} 文字颜色值
 */
export const getRateColor = (rateStr, type, isSelected) => {
	// 优先判断：如果被选中，直接返回白色
	if (isSelected === true) {
		return '#fff';
	}

	// 原有容错处理：如果rateStr为空/不是字符串，返回空（使用默认样式）
	if (!rateStr || typeof rateStr !== 'string') return '';

	// 处理百分比字符串，转换为小数（如"60%" → 0.6）
	const rate = parseFloat(rateStr.replace('%', '')) / 100;

	// 容错：转换失败则返回空（使用默认样式）
	if (isNaN(rate)) return '';

	// 未被选中时，按原规则判断颜色
	if (type === 'home' || type === 'away') {
		// 主/客队胜 ≥ 0.6（60%）显示绿色，否则返回空（默认色）
		return rate >= 0.6 ? '#31926e' : '';
	} else if (type === 'draw') {
		// 平局胜 ≥ 0.5（50%）显示绿色，否则返回空（默认色）
		return rate >= 0.5 ? '#31926e' : '';
	}

	// 默认返回空（使用默认样式）
	return '';
};

// 兼容小程序CommonJS模块化
module.exports = {
	getRateColor
};