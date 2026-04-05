<script>
import Vue from 'vue';
import { login, checkToken } from '@/utils/auth';
import { h5WechatAuth, checkH5Token, clearAllCodeRelated } from '@/utils/h5Auth';
import { getToken, setToken, removeToken } from '@/utils/storage';
import { getH5ShareInfo, sysParams ,shareGiveCoin } from '@/api/demo';
// 全局变量：删除所有分享相关标记
export default {
  globalData: {
    baseUrl:  'https://www.tianjifu.com/qwxt',
    token: ''
  },
  data() {
    return {
      invalidH5Token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1IiwidXNlcklkIjoiNSIsIm9wZW5JZCI6Im9PRGRWMV9qc3VWdHVFRWYxbm9LQTZFbTFZcEUiLCJpc1N5c01hbmFnZSI6IjAiLCJ0aW1lU3RhbXAiOjE3Njk5OTk5MjQ3NDJ9.SDgOKGOnz6v6bMFOOuMP_znqXB-B3lFes6MO4tWWx7Q',
      h5AuthLock: false,
      h5DevFixedToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1IiwidXNlcklkIjoiNSIsIm9wZW5JZCI6Im9PRGRWMV9qc3VWdHVFRWYxbm9LQTZFbTFZcEUiLCJpc1N5c01hbmFnZSI6IjAiLCJ0aW1lU3RhbXAiOjE3Njk5OTk5MjQ3NDJ9.SDgOKGOnz6v6bMFOOuMP_znqXB-B3lFes6MO4tWWx7Q',
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
      // #ifdef H5
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
      // #ifdef APP-PLUS
       const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI3NyIsInVzZXJJZCI6Ijc3Iiwib3BlbklkIjoib29iNk4yR210S3V2c1dxTW1fb19wSzI4LUxmMCIsImlzU3lzTWFuYWdlIjoiMCIsInRpbWVTdGFtcCI6MTc3MjU4ODE5MDQwNn0.ULO_i27weyfFPIEFzCxhy0OWzGjVFe0JwAyrwOSQxBg'
        setToken(token);
        this.globalData.token = token;
        this.h5AuthLock = false;
        console.log('[H5开发环境] 固定Token已设置完成');
        return;
      // #endif
    } catch (error) {
      // uni.showToast({ title: "初始化失败", icon: "none", duration: 3000 });
      console.error('全局初始化异常：', error);
      this.h5AuthLock = false;
    }
    console.log('==================== 全局初始化结束 ====================');
  },

  // 页面显示：移除所有分享相关逻辑
  onShow() {
    // #ifdef MP-WEIXIN
    // 第一步：先请求接口，把值存到 App.vue 的 data 里
    sysParams().then((res)=>{
      let v = res.data.xcx_show;
      let t = res.data.xcx_url_show;
      // 处理值：兼容字符串/数字，兜底false
      v = v === undefined || v === null ? false : (v == '1' );
      t = t === undefined || t === null ? false : (t == '1' );
      console.log(v,t, 'v,tttttttttttttttttttt')
      uni.setStorageSync("urlValue", v);
      uni.setStorageSync("xiValue", v);
    });
    // #endif
    // #ifdef H5
    uni.setStorageSync("urlValue", true); // 其它是这个
     uni.setStorageSync("xiValue", true); // 分析是这个
    this.$nextTick(()=>{Vue.prototype.urlValue = true;Vue.prototype.xiValue = true;})
    // #endif
    // #ifdef APP-PLUS
    try { plus.screen.lockOrientation('portrait-primary'); } catch (e) {}
    // #endif
    
    // 仅保留授权锁重置
    this.h5AuthLock = false;
  },

  // 页面隐藏：移除所有分享相关逻辑
  onHide() {
    // 仅保留授权锁重置
    this.h5AuthLock = false;
    
    // #ifdef H5
    import('@/utils/h5Auth').then(module => {
      if (module.resetAuthFlag) module.resetAuthFlag();
    });
    // #endif
  },

  // 页面卸载：移除所有分享相关逻辑
  onUnload() {
    this.h5AuthLock = false;
  },

  methods: {
    geturlValue(){
      return this.globalData.urlValue
    },
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
.up { color: red; font-size: 18rpx; margin-left: 4rpx; }
.down { color: #00c48c; font-size: 18rpx; margin-left: 4rpx; }
</style>