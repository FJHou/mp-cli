//coupon.js

// 公用模块
import { request, reportErr, setLogPv } from '../../utils/util.js';
// var log = require('../../libs/keplerReport.js').init();
// var messagePush = require('../../utils/message_push.js');

var app = getApp();

Page({
  data: {
    option: '',
    pDir: '/kwxp',
    couponNumb: '',
    uncouponNumb: 0,
    hasCoupon: false, //是否有优惠券
    dqArr: [],
    jqArr: [],
    yfqArr: [],
    undqArr: [],
    unjqArr: [],
    unyfqArr: [],
    use: true,
    unUse: false,
    noAvailableItem: {
      msg: '很遗憾，您暂无可以使用的优惠券'
    },
    noUnavailableItem: {
      msg: '您暂无不可以使用的优惠券'
    },
    screenHeight: 0,
    toTopDisplay: 'none',
    scrollTop: 0,
    isIphoneX: app.globalData.isIphoneX,
    couponUseList: {},//控制优惠券折扣说明的展示与否的对象
    pvFlag: true,
    unUseTab: false,//判断不可用券的tab标签是否有点击过
    useIndex: 0,
    unUseIndex: 0
  },
  //导航可用优惠券点击
  useClick: function (e) {
    this.setData({
      use: true,
      unUse: false
    });
    if (this.couponIdListStr == "") {
      if (this.couponIdList.length > 0) {
        for (let i = 0; i < this.couponIdList.length; i++) {
          if (i == this.couponIdList.length - 1) {
            this.couponIdListStr += this.couponIdList[i];
          } else {
            this.couponIdListStr += this.couponIdList[i] + '#';
          }
        }
      }
    }
    // log.click({
    //   "eid": "WOrder_Coupon_Available",
    //   "elevel": "",
    //   "eparam": this.couponIdListStr,
    //   "pname": "",
    //   "pparam": "",
    //   "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
    //   "event": e //必填，点击事件event
    // })
  },
  //导航不可用优惠券点击
  unUseClick: function (e) {
    let that = this;
    that.setData({
      use: false,
      unUse: true,
      unUseTab: true
    });
    if (that.nCouponIdListStr == "") {
      if (that.nCouponIdList.length > 0) {
        for (let i = 0; i < that.nCouponIdList.length; i++) {
          if (i == that.nCouponIdList.length - 1) {
            that.nCouponIdListStr += that.nCouponIdList[i];
          } else {
            that.nCouponIdListStr += that.nCouponIdList[i] + '#';
          }
        }
      }
    }
    // log.click({
    //   "eid": "WOrder_Coupon_Unavailable",
    //   "elevel": "",
    //   "eparam": that.nCouponIdListStr,
    //   "pname": "",
    //   "pparam": "",
    //   "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
    //   "event": e //必填，点击事件event
    // })
    setTimeout(function () {
      that.exposure(0, that.data.screenHeight)
    }, 1000)
  },
  // 单选点击回调
  checkCb: function (e) {
    let type = e.currentTarget.dataset.type;
    if (type == '1') {// 东券点击
      this.checkCouponHandle(e, 'dqArr');
    } else if (type == '2') {// 京券点击（小程序暂时屏蔽了京券暂时没有走这块）
      this.checkCouponHandle(e, 'jqArr');
    } else if (type == '3') {// 运费券点击
      this.checkCouponHandle(e, 'yfqArr');
    }
  },
  // 确认按钮点击
  subBtn: function (e) {
    // messagePush.messagePush({
    //   formId: e.detail.formId,
    //   times: 1,
    //   type: 20002
    // })
    //已选择的优惠券Id拼接字符串-埋点上报需要
    this.selectCouponStr = '';
    if (this.selectedCouponArr.length > 0) {
      for (let i = 0; i < this.selectedCouponArr.length; i++) {
        if (i == this.selectedCouponArr.length - 1) {
          this.selectCouponStr += this.selectedCouponArr[i];
        } else {
          this.selectCouponStr += this.selectedCouponArr[i] + '#';
        }
      }
    }
    // log.click({
    //   "eid": "WOrder_Coupon_AvailableOK",
    //   "elevel": "",
    //   "eparam": this.selectCouponStr,
    //   "pname": "",
    //   "pparam": "",
    //   "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
    //   "event": e //必填，点击事件event
    // })
    wx.navigateBack();

  },
  onLoad: function (options) {
    let isGlobalPayment = options.isGlobalPayment === "true";
    this.setData({ isGlobalPayment });
    let globalBuy = isGlobalPayment ? "HK" : "";
    // 初始化数据处理
    const that = this,
      URL = app.globalRequestUrl + that.data.pDir + '/norder/couponsNewRule.json?globalBuy=' + globalBuy;
    that.data.option = options;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          screenHeight: res.windowHeight
        });
      }
    });
    // 请求接口
    request({
      url: URL,
      success: function (data) {
        that.dataInit(data);
      },
      fail: function (e) {
        reportErr("coupon couponsNewRule.json: " + e);
        wx.navigateTo({
          url: '/pages/error/error'
        });
      }
    });

    //埋点上报设置
    //加密key和openid都是异步获取 ，所以setLogPv封装成一个promise 来同步数据
    // setLogPv({
    //   urlParam: options, //onLoad事件传入的url参数对象
    //   title: '优惠券', //网页标题
    //   pageId: 'WOrder_Coupon',
    //   pageTitleErro: 'pages/coupon/coupon/优惠券'
    // }).then(function (data) {
    //   //   log.set(data);
    //   if (that.data.pvFlag) {
    //     that.data.pvFlag = false
    //     // log.pv()
    //   }
    // })
    setTimeout(function () {
      that.exposure(0, that.data.screenHeight)
    }, 1000)
  },
  onShow: function () {
    //this.data.pvFlag为true 上报pv
    if (!this.data.pvFlag) {
      //   log.pv()
    }
  },
  // 下拉重新加载
  onPullDownRefresh: function () {
    let globalBuy = this.data.isGlobalPayment ? "HK" : "";

    // 初始化数据处理
    const that = this,
      URL = app.globalRequestUrl + that.data.pDir + '/norder/couponsNewRule.json?globalBuy=' + globalBuy;

    // 请求接口
    request({
      url: URL,
      success: function (data) {
        that.dataInit(data);
      },
      fail: function (e) {
        reportErr("coupon couponsNewRule.json: " + e);
        wx.navigateTo({
          url: '/pages/error/error'
        });
      }
    });
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
    console.log("e.detail.scrollTop, e.detail.scrollHeight", e.detail.scrollTop, e.detail.scrollHeight)
    this.throttle(this.exposure, e.detail.scrollTop, e.detail.scrollHeight);
  },
  //返顶按钮点击事件
  toTopTap: function (e) {
    var that = this;
    this.setData({
      toTopDisplay: "none",
      scrollTop: Math.random() * 0.001
    })
  },
  // 初始化数据的处理
  dataInit: function (data) {
    //默认选择的优惠券id的获取
    this.selectedCouponArr = [];//已选择的优惠券数组的初始化
    var defaultCouponsId = data.couponsId//默认选择的优惠券id
    if (defaultCouponsId.indexOf("@") > -1) {
      this.selectedCouponArr = this.selectedCouponArr.concat(defaultCouponsId.split("@"));
    } else {
      this.selectedCouponArr.push(defaultCouponsId)
    }
    if (typeof data == 'string') {
      console.log('data err');
      return;
    }
    var couponNumb, hasCoupon, uncouponNumb;
    //埋点上报的数据初始化开始
    this.couponIdList = [];
    this.couponIdListStr = '';
    this.nCouponIdList = [];
    this.nCouponIdListStr = '';
    //埋点上报的数据初始化结束
    // 可用东券初始化
    this.useCouponDataInit(data.dcouponList);
    // 可用京券初始化
    this.useCouponDataInit(data.jcouponList);
    // 可用运费券初始化
    this.useCouponDataInit(data.mcouponList);
    // 不可用优惠券
    this.unUseCouponDataInit(data.ndcouponList);
    this.unUseCouponDataInit(data.njcouponList);
    this.unUseCouponDataInit(data.nmcouponList);

    // 京券不让用 所以不算京券 之算 东券和运费券
    couponNumb = data.dcouponList.length + data.jcouponList.length + data.mcouponList.length;
    //couponNumb = data.dcouponList.length + data.mcouponList.length;
    uncouponNumb = data.ndcouponList.length + data.njcouponList.length + data.nmcouponList.length;
    if (couponNumb > 0) {
      hasCoupon = true;
    } else {
      hasCoupon = false;
    }

    // 刷新视图
    this.setData({
      couponNumb: couponNumb,
      uncouponNumb: uncouponNumb,
      hasCoupon: hasCoupon,
      dqArr: data.dcouponList,
      jqArr: data.jcouponList,
      yfqArr: data.mcouponList,
      undqArr: data.ndcouponList,
      unjqArr: data.njcouponList,
      unyfqArr: data.nmcouponList
    });
  },
  // 可用券初始化函数
  useCouponDataInit: function (dataList) {
    dataList.forEach(function (val) {
      val.timeBegin = paseTime(val.timeBegin);
      val.timeEnd = paseTime(val.timeEnd);
      if (val.belowMsg1Map && val.belowMsg1Map.belowMsg1) {
        if (val.belowMsg1Map.redAmount) {
          val.belowMsg1Map.belowMsg1 = parseDescFunc(val.belowMsg1Map.belowMsg1, val.belowMsg1Map.redAmount)
        }
        if (val.belowMsg1Map.redDiscount) {
          val.belowMsg1Map.belowMsg1 = parseDescFunc(val.belowMsg1Map.belowMsg1, val.belowMsg1Map.redDiscount)
        }
      }
      if (val.readOnly) {
        val.gray = 2;
      } else {
        val.gray = 1;
      }
    });
    //可用优惠券的Couponid字符串拼接
    if (this.couponIdListStr == "") {
      if (dataList && dataList.length > 0) {
        for (let i = 0; i < dataList.length; i++) {
          this.couponIdList.push(dataList[i].id)
        }
      }
    }
  },
  //不可用券初始化函数
  unUseCouponDataInit: function (dataList) {
    dataList.forEach(function (val) {
      val.timeBegin = paseTime(val.timeBegin);
      val.timeEnd = paseTime(val.timeEnd);
    });
    //不可用优惠券的Couponid字符串拼接
    if (dataList && dataList.length > 0) {
      for (let i = 0; i < dataList.length; i++) {
        this.nCouponIdList.push(dataList[i].id)
      }
    }
  },
  checkCouponHandle: function (e, arrName) {
    let index = e.currentTarget.dataset.index;
    // 判断是否是灰色
    if (this.data[arrName][index].gray == 2) {
      return;
    } else if (this.data[arrName][index].gray == 1) {
      this.data[arrName][index].selected = this.data[arrName][index].selected ? false : true;
      var json = {
        'useOrCancelCouponPara.Key': this.data[arrName][index].key,
        'useOrCancelCouponPara.Selected': this.data[arrName][index].selected,
        'useOrCancelCouponPara.Id': this.data[arrName][index].id
      };
      var selectCouponId = this.data[arrName][index].id//选择的优惠券id
      var couponIndex = this.selectedCouponArr.indexOf(selectCouponId)
      if (couponIndex > -1) {
        this.selectedCouponArr.splice(couponIndex, 1)
      } else {
        this.selectedCouponArr.push(selectCouponId)
      }
      let objTemp = {};
      objTemp[arrName] = this.data[arrName];
      this.setData(objTemp);
      this.send(json);
      //   console.log("优惠券选择状态", Number(this.data[arrName][index].selected))
      //   log.click({
      //     "eid": "WOrder_Coupon_AvailableChoice",
      //     "elevel": "",
      //     "eparam": selectCouponId + '_' + Number(this.data[arrName][index].selected),
      //     "pname": "",
      //     "pparam": "",
      //     "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
      //     "event": e //必填，点击事件event
      //   });
      return;
    }
  },
  send: function (json) {
    let globalBuy = this.data.isGlobalPayment ? "HK" : "";
    var SENDURL = app.globalRequestUrl + this.data.pDir + '/norder/useOrCancelCoupon.json' + json2URL(json) + '&globalBuy=' + globalBuy;
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
      duration: 10000,
      mask: true
    });
    request({
      url: SENDURL,
      success: data => {
        this.checkCouponNext(data);
      },
      complete: () => {
        wx.hideToast();
      },
      fail: error => {
        reportErr("coupon useOrCancelCoupon.json: " + error);
      }
    });
  },
  checkCouponNext: function (data) {
    wx.hideToast();
    if (data.Flag) {
      //东券
      this.checkCouponStateChange(data, 'dcouponList', 'dqArr');
      //京券
      this.checkCouponStateChange(data, 'jcouponList', 'jqArr');
      //运费券
      this.checkCouponStateChange(data, 'mcouponList', 'yfqArr');
    } else {
      wx.showModal({
        content: '优惠券不存在或已过期',
        showCancel: false
      });
    }
    this.setData({
      dqArr: data.dcouponList,
      jqArr: data.jcouponList,
      yfqArr: data.mcouponList
    });
  },
  // 不可用优惠券使用说明的显示隐藏方法
  toggleDiscountInfo: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.id
    var current = "that.data.couponUseList[" + index + "]";
    var dropdownAction = "";
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
    // log.click({
    //   "eid": "WOrder_Coupon_UnavailableDetails",
    //   "elevel": "",
    //   "eparam": e.currentTarget.dataset.id + "_" + dropdownAction,
    //   "pname": "",
    //   "pparam": "",
    //   "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
    //   "event": e //必填，点击事件event
    // })
  },
  checkCouponStateChange: function (data, dataList, arrName) {
    // for (let i = 0; i < data[dataList].length; i++) {
    //   if (data[dataList][i].readOnly) {
    //     this.data[arrName][i].gray = 2;
    //   } else {
    //     this.data[arrName][i].gray = 1;
    //   }
    // }
    let objTemp = {};
    objTemp[arrName] = this.data[arrName];
    this.setData(objTemp);
    this.useCouponDataInit(data[dataList])
  },
  onHide: function () {
    //上报留存时长，需要在页面的onUnload、onHide事件中调用log.pageUnload()方法可实现页面留存时长统计
    // log.pageUnload()
    let that = this;
    // 可用优惠券的曝光埋点
    let useIndex = (that.data.useIndex || 0) + ''
    that.reportExposure("Worder_AvailableCouponExpo", useIndex)
    if (that.data.unUseTab) {
      let unUseIndex = (that.data.unUseIndex || 0) + '';
      that.reportExposure("Worder_UnavailableCouponExpo", unUseIndex)
    }
  },
  onUnload: function () {
    //上报留存时长，需要在页面的onUnload、onHide事件中调用log.pageUnload()方法可实现页面留存时长统计
    let that = this;
    // 可用优惠券的曝光埋点
    let useIndex = (that.data.useIndex || 0) + ''
    that.reportExposure("Worder_AvailableCouponExpo", useIndex)
    if (that.data.unUseTab) {
      let unUseIndex = (that.data.unUseIndex || 0) + '';
      that.reportExposure("Worder_UnavailableCouponExpo", unUseIndex)
    }
    // log.pageUnload()
  },
  /*
 * 1.5秒防抖函数
 **/
  throttle: function (method, scrollTop, scrollHeight) {
    clearTimeout(method.tId);
    let _this = this;
    method.tId = setTimeout(function () {
      method.call(_this, scrollTop, scrollHeight)
    }, 1500)
  },
  /*
*  楼层曝光埋点
**/
  exposure: function (top, height) {
    let that = this;
    let useIndex, unUseIndex;
    if (that.data.unUse) {
      height = height - 39;
      unUseIndex = Math.floor(top / (height / that.nCouponIdList.length)) + Math.floor(that.data.screenHeight / 103);
      if (unUseIndex >= that.data.unUseIndex) {
        that.setData({
          unUseIndex: unUseIndex
        })
      }
      console.log("that.data.unUseIndex", that.data.unUseIndex, unUseIndex)
    } else if (that.data.use) {
      height = height - 89;
      useIndex = Math.floor(top / (height / that.couponIdList.length)) + Math.floor(that.data.screenHeight / 103);
      if (useIndex >= that.data.useIndex) {
        that.setData({
          useIndex: useIndex
        })
      }
      console.log("useIndex", that.data.useIndex, useIndex)
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
    //   "eid": eventId,
    //   "elevel": "",
    //   "eparam": eparam,
    //   "pname": "",
    //   "pparam": ""
    // });
  }
});


// json转换URL
function json2URL(json) {
  var str = '?';
  var numb = 0;
  for (var val in json) {
    if (json.hasOwnProperty(val)) {
      if (numb) {
        str += '&' + val + '=' + json[val];
      } else {
        str += val + '=' + json[val];
      }
      numb++
    }
  }
  return str;
}

// 时间格式转换
function paseTime(str) {
  var tempT = str.split(' ')[0];
  var reg = /\//g;
  return tempT.replace(reg, '.');
}
//折扣说明中折扣值标红的处理方法
function parseDescFunc(str, redStr) {
  var redStrResult = '<span style="color:red;font-weight: bold;">' + redStr + '</span>'
  str = str.replace(redStr, redStrResult)
  return str
}  