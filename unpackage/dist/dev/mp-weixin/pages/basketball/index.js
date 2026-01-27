(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["pages/basketball/index"],{

/***/ 100:
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!C:/Users/zxg00/Documents/HBuilderProjects/football-cup/pages/basketball/index.vue?vue&type=template&id=21272b81&scoped=true& ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return recyclableRender; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "components", function() { return components; });
var components
try {
  components = {
    UniNumberKeyboard: function () {
      return __webpack_require__.e(/*! import() | components/UniNumberKeyboard/UniNumberKeyboard */ "components/UniNumberKeyboard/UniNumberKeyboard").then(__webpack_require__.bind(null, /*! @/components/UniNumberKeyboard/UniNumberKeyboard.vue */ 297))
    },
  }
} catch (e) {
  if (
    e.message.indexOf("Cannot find module") !== -1 &&
    e.message.indexOf(".vue") !== -1
  ) {
    console.error(e.message)
    console.error("1. 排查组件名称拼写是否正确")
    console.error(
      "2. 排查组件是否符合 easycom 规范，文档：https://uniapp.dcloud.net.cn/collocation/pages?id=easycom"
    )
    console.error(
      "3. 若组件不符合 easycom 规范，需手动引入，并在 components 中注册该组件"
    )
  } else {
    throw e
  }
}
var render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  var g0 =
    !(_vm.currentPlay === "胜负") &&
    !(_vm.currentPlay === "让分胜负") &&
    !(_vm.currentPlay === "大小分") &&
    !(_vm.currentPlay === "胜分差") &&
    _vm.currentPlay === "混合过关"
      ? _vm.drawerList.flatMap(function (d) {
          return d.lotteryList
        })
      : null
  var m0 = !(_vm.selectedMatchCount === 0) ? _vm.getComboDisplayText() : null
  var l0 = _vm.__map(_vm.typesList, function (typeText, __i0__) {
    var $orig = _vm.__get_orig(typeText)
    var g1 = _vm.selectedType.includes(typeText)
    var g2 = _vm.selectedType.includes(typeText)
    return {
      $orig: $orig,
      g1: g1,
      g2: g2,
    }
  })
  if (!_vm._isMounted) {
    _vm.e0 = function ($event) {
      _vm.showNumberKeyboard = true
    }
  }
  _vm.$mp.data = Object.assign(
    {},
    {
      $root: {
        g0: g0,
        m0: m0,
        l0: l0,
      },
    }
  )
}
var recyclableRender = false
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ 101:
/*!******************************************************************************************************************!*\
  !*** C:/Users/zxg00/Documents/HBuilderProjects/football-cup/pages/basketball/index.vue?vue&type=script&lang=js& ***!
  \******************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/babel-loader/lib!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./index.vue?vue&type=script&lang=js& */ 102);
