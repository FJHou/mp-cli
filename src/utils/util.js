// var Promise = require("../libs/promise.js");
var CryptoJS = require("../libs/crypto-js.js");
import { getCustomerinfo } from './individualMark.js';
import getLocation from './getLocation'
import getImgUrl from './getImgUrl'
import {formatDistance} from './formatDistance'
import kGetCleanOpenid from './getOpenid'
import {
  getPtKey,
  getPtPin,
  Fgloballogout,
  globalLoginShow,
  getJumpPageType
} from "./loginUtils.js";
import {API} from "../api/config";
import Mmd5 from "../libs/Mmd5.js"
// 保存地址时对手机号加密
export { default as jsencryptCode } from './jsencrypt'
// import kGetCleanOpenid from "./getOpenid";
import * as  fingerPrint from "./fingerPrint.js";
import queryString from "query-string"



// 发布订阅
import Emitter from "./emitter.js";
import { wxError, wxInfo, wxWarn } from './JDH-pharmacy/wxlog.js';
var emitter = new Emitter();

function formatTime(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();
  return (
    [year, month, day].map(formatNumber).join("/") +
    " " + [hour, minute, second].map(formatNumber).join(":")
  );
}

function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : "0" + n;
}
function dateFormat(fmt, date) {
  let ret;
  const opt = {
    "Y+": date.getFullYear().toString(),        // 年
    "m+": (date.getMonth() + 1).toString(),     // 月
    "d+": date.getDate().toString(),            // 日
    "H+": date.getHours().toString(),           // 时
    "M+": date.getMinutes().toString(),         // 分
    "S+": date.getSeconds().toString()          // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
    };
  };
  return fmt;
}

/**
 * 将对象转换为数组
 *
 * @param {object} obj - 目标对象
 * @returns 转换后的数组
 */
function transfer2Array(obj) {
  var arrKey = [];
  var arrValue = [];
  for (var k in obj) {
    arrKey.push(k);
    arrValue.push(obj[k]);
  }
  return {
    arrKey: arrKey,
    arrValue: arrValue
  };
}
const SHOULD_LOGIN_WHITE_LIST = ['jdhunion_cps_queryHeadUserInfo']

/**
 * 针对wx.request方法的二次封装
 *
 * @param {object} parameter - 参数
 */
function request(parameter) {
  const {query} = queryString.parseUrl(parameter.url)
  //请求url为必填项
  if (!parameter || parameter == {} || !parameter.url) {
    console.log("Data request can not be executed without URL.");
    return false;
  } else {
    var murl = parameter.url;
    var timestamp = new Date().getTime();
    if (murl.indexOf("?") > 0) {
      murl = murl + "&fromType=wxapp&timestamp=" + timestamp;
    } else {
      murl = murl + "?fromType=wxapp&timestamp=" + timestamp;
    }
    // 判断是否为预售  如果为预售 请求需要统一加 isPresale = true 字段
    var presale = wx.getStorageSync("presale");
    if (presale == "1") {
      murl = murl + "&isPresale=true"; 11
    }
    var headerCookie = getCookies(); //通用的cookie
    //判断是否有单独场景的cookie上报
    var selfCookie = parameter.selfCookie;
    selfCookie && (headerCookie += selfCookie);
    parameter.data = jsonSerialize(parameter.data);

    wx.request({
      url: murl,
      data: parameter.data || {},
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: headerCookie
      },
      method: parameter.method || "POST",
      success: function (res) {
        // TODO：暂时这样处理 下期优化
        if (res.data.code === "1006" && !SHOULD_LOGIN_WHITE_LIST.includes(query.functionId)) {
          wx.setStorageSync("jdlogin_pt_key", '')
          wx.setStorageSync("jdlogin_pt_pin", '')
          Fgloballogout({
            data: {}
          })
          return 
        }
        if (res.data.errMsg === "用户未登录" || res.data.errCode === "0005") {
          Fgloballogout({
            data: {}
          })
          return;
        }
        //写埋点用的加密pin
        if (res.data && res.data.desPin) {
          wx.setStorageSync("desPin", res.data.desPin);
        }
        //缓存sid和userFlagCheck
        if (res.data && res.data.sid && res.data.userFlagCheck) {
          wx.setStorageSync("sid", res.data.sid);
          wx.setStorageSync("USER_FLAG_CHECK", res.data.userFlagCheck);
        } else if (
          res.data &&
          res.data.cookie &&
          res.data.cookie.sid &&
          res.data.cookie.userFlagCheck
        ) {
          //added by meiling.lu 2018.2.22 兼容新接口的cookie获取结构
          wx.setStorageSync("sid", res.data.cookie.sid);
          wx.setStorageSync("USER_FLAG_CHECK", res.data.cookie.userFlagCheck);
        }

        if (res.data && res.data.ulf_ad) {
          wx.setStorageSync("ulf_ad", res.data.ulf_ad);
        }
        parameter.success && parameter.success(res.data);
        // 接口请求日志
        if (res.data.success) {
          wxInfo(`接口日志 url: ${murl} `)
        } else {
          wxWarn(`接口日志 url: ${murl} code:${res.data.code} msg:${res.data.msg}`)
        }
      },
      fail: function (e) {
        parameter.fail && parameter.fail(e);
        wxError(`接口日志 url: ${murl} msg:${e.errMsg}`)
        wx.showToast({
          title: "网络信号较差",
          icon: "loading",
          duration: 3000
        });
      },
      complete: function () {
        parameter.complete && parameter.complete();
      }
    });
  }
}
/**
 * promise封装的request方法
 *
 * @param {object} params - 参数
 * @returns promise object
 */
