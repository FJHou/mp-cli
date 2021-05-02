// components/tips.js
let app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isIphoneX: {
      type: Boolean,
      value: false
    },
    tipsShow: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 这里是一些组件内部数据
    someData: {
      statusBarHeight: app.globalData.statusBarHeight,
      titleBarHeight: app.globalData.titleBarHeight
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

    closeTips: function () {
      this.setData({
        tipsShow: false
      });
      app.globalData.tipsShow = false;
      this.triggerEvent('closeResolve', { data: "close" })
    }
  }
})