/* harmony import */ var _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 102:
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!C:/Users/zxg00/Documents/HBuilderProjects/football-cup/pages/basketball/index.vue?vue&type=script&lang=js& ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
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
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ 11));
var _toConsumableArray2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ 18));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ 32));
var _demo = __webpack_require__(/*! @/api/demo */ 35);
var _data = __webpack_require__(/*! @/utils/data */ 61);
var _validate = __webpack_require__(/*! @/utils/validate */ 62);
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var NativeTabbar = function NativeTabbar() {
  Promise.all(/*! require.ensure | components/tabbar */[__webpack_require__.e("common/vendor"), __webpack_require__.e("components/tabbar")]).then((function () {
    return resolve(__webpack_require__(/*! @/components/tabbar.vue */ 311));
  }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
};
var MatchSpf = function MatchSpf() {
  Promise.all(/*! require.ensure | pages/commn/basketball/MatchSpf */[__webpack_require__.e("common/vendor"), __webpack_require__.e("pages/commn/basketball/MatchSpf")]).then((function () {
    return resolve(__webpack_require__(/*! @/pages/commn/basketball/MatchSpf.vue */ 424));
  }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
};
var MatchHandicap = function MatchHandicap() {
  Promise.all(/*! require.ensure | pages/commn/basketball/MatchHandicap */[__webpack_require__.e("common/vendor"), __webpack_require__.e("pages/commn/basketball/MatchHandicap")]).then((function () {
    return resolve(__webpack_require__(/*! @/pages/commn/basketball/MatchHandicap.vue */ 431));
  }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
};
var MatchScore = function MatchScore() {
  __webpack_require__.e(/*! require.ensure | pages/commn/basketball/MatchScore */ "pages/commn/basketball/MatchScore").then((function () {
    return resolve(__webpack_require__(/*! @/pages/commn/basketball/MatchScore.vue */ 438));
  }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
};
var MatchHalfFull = function MatchHalfFull() {
  __webpack_require__.e(/*! require.ensure | pages/commn/basketball/MatchHalfFull */ "pages/commn/basketball/MatchHalfFull").then((function () {
    return resolve(__webpack_require__(/*! @/pages/commn/basketball/MatchHalfFull.vue */ 445));
  }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
};
var MixedPassList = function MixedPassList() {
  __webpack_require__.e(/*! require.ensure | pages/commn/basketball/MixedPassList */ "pages/commn/basketball/MixedPassList").then((function () {
    return resolve(__webpack_require__(/*! @/pages/commn/basketball/MixedPassList.vue */ 452));
  }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
};
var CustomHeader = function CustomHeader() {
  __webpack_require__.e(/*! require.ensure | components/CustomHeader */ "components/CustomHeader").then((function () {
    return resolve(__webpack_require__(/*! @/components/CustomHeader.vue */ 304));
  }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
};
var ReminderDialog = function ReminderDialog() {
  __webpack_require__.e(/*! require.ensure | pages/commn/ReminderDialog */ "pages/commn/ReminderDialog").then((function () {
    return resolve(__webpack_require__(/*! @/pages/commn/ReminderDialog.vue */ 368));
  }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
};
var TipsPopup = function TipsPopup() {
  __webpack_require__.e(/*! require.ensure | pages/commn/playTip */ "pages/commn/playTip").then((function () {
    return resolve(__webpack_require__(/*! @/pages/commn/playTip */ 318));
  }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
};
var EmptyStop = function EmptyStop() {
  __webpack_require__.e(/*! require.ensure | pages/commn/emptyStop */ "pages/commn/emptyStop").then((function () {
    return resolve(__webpack_require__(/*! @/pages/commn/emptyStop.vue */ 375));
  }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
};
var _default = {
  components: {
    NativeTabbar: NativeTabbar,
    MatchSpf: MatchSpf,
    MatchHandicap: MatchHandicap,
    MatchScore: MatchScore,
    MatchHalfFull: MatchHalfFull,
    MixedPassList: MixedPassList,
    // 注册组件
    CustomHeader: CustomHeader,
    ReminderDialog: ReminderDialog,
    TipsPopup: TipsPopup,
    EmptyStop: EmptyStop
  },
  data: function data() {
    return {
      typesList: ["胜负", "让分胜负", "大小分", "胜分差", "混合过关"],
      selectedType: ["胜负"],
      currentPlay: "胜负",
      hasToken: false,
      isPopupShowType: false,
      drawerList: [],
      isLoading: false,
      headerHeight: 0,
      isDialogShow: false,
      betCount: 1,
      statusBarHeight: 0,
      playTypeMap: {
        '胜负': "sf",
        '让分胜负': "rsf",
        '胜分差': "sfc",
        '大小分': "dxf",
        '混合过关': "hhgg" // 新增混合过关玩法映射
      },

      isRefreshing: false,
      isPopupShow: false,
      tipsTitle: "重要提示",
      tipsContentList: ["1、本软件无任何彩票销售业务，仅提供竞彩足球、竞彩篮球相关模拟竞猜玩法。", "2、本软件截图可作为彩票站打票依据。", "3、本软件预测数据仅供参考。", "4、体彩相关玩法、规则请到中国体育彩票官方渠道了解。", "5、本软件固定奖金数据可能存在未及时更新情况，通常浮动比例较小，可供参考。", "6、体彩爱好者可以设置小程序允许接收消息通知，会有更多交流机会及足不出户方便购彩方式。", "7、每天上午11点10分后本软件正式可用。"],
      windowHeight: 0,
      bottomBtnBarHeight: 0,
      tabbarHeight: 0,
      popupMaxHeight: 0,
      collapseStatus: true,
      selectedCombo: "",
      comboList: [],
      showNumberKeyboard: false,
      touchStartX: 0,
      swipeThreshold: 50,
      hasData: false,
      // 新增：全局选中状态缓存（和足球逻辑对齐）
      matchSelectedState: {}
    };
  },
  onPullDownRefresh: function onPullDownRefresh() {
    var _this = this;
    return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _this.isRefreshing = true;
              _this.betCount = 1;
              _context.next = 5;
              return _this.loadMatchData();
            case 5:
              _context.next = 11;
              break;
            case 7:
              _context.prev = 7;
              _context.t0 = _context["catch"](0);
              console.error("下拉刷新失败：", _context.t0);
              uni.showToast({
                title: "刷新失败",
                icon: "none"
              });
            case 11:
              _context.prev = 11;
              _this.isRefreshing = false;
              uni.stopPullDownRefresh();
              return _context.finish(11);
            case 15:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 7, 11, 15]]);
    }))();
  },
  computed: {
    targetLotteryType: function targetLotteryType() {
      return this.playTypeMap[this.currentPlay] || "rsf";
    },
    // 核心修复：selectedMatchCount 实时精准统计，和足球逻辑完全对齐
    selectedMatchCount: function selectedMatchCount() {
      var _this2 = this;
      var count = 0;
      // 深遍历所有赛事，确保不遗漏
      this.drawerList.forEach(function (drawer) {
        if (!drawer || !Array.isArray(drawer.lotteryList)) return;
        drawer.lotteryList.forEach(function (item) {
          if (!item) return;
          var isSelected = false;
          switch (_this2.currentPlay) {
            case "胜负":
              isSelected = !!item.homeSelected || !!item.awaySelected;
              break;
            case "让分胜负":
              isSelected = !!item.rHomeSelected || !!item.rAwaySelected;
              break;
            case "大小分":
              isSelected = !!item.homeSelected || !!item.awaySelected;
              break;
            case "胜分差":
              isSelected = Array.isArray(item.selectedScores) && item.selectedScores.length > 0;
              break;
            case "混合过关":
              // 优先读取全局缓存，再读取item自身，确保数据一致
              var matchState = _this2.matchSelectedState[item.serial_number] || item;
              var hasSpf = matchState.selectedSpf && matchState.selectedSpf.length;
              var hasDx = matchState.selectedDx && matchState.selectedDx.length;
              var hasSfc = matchState.selectedSfc && matchState.selectedSfc.length;
              isSelected = hasSpf || hasDx || hasSfc;
              break;
            default:
              break;
          }
          if (isSelected) count++;
        });
      });
      console.log("[".concat(this.currentPlay, "] \u9009\u4E2D\u573A\u6B21\u7EDF\u8BA1\uFF1A").concat(count));
      return count;
    },
    // 原有 hasSingleMatch 方法，保持不变
    hasSingleMatch: function hasSingleMatch() {
      var _this3 = this;
      var selectedMatches = this.getSelectedMatches();
      return selectedMatches.some(function (item) {
        switch (_this3.currentPlay) {
          case "胜负":
            return item.is_sf_single == 1;
          case "让分胜负":
            return item.is_rsf_single == 1;
          case "胜分差":
            return item.is_sfc_single == 1;
          case "大小分":
            return item.is_dxf_single == 1;
          case "混合过关":
            return item.is_sf_single == 1 || item.is_rsf_single == 1 || item.is_dxf_single == 1 || item.is_sfc_single == 1;
          default:
            return false;
        }
      });
    }
  },
  watch: {
    selectedMatchCount: function selectedMatchCount(newVal) {
      var _this4 = this;
      this.generateComboList();
      // 选中数>0时强制展开串关栏
      if (newVal > 0) {
        this.collapseStatus = false;
      }
      // 强制更新DOM，确保UI同步
      this.$nextTick(function () {
        _this4.$forceUpdate();
      });
    },
    hasSingleMatch: function hasSingleMatch() {
      this.generateComboList();
    },
    // 监听玩法切换，重置状态
    currentPlay: function currentPlay() {
      var _this5 = this;
      this.selectedCombo = "";
      this.collapseStatus = false;
      this.$nextTick(function () {
        _this5.generateComboList();
        _this5.$forceUpdate();
      });
    },
    // 监听drawerList变化，初始化全局选中状态缓存
    drawerList: {
      deep: true,
      handler: function handler(newVal) {
        var _this6 = this;
        if (!newVal || !newVal.length) return;
        // 初始化全局选中状态
        newVal.forEach(function (drawer) {
          drawer.lotteryList.forEach(function (item) {
            if (!_this6.matchSelectedState[item.serial_number]) {
              _this6.$set(_this6.matchSelectedState, item.serial_number, {
                selectedSpf: (0, _toConsumableArray2.default)(item.selectedSpf || []),
                selectedDx: (0, _toConsumableArray2.default)(item.selectedDx || []),
                selectedSfc: (0, _toConsumableArray2.default)(item.selectedSfc || []),
                homeSelected: item.homeSelected || false,
                awaySelected: item.awaySelected || false,
                rHomeSelected: item.rHomeSelected || false,
                rAwaySelected: item.rAwaySelected || false,
                selectedScores: (0, _toConsumableArray2.default)(item.selectedScores || [])
              });
            }
          });
        });
      }
    }
  },
  created: function created() {
    if (uni.getWindowInfo) {
      var windowInfo = uni.getWindowInfo();
      this.statusBarHeight = windowInfo.statusBarHeight;
    } else {
      var systemInfo = uni.getSystemInfoSync();
      this.statusBarHeight = systemInfo.statusBarHeight;
    }
  },
  mounted: function mounted() {
    this.calcHeaderHeight();
    this.calcPopupMaxHeight();
    this.generateComboList();
  },
  onShow: function onShow() {
    var editedData = uni.getStorageSync("editedMatchData");
    if (editedData) {
      var parsedData = typeof editedData === "string" ? JSON.parse(editedData) : editedData;
      this.syncUpdatedMatches(parsedData);
      uni.removeStorageSync("editedMatchData");
    } else {
      this.loadMatchData();
    }
  },
  methods: {
    // 核心新增：校验选中状态（和足球逻辑对齐）
    checkSelected: function checkSelected(item, val) {
      if (!item || !val) return false;
      // 优先读取全局缓存
      var matchState = this.matchSelectedState[item.serial_number] || item;
      return matchState.selectedSpf && matchState.selectedSpf.includes(val);
    },
    // 左右滑动切换Tab
    onTouchStart: function onTouchStart(e) {
      this.touchStartX = e.changedTouches[0].clientX;
    },
    onTouchEnd: function onTouchEnd(e) {
      var touchEndX = e.changedTouches[0].clientX;
      var diffX = touchEndX - this.touchStartX;
      if (Math.abs(diffX) < this.swipeThreshold) return;
      var tabbar = this.$refs.nativeTabbar;
      if (!tabbar) return;
      if (diffX < 0) {
        tabbar.switchTabBySwipe('left');
      } else {
        tabbar.switchTabBySwipe('right');
      }
    },
    // 自定义数字键盘
    handleKeyboardInput: function handleKeyboardInput(val) {
      var num = parseInt(val) || 1;
      if (num < 1) {
        this.betCount = 1;
      } else if (num > 50) {
        this.betCount = 50;
      } else {
        this.betCount = num;
      }
    },
    handleKeyboardConfirm: function handleKeyboardConfirm(val) {
      var num = parseInt(val) || 1;
      this.betCount = Math.min(Math.max(num, 1), 50);
      this.showNumberKeyboard = false;
    },
    // 串关展开/收起
    toggleCollapse: function toggleCollapse() {
      this.collapseStatus = !this.collapseStatus;
      if (!this.collapseStatus) {
        this.generateComboList();
      }
    },
    // 串关显示文本
    getComboDisplayText: function getComboDisplayText() {
      var matchCount = this.selectedMatchCount;
      var hasSingle = this.hasSingleMatch;
      if (matchCount === 1 && hasSingle) {
        return "单关";
      } else if (matchCount > 1) {
        return "".concat(matchCount, "\u4E321");
      }
      return "过关方式";
    },
    // 生成串关列表（和足球逻辑完全对齐）
    generateComboList: function generateComboList() {
      var list = [];
      var matchCount = this.selectedMatchCount;
      var hasSingle = this.hasSingleMatch;
      this.comboList = [];
      if (matchCount === 0) {
        this.selectedCombo = "";
        return;
      }

      // 单场逻辑：混合过关兼容单场
      if (matchCount === 1) {
        list.push({
          label: "单关",
          value: "single",
          enabled: true
        });
        this.selectedCombo = "single";
      } else if (matchCount >= 2) {
        // 多场逻辑：2-8串1
        for (var i = 2; i <= Math.min(8, matchCount); i++) {
          list.push({
            label: "".concat(i, "\u4E321"),
            value: "".concat(i, "c1"),
            enabled: true
          });
        }
        this.selectedCombo = "".concat(matchCount, "c1");
      }
      this.comboList = list;
      this.$forceUpdate();
    },
    // 串关选择
    handleComboSelect: function handleComboSelect(item) {
      if (!item.enabled) return;
      this.selectedCombo = item.value;
    },
    // 计算弹窗最大高度
    calcPopupMaxHeight: function calcPopupMaxHeight() {
      var systemInfo = uni.getSystemInfoSync();
      this.windowHeight = systemInfo.windowHeight;
      this.bottomBtnBarHeight = 90 / 750 * systemInfo.windowWidth;
      this.tabbarHeight = 100 / 750 * systemInfo.windowWidth;
      this.popupMaxHeight = this.windowHeight;
      this.popupMaxHeight = this.windowHeight;
    },
    handlePopupClose: function handlePopupClose() {
      this.isPopupShow = false;
    },
    // 玩法切换弹窗
    togglePopup: function togglePopup() {
      this.isPopupShowType = !this.isPopupShowType;
    },
    // 获取选中的赛事（适配混合过关，和足球逻辑对齐）
    getSelectedMatches: function getSelectedMatches() {
      var _this7 = this;
      var selected = [];
      this.drawerList.forEach(function (drawer) {
        if (!drawer || !Array.isArray(drawer.lotteryList)) return;
        drawer.lotteryList.forEach(function (item) {
          var isSelected = false;
          // 优先读取全局缓存
          var matchState = _this7.matchSelectedState[item.serial_number] || item;
          switch (_this7.currentPlay) {
            case "大小分":
              isSelected = Boolean(matchState.homeSelected) || Boolean(matchState.awaySelected);
              break;
            case "胜负":
              isSelected = Boolean(matchState.homeSelected) || Boolean(matchState.awaySelected);
              break;
            case "让分胜负":
              isSelected = Boolean(matchState.rHomeSelected) || Boolean(matchState.rAwaySelected);
              break;
            case "胜分差":
              isSelected = Array.isArray(matchState.selectedScores) && matchState.selectedScores.length > 0;
              break;
            case "混合过关":
              var hasSpf = matchState.selectedSpf && matchState.selectedSpf.length;
              var hasDx = matchState.selectedDx && matchState.selectedDx.length;
              var hasSfc = matchState.selectedSfc && matchState.selectedSfc.length;
              isSelected = hasSpf || hasDx || hasSfc;
              break;
          }
          if (isSelected) {
            selected.push(_objectSpread(_objectSpread({}, item), matchState));
          }
        });
      });
      console.log("[".concat(this.currentPlay, "] \u9009\u4E2D\u8D5B\u4E8B\uFF1A"), selected.map(function (item) {
        return item.serial_number;
      }));
      return selected;
    },
    // 跳转编辑页面（适配混合过关）
    goToSchemeEdit: function goToSchemeEdit() {
      var _this8 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2() {
        var selectedMatches, totalSelectedCount, hasSingleMatch, matchSerials, _res$data, res, isNeedUserPhone, editUrl;
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                selectedMatches = _this8.getSelectedMatches();
                totalSelectedCount = selectedMatches.length; // 1. 基础校验：最多8场
                if (!(totalSelectedCount > 8)) {
                  _context2.next = 5;
                  break;
                }
                uni.showToast({
                  title: "最多只能选择8场赛事",
                  icon: "none"
                });
                return _context2.abrupt("return");
              case 5:
                // 2. 单场判断
                hasSingleMatch = _this8.hasSingleMatch; // 3. 投注场次校验
                if (!hasSingleMatch) {
                  _context2.next = 12;
                  break;
                }
                if (!(totalSelectedCount < 1)) {
                  _context2.next = 10;
                  break;
                }
                uni.showToast({
                  title: "单场赛事至少选择1场",
                  icon: "none"
                });
                return _context2.abrupt("return");
              case 10:
                _context2.next = 15;
                break;
              case 12:
                if (!(totalSelectedCount < 2)) {
                  _context2.next = 15;
                  break;
                }
                uni.showToast({
                  title: "非单场赛事至少选择2场",
                  icon: "none"
                });
                return _context2.abrupt("return");
              case 15:
                if (_this8.selectedCombo) {
                  _context2.next = 18;
                  break;
                }
                uni.showToast({
                  title: "请选择过关方式",
                  icon: "none"
                });
                return _context2.abrupt("return");
              case 18:
                // 5. 停售校验
                matchSerials = selectedMatches.map(function (item) {
                  return item.serial_number;
                }).join(',');
                _context2.prev = 19;
                _this8.showLoading();
                _context2.next = 23;
                return (0, _demo.checkSelectBasketball)({
                  lotteryIds: matchSerials
                });
              case 23:
                res = _context2.sent;
                isNeedUserPhone = ((_res$data = res.data) === null || _res$data === void 0 ? void 0 : _res$data.isNeedUserPhone) || false;
                if (!(res.data && res.data.status == 1)) {
                  _context2.next = 44;
                  break;
                }
                // 6. 玩法与编辑页面匹配
                editUrl = "";
                _context2.t0 = _this8.currentPlay;
                _context2.next = _context2.t0 === "胜负" ? 30 : _context2.t0 === "让分胜负" ? 32 : _context2.t0 === "胜分差" ? 34 : _context2.t0 === "大小分" ? 36 : _context2.t0 === "混合过关" ? 38 : 40;
                break;
              case 30:
                editUrl = "/pages/edit/basketball/index";
                return _context2.abrupt("break", 41);
              case 32:
                editUrl = "/pages/edit/basketball/editHandicap";
                return _context2.abrupt("break", 41);
              case 34:
                editUrl = "/pages/edit/basketball/editScore";
                return _context2.abrupt("break", 41);
              case 36:
                editUrl = "/pages/edit/basketball/editHalfFull";
                return _context2.abrupt("break", 41);
              case 38:
                editUrl = "/pages/edit/basketball/editHhgg";
                return _context2.abrupt("break", 41);
              case 40:
                editUrl = "/pages/edit/basketball/index";
              case 41:
                // 7. 传递完整数据（包含混合过关选中字段）
                uni.navigateTo({
                  url: editUrl,
                  events: {
                    updateSelectedMatches: function updateSelectedMatches(updatedData) {
                      return _this8.syncUpdatedMatches(updatedData);
                    }
                  },
                  success: function success(res) {
                    res.eventChannel.emit("selectedData", {
                      matches: selectedMatches,
                      betCount: _this8.betCount,
                      isNeedUserPhone: isNeedUserPhone,
                      combo: _this8.selectedCombo,
                      comboText: _this8.getComboDisplayText(),
                      playType: _this8.currentPlay
                    });
                  }
                });
                _context2.next = 45;
                break;
              case 44:
                uni.showModal({
                  title: '提示',
                  content: "抱歉存在停售场次，请重新选择!",
                  showCancel: false,
                  confirmText: '我知道了',
                  success: function success(modalRes) {
                    if (modalRes.confirm) {
                      _this8.drawerList = [];
                      _this8.loadMatchData();
                      _this8.betCount = 1;
                      _this8.selectedCombo = "";
                    }
                  }
                });
              case 45:
                _context2.next = 51;
                break;
              case 47:
                _context2.prev = 47;
                _context2.t1 = _context2["catch"](19);
                console.error("checkSelectBasketball接口调用失败:", _context2.t1);
                uni.showModal({
                  title: '错误',
                  content: "验证失败，请稍后重试",
                  showCancel: false,
                  confirmText: '我知道了',
                  success: function success(modalRes) {
                    if (modalRes.confirm) {
                      _this8.drawerList = [];
                      _this8.loadMatchData();
                      _this8.betCount = 1;
                      _this8.selectedCombo = "";
                    }
                  }
                });
              case 51:
                _context2.prev = 51;
                _this8.hideLoading();
                return _context2.finish(51);
              case 54:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[19, 47, 51, 54]]);
      }))();
    },
    // 同步编辑页面返回的数据（适配混合过关，和足球逻辑对齐）
    syncUpdatedMatches: function syncUpdatedMatches(updatedData) {
      var _this9 = this;
      if (!updatedData || !updatedData.matches) return;

      // 清空所有选中状态
      this.drawerList.forEach(function (drawer, drawerIdx) {
        drawer.lotteryList.forEach(function (item, matchIdx) {
          // 基础玩法
          _this9.$set(_this9.drawerList[drawerIdx].lotteryList[matchIdx], "homeSelected", false);
          _this9.$set(_this9.drawerList[drawerIdx].lotteryList[matchIdx], "awaySelected", false);
          _this9.$set(_this9.drawerList[drawerIdx].lotteryList[matchIdx], "rHomeSelected", false);
          _this9.$set(_this9.drawerList[drawerIdx].lotteryList[matchIdx], "rAwaySelected", false);
          _this9.$set(_this9.drawerList[drawerIdx].lotteryList[matchIdx], "selectedScores", []);
          // 混合过关
          _this9.$set(_this9.drawerList[drawerIdx].lotteryList[matchIdx], "selectedSpf", []);
          _this9.$set(_this9.drawerList[drawerIdx].lotteryList[matchIdx], "selectedDx", []);
          _this9.$set(_this9.drawerList[drawerIdx].lotteryList[matchIdx], "selectedSfc", []);
          // 清空全局缓存
          _this9.$set(_this9.matchSelectedState, item.serial_number, {
            selectedSpf: [],
            selectedDx: [],
            selectedSfc: [],
            homeSelected: false,
            awaySelected: false,
            rHomeSelected: false,
            rAwaySelected: false,
            selectedScores: []
          });
        });
      });

      // 更新选中状态
      updatedData.matches.forEach(function (updatedItem) {
        _this9.drawerList.forEach(function (drawer, drawerIdx) {
          var targetMatchIdx = drawer.lotteryList.findIndex(function (item) {
            return item.serial_number === updatedItem.serial_number;
          });
          if (targetMatchIdx !== -1) {
            // 更新drawerList
            _this9.$set(_this9.drawerList[drawerIdx].lotteryList[targetMatchIdx], "homeSelected", updatedItem.homeSelected || false);
            _this9.$set(_this9.drawerList[drawerIdx].lotteryList[targetMatchIdx], "awaySelected", updatedItem.awaySelected || false);
            _this9.$set(_this9.drawerList[drawerIdx].lotteryList[targetMatchIdx], "rHomeSelected", updatedItem.rHomeSelected || false);
            _this9.$set(_this9.drawerList[drawerIdx].lotteryList[targetMatchIdx], "rAwaySelected", updatedItem.rAwaySelected || false);
            _this9.$set(_this9.drawerList[drawerIdx].lotteryList[targetMatchIdx], "selectedScores", updatedItem.selectedScores || []);
            _this9.$set(_this9.drawerList[drawerIdx].lotteryList[targetMatchIdx], "selectedSpf", updatedItem.selectedSpf || []);
            _this9.$set(_this9.drawerList[drawerIdx].lotteryList[targetMatchIdx], "selectedDx", updatedItem.selectedDx || []);
            _this9.$set(_this9.drawerList[drawerIdx].lotteryList[targetMatchIdx], "selectedSfc", updatedItem.selectedSfc || []);

            // 更新全局缓存（核心：和足球逻辑对齐）
            _this9.$set(_this9.matchSelectedState, updatedItem.serial_number, {
              selectedSpf: updatedItem.selectedSpf || [],
              selectedDx: updatedItem.selectedDx || [],
              selectedSfc: updatedItem.selectedSfc || [],
              homeSelected: updatedItem.homeSelected || false,
              awaySelected: updatedItem.awaySelected || false,
              rHomeSelected: updatedItem.rHomeSelected || false,
              rAwaySelected: updatedItem.rAwaySelected || false,
              selectedScores: updatedItem.selectedScores || []
            });
          }
        });
      });
      if (typeof updatedData.betCount === "number") {
        this.betCount = updatedData.betCount;
      }
      this.generateComboList();
    },
    // 倍数减
    handleMinus: function handleMinus() {
      if (this.selectedMatchCount < 1) return;
      if (this.betCount > 1) this.betCount--;
    },
    // 倍数输入
    handleBetInput: function handleBetInput(e) {
      var _this10 = this;
      var inputVal = e.detail.value;
      var validVal = (0, _validate.validateBetInput)(inputVal);
      this.betCount = null;
      this.$nextTick(function () {
        _this10.betCount = validVal;
      });
    },
    // 倍数加
    handlePlus: function handlePlus() {
      if (this.selectedMatchCount < 1) return;
      if (this.betCount < 50) {
        this.betCount++;
      } else {
        uni.showToast({
          title: "倍数最多50倍",
          icon: "none"
        });
      }
    },
    // 胜负选中切换（和足球逻辑对齐）
    toggleSelect: function toggleSelect(targetItem, key) {
      var _this11 = this;
      this.drawerList.forEach(function (drawer, drawerIdx) {
        var targetMatchIdx = drawer.lotteryList.findIndex(function (item) {
          return item.serial_number == targetItem.serial_number;
        });
        if (targetMatchIdx !== -1) {
          // 更新drawerList
          var currentVal = _this11.drawerList[drawerIdx].lotteryList[targetMatchIdx][key];
          _this11.$set(_this11.drawerList[drawerIdx].lotteryList[targetMatchIdx], key, !currentVal);

          // 更新全局缓存
          if (!_this11.matchSelectedState[targetItem.serial_number]) {
            _this11.$set(_this11.matchSelectedState, targetItem.serial_number, _objectSpread({}, _this11.drawerList[drawerIdx].lotteryList[targetMatchIdx]));
          }
          _this11.$set(_this11.matchSelectedState[targetItem.serial_number], key, !currentVal);
        }
      });
      this.$forceUpdate();
    },
    // 大小分选中切换
    toggleHalfFullSelect: function toggleHalfFullSelect(targetItem, selectType) {
      var _this12 = this;
      if (!["homeSelected", "awaySelected"].includes(selectType)) {
        uni.showToast({
          title: "参数错误：选中字段不合法",
          icon: "none"
        });
        console.error("非法selectType：", selectType);
        return;
      }
      this.drawerList.forEach(function (drawer, drawerIdx) {
        var matchIdx = drawer.lotteryList.findIndex(function (item) {
          return item.serial_number === targetItem.serial_number || item.serial_number === targetItem.serialNumber;
        });
        if (matchIdx !== -1) {
          var _this12$drawerList$dr;
          var currentStatus = (_this12$drawerList$dr = _this12.drawerList[drawerIdx].lotteryList[matchIdx][selectType]) !== null && _this12$drawerList$dr !== void 0 ? _this12$drawerList$dr : false;
          // 更新drawerList
          _this12.$set(_this12.drawerList[drawerIdx].lotteryList[matchIdx], selectType, !currentStatus);

          // 更新全局缓存
          var serialNumber = targetItem.serial_number || targetItem.serialNumber;
          if (!_this12.matchSelectedState[serialNumber]) {
            _this12.$set(_this12.matchSelectedState, serialNumber, _objectSpread({}, _this12.drawerList[drawerIdx].lotteryList[matchIdx]));
          }
          _this12.$set(_this12.matchSelectedState[serialNumber], selectType, !currentStatus);
        } else {
          console.warn("未找到对应赛事：", targetItem.serial_number || targetItem.serialNumber);
        }
      });
      this.generateComboList();
    },
    // 胜分差选中切换
    toggleScoreSelect: function toggleScoreSelect(data) {
      var _this13 = this;
      var serialNumber = data.serialNumber,
        selectedScores = data.selectedScores;
      this.drawerList.forEach(function (drawer, drawerIdx) {
        var matchIdx = drawer.lotteryList.findIndex(function (item) {
          return item.serial_number === serialNumber;
        });
        if (matchIdx !== -1) {
          // 更新drawerList
          _this13.$set(_this13.drawerList[drawerIdx].lotteryList[matchIdx], "selectedScores", selectedScores);

          // 更新全局缓存
          if (!_this13.matchSelectedState[serialNumber]) {
            _this13.$set(_this13.matchSelectedState, serialNumber, _objectSpread({}, _this13.drawerList[drawerIdx].lotteryList[matchIdx]));
          }
          _this13.$set(_this13.matchSelectedState[serialNumber], "selectedScores", selectedScores);
        }
      });
      this.generateComboList();
    },
    // 核心修复：混合过关 - 胜负/让分胜负选中事件处理（和足球逻辑对齐）
    handleHhggSpfSelect: function handleHhggSpfSelect(item) {
      var _this14 = this;
      if (!item || !item.serial_number) return;

      // 1. 更新全局缓存（核心）
      this.$set(this.matchSelectedState, item.serial_number, _objectSpread(_objectSpread({}, this.matchSelectedState[item.serial_number]), {}, {
        selectedSpf: (0, _toConsumableArray2.default)(item.selectedSpf)
      }));

      // 2. 更新drawerList
      this.drawerList.forEach(function (drawer, drawerIdx) {
        var targetMatchIdx = drawer.lotteryList.findIndex(function (m) {
          return m.serial_number === item.serial_number;
        });
        if (targetMatchIdx !== -1) {
          _this14.$set(drawer.lotteryList[targetMatchIdx], 'selectedSpf', (0, _toConsumableArray2.default)(item.selectedSpf));
        }
      });

      // 3. 强制刷新
      this.$nextTick(function () {
        _this14.generateComboList();
        _this14.$forceUpdate();
      });
      console.log("[\u6DF7\u5408\u8FC7\u5173] \u80DC\u8D1F\u9009\u4E2D\u66F4\u65B0\uFF1A".concat(item.serial_number), item.selectedSpf);
    },
    // 核心修复：混合过关 - 所有玩法选中事件处理（和足球逻辑对齐）
    handleHhggMultiSelect: function handleHhggMultiSelect(data) {
      var _this15 = this;
      var serialNumber = data.serialNumber,
        selectedData = data.selectedData;
      if (!serialNumber || !selectedData) return;

      // 1. 转换弹框数据为列表格式
      var spfList = [];
      [].concat((0, _toConsumableArray2.default)(selectedData.spf || []), (0, _toConsumableArray2.default)(selectedData.rspf || [])).forEach(function (val) {
        var spfMapping = {
          '胜负_主胜': 'home_win',
          '胜负_客胜': 'home_lose',
          '让分_主胜': 'home_win_r',
          '让分_客胜': 'home_lose_r'
        };
        if (spfMapping[val]) spfList.push(spfMapping[val]);
      });
      var dxList = [];
      (selectedData.dx || []).forEach(function (val) {
        var dxMapping = {
          '大小分_大': 'dx_big',
          '大小分_小': 'dx_small'
        };
        if (dxMapping[val]) dxList.push(dxMapping[val]);
      });
      var sfcList = [];
      (selectedData.sfc || []).forEach(function (val) {
        var sfcMapping = {
          '胜分差_客胜_1-5': 'sfc_away_1_5',
          '胜分差_客胜_6-10': 'sfc_away_6_10',
          '胜分差_客胜_11-15': 'sfc_away_11_15',
          '胜分差_客胜_16-20': 'sfc_away_16_20',
          '胜分差_客胜_21-25': 'sfc_away_21_25',
          '胜分差_客胜_25+': 'sfc_away_25_plus',
          '胜分差_主胜_1-5': 'sfc_home_1_5',
          '胜分差_主胜_6-10': 'sfc_home_6_10',
          '胜分差_主胜_11-15': 'sfc_home_11_15',
          '胜分差_主胜_16-20': 'sfc_home_16_20',
          '胜分差_主胜_21-25': 'sfc_home_21_25',
          '胜分差_主胜_25+': 'sfc_home_25_plus'
        };
        if (sfcMapping[val]) sfcList.push(sfcMapping[val]);
      });

      // 2. 更新全局缓存（核心：和足球逻辑一致）
      this.$set(this.matchSelectedState, serialNumber, _objectSpread(_objectSpread({}, this.matchSelectedState[serialNumber]), {}, {
        selectedSpf: spfList,
        selectedDx: dxList,
        selectedSfc: sfcList
      }));

      // 3. 更新drawerList
      this.drawerList.forEach(function (drawer, drawerIdx) {
        var targetMatchIdx = drawer.lotteryList.findIndex(function (m) {
          return m.serial_number === serialNumber;
        });
        if (targetMatchIdx !== -1) {
          _this15.$set(drawer.lotteryList[targetMatchIdx], 'selectedSpf', spfList);
          _this15.$set(drawer.lotteryList[targetMatchIdx], 'selectedDx', dxList);
          _this15.$set(drawer.lotteryList[targetMatchIdx], 'selectedSfc', sfcList);
        }
      });

      // 4. 强制刷新
      this.$nextTick(function () {
        _this15.generateComboList();
        _this15.collapseStatus = false;
        _this15.$forceUpdate();
      });
      console.log("[\u6DF7\u5408\u8FC7\u5173] \u5F39\u6846\u786E\u8BA4\u66F4\u65B0\uFF1A".concat(serialNumber), {
        spfList: spfList,
        dxList: dxList,
        sfcList: sfcList
      });
    },
    // 其他原有方法（保持不变）
    handleRecharge: function handleRecharge() {
      uni.navigateTo({
        url: "/pages/recharge/recharge"
      });
      this.isDialogShow = false;
    },
    handleCancel: function handleCancel() {
      this.isDialogShow = false;
    },
    checkLocalToken: function checkLocalToken() {
      var localToken = uni.getStorageSync("requestToken") || "";
      this.hasToken = !!localToken;
      this.showModal = !localToken;
    },
    wxLoginHandler: function wxLoginHandler() {
      var _this16 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3() {
        var _yield$uni$login, code, res;
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                _this16.showLoading();
                _context3.next = 4;
                return uni.login({
                  provider: "weixin"
                });
              case 4:
                _yield$uni$login = _context3.sent;
                code = _yield$uni$login.code;
                if (code) {
                  _context3.next = 8;
                  break;
                }
                throw new Error("获取微信登录凭证失败");
              case 8:
                _context3.next = 10;
                return (0, _demo.wxLogin)({
                  code: code
                });
              case 10:
                res = _context3.sent;
                if (res.data && res.data.token) {
                  uni.setStorageSync("requestToken", res.data.token);
                  _this16.hasToken = true;
                  uni.showToast({
                    title: "操作成功",
                    icon: "success"
                  });
                } else {
                  uni.showToast({
                    title: res.message || "微信登录失败",
                    icon: "none"
                  });
                }
                _context3.next = 18;
                break;
              case 14:
                _context3.prev = 14;
                _context3.t0 = _context3["catch"](0);
                console.error("微信登录异常:", _context3.t0);
                uni.showToast({
                  title: "登录失败，请稍后重试",
                  icon: "none"
                });
              case 18:
                _context3.prev = 18;
                _this16.hideLoading();
                return _context3.finish(18);
              case 21:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, null, [[0, 14, 18, 21]]);
      }))();
    },
    handleExchange: function handleExchange(code) {
      var _this17 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4() {
        var _res$data2, res;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.prev = 0;
                _this17.showLoading();
                _context4.next = 4;
                return (0, _demo.checkCode)({
                  checkCode: code
                });
              case 4:
                res = _context4.sent;
                if ((_res$data2 = res.data) !== null && _res$data2 !== void 0 && _res$data2.token) {
                  uni.setStorageSync("requestToken", res.data.token);
                  uni.showToast({
                    title: "兑换成功",
                    icon: "success"
                  });
                  _this17.hasToken = true;
                  _this17.showModal = false;
                } else {
                  uni.showToast({
                    title: res.message || "兑换失败",
                    icon: "none"
                  });
                }
                _context4.next = 12;
                break;
              case 8:
                _context4.prev = 8;
                _context4.t0 = _context4["catch"](0);
                console.error("兑换失败:", _context4.t0);
                uni.showToast({
                  title: "兑换失败，请重试",
                  icon: "none"
                });
              case 12:
                _context4.prev = 12;
                _this17.hideLoading();
                return _context4.finish(12);
              case 15:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, null, [[0, 8, 12, 15]]);
      }))();
    },
    // 加载赛事数据（核心修复：初始化全局缓存）
    loadMatchData: function loadMatchData() {
      var _this18 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee5() {
        var res, newDrawerList;
        return _regenerator.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.prev = 0;
                _this18.drawerList = [];
                _this18.matchSelectedState = {}; // 清空全局缓存
                _this18.isLoading = true;
                _this18.showLoading();
                _context5.next = 7;
                return (0, _demo.queryBasketBallLLottery)({
                  lotteryType: _this18.targetLotteryType
                });
              case 7:
                res = _context5.sent;
                newDrawerList = _this18.formatDrawerList(res.data);
                _this18.isLoading = false;
                _this18.hideLoading();

                // 初始化选中字段
                newDrawerList = newDrawerList.map(function (drawer) {
                  return _objectSpread(_objectSpread({}, drawer), {}, {
                    lotteryList: drawer.lotteryList.map(function (item) {
                      var initItem = _objectSpread(_objectSpread({}, item), {}, {
                        rHomeSelected: false,
                        rAwaySelected: false,
                        homeSelected: false,
                        awaySelected: false,
                        selectedScores: [],
                        selectedSpf: [],
                        selectedDx: [],
                        selectedSfc: []
                      });
                      // 初始化全局缓存
                      _this18.$set(_this18.matchSelectedState, item.serial_number, _objectSpread({}, initItem));
                      return initItem;
                    })
                  });
                });
                _this18.drawerList = newDrawerList;
                _this18.hasData = _this18.drawerList.length === 0;
                _this18.generateComboList();
                _this18.$forceUpdate();
                _context5.next = 23;
                break;
              case 18:
                _context5.prev = 18;
                _context5.t0 = _context5["catch"](0);
                _this18.hideLoading();
                console.error("加载赛事失败:", _context5.t0);
                uni.showToast({
                  title: "加载失败，请重试",
                  icon: "none"
                });
              case 23:
                _context5.prev = 23;
                _this18.hideLoading();
                _this18.isLoading = false;
                return _context5.finish(23);
              case 27:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, null, [[0, 18, 23, 27]]);
      }))();
    },
    formatDrawerList: function formatDrawerList(data) {
      if (!data) return [];
      var drawerList = [];
      Object.keys(data).forEach(function (key) {
        if (key.startsWith('data_') && data[key].title && data[key].lotteryList) {
          drawerList.push({
            title: data[key].title,
            lotteryList: data[key].lotteryList || []
          });
        }
      });
      return drawerList.sort(function (a, b) {
        var aKey = Object.keys(data).find(function (key) {
          return data[key].title === a.title;
        });
        var bKey = Object.keys(data).find(function (key) {
          return data[key].title === b.title;
        });
        return parseInt(aKey.replace('data_', '')) - parseInt(bKey.replace('data_', ''));
      });
    },
    calcHeaderHeight: function calcHeaderHeight() {
      var windowInfo = uni.getWindowInfo ? uni.getWindowInfo() : uni.getSystemInfoSync();
      var statusBarHeight = windowInfo.statusBarHeight;
      var customHeaderHeight = 80 / 750 * windowInfo.windowWidth;
      this.headerHeight = statusBarHeight + customHeaderHeight;
    },
    toggleType: function toggleType(value) {
      this.drawerList = [];
      this.matchSelectedState = {}; // 清空全局缓存
      this.selectedType = [value];
      this.currentPlay = value;
      this.isPopupShowType = false;
      this.betCount = 1;
      this.selectedCombo = "";
      this.loadMatchData();
    },
    closePopupType: function closePopupType() {
      this.isPopupShowType = false;
    },
    handleFunnel: function handleFunnel() {
      this.isPopupShow = true;
    },
    goToAiAnalysis: function goToAiAnalysis(item) {
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee6() {
        return _regenerator.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                try {
                  uni.navigateTo({
                    url: "/pages/test/basketballAi?id=".concat(item.id, "&isLottery=1")
                  });
                } catch (err) {
                  console.error("toDetail error:", err);
                }
              case 1:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }))();
    },
    showLoading: function showLoading() {
      uni.showLoading({
        title: "加载中...",
        mask: true
      });
    },
    hideLoading: function hideLoading() {
      uni.hideLoading();
    }
  }
};
exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["default"]))

