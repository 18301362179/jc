(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["pages/test/footballPredict"],{

/***/ 291:
/*!****************************************************************************************************************!*\
  !*** C:/Users/zxg00/Documents/HBuilderProjects/football-cup/main.js?{"page":"pages%2Ftest%2FfootballPredict"} ***!
  \****************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(wx, createPage) {

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ 4);
__webpack_require__(/*! uni-pages */ 26);
var _vue = _interopRequireDefault(__webpack_require__(/*! vue */ 25));
var _footballPredict = _interopRequireDefault(__webpack_require__(/*! ./pages/test/footballPredict.vue */ 292));
// @ts-ignore
wx.__webpack_require_UNI_MP_PLUGIN__ = __webpack_require__;
createPage(_footballPredict.default);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/wx.js */ 1)["default"], __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["createPage"]))

/***/ }),

/***/ 292:
/*!*********************************************************************************************!*\
  !*** C:/Users/zxg00/Documents/HBuilderProjects/football-cup/pages/test/footballPredict.vue ***!
  \*********************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _footballPredict_vue_vue_type_template_id_7a726da8_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./footballPredict.vue?vue&type=template&id=7a726da8&scoped=true& */ 293);
/* harmony import */ var _footballPredict_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./footballPredict.vue?vue&type=script&lang=js& */ 295);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _footballPredict_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _footballPredict_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__[key]; }) }(__WEBPACK_IMPORT_KEY__));
/* harmony import */ var _footballPredict_vue_vue_type_style_index_0_id_7a726da8_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./footballPredict.vue?vue&type=style&index=0&id=7a726da8&scoped=true&lang=scss& */ 297);
/* harmony import */ var _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/runtime/componentNormalizer.js */ 40);

var renderjs





/* normalize component */

var component = Object(_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_3__["default"])(
  _footballPredict_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__["default"],
  _footballPredict_vue_vue_type_template_id_7a726da8_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"],
  _footballPredict_vue_vue_type_template_id_7a726da8_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  "7a726da8",
  null,
  false,
  _footballPredict_vue_vue_type_template_id_7a726da8_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"],
  renderjs
)

component.options.__file = "pages/test/footballPredict.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 293:
/*!****************************************************************************************************************************************!*\
  !*** C:/Users/zxg00/Documents/HBuilderProjects/football-cup/pages/test/footballPredict.vue?vue&type=template&id=7a726da8&scoped=true& ***!
  \****************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_footballPredict_vue_vue_type_template_id_7a726da8_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./footballPredict.vue?vue&type=template&id=7a726da8&scoped=true& */ 294);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_footballPredict_vue_vue_type_template_id_7a726da8_scoped_true___WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_footballPredict_vue_vue_type_template_id_7a726da8_scoped_true___WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_footballPredict_vue_vue_type_template_id_7a726da8_scoped_true___WEBPACK_IMPORTED_MODULE_0__["recyclableRender"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "components", function() { return _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_17_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_template_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_uni_app_loader_page_meta_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_footballPredict_vue_vue_type_template_id_7a726da8_scoped_true___WEBPACK_IMPORTED_MODULE_0__["components"]; });



/***/ }),

