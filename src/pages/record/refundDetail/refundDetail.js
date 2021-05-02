// pages/refundDetail/refundDetail.js
//skz
import * as API from '../../../utils/api-member.js' 
import { formatTime } from "../../../utils/util.js"; 

Page({ 
  data: {
    list: [],
    returnIcon: true
  }, 
  onLoad: function (options) {
    var self = this;
    let pagesList = getCurrentPages()
    console.log(pagesList)
    if (pagesList.length <= 1) {
      this.setData({
        returnIcon: false
      })
    }
    if (options.orderId) {
      wx.setStorageSync('orderId', options.orderId);
    } 
    API.GWAjax({
      functionName: 'OrderExportService.getJPassAfsRefundInfo',
      data: {
        orderId: options.orderId
      },
      success: res => {
        res = res.data
        if (res.code == 0 && res.data && res.data.success) {
          var result = res.data.data.result;
          for (var i = 0; i < result.length; i++) {
            result[i].created = formatTime(new Date(result[i].created), 3);
            result[i].refundAmount = result[i].refundAmount.toFixed(2);
          }
          self.setData({
            list: result
          })
        }
      }
    })
  },

})