import wxCookie from "../wx.cookie.js";
import * as util from "../util.js";
import * as loginUtil from "../loginUtils";
import * as template from "../onLaunch.js";
import getUnplUnion from "../../pages/proxy/getUnplUnion.js";

/**
 * app.js中的主流程公共方法
 * @author shenpeng
 */
/**
 * app.js onLaunch中调用的主流程公共方法
 *
 * @param {object} options - onLaunch中的options参数
 * @param {object} that - app.js中的this
 */
function appLaunch(options, that) {
  // 赋值systemInfo
  wx.getSystemInfo({
    success: res => {
      that.globalData.systemInfo = res;
    }
  });

  // 参数中没有customerinfo时清除缓存中的customerinfo
  if (!options.query || !options.query.customerinfo) {
    wx.removeStorageSync("customerinfo");
  }
  //非广告初次进入 清除广告标识缓存
  if (!options.query || !options.query.platform) {
    wx.removeStorageSync("ad");
  }
  //非sharematrix 进入
  if (!options.type) {
    wx.removeStorageSync("sharematrixType");
  }
  // 微信购物单进入
  if (options.query && options.query.wxShoppingListScene) {
    wx.setStorageSync("fromWxOrderList", options.query.wxShoppingListScene);
  } else {
    wx.removeStorageSync("fromWxOrderList");
  }
  // 如果是通过小程序码进入小程序的场景值,把场景值保存
  if (
    options.scene &&
    (options.scene == 1047 || options.scene == 1048 || options.scene == 1049) &&
    options.query.scene
  ) {
    var queryScene = decodeURIComponent(options.query.scene);
    if (
      queryScene.substring(0, 9) == "shortsign" ||
      queryScene.split("&")[4] == "kepler_qrcode_1"
    ) {
      that.globalData.scene = options.scene;
    }
  }
  // 如果是好物街,把appid设置成venderid
  // if (wx.getStorageSync("appid") == "wx1edf489cb248852c") {
  //   wx.setStorageSync("venderId", "wx1edf489cb248852c");
  // }
  //initialize global cookie object
  that.globalData.wxCookie = wxCookie;
  if (
    that.globalData &&
    that.globalData.globalPluginPay != null &&
    that.globalData.globalPluginPay != undefined
  ) {
    wx.setStorageSync("globalPluginPay", that.globalData.globalPluginPay);
  }
  that.globalData.buyingPayLimit = {};
}

/**
 * app.js onShow中调用的主流程公共方法
 *
 * @param {object} options - onShow中的options参数
 * @param {object} that - app.js中的this
 */
function appShowCommon(options, that) {
  // const log = require("../keplerReport.js");
  // 判断是否支持button中open-type=getUserInfo的情况
  if (!wx.canIUse("button.open-type.getUserInfo")) {
    wx.showModal({
      title: "提示",
      content: "亲，好久不见~请您下载微信最新版本,只有最新版本支持买买买~",
      showCancel: false
    });
  }
  if (
    that.globalWxclient == "" &&
    !(
      that.globalData &&
      that.globalData.appid &&
      that.globalData.wxversion &&
      that.globalData.kxcxtype &&
      that.globalData.source
    )
  ) {
    wx.showModal({
      title: "提示",
      content:
        "请确认app.js文件中globalData内的下述字段传值是否正确：appid、wxversion、kxcxtype、source",
      showCancel: false,
      confirmText: "我知道了"
    });
  }
  if (
    that.globalWxclient == "tempwx" &&
    !(that.globalData && that.globalData.kxcxtype && that.globalData.source)
  ) {
    wx.showModal({
      title: "提示",
      content:
        "请确认app.js文件中globalData内的下述字段传值是否正确：kxcxtype、source",
      showCancel: false,
      confirmText: "我知道了"
    });
  }

  // 大数据收集场景值, 屏蔽联盟小程序
  if (options && options.scene) {
    // log.setScene(options.scene);
    wx.setStorageSync("scene", options.scene);
    that.globalData.scene = options.scene;
    wx.removeStorageSync("sceneErr");
  } else {
    // 如果没有options或者场景值,需要在缓存里保存一个特殊字段sceneErr,保存是options为空或者是场景值为空
    if (!options) {
      wx.setStorageSync("sceneErr", "optionsEmpty");
    } else if (!options.scene) {
      wx.setStorageSync("sceneErr", "sceneEmpty");
    }
  }
  // 消息推送
  if (that && that.globalConfig && that.globalConfig.isMessagePush) {
    // let messagePush = require("../message_push.js");
    // let log = require("../keplerReport.js");
    // wx.removeStorageSync('oi_key');

    let clearOpenId = wx.getStorageSync("oP_key")
      ? wx.getStorageSync("oP_key")
      : "";

    if (that.globalWxclient == "tempwx") {
      if (!clearOpenId) {
        // messagePush.getCleanOpenId(that).then(function (data) {
        //   //将openId缓存起来，上报给大数据
        //   if (data && data.openId) {
        //     wx.setStorageSync("oP_key", data.openId);
        //   }
        // });
      }

      //模板小程序获取openId上报openid给后端
      //   messagePush.setCleanOpenId(that);
    } else {
      if (!clearOpenId) {
        wx.removeStorageSync("oP_key");
        // messagePush.getCleanOpenId(that).then(function (data) {
        //   //将openId缓存起来，上报给大数据
        //   if (data && data.openId) {
        //     wx.setStorageSync("oP_key", data.openId);
        //   }
        // });
      }
    }
  }

  //   log.setAppData({
  //     abtest: 1
  //   }); //A\B test
  wx.setStorageSync("wxappStorageName", that.globalData.wxappStorageName);
  util.getPhoneModel(that);
  // 每次进入小程序，清掉商祥页好物圈入口缓存，减少接口请求压力
  wx.removeStorageSync("item_shareWxShopList");
}

