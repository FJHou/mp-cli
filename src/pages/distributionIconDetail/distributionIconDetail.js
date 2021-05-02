//获取应用实例
import { queryProductionListReq } from "../../api/index";
import { fetchIsReferenceUser } from "../../utils/JDH-pharmacy/index";
import { GWMaterialParamsConvert } from "../../utils/JDH-pharmacy/GWMaterialParamsConvert";
import shareAppMessage from "../distributionIndex/shareAppMessage";
import { getTypeLabel } from "../distributionGoodDetail/helpers";
Page({
    data: {
        warpHeight: "", //初始高度置空
        hasMoreData: true, //上拉时是否继续请求数据，即是否还有更多数据
        pageNo: 1,
        pageSize: 10,
        hasNoData: false, //控制门店没数据时提示信息显隐
        pullNoData: true, //下拉刷新时没有更多数据
        productionList: [], //商品列表数据
        referenceUserInfo: null, //推广者信息
        userLevel: "1", //用户等级，默认是1.如果referenceUserInfo内有level的值，则取该level值
        codeCallCpsShare: "00",
        productInfo: {},
    },
    onLoad: function () {
        try {
            this.setData({
                productionParamList: wx.getStorageSync("iconDetailObj"),
            });
        } catch (e) { }
        wx.setNavigationBarTitle({
            title: this.data.productionParamList.name,
        });

        this.fetchIsReferenceUser(); //用户等级
        this.getProductionList(); //加载商品列表信息

    },
    onShow: function () {

    },
    onShareAppMessage(res) {
        return shareAppMessage(res, this.data.productInfo)
    },

    listenShare(e) {
        let val = e.detail.item;
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
    fetchIsReferenceUser() {
        fetchIsReferenceUser().then((res) => {
            if (!!res) {
                this.setData({
                    referenceUserInfo: res,
                    userLevel: res.level,
                });
            } else {
                this.setData({
                    referenceUserInfo: null,
                    userLevel: '1',
                });
            }
        });
    },
    async getProductionList() {
        wx.showLoading({
            title: "数据请求中...",
            mask: true,
        });
        let productListParamObj = await GWMaterialParamsConvert(
            this.data.productionParamList.extension
        );
        let newProductListParamObj = Object.assign(productListParamObj, {
            userLevel: this.data.userLevel,
            pageSize: this.data.pageSize,
            pageNo: this.data.pageNo
        });
        queryProductionListReq(newProductListParamObj)
            .then((res) => {
                wx.hideLoading();
                if (res.code == "0000" && res.data) {
                    let newGoodsList = this.data.productionList.concat(
                        res.data.goodsList
                    );
                    this.setData({
                        productionList: newGoodsList,
                        pageNo: this.data.pageNo + 1,
                    });
                    let isNextPage = newProductListParamObj.skuIds.length > 0; //如果入参有skuId,就不能请求第二页了
                    if (!isNextPage && this.data.productionList.length < 1) {//没有数据
                        this.setData({
                            hasNoData: true,
                        });
                    } else if ((this.data.pageSize > res.data.goodsList.length && !res.data.hasNextPage) || isNextPage) {//下拉时没有更多数据
                        this.setData({
                            hasMoreData: false,
                        });
                    }
                } else {
                    wx.showToast({
                        title: "数据请求失败,请稍后再试",
                        icon: "none",
                        duration: 1000,
                    });
                }
            })
            .catch((error) => {
                console.log('icon落地页请求失败')
            });
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (this.data.hasMoreData) {
            this.getProductionList(); //加载商品列表信息
        }
    },
});