function promiseRequest(params) {
  return new Promise(function (resolve, reject) {
    request({
      url: params.url,
      data: params.data,
      method: params.method,
      success: resolve,
      fail: reject,
      complete: reject
    });
  });
}

function jsonSerialize(json) {
  var str = "";
  for (var key in json) {
    str += key + "=" + encodeURIComponent(json[key]) + "&";
  }
  return str.substring(0, str.length - 1);
}

/**
 * report crash log
 *
 * @param {String} errorMsg - exception msg
 */
function reportErr(errorMsg, dim4, dim5) {
  let app = getApp({
    allowDefault: true
  });
  //获取当前页面
  var arrpageShed = getCurrentPages(),
    strCurrentPage = arrpageShed[arrpageShed.length - 1].__route__;
  var url = app.globalRequestUrl + "/aspp/log/upload.do?data=";
  var errJson = {},
    systemInfoObj = {},
    errString = "";
  var systemInfo = wx.getSystemInfoSync();
  if (systemInfoObj) {
    systemInfoObj = {
      brand: systemInfo.brand,
      model: systemInfo.model,
      version: systemInfo.version,
      system: systemInfo.system,
      SDKVersion: systemInfo.SDKVersion
    };
  }
  if (errorMsg) {
    errJson.product = "wxminiprogram";
    errJson.logtime = new Date();
    errJson.ua = JSON.stringify(systemInfoObj);
    errJson.dim1 = errorMsg;
    errJson.dim2 = strCurrentPage;
    errJson.dim3 = wx.getStorageSync("appid");
    errJson.dim4 = dim4;
    errJson.dim5 = dim5;
    errString = JSON.stringify(errJson);
    url += errString;
    wx.request({
      url: url
    });
  }
}

/**
 * 整合cookies
 *
 * @returns 返回cookies
 */
