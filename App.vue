<script>
// 补充 Vue 引入，避免组件注册相关报错
import Vue from 'vue';

// 引入登录/Token 工具方法
import { login, checkToken } from '@/utils/auth';
import { getToken, setToken } from '@/utils/storage';

// 引入全局配置（统一 baseUrl，避免硬编码）

export default {
  // 全局共享数据，全项目可通过 getApp().globalData 访问
  globalData: {
    baseUrl:  'https://www.tianjifu.com/qwxt',
    token: '' // 移除兜底 Token，仅目标环境自动填充有效 Token
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
      // 锁定竖屏，保证应用展示一致性
      plus.screen.lockOrientation('portrait-primary');

      // 覆盖 uni.createAd，阻止广告初始化
      if (uni.createAd) {
        uni.createAd = () => ({
          load: () => Promise.reject('Ad disabled'),
          show: () => Promise.reject('Ad disabled')
        });
      }

      // 覆盖 plus.ad 原生广告 API
      if (plus && plus.ad) {
        plus.ad.createAdView = () => ({
          show: () => {},
          load: () => {}
        });
        plus.ad.getSystemAdInfo = () => ({});
      }

      // 覆盖 uni-ad 组件，渲染空内容
      if (Vue && Vue.component) {
        Vue.component('uni-ad', {
          render: () => null
        });
      }
    } catch (e) {
      console.warn("App 环境广告屏蔽/竖屏锁定异常：", e);
    }
    // #endif

    // ========== 环境隔离：仅小程序/App 执行 Token 校验与自动登录，H5 跳过 ==========
    try {
      // ========== 核心修改1：替换 uni.getSystemInfoSync() 为跨端兼容的 API ==========
      let systemInfo = {};
      // 优先使用微信最新 API（小程序端）
      if (wx && wx.getDeviceInfo) {
        const deviceInfo = wx.getDeviceInfo();
        const windowInfo = wx.getWindowInfo();
        // 映射原有字段，保证逻辑不变
        systemInfo = {
          uniPlatform: deviceInfo.platform || '', // 对应原 uniPlatform
          platform: deviceInfo.platform || '', // 兼容 updateGlobalToken 里的 platform 判断
          windowWidth: windowInfo.windowWidth,
          windowHeight: windowInfo.windowHeight
        };
      } else {
        // 降级兼容（App/H5/低版本小程序）
        systemInfo = uni.getSystemInfoSync();
      }

      // 标记目标环境（微信小程序 / Android App / iOS App）
      const targetEnvs = ['mp-weixin', 'android', 'ios'];
      const isTargetEnv = targetEnvs.includes(systemInfo.uniPlatform.toLowerCase());

      // H5 等非目标环境：直接返回，保持原有逻辑不变
      if (!isTargetEnv) {
        return;
      }

      // ========== 小程序/App 环境：Token 校验与自动登录核心流程 ==========

      // 1. 校验本地 Token 是否有效
      const isTokenValid = await checkToken();
      if (isTokenValid) {
        const validToken = getToken();
        // 同步有效 Token 到全局数据
        this.globalData.token = validToken;
        return;
      }

      // 2. Token 无效：执行自动登录
      const loginResult = await login();
      if (loginResult.success) {
        const newToken = getToken();
        // 同步新 Token 到全局数据
        this.globalData.token = newToken;
      } else {

      }
    } catch (error) {
      // 给用户友好提示
      uni.showToast({
        title: "初始化登录失败，部分功能受限",
        icon: "none",
        duration: 3000
      });
    }
  },
  // 应用切换到前台时执行
  onShow() {
    // #ifdef APP-PLUS
    // 再次锁定竖屏，防止应用切后台后竖屏状态丢失
    try {
      plus.screen.lockOrientation('portrait-primary');
    } catch (e) {

    }
    // #endif
  },
  // 应用切换到后台时执行
  onHide() {

  },
  methods: {
    // 全局 Token 更新方法（供其他页面调用，同步更新本地存储与全局数据）
    updateGlobalToken(newToken) {
      if (!newToken || typeof newToken !== 'string') {
        console.warn("全局 Token 更新失败：无效的 Token 格式");
        return;
      }

      // ========== 核心修改2：替换 uni.getSystemInfoSync() 为跨端兼容的 API ==========
      let systemInfo = {};
      // 优先使用微信最新 API（小程序端）
      if (wx && wx.getDeviceInfo) {
        const deviceInfo = wx.getDeviceInfo();
        systemInfo = {
          platform: deviceInfo.platform || '' // 仅保留需要的 platform 字段
        };
      } else {
        // 降级兼容（App/H5/低版本小程序）
        systemInfo = uni.getSystemInfoSync();
      }

      // 仅目标环境执行更新操作
      const targetEnvs = ['mp-weixin', 'android', 'ios'];
      const isTargetEnv = targetEnvs.includes(systemInfo.platform.toLowerCase());

      if (isTargetEnv) {
        this.globalData.token = newToken;
        setToken(newToken); // 同步更新本地存储，保证 request.js 能读取到最新值
        console.log("App/小程序 全局 Token 已手动更新并存储");
      }
    }
  }
};
</script>

<style scss>
/* 全局样式：统一全项目页面样式，H5 环境保持不变 */
uni-toast {
  z-index: 99999999 !important;
}

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
page {
  --status-bar-height: 44rpx;
}
/* #endif */

/* 微信小程序环境状态栏高度适配 */
/* #ifdef MP-WEIXIN */
page {
  --status-bar-height: 20rpx;
}
/* #endif */

/* 全局弹窗层级保障，避免被遮挡 */
uni-modal {
  z-index: 99999999 !important;
}

.uni-mask {
  z-index: 99999999 !important;
}

.uni-tabbar {
  z-index: 998 !important;
}

.uni-modal {
  z-index: 99999999 !important;
}

/* 首页专属样式，保持原有逻辑 */
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