import request from './request'

let baseUrl = "";
// #ifdef H5
baseUrl = process.env.NODE_ENV === 'development' ? '/api' : '';
// #endif

// #ifdef MP-WEIXIN
baseUrl = "";
// #endif

export const queryBasePermissionNeed = (params) => {
    return request({
        url: baseUrl + '/sports/football/queryBasePermissionNeed',
        method: 'GET',
        data: params
    })
}

export const queryContinentList = (params) => {
    return request({
        url: baseUrl + '/sports/football/queryContinentList',
        method: 'GET',
        data: params
    })
}

export const queryLeagueList = (params) => {
    return request({
        url: baseUrl + '/sports/football/queryLeagueList',
        method: 'GET',
        data: params
    })
}

export const queryHomeList = (params) => {
    return request({
        url: baseUrl + '/sports/football/queryPoints',
        method: 'GET',
        data: params
    })
}

export const getSaiCheng = (params) => {
    return request({
        url: baseUrl + '/sports/football/queryCourse',
        method: 'GET',
        data: params
    })
}

export const getJiFen = (params) => {
    return request({
        url: baseUrl + '/sports/football/queryPoints',
        method: 'GET',
        data: params
    })
}

export const getSheShou = (params) => {
    return request({
        url: baseUrl + '/sports/football/queryScorer',
        method: 'GET',
        data: params
    })
}

export const queryGroupAndRoundList = (params) => {
    return request({
        url: baseUrl + '/sports/football/queryGroupAndRoundList',
        method: 'GET',
        data: params
    })
}

export const getAi = (params) => {
    return request({
        url: baseUrl + '/sports/football/infoPageData',
        method: 'GET',
        data: params
    })
}

export const getbasketballAi = (params) => {
    return request({
        url: baseUrl + '/sports/basketball/infoPageData',
        method: 'GET',
        data: params
    })
}

export const getTimeList = (params) => {
    return request({
        url: baseUrl + '/sports/football/queryCsList',
        method: 'GET',
        data: params
    })
}

export const queryStageList = (params) => {
    return request({
        url: baseUrl + '/sports/football/queryStageList',
        method: 'GET',
        data: params
    })
}

export const getUser = (params) => {
    return request({
        url: baseUrl + '/platform/user/userPageData',
        method: 'GET',
        data: params
    })
}

export const getHaveMoney = (params) => {
    return request({
        url: baseUrl + '/sports/football/checkPermission',
        method: 'GET',
        data: params
    })
}

export const queryFootBallLLottery = (data) => {
    return request({
        url: baseUrl + '/football/lottery',
        method: 'GET',
        data
    })
}

export const queryBasketBallLLottery = (data) => {
    return request({
        url: baseUrl + '/basketball/lottery',
        method: 'GET',
        data
    })
}

export const loginPhone = (data) => {
    return request({
        url: baseUrl + '/auth/login/phone',
        method: 'GET',
        data
    })
}

export const checkCode = (data) => {
    return request({
        url: baseUrl + '/auth/login/app/checkCode',
        method: 'GET',
        data
    })
}

export const setCourseGoal = (data) => {
    return request({
        url: baseUrl + '/sports/football/data/setCourseGoal',
        method: 'GET',
        data
    })
}

export const checkSelect = (data) => {
    return request({
        url: baseUrl + '/football/lottery/checkSelect',
        method: 'GET',
        data
    })
}

export const checkSelectBasketball = (data) => {
    return request({
        url: baseUrl + '/football/lottery/checkSelect',
        method: 'GET',
        data
    })
}

export const purchasingLotteryApply = (data) => {
    return request({
        url: baseUrl + '/lottery/apply',
        method: 'POST',
        data
    })
}

export const purchasingLotteryConfirm = (data) => {
    return request({
        url: baseUrl + '/lottery/confirm',
        method: 'GET',
        data
    })
}

export const purchasingLotteryQueryById = (data) => {
    return request({
        url: baseUrl + '/lottery/queryById',
        method: 'GET',
        data
    })
}

export const queryHomeAndVisitingGoalOdds = (data) => {
    return request({
        url: baseUrl + '/football/lottery/goalOdds',
        method: 'GET',
        data
    })
}