function getCookies() {
  let app = getApp({
    allowDefault: true
  });
  var value = "";
  try {
    var sid = wx.getStorageSync("sid");
    var USER_FLAG_CHECK = wx.getStorageSync("USER_FLAG_CHECK");
    var ulf_ad = wx.getStorageSync("ulf_ad");
    //sid和USER_FLAG_CHECK是主流程后端用来校验身份信息的字段
    if (sid && USER_FLAG_CHECK) {
      value = "sid=" + sid + ";USER_FLAG_CHECK=" + USER_FLAG_CHECK + ";";
    }
    //通用下单接口返回的校验身份的字段
    if (ulf_ad) {
      value = value + "ulf_ad=" + ulf_ad + ";";
    }
    //京东登录用来校验的身份的字段
    var pt_key = getPtKey();
    if (pt_key) {
      value = value + "pt_key=" + pt_key + ";";
    }
    var pt_pin = getPtPin();
    if (pt_pin) {
      value = value + "pt_pin=" + encodeURIComponent(pt_pin) + ";";
    }
    //分佣标识
    var unpl = wx.getStorageSync("unpl");
    if (unpl) {
      value = value + "unpl=" + unpl + ";";
    }
    var globalWxappStorageName = wx.getStorageSync("wxappStorageName");
    var appSign = wx.getStorageSync(globalWxappStorageName);
    //跟单
    if (appSign && appSign.wxversion) {
      value = value + "appkey=" + appSign.wxversion + ";";
    }
    //渠道来源
    var oCustomerinfo = getCustomerinfo();
    if (oCustomerinfo) {
      value = value + `kepler-customerInfo=${oCustomerinfo};`;
    }
    if (app && app.globalConfig && app.globalConfig.isTriTemplate) {
      //统计来源
      var oExtuserid = wx.getStorageSync("sceneCode");
      if (oExtuserid) {
        value = value + `extuserid=${oExtuserid};`;
      }
    }

    // appId
    let appId = wx.getStorageSync("appid");
    if (appId) {
      // 因为appid这个关键词太多容易混淆。后台为了区分业务参数加入了jdhUnionWxAppId来标注小程序的appid。
      value = value + `appid=${appId};jdhUnionWxAppId=${appId};`;
    }

    // 渠道化id
    let mpChannelId = wx.getStorageSync("mpChannelId");
    if (mpChannelId) {
      value = value + `mpChannelId=${mpChannelId};`;
    }

    // appType
    let appType = wx.getStorageSync("appType");
    if (appType) {
      value = value + `appType=${appType};`;
    }
    // sharematrix系统推广进入（内部系统跟单使用）
    let sharematrixType = wx.getStorageSync("sharematrixType") ?
      wx.getStorageSync("sharematrixType") :
      "";
    if (sharematrixType) {
      value = value + `sharematrix=${sharematrixType};`;
    }

    // wxclient是否为模版小程序
    let wxclient = app ?
      app.globalWxclient :
      getApp({
        allowDefault: true
      }).globalWxclient;
    let openid = wx.getStorageSync("oP_key") ? wx.getStorageSync("oP_key") : "";
    if (wxclient == "tempwx") {
      value = value + "openid=" + openid + ";" + "wxclient=tempwx;";
    } else {
      value = value + `wxclient=gxhwx;openid=${openid};`;
    }

    // openIdkey（消息推送使用）
    // let oikey = wx.getStorageSync('oi_key');
    // if (oikey) {
    //   value = value + `oikey=${oikey};`
    // }
    //全站地址
    let sitesAddress = wx.getStorageSync("sitesAddress");
    if (sitesAddress && sitesAddress.regionIdStr) {
      value = value + `regionAddress=${sitesAddress.regionIdStr};`;
    }
    if (sitesAddress && sitesAddress.addressId) {
      value = value + `commonAddress=${sitesAddress.addressId};`;
    }
    //用户收货信息加密
    value += "ie_ai=1;";
  } catch (e) {
    console.log(e);
  }
  return value;
}

/**
 * 退出登录
 *
 * @param {object} obj - 页面page this
 */
function globallogout(obj) {
  Fgloballogout(obj, request);
}

/**
 * 登录成功的回调函数
 */
// function loginSuccessCb() {
//   let app = getApp({
//     allowDefault: true
//   });
//   if (app.globalConfig && app.globalConfig.needBindUserRel) {
//     var bindUrFn = require("bindUserRel.js");
//     bindUrFn.bindUserRel();
//   }
// }

// function umpMonitor(type) {
//   if (!type) {
//     return;
//   }
//   var appid = wx.getStorageSync("appid");
//   if (!appid) {
//     return;
//   }
//   let app = getApp({
//     allowDefault: true
//   });
//   wx.request({
//     url: app.globalRequestUrl + "/kact/act/udo?appid=" + appid + "&type=" + type,
//     data: {},
//     header: {
//       "content-type": "application/json" // 默认值
//     },
//     method: "GET",
//     success: function (res) {
//       console.log("ump 监控埋点");
//     }
//   });
// }

function pageMonitor(data) {
  if (!data || !data.key) {
    return;
  }
  var appid = wx.getStorageSync("appid");
  if (!appid) {
    return;
  }
  var postData = data.data ? JSON.stringify(data.data) : "";
  var sign = Mmd5.hex_md5(appid + data.key + postData);
  let app = getApp({
    allowDefault: true
  });
  wx.request({
    url: app.globalRequestUrl + "/kwxhome/myMonitor/monitor.json",
    data: {
      wxAppId: appid,
      umpKey: data.key,
      data: postData,
      sign: sign
    },
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: "POST",
    success: function (res) {
      console.log("页面 监控埋点");
    }
  });
}

/**
 * button触发获取用户信息后，存储用户信息
 *
 * @param {object} e - 事件参数
 */
