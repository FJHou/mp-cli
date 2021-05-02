// pages/components/returnTop/returnTop.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isReturnHome: {
      type: Boolean,
      value: false
    },
    showFlag: {
      type: Boolean,
      value: false
    },
    isReturnTop: {
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
   * 组件的方法列表
   */
  methods: {
    toTop(){
      wx.pageScrollTo({
        scrollTop: 0
      })
      this.setData({
        showFlag: false
      })
    }
  }
})
