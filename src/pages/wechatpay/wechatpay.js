// pages/payment/payment.js.js
// import { buyingPay } from '../../utils/BuyingPay.js'
// import { pageMonitor } from '../../utils/util.js';
import loginUtil from "../../pages/login/util.js";
// var utils = require('../../utils/util.js');
var app = getApp();
Page({
  data: {
    payId: '',
    fromType: "payment"
  },
  onLoad: function (options) {
    //`/pages/wechatpay/wechatpay?
    // payId=${res.data.payId}&
    // appId=${res.data.appId}&
    // source=health&
    // failRedirectUrl=${backUrl}&
    // successRedirectUrl=${backUrl}`
    console.log('mp wechatpay onload options', options);
    this.setData({
      payId: options.payId || '9903d2a704d6430dae0fd229b1080690',
      appId: options.appId || 'jd_m_hospital',
      source: options.source || '',
      failRedirectUrl: options.failRedirectUrl || '',
      successRedirectUrl: options.successRedirectUrl || '',
      wxPayment: options.wxPayment
    });
    // pageMonitor({
    //   key: 'payment_onload',
    //   data: {
    //     'orderId': options.orderId
    //   }
    // });
    // 进行支付
    this.gotoPay();
  },
  gotoPay() {
    // jh_getWeixinMinProPayData
    let wxPayment = null;
    try {
      wxPayment = JSON.parse(decodeURIComponent(this.data.wxPayment))
    } catch (err) {
      return wx.showModal({
        title: 'wxPayment 参数解析失败',
        content: this.data.wxPayment,
        // success (res) {
        //   if (res.confirm) {
        //     console.log('用户点击确定')
        //   } else if (res.cancel) {
        //     console.log('用户点击取消')
        //   }
        // }
      })
    }
    const { timeStamp, nonceStr, packages, signType, paySign } = wxPayment

    wx.requestPayment({
      timeStamp,
      nonceStr,
      package: packages,
      signType,
      paySign,
      success: (res) => {
        console.log('wechatpay succeed', res);
        this.goOthers();
      },
      fail: (res) => {
        console.log('fail', res);
        this.goOthers();
      }
    })
    // wx.requestPayment({
    //   timeStamp,
    //   nonceStr,
    //   package: packages,
    //   signType: 'MD5',
    //   paySign,
    //   success: (res) => {
    //     console.log('wechatpay succeed', res);
    //     this.goOthers();
    //   },
    //   fail: (res) => {
    //     console.log('fail', res);
    //     this.goOthers();
    //   }
    // })
    // http://dcm.jd.com/index.html;jsessionid=C905195C0FB6C66B8B80522DA23A6784.s1#/center/732?cataOrder=2-4
  },
  async goOthers() {
    // 互医
    if (this.data.source == 'nthp') {
      let openId =await app.getOpenId();
      let url = encodeURIComponent(`https://m.healthjd.com/s/inquiry/history?miniprogram=jdjk&openId=${openId}&miniWexinAppId=${app.miniWexinAppId}`)
      loginUtil.redirectToH5({ page: url });
    } else {
      wx.redirectTo({ url: '/pages/order/order?id=1' });
    }
  },
  onUnload: function () {
    // app.globalData.buyingPayLimit = {}
  }
})
