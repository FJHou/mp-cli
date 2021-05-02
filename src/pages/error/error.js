// var log = require('../../utils/keplerReport.js').init();
// import { setLogPv } from '../../utils/util.js'
Page({
  data: {
    screenHeight: 0,
    screenWidth: 0,
    thisBarTitle: '',
    // pvFlag: true
  },
  onLoad: function (options) {
    var that = this;
    let thisPageTitle = '';
    if (options && options.thisBarTitle) {
      thisPageTitle = options.thisBarTitle;
    } else {
      thisPageTitle = '商品错误';
    }
    that.setData({
      thisBarTitle: thisPageTitle
    });
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          screenHeight: res.windowHeight,
          screenWidth: res.windowWidth,
        });
      }
    });

    //埋点上报设置
    //加密key和openid都是异步获取 ，所以setLogPv封装成一个promise 来同步数据
    // setLogPv({
    //   urlParam: options, //onLoad事件传入的url参数对象
    //   title: thisPageTitle, //网页标题
    //   pageTitleErro: 'pages/error/error'
    // }).then(function (data) {
    //   log.set(data);
    //   if (that.data.pvFlag) {
    //     that.data.pvFlag = false
    //     log.pv()
    //   }
    // })
  },
  onReady: function () {
    var that = this;
    //updated by meiling.lu 2018.2.22 check if thisBarTitle exists
    that.data.thisBarTitle && wx.setNavigationBarTitle({ title: that.data.thisBarTitle });
  },
  onShow: function () {
    //this.data.pvFlag为true 上报pv
    if (!this.data.pvFlag) {
      // log.pv()
    }
  },
  onHide: function () {
    //上报留存时长，需要在页面的onUnload、onHide事件中调用log.pageUnload()方法可实现页面留存时长统计
    // log.pageUnload()
  },
  onUnload: function () {
    //上报留存时长，需要在页面的onUnload、onHide事件中调用log.pageUnload()方法可实现页面留存时长统计
    // log.pageUnload()
  }
})
