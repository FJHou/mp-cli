//getCoupon.js
var app = getApp();
// 公用模块
//var utils = require('../../../utils/util.js');
import { toGenerateFingerPrint, request, reportErr, globalLoginShow, getJumpPageType } from "../../../utils/util.js";
// var log = require('../../../utils/keplerReport.js').init();
// var messagePush = require('../../../utils/message_push.js');
import { getCustomerinfo } from '../../../utils/individualMark';


//领券前软指纹参数准备
toGenerateFingerPrint();

Page({
  data: {
    coupondir: "/coupon",
    thisBarTitle: '领取优惠券',
    returnpage: '/pages/coupon/getCoupon/getCoupon',
    toTopDisplay: 'none',
    scrollTop: 0,
    couponStatusCls: '',
    couponTipMsg: '',
    buttonTxt: '立即领取',
    tabFun: 'tapBtnGetCoupon',
    isLogined: false,
    fromPageLevel: null,
    couponDisabled: '',
    isJumpOut: false,  //是否跳转外部小程序
    miniApp: {
      appId: '',
      path: '',
      version: 'release'
    },
    pvFlag: true
  },
  onLoad: function (options) {
    console.log(options)
    let that = this;
    that.setReturnPage(options)
    let key = options.key;
    let roleId = options.roleId;
    let jumpParameter = that.setJumpParameter(options);
    if (!key || !roleId) {
      wx.redirectTo({
        url: '/pages/error/error?thisBarTitle=' + that.data.thisBarTitle
      });
      return false;
    }
    this.setData({
      couponParam: {
        key: key,
        roleId: roleId,
        jumpParameter: jumpParameter
      }
    });

    //埋点上报设置
    // //加密key和openid都是异步获取 ，所以setLogPv封装成一个promise 来同步数据
    // utils.setLogPv({
    //   urlParam: options, //onLoad事件传入的url参数对象
    //   title: '领取优惠券页', //网页标题
    //   siteId: 'WXAPP-JA2016-1', //开普勒小程序固定用：WXAPP-JA2016-1
    //   pageId:'WCoupon',
    //   pparam: options.roleId,
    //   pageTitleErro:'pages/coupon/getCpon/getCpon/领取优惠券页',
    //   openid: wx.getStorageSync('oP_key')?wx.getStorageSync('oP_key'):'',
    //   account: !utils.getPtKey() ? '-' : utils.getPtKey()  //传入用户登陆京东的账号
    // }).then(function(data){
    //   log.set(data);
    //   if(that.data.pvFlag){
    //       that.data.pvFlag = false
    //       log.pv()
    //   }
    // })
    // 初始化数据处理
    this.dataRequest();
  },
  onShow: function () {
    //this.data.pvFlag为true 上报pv
    // if(!this.data.pvFlag){
    //   log.pv()
    //   }
  },
  // 设置跳转路径
  setJumpParameter: function (options) {
    //存储领券结束后当前跳转信息
    let jumpParameter = {};
    //当领券链接所带参数 to=http 链接,则为URL 配置跳转
    if (options.to) {
      jumpParameter.to = options.to;
      jumpParameter.type = 'URL';
    }
    //含path时，小程序内页面跳转，优先级高于to
    if (options.path) {
      jumpParameter.path = options.path;
      jumpParameter.type = 'IN_MINI_APP';
      //含appid，小程序外页面跳转，优先级高于 path
      if (options.miniAppId) {
        jumpParameter.appid = options.miniAppId;
        jumpParameter.type = 'OUT_MINI_APP';
        this.setData({
          isJumpOut: true,
          'miniApp.appId': options.miniAppId,
          'miniApp.path': decodeURIComponent(options.path)
        })
      }
    }
    return jumpParameter
  },
  // 将参数拼接到retrunPage后面
  setReturnPage: function (options) {
    let params = '';
    let paramsArr = [];
    if (options && typeof options == 'object') {
      if (Object.entries) {
        for (let [key, value] of Object.entries(options)) {
          paramsArr.push(key + '=' + value);
        }
      } else {
        for (let key in options) {
          paramsArr.push(key + '=' + options[key])
        }
      }
    }
    this.setData({
      returnpage: this.data.returnpage + '?' + paramsArr.join('&')
    })
  },
  dataRequest: function () {
    let that = this,
      key = that.data.couponParam.key,
      roleId = that.data.couponParam.roleId,
      URL = `${app.globalRequestUrl}/coupon/coupon/getAloneCoupon`;
    this.data.isHaveMore = false;
    request({
      url: URL,
      data: {
        key: key,
        roleId: roleId
      },
      success: (data) => {
        that.dataInit(data, that);
      },
      fail: function (e) {
        reportErr("coupon getCoupon.js: " + e);
        wx.redirectTo({
          url: '/pages/error/error?thisBarTitle=' + that.data.thisBarTitle
        });
      }
    });
  },
  // 初始化数据的处理
  dataInit: function (data, vm) {
    let that = this;
    //判断登录态
    if (data && typeof data != 'string') {
      if (!data.loginFlag || data.loginFlag == 'false') {//未登录
        that.setData({
          isLogined: false
        });

        globalLoginShow(this);
      } else {
        if (!data.rpcFlag || !data.data) {
          wx.redirectTo({
            url: '/pages/error/error?thisBarTitle=' + that.data.thisBarTitle
          });
        }

        that.setData({
          isLogined: true
        });
        //处理券上的时间展示
        let couponDateRange = '';
        if (data.data.expireType == 5) {
          couponDateRange = (data.data.beginTimeStr && data.data.endTimeStr) ? (data.data.beginTimeStr + '-' + data.data.endTimeStr) : '';
        } else {
          if (data.data.expireType == 0) {
            couponDateRange = (data.data.creatTimeStr && data.data.endTimeStr) ? (data.data.creatTimeStr + '-' + data.data.endTimeStr) : '';
          } else {
            if (data.data.expireType == 1) {
              couponDateRange = (data.data.addDays != null && data.data.addDays != undefined) ? ('领取后' + data.data.addDays + '天可用') : '';
            }
          }
        }
        //如果券额为空或者couponDateRange为或者券条件为空时，券置灰不可领取
        if (!data.data.discount || '' == couponDateRange || !data.data.couponTypeMsg) {
          this.setData({
            couponDisabled: 'couponDisabled',
            buttonTxt: '不可领取',
            tabFun: ''
          });
          console.log('不可领取日志：=====data=====', data);
          console.log('不可领取日志：=====couponDateRange=====', couponDateRange);
        }
        data.data.couponDateRange = couponDateRange;
        this.setData({
          item: data.data
        });
      }
    } else {
      wx.redirectTo({
        url: '/pages/error/error?thisBarTitle=' + that.data.thisBarTitle
      });
    }
  },
  couponShowInfo: function () {
    wx.showModal({
      title: '提示',
      content: '1、运费券仅可用于抵减京东自营商品订单运费,即用户下单结算时,可选择该优惠券按券面值（¥6）抵减每笔结算订单中的运费,运费券可叠加使用在同一个订单中,不设找零；2、虚拟商品及部分特殊购物流程不可用, 特殊流程如秒杀、夺宝岛等；3、运费券可与京券、东券、京东E卡、京豆同时使用',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        }
      }
    })
  },

  tapBtnGetCoupon: function (event) {
    let that = this,
      key = that.data.couponParam.key,
      roleId = that.data.couponParam.roleId,
      wxCookie = app.globalData.wxCookie,
      shshshfp = wxCookie.getCookie('shshshfp'),
      shshshfpa = wxCookie.getCookie('shshshfpa'),
      shshshfpb = wxCookie.getCookie('shshshfpb'),
      URL = `${app.globalRequestUrl}/coupon/coupon/postAloneCoupon`;
    request({
      url: URL,
      data: {
        key: key,
        roleId: roleId,
        shshshfp: shshshfp,
        shshshfpa: shshshfpa,
        shshshfpb: shshshfpb
      },
      success: (data) => {
        if (!data || !data.rpcFlag) {
          wx.redirectTo({
            url: '/pages/error/error?thisBarTitle=' + that.data.thisBarTitle
          });
        } else {
          that.couponStatus(data, roleId, event);
        }
      },
      fail: function (e) {
        reportErr("coupon getCoupon.js: " + e);
        wx.redirectTo({
          url: '/pages/error/error?thisBarTitle=' + that.data.thisBarTitle
        });
      }
    });
  },
  couponStatus: function (couponRes, roleId, event) {
    let couponStatusCls = '', couponTipMsg = '', buttonTxt = '立即领取', tabFun = 'tapBtnGetCoupon';
    if (couponRes.data.resultCode) {
      //优惠券已经被抢光
      if (couponRes.data.resultCode == 16 || couponRes.data.resultCode == 17) {
        couponStatusCls = 'empty';
        couponTipMsg = '该券已领光，请下次再来~';
        buttonTxt = '返回活动页，继续购物';
        tabFun = 'goBack';

        //领券成功
      } else if (couponRes.data.resultCode == 999) {
        couponStatusCls = 'received';
        couponTipMsg = '领取成功！感谢您的参与，祝您购物愉快~';
        buttonTxt = '立即使用';
        tabFun = 'tapBtnBack';
        //已领取过改优惠券时
      } else if (couponRes.data.resultCode == 14 || couponRes.data.resultCode == 15) {
        couponStatusCls = 'received';
        couponTipMsg = '您已经参与过此活动，别太贪心哟，下次再来~';
        buttonTxt = '立即使用';
        tabFun = 'tapBtnBack';
      } else {
        couponStatusCls = '';
        couponTipMsg = couponRes.data.resultMsg;
        buttonTxt = '返回活动页，继续购物';
        tabFun = 'goBack';
      }
      // if (couponRes.data) {
      //   log.click({
      //     "eid": "WCoupon_ReceiveNow",
      //     "elevel": "",
      //     "eparam": roleId+'_'+couponRes.data.resultCode,
      //     "pname": "",
      //     "pparam": "",
      //     "target": '', //选填，点击事件目标链接，凡是能取到链接的都要上报
      //     "event": event //必填，点击事件event
      //   });
      // }
      this.setData({
        couponStatusCls: couponStatusCls,
        couponTipMsg: couponTipMsg,
        buttonTxt: buttonTxt,
        tabFun: tabFun
      });
    }
    // 领卷成功发送formId埋点推送,点了就发送
    // messagePush.messagePush({
    //   formId: event.detail.formId,
    //   times: 1,
    //   type: 20007
    // })
  },
  // 返回上一页
  goBack: function (ev) {
    wx.navigateBack({});
  },
  tapBtnBack: function (event) {
    // messagePush.messagePush({
    //   formId: event.detail.formId,
    //   times: 1,
    //   type: 20006
    // })
    let that = this;
    let jumpParameter = that.data.couponParam.jumpParameter;
    if (jumpParameter && jumpParameter.type) {
      if (jumpParameter.type == 'OUT_MINI_APP') {

        //tranfser url link

      } else if (jumpParameter.type == 'IN_MINI_APP') {
        let jumpUrl = decodeURIComponent(jumpParameter.path)

        if (jumpUrl.indexOf('pages') == 0) {
          jumpUrl = '/' + jumpUrl;
        }
        let jumpType = getJumpPageType(jumpUrl.split('?')[0]);
        if (jumpType == 'switchTab') {
          wx.switchTab({
            url: jumpUrl
          })
          // wx.navigateBack({});
        } else {
          wx.redirectTo({
            url: jumpUrl
          })
        }
      } else if (jumpParameter.type == 'URL') {
        //todo 添加拼购传参逻辑
        let obj = {
          appkey: wx.getStorageSync("jdwcx").wxversion,
          source: app.globalData.source,
          customerinfo: getCustomerinfo() || "",
          wxapp_type: app.globalData.wxapp_type,
          unpl: wx.getStorageSync("unpl") ? wx.getStorageSync("unpl") : ""
        };
        let myUrl = JSON.stringify(obj);
        //tranfser url link
        let urlLink = jumpParameter.to;
        let appid = wx.getStorageSync('appid');
        urlLink = urlLink.replace(/(http:\/\/|https:\/\/)/, '');
        let newURL = urlLink.replace(/(pro.jd.com\/mall\/|pro.yhd.com\/yhd\/|pro.m.jd.com\/mall\/|pro.m.jd.com\/wq\/)/g, 'pro.m.jd.com/mini/');

        let reg = RegExp(/(pro.m.jd.com\/mini|sale.jd.com)/g)
        let isJump = newURL.match(reg);
        // 符合特定规则才去跳转
        if (isJump) {
          newURL = encodeURIComponent('https://' + newURL + '?wxAppName=Kepler&wxAppId=' + appid + '&siteId=' + app.globalData.siteId + '&cookie=' + myUrl)
          wx.redirectTo({
            url: '/pages/activityH5/activityH5?redirectUrl=' + newURL
          })
        } else {
          wx.navigateBack({});
        }

      } else {
        wx.navigateBack({});
      }
    } else {
      wx.navigateBack({});
    }
  },
  onHide: function () {
    //上报留存时长，需要在页面的onUnload、onHide事件中调用log.pageUnload()方法可实现页面留存时长统计
    // log.pageUnload()
  },
  onUnload: function () {
    //上报留存时长，需要在页面的onUnload、onHide事件中调用log.pageUnload()方法可实现页面留存时长统计
    // log.pageUnload()
  }
});
