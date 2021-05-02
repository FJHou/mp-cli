const loginPlugin = requirePlugin("loginPlugin");
import { fetchIsReferenceUser } from "./JDH-pharmacy/index";
import { queryHeadUserInfo, getJDUserInfo } from "../api/index";
import {DEFAULT_AVATAR, USER_INFO_KEY, REFERENCE_USER_INFO_KEY, COUPON_DIALOG_CLOSED_TIME} from '../constants/index'

/*
 * returnpage:从登陆页面跳回的页面
 * 返回：跳回方式
 */
function getJumpPageType(returnpage) {
  let app = getApp();
  //此值传递给登录模块，决定由登录跳转到returnpage的方式是 switchTab还是navigator或者其他
  let jumpPageType;
  //获取globalData下维护tabBar的数组信息
  let tabBarPathArr =
    (app && app.globalData && app.globalData.tabBarPathArr) || [];

  if (returnpage.indexOf("?") != -1) {
    //如果returnPage里有参数，需要去掉之后再匹配
    returnpage = returnpage.split("?")[0];
  }
  //判断返回的页面是否是当前小程序的tabBar之一，是则跳转方式指定为 switchTab
  if (tabBarPathArr.indexOf(returnpage) != -1) {
    jumpPageType = "switchTab";
  }
  return jumpPageType;
}

/**
 * 跳转登录
 *
 * @param {object} obj - 页面page this
 */
function globalLoginShow(obj) {
  wx.removeStorageSync("jdlogin_pt_key");
  wx.removeStorageSync("jdlogin_pt_pin");

  //决定跳入登录的方式 true:navigateTo,false:redirect。避免一级页面（如tabBar页面redirect到登录后返回将退出小程序）
  let isNavigateTo;

  var returnPage = ""; //页面data内配置returnpage填写期望登陆成功跳转的地址
  if (obj.data.returnpage) {
    returnPage = obj.data.returnpage;
  }
  //此值传递给登录模块，决定由登录跳转到returnpage的方式是 switchTab还是navigator或者其他
  let pageType = getJumpPageType(returnPage);
  returnPage = encodeURIComponent(returnPage);
  //区分returnpage是Tabbar对应的页面还是其他页面。
  //tabBar页面data传’switchTab’,其他页面传’’,默认值为空。（因为tabBar页面回跳需要特殊处理，用该参数做以区分）
  // var pageType;
  // if (obj.data.fromPageType){
  //   pageType = obj.data.fromPageType;
  // }
  //区分要跳转登录页的当前页面是否是1级页面还是其他页面 fromPageLevel值为1时为一级页面（如tabBar页面）为0或者其他则非一级
  if (obj.data.fromPageLevel && obj.data.fromPageLevel == 1) {
    isNavigateTo = !!obj.data.fromPageLevel;
  } else {
    //默认逻辑
    isNavigateTo = pageType && pageType == "switchTab" ? true : false;
  }
  // var wxversion = wx.getStorageSync('appid') ? wx.getStorageSync('appid') : '';
  // var appid = 604;
  // var tabNum = 2, isKepler = 1, isTest;
  setTimeout(function() {
    // loginPlugin.setStorageSync('jdlogin_params', JSON.stringify({
    //   returnPage,
    //   wxversion,
    //   appid,
    //   pageType,
    //   tabNum,
    //   isKepler,
    //   isTest
    // }))
    if (isNavigateTo) {
      wx.navigateTo({
        url:
          "/pages/login/index/index?returnPage=" +
          returnPage +
          "&pageType=" +
          pageType,
      });
    } else {
      wx.redirectTo({
        url:
          "/pages/login/index/index?returnPage=" +
          returnPage +
          "&pageType=" +
          pageType,
      });
    }
  }, 500);
}

/**
 * 退出登录
 *
 * @param {object} obj - 页面page this
 */