function getUserInfo(e) {
  // console.log(e);
  if (
    e.detail.encryptedData &&
    e.detail.iv &&
    e.detail.errMsg == "getUserInfo:ok"
  ) {
    wx.setStorageSync("wxuserinfo", e.detail);
  } else {
    wx.removeStorageSync("wxuserinfo");
    console.log("用户拒绝授权");
  }
}

/**
 * 判断用户手机类型
 *
 * @param {*} that - this
 */
function getPhoneModel(that) {
  wx.getSystemInfo({
    success: res => {
      let modelmes = res.model;
      if (
        modelmes.search("iPhone X") != -1 ||
        modelmes.search("iPhone11") != -1
      ) {
        that.globalData.isIphoneX = true;
      }
    }
  });
}
/**
 * [isLogin 判断是否登录]
 * @return {Boolean} []
 */
// function isLogin() {
//   let app = getApp({
//     allowDefault: true
//   });
//   request({
//     url: app.globalRequestUrl + "/kwxitem/wxdetail/isLogin.json?fromType=wxapp",
//     success: function (data) {
//       if (data.code == "999") {
//         //未登录
//         return false;
//       } else {
//         return true;
//       }
//     },
//     fail: function (e) {
//       reportErr("item isLogin.json fail: " + e.errMsg);
//       return false;
//     }
//   });
// }
/**
 * 若cookies、shshshfp、shshshfpa、shshshfpb任意一个不存在 重新获取生成参数
 *
 */
function toGenerateFingerPrint() {
  try {
    let app = getApp({
      allowDefault: true
    });
    //获取软指纹三个参数
    let wxCookie = app.globalData.wxCookie;
    if (!wxCookie) {
      // wxCookie = require("./wx.cookie.js");
      app.globalData.wxCookie = wxCookie;
    }
    let shshshfp = wxCookie.getCookie("shshshfp"),
      shshshfpa = wxCookie.getCookie("shshshfpa"),
      shshshfpb = wxCookie.getCookie("shshshfpb");
    if (!shshshfp || !shshshfpa || !shshshfpb) {
      //initialize fingerprint（独立领券页和商祥页领券使用）生成软指纹参数
      let Jdwebm = fingerPrint.Jdwebm;
      Jdwebm && Jdwebm();
    }
  } catch (e) {
    console.log("fingerPrint error:", e);
  }
}

/**
 * @description 获取加密的ptkey
 * @author Meiling.lu
 * @date 2018-09-18
 */
function getSecretPtKey(cb) {
  //当前ptKey值
  let currentPtKey = getPtKey();
  // 如果为空 则不必加密 直接返回 无效字符'-'
  if (!currentPtKey) {
    cb && cb("", false);
    return;
  }
  let app = getApp({
    allowDefault: true
  });
  //initial_pt_key 用于存储/标识ptkey更新前的值
  let initailPtKey = wx.getStorageSync("initial_pt_key");
  //加密后的ptkey值
  let secretPtKey = wx.getStorageSync("secret_pt_key");
  let isNeedGetSecretPtKey = false;
  //首次或ptKey有更新时，需生成加密ptkey 并更新initial_pt_key值便于再次请求判断减少请求频次
  if (!initailPtKey || !secretPtKey || initailPtKey != currentPtKey) {
    isNeedGetSecretPtKey = true;
    //存储当前ptkey值
    wx.setStorageSync("initial_pt_key", currentPtKey);
  } else {
    cb && cb(secretPtKey, false);
    return;
  }

  if (isNeedGetSecretPtKey) {
    let _secretPtKey = null;
    request({
      url: app.globalRequestUrl + "/coupon/cipher/encrypt",
      data: {
        applicationId: "wxchatApplets",
        businessId: "001",
        type: "2",
        cipherToken: "C42D0DFCA7533AEE22E2D3AD072B8000"
      },
      success: function (res) {
        //code 返回0表示加解密成功
        if (res && res.code && res.code == "000") {
          wx.setStorageSync("secret_pt_key", res.data);
          cb && cb(res.data, true);
        } else {
          cb && cb("", true);
        }
      },
      fail: function (e) {
        cb && cb("", true);
        reportErr(
          encodeURIComponent("ptkey加密接口调用异常，具体信息：") + e.errMsg
        );
      }
    });
  }
}

/**
 * @description 主流程页面onload里pv上报set的数据
 * @author huzhouli
 * @date 2018-10-31
 */
