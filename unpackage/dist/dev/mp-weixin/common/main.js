(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["common/main"],{

/***/ 0:
/*!**********************************************************************!*\
  !*** C:/Users/zxg00/Documents/HBuilderProjects/football-cup/main.js ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(wx, uni, createApp) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ 11));
var _typeof2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/typeof */ 13));
__webpack_require__(/*! uni-pages */ 26);
var _App = _interopRequireDefault(__webpack_require__(/*! ./App */ 27));
var _env = _interopRequireDefault(__webpack_require__(/*! ./config/env */ 41));
var _vue = _interopRequireDefault(__webpack_require__(/*! vue */ 25));
var _store = _interopRequireDefault(__webpack_require__(/*! ./store */ 42));
var _loading = __webpack_require__(/*! ./utils/loading.js */ 47);
var _demo = __webpack_require__(/*! @/api/demo.js */ 35);
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var _uniIcons = function _uniIcons() {
  Promise.all(/*! require.ensure | node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons */[__webpack_require__.e("common/vendor"), __webpack_require__.e("node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons")]).then((function () {
    return resolve(__webpack_require__(/*! @dcloudio/uni-ui/lib/uni-icons/uni-icons */ 266));
  }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
};
// @ts-ignore
wx.__webpack_require_UNI_MP_PLUGIN__ = __webpack_require__; // main.js（你原有的入口文件）

_vue.default.component('uni-icons', _uniIcons); // 单独注册uni-icons（避免全局注册遗漏）
_vue.default.prototype.$bus = new _vue.default();
var UniNumberKeyboard = function UniNumberKeyboard() {
  __webpack_require__.e(/*! require.ensure | components/UniNumberKeyboard/UniNumberKeyboard */ "components/UniNumberKeyboard/UniNumberKeyboard").then((function () {
    return resolve(__webpack_require__(/*! @/components/UniNumberKeyboard/UniNumberKeyboard.vue */ 274));
  }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
};
// 全局注册组件
_vue.default.component('UniNumberKeyboard', UniNumberKeyboard);
_App.default.mpType = 'app';

// 定义全局方法：获取系统参数并挂载全局

// ========== 核心2：加载 static 目录下的本地微信 JS-SDK（新增逻辑） ==========
// 仅 H5 端加载，小程序/App 无需加载

// 环境配置校验（你的原有代码）
if (!_env.default || (0, _typeof2.default)(_env.default) !== 'object') {
  console.error('⚠️ 环境配置异常，请检查 ./config/env.js 文件是否正确导出对象');
  window.$defaultEnv = {
    baseUrl: '',
    env: "development" || false
  };
}
uni.hideTabBar();
// Vue2 全局配置（你的原有代码）
_vue.default.config.productionTip = false;
_vue.default.prototype.$env = _env.default || window.$defaultEnv;
_vue.default.prototype.showLoading = _loading.showLoading;
_vue.default.prototype.hideLoading = _loading.hideLoading;

// 2. 实例化 Vue 时，将 store 注入（关键步骤）
_App.default.mpType = 'app';
var app = new _vue.default(_objectSpread({
  store: _store.default
}, _App.default));

// 挂载 Vue 实例（你的原有代码）
try {
  createApp(app).$mount();
  console.log('Vue2 应用初始化成功（已注入 Vuex Store）');
} catch (error) {
  console.error('Vue2 应用挂载失败：', error);
  uni.showToast({
    title: '应用加载失败，请重启',
    icon: 'none',
    duration: 3000
  });
}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["createApp"]))

/***/ }),

/***/ 27:
/*!**********************************************************************!*\
  !*** C:/Users/zxg00/Documents/HBuilderProjects/football-cup/App.vue ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _App_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./App.vue?vue&type=script&lang=js& */ 28);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _App_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _App_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _App_vue_vue_type_style_index_0_scss_true_lang_css___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./App.vue?vue&type=style&index=0&scss=true&lang=css& */ 38);
/* harmony import */ var _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/runtime/componentNormalizer.js */ 40);
var render, staticRenderFns, recyclableRender, components
var renderjs





