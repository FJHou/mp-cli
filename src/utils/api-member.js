import { TABBAR_PATH } from '../constants';
import GWM from '../libs/maSdk'
const plugin = requirePlugin("loginPlugin");

function login(fromPageType = 'switchTab', returnpage = TABBAR_PATH[0], isLogout = 1) {
  wx.redirectTo({ url: `/pages/login/index/index?returnPage=${returnpage}&pageType=${fromPageType}&isLogout=${isLogout}` })
}
// 为了兼容
function getSessionId(callback) {
  const res = {
    data: {
      data: {
        success: true
      }
    }
  }
  callback(res.data)
}

const HEADER = {
  'content-type': 'application/x-www-form-urlencoded'
}
function http(options) {
	const app = getApp()
  var timestamp = Date.parse(new Date())
  var random = Math.random()
  options.header = Object.assign({}, HEADER, options.header || {})
  if (!options.data) {
    options.data = {}
  }
  options.data.sessionId = wx.getStorageSync('sessionId')
  wx.request({
    url: app.globalData.REQUEST_HOST + options.url + "?_type=" + timestamp + random,
    method: options.type,
    data: options.data,
    header: options.header,
    success(res) {
      if (res.data.code == 'NOT_LOGIN') {
        if (wx.getStorageSync('toLogin')) {
          return;

        } else {
          wx.setStorageSync('toLogin', true);
          wx.setStorageSync('sessionId', '')
          reLogin()
        }

      } else {
        wx.setStorageSync('toLogin', false);
        if (options.success) {
          options.success(res)
        }
      }
    },
    fail(res) {
      if (options.fail) {
        options.fail(res);
      }
    },
    complete() {
      if (options.complete) {
        options.complete();
      }
    }
  })
}
function httpBate(options) {
  var timestamp = Date.parse(new Date())
  var random = Math.random()
  options.header = Object.assign({}, HEADER, options.header || {})
  if (!options.data) {
    options.data = {}
  }
  options.data.sessionId = wx.getStorageSync('sessionId')
  wx.request({
    url: 'https://beta-jpass.shop.jd.com' + options.url + "?_type=" + timestamp + random,
    method: options.type,
    data: options.data,
    header: options.header,
    success(res) {
      if (res.data.code == 'NOT_LOGIN') {
        if (wx.getStorageSync('toLogin')) {
          return;

        } else {
          wx.setStorageSync('toLogin', true);
          wx.setStorageSync('sessionId', '')
          reLogin()
        }

      } else {
        wx.setStorageSync('toLogin', false);
        if (options.success) {
          options.success(res)
        }
      }
    },
    fail(res) {
      if (options.fail) {
        options.fail(res);
      }
    },
    complete() {
      if (options.complete) {
        options.complete();
      }
    }
  })
}
function ajax(url, method, page, obj, successCallback, failCallback, completeCallback) {
	const app = getApp()
  var sessionId = wx.getStorageSync('oP_key');
  if (!url) {
    return;
  }
  if (!method) {
    return;
  }
  obj = obj ? obj : {}

  obj.sessionId = sessionId;
  var timestamp = Date.parse(new Date());
  var random = Math.random();
  wx.request({
    url: app.globalData.REQUEST_HOST + url + "?_type=" + timestamp + random,
    method: method,
    data: obj,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success(res) {
      if (res.data.code == 'NOT_LOGIN') {
        if (wx.getStorageSync('toLogin')) {
          return;

        } else {
          wx.setStorageSync('toLogin', true);
          wx.setStorageSync('sessionId', '')
          reLogin()
        }

      } else {
        wx.setStorageSync('toLogin', false);
        successCallback(res)
      }
    },
    fail(res) {
      if (failCallback) {
        failCallback(res)
      }

    },
    complete() {
      if (completeCallback) {
        completeCallback();
      }

    }
  })
}

