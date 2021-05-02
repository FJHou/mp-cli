// pages/components/vipcode.js
// const log = require('../../../utils/weixinAppReport.js').init();
// const API = require('../../../utils/api-member.js')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isbtn: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  /**
   * 组件的生命周期
   */
  attached: function () {
    // console.log(this.data.loadstate)
  },

  /**
   * 组件的方法列表
   */
  methods: {
    submit(e) {
      var myEventDetail = {} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('fsubmit', myEventDetail, myEventOption)

      // API.ajax('/sendmsg/addFormId?formIdType=0&formId=' + e.detail.formId, 'GET', '', {}, function (res) {
      // })

    }
  }
})