/***/ }),

/***/ 103:
/*!***************************************************************************************************************************************************!*\
  !*** C:/Users/zxg00/Documents/HBuilderProjects/football-cup/pages/basketball/index.vue?vue&type=style&index=0&id=21272b81&scoped=true&lang=scss& ***!
  \***************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_style_index_0_id_21272b81_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/css-loader/dist/cjs.js??ref--8-oneOf-1-1!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-2!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/postcss-loader/src??ref--8-oneOf-1-3!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/sass-loader/dist/cjs.js??ref--8-oneOf-1-4!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-5!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./index.vue?vue&type=style&index=0&id=21272b81&scoped=true&lang=scss& */ 104);
/* harmony import */ var _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_style_index_0_id_21272b81_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_style_index_0_id_21272b81_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_style_index_0_id_21272b81_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_style_index_0_id_21272b81_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_style_index_0_id_21272b81_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 104:
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/css-loader/dist/cjs.js??ref--8-oneOf-1-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-2!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/sass-loader/dist/cjs.js??ref--8-oneOf-1-4!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-5!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!C:/Users/zxg00/Documents/HBuilderProjects/football-cup/pages/basketball/index.vue?vue&type=style&index=0&id=21272b81&scoped=true&lang=scss& ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
    if(false) { var cssReload; }
  

