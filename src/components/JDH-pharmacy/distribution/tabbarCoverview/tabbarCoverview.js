const Api = require("../../../../utils/JDH-pharmacy/api.js");
const api = new Api();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 要提示的文字
    tabbar:{
      type: Object,
      value: ''
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
    // 跳转链接
    onClick: function(e){
      let { title, openType, url } = e.currentTarget.dataset;
      console.log(`==>tabbar_item:${title}`);
      
      // 上报对应的key及参数
      // api.getMta().Event.stat(`tabbar_item`, { "title": `${title}` });

      // 跳转页面
      wx[openType]({
        url: url
      });
    }
  }
})
