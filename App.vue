<script>
// 补充 Vue 引入，避免组件注册相关报错
import Vue from 'vue';

// 引入登录/Token 工具方法
import { login, checkToken } from '@/utils/auth';
import { getToken, setToken } from '@/utils/storage';

export default {
  // 全局共享数据，全项目可通过 getApp().globalData 访问
  globalData: {
    baseUrl:  'https://www.tianjifu.com/qwxt',
    token: '' // 移除兜底 Token，按环境差异化配置
  },
  data() {
    return {};
  },
  // 应用启动时执行（仅一次），async 支持 await 异步操作
  onLaunch: async function() {
    // 隐藏底部 TabBar（全局初始化）
    uni.hideTabBar();

    // ========== App 环境专属配置（锁定竖屏 + 屏蔽广告）==========
    // #ifdef APP-PLUS
    try {
      plus.screen.lockOrientation('portrait-primary');
      if (uni.createAd) {
        uni.createAd = () => ({
          load: () => Promise.reject('Ad disabled'),
          show: () => Promise.reject('Ad disabled')
        });
      }
      if (plus && plus.ad) {
        plus.ad.createAdView = () => ({ show: () => {}, load: () => {} });
        plus.ad.getSystemAdInfo = () => ({});
      }
      if (Vue && Vue.component) {
        Vue.component('uni-ad', { render: () => null });
      }
    } catch (e) {
      console.warn("App 环境广告屏蔽/竖屏锁定异常：", e);
    }
    // #endif

    // ========== 核心：按环境差异化处理 Token ==========
    try {
      // 1. H5 环境：直接写死调试 Token（你替换成自己的实际 Token 即可）
      // #ifdef H5
      const H5_DEBUG_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1IiwidXNlcklkIjoiNSIsIm9wZW5JZCI6Im9PRGRWMV9qc3VWdHVFRWYxbm9LQTZFbTFZcEUiLCJpc1N5c01hbmFnZSI6IjAiLCJ0aW1lU3RhbXAiOjE3Njk5OTk5MjQ3NDJ9.SDgOKGOnz6v6bMFOOuMP_znqXB-B3lFes6MO4tWWx7Q'; // 这里改你的死 Token
      this.globalData.token = H5_DEBUG_TOKEN;
      setToken(H5_DEBUG_TOKEN); // 同步到本地存储，保证接口能读取
      return; // H5 直接结束，不执行后续逻辑
      // #endif

      // 2. 微信小程序环境：保持原有逻辑不变
      // #ifdef MP-WEIXIN
      const isTokenValid = await checkToken();
      if (isTokenValid) {
        this.globalData.token = getToken();
        return;
      }
      const loginResult = await login();
      if (loginResult.success) {
        this.globalData.token = getToken();
      }
      // #endif

      // 3. APP 环境：预留独立获取 Token 的空逻辑（你后续填接口即可）
      // #ifdef APP-PLUS
      // ========== 这里是 APP 独立获取 Token 的空逻辑 ==========
      // 示例：后续你可以替换成 APP 专属的接口调用
      // const appTokenResult = await uni.request({
      //   url: this.globalData.baseUrl + '/app/getToken', // APP 专属接口
      //   method: 'POST'
      // });
      // if (appTokenResult.data.success) {
      //   this.globalData.token = appTokenResult.data.token;
      //   setToken(appTokenResult.data.token);
      // }
      // ========== 空逻辑结束 ==========
      // #endif

    } catch (error) {
      uni.showToast({
        title: "初始化失败，部分功能受限",
        icon: "none",
        duration: 3000
      });
    }
  },
  // 应用切换到前台时执行
  onShow() {
    // #ifdef APP-PLUS
    try {
      plus.screen.lockOrientation('portrait-primary');
    } catch (e) {}
    // #endif
  },
  onHide() {},
  methods: {
    // 全局 Token 更新方法（供其他页面调用）
    updateGlobalToken(newToken) {
      if (!newToken || typeof newToken !== 'string') {
        console.warn("全局 Token 更新失败：无效的 Token 格式");
        return;
      }

      // H5 环境更新死 Token
      // #ifdef H5
      this.globalData.token = newToken;
      setToken(newToken);
      return;
      // #endif

      // 小程序/APP 环境更新 Token
      // #ifdef MP-WEIXIN || APP-PLUS
      this.globalData.token = newToken;
      setToken(newToken);
      console.log("Token 已手动更新并存储");
      // #endif
    }
  }
};
</script>

<style scss>
uni-toast { z-index: 99999999 !important; }
page {
  font-family: "SF Pro Display", "Roboto", "Helvetica Neue", sans-serif;
  margin: 0;
  padding: 0 !important;
  box-sizing: border-box;
  --status-bar-height: 0rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}
/* App 环境状态栏高度适配 */
/* #ifdef APP-PLUS */
page { --status-bar-height: 44rpx; }

/* #endif */
/* #ifdef MP-WEIXIN */

page { --status-bar-height: 20rpx; }

/* #endif */
uni-modal, .uni-mask { z-index: 99999999 !important; }
.uni-picker-container .uni-picker-custom{
  z-index: 99999999!important;
}
.uni-tabbar { z-index: 998 !important; }
body.pages-index-index uni-page-body {
  font-family: "SF Pro Display", "Roboto", "Helvetica Neue", sans-serif;
  margin: 0;
  padding: 0 !important;
  box-sizing: border-box;
  --status-bar-height: 0rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  height: 100vh !important;
  overflow: hidden !important;
}
</style>