/***/ }),

/***/ 97:
/*!************************************************************************************************************!*\
  !*** C:/Users/zxg00/Documents/HBuilderProjects/football-cup/main.js?{"page":"pages%2Fbasketball%2Findex"} ***!
  \************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(wx, createPage) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
__webpack_require__(/*! uni-pages */ 26);
var _vue = _interopRequireDefault(__webpack_require__(/*! vue */ 25));
var _index = _interopRequireDefault(__webpack_require__(/*! ./pages/basketball/index.vue */ 98));
// @ts-ignore
wx.__webpack_require_UNI_MP_PLUGIN__ = __webpack_require__;
createPage(_index.default);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["createPage"]))

/***/ }),

/***/ 98:
/*!*****************************************************************************************!*\
  !*** C:/Users/zxg00/Documents/HBuilderProjects/football-cup/pages/basketball/index.vue ***!
  \*****************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _index_vue_vue_type_template_id_21272b81_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index.vue?vue&type=template&id=21272b81&scoped=true& */ 99);
/* harmony import */ var _index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./index.vue?vue&type=script&lang=js& */ 101);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _index_vue_vue_type_style_index_0_id_21272b81_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./index.vue?vue&type=style&index=0&id=21272b81&scoped=true&lang=scss& */ 103);
/* harmony import */ var _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/runtime/componentNormalizer.js */ 39);

var renderjs





/* normalize component */

var component = Object(_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _index_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _index_vue_vue_type_template_id_21272b81_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"],
  _index_vue_vue_type_template_id_21272b81_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "21272b81",
  null,
  false,
  _index_vue_vue_type_template_id_21272b81_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"],
  renderjs
)

component.options.__file = "pages/basketball/index.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 99:
/*!************************************************************************************************************************************!*\
  !*** C:/Users/zxg00/Documents/HBuilderProjects/football-cup/pages/basketball/index.vue?vue&type=template&id=21272b81&scoped=true& ***!
  \************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_template_id_21272b81_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./index.vue?vue&type=template&id=21272b81&scoped=true& */ 100);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_template_id_21272b81_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_template_id_21272b81_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_template_id_21272b81_scoped_true___WEBPACK_IMPORTED_MODULE_0__["recyclableRender"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "components", function() { return _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_index_vue_vue_type_template_id_21272b81_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"]; });



/***/ })

},[[97,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/basketball/index.js.map