// opt:{
//   functionName: String,
//   method: String || null,
//   data: Object || {},
//   needOpenId: Boolean || false,
//   success: Function || null,
//   fail: Function || null,
//   complete: Function || null
// }
const isTest = false
function GWAjax(opt) {

  if (!opt.functionName) {
    return;
  }

  GWM.ajax({
    functionId: opt.functionName,
    data: opt.data || {},
    type: opt.type || 'GET',
    isDev: opt.isTest || isTest || false,
    needOpenId: opt.needOpenId || false,
    success: res => {
      if (res.data.code == '0' && res.data.data && res.data.data.code == '403') {
        console.log('not logined');
        if (wx.getStorageSync('toLogin')) {
          return;
        } else {
          wx.setStorageSync('toLogin', true)
          wx.setStorageSync('sessionId', '')
          reLogin()
        }
      } else {
        wx.setStorageSync('toLogin', false)
        opt.success && opt.success(res)
      }
    },
    error: res => {
      opt.fail && opt.fail(res)
    },
    complete() {
      opt.complete && opt.complete()
    }
  })
}

// function getRedPointStatus(callback) {
//   GWAjax({
//     functionName: 'UserExportService.getRedPointStatus',
//     success: res => {
//       res = res.data
//       if (res.code == 0 && res.data && res.data.success) {
//         if (res.data.message == "0") {
//           wx.setStorageSync('hasNewRedPoint', true)
//           wx.setStorageSync('activityStamp', res.data.data.activityStamp)
//           wx.showTabBarRedDot({
//             index: 1
//           })
//         } else {
//           wx.removeStorageSync('hasNewRedPoint')
//           wx.hideTabBarRedDot({
//             index: 1
//           })
//         }
//       } else {
//         wx.removeStorageSync('hasNewRedPoint')
//         wx.hideTabBarRedDot({
//           index: 1
//         })
//       }
//     }
//   })
// }

function pageParamsStringify(options) {
  var str = '?'
  for (var item in options) {
    str += item + '=' + options[item] + '&'
  }
  return encodeURIComponent(str)
}

function reLogin() {
  wx.removeStorageSync('sessionId');
  wx.removeStorageSync('userInfo');
  wx.removeStorageSync('jdUserInfo');
  wx.removeStorageSync('jdlogin_pt_key');
  wx.removeStorageSync('jdlogin_pt_pin');
  wx.removeStorageSync('jdlogin_pt_token');
  var pageList = getCurrentPages()
  var page = pageList[pageList.length - 1]
  var returnpage = '/' + page.route + pageParamsStringify(page.options)
  var pagetype = TABBAR_PATH.indexOf(`/${page.route}`) != -1 ? 'switchTab' : ''
  login(pagetype, returnpage)
}

function checkLogin(opt) {
  //待定啊
  if (opt.pt_key) {
    plugin.setStorageSync('jdlogin_pt_key', opt.pt_key)
    wx.setStorageSync('jdlogin_pt_key', opt.pt_key)
    getSessionId(function (res) {
      if (res.data.success) {
        opt.success()
      }
    })
  } else {
    const isLogined = plugin.getPtKey()
    if (isLogined) {
      plugin.setStorageSync('jdlogin_pt_key', isLogined)

      wx.setStorageSync('jdlogin_pt_key', opt.pt_key)
      if (wx.getStorageSync('oP_key')) {
        opt.success()
      } else {
        getSessionId(function (res) {
          if (res.data.success) {
            opt.success()
          }
        })
      }
    } else {
      reLogin()
    }
  }

}
/*创建分享链
 *分享类型type  分享类型(1券包、2活动、3会员卡)
 *objectId  券包就是包id   活动就是活动id   会员卡就是卡会员体系id
*/
// function createShareChain(opt) {
//   GWAjax({
//     functionName: 'ShareFacadeExportService.createShareChain',
//     data: {
//       param: {
//         bid: opt.bId,
//         brandId: opt.brandId,
//         type: opt.type,
//         objectId: opt.objectId
//       }
//     },
//     success: res => {
//       res = res.data
//       opt.success && opt.success(res)
//     },
//     error: err => {
//       opt.fail && opt.fail(err)
//     },
//     complete() {
//       opt.complete && opt.complete()
//     }
//   })
// }

