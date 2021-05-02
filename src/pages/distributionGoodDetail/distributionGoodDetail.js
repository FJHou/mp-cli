/**
 * cps商品进入该页面，作为中转页面，展示商品的基本信息：
 * 点击领券购买，调用获取jd领券页面的接口，并跳转到jd领券页面
 * 点击分享，分享微信好友/朋友圈
 *
 * 2019-07-02 新加商详：未导入数据库里的商品，进入商详的参数为jdSkuId & inviterUserId & isOnlyCps=1,
 * 否则，传递进入的参数为itemId promotionId sellerId & inviterUserId
 *
 * 根据参数isOnlyCps 判断是否是导入数据库的商品，
 * 如果isOnlyCps == '1' 是仅cps商品，未导入商品库，否则其他情况null/2是导入商品库的
 *
 * 调用不同的接口：商品基本信息接口 & 获取京东链接接口 & 分享h5 url变化
 *
 * 另：有shopId的商品必定是导入库的
 */
import { genCpsPromotionUrl, queryProductionListReq } from "../../api/index";
import { JD_WX_APPID, JX_WX_APPID } from "../../constants/index";
import {
  getCurrentRouter,
  fetchIsReferenceUser,
  isFromQRCode,
  getReturnPage,
} from "../../utils/JDH-pharmacy/index";
import { getMPQrCodeParams } from "../../utils/JDH-pharmacy/scanMpQrCode";
import { wxInfo } from "../../utils/JDH-pharmacy/wxlog";
import { isLogin, globalLoginShow, getPtPin } from "../../utils/loginUtils";
import { getTypeLabel } from "./helpers";
import queryString from 'query-string'
import { getCardVisitSource } from "../../logs/getCpsVisitSource";

const app = getApp();