// function setLogPv(jsonData) {
//   return new Promise((resolve, reject) => {
//     let app = getApp({
//       allowDefault: true
//     });
//     let customerinfo = wx.getStorageSync("customerinfo") || "";
//     let pvNeedData = {
//       siteId: "JA2019_5112260", //开普勒小程序固定用：WXAPP-JA2016-1
//       appid: wx.getStorageSync("appid") || "appidIsEmpty",
//       scene: wx.getStorageSync("scene") || "sceneIsEmpty",
//       customerInfo: decodeURIComponent(customerinfo),
//       sceneErr: wx.getStorageSync("sceneErr") || ""
//     };
//     //广告进入S
//     let setPvDataObj = pvNeedData;
//     let adData = wx.getStorageSync("ad"); //非空的话 说明是广告进入

//     if (adData) {
//       setPvDataObj.pparam = setPvDataObj.pparam ?
//         setPvDataObj.pparam + "&ad=" + adData :
//         "ad=" + adData;
//     }
//     //广告进入E
//     let sharematrixType = wx.getStorageSync("sharematrixType") || "";
//     if (sharematrixType) {
//       setPvDataObj.pparam = setPvDataObj.pparam ?
//         setPvDataObj.pparam + "&sharematrixType=" + sharematrixType :
//         "sharematrixType=" + sharematrixType;
//     }
//     //从微信购物单跳转进来S
//     let fromWxOrderList = wx.getStorageSync("fromWxOrderList") || "";
//     if (fromWxOrderList) {
//       setPvDataObj.pparam = setPvDataObj.pparam ?
//         setPvDataObj.pparam + "&wxShoppingListScene =" + fromWxOrderList :
//         "wxShoppingListScene =" + fromWxOrderList;
//     }
//     //从微信购物单跳转进来E

//     //obj必须是json格式并且非空
//     if (
//       typeof jsonData === "object" &&
//       Object.prototype.toString.call(jsonData).toLocaleLowerCase() ===
//       "[object object]" &&
//       JSON.stringify(jsonData) !== "{}"
//     ) {
//       for (let item in jsonData) {
//         if (item == "pparam" && setPvDataObj[item]) {
//           setPvDataObj[item] = jsonData[item] + "&" + setPvDataObj[item];
//         } else {
//           setPvDataObj[item] = jsonData[item];
//         }
//       }
//     }
//     const resolveCallback = function (data) {
//       getSecretPtKey(function (secretPtKey, isAsync) {
//         //如果是同步返回ptkey加密值，则设置标记为true
//         data.cipherPin = secretPtKey;
//         resolve(data);
//       });
//     };
//     kGetCleanOpenid(app)
//       .then(openid => {
//         setPvDataObj.openid = openid;
//         setPvDataObj.openIdMonitoring = openid;
//         resolveCallback(setPvDataObj);
//       })
//       .catch(() => {
//         setPvDataObj.openid = "acquisitionFailure";
//         setPvDataObj.openIdMonitoring = "acquisitionFailure";
//         resolveCallback(setPvDataObj);
//       });
//   });
// }
//手动拼jda 此方法由大数据研发 李吉文 提供
function getJda() {
  var jda = wx.getStorageSync("__jda");
  if (!jda) {
    var now = new Date().getTime();
    jda = [
      1,
      now + "" + parseInt(Math.random() * 2147483647),
      now,
      now,
      now,
      0
    ].join(".");
    wx.setStorageSync("__jda", jda);
  }
  return jda;
}
/**
 * 3des加密
 * @param {*} message 
 * @param {*} key 'np!u5chin@adm!n1aaaaaaa2'
 */
function encryptBy3DES(message, key = 'np!u5chin@adm!n1aaaaaaa2') {
  if (message === null || message === undefined) {
    return message
  }

  var keyHex = CryptoJS.enc.Utf8.parse(key);
  var encrypted = CryptoJS.TripleDES.encrypt(message, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
}
/**
 * 3des解密
 * @param {*} ciphertext 
 * @param {*} key 'np!u5chin@adm!n1aaaaaaa2'
 */
function decryptBy3DES(ciphertext, key = 'np!u5chin@adm!n1aaaaaaa2') {
  if (ciphertext === null || ciphertext === undefined) {
    return ciphertext
  }

  var keyHex = CryptoJS.enc.Utf8.parse(key);
  var decrypted = CryptoJS.TripleDES.decrypt({
    ciphertext: CryptoJS.enc.Base64.parse(ciphertext)
  },
    keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  }
  );
  return decrypted.toString(CryptoJS.enc.Utf8);
}
// todo== 临时函数，后期优化
/**
 * 添加自定义的Cookie
 * 同步地址信息
 */
