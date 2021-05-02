// components/deliveryList/member/goodsItem.js
import Api from "../../../../../utils/JDH-pharmacy/api";

const api = new Api();
//获取应用实例
const app = getApp()
 

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 列表中需要渲染的属性(按照从做到右，从上往下的原则)
    itemObj:{
      type: Object,
      value: {
        pic: '', // 商品图片
        ptype: '', // 商品类型（京东自营、京东、自营）
        pname: '', // 商品名称
        price: '', // 商品价格
        borderPrice: '', // 划线价
        ticketPrice: '', // 券价
        commentNo: '', // 评论条数
        commentPercent: '', // 好评率
        buyPrice: '', // 省钱购
        shareProfit: '', // 分享赚
        saleType: '', // [有品]砍价活动标识: 10返佣、20拼团、30分销、40砍价、50vip商品
        itemActivityFlag: '', // [京东]活动标识:0无活动、1拼购、2秒杀、3砍价(京东不支持)

        isJoin:'', // 是否已经加入小店
        isOnlyCps: 2, // 是否仅CPS商品池， 但京享中未添加的商品[1:仅CPS商品 2:京享中商品(包括部分cps商品)]
        jdSkuId: '', // 仅CPS商品池时的商品标识
        shopId: ''
      }
    },
    itemIndex:{
      type:Number, // 列表条目的索引
      value:0
    },
    needShowCheck:{
      type: String, // "加入小店"标识是否显示  00:不显示  01:显示
      value: '00'
    },
    isAllChoose: {
      type: String, // 页面有操作，触发回传
      value: '00', // 00:默认无操作  01:全选
      observer(newVal, oldVal) {
        if (newVal == '02') {
          // 取消全选，清空之前所有选择项
          this.setData({
            selectedObj: {}
          })
        }
      }
    },
    selectedObj: { // 选中的商品ID集合
      type:Object,
      value:{}
    }, 
    isLastOne: {
      type: Boolean, // 最后一条数据没有分割线
      value:false
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    hasShop:false,
    defaultPic: app.globalData.defaultPic,
    brandTxt: app.globalData.brandTxt,
    // selectedObj: {}, // 选中的商品ID集合
  },
  ready:function(){
  },
  /**
   * 组件的方法列表
   */
  methods: {

    /**  
    * 选中/取消选中  
    */
    onChangeCheck(e) {
      let { item, idx } = e.currentTarget.dataset;

      let { selectedObj } = this.data;
      if (selectedObj[item.itemId]) {
        // 已经存在，取消选中  
        delete selectedObj[item.itemId];
      } else {
        // 选中数据  
        selectedObj[item.itemId] = item.itemId;
      }

      this.setData({
        selectedObj
      });

      this.triggerEvent('change_check', { itemId: item.itemId, idx });
    },

    // 跳转商品详情
    goDetail:function(e) {
      let { needShowCheck } = this.data;
      if (needShowCheck != '00') {
        // 编辑模式，不进行操作
        return false;
      }

      const myEventDetail = e.currentTarget.dataset // detail对象，提供给事件监听函数
      let item = myEventDetail.item;
      app.globalData.productBaseInfo = {
        itemId: item.itemId, // 商品id
        promotionId: item.promotionId, // 活动id
        sellerId: item.sellerId, // 商家id
        itemName: item.pname, // 商品名称
        itemMainPicUrl: item.pic, // 商品主图
        salePrice: item.price, // 销售价格
        referPrice: item.borderPrice, // 划线价
        commentNum: item.commentNo, // 评论数
        favorableRate: item.commentPercent, // 好评率
        sourceChannel: item.sourceChannel, // 商品来源：京享 or jd
        jdSelfSaleFlag: item.jdFlag, // jd自营标识
        rebatePrice: item.shareProfit, // 佣金
        itemActivityFlag: item.itemActivityFlag,
        saleType: item.saleType,
        shopId:item.shopId
      };
      this.goProductDetail(myEventDetail);
      this.triggerEvent('event_buy', myEventDetail, {})
    },
    // 分享赚
    onShare:function(e) {
      let { needShowCheck } = this.data;
      if (needShowCheck != '00') {
        // 编辑模式，不进行操作
        return false;
      }
      this.triggerEvent('event_share', e.currentTarget.dataset, {})
    },
    // "跳转商品详情"
    goProductDetail(itemParam) {
      let { proId, itemId, sellerId, sourceChannel, item: { itemActivityFlag, shopId} } = itemParam;
      // 有品自营的商品详情
      let path = `/pages/productsdetails/productsdetails?itemId=${itemId}&promotionId=${proId}&sellerId=${sellerId}&shopId=${shopId}`
      
      var arr = ['80']; // 70:VOP  80:CPS 66:导入
      if (arr.indexOf(sourceChannel) >= 0) {
        // CPS商品商品详情
        path = `/pages/distributionGoodDetail/distributionGoodDetail?itemId=${itemId}&promotionId=${proId}&sellerId=${sellerId}&shopId=${shopId}`
      }
      wx.navigateTo({
        url: path
      });
    },
    // 显示 '错误提示' 信息
    showErrMsg(msg) {
      wx.showToast({
        icon: 'none',
        title: msg,
        duration: 2000
      })
    },
  }
})