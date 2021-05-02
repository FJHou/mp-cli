//allCoupon.js

// 公用模块
//var utils = require('../../utils/util.js');
import { request, reportErr, globalLoginShow } from "../../utils/util.js";
// var log = require('../../utils/keplerReport.js').init();
// const messagePush = require('../../utils/message_push.js');
var app = getApp();

Page({
  data: {
    option: '',
    homedir: "/kwxhome",
    screenHeight: 0,
    pageNum: 1,
    unPageNum: 1,
    pageSize: 10,
    isHaveMore: true,
    isUnCounponHaveMore: true,
    couponList: [],
    unCouponList: [],
    totalCount: 0,
    use: true,
    unUse: false,
    isLoaded: true,    //判断数据是否加载完成
    noDataItem: {
      msg: '很遗憾，您暂无可以使用的优惠券'
    },
    noUnavailableItem: {
      msg: '您暂无不可以使用的优惠券'
    },
    returnpage: '/pages/coupon/allCoupon',
    toTopDisplay: 'none',
    scrollTop: 0,
    shopId: '',
    isShowButton: true, //统一控制是否显示去使用按钮
    showDiscountInfo: false,//控制折扣券的说明的显示隐藏
    currentCouponId: 0,
    pvFlag: true,
    couponUseList: {},
    couponTypeObj: {
      '0': {
        colorType: 'red',
      },
      '1': {
        colorType: 'blue',
      },
      '2': {
        colorType: 'green',
      },
      '3': {
        colorType: 'blue'
      }
    },
  },
  onLoad: function (options) {

    // 获取shopId
    var shopID = wx.getStorageSync("shopID");
    if (shopID) {
      this.setData({
        shopId: shopID + ''
      })
    }
    var that = this;
    that.data.option = options;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          screenHeight: res.windowHeight
        });
      }
    });
    // 初始化数据处理
    this.dataRequest();
    //埋点上报设置
    //加密key和openid都是异步获取 ，所以setLogPv封装成一个promise 来同步数据
    // setLogPv({
    //   urlParam: options, //onLoad事件传入的url参数对象
    //     title: '我的优惠券', //网页标题
    //     pageId: 'WDrugstore_MyCouponPage',
    //     pageTitleErro:'pages/coupon/allCoupon/我的优惠券'
    // }).then(function(data){
    //   that.logPvData = data
    //   app.log.set(data);
    //   if(that.data.pvFlag){
    //       that.data.pvFlag = false
    //       app.log.pv()
    //   }
    // })
  },
  onShow: function () {
    //this.data.pvFlag为true 上报pv
    // if(!this.data.pvFlag){
    //   app.log.set(this.logPvData);
    //   log.pv()
    // }
  },
  onUnload: function () {
    let that = this;
    that.reportExposure("WPersonal_MyCoupon_AvailableExpo", that.data.couponList.length)
    //上报留存时长，需要在页面的onUnload、onHide事件中调用log.pageUnload()方法可实现页面留存时长统计
    // log.pageUnload()
  },
  onHide: function () {
    //上报留存时长，需要在页面的onUnload、onHide事件中调用log.pageUnload()方法可实现页面留存时长统计
    // log.pageUnload()
  },
  //导航可用优惠券点击
  useClick: function (e) {
    if (this.data.isLoaded) {
      this.setData({
        use: true,
        unUse: false
      });
      // this.unionClick('WPersonal_MyCoupon_Available', '', '', '', e);
      let formId = e.detail.formId;
      // messagePush.messagePush({
      //   formId: formId,
      //   times: 1,
      //   type: 10110
      // })
      if (this.data.couponList.length == 0) {
        this.dataRequest('use', e);
      }
    }


  },
  //导航不可用优惠券点击
  unUseClick: function (e) {
    if (this.data.isLoaded) {
      this.setData({
        use: false,
        unUse: true
      });
      // this.unionClick('WPersonal_MyCoupon_Unavailable', '', '', '', e);
      let formId = e.detail.formId;
      // messagePush.messagePush({
      //   formId: formId,
      //   times: 1,
      //   type: 10110
      // })
      if (this.data.unCouponList == 0) {
        this.dataRequest('unUse', e);
      }
    }
  },
  goToUse(e) {
    if (e.currentTarget.dataset.jumptype != 0) {
      var homePath = app.globalData.idxPagePath;
      // app.log.click({
      //   eid: 'WDrugstore_MyCouponsToUse',
      //   event: e,
      //   pname: '我的优惠券',
      //   eparam: e.currentTarget.dataset.id, //券id
      //   target: homePath,
      // }) 
      if (homePath) {
        wx.switchTab({
          url: homePath
        })
      }
    }
    // let formId = e.detail.formId;
    // messagePush.messagePush({
    //   formId: formId,
    //   times: 1,
    //   type: 10111
    // })
  },
  // 下拉重新加载
  // onPullDownRefresh: function () {
  //   this.setData({
  //     pageNum: 1,
  //     couponList: []
  //   });
  //   this.dataRequest();
  // },
  dataRequest: function (flag, e) {
    var that = this;
    that.data.isLoaded = false;
    var URL = app.globalRequestUrl + that.data.homedir + '/wallet/couponList.json';
    // var URL = 'http://kwxhome.m.jd.com/wallet/couponList.json';
    var type = 1;
    var pageNum = that.data.pageNum;
    if (flag == 'unUse') {
      type = 0;
      pageNum = that.data.unPageNum;
      that.data.isUnCounponHaveMore = false;
    } else {
      that.data.isHaveMore = false;
    }
    if (pageNum == 1) {
      wx.showToast({
        title: '请稍后...',
        icon: 'loading',
        duration: 10000,
        mask: true
      });
    }
    request({
      url: URL,
      data: {
        page: pageNum,
        PAGESIZE: that.data.pageSize,
        type: type,
        shopIds: wx.getStorageSync('shopId') ? wx.getStorageSync('shopId') : ''
      },
      success: function (data) {
        if (pageNum == 1) {
          wx.hideToast();
        }
        that.dataInit(data, e);
      },
      fail: function (e) {
        that.data.isLoaded = true;
        reportErr("home coupons.json: " + e);
        wx.navigateTo({
          url: '/pages/error/error?thisBarTitle=网络错误'
        });
      }
    });
  },
  // 初始化数据的处理
  dataInit: function (data, e) {
    let that = this;
    if (typeof data == 'string') {
      that.data.isLoaded = true;
      reportErr("home coupons.json data err");
      return;
    }
    if (data.code == '999') {//登录拦截去判断没有登录
      this.loginModalShow();
      that.data.isLoaded = true;
      return false;
    }
    if (that.data.use) {
      var couponList = data.couponList
      couponList.forEach(function (val) {
        if (val.couponFaceDescription && val.extInfo && val.extInfo.descriptionHighLight) {
          val.couponFaceDescription = parseDescFunc(val.couponFaceDescription, val.extInfo.descriptionHighLight);
        }
      });
    }
    // 如果是可用优惠券
    if (that.data.use) {
      that.data.totalCount = data.totalCount;
      if (data.totalCount && data.couponList.length > 0) {
        that.data.couponList = that.data.couponList.concat(data.couponList);
        if (data.totalCount > that.data.couponList.length) {
          that.data.pageNum++;
          that.data.isHaveMore = true;
        } else {
          that.data.isHaveMore = false;
        }
      } else {
        that.data.isHaveMore = false;
      }
      // 屏蔽全球购优惠券去使用按钮
      if (that.data.couponList.length != 0) {
        for (var i = 0; i < that.data.couponList.length; i++) {
          if (that.data.couponList[i].scope != '' && (that.data.couponList[i].scope.indexOf("山姆会员") != -1 || that.data.couponList[i].scope.indexOf("用药") != -1 || that.data.couponList[i].scope.indexOf("OTC") != -1 || that.data.couponList[i].scope.indexOf("汽车票") != -1)) {
            that.data.couponList[i].jumpType = 0
          }
        }
      }
    } else {
      // 如果是不可用优惠券
      if (data.totalCount && data.couponList.length > 0) {
        that.data.unCouponList = that.data.unCouponList.concat(data.couponList);
        if (data.totalCount > that.data.unCouponList.length) {
          that.data.unPageNum++;
          that.data.isUnCounponHaveMore = true;
        } else {
          that.data.isUnCounponHaveMore = false;
        }
      } else {
        that.data.isUnCounponHaveMore = false;
      }
    }

    if (data.isShowButton != undefined) {
      that.setData({
        isShowButton: data.isShowButton
      })
    }
    //特殊处理便利购小程序
    let list = that.data.couponList.filter(item => {
      return item.jumpType == 1
    })
    //特殊处理便利购小程序 end

    that.setData({
      totalCount: that.data.totalCount,
      pageNum: that.data.pageNum,
      unPageNum: that.data.unPageNum,
      unCouponList: that.data.unCouponList,
      couponList: that.data.couponList,
      isHaveMore: that.data.isHaveMore,
      isUnCounponHaveMore: that.data.isUnCounponHaveMore
    })
    that.data.isLoaded = true;
  },
  //加载下一页
  loadMoreCoupons: function () {
    console.log('this.data.isUnCounponHaveMore=====', this.data.isUnCounponHaveMore)
    console.log('this.data.isHaveMore=====', this.data.isHaveMore)
    if (this.data.use) {
      if (this.data.isHaveMore) {
        this.dataRequest('use');
      }
    } else {
      if (this.data.isUnCounponHaveMore) {
        this.dataRequest('unUse');
      }
    }

  },
  couponShowInfo: function (e) {
    // 点击运费券说明icon埋点
    // log.click({
    //   "eid": "WPersonal_MyCoupon_Freight",
    //   "elevel": "",
    //   "eparam": "",
    //   "pname": "",
    //   "pparam": "",
    //   "pageId":'WPersonal_MyCoupon',
    //   "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
    //   "event": e //必填，点击事件event
    // });
    wx.showModal({
      title: '提示',
      content: '1、运费券仅可用于抵减京东自营商品订单运费,即用户下单结算时,可选择该优惠券按券面值（¥6）抵减每笔结算订单中的运费,运费券可叠加使用在同一个订单中,不设找零；2、虚拟商品及部分特殊购物流程不可用, 特殊流程如秒杀、夺宝岛等；3、运费券可与京券、东券、京东E卡、京豆同时使用',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          // log.click({
          //   "eid": "WPersonal_MyCoupon_FreightKnow",
          //   "elevel": "",
          //   "eparam": "",
          //   "pname": "",
          //   "pparam": "",
          //   "pageId":'WPersonal_MyCoupon',
          //   "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
          //   "event": e //必填，点击事件event
          // });
        }
      }
    })
  },
  //监听页面滑动距离，展示返顶按钮
  listScroll: function (e) {
    if (e.detail.scrollTop > this.data.screenHeight) {
      this.setData({
        toTopDisplay: "block"
      })
    } else {
      this.setData({
        toTopDisplay: "none"
      })
    }
  },
  //返顶按钮点击事件
  toTopTap: function (e) {
    var that = this;
    this.setData({
      toTopDisplay: "none",
      scrollTop: Math.random() * 0.001
    })
  },
  loginModalShow: function () {
    globalLoginShow(this);
  },
  // unionClick: function (eid, elevel, eparam, target, event) {
  //   log.click({
  //     "eid": eid,
  //     "elevel": elevel,
  //     "eparam": eparam,
  //     "pname": "",
  //     "pparam": "",
  //     "target": target, //选填，点击事件目标链接，凡是能取到链接的都要上报
  //     "event": event //必填，点击事件event
  //   });

  // },
  // 优惠券使用说明的显示隐藏方法
  toggleDiscountInfo: function (e) {
    if (e.currentTarget.dataset.type == 3) {
      var that = this;
      var index = e.currentTarget.dataset.id;
      var tab = e.currentTarget.dataset.tab//可用优惠券还是不可用
      var dropdownAction = "";
      var current = "that.data.couponUseList[" + index + "]";
      if (that.data.couponUseList[index] == undefined || that.data.couponUseList[index] == false) {
        that.data.couponUseList[index] = true
        dropdownAction = 1
      } else {
        that.data.couponUseList[index] = false
        dropdownAction = 0
      }
      that.setData({
        couponUseList: that.data.couponUseList
      })
      //  log.click({
      //   "eid":"WPersonal_MyCoupon_Details", 
      //   "elevel":"", 
      //   "eparam":index+"_"+dropdownAction+"_"+e.currentTarget.dataset.tab,
      //   "pname":"", 
      //   "pparam":"",
      //   "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
      //   "event": e //必填，点击事件event
      // })  
    }
  },
  /**
 * [reportExposure 上报曝光埋点]
 * @param  {[type]}  eventId      [事件id]
 * @return {[type]}               [description]
 */
  reportExposure(eventId, eparam) {
    let that = this;
    // log.exposure({
    //   "eid":eventId, 
    //   "elevel":"", 
    //   "eparam": eparam,
    //   "pname":"", 
    //   "pparam":""
    // })

  }
});
//处理优惠券已享用优惠的折扣标红方法
function parseDescFunc(str, arrExp) {
  var strArr = str.split("");
  for (let i = arrExp.length - 1; i >= 0; i--) {
    var indexArry = arrExp[i].split(":");
    var firstIndex = indexArry[0];
    var secIndex = parseInt(firstIndex) + parseInt(indexArry[1]);
    var delLength = parseInt(indexArry[1]);
    var item = str.slice(firstIndex, secIndex);
    var itemEdit = '<span style="color:#f23030;font-weight: bold;">' + item + '</span>';
    strArr.splice(firstIndex, delLength, itemEdit)
  }
  return strArr.join("");
}