/***/ 294:
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--17-0!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/template.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-uni-app-loader/page-meta.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!C:/Users/zxg00/Documents/HBuilderProjects/football-cup/pages/test/footballPredict.vue?vue&type=template&id=7a726da8&scoped=true& ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns, recyclableRender, components */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "recyclableRender", function() { return recyclableRender; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "components", function() { return components; });
var components
var render = function () {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  var l0 = ((_vm.historyData && _vm.historyData.matchList) || []).slice(
    0,
    _vm.historyRound
  )
  var g0 =
    Object.keys(_vm.tablesData.homeTables || {}).length === 0 &&
    Object.keys(_vm.tablesData.awayTables || {}).length === 0
  var l1 = (
    (_vm.recentData && _vm.recentData.home && _vm.recentData.home.matchList) ||
    []
  ).slice(0, _vm.matchRound)
  var l2 = (
    (_vm.recentData && _vm.recentData.away && _vm.recentData.away.matchList) ||
    []
  ).slice(0, _vm.matchRound)
  var l3 = _vm.__map(
    (_vm.futureData && _vm.futureData.home && _vm.futureData.home.matchList) ||
      [],
    function (item, idx) {
      var $orig = _vm.__get_orig(item)
      var g1 = (item.matchDateTime || "0").split(" ")[0] || "0"
      return {
        $orig: $orig,
        g1: g1,
      }
    }
  )
  var l4 = _vm.__map(
    (_vm.futureData && _vm.futureData.away && _vm.futureData.away.matchList) ||
      [],
    function (item, idx) {
      var $orig = _vm.__get_orig(item)
      var g2 = (item.matchDateTime || "0").split(" ")[0] || "0"
      return {
        $orig: $orig,
        g2: g2,
      }
    }
  )
  var g3 = (
    (_vm.shooterData &&
      _vm.shooterData.home &&
      _vm.shooterData.home.playerList) ||
    []
  ).length
  var g4 = (
    (_vm.shooterData &&
      _vm.shooterData.away &&
      _vm.shooterData.away.playerList) ||
    []
  ).length
  var g5 = (
    (_vm.injuryData &&
      _vm.injuryData.home &&
      _vm.injuryData.home.injuriesAndSuspensionsList) ||
    []
  ).length
  var g6 = (
    (_vm.injuryData &&
      _vm.injuryData.away &&
      _vm.injuryData.away.injuriesAndSuspensionsList) ||
    []
  ).length
  if (!_vm._isMounted) {
    _vm.e0 = function ($event) {
      _vm.showRankModal = false
    }
  }
  _vm.$mp.data = Object.assign(
    {},
    {
      $root: {
        l0: l0,
        g0: g0,
        l1: l1,
        l2: l2,
        l3: l3,
        l4: l4,
        g3: g3,
        g4: g4,
        g5: g5,
        g6: g6,
      },
    }
  )
}
var recyclableRender = false
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ 295:
/*!**********************************************************************************************************************!*\
  !*** C:/Users/zxg00/Documents/HBuilderProjects/football-cup/pages/test/footballPredict.vue?vue&type=script&lang=js& ***!
  \**********************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_footballPredict_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/babel-loader/lib!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./footballPredict.vue?vue&type=script&lang=js& */ 296);