function Fgloballogout(obj, request) {
  wx.showLoading({
    title: "加载中",
  });
  let app = getApp();
  var returnPage = ""; //页面data内配置returnpage填写期望登陆成功跳转的地址
  if (obj.data.returnpage) {
    returnPage = obj.data.returnpage;
  } else {
    //如果没有则传前一页地址
    var arrpageShed = getCurrentPages(),
      strCurrentPage = arrpageShed[arrpageShed.length - 1].__route__;
    returnPage = "/" + strCurrentPage;
  }
  //区分returnpage是Tabbar对应的页面还是其他页面。
  //tabBar页面data传’switchTab’,其他页面传’’,默认值为空。（因为tabBar页面回跳需要特殊处理，用该参数做以区分）
  var pageType = getJumpPageType(returnPage);
  returnPage = encodeURIComponent(returnPage);
  // if (obj.data.fromPageType){
  //   pageType = obj.data.fromPageType;
  // }
  //决定跳入登录的方式 true:navigateTo,false:redirect。避免一级页面（如tabBar页面redirect到登录后返回将退出小程序）
  let isNavigateTo;
  //区分要跳转登录页的当前页面是否是1级页面还是其他页面 fromPageLevel值为1时为一级页面（如tabBar页面）为0或者其他则非一级
  if (obj.data.fromPageLevel && obj.data.fromPageLevel == 1) {
    isNavigateTo = !!obj.data.fromPageLevel;
  } else {
    //默认逻辑
    isNavigateTo = pageType && pageType == "switchTab" ? true : false;
  }
  loginPlugin.setStorageSync(
    "jdlogin_params",
    JSON.stringify({
      wxversion: wx.getStorageSync("appid"),
      appid: 832,
      returnPage: returnPage,
      pageType: pageType,
    })
  );
  loginPlugin.logout({
    callback: (res) => {
      let { isSuccess, err_code } = res;
      // if (isSuccess && !err_code) {
        clearStorage()
        // wx.removeStorageSync("itemCartNum");
        //产品要求退出登录的时候只清楚缓存中的详细地址，保留四级地址的id
        // let sitesAddressObj = {
        //   regionIdStr: wx.getStorageSync("sitesAddress").regionIdStr,
        //   addressId: "",
        //   fullAddress: "",
        // };
        // wx.setStorageSync("sitesAddress", sitesAddressObj);
        // if (app.globalConfig && app.globalConfig.isOperatorTemplate) {
        //   wx.removeStorageSync("extuserid");
        //   wx.removeStorageSync("customerinfo");
        //   wx.removeStorageSync("unpl");
        //   wx.setStorageSync("isUserRelBinded", false);
        // }
        // var wxversion = wx.getStorageSync('appid') ? wx.getStorageSync('appid') : '';
        // var appid = 604;
        // var tabNum = 2, isKepler = 1, isLogout = '1', isTest;
        setTimeout(function() {
          wx.hideLoading();
          if (isNavigateTo) {
            wx.navigateTo({
              url:
                "/pages/login/index/index?returnPage=" +
                returnPage +
                "&pageType=" +
                pageType +
                "&isLogout=1",
            });
          } else {
            wx.redirectTo({
              url:
                "/pages/login/index/index?returnPage=" +
                returnPage +
                "&pageType=" +
                pageType +
                "&isLogout=1",
            });
          }
        }, 500);
    },
  });
}
function clearStorage() {
  wx.removeStorageSync("sid");
  wx.removeStorageSync("USER_FLAG_CHECK");
  //  这两个移除暂时留着,   为了兼容h5登录,  h5登录路径修改后即可删除.
  wx.removeStorageSync("jdlogin_pt_key");
  wx.removeStorageSync("jdlogin_pt_pin");
  // 删除用户选择的地址和定位的地址
  wx.removeStorageSync("choiceLocation");
  wx.removeStorageSync("locationInfo");
  // 删除referenceUserInfo，进入商品详情页的时候因为有是否是推广者的缓存而展示错误ui
  wx.removeStorageSync(REFERENCE_USER_INFO_KEY);
  wx.removeStorageSync(USER_INFO_KEY);
  // 优惠券弹窗推出登录需要删除，防止切换用户后不再次弹窗
  wx.removeStorageSync(COUPON_DIALOG_CLOSED_TIME)
}
function getPtKey() {
  return loginPlugin.getPtKey() || wx.getStorageSync("jdlogin_pt_key") || "";
}
function getPtPin() {
  return loginPlugin.getPtPin() || wx.getStorageSync("jdlogin_pt_pin") || "";
}

function isLogin() {
  return !!getPtKey();
}

function getUserInfo() {
  return wx.getStorageSync(USER_INFO_KEY)
}
/**
 * 登陆成功的回调函数，在这里统一处理需要登陆态获取的数据。例如用户信息/推广信息
 * @param {Object} data
 */
function onLoginSuccess(data) {
  const userInfo = data[0]
  // 防止onLoginSuccess执行时 没有写入登录态造成接口请求失败的问题，待和登录插件的开发者验证
  if (userInfo) {
    wx.setStorageSync("jdlogin_pt_key", userInfo.pt_key)
    wx.setStorageSync("jdlogin_pt_pin", userInfo.pt_pin)
  }
    // 获取推荐人信息
    queryHeadUserInfo().then((res) => {
      if (res.data) {
        wx.setStorageSync(REFERENCE_USER_INFO_KEY, res.data);
      }
    });
    // 获取京东用户信息
    getJDUserInfo().then((data) => {
      let userInfo = {}
      if (data.code == "999") {
        userInfo = {
          imgUrl: "https://img11.360buyimg.com/imagetools/jfs/t1/51795/38/9894/41122/5d720254E16e71f44/c62cac645032e247.png",
          isLogined: false
        }
      } else {
        const user = data.user
        if (user) {
          userInfo = {
            ...user,
            imgUrl: user.imgUrl === '/images/html5/newDefaul.png' ? DEFAULT_AVATAR : user.imgUrl.replace('http', 'https'),
            isLogined: true
          }
        }
      }

      wx.setStorageSync(USER_INFO_KEY, userInfo)
    });
}

export {
  getPtKey,
  Fgloballogout,
  globalLoginShow,
  getJumpPageType,
  getPtPin,
  isLogin,
  onLoginSuccess,
  getUserInfo,
};
