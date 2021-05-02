const app = getApp();

import { queryProductionListReq } from "../../api/index";
import { httpsGet } from "../../utils/util.js";
import { fetchIsReferenceUser } from "../../utils/JDH-pharmacy/index";
import { getBrandBaseInfo, ArrayToHeavy } from "../../utils/JDH-pharmacy/index";
import { getTypeLabel } from "../distributionGoodDetail/helpers";
import shareAppMessage from "../distributionIndex/shareAppMessage";

Page({
    data: {
        defaultPic: app.globalData.defaultPic,
        activeIndex: 0, //当前排序默认项
        keyword: "", //当前页面重新输入关键词
        pageNo: 1, //当前页码
        pageSize: 20, //每页条数
        hasMoreData: true,
        loading: false,

        sortMethod1: "comSort", //按sortMethod1排序
        orderByType: "", //顺序，升序asc，降序desc 默认降序
        isCoupon: null, //筛选是否支持优惠券
        secondFilterShow: false,
        secondSearch: "100", //京东销售方式
        secondSearhShow: false, //二级检索条件
        isPG: null, //是否是拼购商品，1：拼购商品，0：非拼购商品
        owner: "", //商品类型：自营[g]，POP[p]
        secondSearchJDItems: [
            { id: "10", name: "京东自营" },
            { id: "20", name: "京东拼购" },
        ],
        codeCallCpsShare: "00",
        productInfo: {},

        scrollTop: 0,
        historySearchArr: [], //记录的历史搜索数据
        headLoading: false,
        mainHeight: wx.getSystemInfoSync().windowHeight,

        productionList: [], //商品数据
        hotSearchList: [], //热搜关键词数据
        isBeforeSearch: true,
        referenceUserInfo: null, //推广者信息
        userLevel: "1", //用户等级，默认为1
        hasBestCoupon: null,
    },
    onLoad: function() {
        this.noKeyWord();
    },
    onShow: function() {
        this.fetchIsReferenceUser(); //必须在onshow，返回时更新是否是推广者按钮展示
    },
    async noKeyWord() {
        let historySearchArr = [];
        try {
            historySearchArr =
                JSON.parse(
                    JSON.stringify(wx.getStorageSync("historySearchRecord"))
                ) || [];
        } catch (e) {
            console.error("分销搜索记录获取失败:", e);
        }

        historySearchArr = historySearchArr.slice(0, 20); //历史记录展示最近20条数据
        const brandInfo = await getBrandBaseInfo();
        // hotSearchAdGroupId热搜词
        const { hotSearchAdGroupId } = brandInfo.cpsConfig;
        //热搜词
        this.getDelivery(hotSearchAdGroupId, (data) => {
            this.setData({
                hotSearchList: data[0].list,
                historySearchArr,
            });
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
                    userLevel: "1",
                });
            }
        });
    },
    // 获取热搜词
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
    //请求接口查询商品列表数据集
    getProductionList() {
        this.setData({
            loading: true,
        });
        wx.showLoading({
            title: "数据加载中...",
        });
        let sortName =
            this.data.sortMethod1 == "comSort" ? "" : this.data.sortMethod1; //如果是综合排序，不创sortName
        let productListParamObj = {
            userLevel: this.data.userLevel,
            keyword: this.data.keyword,
            sortName: sortName,
            sort: this.data.orderByType,
            isCoupon: this.data.isCoupon,
            isPG: this.data.isPG,
            owner: this.data.owner,
            pageNo: this.data.pageNo,
            pageSize: this.data.pageSize,
            hasBestCoupon: this.data.hasBestCoupon,
			forbidTypes: "10,11"
        };
        queryProductionListReq(productListParamObj)
            .then((res) => {
                wx.hideLoading();
                if (res.code == "0000" && res.data) {
                    let getGoodData = this.data.productionList.concat(
                        res.data.goodsList
                    );

                    this.setData({
                        productionList: getGoodData,
                        isBeforeSearch: false, //隐藏历史搜索和热门搜索
                        pageNo: this.data.pageNo + 1,
                        loading: false,
                    });

                    if (
                        res.data.goodsList.length < this.data.pageSize &&
                        !res.data.hasNextPage
                    ) {
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
            .catch((error) => {});
    },

    //二级筛选事件，重新请求数据
    onSelectSecondSearch: function(e) {
        let selsectedID = e.currentTarget.dataset.searchId;
        if (this.data.secondSearch == selsectedID) {
            //不是京东拼购也不是京东自营，默认是京东
            this.setData({
                secondSearch: "100",
                isPG: null,
                owner: "",
            });
        } else if (selsectedID == "10") {
            //京东自营
            this.setData({
                secondSearch: selsectedID,
                isPG: null, //非拼购 0 或null 待确认
                owner: "g", //自营
            });
        } else if (selsectedID == "20") {
            //京东拼购
            this.setData({
                secondSearch: selsectedID,
                isPG: 1, //拼购
                owner: "", //自营  ’p‘或null  待确认
            });
        }
        this.setData({
            pageNo: 1,
            hasMoreData: true,
            productionList: [],
        });
        //重新请求数据
        this.getProductionList();
        this.showSecondFilter();
    },
    //点击历史搜索或热门搜索里的关键词时
    searchKeyWord: function(e) {
        console.log("e.target.dataset.keyword:-----", e.target.dataset.keyword);
        var keyword = e.target.dataset.keyword;
        if (keyword) {
            this.setHistoryRecord(keyword);
        }

        this.setData({
            keyword: keyword,
            hasMoreData: true,
            isBeforeSearch: false,
            pageNo: 1,
        });
        this.getProductionList();
    },
    bindButtonTap: function() {
        this.setData({
            isSearching: true,
        });
    },
    //改变第一行搜索条件：优惠券 销量 佣金
    changeOrder: function(e) {
        this.setData({
            scrollTop: 0,
        });
        if (
            e.target.dataset.sortMethod1 == "inOrderCount30Days" ||
            e.target.dataset.sortMethod1 == "price"
        ) {
            //点击-升序降序取反
            var newOrderByType =
                this.data.orderByType == "asc" ? "desc" : "asc";
            this.setData({
                sortMethod1: e.target.dataset.sortMethod1,
                orderByType:
                    e.target.dataset.sortMethod1 == this.data.sortMethod1
                        ? newOrderByType
                        : "asc",
            });
        } else if (e.target.dataset.sortMethod1 == "commission") {
            //高佣金比
            this.setData({
                sortMethod1:
                    e.target.dataset.sortMethod1 == this.data.sortMethod1
                        ? ""
                        : "commission",
                orderByType: "desc",
            });
        } else if (e.target.dataset.sortMethod1 == "comSort") {
            //综合排序-不需要传sortName
            //更新优惠券状态  ----->综合排序
            this.setData({
                sortMethod1:
                    e.target.dataset.sortMethod1 == this.data.sortMethod1
                        ? ""
                        : "comSort",
                orderByType: "",
            });
        }
        this.setData({
            pageNo: 1,
            productionList: [],
            hasMoreData: true,
        });
        //重新请求数据
        this.getProductionList();
    },
    //切换筛选条件：是否展示优惠券商品
    switchChange() {
        this.setData({
            pageNo: 1,
            productionList: [],
            hasMoreData: true,
            hasBestCoupon: this.data.isCoupon ? null : 1,
            isCoupon: this.data.isCoupon ? null : 1, //注意：没有选择仅展示优惠券，就是什么都展示默认为null,不能为0
        });
        //重新请求数据
        this.getProductionList();
    },
    // 输入搜索内容
    bindTextAreaBlur(e) {
        console.log(e, "ddddddddd");
        var that = this;
        that.setData({
            keyword: e.detail.value,
        });
    },
    // 清空关键词
    searchProKeyWordClear: function(e) {
        this.setData({
            keyword: "",
        });
    },
    searchBtn() {
        //搜索按钮
        let that = this;
        let keyword = this.data.keyword.replace(/(^\s*)|(\s*$)/g, ""); //去除前后空格

        if (keyword) {
            this.setHistoryRecord(keyword); //搜索内容为空时，不加入历史记录
        }
        that.setData(
            {
                keyword: keyword,
                pageNo: 1,
                productionList: [],
                hasMoreData: true,
                loading: true,
                scrollTop: 0,
            },
            () => {
                // 调用后端接口，加载后端接口数据
                that.getProductionList();
            }
        );
    },
    // 输入框输入完成点击键盘搜索
    async bindTextSearchBtn(e) {
        let that = this;
        let keyword = e.detail.value.replace(/(^\s*)|(\s*$)/g, ""); //去除前后空格
        if (keyword) {
            this.setHistoryRecord(keyword); //搜索内容为空时，不加入历史记录
        }

        that.setData(
            {
                keyword: keyword,
                pageNo: 1,
                productionList: [],
                hasMoreData: true,
                loading: true,
                scrollTop: 0,
            },
            () => {
                // 调用后端接口，加载后端接口数据
                that.getProductionList();
            }
        );
    },
    setHistoryRecord(keyword) {
        //做访问记录缓存
        //记录访问历史
        try {
            let searchHistory =
                JSON.parse(
                    JSON.stringify(wx.getStorageSync("historySearchRecord"))
                ) || [];
            searchHistory.unshift(keyword);
            searchHistory = ArrayToHeavy(searchHistory); //去重
            wx.setStorageSync("historySearchRecord", searchHistory);
        } catch (e) {
            console.error("分销搜索记录添加失败:", e);
        }
        //记录访问历史
        //搜索记录缓存
    },
    //删除历史记录
    async delHistorySearch() {
        try {
            wx.removeStorageSync("historySearchRecord");
            this.setData({
                historySearchArr: [],
            });
        } catch (e) {
            console.error("分销搜索记录删除失败:", e);
        }
    },
    // 点击取消按钮返回首页
    searchCancle(e) {
        wx.switchTab({
            url: `/pages/distributionIndex/distributionIndex`,
        });
    },
    showSecondFilter() {
        this.setData({
            secondFilterShow: !this.data.secondFilterShow,
        });
        this.data.secondFilterShow
            ? this.slideupshow(
                  this,
                  "slide_up1",
                  this.data.secondFilterHeight,
                  1
              )
            : this.slideupshow(this, "slide_up1", 0, 1);
    },
    slideupshow: function(that, param, px, opacity) {
        var animation = wx.createAnimation({
            duration: 800,
            timingFunction: "ease",
        });
        animation
            .translateY(px)
            .opacity(opacity)
            .step();
        //将param转换为key
        var json = '{"' + param + '":""}';
        json = JSON.parse(json);
        json[param] = animation.export();
        //设置动画
        that.setData(json);
    },
    onShareAppMessage: function(res) {
        return shareAppMessage(res, this.data.productInfo);
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {},
    onReachBottom: function() {
        //触底时执行这里
        if (!this.data.loading && this.data.hasMoreData) {
            this.getProductionList();
        }
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    // onPullDownRefresh: function () {

    // }
});
