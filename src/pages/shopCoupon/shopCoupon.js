
import { setFMInit } from '../../utils/JDH-pharmacy/index';
import { getYjsCouponDataReq, getShopCouponReq, queryStoreDetailReq } from '../../api/index.js';
let app = getApp();

Page({
  data: {
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,
    currentLabTab: 0,
    swiperHeight: 0,
    // nextRowKey: ["", "", ""],
    // noMore: [false, false, false],
    // notUseCouponList: [],
    // alUseCouponList: [],
    // expCouponList: [],
    // canToUse: true,
    // returnIcon: true, 
    supportDs: true,//是否支持药急送
    venderId: '',//药急送venderID
    storeId: '',//门店storeID
    YJSStoreId: '',//药急送storeID
    storeInfo: {},//门店信息
    YjsCouponLists: [],//药急送优惠券数据
    JpassCouponLists: []//到店优惠券数据
  },
  onLoad: function (options) {
    let supportDs = options.supportDs == 'false' ? false : true;
    this.setData({
      venderId: options.yjsVenderId,
      storeId: options.storeId,
      YJSStoreId: options.yjsStoreId,
      supportDs: supportDs
    })

    var self = this;
    wx.getSystemInfo({
      success: function (res) {
        self.setData({
          swiperHeight: res.windowHeight - 260 * res.windowWidth / 750
        })
      }
    });
    app.toShareUrl(options, this)//  分享登陆态跳转页面分享的特殊处理

    setFMInit(this);//初始化指纹参数

    this.queryStoreDetail();//获取门店信息
    this.getYjsCouponData();//获取药急送券
    this.getShopCoupon();//获取到店券

  },
  onShow: function () {

  },
  /**
     * 用户点击右上角分享
     */
  onShareAppMessage() {
    this.setData({
      onShare: true
    })
    let { venderId, storeId, YJSStoreId, supportDs } = this.data;
    let path = `/pages/shopCoupon/shopCoupon?storeId=${storeId}&yjsStoreId=${YJSStoreId}&yjsVenderId=${venderId}&supportDs=${supportDs}`
    let shareObj = {
      title: `京东大药房邀您领大额优惠券啦`,
      imageUrl: this.data.storeInfo.storePic,
      path
    }
    return shareObj
  },
  /** 
     * 滑动切换tab 
     */
  bindChange: function (e) {
    if (e.detail.source == 'touch') {
      this.setData({ currentLabTab: e.detail.current, currentTab: e.detail.current });
      // this.getShopCoupon(e.detail.current);
    }
  },
  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {
    if (this.data.supportDs) {//支持药急送
      var that = this;
      if (that.data.currentTab == e.currentTarget.dataset.currentLab) {
        return false;
      } else {
        that.setData({
          currentTab: e.currentTarget.dataset.currentLab,
          currentLabTab: e.currentTarget.dataset.currentLab
        });
      }
    } else {//不支持药急送 
      return;
    }
  },
  getYjsCouponData() {
    var self = this;
    // 药急送优惠券接口
    getYjsCouponDataReq(self.data.YJSStoreId, self.data.venderId).then(res => {
			if(res.success){
				self.setData({
					YjsCouponLists: res.data||[]
				});
			} 
    }).catch(error => {
      utils.reportErr(encodeURIComponent(error.errMsg))
    });
  },
  getShopCoupon() {
    var self = this;
    getShopCouponReq(self.data.storeId, 999, 1).then(res => {
      if (res.data && res.data.items) {
        self.setData({
          JpassCouponLists: res.data.items
        });
      }
    })
  },
  // 门店详细信息。
  queryStoreDetail: function (options) {
    let self = this;
    queryStoreDetailReq(self.data.storeId).then(function (res) {
      if (res.code === '0000' && res.data) {
        self.setData({
          title: res.data.storeName
        })
        let storeInfo = {
          storeName: res.data.storeName,
          storeAddress: res.data.storeAddress,
          storePic: res.data.storePic,
          storeId: res.data.storeId,
          venderId: res.data.venderId
        }
        self.setData({
          storeInfo: storeInfo
        })

      }
    }).catch(error => {
      utils.reportErr(encodeURIComponent(error.errMsg))
    });
  },
	goStoreBtn(e) {//进店逛逛按钮 
		wx.setStorageSync("storeId",this.data.storeInfo.storeId)
		wx.setStorageSync("venderId",this.data.storeInfo.venderId) 
    wx.switchTab({
      url: `/pages/newShop/shopFront`
    });
  },
  scrollCheck() {
    //this.getShopCoupon(this.data.currentTab)
  }
})  