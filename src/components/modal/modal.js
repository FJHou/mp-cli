// components/modal.js
const app =getApp();
Component({
  options:{
    multipleSlots:true
  },
  /**
   * 组件的属性列表 
   */
  properties: {
     show:{
       type:Boolean,
       value:false,
     },
     showClose:{
       type: Boolean,
       value: true,
     },
    colseSrc:{
       type:String,
       value: app.staticUrl+'/devfe/jfs/t1/39189/4/11770/1390/5d899203E3dab4c09/79e44452aeec0f32.png'
     },
     hideAnimation:{
       type:Boolean,
       value:false
     }
  },

  /**
   * 组件的初始数据
   */
  data: {
    staticUrl: app.staticUrl,

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTap:function(){
      this.triggerEvent('ontap',{data:12321321321})
    },
    hideModal:function(){
      this.triggerEvent('hideevent')

      setTimeout(() => {
        this.setData({
          show:false
        })
      },300)
      this.setData({
        hideAnimation:true
      })
    }
  }
})