/* normalize component */

var component = Object(_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__["default"])(
  _App_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__["default"],
  render,
  staticRenderFns,
  false,
  null,
  null,
  null,
  false,
  components,
  renderjs
)

component.options.__file = "App.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 28:
/*!***********************************************************************************************!*\
  !*** C:/Users/zxg00/Documents/HBuilderProjects/football-cup/App.vue?vue&type=script&lang=js& ***!
  \***********************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_App_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/babel-loader/lib!../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./App.vue?vue&type=script&lang=js& */ 29);
/* harmony import */ var _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_App_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_App_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_App_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_App_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_App_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 29:
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!C:/Users/zxg00/Documents/HBuilderProjects/football-cup/App.vue?vue&type=script&lang=js& ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(uni) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _regenerator = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/regenerator */ 30));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ 32));
var _vue = _interopRequireDefault(__webpack_require__(/*! vue */ 25));
var _auth = __webpack_require__(/*! @/utils/auth */ 33);
var _h5Auth = __webpack_require__(/*! @/utils/h5Auth */ 37);
var _storage = __webpack_require__(/*! @/utils/storage */ 34);
var _demo = __webpack_require__(/*! @/api/demo */ 35);
// 全局变量：解决循环+签名问题的核心标记
var isWxConfigInited = false; // 分享配置是否已初始化
var hasGrantCoin = false; // 是否已赠币
var isWxLoading = false; // 分享配置是否正在加载（防止重复请求）
var MAX_RETRY = 3; // 最大重试次数
var retryCount = 0; // 当前重试次数
var isSharePanelOpened = false; // 分享面板是否打开
var isWxConfigFailed = false; // 分享配置是否彻底失败（超过重试次数）
var shareInitLock = false; // 分享初始化锁（彻底杜绝循环调用）
var _default = {
  globalData: {
    baseUrl: 'https://www.tianjifu.com/qwxt',
    token: ''
  },
  data: function data() {
    return {
      invalidH5Token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1IiwidXNlcklkIjoiNSIsIm9wZW5JZCI6Im9PRGRWMV9qc3VWdHVFRWYxbm9LQTZFbTFZcEUiLCJpc1N5c01hbmFnZSI6IjAiLCJ0aW1lU3RhbXAiOjE3Njk5OTk5MjQ3NDJ9.SDgOKGOnz6v6bMFOOuMP_znqXB-B3lFes6MO4tWWx7Q',
      h5AuthLock: false,
      h5DevFixedToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1IiwidXNlcklkIjoiNSIsIm9wZW5JZCI6Im9PRGRWMV9qc3VWdHVFRWYxbm9LQTZFbTFZcEUiLCJpc1N5c01hbmFnZSI6IjAiLCJ0aW1lU3RhbXAiOjE3Njk5OTk5MjQ3NDJ9.SDgOKGOnz6v6bMFOOuMP_znqXB-B3lFes6MO4tWWx7Q'
    };
  },
  onLaunch: function () {
    var _onLaunch = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
      var mpTokenValid, loginResult;
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              uni.hideTabBar();
              console.log('==================== 全局初始化开始 ====================');
              _context.prev = 2;
              // 小程序环境：登录逻辑

              console.log('[小程序环境] 开始初始化登录逻辑');
              _context.next = 6;
              return (0, _auth.checkToken)();
            case 6:
              mpTokenValid = _context.sent;
              console.log('[小程序环境] Token有效性校验结果：', mpTokenValid);
              if (!mpTokenValid) {
                _context.next = 12;
                break;
              }
              this.globalData.token = (0, _storage.getToken)();
              console.log('[小程序环境] Token有效，直接赋值');
              return _context.abrupt("return");
            case 12:
              console.log('[小程序环境] Token无效，执行登录');
              _context.next = 15;
              return (0, _auth.login)();
            case 15:
              loginResult = _context.sent;
              console.log('[小程序环境] 登录结果：', loginResult);
              if (loginResult.success) {
                this.globalData.token = (0, _storage.getToken)();
                console.log('[小程序环境] 登录成功，更新Token');
              }
              _context.next = 24;
              break;
            case 20:
              _context.prev = 20;
              _context.t0 = _context["catch"](2);
              // uni.showToast({ title: "初始化失败", icon: "none", duration: 3000 });
              console.error('全局初始化异常：', _context.t0);
              this.h5AuthLock = false;
            case 24:
              console.log('==================== 全局初始化结束 ====================');
            case 25:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[2, 20]]);
    }));
    function onLaunch() {
      return _onLaunch.apply(this, arguments);
    }
    return onLaunch;
  }(),
  // 页面显示：核心修复循环调用问题
  onShow: function onShow() {
    // 第一步：先请求接口，把值存到 App.vue 的 data 里

    (0, _demo.sysParams)().then(function (res) {
      var status = res.data.fenXiUrlShowStatus;
      // 处理值：兼容字符串/数字，兜底false
      status = status === undefined || status === null ? false : status == '1';
      uni.setStorageSync("isShowStatus", status);
    });

    // 重置基础标记（保留失败标记，避免重复尝试）
    this.h5AuthLock = false;
    isSharePanelOpened = false;
    // 延迟执行分享初始化：避免页面未加载完成就触发
    setTimeout( /*#__PURE__*/(0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2() {
      return _regenerator.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    })), 500); // 延长延迟时间，避免页面切换频繁触发

    // 清除重复的赠币监听
  },
  // 页面隐藏：重置标记，避免循环
  onHide: function onHide() {
    if (isSharePanelOpened && !hasGrantCoin) {
      this.callShareGiveCoin();
    }
    // 仅重置非核心标记
    hasGrantCoin = false;
    isWxLoading = false;
    isSharePanelOpened = false;
    shareInitLock = false; // 释放初始化锁
  },
  // 页面卸载：彻底清理
  onUnload: function onUnload() {
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
    getIsShowStatus: function getIsShowStatus() {
      return this.globalData.isShowStatus;
    },
    // 更新全局Token：过滤无效Token
    updateGlobalToken: function updateGlobalToken(newToken) {
      console.log('[全局方法] 开始更新Token');
      if (newToken === this.invalidH5Token) {
        console.log('[全局方法] 检测到无效Token，强制清除');
        (0, _storage.removeToken)();
        (0, _h5Auth.clearAllCodeRelated)();
        this.globalData.token = '';
        return;
      }
      if (newToken && typeof newToken === 'string') {
        this.globalData.token = newToken;
        (0, _storage.setToken)(newToken);
        console.log('[全局方法] Token更新成功');
      } else {
        console.warn('[全局方法] Token更新失败：无效格式');
      }
    },
    // 加载提示
    showLoading: function showLoading() {
      uni.showLoading({
        title: "加载中...",
        mask: true
      });
    },
    hideLoading: function hideLoading() {
      uni.hideLoading();
    },
    // 等待微信JS-SDK加载完成
    waitForJWeixin: function waitForJWeixin() {
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3() {
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt("return", new Promise(function (resolve, reject) {
                  var startTime = Date.now();
                  var checkInterval = setInterval(function () {
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
                }));
              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }))();
    },
    // 获取稳定URL：彻底解决签名无效问题（核心修改）
    getStableUrl: function getStableUrl() {
      return new Promise(function (resolve) {
        setTimeout(function () {
          // 强制固定为后端签名用的路径：不带#、末尾带/
          var finalUrl = window.location.href.split('#')[0];
          console.log('[微信分享] 用于签名的稳定URL：', finalUrl);
          resolve(finalUrl);
        }, 300);
      });
    },
    // 初始化微信分享：彻底修复循环+签名问题
    initGlobalWxShare: function initGlobalWxShare() {
      var _this = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee5() {
        var wx, currentUrl, res, wxConfig;
        return _regenerator.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (!(shareInitLock || isWxLoading || isWxConfigFailed)) {
                  _context5.next = 3;
                  break;
                }
                console.log('[微信分享] 初始化被拦截：', {
                  shareInitLock: shareInitLock,
                  isWxLoading: isWxLoading,
                  isWxConfigFailed: isWxConfigFailed
                });
                return _context5.abrupt("return");
              case 3:
                // 标记初始化锁
                shareInitLock = true;
                isWxLoading = true;

                // H5环境二次校验Token

                // 非H5/非微信环境直接返回
                if (false) {}
                isWxLoading = false;
                shareInitLock = false;
                return _context5.abrupt("return");
              case 9:
                if (!isWxConfigInited) {
                  _context5.next = 14;
                  break;
                }
                try {
                  _this.setWxShareContent(window.jWeixin);
                } catch (e) {
                  console.error('[微信分享] 已初始化但设置内容失败：', e);
                }
                isWxLoading = false;
                shareInitLock = false;
                return _context5.abrupt("return");
              case 14:
                _context5.prev = 14;
                _context5.next = 17;
                return _this.waitForJWeixin();
              case 17:
                wx = _context5.sent;
                _context5.next = 20;
                return _this.getStableUrl();
              case 20:
                currentUrl = _context5.sent;
                _context5.next = 23;
                return (0, _demo.getH5ShareInfo)({
                  shareUrl: currentUrl,
                  _t: Date.now() // 加时间戳避免缓存
                });
              case 23:
                res = _context5.sent;
                wxConfig = res.data; // 微信配置：参数与后端完全一致
                wx.config({
                  debug: false,
                  // 关闭调试，避免日志干扰
                  appId: wxConfig.appId,
                  timestamp: wxConfig.timestamp,
                  nonceStr: wxConfig.nonceStr,
                  signature: wxConfig.signature,
                  jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData', 'onMenuShareAppMessage', 'onMenuShareTimeline'],
                  url: currentUrl,
                  beta: true
                });

                // 配置成功
                wx.ready(function () {
                  console.log('[微信分享] 配置初始化成功');
                  isWxConfigInited = true;
                  isWxLoading = false;
                  shareInitLock = false;
                  isWxConfigFailed = false;
                  _this.setWxShareContent(wx);
                });

                // 配置失败：修复重试逻辑
                wx.error( /*#__PURE__*/function () {
                  var _ref2 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4(err) {
                    return _regenerator.default.wrap(function _callee4$(_context4) {
                      while (1) {
                        switch (_context4.prev = _context4.next) {
                          case 0:
                            console.error("[\u5FAE\u4FE1\u5206\u4EAB] \u914D\u7F6E\u5931\u8D25\uFF08\u7B2C".concat(retryCount + 1, "\u6B21\uFF09\uFF1A"), err);
                            isWxLoading = false;

                            // 签名无效且未超过重试次数则重试
                            if (err.errMsg.includes('invalid signature') && retryCount < MAX_RETRY) {
                              retryCount++;
                              console.log("[\u5FAE\u4FE1\u5206\u4EAB] \u7B7E\u540D\u65E0\u6548\uFF0C".concat(retryCount, "\u79D2\u540E\u91CD\u8BD5\uFF08\u7B2C").concat(retryCount, "\u6B21\uFF09"));
                              setTimeout(function () {
                                isWxConfigInited = false; // 重置初始化标记
                                shareInitLock = false; // 释放锁允许重试
                                _this.initGlobalWxShare();
                              }, retryCount * 1500); // 递增重试间隔，避免频繁请求
                            } else {
                              // 超过重试次数，标记为彻底失败
                              isWxConfigFailed = true;
                              shareInitLock = false;
                              retryCount = 0;
                              console.log('[微信分享] 超过最大重试次数，停止初始化（避免循环）');
                            }
                          case 3:
                          case "end":
                            return _context4.stop();
                        }
                      }
                    }, _callee4);
                  }));
                  return function (_x) {
                    return _ref2.apply(this, arguments);
                  };
                }());
                _context5.next = 36;
                break;
              case 30:
                _context5.prev = 30;
                _context5.t0 = _context5["catch"](14);
                console.error('[微信分享] 初始化异常：', _context5.t0);
                isWxLoading = false;
                shareInitLock = false;

                // 异常重试逻辑
                if (retryCount < MAX_RETRY) {
                  retryCount++;
                  setTimeout(function () {
                    isWxConfigInited = false;
                    _this.initGlobalWxShare();
                  }, 1000);
                } else {
                  isWxConfigFailed = true;
                  retryCount = 0;
                }
              case 36:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, null, [[14, 30]]);
      }))();
    },
    // 设置分享内容：固定分享链接，避免签名问题
    setWxShareContent: function setWxShareContent(wx) {
      if (!wx) {
        console.error('[微信分享] wx实例不存在');
        return;
      }
      var link = window.location.href.split('#')[0];
      // 固定分享配置：链接与签名路径完全一致
      var shareConfig = {
        title: '云竞慧博体育服务号',
        desc: '足球、篮球胜负、比分分析，足球数据展示。',
        posterUrl: 'https://www.tianjifu.com/static/share-logo.jpg',
        link: link // 固定链接，与签名路径一致
      };

      // 新版分享给朋友
      try {
        wx.updateAppMessageShareData({
          title: shareConfig.title,
          desc: shareConfig.desc,
          link: shareConfig.link,
          imgUrl: shareConfig.posterUrl,
          success: function success() {
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
          success: function success() {
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
          trigger: function trigger() {
            console.log('用户打开了分享面板（好友）');
            isSharePanelOpened = true;
          },
          success: function success() {
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
          trigger: function trigger() {
            console.log('用户打开了分享面板（朋友圈）');
            isSharePanelOpened = true;
          },
          success: function success() {
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
    handleShareSuccess: function handleShareSuccess() {
      if (!hasGrantCoin && isSharePanelOpened) {
        this.callShareGiveCoin();
      }
    },
    // 调用赠币接口
    callShareGiveCoin: function callShareGiveCoin() {
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee6() {
        return _regenerator.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (!hasGrantCoin) {
                  _context6.next = 3;
                  break;
                }
                console.log('已赠币，跳过重复调用');
                return _context6.abrupt("return");
              case 3:
                _context6.prev = 3;
                _context6.next = 6;
                return (0, _demo.shareGiveCoin)();
              case 6:
                hasGrantCoin = true;
                console.log('赠币接口调用成功');
                _context6.next = 14;
                break;
              case 10:
                _context6.prev = 10;
                _context6.t0 = _context6["catch"](3);
                console.error('赠币接口调用失败：', _context6.t0);
                hasGrantCoin = false;
              case 14:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, null, [[3, 10]]);
      }))();
    }
  }
};
exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["default"]))

/***/ }),

