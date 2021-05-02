//logs.js
//var utils = require('../../utils/util.js');
import { setLogPv, request } from "../../utils/util.js";
// var messagePush = require('../../utils/message_push.js');
import toast from '../../components/toast/toast.js';
// var log = require('../../libs/keplerReport.js').init();
var app = getApp();
Page({
  data: {
    option: '',
    array: ['功能意见', '界面意见', '您的新需求', '操作意见', '流量问题', '其他'],
    index: 0,
    textareaVal: '',
    phone: '',
    isSubmit: false,
    homedir: "/kwxhome",
    pvFlag: true
  },
  onLoad: function (options) {
    let that = this;
    that.data.option = options;
    //埋点上报设置
    //加密key和openid都是异步获取 ，所以setLogPv封装成一个promise 来同步数据
    // setLogPv({
    //   urlParam: options, //onLoad事件传入的url参数对象
    //   title: '我的反馈', //网页标题
    //   pageId: "WDrugstore_FeedbackCenterPage",
    //   pageTitleErro: 'pages/myFeedback/myFeedback/我的反馈'
    // }).then(function (data) {
    //   //   log.set(data);
    //   if (that.data.pvFlag) {
    //     that.data.pvFlag = false
    //     //   log.pv()
    //   }
    // })
  },
  onShow: function () {
    //this.data.pvFlag为true 上报pv
    if (!this.data.pvFlag) {
      // log.pv()
    }
  },
  setTextareaVal: function (e) {
    this.setData({
      textareaVal: e.detail.value
    })

    // log.click({
    //   "eid": 'WPersonal_Feedback_Content',
    //   "elevel": "",
    //   "eparam": "",
    //   "pname": "",
    //   "pparam": "",
    //   "pageId":'WPersonal_Feedback',
    //   "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
    //   "event": e //必填，点击事件event
    // });
  },
  bindPhoneChange: function (e) {
    this.setData({
      phone: e.detail.value
    })
    // log.click({
    //   "eid": 'WPersonal_Feedback_Phone',
    //   "elevel": "",
    //   "eparam": "",
    //   "pname": "",
    //   "pparam": "",
    //   "pageId":'WPersonal_Feedback',
    //   "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
    //   "event": e //必填，点击事件event
    // });
  },
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })

    // log.click({
    //   "eid": 'WPersonal_Feedback_Type',
    //   "elevel": "",
    //   "eparam": "",
    //   "pname": "",
    //   "pparam": "",
    //   "pageId":'WPersonal_Feedback',
    //   "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
    //   "event": e //必填，点击事件event
    // });
  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  modalTap: function (e) {
    var _this = this;
    setTimeout(function () {
      _this.data.textareaVal = _this.data.textareaVal.replace(/(^\s*)|(\s*$)/g, "");
      //   log.click({
      //     "eid": 'WPersonal_Feedback_Refer',
      //     "elevel": "",
      //     "eparam": "",
      //     "pname": "",
      //     "pparam": "",
      //     "pageId":'WPersonal_Feedback',
      //     "target": "", //选填，点击事件目标链接，凡是能取到链接的都要上报
      //     "event": e //必填，点击事件event
      //   });
      if (!_this.data.textareaVal) {
        toast.show({
          icon: toast.icon.error,
          message: '请填写内容',
          pageObj: _this
        });
        // _this.reportExposure('WPersonal_Feedback_CEExpo')// 填写内容toast曝光
      }
      if (!_this.data.isSubmit && _this.data.index >= 0 && _this.data.textareaVal) {
        _this.data.isSubmit = true;
        var data = {
          'type': _this.data.array[_this.data.index],
          'content': _this.data.textareaVal,
          'contact': _this.data.phone,
          'client': 'kepler-wx'
        };
        request({
          data: data,
          url: app.globalRequestUrl + _this.data.homedir + '/myJd/doShowvote.json',
          success: function () {
            // messagePush.messagePush({
            //   formId: e.detail.formId,
            //   times: 1,
            //   type: 40001
            // })
            toast.show({
              icon: toast.icon.success,
              message: '提交成功',
              pageObj: _this,
              complete: () => {
                _this.data.isSubmit = false;
                wx.navigateBack();
              }
            });
            // _this.reportExposure('WPersonal_Feedback_SSExpo')
          },
          fail: function () {
            toast.show({
              icon: toast.icon.error,
              message: '提交失败',
              pageObj: _this,
              complete: () => {
                _this.data.isSubmit = false;
                wx.navigateBack();
              }
            });
          }
        })
      }
    }, 50);
  },
  onHide: function () {
    //上报留存时长，需要在页面的onUnload、onHide事件中调用log.pageUnload()方法可实现页面留存时长统计
    // log.pageUnload()
  },
  onUnload: function () {
    //上报留存时长，需要在页面的onUnload、onHide事件中调用log.pageUnload()方法可实现页面留存时长统计
    //   log.pageUnload()
  },
  /**
   * [reportExposure 上报曝光埋点]
   * @param  {[type]}  eventId      [事件id]
   * @return {[type]}               [description]
   */
  //   reportExposure (eventId,eparam,pparam) {
  // let that = this;
  // log.exposure({
  //   "pname":"反馈页", 
  //   "eid": eventId,
  //   "elevel": '',
  //   "eparam": '',
  //   "target":  '', //选填，点击事件目标链接，凡是能取到链接的都要上报
  //   "event": '',
  //   "pageId":'WPersonal_Feedback'
  // })

  //   },
})
