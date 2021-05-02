
import Api from "../../../../utils/JDH-pharmacy/api";
const app = getApp();
const api = new Api();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isVip: { //  由父页面传递的数据，是否是vip
      type: Boolean,
    },
    item: { //  由父页面传递的数据，商品数据
      type: Object,
    },
    defaultPic: {
      type: String // 默认图片
    },
    width: {
      type: String, // 图片大小
      value: 330
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    productDefaultImg: app.globalData.productDefaultImg,
    brandTxt: app.globalData.brandTxt,
    imgLoaded: false, // 主图是否加载完毕
  },

  ready: function () {
    let brandTxt = wx.getStorageSync('brandTxt');
    this.setData({
      brandTxt
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
      * 主图加载完毕之前展示默认图片
    */
    imgOnLoad: function () {
      this.setData({
        imgLoaded: true
      });
    },

    onClick: function () {
      let item = this.data.item;

      app.globalData.productBaseInfo = {
        ...item,
        itemId: item.itemId, // 商品id
        promotionId: item.promotionId, // 活动id
        sellerId: item.sellerId, // 商家id
        itemName: item.itemName, // 商品名称
        itemMainPicUrl: item.itemMainPicUrl, // 商品主图
        salePrice: item.salePrice, // 销售价格
        referPrice: item.referPrice, // 划线价
        commentNum: item.commentNum, // 评论数
        favorableRate: item.favorableRate, // 好评率
        sourceChannel: item.sourceChannel, // 商品来源：京享 or jd
        jdSelfSaleFlag: item.jdSelfSaleFlag, // jd自营标识
        saleType: item.saleType, // 商品类型
        rebatePrice: item.rebatePrice, // 佣金
        groupPrice: item.groupPrice, // 拼团价
        reducePrice: item.reducePrice, // 坎后价
        buyCount: item.buyCount, // 销量
        stock: item.stock, // 剩余
        postFeePrice: item.postFeePrice // 运费
      };

      let { brandTxt } = this.data;

      // 上报对应的key及参数
      // api.getMta().Event.stat(`details_product_list`, {
      //   'itemname': item.itemName,
      //   'sourcechannel': item.sourceChannel == '80' ? brandTxt.jd : brandTxt.mine1,
      //   'itemid': item.itemId,
      //   'sellerid': item.sellerId,
      //   'promotionid': item.promotionId
      // });
    },
    /**
     * sourceTyle=1: 仅cps商品，未导入库里
     * */
    goDetail: function (e) {
      this.onClick();
      let { sourceChannel, sourceType, jdSkuId, itemId, promotionId, sellerId } = this.data.item;
      if(sourceChannel == '80') { // cps
        if (sourceType && sourceType == '1'){
          // 未导入库
          wx.navigateTo({
            url: '/pages/distributionGoodDetail/distributionGoodDetail?jdSkuId=' + jdSkuId +"&isOnlyCps=1"
          });
        } else {
          // 已导入库
          wx.navigateTo({
            url: '/pages/distributionGoodDetail/distributionGoodDetail?itemId=' +itemId + '&promotionId=' + promotionId + '&sellerId=' + sellerId
          });
        }
      } else { // 自建商品
        wx.navigateTo({
          url: '/pages/productsdetails/productsdetails?itemId=' + itemId + '&promotionId=' + promotionId + '&sellerId=' + sellerId
        });
      }
    }
  }
})
