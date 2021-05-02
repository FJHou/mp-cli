//var utils = require('../../utils/util.js');
import { request, reportErr } from "../../utils/util.js";
import { dsAddrList } from '../../api/index'
// var log = require('../../utils/keplerReport.js').init();
// const messagePush = require('../../utils/message_push.js');

//获取应用实例
var app = getApp();
Page({
  data: {
    pDir: '/kwxp',
    staticUrl: app.staticUrl,
    screenHeight: 0,
    screenWidth: 0,
    name: 'mjs',
    source: "",
    addressList: [],
    chooseAddressFlag: 0,
    isIphoneX: app.globalData.isIphoneX,
    pvFlag: true
  },
  onLoad: function (options) {
    if (options.source) {
      this.setData({
        source: options.source
      })
    } else {
      this.setData({
        source: ""
      })
    }
    let isGlobalPayment = options.isGlobalPayment === "true";

    this.setData({ isGlobalPayment });
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          screenHeight: res.windowHeight,
          screenWidth: res.windowWidth,
        });
      }
    });
    // let openId = wx.getStorageSync('oP_key') ? wx.getStorageSync('oP_key') : ''; //无加密openId
    //埋点上报设置
    //加密key和openid都是异步获取 ，所以setLogPv封装成一个promise 来同步数据
    // setLogPv({
    //   urlParam: options, //onLoad事件传入的url参数对象
    //   title: '收货地址', //网页标题
    //   openid: openId,
    //   pageId: 'WDrugstore_ReceivingAddressPage',
    //   pageTitleErro: 'pages/addressul/addressul/收货地址'
    // }).then(function (data) {
    //   that.logPvData = data
    //   app.log.set(that.logPvData);
    //   if (that.data.pvFlag) {
    //     that.data.pvFlag = false
    //     app.log.pv()
    //   }
    // })
  },
  onShow: function () {
    this.getAddressList()
    // var that = this;
    // request({
    //   url: app.globalRequestUrl + that.data.pDir + '/norder/address.json',
    //   success: that.addressulDate.bind(that),
    //   fail: function (e) {
    //     reportErr(encodeURIComponent("结算页地址列表首屏数据请求失败：") + e.errMsg);
    //   }
    // });
    //this.data.pvFlag为true 上报pv
    // if (!this.data.pvFlag) {
    //   app.log.set(this.logPvData);
    //   app.log.pv()
    // }
  },

  getAddressList() {
    dsAddrList().then(res => {
      let addrList = []
      if (res.success) {
        addrList = res.data.addrList
      }
      this.setData({
        addressList: addrList,
      });
    })
  },

  // addressulDate: function (data) {
  //   var that = this;
  //   if (data && data.addressList && data.isEncrypt == '1') {
  //     for (var i = 0; i < data.addressList.length; i++) {
  //       data.addressList[i].addressDetail && (data.addressList[i].addressDetail = decryptBy3DES(data.addressList[i].addressDetail, 'np!u5chin@adm!n1aaaaaaa2'))
  //       data.addressList[i].identityCard && (data.addressList[i].identityCard = decryptBy3DES(data.addressList[i].identityCard, 'np!u5chin@adm!n1aaaaaaa2'))
  //       data.addressList[i].name && (data.addressList[i].name = decryptBy3DES(data.addressList[i].name, 'np!u5chin@adm!n1aaaaaaa2'))
  //       data.addressList[i].pin && (data.addressList[i].pin = decryptBy3DES(data.addressList[i].pin, 'np!u5chin@adm!n1aaaaaaa2'))
  //       data.addressList[i].where && (data.addressList[i].where = decryptBy3DES(data.addressList[i].where, 'np!u5chin@adm!n1aaaaaaa2'))
  //     }
  //   }
  //   // console.log(data.addressList.length, '地址长度')
  //   that.setData({
  //     addressList: data.addressList
  //   });
  // },

  chooseAddress: function (e) {//选择地址点击事件
    if (this.data.source === 'grzx') { // 个人中心地址操作不做处理
      return false;
    }
    var that = this;
    let globalBuy = this.data.isGlobalPayment ? "HK" : "";
    // let reportedData = {
    //   "eid": 'WOrder_FillAddressSelect',
    //   "elevel": '',
    //   "eparam": '',
    //   "pname": '',
    //   "pparam": '',
    //   "target": '../addressul/addressul', //选填，点击事件目标链接，凡是能取到链接的都要上报
    //   "event": e //必填，点击事件event
    // };
    // that.unionClick(reportedData);
    request({
      url: app.globalRequestUrl + that.data.pDir + '/norder/updateOrderAddressTouch.json?addressId=' + e.currentTarget.id + '' + "&globalBuy=" + globalBuy,
      success: function (res) {
        //用户在地址列表选择地址的时候，也需要更新缓存中的全站地址
        let sitesAddressObj = {
          regionIdStr: encodeURIComponent(res.regionAddress),
          addressId: e.currentTarget.id,
          fullAddress: e.currentTarget.dataset.where
        }
        wx.setStorageSync('sitesAddress', sitesAddressObj);
        if (that.data.chooseAddressFlag == 0) {
          const wxCurrPage = getCurrentPages();//获取当前页面的页面栈
          const wxPrevPage = wxCurrPage[wxCurrPage.length - 2];//获取上级页面的page对象
          if (wxPrevPage && wxPrevPage.data && wxPrevPage.data.presaleData && wxPrevPage.data.presaleData.presaleStepPay && wxPrevPage.data.presaleData.presaleStepPay == 2) {
            wxPrevPage.data.resetDefaultPhoneNum = true;
          }
          wx.navigateBack();
        }
        that.data.chooseAddressFlag++;
      },
      fail: function (e) {
        reportErr(encodeURIComponent("结算页地址列表选择地址请求失败：") + e.errMsg);
      }
    });
  },

  newAddress: function (ev) {//新增地址按钮点击事件
    try {
      var that = this;
      // app.log.click({
      //   eid: 'WDrugstore_NewAddress',
      //   event: ev,
      //   pname: '收货地址',
      //   eparam: '',
      //   target: '',
      // })
      //没有弄清楚为啥第一个是-1 而且第一个地址wxml 在渲染模版的时候是默认， 猜测可能第一个地址是默认地址，没有默认id=-1  过滤-1  判断否则，永远少一条地址
      //同注释 ###99999-3333##
      let list = that.data.addressList.filter((item) => {
        return item.id != -1
      })
      if (list && list.length >= 20) {
        wx.showModal({
          content: '您的地址已达20条，请删除部分当前地址后再建',
          showCancel: false
        })

      } else {
        // 新建地址formId埋点
        // messagePush.messagePush({
        //   formId: ev.detail.formId,
        //   times: 1,
        //   type: 20011
        // })
        wx.navigateTo({
          url: `/pages/address/address?addressId=0&addressType=add&isGlobalPayment=${that.data.isGlobalPayment}`
        })
      }
    } catch (e) {
      reportErr(encodeURIComponent("结算页地址列表新增地址按钮点击事件报错") + e.message);
    }

  },
  // editAddress: function (ev) {
  // app.log.click({ "eid": "WDrugstore_EditAddress", "pname": "收货地址", "elevel": "", "ename": "", "eparam": "", "event": ev });
  // },
  /**
   * 调起微信地址功能
   */
  getWxAddress: function (e) {
    var that = this;
    // let reportedData = {
    //   "eid": 'WOrder_AddressImport',
    //   "elevel": '',
    //   "eparam": '',
    //   "pname": '',
    //   "pparam": '',
    //   "pageId": 'WOrder',
    //   "target": '../addressul/addressul', //选填，点击事件目标链接，凡是能取到链接的都要上报
    //   "event": e //必填，点击事件event
    // };
    // this.unionClick(reportedData);
    //###99999-3333## 有相同注释
    let list = that.data.addressList.filter((item) => {
      return item.id != -1
    })
    if (list && list.length >= 20) {
      wx.showModal({
        content: '您的地址已达20条，请删除部分当前地址后再建',
        showCancel: false
      });
    } else {
      // messagePush.messagePush({
      //   formId: e.detail.formId,
      //   times: 1,
      //   type: 20012
      // })
      that.wxChooesAddress();
    }
  },

  /**
   * 唤起微信地址api
   */
  wxChooesAddress: function () {
    let that = this;
    wx.chooseAddress({
      success: function (res) {
        wx.getStorageSync('wxRequestData') ? wx.removeStorageSync('wxRequestData') : '';
        let wxRequestData = {
          wxProName: res.provinceName,
          wxCityName: res.cityName,    //市的集合
          wxDistrictName: res.countyName,//微信返回的信息
          userName: res.userName,
          postalCode: res.postalCode,
          detailInfo: res.detailInfo,
          nationalCode: res.nationalCode,
          telNumber: res.telNumber,
        };
        wx.setStorageSync('wxRequestData', wxRequestData);
        wx.navigateTo({
          url: '/pages/address/address?addressId=0&addressType=add&isWxAddress=true&isGlobalPayment=' + that.data.isGlobalPayment
        });
      },
      fail: function () {
        wx.getSetting({
          success: function (res) {
            //判断地址授权是否成功
            if (!res.authSetting["scope.address"]) {
              wx.showModal({
                title: '信息授权提示',
                content: '需要访问您的通讯地址，请在设置中授权。',
                confirmText: '去设置',
                success: function (res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success: function (res) {
                        if (res.authSetting["scope.address"]) {
                          that.wxChooesAddress();
                        }
                      }
                    })
                  }
                }
              })
            }
          }
        })
      }
    })
  },
  /**
   * [unionClick 点击埋点上报]
   * @param  {[type]} eid    [事件id]
   * @param  {[type]} elevel [订单登记]
   * @param  {[type]} eparam [页面参数]
   * @param  {[type]} target [跳转路径]
   * @param  {[type]} event  [事件对象]
   * @return {[type]}        []
   */
  // unionClick: function (reportedData) {
  // log.click({
  //   "eid": reportedData.eid,
  //   "elevel": reportedData.elevel,
  //   "eparam": reportedData.eparam,
  //   "pname": reportedData.pname,
  //   "pparam": reportedData.pparam,
  //   "pageId": reportedData.pageId,
  //   "target": reportedData.target, //选填，点击事件目标链接，凡是能取到链接的都要上报
  //   "event": reportedData.event //必填，点击事件event
  // });
  // },
  onHide: function () {
    //上报留存时长，需要在页面的onUnload、onHide事件中调用log.pageUnload()方法可实现页面留存时长统计
    // log.pageUnload()
  },
  onUnload: function () {
    //上报留存时长，需要在页面的onUnload、onHide事件中调用log.pageUnload()方法可实现页面留存时长统计
    // log.pageUnload()
  }
})
