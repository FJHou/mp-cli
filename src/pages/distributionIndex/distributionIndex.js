const app = getApp();

import { httpsGet } from "../../utils/util.js";
import { queryProductionListReq } from "../../api/index";
import {
  getBrandBaseInfo,
  fetchIsReferenceUser,
  cutbytestr,
} from "../../utils/JDH-pharmacy/index";
import { GWMaterialParamsConvert } from "../../utils/JDH-pharmacy/GWMaterialParamsConvert";
import { getTypeLabel } from "../distributionGoodDetail/helpers";
import shareAppMessage from "./shareAppMessage";

Page({
  data: {
    //cps分享相关
    tabItemWidth: 152, //tab每个item的宽度，单位是rpx
    pageNo: 1,
    pageSize: 10,
    hasMoreData: true, //还有下一页
    // 商城类目列表
    currentId: null,
    isVip: false,
    codeCallCpsShare: "00", // 是否代码调用 CPS 子组件的分享函数
    codeCallYpShare: "00", // 是否代码调用 YP 子组件的分享函数
    currentShareItem: {},
    currentShareType: "",
    // 分享弹层
    showSharePopup: false,
    shareImg: "",
    sharePic: app.globalData.sharePic,
    salePrice: null,
    referPrice: null,
    rebatePrice: null,
    itemName: "",
    itemId: null,
    sellerId: null,
    promotionId: null,
    saleTypeDesc: null,
    //类目位置标记
    currentNavtab: 0,
    //滑动切换存放对应数据
    itemObj: {},
    isLoading: true,
    itemIsLoading: false,
    scene: null,
    inviteCode: null,

    // 首页图标数据
    iconData: [],
    // 返回顶部图标
    backShow: true,
    showTabContent: false, //是否展示全部类目
    showClipboard: false, // 展示粘贴板
    //占位图显示
    zhanweiPic: true,
    curTabIndex: 0, //默认展示tab 第一个类目的数据

    productionList: [], //商品列表
    totalCount: 0,
    triggered: false,
    loading: false,

    hotArr: [], //tab数据
    referenceUserInfo: false, // 是否是推广者
    showIconContent: true, //是否显示icon模块
		userLevel: "1", //用户等级，默认是1.如果referenceUserInfo内有level的值，则取该level值
		scrollIndexView:'', 
		scrollLeft:0
  },
  onLoad: function() {
	this.setData({
		triggered: true
	})
    this.initData();
  },
  onShow: function() {
    this.fetchIsReferenceUser();
  },
  onReady: function() {
		wx.createSelectorQuery().select('.scroll-view').boundingClientRect((rect)=>{
			this.data.scrollViewWidth = Math.round(rect.width)
		}).exec()
    this.setData({
      showClipboard: true,
    });
  },
  onHide: function() {
    this.setData({
      showClipboard: false,
    });
  },
  onUnload: function() {
    this.setData({
      showClipboard: false,
    });
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
	  this.setData({
      triggered: true,
      pageNo: 1,
      productionList: []
    })
    this.getProductionList(this.data.curTabIndex);
    // TODO: 刷新页面请求
  },
  onReachBottom: function() {
    //触底时执行这里
    if (this.data.hasMoreData) {
      this.getProductionList(this.data.curTabIndex);
    }
  },

  switchTabContent() {
    this.setData({
      showTabContent: !this.data.showTabContent, //控制全部类目下拉框的显示隐藏
    });

    if (this.data.showTabContent) {
      return false;
    }
  },
  fetchIsReferenceUser() {
    fetchIsReferenceUser().then((res) => {
      if (!!res) {
        //必须有else，切换推广者和非推广者时，页面更新
        this.setData({
          referenceUserInfo: res,
          userLevel: res.level,
        });
      } else {
        this.setData({
          referenceUserInfo: false,
          userLevel: "1",
        });
      }
    });
  },

  async getProductionList(currentId) {

    this.setData({
      loading: true,
    });
    let productListParamObj = await GWMaterialParamsConvert(
      this.data.hotArr[currentId].extension
    );
    let newProductListParamObj = Object.assign(productListParamObj, {
      userLevel: this.data.userLevel,
      pageSize: this.data.pageSize,
			pageNo: this.data.pageNo 
    });
    queryProductionListReq(newProductListParamObj)
      .then((res) => {
        if (res.code=="0000" && res.data) {
          let newGoodsList = this.data.productionList.concat(
            res.data.goodsList
          );
          this.setData({
            productionList: newGoodsList,
            pageNo: this.data.pageNo + 1,
          });
          let isNextPage = newProductListParamObj.skuIds.length > 0; //如果入参有skuId,就不能请求第二页了
          if ((this.data.pageSize > res.data.goodsList.length && !res.data.hasNextPage) || isNextPage) {
            //没有下一页了
            this.setData({
              hasMoreData: false,
            });
          }
        } else {
          wx.showToast({
            title: "数据请求失败，请稍后重试",
            icon: "none",
            duration: 1000,
          });
        }
      })
      .finally(() => {
        this.setData({
          loading: false,
          triggered: false
        });
      });
  },
  // 获取icon
  getDelivery: function(id, callback) {
    httpsGet({
      url: "/api",
      data: {
        functionId: "queryGWMaterialAdverts",
        body: id,
        appid: "jdhunion",
      },
    }).then(function(res) {
      if ((res.code = "0000" && res.data)) {
        callback && callback(res.data);
      }
    });
  },
  goInIconDetail(e) {
    let iconDetailObj = e.currentTarget.dataset.item;
    try {
      wx.setStorageSync("iconDetailObj", iconDetailObj);
    } catch (e) {
      console.error("icon详情数据设置失败", e);
    }

    wx.navigateTo({
      url: `/pages/distributionIconDetail/distributionIconDetail`,
    });
	}, 
  async switchTab(e) { 
		let { index } = e.currentTarget.dataset; //index 当前点击是第几个元素
		// let offsetLeft = e.currentTarget.offsetLeft
		// this.setData({
		// 	scrollLeft: offsetLeft - this.data.scrollViewWidth/2
		// })  
    this.setData({ 
      curTabIndex: index,
      showTabContent: false,
      productionList: [],
      pageNo: 1,
			hasMoreData: true,
			scrollIndexView:'tab'+index 
    });

    if (index > 0) {
      //类目第一个tab才显示icon区域，其他不显示
      this.setData({
        showIconContent: false,
      });
    } else {
      this.setData({
        showIconContent: true,
      });
    }

    this.getProductionList(index); //hotArrIndex-index
  },
  async initData() {
    const brandInfo = await getBrandBaseInfo();
    await this.fetchIsReferenceUser();
    //enable是否开启分销  hotSearchAdGroupId热搜词
    const { homeTabAdGroupId, homeIconAdGroupId } = brandInfo.cpsConfig;

    //图标
    this.getDelivery(homeIconAdGroupId, (data) => {
      this.setData({
        iconData: data[0].list || [],
        zhanweiPic: false,
      });
    });
    //tab
    this.getDelivery(homeTabAdGroupId, async (data) => {
      let hotArr = data[0].list || [];
      hotArr.forEach((ele, i) => {
        //把tab的name截取成4位中文或8位英文
        hotArr[i].name = cutbytestr(ele.name, 8);
      });
      this.setData({
        hotArr,
      });
      //商品列表
      this.getProductionList(0); //hotArrIndex-0,pageIndex-1
    });
  },
  //跳到推广中心页面
  goToPromotionPage() {
    wx.navigateTo({
      url: `/pages/distributionPromotionCenter/promotionCenter`,
    });
  },
  // 跳转搜索页
  goToSearchPage() {
    wx.navigateTo({
      url: `/pages/distributionSearchList/distributionSearchList`,
    });
  },
  /**
   * 分享
   * */
  onShareAppMessage: function(res) {
    return shareAppMessage(res, this.data.currentShareItem);
  },
  // 监听 "分享赚"
  listenShare: function(e) {
    let val = e.detail.item;
    // cps商品
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
      referenceUserInfo: this.data.referenceUserInfo,
    };
    this.setData({
      shareCpsItem: tempItem,
      currentShareItem: tempItem,
      codeCallCpsShare: "01",
      currentShareType: "CPS",
    });
  },

  // 监听用户滑动页面事件
  onPageScroll: function(e) {
    let { backShow } = this.data;
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  // onPullDownRefresh: function() {
  // let {
  // 	statusArray,
  // 	itemObj,
  // 	currentNavtab
  // } = this.data;
  // let id = statusArray[currentNavtab].id;
  // itemObj['b' + id].dataList = [];
  // this.queryAllProductList(statusArray[currentNavtab].isUseQueQiao, id, {
  // 	pageNum: 1,
  // 	saleCode: statusArray[currentNavtab].channelCode
  // }, itemObj);
  // },
  onReachBottom: function() {
    //触底时执行这里
    if (this.data.hasMoreData) {
      this.getProductionList(this.data.curTabIndex);
    }
  },
  // 监听用户滑动页面事件
  onPageScroll: function(e) {
    let { backShow } = this.data;
    if (e.scrollTop > 200 && !!backShow) {
      this.setData({
        backShow: false,
      });
    }
    if (e.scrollTop <= 200 && !backShow) {
      this.setData({
        backShow: true,
      });
    }
  },
  /*
   * 禁止屏幕划动触发
   */
  preventTouchMove: function(e) {},
});