/**
 * app.js 个性化小程序在onShow中调用的主流程公共方法
 *
 * @param {object} options - onShow中的options参数
 * @param {object} that - app.js中的this
 */
function appShow(options, that) {
  appShowCommon(options, that);
  let initQuery = options.query || {};
  let subUnionId = initQuery.subUnionId ? initQuery.subUnionId : ""; //子联盟id，可用于返利类客户储存其用户标识，用以为用户返利
  let skuVal = initQuery.wareId ? initQuery.wareId : "";
  //页面传参的unionId优先级更高
  if (initQuery.unionId) {
    wx.setStorageSync(that.globalData.wxappStorageName, {
      unionid: initQuery.unionId,
      wxversion: that.globalData.wxversion
    });
  } else {
    wx.setStorageSync(that.globalData.wxappStorageName, {
      unionid: that.globalData.unionid,
      wxversion: that.globalData.wxversion
    });
  }
  // 联盟接口下掉，前端代码注释掉，过段时间没问题再删掉代码  ----   20190617
  // if (wx.getStorageSync(that.globalData.wxappStorageName).unionid && !that.globalData.isFans) {
  //   const mFollow = require('../MFollow.js');
  //   //调用分佣方法
  //   mFollow.generateClickLog({
  //     'unionId': wx.getStorageSync(that.globalData.wxappStorageName).unionid,
  //     'url': `${that.globalRequestUrl}/${options.path}`,
  //     'sku': skuVal,
  //     'that': that,
  //     'subUnionId': subUnionId
  //   });
  // }
  getUnpl(options, that);
  if (initQuery.customerinfo) {
    //渠道来源
    wx.setStorageSync("customerinfo", initQuery.customerinfo);
  }
  wx.setStorageSync("appid", that.globalData.appid);
  let sceneCode = options.scene || ""; //场景值,记录用户是否是扫码进入，商详页通过分享卡片进入会显示一个回到首页icon
  wx.setStorageSync("sceneCode", sceneCode);
}

/**
 * app.js 模板小程序在onShow中调用的主流程公共方法
 *
 * @param {object} options - onShow中的options参数
 * @param {object} that - app.js中的this
 * @param {boolean} isIndependentPackages 判断是否是独立分包
 *
 */