export const queryTeamWordRanking = (data) => {
    return request({
        url: baseUrl + '/sports/football/queryTeamWordRanking',
        method: 'GET',
        data
    })
}

// 完善：解除 wxLogin 注释，适配 utils/auth.js 调用
export const wxLogin = (data) => {
    return request({
        url: baseUrl + '/auth/login/weChatMiniProgram', // 按你的后端实际接口路径调整
        method: 'GET',
        data
    })
}

export const queryPlayer = (data) => {
    return request({
        url: baseUrl + '/sports/football/queryPlayer',
        method: 'GET',
        data
    })
}
export const queryHhgg = (data) => {
    return request({
        url: baseUrl + '/football/lottery/hhgg/zkqb',
        method: 'GET',
        data
    })
}
export const recharge = (data) => {
    return request({
        url: baseUrl + '/platform/user/recharge',
        method: 'GET',
        data
    })
}
export const wxPay = (data) => {
    return request({
        url: baseUrl + '/platform/pay/wx/placeOrder',
        method: 'POST',
        data
    })
}
export const payConfirm = (data) => {
    return request({
        url: baseUrl + '/platform/pay/wx/payConfirm',
        method: 'POST',
        data
    })
}
export const userShare = (data) => {
    return request({
        url: baseUrl + '/platform/miniProgram/share',
        method: 'GET',
        data
    })
}
export const footballLotteryTradition = (data) => {
    return request({
        url: baseUrl + '/football/lottery/tradition',
        method: 'GET',
        data
    })
}
export const footballLotteryTraditionDrawNum = (data) => {
    return request({
        url: baseUrl + '/football/lottery/tradition/drawNum',
        method: 'GET',
        data
    })
}
export const getH5Token = (data) => {
    return request({
        url: baseUrl + '/auth/login/weChatServiceAccount',
        method: 'GET',
        data
    })
}

export const getH5ShareInfo = (data) => {
    return request({
        url: baseUrl + '/platform/serviceAccount/share/signature',
        method: 'GET',
        data
    })
}
export const shareGiveCoin = (data) => {
    return request({
        url: baseUrl + '/platform/share/giveCoin',
        method: 'GET',
        data
    })
}
export const sysParams = (data) => {
    return request({
        url: baseUrl + "/auth/login/sysParams",
        method: 'GET',
        data
    })
}
export const getTradeRecord = (data) => {
    return request({
        url: baseUrl + "/platform/user/tradeRecord",
        method: 'GET',
        data
    })
}
export const footLotteryLive = (data) => {
    return request({
        url: baseUrl + "/foot/lottery/live",
        method: 'GET',
        data
    })
}
export const basketLotteryLive = (data) => {
    return request({
        url: baseUrl + "/basket/lottery/live",
        method: 'GET',
        data
    })
}
export const userTradeRecord = (data) => {
    return request({
        url: baseUrl + "/platform/user/orderRecord",
        method: 'GET',
        data
    })
}
export const userPage = (data) => {
    return request({
        url: baseUrl + "/platform/user/pay/page",
        method: 'GET',
        data
    })
}
export const teamInfo = (data) => {
    return request({
        url: baseUrl + "/sports/football/team/info",
        method: 'GET',
        data
    })
}

export const platformSysMessageQuery = (data) => {
    return request({
        url: baseUrl + "/platform/sys/message/query",
        method: 'GET',
        data
    })
}

export const platformSysMessageRead = (data) => {
    return request({
        url: baseUrl + "/platform/sys/message/read",
        method: 'GET',
        data
    })
}
export const purchasingFootballInfo = (data) => {
    return request({
        url: baseUrl + "/football/infoPageData",
        method: 'GET',
        data
    })
}

// 篮球竞彩 明细接口
export const purchasingBasketballInfo = (data) => {
    return request({
        url: baseUrl + "/basketball/infoPageData",
        method: 'GET',
        data
    })
}

export const purchasingFootballPoints = (data) => {
    return request({
        url: baseUrl + "/football/points",
        method: 'GET',
        data
    })
}
// 试机号无参接口
export const getPredictNumbers = () => {
    return request({
        url: baseUrl + "/numbers/predict",
        method: 'GET'
    })
}