Page({
  data: {
    userLevel: "1", //用户等级，默认是1
    imgLoaded: false, // 标识主图是否加载完毕，加载完毕之前，展示默认图片
    productDefaultImg: app.globalData.productDefaultImg,
    defaultPic: app.globalData.defaultPic,
    isIphoneX: app.globalData.isIpx,

    // 商品基本信息
    productBaseInfo: {},
    imgArr: [], //商品图片
    currentSkuIndex: 0, // 当前选中的skuId index
    onSale: true, // 商品上下架状态，50：下架， 60：上架， -1：删除

    // 会员信息
    referenceUserInfo: false,

    // 分享弹层
    showSharePopup: false,
    wxCodeImg: undefined, // 微信二维码图片

    // 下载图文重复提交
    disabledDownLoadBtn: false,

    // h5_details_url: undefined, // cps h5商详页面链接

    showJumpModal: false,

    codeCallCpsShare: "00", // 是否代码调用 CPS 子组件的分享函数

    isOnlyCps: "", // 1:未录入到数据库商品，需要根据jdSkuId处理，否则：已导入到数据库商品，根据itemId， promotionId, sellerId 处理
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function(options) {
    console.log(options);
    this.fetchIsReferenceUser();
    // 是否是从识别二维码进来的，需要拆分参数
    if (isFromQRCode(options)) {
      try {
        const query = await getMPQrCodeParams(options);
        this.getProductDetail(query.skuId);
      } catch (err) {
        wxInfo(err);
      }
    } else {
      this.getProductDetail(options.skuId);
    }
  },

  fetchIsReferenceUser() {
    fetchIsReferenceUser().then((res) => {
      if (!!res) {
        this.setData({
          referenceUserInfo: res,
          userLevel: res.level,
        });
      }
    });
  },

  getProductDetail(skuId) { 
		let skuIdArr = [];
		if(skuId){
			skuIdArr.push(skuId)
		}
    wx.showLoading({
      title: "数据请求中...",
      mask: true,
    });
    let newProductListParamObj = {
      userLevel: this.data.userLevel,
      skuIds: skuIdArr,
    };
    queryProductionListReq(newProductListParamObj)
      .then((res) => {
        wx.hideLoading();
        if (res.code=="0000" && res.data) {
          console.log(res.data);
          let productBaseInfo = res.data.goodsList[0];
          let imgArr = [];
          productBaseInfo.imageInfo.imageList.forEach(function(item) {
            imgArr.push(item.url);
          });
          this.setData({
            productBaseInfo,
            imgArr,
            imgLoaded: true,
          });
        } else {
          wx.showToast({
            title: "数据请求失败，请稍后重试",
            icon: "none",
            duration: 1000,
          });
        }
      })
      .catch((error) => {});
  },

  /**
   * 主图加载完毕之前展示默认图片
   */
  imgOnLoad: function() {
    this.setData({
      imgLoaded: true,
    });
  },
  /**
   * 用户点击右上角分享，目前只有分销商品
   */
  onShareAppMessage: function() {
    const { route } = getCurrentRouter();
    const productBaseInfo = this.data.productBaseInfo;
		const stringify = queryString.stringify({
			skuId: productBaseInfo.skuId,
			cpsVisitSource: getCardVisitSource(),
			referrerPin: getPtPin()
    })

    return {
      title: productBaseInfo.skuName,
      path: `${route}?${stringify}`,
      imageUrl: productBaseInfo.imageInfo.imageList[0].url,
    };
  },
  /**
   * 点击复制商品名称
   */
  copyProductName: function() {
    var { skuName } = this.data.productBaseInfo;
    wx.setClipboardData({
      data: skuName,
      success: function(res) {
        wx.getClipboardData({
          success: function(res) {
            wx.showToast({
              title: "复制成功",
            });
          },
        });
      },
    });
  },

  listenShare() {
    if (!isLogin()) {
      globalLoginShow({
        data: {
          returnpage: getReturnPage(),
          fromPageLevel: 0,
        },
      });
      return;
    }

    const val = this.data.productBaseInfo;
    let tempItem = {
      jdSelfSaleFlag: getTypeLabel(val), // 京东:0  京东自营:1 标志
      annexUrl: val.imageInfo.imageList[0].url, // 商品图片
      salePrice: val.tenantPriceInfo.jdPrice, // 商品价格1
      referPrice: val.tenantPriceInfo.referPrice, // 商品划线价
      itemName: val.skuName, // 商品名称
      itemId: val.skuId, // 商品id
      sellerId: val.shopInfo.shopId, // 商品所属商家的id
      promotionId: val.promotionId, // 商品活动id
      saleType: val.saleType, // 有品活动标识
      itemActivityFlag: val.itemActivityFlag, // 京东活动标识
      commentNum: val.comments, // 评论条数
      favorableRate: val.goodCommentsShare, // 好评率
      jdSkuId: val.skuId,
      isOnlyCps: val.isOnlyCps,
    };
    this.setData({
      codeCallCpsShare: "01",
      productInfo: tempItem,
    });
  },

  /*点击领券购买，跳转到jd商品详情*/
  async gotoJDdetails() {
    const { materialUrl, tenantPriceInfo } = this.data.productBaseInfo;
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
        const jdSelfSaleFlag = getTypeLabel(this.data.productBaseInfo)

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
  },
  /**
   * 跳转到首页
   */
  gotoHome: function() {
    wx.switchTab({
      url: `/pages/distributionIndex/distributionIndex`,
    });
  },

  /**
   * 预览图片并可手动保存图片
   */
  mainImgClick: function(e) {
    var index = e.currentTarget.dataset.index;
    var itemAnnexVos =
      (this.data.productBaseInfo && this.data.productBaseInfo.imageInfo.imageList) ||
      [];
    var urls = itemAnnexVos.map((item) => {
      return item.url;
		}); 
    wx.previewImage({
      current: urls[index], // 当前显示图片的http链接
      urls: urls, // 需要预览的图片http链接列表
    });
  },
});
