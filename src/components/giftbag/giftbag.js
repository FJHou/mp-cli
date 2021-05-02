// pages/components/giftbag/giftbag.js
import * as API from '../../utils/api-member.js'
// import * as log from '../../utils/weixinAppReport.js').init(
// const log = require('../../utils/weixinAppReport.js').init()
//const util = require('../../utils/util.js')
import { formatTime } from "../../utils/util.js";

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    fromtype: String,
    list: Array,
    activitytype: Number,
    activityid: Number,
    brandid: Number,
    bid: Number,
    brandsid: Number
  },

  /**
   * 组件的初始数据
   */
  data: {
    priceSize: "90rpx;"
  },

  ready() {
    var self = this;
    for (var i = 0; i < this.data.list.length; i++) {
      this.data.list[i].price = this.data.list[i].price / 100;
      this.data.list[i].useCondition = this.data.list[i].useCondition / 100;
      this.data.list[i].startTime = formatTime(new Date(this.data.list[i].startTime), 2);
      this.data.list[i].endTime = formatTime(new Date(this.data.list[i].endTime), 2);
      var price = this.data.list[i].price.toString()
      price = price.replace('.', '');
      switch (price.length) {
        case 3:
          this.data.list[i].priceSize = 28;
          break;
        case 4:
          this.data.list[i].priceSize = 20;
          break;
        case 5:
          this.data.list[i].priceSize = 17;
          break;
        case 6:
          this.data.list[i].priceSize = 14;
          break;
        default:
          this.data.list[i].priceSize = 45;
          break;
      }

    }

    this.setData({
      couponList: this.data.list
    }, function (res) {
      // console.log(res)
      // var query = self.createSelectorQuery();
      //选择id
      // (function recursion(i) {
      //   query.selectAll('.gf-mon').boundingClientRect(function (rects) {
      //     console.log(i,rects[i]);
      //     if (rects[i].width > 54 || rects[i].height > 63) {
      //       if (self.data.couponList[i].priceSize < 30){
      //         if (rects.length <= ++i) {
      //           return;
      //         }
      //         recursion(i);
      //       }
      //       var up = "couponList[" + i + "].priceSize"
      //       self.setData({
      //         [up]: self.data.couponList[i].priceSize - 1
      //       }, function () {
      //         console.log(i)
      //         recursion(i)
      //       })
      //     }else{
      //       if(rects.length <= ++i ){
      //         return;
      //       }
      //       recursion(i);
      //     }
      //   }).exec()
      // })(0)
    })


  },

  /**
   * 组件的方法列表
   */
  methods: {
    closegift(e) {
      var self = this;
      if (this.data.activityid == 1) {
        // log.click({
        //   "eid": 'coupon_pack_close',
        //   "eparam": this.data.brandId || this.data.brandsId,
        //   "event": e
        // })
      } else {
        // log.click({
        //   "eid": 'memberday_pack_close',
        //   "eparam": this.data.brandId || this.data.brandsId,
        //   "event": e
        // })
      }
      var pages = getCurrentPages();
      var currentPage = pages[pages.length - 1].route;
      if (currentPage != 'pages/cardInfo/cardInfo') {
        if (this.data.fromtype == "scane") {
          wx.redirectTo({
            url: '/pages/brandshop/brandshop?storeId=' + wx.getStorageSync('storeId')
          })
        } else {
          wx.navigateBack();
        }
      } else {
        self.triggerEvent('closegift', { draw: false, activitytype: this.data.activitytype }, {});
      }
    },
    drawgift(e) {
      var self = this;
      if (this.data.activityid == 1) {
        // log.click({
        //   "eid": 'memberday_pack_receive',
        //   "eparam": this.data.brandId || this.data.brandsId,
        //   "event": e
        // })
      } else {
        // log.click({
        //   "eid": 'coupon_pack_receive',
        //   "eparam": this.data.brandId || this.data.brandsId,
        //   "event": e
        // })
      }
      var obj = {
        activityId: this.data.activityid,
        activityType: this.data.activitytype
      }
      if (self.data.brandsid) {
        obj.brandsId = self.data.brandsid

      } else {
        obj.brandId = self.data.brandid;
        obj.bId = self.data.bid;
        // log.click({
        //   "eid": e.currentTarget.dataset.eid,
        //   "eparam": this.data.brandId || this.data.brandsId,
        //   "event": e
        // })
      }
      API.GWAjax({
        functionName: 'OpenCardActivityExportService.receive',
        data: obj,
        success: res => {
          res = res.data
          if (res.code == 0 && res.data && res.data.success) {
            wx.showToast({
              title: '领取成功',
              icon: 'success',
              complete: function () {
                setTimeout(function () {
                  if (self.data.fromtype == "scane") {
                    wx.redirectTo({
                      url: '/pages/brandshop/brandshop?storeId=' + wx.getStorageSync('storeId')
                    })
                  } else {
                    var pages = getCurrentPages();
                    var currentPage = pages[pages.length - 1].route;
                    if (currentPage != 'pages/cardInfo/cardInfo') {
                      wx.redirectTo({
                        url: '/pages/cardInfo/cardInfo?brandId=' + wx.getStorageSync('brandId') + '&bId=' + wx.getStorageSync('bId')
                      })
                    } else {

                      self.triggerEvent('closegift', { draw: true, activitytype: self.data.activitytype }, {});
                    }

                  }
                }, 1500);
              }
            })
          } else {
            wx.showToast({
              title: '您来晚了，券已抢光',
              icon: "none",
              complete: function () {
                setTimeout(function () {
                  var pages = getCurrentPages();
                  var currentPage = pages[pages.length - 1].route;
                  if (currentPage != 'pages/cardInfo/cardInfo') {
                    if (self.data.fromtype == "scane") {
                      wx.redirectTo({
                        url: '/pages/brandshop/brandshop?storeId=' + wx.getStorageSync('storeId')
                      })
                    } else {
                      wx.navigateBack();
                    }
                  } else {
                    self.triggerEvent('closegift', { draw: false, activitytype: self.data.activitytype }, {});
                  }
                }, 1500)

              }
            })
          }
        }
      })
    }
  }
})
