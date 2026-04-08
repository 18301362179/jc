import {
    shareGiveCoin
} from "@/api/demo";

export default {
    data() {
        return {
            // 你的白名单（只在这里配置）
            sharePageList: [
                "pages/index/index",
                "pages/football/index",
                "pages/analysisForecast/index",
                "pages/basketball/index",
                "pages/fourIndex/index",
                "pages/fourteenIndex/index",
                "pages/nineIndex/index",
                "pages/sixIndex/index",
            ]
        };
    },

    onLoad() {
        this.setShareMenu();
    },

    methods: {
        setShareMenu() {
            const pages = getCurrentPages();
            if (!pages.length) return;

            const currentRoute = pages[pages.length - 1].route;

            // 不在白名单 → 隐藏分享
            if (!this.sharePageList.includes(currentRoute)) {
                uni.hideShareMenu();
                return;
            }

            // 在白名单 → 显示分享
            uni.showShareMenu({
                menus: ["shareAppMessage", "shareTimeline"]
            });
        },

        // 统一获取当前页面 URL
        getCurrentPageUrl() {
            const pages = getCurrentPages();
            const currentPage = pages[pages.length - 1];
            const params = currentPage.options || {};
            const paramStr = Object.keys(params).map(key => `${key}=${params[key]}`).join("&");
            return paramStr ? `/${currentPage.route}?${paramStr}` : `/${currentPage.route}`;
        }
    },

    onShareAppMessage() {
        const pages = getCurrentPages();
        const currentRoute = pages[pages.length - 1].route;

        // 不在白名单直接 return
        if (!this.sharePageList.includes(currentRoute)) return;

        // 调用分享接口
        shareGiveCoin({}).catch(() => {});

        return {
            title: "云竞慧博体育",
            path: this.getCurrentPageUrl()
        };
    },

    onShareTimeline() {
        const pages = getCurrentPages();
        const currentRoute = pages[pages.length - 1].route;

        // 不在白名单直接 return
        if (!this.sharePageList.includes(currentRoute)) return;

        // 调用分享接口
        shareGiveCoin({}).catch(() => {});

        return {
            title: "云竞慧博体育",
            path: this.getCurrentPageUrl()
        };
    }
};