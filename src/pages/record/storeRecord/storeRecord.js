// pages/storeRecord/storeRecord.js
//skz
import * as API from '../../../utils/api-member.js'
//const utils = require('../../../utils/util.js')
import { formatTime } from "../../../utils/util.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    refundDetails: [],
    flows: [],
    progress: '',
    orderId: '',
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
    API.GWAjax({
      functionName: 'OrderExportService.cancelDetail',
      data: {
        orderId: options.orderId
      },
      success: res => {
        res = res.data
        if (res.code == 0 && res.data && res.data.success) {
          let flows = res.data.data.flows.reverse()
          for (let i = 0; i < flows.length; i++) {
            flows[i].operatorTime = formatTime(new Date(flows[i].operatorTime))
          }
          let progress
          if (res.data.data.cancelFlag) {
            switch (res.data.data.cancelCode) {
              case 10:
                progress = '提交申请中'
                break;
              case 20:
                progress = '取消处理中'
                break;
              case 30:
                progress = '退款处理中'
                break;
              case 40:
                progress = '已取消'
                break;
            }
          } else {
            progress = '取消失败'
          }
          this.setData({
            progress: progress,
            flows: flows,
            orderId: res.data.data.orderId,
            refundDetails: res.data.data.refundDetails
          })
        }
      }
    })
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

  }
})