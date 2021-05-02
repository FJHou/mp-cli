// pages/logisticsInfo/logisticsInfo.js
//skz
// const log = require('../../../utils/weixinAppReport.js').init()
import * as API from '../../../utils/api-member.js'

//const util = require('../../../utils/util.js')
import { formatTime, transfer2Array } from "../../../utils/util.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: '',
    logisticsList: [],
    operator: '',
    tel: '',
    carryCode: '',
    listObj: {},
    returnIcon: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let pagesList = getCurrentPages()
    console.log(pagesList)
    if (pagesList.length <= 1) {
      this.setData({
        returnIcon: false
      })
    }
    this.setData({
      orderId: options.orderId
    })
    this.getLogisticsInfo()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  //自定义方法
  getLogisticsInfo: function () {
    var self = this;
    API.GWAjax({
      functionName: 'OrderExportService.getTrackInfo',
      data: {
        orderId: this.data.orderId
      },
      success: res => {
        res = res.data
        if (res.code == 0 && res.data && res.data.success) {
          var tmp = this.data.listObj
          var list = res.data.data.trackShowInfos.reverse();
          list[0].start = true;
          for (var i in list) {
            var one = list[i]
            var groupType = one.groupType;
            if (groupType != '0') {
              var arr = tmp[groupType] || []
              if (arr.length == 0) {
                one.start = true;
              }
              one.msgTime = formatTime(new Date(one.msgTime))
              arr.push(one);
              tmp[groupType] = arr
            }
          }
          var logisticsList = Array.prototype.concat.apply([], transfer2Array(tmp).arrValue)
          this.setData({
            logisticsList: logisticsList,
            operator: res.data.data.carrier,
            tel: res.data.data.tel,
            carryCode: res.data.data.carryCode,
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.message,
          })
        }
      },
      error: err => {
        wx.showModal({
          title: '提示',
          content: '网络错误，请重试',
        })
      }
    })
  }
})