/**
 * 推广订单的商品信息
 * 使用页面: 推广订单页面
*/
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    buyerId: {
      type: String,
      value: '' // 买家id
    },
    url:{
      type: String,
      value:'' // 商品图片
    },
    itemName: {
      type: String,
      value: '' // 商品名称
    },
    paymentPrice: {
      type: Number,
      value: '' // 用户实付金额
    },
    commissionPrice: {
      type: Number,
      value: '' // 收益
    },
    num: {
      type: String,
      value: '' // 购买件数
    },
    orderNo: {
      type: String,
      value: '' // 订单编号
    },
    orderSource: {
      type: String,
      value: '' // 订单来源
    },
    isDetail: {
      type: Boolean,
      value: false // 是否需要进入订单详情
    },
    jdSkuId: {
      type: String,
      value: '' // 如果是cps，则代表的是jdSkuId
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    defaultPic: app.globalData.productDefaultImg,
    ownDesc:'推广' // '推广' or '返利'
  },
  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
      // 如果是买家自己的订单，则为返利，否则为推广
      // 返利、推广标识注释20191120紧急上线需求
      let userId = wx.getStorageSync('userId');
      this.setData({
        // ownDesc: this.data.buyerId == userId ? '返利' : '推广'
      });
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //查看订单  跳转订单详情页  待付款页面跳转订单详情页付款, CPS订单不跳转
    handleOrderView(e) {
      let { orderNo, orderSource } = this.data;
      wx.navigateTo({
        url: '/pages/orderdetails/orderdetails?orderNo=' + orderNo + '&userRole=buyer'
      });
    },

    /**
     * 如果是jd商品，则跳转到商详。
     * 统一按照一个路径跳转
     * */
    gotoJdDetails: function () {
      debugger;
      wx.navigateTo({
        url: '/pages/distributionGoodDetail/distributionGoodDetail?isOnlyCps=1&jdSkuId=' + this.data.jdSkuId
      });
    }
  }
})
