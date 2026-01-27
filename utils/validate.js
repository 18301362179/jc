// utils/validate.js
/**
 * 投注倍数输入实时校验（输入框专用，立刻修正）
 * @param {string|number} value - 输入框原始值
 * @returns {number} 修正后的合法值（1-50整数）
 */
export function validateBetInput(value) {
	// 1. 空值/非数字 → 返回1
	if (!value || isNaN(Number(value))) {
		return 1;
	}
	// 2. 转数字并取整
	let num = Math.floor(Number(value));
	// 3. 大于50 → 返回50；小于1 → 返回1；否则返回自身
	return num > 50 ? 50 : (num < 1 ? 1 : num);
}