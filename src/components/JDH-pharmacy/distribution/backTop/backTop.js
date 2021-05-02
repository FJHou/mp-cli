// components/backTop/backTop.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 返回顶部图标是否显示
    backShow:{
      type: Boolean,
			value:false,
			backImgUrl:'https://img10.360buyimg.com/imagetools/jfs/t1/142937/8/19469/2345/5fe1bd15Ebd12e40e/32119ce52a863797.png',
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
     // 返回顶部
    backToTop(){
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 300
      });
      this.triggerEvent('event_back', {}, {});
    },
  }
})
