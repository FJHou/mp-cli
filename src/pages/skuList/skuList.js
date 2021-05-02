//skz
//获取应用实例
import * as API from '../../utils/api-member.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    availableSkuList: [],//缓存信息做分页处理
    list: [],//sku信息
    pageNo: 1,//当前页
    pageSize: 10,//请求页大小
    isExist: true,//是否存在商品
    loadstate: 1,     //加载状态
    totalCount: 0,
    couponId: '',
    rule: '',
    value: '',
    returnIcon: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      couponId: options.couponId,
      bId: options.bId,
      rule: options.rule,
      value: options.value,
    });
    this.load();
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.loadstate == 1) {
      return;
    }
    this.load()

  },
  // 下拉刷新数据
  load: function () {
    var self = this
    API.GWAjax({
      functionName: 'CouponExportService.getAvailableSkuByCouponIdAndBid',
      data: {
        'couponId': self.data.couponId,
        'bId': self.data.bId,
        'pageSize': 10,
        'pageNo': self.data.pageNo++
      },
      success: res => {
        res = res.data
        if (res.code == 0 && res.data && res.data.data && res.data.data.totalCount == 0) {
          self.setData({
            isExist: false
          })
        } else {
          var data = res.data.data;
          if (res.data && data != null) {
            var list = data.items;
            for (var index in list) {
              var imageStr = list[index].imageUrl;
              var imageUrl = imageStr.split(",")[0];
              list[index].imageUrl = imageUrl;
            }
            var currentPage = self.data.pageNo - 1;
            self.setData({
              list: self.data.list.concat(list),
              isExist: true,
              loadstate: data.totalCount / data.pageSize < currentPage ? 1 : 0,
            });
          } else {
            self.setData({
              loadstate: 1,
            });
          }
        }
      }
    })
  }
})