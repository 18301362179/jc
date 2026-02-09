import request from './request'

let baseUrl = "";
// #ifdef H5
baseUrl = "/api";
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
        url: baseUrl + '/sports/football/lottery',
        method: 'GET',
        data
    })
}

export const queryBasketBallLLottery = (data) => {
    return request({
        url: baseUrl + '/sports/basketball/lottery',
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
        url: baseUrl + '/purchasing/football/lottery/checkSelect',
        method: 'GET',
        data
    })
}

export const checkSelectBasketball = (data) => {
    return request({
        url: baseUrl + '/purchasing/football/lottery/checkSelect',
        method: 'GET',
        data
    })
}

export const purchasingLotteryApply = (data) => {
    return request({
        url: baseUrl + '/purchasing/lottery/apply',
        method: 'POST',
        data
    })
}

export const purchasingLotteryConfirm = (data) => {
    return request({
        url: baseUrl + '/purchasing/lottery/confirm',
        method: 'GET',
        data
    })
}

export const purchasingLotteryQueryById = (data) => {
    return request({
        url: baseUrl + '/purchasing/lottery/queryById',
        method: 'GET',
        data
    })
}

export const queryHomeAndVisitingGoalOdds = (data) => {
    return request({
        url: baseUrl + '/purchasing/football/lottery/homeAndVisitingGoalOdds',
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
        url: baseUrl + '/sports/football/lottery/hhgg/zkqb',
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
export const footballLotteryTradition = (data) => {
    return request({
        url: baseUrl + '/purchasing/football/lottery/tradition',
        method: 'GET',
        data
    })
}
export const footballLotteryTraditionDrawNum = (data) => {
    return request({
        url: baseUrl + '/purchasing/football/lottery/tradition/drawNum',
        method: 'GET',
        data
    })
}
