// utils/lotteryBonusUtils.js （新建该文件，存放通用奖金计算方法）

/**
 * 通用彩票预计计算方法（支持足球/篮球所有编辑页面）
 * @param {Array} selectedMatchList - 选中的赛事列表（核心入参，格式见下方说明）
 * @param {Number} betCount - （必填，如1、2、3）
 * @returns {String} 格式化的奖金文本（单值："预计：XX.XX元"；区间值："预计：XX.XX元 约 XX.XX元"）
 * 
 * @selectedMatchList 入参格式（每个赛事对象必须包含以下字段，足球/篮球通用）：
 * [
 *   {
 *     // 玩法对应的选中项赔率（至少包含1个有效赔率，支持多选中）
 *     selectedOdds: [3.5, 2.8, 4.2], // 核心字段：当前赛事选中的所有赔率（数字类型，去重无效值）
 *     isSelected: true // 可选：标记该赛事是否被选中（用于过滤未选中赛事）
 *   },
 *   ...
 * ]
 * 说明：足球（半全场、胜平负）、篮球（让分胜负、大小分）均按此格式构造入参，方法不关心具体玩法，只处理赔率数值
 */
export function calculateLotteryBonus(selectedMatchList = [], betCount = 1) {
	// 步骤1：边界判断（空列表、无效）
	const validBetCount = Math.max(1, Number(betCount) || 1); // 至少为1，处理非数字情况
	if (!Array.isArray(selectedMatchList) || selectedMatchList.length === 0) {
		return "预计：0.00";
	}

	// 步骤2：过滤有效赛事（已选中 + 包含有效赔率），收集每行选中的赔率数组
	const rowValidOddsList = [];
	selectedMatchList.forEach(matchItem => {
		// 过滤：赛事未选中 或 无有效选中赔率数组，直接跳过
		if (matchItem.isSelected === false || !Array.isArray(matchItem.selectedOdds)) {
			return;
		}

		// 处理当前赛事的赔率：过滤非数字、小于等于0的无效赔率，转换为纯数字数组
		const validOdds = matchItem.selectedOdds
			.map(odds => Number(odds) || 0) // 转换为数字，无效值设为0
			.filter(odds => odds > 0); // 只保留大于0的有效赔率

		// 仅收集包含有效赔率的赛事行
		if (validOdds.length > 0) {
			rowValidOddsList.push(validOdds);
		}
	});

	// 步骤3：边界判断（无有效赔率行）
	if (rowValidOddsList.length === 0) {
		return "预计：0.00";
	}

	// 步骤4：判断是否所有行都仅选中1项（区分单值/区间值）
	const isAllSingleSelect = rowValidOddsList.every(oddsArr => oddsArr.length === 1);

	// 步骤5：计算各行赔率的 最小乘积 / 最大乘积（核心逻辑）
	let minOddsProduct = 1; // 区间下限：各行最小值乘积
	let maxOddsProduct = 1; // 区间上限：各行最大值乘积
	rowValidOddsList.forEach(oddsArr => {
		const currentRowMin = Math.min(...oddsArr);
		const currentRowMax = Math.max(...oddsArr);
		minOddsProduct *= currentRowMin;
		maxOddsProduct *= currentRowMax;
	});

	// 步骤6：计算最终奖金（每注固定2元 ×  × 赔率乘积）
	const perNoteAmount = 2; // 每注固定2元（彩票通用规则，无需修改）
	const minBonus = minOddsProduct * perNoteAmount * validBetCount;
	const maxBonus = maxOddsProduct * perNoteAmount * validBetCount;

	// 步骤7：格式化返回结果（保留2位小数，统一格式）
	const formatBonus = (bonus) => bonus.toFixed(2); // 金额格式化工具函数

	if (isAllSingleSelect) {
		// 全单选项：返回单值奖金
		return `预计：${formatBonus(minBonus)}`;
	} else {
		// 存在多选项：返回区间值奖金
		return `预计：${formatBonus(minBonus)} ~ ${formatBonus(maxBonus)}`;
	}
}