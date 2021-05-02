//var utils = require('../../utils/util.js');
import { globalLoginShow, request, reportErr } from "../../utils/util.js";
// var messagePush = require('../../utils/message_push.js');
//var pay = require('../../utils/MPay.js');
import { gotopay } from "../../utils/MPay.js";
// var log = require('../../libs/keplerReport.js').init();
//获取应用实例
var app = getApp();
Page({
  data: {
    option: '',
    homedir: "/kwxhome",
    canShowMore: false, //init status: to hide some wareinfo
    toast: {
      toastShow: false,
      toastMsg: ''
    },
    scrollTop: 0,
    windowHeight: 0,

    showIM: false,//是否显示客服
    venderId: '',
    orderId: '',
    isLogin: false,
    isShowContent: false,
    locCodeList: [{
      code: 18780250846,
      endTime: '2017-12-31',
      isExpire: false
    }, {
      code: 18780250846,
      endTime: '2017-12-31',
      isExpire: true
    }],
    isShowLoc: false,
    isIphoneX: app.globalData.isIphoneX,
    appId: '', //跳转微信购物单所需
    isWxShopOrder: '',//控制微信购物单Btn显示隐藏字段
    isWxOrderListHint: true, //去往微信购物单介绍页点击开关
    isWxOrderList: true, //去往微信购物单评价页点击开关
    requestFrom: '',//从微信购物单跳转过来所带的参数
    pvFlag: true
  },
  onLoad: function (options) {
    var that = this;
    that.data.option = options;
    this.disbale = false;
    var detailUrl = '';
    var orderId = options.orderId, fromType, passKey;
    let appId = wx.getStorageSync('appid') ? wx.getStorageSync('appid') : '';

    //页面参数里有requestFrom 说明是从微信购物单进入商详
    this.data.requestFrom = options.requestFrom ? '&requestFrom=' + options.requestFrom : '';
    //从H5页跳转
    if (options.fromPage && options.fromPage == 'h5') {
      fromType = 'newUserAllOrderList';
      passKey = '';
    } else {//原生跳转
      fromType = options.from ? options.from : '';
      passKey = options.passKey ? options.passKey : '';
    }
    detailUrl = '/newAllOrders/queryOrderDetailInfo.json?orderId=' + orderId + '&from=' + fromType + '&passKey=' + passKey + that.data.requestFrom;
    that.getOrderDetail(detailUrl);
    that.wxOrderListFlag(orderId);
    that.setData({
      detailUrl: detailUrl,
      orderId: orderId,
      appId: appId
    });

    //埋点上报设置
    //加密key和openid都是异步获取 ，所以setLogPv封装成一个promise 来同步数据
    // setLogPv({
    //   urlParam: options, //onLoad事件传入的url参数对象
    //     title: '订单详情', //网页标题
    //     pageId:'Wpersonal_OrderDetails',
    //     pageTitleErro:'pages/orderDetail/orderDetail/订单详情'
    // }).then(function(data){
    //   // log.set(data);
    //   if(that.data.pvFlag){
    //       that.data.pvFlag = false
    //       // log.pv()
    //   }
    // })

    //get system width
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        });
      }
    })
  },
  onShow: function () {
    let that = this
    //that.data.pvFlag为true 上报pv
    if (!that.data.pvFlag) {
      //   log.pv()
    }
  },
  //判断登录态
  checkLogin: function (reponse) {
    if (reponse.code == '999') {//登录拦截去判断没有登录
      let that = this;
      this.setData({
        returnpage: '/pages/orderDetail/orderDetail?orderId=' + that.data.orderId,
      });
      globalLoginShow(this);
      return false;
    } else {
      return true;
    }
  },
  getOrderDetail: function (detailUrl) {
    var that = this;
    if (detailUrl) {
      var url = getApp().globalHealthPayRequestUrl + detailUrl;
      request({
        url: url,
        success: that.toViewPage.bind(that)
      });
    }
  },
  goPay: function (e) {
    if (!this.disbale) {
      this.disbale = !this.disbale;
      wx.showToast({
        title: '正在拉起支付',
        icon: 'loading',
        mask: true,
        duration: 10000
      })
      //埋点
      var formId = e.detail.formId;
      var wareList = this.data.orderDetail.wareInfoList;
      var strSku = '';
      var arrSku = wareList.map(item => item.wareId);
      strSku = arrSku.join('_');
      let wxShoppingListScene = wx.getStorageSync('fromWxOrderList') ? 'wxShoppingListScene=' + wx.getStorageSync('fromWxOrderList') : '';

      //   log.click({
      //     "eid": "Morder_Orderdetailed_Pay",
      //     "elevel": "",
      //     "eparam": strSku + '_' + e.currentTarget.dataset.ordertype+'&'+ wxShoppingListScene,
      //     "pname": "",
      //     "pparam": "",
      //     "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
      //     "event": e //必填，点击事件event
      //   });

      gotopay({
        orderId: e.currentTarget.dataset.orderid,
        orderType: e.currentTarget.dataset.ordertype,
        orderTypeCode: e.currentTarget.dataset.ordertypecode,
        factPrice: e.currentTarget.dataset.factprice,
        source: 'orderDetail',
        formId: formId
      }, this);
    }
  },
  toViewPage: function (reponse) {
    // reponse.newOrderInfo.orderStatusShow
    try {

      var that = this;
      if (!that.checkLogin(reponse)) {
        return
      }
      // 判断是否是loc商品
      let isShowLoc = that.data.isShowLoc;
      let orderStatus = reponse.newOrderInfo.orderStatusShow;
      if (reponse.isLoc && reponse.locOrder && reponse.locOrder.skuInfos) {
        isShowLoc = true;
        that.reportExposure('Wpersonal_OrderDetails_LOCBExpo', orderStatus)// LOC消费码曝光
        that.reportExposure('Wpersonal_OrderDetails_LOCBMExpo', orderStatus)// LOC消费方式曝光
        that.reportExposure('Wpersonal_OrderDetails_LOCSExpo', orderStatus)// LOC门店曝光

        //如果该订单是loc商品，存储在缓存中，返回到列表页时，重新请求数据
        wx.setStorageSync('isOrderLocDetail', true);
        reponse.wareInfoList = reponse.locOrder.skuInfos;
      }
      // 判断是否为到店自提订单
      let isPopSop = reponse && reponse.isPopSop;
      isPopSop = true;
      if (isPopSop) {

      }
      if (!reponse.newOrderInfo) {
        wx.redirectTo({
          url: '/pages/error/error'
        });
      }
      that.setData({
        orderDetail: reponse,
        showIM: reponse.newOrderInfo.showIM,
        venderId: reponse.newOrderInfo.canGoToShop ? (reponse.newOrderInfo.venderId || '') : 1,
        orderId: reponse.newOrderInfo.orderId,
        isLogin: (reponse.desPin ? true : false),
        isShowContent: true,
        isShowLoc: isShowLoc,
        isPopSop: isPopSop
      });
      //取消、退款进度
      if (reponse.newOrderInfo.cancelProgressText) {
        request({
          url: getApp().globalHealthPayRequestUrl + '/newAllOrders/getCancelProgressInfo.json?orderId=' + reponse.newOrderInfo.orderId + '&shopId=' + reponse.newOrderInfo.shopId + '&venderId=' + reponse.newOrderInfo.venderId,

          success: function (data) {
            var objProgress = {};
            if (data && data.refundMsg && data.refundMsg.refundMessage.length
              && data.refundMsg.refundMessage[0]) {
              objProgress = data.refundMsg.refundMessage[0];
              objProgress.status = data.refundMsg.refundState;
            } else {
              objProgress.message = '';
              objProgress.time = '';
              objProgress.status = '';
            }
            that.setData({ cancelOrderProgress: objProgress });
          }

        });
      }
      //清除storage
      wx.removeStorageSync('order_detai_updated');
      //set order_detai_updated orderid into storage for order list page's refresh data partly
      wx.setStorage({
        key: 'order_detai_updated',
        data: {
          'updatedOrder': {
            home_orderdetail_confirm618: reponse.home_orderdetail_confirm618,
            orderStatusShow: isShowLoc && reponse.locOrder ? reponse.locOrder.orderStatusDesc : reponse.newOrderInfo.orderStatusShow,
            message: reponse.newOrderInfo.message,
            orderId: reponse.newOrderInfo.orderId,
            buttons: reponse.newOrderInfo.orderInfoButtons,
            isOtcSelfOrder: reponse.newOrderInfo.isOtcSelfOrder,
            isPreSaleOrder: reponse.newOrderInfo.isPreSaleOrder,
            internationalType: reponse.newOrderInfo.internationalType,
            orderType: reponse.newOrderInfo.orderType,
            payTypeCode: reponse.newOrderInfo.payTypeCode
          }
        },
        fail: function () {
          console.log('set order_detai_updated error in order detail module');
        }
      });
    } catch (e) {
      reportErr("order detail toview: " + e.message);
    }
  },
  showMoreWareInfos: function (e) {
    //when click , will show the others wareinfo(more than 3)
    var flag = this.data.canShowMore;
    flag = flag ? false : true;
    this.setData({ canShowMore: flag });
    var eid = "";
    if (flag) {
      eid = "Wpersonal_OrderDetails_FoldPlus";
    } else {
      eid = "Wpersonal_OrderDetails_FoldClose";
    }
    //埋点
    // log.click({
    //   "eid": eid,
    //   "elevel": "",
    //   "eparam": "",
    //   "pname": "",
    //   "pparam": "",
    //   "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
    //   "event": e //必填，点击事件event
    // });
  },
  cancelOrder: function (e) {
    var that = this,
      curTarget = e.currentTarget,
      orderId = curTarget.dataset.orderid,
      orderStatus = curTarget.dataset.status,
      cancelUrl = getApp().globalHealthPayRequestUrl + '/user/cancelOrder.json?orderId=' + orderId;

    //埋点
    // log.click({
    //   "eid": "Morder_Cancel",
    //   "elevel": "",
    //   "eparam": orderStatus,
    //   "pname": "",
    //   "pparam": "",
    //   "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
    //   "event": e //必填，点击事件event
    // });

    wx.showModal({
      content: '是否确定取消该订单？',
      showCancel: true,
      cancelText: '否',
      confirmText: '是',
      confirmColor: '#f23030',
      success: function (res) {
        if (res.confirm) {//确认取消订单
          //埋点
          //   log.click({
          //     "eid": "MOrderCenter_CancelConfirm",
          //     "elevel": "",
          //     "eparam": orderStatus,
          //     "pname": "",
          //     "pparam": "",
          //     "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
          //     "event": e //必填，点击事件event
          //   });

          request({
            url: cancelUrl,
            method: 'GET',
            success: function (data) {
              if (data.cancelResult == "1") { //取消订单成功
                // messagePush.messagePush({
                //   formId: e.detail.formId,
                //   times: 1,
                //   type: 30004
                // })
                that.kwxToast({
                  toastMsgUp: '申请提交成功',
                  toastMsgDown: '稍后您可以在本页面顶部查看结果',
                  closeToastCb: function () {
                    that.getOrderDetail(that.data.detailUrl);
                    that.setData({ scrollTop: 0 });
                  }
                });
                that.reportExposure('Wpersonal_OrderDetails_OCExpo')// 申请取消订单成功toast曝光
              } else {
                that.kwxToast({
                  toastMsgUp: '申请提交失败，请重新尝试！'
                });
              }
            },
            fail: function (e) {
              //toast提示 失败
              reportErr(encodeURIComponent("订单详情页cancelOrder操作失败，具体信息：") + e.errMsg);
            }
          });
        } else {//否
          //页面保持
          //埋点
          //   log.click({
          //     "eid": "MOrderCenter_CancelCancel",
          //     "elevel": "",
          //     "eparam": orderStatus,
          //     "pname": "",
          //     "pparam": "",
          //     "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
          //     "event": e //必填，点击事件event
          //   });
        }
      }
    })
  },
  confirmOrder: function (e) {
    var that = this,
      curTarget = e.currentTarget,
      orderId = curTarget.dataset.orderid,
      url = getApp().globalHealthPayRequestUrl + '/user/confirmGoods.json?orderId=' + orderId;
    wx.showModal({
      content: '是否确定已收到货品？',
      showCancel: true,
      cancelText: '取消',
      confirmText: '确认',
      confirmColor: '#f23030',
      success: function (res) {
        if (res.confirm) {//确认
          request({
            url: url,
            method: 'GET',
            success: function (data) {
              var eparam;
              if (data.flag == "true") { //确认收货成功
                eparam = "1";
                // messagePush.messagePush({
                //   formId: e.detail.formId,
                //   times: 1,
                //   type: 30003
                // })
                that.getOrderDetail(that.data.detailUrl);
                that.setData({ scrollTop: 0 });
                //取消按钮隐藏
              } else {
                eparam = "0";
                that.kwxToast({
                  toastMsgUp: '无法完成收货，请稍后重试。'
                });
              }
              //   log.click({
              //     "eid": "Wpersonal_OrderDetails_RGY",
              //     "elevel": "",
              //     "eparam": eparam,
              //     "pname": "",
              //     "pparam": "",
              //     "pageId":'Wpersonal_OrderDetails',
              //     "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
              //     "event": e //必填，点击事件event
              //   });
            },
            fail: function (e) {
              reportErr(encodeURIComponent("订单详情页confirmOrder操作失败，具体信息：") + e.errMsg);
            }
          });
        } else {//取消
          //页面保持
          //埋点
          //   log.click({
          //     "eid": "Wpersonal_OrderDetails_RGN",
          //     "elevel": "",
          //     "eparam": "0",
          //     "pname": "",
          //     "pparam": "",
          //     "pageId":'Wpersonal_OrderDetails',
          //     "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
          //     "event": e //必填，点击事件event
          //   });
        }
      }
    });
    // log.click({
    //   "eid": "WOrder_DetailConfirmReceipt",
    //   "elevel": "",
    //   "eparam": '',
    //   "pname": "",
    //   "pparam": "",
    //   "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
    //   "event": e //必填，点击事件event
    // });
  },
  //自定义toast
  kwxToast: function (options) {
    var that = this;
    options = {
      toastMsgUp: options.toastMsgUp || null,
      toastMsgDown: options.toastMsgDown || null,
      closeToastCb: options.closeToastCb || null,
      delay: options.delay || 3000
    }
    that.setData({
      toast: {
        toastShow: true,
        toastMsgUp: options.toastMsgUp,
        toastMsgDown: options.toastMsgDown
      }
    });
    setTimeout(function () {
      that.setData({ toast: { toastShow: false } });
      if (options.closeToastCb && typeof options.closeToastCb == 'function') {
        options.closeToastCb();
      }
    }, options.delay);
  },
  jump2orderTrack: function (e) {
    //avoid repeat request
    var lastOptionTime = this.data.lastOptionTime;
    if (lastOptionTime == 0) {
      this.setData({ lastOptionTime: new Date().getTime() });
    } else {
      var now = new Date().getTime();
      if (now - lastOptionTime < 5000) {
        return false;
      } else {
        this.setData({ lastOptionTime: new Date().getTime() });
      }
    }
    var objTarget = e.currentTarget;
    var trackUrl = objTarget.dataset.url;
    var orderStatus = objTarget.dataset.status;

    //埋点
    // log.click({
    //   "eid": "Morder_Orderdetailed_Check",
    //   "elevel": "",
    //   "eparam": orderStatus,
    //   "pname": "",
    //   "pparam": "",
    //   "target": trackUrl, //选填，点击事件目标链接，凡是能取到链接的都要上报
    //   "event": e //必填，点击事件event
    // });
    //清除storage
    wx.removeStorageSync('order_track_jump_url')
    wx.setStorage({
      key: 'order_track_jump_url',
      data: {
        'trackUrl': trackUrl
      },
      fail: function () {
        console.log('set order_track_jump_url error in order module');
      },
      success: function () {
        wx.navigateTo({
          url: '/pages/orderTrack/orderTrack'
        });
      }
    });
  },
  goToChat: function (e) {
    let that = this;
    let pages = getCurrentPages();
    let isLogin = that.data['isLogin'];
    var objTarget = e.currentTarget;
    var orderStatus = objTarget.dataset.status;

    let entry = '', logEid = '';
    if (that.data.orderDetail && that.data.orderDetail.newOrderInfo && that.data.orderDetail.newOrderInfo.canGoToShop) {
      entry = 'pop_m_kpl_order';
      logEid = 'Wpersonal_OrderDetails_ Seller';
    } else {
      entry = 'jd_m_kpl_order';
      logEid = 'Wpersonal_OrderDetails_JD';
    }

    //   log.click({
    //     "eid": logEid,
    //     "elevel": "",
    //     "eparam": orderStatus,
    //     "pname": "",
    //     "pparam": "",
    //     "pageId":'Wpersonal_OrderDetails',
    //     "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
    //     "event": e //必填，点击事件event
    //   });

    let chatData = ('entry=' + entry + '&venderId=' + that.data['venderId'] + '&orderId=' + that.data['orderId']);

    if (isLogin) {
      if (pages.length > 4) {
        wx.redirectTo({
          url: '/pages/chat/chat?' + chatData
        });
      } else {
        wx.navigateTo({
          url: '/pages/chat/chat?' + chatData
        });
      }
    }

  },
  wxOrderListFlag: function (orderId) {
    let that = this;
    let url = getApp().globalHealthPayRequestUrl + '/newAllOrders/wxShopOrder.json?orderId=' + orderId;
    request({
      url: url,
      success: function (data) {
        if (data && data.isWxShopOrder === '1') {
          that.setData({
            isWxShopOrder: 1
          })
        }
      }
    });
  },
  goWxOrderList: function (e) {
    let that = this;
    let wxOrderListScene = wx.getStorageSync('fromWxOrderList') ? '&wxShoppingListScene =' + wx.getStorageSync('fromWxOrderList') : '';
    wx.showLoading({
      title: '跳转中',
      mask: true,
    })
    //     log.click({
    //       "eid": "WOrder_DetailWSLReviews",
    //       "elevel": "",
    //       "eparam": that.data.orderId +''+ wxOrderListScene,
    //       "pname": "",
    //       "pparam": "",
    //       "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
    //       "event": e //必填，点击事件event
    //   });
  },
  goWxOrderListHint: function (e) {
    let that = this;
    let wxOrderListScene = wx.getStorageSync('fromWxOrderList') ? 'wxShoppingListScene =' + wx.getStorageSync('fromWxOrderList') : '';
    wx.showLoading({
      title: '跳转中',
      mask: true,
    })
    //   log.click({
    //       "eid": "WOrder_DetailWSLIntroduce",
    //       "elevel": "",
    //       "eparam":wxOrderListScene,
    //       "pname": "",
    //       "pparam": "",
    //       "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
    //       "event": e //必填，点击事件event
    //   });
  },
  goWxOrderFail: function () {
    wx.hideLoading();
  },
  goWxOrderSuccess: function () {
    let that = this;
    wx.hideLoading();
  },
  closePickupToast: function () {
    this.setData({
      pickupToast: false
    });
  },
  openPickupToast: function (e) {
    // log.click({
    //   "eid": "WOrder_ProductQRCode",
    //   "elevel": "",
    //   "eparam": "",
    //   "pname": "",
    //   "pparam": "",
    //   "pageId":'WOrder_Detail',
    //   "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
    //   "event": e //必填，点击事件event
    // });
    this.setData({
      pickupToast: true
    });
  },
  onHide: function () {
    //上报留存时长，需要在页面的onUnload、onHide事件中调用log.pageUnload()方法可实现页面留存时长统计
    // log.pageUnload()
  },
  onUnload: function () {
    //上报留存时长，需要在页面的onUnload、onHide事件中调用log.pageUnload()方法可实现页面留存时长统计
    //   log.pageUnload()
  },
  /**
   * [reportExposure 上报曝光埋点]
   * @param  {[type]}  eventId      [事件id]
   * @param  {Boolean} isOnceReport [是否记录]
   * @return {[type]}               [description]
   */
  reportExposure(eventId, eparam, pparam) {
    let that = this;
    // log.exposure({
    //   "pname":"订单详情页",
    //   "eid": eventId,
    //   "elevel": '',
    //   "eparam": eparam,
    //   "target":  '', //选填，点击事件目标链接，凡是能取到链接的都要上报
    //   "event": '',
    //   "pageId":'Wpersonal_OrderDetails'
    // })

  },
})
