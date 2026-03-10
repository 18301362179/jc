<script>
import Vue from 'vue';
import { login, checkToken } from '@/utils/auth';
import { h5WechatAuth, checkH5Token, clearAllCodeRelated } from '@/utils/h5Auth';
import { getToken, setToken, removeToken } from '@/utils/storage';
import { getH5ShareInfo } from '@/api/demo';
import { shareGiveCoin } from '@/api/demo';

// 全局变量：解决循环+签名问题的核心标记
let isWxConfigInited = false;    // 分享配置是否已初始化
let hasGrantCoin = false;        // 是否已赠币
let isWxLoading = false;         // 分享配置是否正在加载（防止重复请求）
const MAX_RETRY = 3;             // 最大重试次数
let retryCount = 0;              // 当前重试次数
let isSharePanelOpened = false;  // 分享面板是否打开
let isWxConfigFailed = false;    // 分享配置是否彻底失败（超过重试次数）
let shareInitLock = false;       // 分享初始化锁（彻底杜绝循环调用）

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
      const isH5DevEnv = window.location.hostname.includes('localhost') 
                          || window.location.hostname.includes('127.0.0.1')
                          || window.location.port === '8080';
      
      // 开发环境：强制设置测试Token
      if (isH5DevEnv) {
        console.log('[H5开发环境] 强制设置固定测试Token');
        const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI3NyIsInVzZXJJZCI6Ijc3Iiwib3BlbklkIjoib29iNk4yR210S3V2c1dxTW1fb19wSzI4LUxmMCIsImlzU3lzTWFuYWdlIjoiMCIsInRpbWVTdGFtcCI6MTc3MjU4ODE5MDQwNn0.ULO_i27weyfFPIEFzCxhy0OWzGjVFe0JwAyrwOSQxBg'
        setToken(token);
        this.globalData.token = token;
        this.h5AuthLock = false;
        console.log('[H5开发环境] 固定Token已设置完成');
        return;
      }

      // H5环境：授权逻辑
      // #ifdef H5
      console.log('[H5环境] 开始初始化授权逻辑');
      if (this.h5AuthLock) {
        console.log('[H5环境] 授权锁已开启，跳过初始化');
        return;
      }
      this.h5AuthLock = true;

      const currentToken = getToken();
      console.log('[H5环境] 当前本地Token：', currentToken);
      
      // 清除无效Token
      if (currentToken === this.invalidH5Token) {
        console.log('[H5环境] 检测到无效Token，强制清除');
        removeToken();
        clearAllCodeRelated();
      }

      // 校验Token有效性，无效则执行微信授权
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

      // 更新全局Token
      this.globalData.token = getToken() || '';
      console.log('[H5环境] 最终全局Token：', this.globalData.token);
      this.h5AuthLock = false;
      // #endif

      // 小程序环境：登录逻辑
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
        console.log('[小程序环境] 登录成功，更新Token');
      }
      // #endif
    } catch (error) {
      // uni.showToast({ title: "初始化失败", icon: "none", duration: 3000 });
      console.error('全局初始化异常：', error);
      this.h5AuthLock = false;
    }
    console.log('==================== 全局初始化结束 ====================');
  },

  // 页面显示：核心修复循环调用问题
  onShow() {
    // #ifdef APP-PLUS
    try { plus.screen.lockOrientation('portrait-primary'); } catch (e) {}
    // #endif
    
    // 重置基础标记（保留失败标记，避免重复尝试）
    this.h5AuthLock = false;
    isSharePanelOpened = false;
    // 延迟执行分享初始化：避免页面未加载完成就触发
    setTimeout(async () => {
      // #ifdef H5
      console.log('[onShow] H5环境：开始校验Token并初始化分享');
      // 双重校验：Token有效 + 配置未失败 + 未在加载 + 无初始化锁
      const tokenValid = await checkH5Token();
      const canInit = tokenValid && !isWxConfigFailed && !isWxLoading && !shareInitLock;
      
      if (canInit) {
        console.log('[onShow] 满足初始化条件，执行分享配置');
        this.initGlobalWxShare();
      } else {
        console.log('[onShow] 不满足初始化条件：', {tokenValid, isWxConfigFailed, isWxLoading, shareInitLock});
      }
      // #endif
      
      // 非H5环境正常初始化
      // #ifndef H5
      if (!isWxConfigFailed && !isWxLoading && !shareInitLock) {
        this.initGlobalWxShare();
      }
      // #endif
    }, 500); // 延长延迟时间，避免页面切换频繁触发

    // 清除重复的赠币监听
    window.removeEventListener('pagehide', this.handleShareSuccess);
  },

  // 页面隐藏：重置标记，避免循环
  onHide() {
    if (isSharePanelOpened && !hasGrantCoin) {
      this.callShareGiveCoin();
    }
    // 仅重置非核心标记
    hasGrantCoin = false;
    isWxLoading = false;
    isSharePanelOpened = false;
    shareInitLock = false; // 释放初始化锁
    
    // #ifdef H5
    import('@/utils/h5Auth').then(module => {
      if (module.resetAuthFlag) module.resetAuthFlag();
    });
    // #endif
  },

  // 页面卸载：彻底清理
  onUnload() {
    if (isSharePanelOpened && !hasGrantCoin) {
      this.callShareGiveCoin();
    }
    isWxConfigInited = false;
    isWxLoading = false;
    retryCount = 0;
    isSharePanelOpened = false;
    shareInitLock = false;
    window.removeEventListener('pagehide', this.handleShareSuccess);
  },

  methods: {
    // 更新全局Token：过滤无效Token
    updateGlobalToken(newToken) {
      console.log('[全局方法] 开始更新Token');
      if (newToken === this.invalidH5Token) {
        console.log('[全局方法] 检测到无效Token，强制清除');
        removeToken();
        clearAllCodeRelated();
        this.globalData.token = '';
        return;
      }
      if (newToken && typeof newToken === 'string') {
        this.globalData.token = newToken;
        setToken(newToken);
        console.log('[全局方法] Token更新成功');
      } else {
        console.warn('[全局方法] Token更新失败：无效格式');
      }
    },

    // 加载提示
    showLoading() {
      uni.showLoading({ title: "加载中...", mask: true });
    },
    hideLoading() {
      uni.hideLoading();
    },

    // 等待微信JS-SDK加载完成
    async waitForJWeixin() {
      return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
          if (window.jWeixin && typeof window.jWeixin.config === 'function') {
            clearInterval(checkInterval);
            resolve(window.jWeixin);
          }
          // 超时5秒则拒绝
          if (Date.now() - startTime > 5000) {
            clearInterval(checkInterval);
            reject(new Error('微信JS-SDK加载超时'));
          }
        }, 50);
      });
    },

    // 获取稳定URL：彻底解决签名无效问题（核心修改）
    getStableUrl() {
      return new Promise(resolve => {
        setTimeout(() => {
          // 强制固定为后端签名用的路径：不带#、末尾带/
          const finalUrl = 'https://www.tianjifu.com/dev/';
          console.log('[微信分享] 用于签名的稳定URL：', finalUrl);
          resolve(finalUrl);
        }, 300);
      });
    },

    // 初始化微信分享：彻底修复循环+签名问题
    async initGlobalWxShare() {
      // 多重锁：彻底杜绝循环调用
      if (shareInitLock || isWxLoading || isWxConfigFailed) {
        console.log('[微信分享] 初始化被拦截：', {shareInitLock, isWxLoading, isWxConfigFailed});
        return;
      }
      
      // 标记初始化锁
      shareInitLock = true;
      isWxLoading = true;

      // H5环境二次校验Token
      // #ifdef H5
      const tokenValid = await checkH5Token();
      if (!tokenValid) {
        console.log('[微信分享] H5 Token无效，终止初始化');
        isWxLoading = false;
        shareInitLock = false;
        return;
      }
      // #endif

      // 非H5/非微信环境直接返回
      if (process.env.VUE_APP_PLATFORM !== 'h5' || !/MicroMessenger/i.test(navigator.userAgent)) {
        isWxLoading = false;
        shareInitLock = false;
        return;
      }

      // 已初始化则直接设置分享内容
      if (isWxConfigInited) {
        try {
          this.setWxShareContent(window.jWeixin);
        } catch (e) {
          console.error('[微信分享] 已初始化但设置内容失败：', e);
        }
        isWxLoading = false;
        shareInitLock = false;
        return;
      }

      try {
        // 等待微信SDK加载
        const wx = await this.waitForJWeixin();
        // 获取稳定签名URL
        const currentUrl = await this.getStableUrl();
        // 请求后端签名配置
        const res = await getH5ShareInfo({
          shareUrl: currentUrl,
          _t: Date.now() // 加时间戳避免缓存
        });
        const wxConfig = res.data;

        // 微信配置：参数与后端完全一致
        wx.config({
          debug: false, // 关闭调试，避免日志干扰
          appId: wxConfig.appId,
          timestamp: wxConfig.timestamp,
          nonceStr: wxConfig.nonceStr,
          signature: wxConfig.signature,
          jsApiList: [
            'updateAppMessageShareData',
            'updateTimelineShareData',
            'onMenuShareAppMessage',
            'onMenuShareTimeline'
          ],
          beta: true
        });

        // 配置成功
        wx.ready(() => {
          console.log('[微信分享] 配置初始化成功');
          isWxConfigInited = true;
          isWxLoading = false;
          shareInitLock = false;
          isWxConfigFailed = false;
          this.setWxShareContent(wx);
        });

        // 配置失败：修复重试逻辑
        wx.error(async (err) => {
          console.error(`[微信分享] 配置失败（第${retryCount + 1}次）：`, err);
          isWxLoading = false;
          
          // 签名无效且未超过重试次数则重试
          if (err.errMsg.includes('invalid signature') && retryCount < MAX_RETRY) {
            retryCount++;
            console.log(`[微信分享] 签名无效，${retryCount}秒后重试（第${retryCount}次）`);
            setTimeout(() => {
              isWxConfigInited = false; // 重置初始化标记
              shareInitLock = false;    // 释放锁允许重试
              this.initGlobalWxShare();
            }, retryCount * 1500); // 递增重试间隔，避免频繁请求
          } else {
            // 超过重试次数，标记为彻底失败
            isWxConfigFailed = true;
            shareInitLock = false;
            retryCount = 0;
            console.log('[微信分享] 超过最大重试次数，停止初始化（避免循环）');
          }
        });
      } catch (err) {
        console.error('[微信分享] 初始化异常：', err);
        isWxLoading = false;
        shareInitLock = false;
        
        // 异常重试逻辑
        if (retryCount < MAX_RETRY) {
          retryCount++;
          setTimeout(() => {
            isWxConfigInited = false;
            this.initGlobalWxShare();
          }, 1000);
        } else {
          isWxConfigFailed = true;
          retryCount = 0;
        }
      }
    },

    // 设置分享内容：固定分享链接，避免签名问题
    setWxShareContent(wx) {
      if (!wx) {
        console.error('[微信分享] wx实例不存在');
        return;
      }

      // 固定分享配置：链接与签名路径完全一致
      const shareConfig = {
        title: '云竞慧博体育服务号',
        desc: '足球、篮球胜负、比分分析，足球数据展示。',
        posterUrl: 'https://www.tianjifu.com/static/share-logo.jpg',
        link: 'https://www.tianjifu.com/dev/' // 固定链接，与签名路径一致
      };

      // 新版分享给朋友
      try {
        wx.updateAppMessageShareData({
          title: shareConfig.title,
          desc: shareConfig.desc,
          link: shareConfig.link,
          imgUrl: shareConfig.posterUrl,
          success: () => {
            console.log('分享卡片配置成功（好友）');
            isSharePanelOpened = true;
          }
        });
      } catch (e) {
        console.error('[微信分享] 新版分享给朋友接口失败：', e);
      }

      // 新版分享到朋友圈
      try {
        wx.updateTimelineShareData({
          title: shareConfig.title,
          link: shareConfig.link,
          imgUrl: shareConfig.posterUrl,
          success: () => {
            console.log('分享卡片配置成功（朋友圈）');
            isSharePanelOpened = true;
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
            isSharePanelOpened = true;
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
            isSharePanelOpened = true;
          },
          success: () => {
            console.log('旧版分享卡片配置成功（朋友圈）');
          }
        });
      } catch (e) {
        console.error('[微信分享] 旧版分享到朋友圈接口失败：', e);
      }

      // 监听分享成功事件
      window.addEventListener('pagehide', this.handleShareSuccess);
    },

    // 处理分享成功赠币
    handleShareSuccess() {
      if (!hasGrantCoin && isSharePanelOpened) {
        this.callShareGiveCoin();
      }
    },

    // 调用赠币接口
    async callShareGiveCoin() {
      if (hasGrantCoin) {
        console.log('已赠币，跳过重复调用');
        return;
      }

      try {
        await shareGiveCoin(); 
        hasGrantCoin = true; 
        console.log('赠币接口调用成功');
      } catch (err) {
        console.error('赠币接口调用失败：', err);
        hasGrantCoin = false;
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