function appTemplateShow(options, that, isIndependentPackages) {
  // if (
  //   options &&
  //   options.referrerInfo &&
  //   options.referrerInfo.extraData &&
  //   options.referrerInfo.extraData.loginToken
  // ) {
  // 因为loginUtil下没有tokenExchangeLoginStatus这个方法，所以这里注释掉
  //   loginUtil.tokenExchangeLoginStatus &&
  //     loginUtil.tokenExchangeLoginStatus(
  //       options.referrerInfo.extraData.loginToken
  //     );
  // }
  appShowCommon(options, that);
  let initQuery = options.query || {};
  let subUnionId = initQuery.subUnionId ? initQuery.subUnionId : ""; //子联盟id，可用于返利类客户储存其用户标识，用以为用户返利
  let skuVal = initQuery.wareId ? initQuery.wareId : "";
  let extConfig = template.getExtConfig(); //获取第三方平台自定义的数据字段
  let sceneCode = options.scene || ""; //场景值,记录用户是否是扫码进入，商详页通过分享卡片进入会显示一个回到首页icon
  wx.setStorageSync("sceneCode", sceneCode);
  template.setStorageAll(initQuery, extConfig, that); //将自定义数据写入缓存

  getUnpl(options, that, isIndependentPackages);
  if (initQuery.pin) {
    template.getSellerInfo(initQuery, extConfig, that); //获取导购员id
  }

  //解析用户是否是从微信购物单过来
  //10001 微信购物单-想买列表
  //10002 微信购物单-好友推荐列表
  //10003 微信购物单-订单列表
  //20001 微信搜索-好友推荐模块
  let wxSceneCodeNumber = [10001, 10002, 10003, 20001];
  if (wxSceneCodeNumber.indexOf(sceneCode) > -1) {
  }

  //解析从另一个小程序或公众号或App打开时传过来的数据
  if (options.referrerInfo) {
    if (options.referrerInfo.extraData) {
      if (options.referrerInfo.extraData.customerinfo) {
        //渠道来源
        wx.setStorageSync(
          "customerinfo",
          options.referrerInfo.extraData.customerinfo
        );
      }
      if (options.referrerInfo.extraData.unpl) {
        //分佣跟单标识
        wx.setStorageSync("unpl", options.referrerInfo.extraData.unpl);
      }
    }
  }
}

/**
 * 通过spreadUrl，获取unpl,
 * 同之前generateClickLog获取unpl的方法平级，谁后返回unpl，以谁为主
 * fans小程序中，fans跟单分佣逻辑，高于新导购(短连接参数形式)跟单分佣逻辑，高于老导购跟单分佣逻辑（沈鹏的去推广链接伪造点击日志）
 *
 * @param {object} that - app.js中的this
 * @param {object} options - onShow中的options参数
 * @param {boolean} isIndependentPackages 判断是否是独立分包
 */
function getUnpl(options, that, isIndependentPackages) {
  let initQuery = options.query || {};
  let unionId =
    that && wx.getStorageSync(that.globalData.wxappStorageName).unionid;
  //导购和kol并存时，kol优先级高
  if (
    initQuery.spreadUrl &&
    that &&
    !that.globalData.isFans &&
    !isIndependentPackages
  ) {
    getUnplBySpreadUrl(initQuery.spreadUrl, initQuery.appId, unionId, 0);
  }
}
/****
 * 根据短连接获取unpl
 * @param spreadUrl 短连接
 * @param appId 来源公众号的appid(跳往小程序前的appid)，有则必传
 * @param unionId
 * @param times 请求次数，0或1，最多再来一次
 */
function getUnplBySpreadUrl(spreadUrl, appId, unionId, times) {
  //拿到spreadUrl，去请求unpl
  getUnplUnion.getUnplUnion({
    url: spreadUrl,
    jda: wx.getStorageSync("__jda") || "", //jda,必传
    pin: wx.getStorageSync("jdlogin_pt_pin") || "", //用户pin，有则必传
    wxUnionId: unionId || "", //unionid,必传
    openId: wx.getStorageSync("openId") || "", //用户OpenID ,非必传
    sourceAppid: appId || "", //来源公众号的appid(跳往小程序前的appid)，有则必传
    source: "2",
    token: "VXNRiNm6X0YzlUeFZ3peBg--",
    successCb: function (res) {
      if ((!res || (res && res.data && res.data.code == "3")) && !times) {
        getUnplBySpreadUrl(spreadUrl, appId, unionId, 1);
      }
    },
    failCb: function () {
      if (!times) {
        getUnplBySpreadUrl(spreadUrl, appId, unionId, 1);
      }
    }
  });
}
export {
  appLaunch,
  appShow,
  appTemplateShow
};
