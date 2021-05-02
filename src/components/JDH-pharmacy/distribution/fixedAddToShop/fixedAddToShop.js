var Api = require("../../../../utils/JDH-pharmacy/api");
// isNeedJoinShop： 1 未加入店铺   2已加入

//获取应用实例
var api = new Api();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isOnlyCps: {
      type: String,
      value: '' // '1'：未导入库，其他导入
    },
    jdSkuId: {
      type: String,
      value: ''
    },
    itemId:{
      type: String,
      value: ''
    },
    promotionId:{
      type: String,
      value: ''
    },
    // sourceChannel已无用，但保留了
    sourceChannel:{
      type: String,
      value: ''
    },
    isNeedJoinShop:{
      type: Number,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    loading: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 添加小店
    addToShop: function(){
      var that = this;
      var params = {};

      let { isOnlyCps, jdSkuId,  itemId, promotionId } = this.data;
      if (isOnlyCps && isOnlyCps == '1'){
        // 未导入库，
        params.jdSkuId = jdSkuId;
        params.itemSource = 1;
      } else {
        params.itemId = this.data.itemId;
        params.promotionId = this.data.promotionId;
        params.itemSource = 2;
      }
      
      if(this.data.loading || this.data.isNeedJoinShop == 2){
        return true;
      }
      that.setData({
        loading: true
      });
      api.post('/shop/saveItemToShop', params).then(
        (res) => {
          that.setData({
            loading: false
          });

          if (res && res.code == 0) {
            that.setData({
              isNeedJoinShop: 2
            });
            wx.showToast({
              title: '成功加入小店！',
              icon: 'none',
              duration: 2000
            });
          } else {
            console.log(res);
            wx.showToast({
              title: res.msg || '加入小店出错!',
              icon: 'none',
              duration: 2000
            })
          }
        }
      )
    }
  }
})
