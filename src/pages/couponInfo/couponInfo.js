// pages/couponInfo/couponInfo.js
//skz
// const log = require('../../utils/weixinAppReport.js').init()
import * as API from '../../utils/api-member.js'
//const util = require('../../utils/util.js')
import { formatTime, buildUrl } from "../../utils/util.js";
const plugin = requirePlugin("loginPlugin");
const APP = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    retailStoreList: [], //门店信息缓存到本地
    count: 0,
    name: "暂无卡券信息",
    imgUrl: "", //logo
    value: "0",
    time: "",
    rule: "",
    notice: "", //使用须知
    coverIntroduce: "", //封面介绍
    allStore: "0",
    storeId: '',
    hiddenStores: false,
    isFirstUse: true,
    canToDraw: true,
    couponType: 0, //券种类
    skuCount: 0,
    avaliabelSKUList: [],
    perCoupon: 1,
    returnIcon: true,
    couponDialogShow: false,
    dialogCouponList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let pagesList = getCurrentPages()
    if (pagesList.length <= 1) {
      this.setData({
        returnIcon: false
      })
    }
    // log.set({
    //   urlParam: options,
    //   siteId: 'JA2018_5111046',
    //   account: plugin.getPtKey(),
    //   pparam: options.couponId,
    //   pageId: 'Coupon_information'
    // })
    this.setData({
      couponId: options.couponId,
      options: options
    })
    var self = this;
    if (plugin.getPtKey()) {
      wx.setStorageSync('jdlogin_pt_key', plugin.getPtKey())
			// 获取到openId
			let openId = await APP.getOpenId()
      if (openId) {
        self.initInfo(options.couponId)
      } else {
        API.getSessionId(function (res) {
          if (res.data.success) {
            self.initInfo(options.couponId)
          }
        })
      }
    } else {
      //老登陆
      wx.removeStorageSync('sessionId');
      wx.removeStorageSync('userInfo');
      wx.removeStorageSync('jdUserInfo');
      wx.removeStorageSync('jdlogin_pt_key');
      wx.removeStorageSync('jdlogin_pt_pin');
      wx.removeStorageSync('jdlogin_pt_token');
      //插件登陆
      var str = "?";
      for (var item in options) {
        str = str + item + "=" + options[item] + "&"
      }
      str = str.substr(0, str.length - 1)
      var returnPage = '/pages/couponInfo/couponInfo' + encodeURIComponent(str);
      API.login('', returnPage)
    }

  },

  initInfo(couponId) {
    var self = this
    self.setData({
      hiddenSds: false,
      hiddenCds: false
    })
    self.getCouponInfo(couponId)
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
    var self = this
    // log.pv({
    //   pname: 'Coupon_information',
    //   pparam: this.data.couponId
    // });
    // 先锁定
    self.setData({
      isFirstUse: true
    });
    if (wx.getStorageSync('ktAfterToDraw')) {
      var couponMsg = wx.getStorageSync('toDrawCoupon')
      if (couponMsg) {
        console.log('进行领券操作', couponMsg)
        API.drawCoupon({
          couponMsg: couponMsg,
          success: res => {
            console.log('领券结果', res)
            if (couponMsg.cooperationType && couponMsg.cooperationType == 1) {
              self.judgeAndDrawNewCoupon()
            }
            wx.setStorageSync('ktAfterToDraw', false)
            wx.removeStorageSync('toDrawCoupon')
            self.onLoad(couponMsg)
          },
          error: err => {
            wx.showToast({
              title: '领取失败',
              icon: 'none',
              duration: 2000
            })
          }
        })
      } else {
        wx.setStorageSync('ktAfterToDraw', false)
        wx.removeStorageSync('toDrawCoupon')
        self.onLoad(couponMsg)
      }
    }
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
  // 进入门店
  goRetail: function (e) {
    // log.click({
    //   "eid": "Coupon_information_StoreLook",
    //   "event": e //必填，点击事件event
    // })
    if (!this.data.hiddenSds) {
      wx.navigateTo({
        url: "/pages/couponRetailStore/couponRetailStore?couponId=" + this.data.couponId + '&brandId=' + this.data.brandId + '&bId=' + this.data.bId
      });
    }
  },
  // 进入可用商品信息列表
  goSKU: function (e) {
    if (!this.data.hiddenSds) {
      //   log.click({
      //     "eid": 'Coupon_information_CouponLook',
      //     "eparam": this.data.couponId,
      //     "event": e
      //   })
      wx.navigateTo({
        url: "/pages/skuList/skuList?couponId=" + this.data.couponId + "&bId=" + this.data.bId + "&rule=" + this.data.rule + "&value=" + this.data.value
      })
    }
  },

  // 使用
  use: function (e) {
    if (this.data.isFirstUse) {
      // 先锁定
      this.setData({
        isFirstUse: false
      });
      //   log.click({
      //     "eid": 'Coupon_information_CouponUse',
      //     "eparam": this.data.couponId,
      //     "event": e
      //   }) 
      // 跳转到会员码界面
      wx.navigateTo({
        url: `/pages/memberCode/memberCode?fromWxSign=false&couponIds=${this.data.couponId}&brandId=${this.data.brandId}&bId=${this.data.bId}`
      })
    }
  },
  // 领取
  receive: function () {
    var self = this
    if (!self.data.canToDraw) {
      return;
    }
    self.data.canToDraw = false;
    setTimeout(function () {
      self.setData({
        canToDraw: true
      })
    }, 1000)
    console.log(self.data.storeId, self.data.couponId);

    if (self.data.storeId && self.data.couponId) {
      API.GWAjax({
        functionName: `${self.data.perCoupon == 1 ? 'com.jd.shop.jpass.api.coupon.CouponExportService.collectCoupon' : 'com.jd.shop.jpass.api.coupon.CouponExportService.collectAllCoupon'}`,
        data: {
          couponDrawParam: {
            couponId: self.data.couponId.toString(),
            storeId: self.data.storeId.toString(),
            brandId: Number(self.data.brandId),
            bId: Number(self.data.bId)
          }
        },
        success: res => {
          res = res.data
          if (res.code == 0 && res.data && res.data.success) {
            var title = self.data.perCoupon == 1 ? '领取成功' : res.data.data == self.data.perCoupon ? '领取成功' : `成功领取${res.data.data}张`
            if (self.data.cooperationType && self.data.cooperationType == "1") {
              //判断套餐为A且是新人收购且配置有优惠券且可领
              self.judgeAndDrawNewCoupon(title)

            } else {

              wx.showToast({
                title: title,
                icon: 'success',
                duration: 2000
              })
            }
            if (new Date().getTime() < self.data.startDate) {
              //未开始 - 去看看
              self.data.viewStatus = 0
              self.data.couponPutNumText = "去看看"
            } else {
              //已开始 - 立即使用
              self.data.viewStatus = 1
              self.data.couponPutNumText = "立即使用"
            }

            self.setData({
              isUsed: false,
              couponPutNum: 1,
              viewStatus: self.data.viewStatus,
              couponPutNumText: self.data.couponPutNumText
            })
          } else {
            if (res.data.code == "IS_NOT_MEMBER") {
              wx.setStorage({
                key: 'ktAfterToDraw',
                data: false,
              })
              wx.setStorage({
                key: 'toDrawCoupon',
                data: {
                  couponId: self.data.couponId.toString(),
                  storeId: self.data.storeId.toString(),
                  brandId: Number(self.data.brandId),
                  bId: Number(self.data.bId),
                  cooperationType: self.data.cooperationType
                },
              })
              const url = buildUrl({
                url: '/pages/addVip/addVip',
                query: {
                  brandId: self.data.brandId,
                  bId: self.data.bId,
                  channel: '213',
                  storeId: self.data.storeId
                }
              })
              wx.navigateTo({
                url
              })
            } else {
              wx.showToast({
                title: '领取失败',
                icon: 'none',
                duration: 2000
              })
            }
          }
        },
        error: err => {
          wx.showToast({
            title: '领取失败',
            icon: 'none',
            duration: 2000
          })
        }
      })
    } else {
      wx.showToast({
        title: '领取失败',
        icon: 'none',
        duration: 2000
      })
    }
  },
  getCouponInfo(couponId) {
    var self = this
    API.GWAjax({
      functionName: 'CouponExportService.getBrandsCouponByCouponId',
      data: {
        couponId: couponId
      },
      success: res => {
        console.log('优惠券信息', res)
        res = res.data
        if (res.code == 0 && res.data && res.data.success) {
          var params = res.data.data;
          params.endExtDate = params.endExtDate.replace("~", "至");
          var viewStatus = 0
          var couponPutNumText = ''
          if (params.couponPutNum == 0) {
            couponPutNumText = '立即领取'
          } else if (params.couponPutNum > 0) {
            if (new Date().getTime() < params.startDate) {
              //未开始 - 去看看
              viewStatus = 0
              couponPutNumText = "去看看"
            } else {
              //已开始 - 立即使用
              viewStatus = 1
              couponPutNumText = "立即使用"
            }
          }
          self.setData({
            brandId: params.brandsId,
            bId: params.bid,
            name: params.couponName,
            storeId: params.storeId || self.options.storeId || '',
            couponPutNum: params.couponPutNum,
            needJoinBrand: params.needJoinBrand,
            imgUrl: "https:" + params.brandsLogo,
            value: params.couponAmount / 100,
            time: formatTime(new Date(params.endPutDate), 2),
            rule: params.quota / 100,
            notice: params.notice,
            coverIntroduce: params.coverIntroduce,
            allStore: params.allStore,
            couponType: params.couponType,
            endExtDate: params.endExtDate,
            startDate: params.startDate,
            viewStatus: viewStatus,
            perCoupon: params.perCoupon,
            coupon: params,
            cooperationType: params.cooperationType
          });
        }
      },
      error: err => {
        wx.showModal({
          title: '提示',
          content: '优惠券信息加载失败',
          cancelText: '返回',
          confirmText: '重试',
          success: function (res) {
            if (res.confirm) {
              self.getCouponInfo(couponId)
            } else {
              wx.navigateBack({
                delta: 1
              })
            }
          },
          fail: function (res) {
            wx.navigateBack({
              delta: 1
            })
          }
        })
      }
    })
  },

  judgeAndDrawNewCoupon(title) {
    API.GWAjax({
      functionName: 'CouponExportService.getBatchIdList',
      success: res => {
        console.log('获取批次信息', res)
        res = res.data
        if (res.code == 0 && res.data && res.data.success) {
          let batchId = res.data.data[0]
          API.GWAjax({
            functionName: 'NewUserActivityExportService.checkPermissionAndGetBatchInfo',
            data: {
              couponInfoParam: {
                batchId: batchId
              },
              newUserParam: {
                channel: 'jpass_applet'
              }
            },
            success: res => {
              console.log('是否符合规则', res)
              res = res.data
              if (res.code == 0 && res.data && res.data.success) {
                var dialogCoupon = {
                  batchId: res.data.data.batchId,
                  name: res.data.data.couponTitle,
                  value: res.data.data.discount,
                  rule: res.data.data.quota,
                  startDate: formatTime(new Date(res.data.data.beginTime), 2),
                  endDate: formatTime(new Date(res.data.data.endTime), 2),
                }
                this.setData({
                  couponDialogShow: true,
                  dialogCouponList: [dialogCoupon]
                })
              } else {
                if (title) {
                  wx.showToast({
                    title: title,
                    icon: 'success',
                    duration: 2000
                  })
                }

              }
            },
            fail: res => {
              if (title) {
                wx.showToast({
                  title: title,
                  icon: 'success',
                  duration: 2000
                })
              }
            }
          })
        } else {
          if (title) {
            wx.showToast({
              title: title,
              icon: 'success',
              duration: 2000
            })
          }
        }
      },
      fail: res => {
        if (title) {
          wx.showToast({
            title: title,
            icon: 'success',
            duration: 2000
          })
        }
      }
    })
  },
  toBrand(e) {
    console.log(this.data.brandId, 'this.data.brandId')
    if (this.data.brandId == '0') {
      return;
    }
    wx.navigateTo({
      url: '/pages/brand/brand?brandId=' + this.data.brandId + '&bId=' + this.data.bId,
    })
  },
  closeDialog() {
    this.setData({
      couponDialogShow: false
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //   autoClick: log.autoClick
})