/***/ 38:
/*!*****************************************************************************************************************!*\
  !*** C:/Users/zxg00/Documents/HBuilderProjects/football-cup/App.vue?vue&type=style&index=0&scss=true&lang=css& ***!
  \*****************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_App_vue_vue_type_style_index_0_scss_true_lang_css___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/css-loader/dist/cjs.js??ref--6-oneOf-1-1!../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-2!../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/postcss-loader/src??ref--6-oneOf-1-3!../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./App.vue?vue&type=style&index=0&scss=true&lang=css& */ 39);
/* harmony import */ var _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_App_vue_vue_type_style_index_0_scss_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_App_vue_vue_type_style_index_0_scss_true_lang_css___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_App_vue_vue_type_style_index_0_scss_true_lang_css___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_App_vue_vue_type_style_index_0_scss_true_lang_css___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_6_oneOf_1_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_6_oneOf_1_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_6_oneOf_1_2_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_6_oneOf_1_3_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_App_vue_vue_type_style_index_0_scss_true_lang_css___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 39:
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--6-oneOf-1-0!./node_modules/css-loader/dist/cjs.js??ref--6-oneOf-1-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--6-oneOf-1-2!./node_modules/postcss-loader/src??ref--6-oneOf-1-3!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!C:/Users/zxg00/Documents/HBuilderProjects/football-cup/App.vue?vue&type=style&index=0&scss=true&lang=css& ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
    if(false) { var cssReload; }
  

/***/ })

},[[0,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../.sourcemap/mp-weixin/common/main.js.map