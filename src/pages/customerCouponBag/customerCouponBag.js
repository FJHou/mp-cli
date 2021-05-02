// pages/customerCouponBag/customerCouponBag.js
import * as API from '../../utils/api-member.js' 
import { setFMInit, getMPQrCodeParams, setEmployeePinFromShopperAssistant } from '../../utils/JDH-pharmacy/index'
const app = getApp() 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    couponList: [],
    minHeight: 0,
    canGetCoupon: false,
    canToUse: true,
    showPage: false,
    userName: '',
    brandsName: '',
    options: {},
    hasPlaybillShare: false,
    isFirst: true,
    tktoken: '',
		platformCouponId: null,
		fromOpenId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options = {}) { 
		this.setData({
			fromOpenId: app.getOpenId() //app.getOpenId是个异步方法，用户点击右上角分享onShareAppMessage中不能使用异步，所以放到最开始加载
		});
    console.log(options);
    setEmployeePinFromShopperAssistant()
    this.resolveScene(options)
  },

  init() {
    API.checkLogin({
      pt_key: this.data.options.pt_key,
      success: () => {
        if (this.data.isFirst) {
          this.getJDUserInfo()
        }
        setFMInit(this)
        this.queryCouponBag()
      }
    })
  },

  async resolveScene(options) {
    if (options.scene) {
      try {
				const query = await getMPQrCodeParams(options); 
        if (query) { 
          this.setData({
            options: query,
					});  
					app.globalData.storeId = query.storeId 
          this.init()
				}
      } catch (err) {
        wx.showModal({
          content: `${err}`,
          showCancel: false
        })
      }
    } else {
      this.setData({
        options: options,
			}); 
			app.globalData.storeId = options.storeId 
      this.init()
    }
  },


  getJDUserInfo() {
    API.getJDInfo({
      success: res => {
        if (res.data.success) {
          this.setData({
            userName: res.data.data.userName
          })
        }
      }
    })
  },

  //计算高度
  calCouponHeight() {
    wx.getSystemInfo({
      success: res => {
        wx.createSelectorQuery().select('.cuscoupon-wrap').boundingClientRect(res2 => {
          this.setData({
            showPage: true,
            minHeight: res.windowHeight - res2.top - (140 + (!this.data.canGetCoupon ? 72 : 0)) * res.windowWidth / 750
          })
        }).exec()
      },
    })
  },

  //创建分享链并上报
  // createShareChain(opt){
  //   console.log('createShareChain',opt)
  //   API.createShareChain({
  //     bId: this.data.bId || '100000000000037',
  //     brandId: this.data.brandId || '246',
  //     type: 1,
  //     objectId: opt.couponBagId,
  //     success: res => {
  //       if(res.data.success){
  //         var reportData = {
  //           shareChainId: res.data.data,
  //           type: 1,
  //           level: 0
  //         }
  //         this.setData({
  //           options: Object.assign({},this.data.options,reportData)
  //         })
  //         this.reportData(reportData)
  //       }
  //     }
  //   })
  // },
  // 上报
  reportData(opt) {
    console.log('reportData', opt)
    API.saleReportData({
      shareChainId: opt.shareChainId,
      fromPin: opt.fromPin || '',
      fromOpenId: opt.fromOpenId || '',
      type: opt.type,
      level: opt.level
    })
  },
  //检查是否有分享链
  checkShareChain() {
    //判断是不是从导购小程序进入
    if (this.data.options.pt_key) {

      let reportData = {
        shareChainId: this.data.options.shareChainId,
        type: 2,
        level: 0
      }
      this.setData({
        hasPlaybillShare: this.data.options.route == 1 ? false : true,
        options: Object.assign({}, this.data.options, reportData)
      })
      this.reportData(reportData)
    } else {
      if (this.data.options.shareChainId) {
        this.reportData(this.data.options)
      }
    }
  },
  toUse(e) {
    if (!this.data.canToUse) {
      return;
    }
    this.data.canToUse = false;
    setTimeout(() => {
      this.setData({
        canToUse: true
      })
    }, 1000)
    var couponId = e.currentTarget.dataset.couponId;
    wx.navigateTo({
      url: `/pages/memberCode/memberCode?fromWxSign=false&couponIds=${couponId}&brandId=${this.data.brandId}&bId=${this.data.bId}`
    })
  },
  toLook(e) {
    if (!this.data.canToUse) {
      return;
    }
    this.data.canToUse = false;
    setTimeout(() => {
      this.setData({
        canToUse: true
      })
    }, 1000)
    let couponId = e.currentTarget.dataset.couponId;
    wx.navigateTo({
      url: `/pages/couponInfo/couponInfo?couponId=${couponId}`
    })
  },
  toDraw(e) {
    let userPin = wx.getStorageSync('jdlogin_pt_pin')
    let couponId = e.target.dataset.couponId;
    let storeId = this.data.options.storeId;
    console.log({
      pin: userPin,
      couponDrawParam: {
        storeId: storeId,
        couponId: couponId,
        token: this.data.tktoken
      }
    }, '领取平台券参数------')
    API.GWAjax({
      functionName: 'PullNewActivityService.drawPlatformCoupon',
      data: {
        pin: userPin,
        couponDrawParam: {
          storeId: storeId,
          couponId: couponId,
          token: this.data.tktoken
        }
      },
      success: res => {
        console.log(res.data, '领取平台券返回')
        if (res.data.code == 0 && res.data.data && res.data.data.success) {
          this.setData({
            platformCouponId: couponId
          })
          wx.showToast({
            icon: 'none',
            title: '领取成功',
            duration: 2000
          })
        } else if (res.data.code == 0 && res.data.data && res.data.data.code === "1009") {
          console.log(res.data.data.message, '领取平台券失败信息')
          wx.showToast({
            icon: 'none',
            title: '您已领取过新人券！',
            duration: 2000
          })
        } else if (res.data.code == 0 && res.data.data && res.data.data.code === "10022") {
          console.log(res.data.data.message, '领取平台券失败信息')
          wx.showToast({
            icon: 'none',
            title: '很抱歉，您已不是新用户啦！',
            duration: 2000
          })
        } else {
          console.log(res.data.data.message, '领取平台券失败信息')
          wx.showToast({
            icon: 'none',
            title: res.data.data.message || '很抱歉，没领到>_<',
            duration: 2000
          })
        }
        this.setData({
          isBok: false
        })
      },
      error: err => {
        wx.showToast({
          icon: 'none',
          title: '网络错误，请稍后再试',
          duration: 2000
        })
      }
    })
  },

  //获取优惠券可用门店
  getCouponAddress(storeId) {
    API.GWAjax({
      functionName: 'StoreExportService.queryStoreInfoByStoreId',
      data: {
        storeId: storeId
      },
      success: res => {
        res = res.data
        if (res.code == 0 && res.data && res.data.success) {
          this.setData({
            storeName: res.data.data.storeName,
            brandId: res.data.data.brandId,
            bId: res.data.data.bizId
          })
          this.data.isFirst = false
          if (!this.data.options.fromPage) {
            this.checkShareChain()
          }
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.message,
          })
        }
      },
      error: err => {
        console.log(err)
        wx.showModal({
          title: '提示',
          content: '网络错误，请重试',
        })
      }
    })
  },

  // 查券包
  queryCouponBag() {
    if (!!this.data.options.storeId) {
      API.GWAjax({
        functionName: 'ShareFacadeExportService.findCouponListByBagIdAndStoreId',
        data: {
          couponBagId: this.data.options.couponBagId,
          storeId: this.data.options.storeId
        },
        success: res => {
          res = res.data
          if (res.code == 0 && res.data && res.data.success) {
            let couponList = res.data.data;
            let data = []
            let canGetCoupon = false

            for (let i = 0; i < res.data.data.length; i++) {
              data[i] = {}
              data[i].selected = false
              data[i].brandsLogo = couponList[i].brandsLogo
              data[i].couponId = couponList[i].couponId
              data[i].brandsName = couponList[i].brandsName
              data[i].couponType = couponList[i].couponType
              data[i].endExtDate = couponList[i].endExtDate
              data[i].quota = couponList[i].quota
              data[i].couponAmount = couponList[i].couponAmount
              data[i].allStore = couponList[i].allStore
              data[i].storeId = couponList[i].storeId
              data[i].showUse = couponList[i].status != 0
              data[i].status = couponList[i].status
              data[i].bid = couponList[i].bid
              data[i].brandId = couponList[i].brandsId
              if (!data[i].showUse) {
                canGetCoupon = true
              }
            }
            this.setData({
              couponList: data,
              canGetCoupon: canGetCoupon,
              brandsName: data[0].brandsName,
              storeId: data[0].storeId
            })
            if (this.data.isFirst) {
              this.calCouponHeight()
              this.getCouponAddress(data[0].storeId)
            }
            if (this.data.options.plant == '1') {
              let self = this
              fm.getEid(function (res) {
                console.log(res, 'tk------------------------------------');
                self.setData({
                  tktoken: res.tk
                })
              })
            }
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.message || '网络错误，请重试',
            })
          }
        },
        error: err => {
          console.log(err)
          wx.showModal({
            title: '提示',
            content: '网络错误，请重试',
          })
        }
      })
    } else {
      API.GWAjax({
        functionName: 'ShareFacadeExportService.findCouponListByBagId',
        data: {
          couponBagId: this.data.options.couponBagId
        },
        success: res => {
          res = res.data
          if (res.code == 0 && res.data && res.data.success) {
            let couponList = res.data.data;
            let data = []
            let canGetCoupon = false

            for (let i = 0; i < res.data.data.length; i++) {
              data[i] = {}
              data[i].selected = false
              data[i].brandsLogo = couponList[i].brandsLogo
              data[i].couponId = couponList[i].couponId
              data[i].brandsName = couponList[i].brandsName
              data[i].couponType = couponList[i].couponType
              data[i].endExtDate = couponList[i].endExtDate
              data[i].quota = couponList[i].quota
              data[i].couponAmount = couponList[i].couponAmount
              data[i].allStore = couponList[i].allStore
              data[i].storeId = couponList[i].storeId
              data[i].showUse = couponList[i].status != 0
              data[i].status = couponList[i].status
              data[i].bid = couponList[i].bid
              data[i].brandId = couponList[i].brandsId
              if (!data[i].showUse) {
                canGetCoupon = true
              }
            }
            this.setData({
              couponList: data,
              canGetCoupon: canGetCoupon,
              brandsName: data[0].brandsName,
              storeId: data[0].storeId
            })
            if (this.data.isFirst) {
              this.calCouponHeight()
              this.getCouponAddress(data[0].storeId)
            }
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.message || '网络错误，请重试',
            })
          }
        },
        error: err => {
          console.log(err)
          wx.showModal({
            title: '提示',
            content: '网络错误，请重试',
          })
        }
      })
    }

  },

  //一键领取券包
  drawAllCoupon() {
    console.log('com.jd.shop.jpass.api.service.ShareFacadeExportService.batchDrawCouponByBagId')
    API.GWAjax({
      functionName: 'com.jd.shop.jpass.api.service.ShareFacadeExportService.batchDrawCouponByBagId',
      data: {
        storeId: this.data.storeId,
        couponBagId: this.data.options.couponBagId
      },
      success: res => {
        res = res.data
        console.log('券包领取', res)
        if (res.code == 0 && res.data && res.data.success) {
          // let fromPin = wx.getStorageSync('jdlogin_pt_pin')
          // let fromOpenId = wx.getStorageSync('sessionId')
          // TODO:跳转门店页
          // wx.redirectTo({
          //   url: `/pages/brand/brand?brandId=${this.data.brandId}&bId=${this.data.bId}&couponBagId=${this.data.options.couponBagId}&storeId=${this.data.storeId}&shareChainId=${this.data.options.shareChainId}&type=2&level=${this.data.options.level}&fromPin=${fromPin}&fromOpenId=${fromOpenId}&fromName=${this.data.options.employeeName || this.data.userName}`,
          // })
          wx.showToast({
            title: '领取成功',
            duration: 2000
          })
          this.setData({
            canGetCoupon: false
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.message,
          })
        }
      },
      error: err => {
        console.log(err)
        wx.showModal({
          title: '提示',
          content: '网络错误，请重试',
        })
      }
    })

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let fromPin = wx.getStorageSync('jdlogin_pt_pin')
    let fromOpenId = this.data.fromOpenId;
    this.reportData({
      shareChainId: this.data.options.shareChainId,
      fromPin: fromPin,
      fromOpenId: fromOpenId,
      type: 1,
      level: Number(this.data.options.level) + 1
    })
    console.log('onShareAppMessage', `/pages/customerCouponBag/customerCouponBag?couponBagId=${this.data.options.couponBagId}&shareChainId=${this.data.options.shareChainId}&type=${this.data.options.type}&level=${Number(this.data.options.level) + 1}&fromPin=${fromPin}&fromOpenId=${fromOpenId}&fromName=${this.data.userName}&storeId=${this.data.options.storeId}`)
    return {
      title: `【${this.data.options.employeeName || this.data.userName}】分享给您“${this.data.brandsName}”的专属礼包`,
      imageUrl: 'https://thunder.jd.com/jpass/img/share_coupon.png',
      path: `/pages/customerCouponBag/customerCouponBag?couponBagId=${this.data.options.couponBagId}&shareChainId=${this.data.options.shareChainId}&type=2&level=${Number(this.data.options.level) + 1}&fromPin=${fromPin}&fromOpenId=${fromOpenId}&fromName=${this.data.options.employeeName || this.data.userName}&storeId=${this.data.options.storeId}`
    }
  }
})