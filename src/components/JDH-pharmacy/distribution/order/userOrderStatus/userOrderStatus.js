/**
 * 用户的订单状态组件：包含用户头像，昵称，订单状态信息
 * 使用页面：推广订单页面
 * 
 * orderStatus: '订单状态 ,10待付款,15已付款, 18待成团，20待发货,40 待收货（全部发货），50订单完成，80已取消 85待处理（退款中）,90已退款，95已拒绝'
*/
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    jcbHeader:{
      type: 'string',
      value: '' // 用户头像
    },
    buyerName: {
      type: 'string',
      value: '' // 用户昵称
    },
    orderStatus: {
      type: Number,
      value: '' // 订单状态
    },
    orderStatusView: {
      type: String,
      value: '' // 订单状态文案
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    defaultPic: app.globalData.defaultPic,
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
