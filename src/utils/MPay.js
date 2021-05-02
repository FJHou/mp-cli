var app = getApp();
import { getPtPin } from './loginUtils.js';
import * as requestFunc from './util.js';
// var messagePush = require('./message_push.js')
/**
 * 发起微信支付
 *
 * @param {object} data - 调收银台接口所需参数
 */
function gotopay(data, pageThis) {
  if (!data || data == {}) {
    console.log('request can not be executed without data.');
    return false;
  }
  var orderId = !data.orderId ? '' : data.orderId;//订单号
  var orderType = !data.orderType ? '0' : data.orderType;//订单类型
  var orderTypeCode = !data.orderTypeCode ? '0' : data.orderTypeCode;//订单类型编码（0-普通实物、LOC、电影票；11-全球购；4-拼购）
  var factPrice = !data.factPrice ? '' : data.factPrice;//订单实付金额
  var source = !data.source ? '' : data.source;//调用方法页面来源
  var globalPluginPay = wx.getStorageSync('globalPluginPay');
  var oAppId = '';
  if (orderTypeCode == '11' && globalPluginPay) {//todo  还要判断是否是全球购商品！！！
    oAppId = app.globalData.pluginAppid || '';
  } else {
    oAppId = wx.getStorageSync('appid') || '';
  }
  var formId = data.formId ? data.formId : null;//消息推送所需的formId
  wx.login({//调用登录获取code换取openId和sessionkey
    success: function (res) {
      let code = res.code;
      if (code) {
        var payRequestUrl = '';
        if (app.globalWxclient) {//模板小程序
          payRequestUrl = app.globalRequestUrl + '/kwxp/wx/pay.json?code=' + code + '&orderId=' + orderId + '&orderType=' + orderType + '&orderTypeCode=' + orderTypeCode + '&factPrice=' + factPrice + '&appId=' + oAppId + '&wxclient=' + app.globalWxclient;
        } else {//个性化小程序
          payRequestUrl = app.globalRequestUrl + '/kwxp/wx/pay.json?code=' + code + '&orderId=' + orderId + '&orderType=' + orderType + '&orderTypeCode=' + orderTypeCode + '&factPrice=' + factPrice + '&appId=' + oAppId;
        }
        requestFunc.request({
          url: payRequestUrl,
          success: function (result) { //调起微信支付
            wx.hideToast();
            pageThis.disbale = false;
            var nonceStr = result.nonceStr;
            var timeStamp = result.timeStamp;
            var prepayId = result.package;
            var paySign = result.paySign;
            var signType = result.signType;
            // if (formId) {
            //   //上报消息推送所需的数据
            //   messagePush.messagePush({
            //     formId: formId,
            //     times: 1,
            //     type: 30002
            //   })
            // }
            if (orderTypeCode == '11' && globalPluginPay) {
              var plugin = requirePlugin("myPlugin");
              let feeVal = parseFloat(factPrice) * 100;
              let paymentTempObj = {
                paymentArgs: {
                  'orderId': orderId,
                  'orderType': orderType,
                  'orderTypeCode': 11,
                  'factPrice': factPrice,
                  'appId': oAppId,
                  'cookies': {
                    'sid': wx.getStorageSync('sid'),
                    'USER_FLAG_CHECK': wx.getStorageSync('USER_FLAG_CHECK'),
                    'pt_key': getPtPin()
                  },
                },
                'fee': feeVal
              }
              plugin.setStorageSync('paymentEvDel', paymentTempObj);
              wx.navigateTo({
                url: '/pages/pluginPayment/pluginPayment'
              })
            } else {
              //发起微信支付
              wx.requestPayment({
                'timeStamp': timeStamp,
                'nonceStr': nonceStr,
                'package': prepayId,
                'signType': signType,
                'paySign': paySign,
                'success': function (payRes) {
                  if (payRes.errMsg == 'requestPayment:ok') {
                    //支付成功后推送消息
                    // messagePush.sendMsgFront({
                    //   commonId: prepayId.split('=')[1],
                    //   businessId: orderId,
                    //   businessType: 30008
                    // })

                    //上报消息推送所需数据
                    // messagePush.messagePush({
                    //     formId: prepayId.split('=')[1],
                    //     times: 2,
                    //     type: 30008
                    // })
                    //记录支付状态
                    requestFunc.request({
                      url: app.globalRequestUrl + '/kwxp/wx/succeed.json?payResult=1&orderId=' + orderId,
                      success: function (response) {
                        // console.log('response=====', reponse);
                      },
                      fail: function (e) {
                        requestFunc.reportErr(encodeURIComponent("Mpay调用支付状态上报接口/kwxp/wx/succeed.json失败，具体信息：") + e.errMsg);
                      }
                    })
                    wx.redirectTo({
                      url: '/pages/orderSubmitSuccess/orderSubmitSuccess?factPrice=' + factPrice + '&btnType=primary'
                    });
                  }
                },
                'fail': function (payRes) {
                  //上报消息推送所需的数据
                  // messagePush.messagePush({
                  //   formId: prepayId.split('=')[1],
                  //   times: 3,
                  //   type: 30008
                  // })
                  //记录支付状态
                  requestFunc.request({
                    url: app.globalRequestUrl + '/kwxp/wx/succeed.json?payResult=0&orderId=' + orderId,
                    success: function (response) {
                      // console.log('response=====', reponse);
                    },
                    fail: function (e) {
                      requestFunc.reportErr(encodeURIComponent("Mpay调用支付状态上报接口/kwxp/wx/succeed.json失败，具体信息：") + e.errMsg);
                    }
                  })
                  if (payRes.errMsg == 'requestPayment:fail cancel') { //兼容低版本的取消
                    if (source == '') {
                      wx.redirectTo({
                        url: '/pages/order/order'
                      });
                    } else if (source == 'orderDetail' || source == 'order') {

                    }
                  } else {
                    wx.showModal({
                      title: '支付失败',
                      confirmText: '我知道了',
                      showCancel: false
                    });
                    if (source == '') {
                      setTimeout(function () {
                        wx.redirectTo({
                          url: '/pages/order/order'
                        });
                      }, 500);
                    } else if (source == 'orderDetail' || source == 'order') {

                    }

                  }
                  requestFunc.reportErr(encodeURIComponent("Mpay拉起微信支付wx.requestPayment失败，具体信息：") + payRes.errMsg);
                },
                'complete': function (payRes) {
                  if (payRes.errMsg == 'requestPayment:cancel') {
                    if (source == '') {
                      wx.redirectTo({
                        url: '/pages/order/order'
                      });
                    } else if (source == 'orderDetail' || source == 'order') {

                    }
                  }
                }
              });//调起微信支付
            }

          },
          fail: function (e) {
            wx.hideToast();
            pageThis.disbale = false;
            requestFunc.reportErr(encodeURIComponent("Mpay调用调用支付接口kwxp/wx/pay.json失败，具体信息：") + e.errMsg);
          },
          complete: function () {
            // wx.hideToast();
          }
        });
      } else {
        console.log('wx.login获取code失败！' + res.errMsg)
      }
    },
    fail: function (e) {
      requestFunc.reportErr(encodeURIComponent("Mpay支付调用wx.login失败，具体信息：") + e.errMsg);
    }
  });
}
export {
  gotopay
}