function getSelfCookie() {
  let value = "";
  try {
    let regionAddress = wx.getStorageSync("regionAddress");
    if (regionAddress) {
      value = value + "regionAddress=" + regionAddress + ";";
    }
  } catch (e) {
    log.error(e);
  }

  return value;
}

// function getItemData(parameter) {
//   let app = getApp({
//     allowDefault: true
//   });
//   if (
//     parameter &&
//     parameter.data &&
//     (parameter.data.wareId || parameter.data.skuId)
//   ) {
//     let selfCookie = getSelfCookie();
//     let requestUrl = app.globalHealthWareUrl + "/sku/viewHealthy.json";
//     let {
//       longitude = null, latitude = null
//     } = wx.getStorageSync("locationInfo");
//     let data = Object.assign({}, parameter.data, {
//       wareId: parameter.data.wareId || parameter.data.skuId,
//       latitude,
//       longitude,
//       vendorId: parameter.data.venderId
//     });

//     // 如果是广告直投
//     if (wx.getStorageSync("ad")) {
//       data.ad = "zhitou";
//     }
//     request({
//       url: requestUrl,
//       data: data,
//       selfCookie: selfCookie,
//       success: res => {
//         parameter.success && parameter.success(res);
//       },
//       fail: res => {
//         parameter.fail && parameter.fail(res);
//       },
//       complete: res => {
//         parameter.complete && parameter.complete(res);
//       }
//     });
//   }
// }

function getRequestUrl(functionId, param, appid) {
  return `${API.globalHealthRequestUrl
    }/api?functionId=${functionId}&body=${JSON.stringify(
      param
    )}&jsonp=&appid=${appid}&loginType=2`;
}

function getJDHpharmacyRequestUrl(functionId, param, appid) {
  return `${API.globalJDHpharmacyRequestUrl
    }/api?functionId=${functionId}&body=${JSON.stringify(
      param
    )}&jsonp=&appid=${appid}&loginType=2`;
}

function httpsGet(param) {
  param.method = 'GET'

  if (param.url === '/api') {
    param.url = getRequestUrl(param.data.functionId, param.data.body, param.data.appid)
  } else if (param.url === '/JDHpharmacy-api') {
    param.url = getJDHpharmacyRequestUrl(param.data.functionId, param.data.body, param.data.appid)
  }
  delete param.data;
  return promiseRequest(param)
}

function axios(param) {
  param.method = param.method || 'GET'

  if (param.url === '/api') {
    param.url = getRequestUrl(param.data.functionId, param.data.body, param.data.appid)
  } else if (param.url === '/JDHpharmacy-api') {
    param.url = getJDHpharmacyRequestUrl(param.data.functionId, param.data.body, param.data.appid)
  }
  delete param.data;
  return promiseRequest(param)
}

function isBlank(str) {
  if (Object.prototype.toString.call(str) === '[object Undefined]') {//空
    return true
  } else if (
    Object.prototype.toString.call(str) === '[object String]' ||
    Object.prototype.toString.call(str) === '[object Array]') { //字条串或数组
    return str.length == 0 ? true : false
  } else if (Object.prototype.toString.call(str) === '[object Object]') {
    return JSON.stringify(str) == '{}' ? true : false
  } else {
    return true
  }
}

/*
 * 小程序版本号比对（官方的代码）
 *
 * @param {String} v1 getApp().systemInfo.SDKVersion
 * @param {String} v2 版本号
 * @returns number - 1:大于 v2 版本号，0:等于 v2 版本号，-1:小于 v2 版本号
 */
function compareVersion(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}
export {
  httpsGet,
  axios,
  formatTime,
  dateFormat,
  isBlank,
  request,
  transfer2Array,
  reportErr,
  globalLoginShow,
  globallogout,
  promiseRequest,
  // loginSuccessCb,
  getUserInfo,
  // umpMonitor,
  getPhoneModel,
  getJumpPageType,
  toGenerateFingerPrint,
  // isLogin,
  getPtKey,
  getSecretPtKey,
  // setLogPv,
  getJda,
  pageMonitor,
  encryptBy3DES,
  decryptBy3DES,
  emitter,
  getLocation,
  getImgUrl,
  formatDistance,
  kGetCleanOpenid,
  // getItemData,
  compareVersion,
}