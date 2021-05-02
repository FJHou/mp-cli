// components/shareModal/shareModal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    shareModelShow: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showSharePanel: function () {
      this.setData({
        shareModelShow: true
      })
     // wx.hideTabBar();
      this.triggerEvent('showSharePanelParents')
    },
    hideSharePanel: function (e) {
      this.setData({
        shareModelShow: false
      })
     // wx.showTabBar();
      this.triggerEvent('hideSharePanelParents', { e: e })
    },
    toShare: function (e) {
      this.setData({
        shareModelShow: false
      })
      this.triggerEvent('toShare', { type: e.currentTarget.dataset.type, e: e })
    }
  }
})
