const Api = require("../../../../utils/JDH-pharmacy/api");
const api = new Api();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // position:{
    //   type:String,
    //   value:'position'
    // },
    // value:{
    //   type:String,
    //   value:'top:100rpx'
    // },
    // direction:{
    //   type:String,
    //   value:'right'
    // },
    // showGoToShopBtn: {
    //   type: Boolean,
    //   value: true
    // }
  },
  ready:function(opt){
    // 查询当前用户是否开通了店铺
    // this.getShopInfo();
  },
  /**
   * 组件的初始数据
   */
  data: {
    // hasShop:false
      showChart:false
  },
  /**
   * 生命周期
   * */ 
  pageLifetimes:{
    show:function(){
      // 查询当前用户是否开通了店铺
      // this.getShopInfo();
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    createShop: function () {
      if(this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(()=>{
        //开通店铺
        api.post('/shop/oneKeyOpenShop').then(rs => {
          if (rs.code == 0) {
            wx.setStorageSync('hasShop', true);
            wx.setStorageSync('isVip', true);
            wx.showToast({
              title: '开店成功！'
            })
            setTimeout(function () {
              wx.navigateTo({
                url: `/pages/shopIntroduction/shopIntroduction`,
              })
            }, 1500)
          } else {
            wx.showToast({
              title: '开店失败！',
              icon: 'none'
            })
          }
        })
      },500)
      
    },
    /**
     * 判断是否开店
     * */ 
    getShopInfo:function(){
      api.post('/shop/getShopInfo').then((res) => {
        if (res && res.data) {
          this.setData({
            hasShop: true,
          })
        } else {
          this.setData({
            hasShop: false,
          })
        }
      })
    },
      getRankAc:function(){
        console.log('chart!!!!!!!!!!!!!!!!')
        api.post('/act/getActStatus').then((res) => {
          // api.post('/shop/getShopInfo').then((res) => {
              if (res && res.data) {
                  this.setData({
                      showChart: true,
                  })
              } else {
                  this.setData({
                      showChart: false,
                  })
              }
          })
      },
    /**
     * 跳转到我的店铺.
     * */ 
    inToShop:function(){
      wx.navigateTo({
        url: '/pages/myShop/myShop',
      })
    }
  },
  pageLifetimes: {
    show() {
      // 页面onShow时,重新刷新数据
        this.getRankAc()
    },
  },
})
