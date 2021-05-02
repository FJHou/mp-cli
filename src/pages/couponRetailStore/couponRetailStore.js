// pages/couponRetailStore/couponRetailStore.js
//skz
//获取应用实例
//const util = require('../../utils/util.js')
import { isBlank } from "../../utils/util.js";
import * as API from '../../utils/api-member.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    localRetailStoreList: [],//缓存信息做分页处理
    list: [],//门店信息
    pageSize: 15,//请求页大小
    pageIndex: 0, //当前页
    isExist: true,//是否存在门店
    loadstate: 0,
    totalCount: 0,
    totalPage: 0,
    couponId: '',
    params: {},
    showReturnTop: false,
    returnIcon: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    let pagesList = getCurrentPages()
    console.log(pagesList)
    if (pagesList.length <= 1) {
      this.setData({
        returnIcon: false
      })
    }
    console.log('activityStoreList', options)
    var params = {
      isSameCity: 0,
      pageIndex: that.data.pageIndex,
      pageSize: that.data.pageSize,
    }
    if (options.couponId) {
      params.couponId = options.couponId
    } else if (options.bookingId) {
      params.bookingId = options.bookingId
    }
    console.log("options", options)
    params.bId = options.bId;
    params.brandId = options.brandId;
    API.getLocation({
      success: function (res) {
        params.longitude = res.longitude
        params.latitude = res.latitude
        that.setData({
          params: params
        })
        that.load();
      },
      fail: err => {
        that.setData({
          params: params
        })
        that.load();
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.load()

  },
  // 下拉刷新数据
  load: function () {
    var that = this;
    //  var couponId = 5970;
    var couponId = that.data.couponId;
    console.log("getAvailableStoresByCouponIdAndXY", this.data.params)
    if (that.data.isExist && (that.data.loadstate == 0)) {
      this.data.params.pageIndex++

      API.GWAjax({
        functionName: 'StoreExportService.getAvailableStoresByCouponIdAndXY',
        data: {
          param: this.data.params
        },
        success: res => {
          res = res.data
          if (res.code == 0 && res.data && res.data.success) {
            res = res.data
            var data = res.data;
            if (data && data.totalItem == 0) {
              that.setData({
                isExist: false
              });
            } else {
              if (data && data.data != null && data.data.length > 0) {
                that.setData({
                  list: that.data.list.concat(data.data),
                  isExist: true,
                  totalCount: data.totalItem,
                  totalPage: data.totalPage,
                });
                that.setData({
                  loadstate: that.data.params.pageIndex < that.data.totalPage ? 0 : 1,
                });
              } else {
                that.setData({
                  loadstate: that.data.params.pageIndex < that.data.totalPage ? 0 : 1,
                });
                if (that.data.loadstate == 0) {
                  that.load();
                }
              }
              if ((that.data.list.length < that.data.totalCount) && (that.data.list.length < that.data.pageSize)) {
                that.load();
              }
            }
          } else {
            that.setData({
              loadstate: 1
            });
          }
        }
      })
    }

  },
  onPageScroll(e) {
    var flag = false
    if (e.scrollTop > 600) {
      flag = true
    }
    this.setData({
      showReturnTop: flag
    })
  },
  // 拨打电话
  callPhone: function (event) {
    var that = this;
    var phone = event.currentTarget.dataset.callPhone;
    if (isBlank(phone)) {
      wx.showToast({
        title: '暂无可用电话!',
        icon: 'loading',
        duration: 1500
      })
    } else {
      wx.makePhoneCall({
        phoneNumber: phone,
      })
    }
  },
  openMap(e) {
    var longitude = e.currentTarget.dataset.longitude;
    var latitude = e.currentTarget.dataset.latitude;
    wx.openLocation({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      name: e.currentTarget.dataset.storeName,
      address: e.currentTarget.dataset.storeAddress
    })
  }
})