//导购数据上报
function saleReportData(opt) {
  GWAjax({
    functionName: 'ShareFacadeExportService.recordShare',
    data: {
      param: {
        shareChainId: opt.shareChainId,
        fromPin: opt.fromPin || '',
        fromOpenId: opt.fromOpenId || '',
        type: opt.type,
        level: opt.level
      }
    },
    success: res => {
      res = res.data
      opt.success && opt.success(res)
    },
    error: err => {
      opt.fail && opt.fail(err)
    },
    complete: () => {
      opt.complete && opt.complete()
    }
  })
}
//获取用户信息
function getJDInfo(opt) {
  GWAjax({
    functionName: 'UserExportService.getUserInfo',
    success: res => {
      res = res.data
      if (res.code == 0 && res.data && res.data.success) {
        opt.success && opt.success(res)
      }
    },
    error: err => {
      opt.fail && opt.fail(err)
    },
    complete: err => {
      opt.complete && opt.complete()
    }
  })
}

//注册jpass检测
function signJpassCheck(opt) {
  GWAjax({
    functionName: 'JrCustomerExportService.signJpassCheck',
    success: res => {
      res = res.data
      if (res.code == 0 && res.data && res.data.success) {
        opt.success && opt.success(res)
      }
    },
    error: err => {
      opt.fail && opt.fail(err)
    },
    complete: err => {
      opt.complete && opt.complete()
    }
  })
}

//判断用户是不是导购
function getEmployeeStorePosInfo(opt) {
  GWAjax({
    functionName: 'ShareFacadeExportService.getEmployeeStorePosInfo',
    success: res => {
      res = res.data
      opt.success && opt.success(res)
    },
    error: err => {
      opt.fail && opt.fail(err)
    },
    complete() {
      opt.complete && opt.complete()
    }
  })
}

function getLocation(opt) {
  wx.getStorage({
    key: 'globalLocation',
    success: res => {
      opt.success && opt.success({
        latitude: res.data.latitude.toString(),
        longitude: res.data.longitude.toString()
      })
    },
    fail: err => {
      wx.getLocation({
        success: function (res) {
          opt.success && opt.success({
            latitude: res.latitude.toString(),
            longitude: res.longitude.toString()
          })
        },
        fail: function (err) {
          opt.fail && opt.fail(err)
        },
        complete: () => {
          opt.complete && opt.complete()
        }
      })
    },
    complete: () => {
      opt.complete && opt.complete()
    }
  })
}

function getBrandByBidAndBrandId(opt) {
  GWAjax({
    functionName: 'BrandExportService.getBrandByBidAndBrandId',
    data: {
      brandId: opt.brandId,
      bId: opt.bId
    },
    success: res => {
      res = res.data
      opt.success && opt.success(res)
    },
    error: err => {
      opt.fail && opt.fail(res)
    },
    complete: () => {
      opt.complete && opt.complete()
    }
  })
}

function drawCoupon(opt) {
  GWAjax({
    functionName: 'com.jd.shop.jpass.api.coupon.CouponExportService.collectCoupon',
    data: {
      couponDrawParam: opt.couponMsg
    },
    success: res => {
      res = res.data
      console.log('draw success', res)
      if (res.code == 0 && res.data && res.data.success) {
        opt.success && opt.success(res)
      }
    },
    error: err => {
      console.log('draw fail', res)
      opt.fail && opt.fail(res)
    },
    complete: () => {
      opt.complete && opt.complete()
    }
  })
}
function queryNearbyStores(opt) {
  GWAjax({
    functionName: 'StoreExportService.queryNearbyStores',
    data: opt.data,
    success: res => {
      res = res.data
      opt.success && opt.success(res)
    },
    error: err => {
      opt.fail && opt.fail(res)
    },
    complete: () => {
      opt.complete && opt.complete()
    }
  })
}
function getDegradeCoupon(opt) {
  GWAjax({
    functionName: 'CouponExportService.getDegradeCoupon',
    data: opt.data,
    success: res => {
      res = res.data
      opt.success && opt.success(res)
    },
    error: err => {
      opt.fail && opt.fail(res)
    },
    complete: () => {
      opt.complete && opt.complete()
    }
  })
}
export {
  login,
  getSessionId,
  ajax,
  // getRedPointStatus,
  reLogin,
  checkLogin,
  http,
  httpBate,
  saleReportData,
  // createShareChain,
  getJDInfo,
  getEmployeeStorePosInfo,
  GWAjax,
  getLocation,
  signJpassCheck,
  getBrandByBidAndBrandId,
  drawCoupon,
  queryNearbyStores,
  getDegradeCoupon
}
