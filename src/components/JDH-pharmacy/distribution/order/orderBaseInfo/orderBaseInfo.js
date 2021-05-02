/**
 * 订单基础信息组件：包含订单编号，下单时间，订单类型
 * 使用页面：推广订单页面
*/
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    orderNo: {
      type: String,  // 订单编号
      value:''
    },
    orderTime: {
      type: String, // 下单时间
      value: ''
    },
    orderSourceView: { // 订单类型
      type: String,
      value: ''
    },
    hasStatus: { // 是否显示订单状态
      type: Boolean,
      value: false
    },
    orderStatus: { // 订单状态Code
      type: String,
      value: ''
    },
    orderStatusView: {
      type: String,
      value: '处理中'
    },
    type: {
      type: String,
      value: '' // 列表类型
    },
    orderSource: { // 订单类型Code
      type: String,
      value: ''
    },
    cpsOrderStatusView: { // cps订单无效原因
      type: String,
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
    // 复制事件
    onCopy: function(){
      console.log('复制订单编号：',this.data.orderNo);
      wx.setClipboardData({
        data: this.data.orderNo
      })
    }
  }
})
