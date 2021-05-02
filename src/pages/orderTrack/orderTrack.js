//var utils = require('../../utils/util.js');
import { request, reportErr } from "../../utils/util.js";
// var pay = require('../../utils/MPay.js');
// var log = require('../../libs/keplerReport.js').init();
//获取应用实例
// var app = getApp();
Page({
    data: {
        pvFlag: true
    },
    onLoad: function (options) {
        var that = this;
        //埋点上报设置
        //加密key和openid都是异步获取 ，所以setLogPv封装成一个promise 来同步数据
        // setLogPv({
        //     urlParam: options, //onLoad事件传入的url参数对象
        //     title: '订单跟踪', //网页标题
        //     pageId: 'WPersonal_OrderTrack',
        //     pageTitleErro:'pages/orderTrack/orderTrack/订单跟踪'
        //   }).then(function(data){
        //     // log.set(data);
        //     if(that.data.pvFlag){
        //         that.data.pvFlag = false
        //         // log.pv()
        //     }
        //   })
        wx.getStorage({
            key: 'order_track_jump_url',
            success: function (res) {
                var trackUrl = res.data.trackUrl;

                if (trackUrl) {
                    var url = getApp().globalHealthPayRequestUrl + trackUrl;
                    request({
                        url: url,
                        success: that.toViewPage.bind(that)
                    });
                }
                //清除storage
                wx.removeStorageSync('order_track_jump_url')
            }
        });
    },
    onShow: function () {
        var that = this;
        //异步请求加密ptkey结果是否已执行完毕，执行完毕则上报pv
        //that.data.pvFlag为true 上报pv
        if (!that.data.pvFlag) {
            // log.pv()
        }
    },
    toViewPage: function (response) {
        try {
            var that = this;
            that.setData({
                orderTrack: response
            });
        } catch (e) {
            reportErr("order track toview: " + e.message);
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