/* harmony import */ var _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_footballPredict_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_footballPredict_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_footballPredict_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_footballPredict_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_babel_loader_lib_index_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_13_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_script_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_footballPredict_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 296:
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--13-1!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/script.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!C:/Users/zxg00/Documents/HBuilderProjects/football-cup/pages/test/footballPredict.vue?vue&type=script&lang=js& ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
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
var _defineProperty2 = _interopRequireDefault(__webpack_require__(/*! @babel/runtime/helpers/defineProperty */ 11));
var _demo = __webpack_require__(/*! @/api/demo */ 35);
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var CustomHeader = function CustomHeader() {
  __webpack_require__.e(/*! require.ensure | components/CustomHeader */ "components/CustomHeader").then((function () {
    return resolve(__webpack_require__(/*! @/components/CustomHeader.vue */ 338));
  }).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
};
var _default = {
  components: {
    CustomHeader: CustomHeader
  },
  data: function data() {
    return (0, _defineProperty2.default)({
      //头部
      headerInfo: {},
      //
      featureData: {},
      //积分
      tablesData: {},
      //积分弹框数据
      tablesModalData: {},
      // 接口固定参数
      matchId: 2499430,
      // 历史交锋数据（你给的原样）
      historyData: {},
      // ========== 历史交锋筛选开关 ==========
      historySameHost: false,
      // 同主客
      historySameLeague: false,
      // 同赛制
      historyRound: 5,
      // 展示场次

      // ========== 比赛近况筛选开关 ==========
      matchSameHost: false,
      // 同主客
      matchSameLeague: false,
      // 同赛制
      matchRound: 10,
      // 展示场次
      recentData: {},
      // 2. 特征分析 dataType: feature
      rankTab: "total",
      modalRankTab: "total",
      // 12. 未来赛事 dataType: future
      futureData: {},
      // 13. 射手信息 dataType: player
      shooterData: {},
      // 14. 伤病一览 dataType: injurySuspension
      injuryData: {},
      // 页面原有基础字段
      activeTab: 0,
      tabList: [{
        name: "特征分析",
        id: "section1"
      }, {
        name: "历史交锋",
        id: "section2"
      }, {
        name: "积分榜",
        id: "section3"
      }, {
        name: "比赛近况",
        id: "section4"
      }, {
        name: "未来赛事",
        id: "section5"
      }, {
        name: "射手信息",
        id: "section6"
      }, {
        name: "伤停一览",
        id: "section7"
      }],
      currentSection: "section1",
      sectionTopList: [],
      historyFilterIndex: 0,
      showRankModal: false,
      rankList: [],
      // 比赛近况筛选
      matchFilters: [{
        name: "同主客",
        type: "sameHost"
      }, {
        name: "同赛制",
        type: "sameLeague"
      }],
      matchFilterIndex: 0
    }, "matchRound", 5);
  },
  computed: {
    homeRankData: function homeRankData() {
      return this.tablesData.homeTables || {};
    },
    awayRankData: function awayRankData() {
      return this.tablesData.awayTables || {};
    }
  },
  onLoad: function onLoad(options) {
    this.matchId = options.id;
    this.getAllMatchData();
  },
  onReady: function onReady() {
    // 先获取一次位置
    this.getSectionTop();
  },
  methods: {
    handleClickShowMore: function handleClickShowMore(item) {
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return uni.navigateTo({
                  url: "/pages/test/tabsAll?seasonId=".concat(item.seasonId, "&uniformLeagueId=").concat(item.uniformLeagueId)
                });
              case 2:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }))();
    },
    // 历史交锋 - 切换同主客/同赛制
    toggleHistoryFilter: function toggleHistoryFilter(type) {
      var _this = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2() {
        return _regenerator.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (type === "host") {
                  _this.historySameHost = !_this.historySameHost;
                } else if (type === "league") {
                  _this.historySameLeague = !_this.historySameLeague;
                }
                _context2.next = 3;
                return _this.refreshHistoryData();
              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }))();
    },
    // 历史交锋 - 切换5场/10场
    changeHistoryRound: function changeHistoryRound(num) {
      var _this2 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee3() {
        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!(_this2.historyRound === num)) {
                  _context3.next = 2;
                  break;
                }
                return _context3.abrupt("return");
              case 2:
                _this2.historyRound = num;
                _context3.next = 5;
                return _this2.refreshHistoryData();
              case 5:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }))();
    },
    // 历史交锋 - 根据筛选条件请求接口并刷新列表
    refreshHistoryData: function refreshHistoryData() {
      var _this3 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee4() {
        var historySameHost, historySameLeague, historyRound;
        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                historySameHost = _this3.historySameHost, historySameLeague = _this3.historySameLeague, historyRound = _this3.historyRound;
                if (!(!historySameHost && !historySameLeague)) {
                  _context4.next = 6;
                  break;
                }
                _context4.next = 4;
                return _this3.getHistoryAllAll();
              case 4:
                _context4.next = 18;
                break;
              case 6:
                if (!(!historySameHost && historySameLeague)) {
                  _context4.next = 11;
                  break;
                }
                _context4.next = 9;
                return _this3.getHistorySameAll();
              case 9:
                _context4.next = 18;
                break;
              case 11:
                if (!(historySameHost && !historySameLeague)) {
                  _context4.next = 16;
                  break;
                }
                _context4.next = 14;
                return _this3.getHistoryAllSame();
              case 14:
                _context4.next = 18;
                break;
              case 16:
                _context4.next = 18;
                return _this3.getHistorySameSame();
              case 18:
                // 数据更新后，重新获取区块位置
                _this3.$nextTick(function () {
                  _this3.getSectionTop();
                });
              case 19:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }))();
    },
    // 比赛近况 - 切换同主客/同赛制
    toggleMatchFilter: function toggleMatchFilter(type) {
      var _this4 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee5() {
        return _regenerator.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (type === "host") {
                  _this4.matchSameHost = !_this4.matchSameHost;
                } else if (type === "league") {
                  _this4.matchSameLeague = !_this4.matchSameLeague;
                }
                _context5.next = 3;
                return _this4.refreshMatchData();
              case 3:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }))();
    },
    // 比赛近况 - 切换5场/10场
    changeMatchRound: function changeMatchRound(num) {
      var _this5 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee6() {
        return _regenerator.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (!(_this5.matchRound === num)) {
                  _context6.next = 2;
                  break;
                }
                return _context6.abrupt("return");
              case 2:
                _this5.matchRound = num;
                _context6.next = 5;
                return _this5.refreshMatchData();
              case 5:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }))();
    },
    // 比赛近况 - 根据筛选条件请求接口刷新
    refreshMatchData: function refreshMatchData() {
      var _this6 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee7() {
        var matchSameHost, matchSameLeague, matchRound;
        return _regenerator.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                matchSameHost = _this6.matchSameHost, matchSameLeague = _this6.matchSameLeague, matchRound = _this6.matchRound;
                if (!(!matchSameHost && !matchSameLeague)) {
                  _context7.next = 6;
                  break;
                }
                _context7.next = 4;
                return _this6.getResultAllAll();
              case 4:
                _context7.next = 18;
                break;
              case 6:
                if (!(!matchSameHost && matchSameLeague)) {
                  _context7.next = 11;
                  break;
                }
                _context7.next = 9;
                return _this6.getResultSameAll();
              case 9:
                _context7.next = 18;
                break;
              case 11:
                if (!(matchSameHost && !matchSameLeague)) {
                  _context7.next = 16;
                  break;
                }
                _context7.next = 14;
                return _this6.getResultAllSame();
              case 14:
                _context7.next = 18;
                break;
              case 16:
                _context7.next = 18;
                return _this6.getResultSameSame();
              case 18:
                // 数据更新后，重新获取区块位置
                _this6.$nextTick(function () {
                  _this6.getSectionTop();
                });
              case 19:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }))();
    },
    // 统一入口：一次性请求所有接口
    getAllMatchData: function getAllMatchData() {
      var _this7 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee8() {
        return _regenerator.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return _this7.getHeadData("head");
              case 2:
                _context8.next = 4;
                return _this7.getHeadData("predictor");
              case 4:
                _context8.next = 6;
                return _this7.getFeatureData();
              case 6:
                _context8.next = 8;
                return _this7.getHistoryAllAll();
              case 8:
                _context8.next = 10;
                return _this7.getResultAllAll();
              case 10:
                _context8.next = 12;
                return _this7.getTablesData();
              case 12:
                _context8.next = 14;
                return _this7.getFutureData();
              case 14:
                _context8.next = 16;
                return _this7.getPlayerData();
              case 16:
                _context8.next = 18;
                return _this7.getInjuryData();
              case 18:
                // 所有数据加载完成后，强制刷新区块位置
                _this7.$nextTick(function () {
                  _this7.getSectionTop();
                });
              case 19:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8);
      }))();
    },
    // 1. 头部信息
    getHeadData: function getHeadData(param) {
      var _this8 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee9() {
        var res, data;
        return _regenerator.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.prev = 0;
                _context9.next = 3;
                return (0, _demo.purchasingFootballInfo)({
                  matchId: _this8.matchId,
                  dataType: param
                });
              case 3:
                res = _context9.sent;
                data = res.data || {};
                _this8.headerInfo = _objectSpread(_objectSpread({}, _this8.headerInfo), data);
                _context9.next = 10;
                break;
              case 8:
                _context9.prev = 8;
                _context9.t0 = _context9["catch"](0);
              case 10:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, null, [[0, 8]]);
      }))();
    },
    // 2. 特征分析
    getFeatureData: function getFeatureData() {
      var _this9 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee10() {
        var res;
        return _regenerator.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.prev = 0;
                _context10.next = 3;
                return (0, _demo.purchasingFootballInfo)({
                  matchId: _this9.matchId,
                  dataType: "feature"
                });
              case 3:
                res = _context10.sent;
                _this9.featureData = res.data || {};
                _context10.next = 9;
                break;
              case 7:
                _context10.prev = 7;
                _context10.t0 = _context10["catch"](0);
              case 9:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, null, [[0, 7]]);
      }))();
    },
    // 3. 历史交锋 全部赛制+不区分主客场
    getHistoryAllAll: function getHistoryAllAll() {
      var _this10 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee11() {
        var res;
        return _regenerator.default.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _context11.prev = 0;
                _context11.next = 3;
                return (0, _demo.purchasingFootballInfo)({
                  matchId: _this10.matchId,
                  dataType: "historyTournamentHomeAwayAllAll"
                });
              case 3:
                res = _context11.sent;
                _this10.historyData = res.data || {};
                _context11.next = 9;
                break;
              case 7:
                _context11.prev = 7;
                _context11.t0 = _context11["catch"](0);
              case 9:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, null, [[0, 7]]);
      }))();
    },
    // 4. 历史交锋 全部赛制+相同主客场
    getHistoryAllSame: function getHistoryAllSame() {
      var _this11 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee12() {
        var res;
        return _regenerator.default.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                _context12.prev = 0;
                _context12.next = 3;
                return (0, _demo.purchasingFootballInfo)({
                  matchId: _this11.matchId,
                  dataType: "historyTournamentHomeAwayAllSame"
                });
              case 3:
                res = _context12.sent;
                _this11.historyData = res.data || {};
                _context12.next = 9;
                break;
              case 7:
                _context12.prev = 7;
                _context12.t0 = _context12["catch"](0);
              case 9:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, null, [[0, 7]]);
      }))();
    },
    // 5. 历史交锋 同赛制+不区分主客场
    getHistorySameAll: function getHistorySameAll() {
      var _this12 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee13() {
        var res;
        return _regenerator.default.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                _context13.prev = 0;
                _context13.next = 3;
                return (0, _demo.purchasingFootballInfo)({
                  matchId: _this12.matchId,
                  dataType: "historyTournamentHomeAwaySameAll"
                });
              case 3:
                res = _context13.sent;
                _this12.historyData = res.data || {};
                _context13.next = 9;
                break;
              case 7:
                _context13.prev = 7;
                _context13.t0 = _context13["catch"](0);
              case 9:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, null, [[0, 7]]);
      }))();
    },
    // 6. 历史交锋 同赛制+相同主客场
    getHistorySameSame: function getHistorySameSame() {
      var _this13 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee14() {
        var res;
        return _regenerator.default.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                _context14.prev = 0;
                _context14.next = 3;
                return (0, _demo.purchasingFootballInfo)({
                  matchId: _this13.matchId,
                  dataType: "historyTournamentHomeAwaySameSame"
                });
              case 3:
                res = _context14.sent;
                _this13.historyData = res.data || {};
                _context14.next = 9;
                break;
              case 7:
                _context14.prev = 7;
                _context14.t0 = _context14["catch"](0);
              case 9:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, null, [[0, 7]]);
      }))();
    },
    // 7. 比赛近况 全部赛制+不区分主客场
    getResultAllAll: function getResultAllAll() {
      var _this14 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee15() {
        var res;
        return _regenerator.default.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                _context15.prev = 0;
                _context15.next = 3;
                return (0, _demo.purchasingFootballInfo)({
                  matchId: _this14.matchId,
                  dataType: "resultTournamentHomeAwayAllAll"
                });
              case 3:
                res = _context15.sent;
                _this14.recentData = res.data || {};
                _context15.next = 9;
                break;
              case 7:
                _context15.prev = 7;
                _context15.t0 = _context15["catch"](0);
              case 9:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, null, [[0, 7]]);
      }))();
    },
    // 8. 比赛近况 全部赛制+相同主客场
    getResultAllSame: function getResultAllSame() {
      var _this15 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee16() {
        var res;
        return _regenerator.default.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                _context16.prev = 0;
                _context16.next = 3;
                return (0, _demo.purchasingFootballInfo)({
                  matchId: _this15.matchId,
                  dataType: "resultTournamentHomeAwayAllSame"
                });
              case 3:
                res = _context16.sent;
                _this15.recentData = res.data || {};
                _context16.next = 9;
                break;
              case 7:
                _context16.prev = 7;
                _context16.t0 = _context16["catch"](0);
              case 9:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, null, [[0, 7]]);
      }))();
    },
    // 9. 比赛近况 同赛制+不区分主客场
    getResultSameAll: function getResultSameAll() {
      var _this16 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee17() {
        var res;
        return _regenerator.default.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                _context17.prev = 0;
                _context17.next = 3;
                return (0, _demo.purchasingFootballInfo)({
                  matchId: _this16.matchId,
                  dataType: "resultTournamentHomeAwaySameAll"
                });
              case 3:
                res = _context17.sent;
                _this16.recentData = res.data || {};
                _context17.next = 9;
                break;
              case 7:
                _context17.prev = 7;
                _context17.t0 = _context17["catch"](0);
              case 9:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, null, [[0, 7]]);
      }))();
    },
    // 10. 比赛近况 同赛制+相同主客场
    getResultSameSame: function getResultSameSame() {
      var _this17 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee18() {
        var res;
        return _regenerator.default.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                _context18.prev = 0;
                _context18.next = 3;
                return (0, _demo.purchasingFootballInfo)({
                  matchId: _this17.matchId,
                  dataType: "resultTournamentHomeAwaySameSame"
                });
              case 3:
                res = _context18.sent;
                _this17.recentData = res.data || {};
                _context18.next = 9;
                break;
              case 7:
                _context18.prev = 7;
                _context18.t0 = _context18["catch"](0);
              case 9:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee18, null, [[0, 7]]);
      }))();
    },
    // 11. 积分榜
    getTablesData: function getTablesData() {
      var _this18 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee19() {
        var res;
        return _regenerator.default.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                _context19.prev = 0;
                _context19.next = 3;
                return (0, _demo.purchasingFootballInfo)({
                  matchId: _this18.matchId,
                  dataType: "tables"
                });
              case 3:
                res = _context19.sent;
                _this18.tablesData = res.data || {};
                _context19.next = 9;
                break;
              case 7:
                _context19.prev = 7;
                _context19.t0 = _context19["catch"](0);
              case 9:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee19, null, [[0, 7]]);
      }))();
    },
    // 12. 未来赛事
    getFutureData: function getFutureData() {
      var _this19 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee20() {
        var res;
        return _regenerator.default.wrap(function _callee20$(_context20) {
          while (1) {
            switch (_context20.prev = _context20.next) {
              case 0:
                _context20.prev = 0;
                _context20.next = 3;
                return (0, _demo.purchasingFootballInfo)({
                  matchId: _this19.matchId,
                  dataType: "future"
                });
              case 3:
                res = _context20.sent;
                _this19.futureData = res.data || {};
                _context20.next = 9;
                break;
              case 7:
                _context20.prev = 7;
                _context20.t0 = _context20["catch"](0);
              case 9:
              case "end":
                return _context20.stop();
            }
          }
        }, _callee20, null, [[0, 7]]);
      }))();
    },
    // 13. 射手信息
    getPlayerData: function getPlayerData() {
      var _this20 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee21() {
        var res;
        return _regenerator.default.wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                _context21.prev = 0;
                _context21.next = 3;
                return (0, _demo.purchasingFootballInfo)({
                  matchId: _this20.matchId,
                  dataType: "player"
                });
              case 3:
                res = _context21.sent;
                _this20.shooterData = res.data || {};
                _context21.next = 9;
                break;
              case 7:
                _context21.prev = 7;
                _context21.t0 = _context21["catch"](0);
              case 9:
              case "end":
                return _context21.stop();
            }
          }
        }, _callee21, null, [[0, 7]]);
      }))();
    },
    // 14. 伤病一览
    getInjuryData: function getInjuryData() {
      var _this21 = this;
      return (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee22() {
        var res;
        return _regenerator.default.wrap(function _callee22$(_context22) {
          while (1) {
            switch (_context22.prev = _context22.next) {
              case 0:
                _context22.prev = 0;
                _context22.next = 3;
                return (0, _demo.purchasingFootballInfo)({
                  matchId: _this21.matchId,
                  dataType: "injurySuspension"
                });
              case 3:
                res = _context22.sent;
                _this21.injuryData = res.data || {};
                _context22.next = 9;
                break;
              case 7:
                _context22.prev = 7;
                _context22.t0 = _context22["catch"](0);
              case 9:
              case "end":
                return _context22.stop();
            }
          }
        }, _callee22, null, [[0, 7]]);
      }))();
    },
    // 重新获取所有区块高度（关键修复）
    getSectionTop: function getSectionTop() {
      var _this22 = this;
      this.sectionTopList = [];
      var query = uni.createSelectorQuery().in(this);
      this.tabList.forEach(function (item) {
        query.select("#".concat(item.id)).boundingClientRect();
      });
      query.exec(function (res) {
        res.forEach(function (item, index) {
          if (item) {
            // 修正偏移量，避开顶部的Tab栏和头部内容
            _this22.sectionTopList.push({
              id: _this22.tabList[index].id,
              top: item.top - 350
            });
          }
        });
      });
    },
    // Tab 切换（关键修复）
    switchTab: function switchTab(index) {
      var _this23 = this;
      this.activeTab = index;
      var targetId = this.tabList[index].id;
      // 强制刷新scroll-view
      this.currentSection = "";
      this.$nextTick(function () {
        _this23.currentSection = targetId;
      });
    },
    // 滚动同步Tab（关键修复）
    handleScroll: function handleScroll(e) {
      var scrollTop = e.detail.scrollTop;
      var currentIndex = 0;

      // 从后往前遍历，优先匹配后面的区块
      for (var i = this.sectionTopList.length - 1; i >= 0; i--) {
        if (scrollTop >= this.sectionTopList[i].top) {
          currentIndex = i;
          break;
        }
      }
      if (this.activeTab !== currentIndex) {
        this.activeTab = currentIndex;
      }
    }
  }
};
exports.default = _default;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./node_modules/@dcloudio/uni-mp-weixin/dist/index.js */ 2)["default"]))

