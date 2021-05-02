import { genCpsPromotionUrl } from "../../../../api/index";
import { JX_WX_APPID, JD_WX_APPID } from "../../../../constants";
import { getTypeLabel } from "../../../../pages/distributionGoodDetail/helpers";

//获取应用实例
const app = getApp() ; 

Component({ 
  properties: { 
    itemObj:{
      type: Object,
      value: {}
		},
		referenceUserInfo:{
			type: Boolean 
		}
  },

  /**
   * 组件的初始数据
   */
  data: {
    defaultPic: app.globalData.productDefaultImg, 
    finishPicLoad: false, // 图片是否已经下载完成
  }, 
  methods: {
    // 分享赚
    onShare:function(e) {
      this.triggerEvent('event_share', e.currentTarget.dataset, {})
    },
    // 处理列表图片垫底图逻辑
    imageLoad: function (event) {  
      let { height, width } = event.detail;
      if (height > 0 && width > 0) {
        this.setData({
          finishPicLoad: true
        })
      }
    },
    // 跳转商品详情
    goDetail(e) {
      const skuId = e.currentTarget.dataset.item.skuId // detail对象，提供给事件监听函数
			wx.navigateTo({
				url: `/pages/distributionGoodDetail/distributionGoodDetail?skuId=${skuId}`
			});
    },

    async selfBuying() {
      const productInfo = this.data.itemObj
      const { materialUrl, tenantPriceInfo } = productInfo;
      const couponUrl = tenantPriceInfo.couponLink
      const params = {
        wxOpenId: await app.getOpenId(),
        materialUrl,
      }
      // 如果有优惠券则先去优惠券页面
      if (couponUrl) {
        params.couponUrl = encodeURIComponent(couponUrl)
      }
      genCpsPromotionUrl(params).then((res) => {
        const data = res.data;
        if (data) {
          const spreadUrl = encodeURIComponent(data.shortURL);
          let options = null;
          const jdSelfSaleFlag = getTypeLabel(productInfo)
  
          if (jdSelfSaleFlag === '京东拼购') {
            options = {
              path :`pages/union/proxy/proxy?spreadUrl=${spreadUrl}`,
              appId :JX_WX_APPID
            }
          } else {
            options = {
              path :`pages/union/proxy/proxy?spreadUrl=${spreadUrl}&customerinfo=jcyp181220`,
              appId :JD_WX_APPID
            }
          }
          
          wx.navigateToMiniProgram(options);
        }
      });
    } 
  }
})