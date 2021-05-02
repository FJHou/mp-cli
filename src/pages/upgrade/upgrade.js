// var log = require('../../utils/keplerReport.js').init();
// var utils = require('../../utils/util.js')
// import { setLogPv} from "../../utils/util.js";
// var app = getApp()
Page({
  data: {
    updateItem: {
      msg: '升级之后，享受更多优质服务哟!'
    },
    pvFlag: true
  },
  onLoad: function (options) {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
    });
    //埋点上报设置
    //加密key和openid都是异步获取 ，所以setLogPv封装成一个promise 来同步数据
    // setLogPv({
    //   urlParam: options, //onLoad事件传入的url参数对象
    //   title: '微信升级', //网页标题
    //   pageTitleErro: 'pages/upgrade/upgrade/微信升级'
    // }).then(function (data) {
    //   //   log.set(data);
    //   if (that.data.pvFlag) {
    //     that.data.pvFlag = false
    //     //   log.pv()
    //   }
    // })
  },
  onShow: function () {
    //异步请求加密ptkey结果是否已执行完毕，执行完毕则上报pv
    //this.data.pvFlag为true 上报pv
    // if(!this.data.pvFlag){
    //   log.pv()
    //   }
  },
  onHide: function () {
    //上报留存时长，需要在页面的onUnload、onHide事件中调用log.pageUnload()方法可实现页面留存时长统计
    // log.pageUnload()
  },
  onUnload: function () {
    //上报留存时长，需要在页面的onUnload、onHide事件中调用log.pageUnload()方法可实现页面留存时长统计
    //   log.pageUnload()
  }
})
