/**
 * 格式化日期为YYYY-MM-DD 周几 HH:mm格式
 * @param {Date|string} date - 日期对象或可解析的日期字符串
 * @returns {string} 格式化后的日期字符串 (如: "2025-08-23 周六 03:00")
 */
export function formatDateWithWeekday(date) {
    const d = date instanceof Date ? date : new Date(date)
    if (isNaN(d.getTime())) return '无效日期'

    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const pad = n => n.toString().padStart(2, '0')

    const year = d.getFullYear()
    const month = pad(d.getMonth() + 1)
    const day = pad(d.getDate())
    const weekday = weekdays[d.getDay()]
    const hours = pad(d.getHours())
    const minutes = pad(d.getMinutes())

    return `${year}-${month}-${day} ${weekday} ${hours}:${minutes}`
}

// 示例用法
// console.log(formatDateWithWeekday('2025-08-23T03:00:00')) // 输出: 2025-08-23 周六 03:00
// console.log(formatDateWithWeekday(new Date())) // 输出当前时间格式化结果



// 时间格式：202510240045 → 解析为 2025年10月24日，返回对应周几
 export function getWeekdayFromTimeStr(timeStr) {
    // 1. 提取年月日（前8位：20251024 → 年2025、月10、日24）
    const year = parseInt(timeStr.slice(0, 4));
    const month = parseInt(timeStr.slice(4, 6)) - 1; // 月份从0开始（0=1月）
    const day = parseInt(timeStr.slice(6, 8));

    // 2. 创建日期对象
    const date = new Date(year, month, day);

    // 3. 定义周几映射（0=周日，1=周一...6=周六）
    const weekdayMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    // 4. 返回对应周几
    return weekdayMap[date.getDay()];
}

// 调用示例：
// const timeStr = "202510240045";
// console.log(getWeekdayFromTimeStr(timeStr)); // 输出：周五（2025年10月24日是周五）



export function formatTimeToMDWeekHM(timeStr) {
    // 1. 校验时间字符串有效性，无效则返回空（避免报错）
    if (!timeStr || typeof timeStr !== 'string') return '';

    // 2. 创建 Date 对象（处理 "2025-11-05 01:45" 格式）
    const date = new Date(timeStr);

    // 3. 处理 Date 无效的情况（如时间格式错误）
    if (isNaN(date.getTime())) return '';

    // 4. 定义周几映射表（0=周日，1=周一...6=周六）
    const weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    // 5. 提取各时间部分（补零处理，确保格式统一，如 5日→05，1时→01）
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份0开头，需+1
    const day = String(date.getDate()).padStart(2, '0');
    const week = weekMap[date.getDay()];
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    // 6. 拼接成目标格式：月-日 周几 时:分
    return `${month}-${day} ${week} ${hour}:${minute}`;
}