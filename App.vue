<script>
import Vue from 'vue';
import { login, checkToken } from '@/utils/auth';
import { h5WechatAuth, checkH5Token, clearAllCodeRelated } from '@/utils/h5Auth';
import { getToken, setToken, removeToken } from '@/utils/storage';
import { getH5ShareInfo } from '@/api/demo';
import { shareGiveCoin } from '@/api/demo';

// 全局变量优化
let isWxConfigInited = false; 
let hasGrantCoin = false;    
let isWxLoading = false;     
const MAX_RETRY = 3;         
let retryCount = 0;          
let isSharePanelOpened = false; // 新增：标记分享面板是否打开

export default {
  globalData: {
    baseUrl:  'https://www.tianjifu.com/qwxt',
    token: ''
  },
  data() {
    return {
      invalidH5Token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1IiwidXNlcklkIjoiNSIsIm9wZW5JZCI6Im9PRGRWMV9qc3VWdHVFRWYxbm9LQTZFbTFZcEUiLCJpc1N5c01hbmFnZSI6IjAiLCJ0aW1lU3RhbXAiOjE3Njk5OTk5MjQ3NDJ9.SDgOKGOnz6v6bMFOOuMP_znqXB-B3lFes6MO4tWWx7Q',
      h5AuthLock: false,
      h5DevFixedToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1IiwidXNlcklkIjoiNSIsIm9wZW5JZCI6Im9PRGRWMV9qc3VWdHVFRWYxbm9LQTZFbTFZcEUiLCJpc1N5c01hbmFnZSI6IjAiLCJ0aW1lU3RhbXAiOjE3Njk5OTk5MjQ3NDJ9.SDgOKGOnz6v6bMFOOuMP_znqXB-B3lFes6MO4tWWx7Q'
    };
  },
  onLaunch: async function() {
    uni.hideTabBar();
    console.log('==================== 全局初始化开始 ====================');

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
      console.warn("App 环境配置异常：", e);
    }
    // #endif

    try {
      console.log('[H5环境] 开始初始化授权逻辑');
      const isH5DevEnv = window.location.hostname.includes('localhost') 
                          || window.location.hostname.includes('127.0.0.1')
                          || window.location.port === '8080';
      
      if (isH5DevEnv) {
        console.log('[H5开发环境] 强制设置固定测试Token');
        const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI3NyIsInVzZXJJZCI6Ijc3Iiwib3BlbklkIjoib29iNk4yR210S3V2c1dxTW1fb19wSzI4LUxmMCIsImlzU3lzTWFuYWdlIjoiMCIsInRpbWVTdGFtcCI6MTc3MjU4ODE5MDQwNn0.ULO_i27weyfFPIEFzCxhy0OWzGjVFe0JwAyrwOSQxBg'
        setToken(token);
        this.globalData.token = token;
        this.h5AuthLock = false;
        console.log('[H5开发环境] 固定Token已设置完成：', token);
        return;
      }
      // #ifdef H5
      console.log('[H5环境] 开始初始化授权逻辑');
      if (this.h5AuthLock) {
        console.log('[H5环境] 授权锁已开启，跳过初始化');
        return;
      }
      this.h5AuthLock = true;

      const currentToken = getToken();
      console.log('[H5环境] 当前本地Token：', currentToken);
      
      if (currentToken === this.invalidH5Token) {
        console.log('[H5环境] 检测到无效Token，强制清除');
        removeToken();
        clearAllCodeRelated();
      }

      const h5TokenValid = await checkH5Token();
      console.log('[H5环境] Token有效性校验结果：', h5TokenValid);
      
      if (!h5TokenValid) {
        console.log('[H5环境] Token无效，执行微信授权');
        const authResult = await new Promise(resolve => {
          setTimeout(async () => {
            const res = await h5WechatAuth();
            resolve(res);
          }, 200);
        });
        console.log('[H5环境] 授权执行结果：', authResult);
      }

      this.globalData.token = getToken() || '';
      console.log('[H5环境] 最终全局Token：', this.globalData.token);
      this.h5AuthLock = false;
      // #endif

      // #ifdef MP-WEIXIN
      console.log('[小程序环境] 开始初始化登录逻辑');
      const mpTokenValid = await checkToken();
      console.log('[小程序环境] Token有效性校验结果：', mpTokenValid);
      
      if (mpTokenValid) {
        this.globalData.token = getToken();
        console.log('[小程序环境] Token有效，直接赋值');
        return;
      }
      
      console.log('[小程序环境] Token无效，执行登录');
      const loginResult = await login();
      console.log('[小程序环境] 登录结果：', loginResult);
      
      if (loginResult.success) {
        this.globalData.token = getToken();
        console.log('[小程序环境] 登录成功，更新Token：', this.globalData.token);
      }
      // #endif
    } catch (error) {
      uni.showToast({ title: "初始化失败", icon: "none", duration: 3000 });
      console.error('全局初始化异常：', error);
      this.h5AuthLock = false;
    }
    console.log('==================== 全局初始化结束 ====================');
  },
  onShow() {
    // #ifdef APP-PLUS
    try { plus.screen.lockOrientation('portrait-primary'); } catch (e) {}
    // #endif
    this.h5AuthLock = false;
    // 重置分享面板标记
    isSharePanelOpened = false;
    // 延迟初始化分享
    setTimeout(() => {
      this.initGlobalWxShare();
    }, 300);

    // 新增：页面显示时，清除之前的赠币监听（防止重复）
    window.removeEventListener('pagehide', this.handleShareSuccess);
  },
  onHide() {
    // 核心：页面隐藏时，判断是否是分享导致的，若是则赠币
    if (isSharePanelOpened && !hasGrantCoin) {
      this.callShareGiveCoin();
    }
    // 重置所有标记
    hasGrantCoin = false;
    retryCount = 0;
    isWxLoading = false;
    isSharePanelOpened = false;
  },
  onUnload() {
    // 页面卸载时，同样判断是否分享导致
    if (isSharePanelOpened && !hasGrantCoin) {
      this.callShareGiveCoin();
    }
    isWxConfigInited = false;
    isWxLoading = false;
    retryCount = 0;
    isSharePanelOpened = false;
    // 移除监听
    window.removeEventListener('pagehide', this.handleShareSuccess);
  },
  methods: {
    updateGlobalToken(newToken) {
      console.log('[全局方法] 开始更新Token，新Token：', newToken);
      if (newToken === this.invalidH5Token) {
        console.log('[全局方法] 检测到无效Token，拒绝更新并清除');
        removeToken();
        clearAllCodeRelated();
        this.globalData.token = '';
        return;
      }
      if (newToken && typeof newToken === 'string') {
        this.globalData.token = newToken;
        setToken(newToken);
        console.log('[全局方法] Token更新成功：', this.globalData.token);
      } else {
        console.warn('[全局方法] Token更新失败：无效格式');
      }
    },
    showLoading() {
      uni.showLoading({ title: "加载中...", mask: true });
    },
    hideLoading() {
      uni.hideLoading();
    },

    // 等待jWeixin加载
    async waitForJWeixin() {
      return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
          if (window.jWeixin && typeof window.jWeixin.config === 'function') {
            clearInterval(checkInterval);
            resolve(window.jWeixin);
          }
          if (Date.now() - startTime > 5000) {
            clearInterval(checkInterval);
            reject(new Error('微信JS-SDK加载超时'));
          }
        }, 50);
      });
    },

    // 获取稳定URL
    getStableUrl() {
      return new Promise(resolve => {
        setTimeout(() => {
          const currentUrl = window.location.href.split('#').shift();
          resolve(currentUrl);
        }, 300);
      });
    },

    // 初始化微信分享
    async initGlobalWxShare() {
      if (process.env.VUE_APP_PLATFORM !== 'h5' || !/MicroMessenger/i.test(navigator.userAgent)) {
        return;
      }

      if (isWxLoading) {
        console.log('[微信分享] 配置正在加载中，跳过重复请求');
        return;
      }

      if (isWxConfigInited) {
        try {
          const wx = window.jWeixin;
          this.setWxShareContent(wx);
        } catch (e) {
          console.error('[微信分享] 已初始化但设置内容失败：', e);
        }
        return;
      }

      isWxLoading = true;
      let wx;

      try {
        wx = await this.waitForJWeixin();
        const currentUrl = await this.getStableUrl();
        const res = await getH5ShareInfo({
          shareUrl: currentUrl,
          _t: Date.now()
        });
        const wxConfig = res.data;

        wx.config({
          debug: false,
          appId: wxConfig.appId,
          timestamp: wxConfig.timestamp,
          nonceStr: wxConfig.nonceStr,
          signature: wxConfig.signature,
          jsApiList: [
            'updateAppMessageShareData',
            'updateTimelineShareData',
            'onMenuShareAppMessage',
            'onMenuShareTimeline',
            'onMenuShareQQ', // 新增：兼容更多分享渠道
            'onMenuShareWeibo'
          ],
          beta: true
        });

        wx.ready(() => {
          isWxConfigInited = true;
          isWxLoading = false;
          retryCount = 0;
          this.setWxShareContent(wx);
          console.log('[微信分享] 配置初始化成功');
        });

        wx.error(async (err) => {
          isWxLoading = false;
          console.error(`[微信分享] 配置失败（第${retryCount + 1}次）：`, err);
          
          if (err.errMsg.includes('invalid signature') && retryCount < MAX_RETRY) {
            retryCount++;
            console.log(`[微信分享] 签名无效，${retryCount}秒后重试（第${retryCount}次）`);
            setTimeout(() => {
              this.initGlobalWxShare();
            }, retryCount * 1000);
          } else {
            retryCount = 0;
            try {
              this.setWxShareContent(wx);
            } catch (e) {
              console.error('[微信分享] 失败后设置内容也失败：', e);
            }
          }
        });
      } catch (err) {
        isWxLoading = false;
        console.error('[微信分享] 初始化异常：', err);
        if (retryCount < MAX_RETRY) {
          retryCount++;
          setTimeout(() => {
            this.initGlobalWxShare();
          }, 1000);
        } else {
          retryCount = 0;
        }
      }
    },

    // 设置分享内容（核心修改：移除success回调中的赠币）
    setWxShareContent(wx) {
      if (!wx) {
        console.error('[微信分享] wx实例不存在，跳过设置内容');
        return;
      }

      const shareConfig = {
        title: '云竞慧博体育服务号',
        desc: '足球、篮球胜负、比分分析，足球数据展示。',
        posterUrl: 'https://www.tianjifu.com/static/share-logo.jpg',
        // 👇 改成跳转当前页面（100%能打开，无任何拦截）
        link: window.location.href.split('#')[0]
      };

      // 新版接口：仅配置分享内容，不触发赠币
      try {
        wx.updateAppMessageShareData({
          title: shareConfig.title,
          desc: shareConfig.desc,
          link: shareConfig.link,
          imgUrl: shareConfig.posterUrl,
          success: () => {
            console.log('分享卡片配置成功（好友）');
            isSharePanelOpened = true; // 标记分享面板已打开
          }
        });
      } catch (e) {
        console.error('[微信分享] 新版分享给朋友接口失败：', e);
      }

      try {
        wx.updateTimelineShareData({
          title: shareConfig.title,
          link: shareConfig.link,
          imgUrl: shareConfig.posterUrl,
          success: () => {
            console.log('分享卡片配置成功（朋友圈）');
            isSharePanelOpened = true; // 标记分享面板已打开
          }
        });
      } catch (e) {
        console.error('[微信分享] 新版分享到朋友圈接口失败：', e);
      }

      // 兼容旧版接口
      try {
        wx.onMenuShareAppMessage({
          title: shareConfig.title,
          desc: shareConfig.desc,
          link: shareConfig.link,
          imgUrl: shareConfig.posterUrl,
          trigger: () => {
            console.log('用户打开了分享面板（好友）');
            isSharePanelOpened = true; // 核心：用户触发分享面板时标记
          },
          success: () => {
            console.log('旧版分享卡片配置成功（好友）');
          }
        });
      } catch (e) {
        console.error('[微信分享] 旧版分享给朋友接口失败：', e);
      }

      try {
        wx.onMenuShareTimeline({
          title: shareConfig.title,
          link: shareConfig.link,
          imgUrl: shareConfig.posterUrl,
          trigger: () => {
            console.log('用户打开了分享面板（朋友圈）');
            isSharePanelOpened = true; // 核心：用户触发分享面板时标记
          },
          success: () => {
            console.log('旧版分享卡片配置成功（朋友圈）');
          }
        });
      } catch (e) {
        console.error('[微信分享] 旧版分享到朋友圈接口失败：', e);
      }

      // 新增：监听页面隐藏事件（微信分享后会触发pagehide）
      window.addEventListener('pagehide', this.handleShareSuccess);
    },

    // 处理分享成功的逻辑
    handleShareSuccess() {
      if (!hasGrantCoin && isSharePanelOpened) {
        this.callShareGiveCoin();
      }
    },

    // 调用赠币接口（仅当确认分享成功时执行）
    async callShareGiveCoin() {
      if (hasGrantCoin) {
        console.log('已赠币，跳过重复调用');
        return;
      }

      try {
        await shareGiveCoin(); 
        hasGrantCoin = true; 
        console.log('赠币接口调用成功（用户实际分享后）');
      } catch (err) {
        console.error('赠币接口调用失败：', err);
        hasGrantCoin = false; // 失败时重置，允许重试
      }
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
/* #ifdef APP-PLUS */
page { --status-bar-height: 44rpx; }
/* #endif */
/* #ifdef MP-WEIXIN */
page { --status-bar-height: 20rpx; }
/* #endif */
uni-modal, .uni-mask { z-index: 999 !important; }
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
.x-text-green{
  color: #31926e!important;
}
</style>