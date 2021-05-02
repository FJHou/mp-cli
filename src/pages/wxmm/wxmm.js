// pages/wxmm/wxmm.js
//skz
var app = getApp()
//const util = require('../../utils/util.js');
// TODO: 会员通三个进入免密支付的入口
Page({

  /**
   * 页面的初始数据
   */
  data: {
    query: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    wx.showLoading({
      title: '加载中',
    })
    this.toWxmmOpen()
  },
  //调微信小程序 开通
  toWxmmOpen: function () {
    try {
      var data = JSON.parse(wx.getStorageSync('miniPayParam'))
      wx.navigateToMiniProgram({
        appId: 'wxbd687630cd02ce1d',
        path: 'pages/index/index',
        extraData: {
          appid: data.appid,
          contract_code: data.contract_code,
          contract_display_account: data.contract_display_account,
          mch_id: data.mch_id,
          notify_url: data.notify_url,
          plan_id: data.plan_id,
          request_serial: data.request_serial,
          sign: data.sign,
          timestamp: data.timestamp,
        },
        success(res) {
          // 成功跳转到签约小程序
          wx.setStorageSync('isHasOnceScene', '1')
        },
        fail(res) {
          // 未成功跳转到签约小程序 
        }
      })
    } catch (err) {
      console.error(err);
    }
  },
})