/***/ }),

/***/ 297:
/*!*******************************************************************************************************************************************************!*\
  !*** C:/Users/zxg00/Documents/HBuilderProjects/football-cup/pages/test/footballPredict.vue?vue&type=style&index=0&id=7a726da8&scoped=true&lang=scss& ***!
  \*******************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_footballPredict_vue_vue_type_style_index_0_id_7a726da8_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/css-loader/dist/cjs.js??ref--8-oneOf-1-1!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-2!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/postcss-loader/src??ref--8-oneOf-1-3!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/sass-loader/dist/cjs.js??ref--8-oneOf-1-4!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-5!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!../../../../../Desktop/HBuilderX/plugins/uniapp-cli/node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!./footballPredict.vue?vue&type=style&index=0&id=7a726da8&scoped=true&lang=scss& */ 298);
/* harmony import */ var _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_footballPredict_vue_vue_type_style_index_0_id_7a726da8_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_footballPredict_vue_vue_type_style_index_0_id_7a726da8_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_footballPredict_vue_vue_type_style_index_0_id_7a726da8_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _Desktop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_footballPredict_vue_vue_type_style_index_0_id_7a726da8_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0__[key]; }) }(__WEBPACK_IMPORT_KEY__));
 /* harmony default export */ __webpack_exports__["default"] = (_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_mini_css_extract_plugin_dist_loader_js_ref_8_oneOf_1_0_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_loaders_stylePostLoader_js_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_2_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_postcss_loader_src_index_js_ref_8_oneOf_1_3_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_sass_loader_dist_cjs_js_ref_8_oneOf_1_4_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_webpack_preprocess_loader_index_js_ref_8_oneOf_1_5_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_vue_cli_plugin_uni_packages_vue_loader_lib_index_js_vue_loader_options_Desktop_HBuilderX_plugins_uniapp_cli_node_modules_dcloudio_webpack_uni_mp_loader_lib_style_js_footballPredict_vue_vue_type_style_index_0_id_7a726da8_scoped_true_lang_scss___WEBPACK_IMPORTED_MODULE_0___default.a); 

/***/ }),

/***/ 298:
/*!***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/mini-css-extract-plugin/dist/loader.js??ref--8-oneOf-1-0!./node_modules/css-loader/dist/cjs.js??ref--8-oneOf-1-1!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-2!./node_modules/postcss-loader/src??ref--8-oneOf-1-3!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/sass-loader/dist/cjs.js??ref--8-oneOf-1-4!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/webpack-preprocess-loader??ref--8-oneOf-1-5!./node_modules/@dcloudio/vue-cli-plugin-uni/packages/vue-loader/lib??vue-loader-options!./node_modules/@dcloudio/webpack-uni-mp-loader/lib/style.js!C:/Users/zxg00/Documents/HBuilderProjects/football-cup/pages/test/footballPredict.vue?vue&type=style&index=0&id=7a726da8&scoped=true&lang=scss& ***!
  \***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin
    if(false) { var cssReload; }
  

/***/ })

},[[291,"common/runtime","common/vendor"]]]);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/test/footballPredict.js.map