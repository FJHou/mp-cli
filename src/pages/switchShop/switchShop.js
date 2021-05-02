//获取应用实例
var app = getApp();
import { getLocation, globalLoginShow, formatDistance } from "../../utils/util";
import { getBrandBaseInfo } from "../../utils/JDH-pharmacy/index";
import {
    getStoreListReq,
    queryAddressReq,
    getHistoryStoreListReq,
} from "../../api/index";
import kGetCleanOpenid from "../../utils/getOpenid";

Page({
    data: {
        images: {
            addImage: `https://img12.360buyimg.com/imagetools/jfs/t1/129926/13/12264/789/5f8696cdEe0ef0101/f4743ea1d7b9a324.png`,
        },
        winWidth: 0,
        winHeight: 0,
        currentTab: 0,
        currentLabTab: 0,
        swiperHeight: 0,
        warpHeight: "", //初始高度置空
        hasMoreData: true, //上拉时是否继续请求数据，即是否还有更多数据
        choiceLocation: "", //定位地址
        longitude: "", //经度
        latitude: "", //纬度
        pageIndex: 1,
        pageSize: 10,
        currentShop: "", //当前选中门店
        hasNoData: false, //控制门店没数据时提示信息显隐
        pullNoData: true, //下拉刷新时没有更多数据
        storeLists: [], //门店列表数据
        hasStoreLists: true, //
        historyShopLists: [], //历史访问门店数据
    },
    onLoad: function(options) {
        // this.options = options;
        var self = this;
        wx.getSystemInfo({
            success: function(res) {
                self.setData({
                    currentShop: app.globalData.storeId || "",
                    warpHeight:
                        res.windowHeight - (260 * res.windowWidth) / 750,
                });
            },
        });
    },
    onShow: function() {
        // this.getPositionInfo(); //获取地址信息
        // // 登录用户要获取 用户地址列表
        // const isLogined = getPtKey();
        // this.setData({
        // 	isLogined: !!isLogined
        // });
        // if (isLogined) {
        // 	this.getAddressList();
        // }
		// 重新定位回来或者 选择地址回来 重置经纬度信息
        if (
            this.data.backSource === "locationGet" ||
            this.data.backSource === "locationAdress"
        ) {
            getLocation((res) => {
                this.setData({
                    longitude: res.longitude,
                    latitude: res.latitude,
                });
            });
        }
        const { longitude, latitude } = wx.getStorageSync("locationInfo");

        this.setData({
            longitude,
            latitude,
            pageIndex: 1,
        });

        this.getAddress(); //从平台首页进入的通过经纬度获取获取地址名称
        this.getStoreList("正在加载数据..."); //加载门店列表信息
        this.getHistoryList();
    },
    /**
     * 获取历史访问记录
     */
    async getHistoryList() {
        //获取历史访问门店id-前十个数据
        let openId = await kGetCleanOpenid();
        let jpassStoreIds = [];
        try {
            jpassStoreIds = wx
                .getStorageSync("historyShopRecord-" + openId)
                .slice(0, 10);
        } catch (e) {
            console.err("获取历史记录缓存失败", e);
        }

        //通过id访问历史访问记录
        if (jpassStoreIds) {
            getHistoryStoreListReq(
                jpassStoreIds,
                this.data.longitude,
                this.data.latitude
            )
                .then((res) => {
                    if (res.success) {
                        let contentlist = res.data || [];
                        //对返回的distance距离数据进行格式转化-start
                        contentlist.forEach((list, i, lists) => {
                            lists[i].distance = formatDistance(list.distance);
                        });
                        this.setData({
                            historyShopLists: contentlist || [],
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    },
    /**
     * 修改地址
     */
    modifyAddress() {
        wx.navigateTo({
            url: `/pages/location/location`,
        });
    },
    loadMore() {
        if (this.data.hasMoreData) {
            //页面触底执行分页逻辑
            ++this.pageIndex;
            this.getStoreList();
        }
    },
    /**
     * 滑动切换tab
     */
    bindChange: function(e) {
        if (e.detail.source == "touch") {
            this.setData({
                currentLabTab: e.detail.current,
                currentTab: e.detail.current,
            });
            // this.getShopCoupon(e.detail.current);
        }
    },
    // tab切换
    swichNav: function(e) {
        var that = this;
        if (that.data.currentTab == e.currentTarget.dataset.currentLab) {
            return false;
        } else {
            that.setData({
                currentTab: e.currentTarget.dataset.currentLab,
                currentLabTab: e.currentTarget.dataset.currentLab,
            });
        }
    },
    /**
     * 获取门店列表信息
     */
    async getStoreList(message) {
        let self = this;
        let branchInfo = await getBrandBaseInfo();
        wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画
        wx.showLoading({
            //显示 loading 提示框
            title: message,
        });
        getStoreListReq(
            branchInfo.brandId,
            branchInfo.bizId,
            self.data.longitude,
            self.data.latitude,
            self.data.pageIndex,
            self.data.pageSize
        ).then((res) => {
            if (res.success) {
                let contentlistTem = self.data.storeLists;
                let contentlist = [];
                if (res.data.data.length > 0) {
                    wx.hideNavigationBarLoading(); //在当前页面隐藏导航条加载动画
                    wx.hideLoading(); //隐藏 loading 提示框

                    if (self.data.pageIndex == 1) {
                        contentlistTem = [];
                    }
                    contentlist = res.data.data;
                    //对返回的distance距离数据进行格式转化-start
                    contentlist.forEach((list, i, lists) => {
                        lists[i].distance = formatDistance(list.distance);
                    });
                    //对返回的distance距离数据进行格式转化-end
                    //let totalLength = contentlistTem.concat(contentlist);
                    if (res.data.totalPage > self.data.pageIndex) {
                        self.setData({
                            storeLists: contentlistTem.concat(contentlist),
                            hasMoreData: true,
                            pageIndex: self.data.pageIndex + 1,
                            hasStoreLists: true,
                        });
                    } else {
                        self.setData({
                            storeLists: contentlistTem.concat(contentlist),
                            hasMoreData: false,
                            hasStoreLists: true,
                        });
                    }
                } else {
                    wx.hideNavigationBarLoading(); //在当前页面隐藏导航条加载动画
                    wx.hideLoading(); //隐藏 loading 提示框
                    self.setData({
                        storeLists: [],
                        hasStoreLists: false,
                    });
                }
                if (res.data.totalPage == 1 && contentlist.length < 1) {
                    //处理初次加载无数据返回
                    self.setData({
                        hasNoData: true,
                    });
                }
            } else {
                wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画
                wx.showLoading({
                    //显示 loading 提示框
                    title: "获取数据失败",
                    icon: none,
                });
            }
        });
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        this.data.pageIndex = 1;
        this.getStoreList("正在刷新数据");
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        if (this.data.hasMoreData) {
            this.getStoreList("加载更多数据");
        } else if (!this.data.hasMoreData && this.data.hasNoData) {
            this.setData({
                pullNoData: false,
            });
        }
    },
    toLogin() {
        globalLoginShow({
            data: {
                returnpage: "/pages/location/location",
                fromPageLevel: 1,
            },
        });
    },
    // 登录成功后，这个页面会有两层页面栈，这个方法用来防止这个页面返回两次
    goback() {
        let pages = getCurrentPages();
        let delta = 0;
        for (let i = pages.length - 1; i > 0; i--) {
            if (pages[pages.length - 1].route === pages[i].route) {
                delta += 1;
            }
        }
        wx.navigateBack({
            delta: delta,
        });
    },
    getAddress() {
        this.getPostionName({
            latitude: this.data.latitude,
            longitude: this.data.longitude,
        }).then((curLocation) => {
            let choiceLocation = wx.getStorageSync("choiceLocation");
            if (!choiceLocation && !curLocation) {
                //没有任何定位信息
                //跳转到我的地址页面，提示用户开启定位权限
                choiceLocation = "定位失败,请点击重新定位";
                wx.navigateTo({
                    url: `/pages/location/location`,
                });
            } else if (!choiceLocation) {
                //没有缓存定位信息时，取返回的curLocation地址信息
                choiceLocation = curLocation;
            }
            this.setData({
                choiceLocation,
            });
        });
    },
    /**
     * 根据经纬度查询地址名称
     */
    getPostionName: function(location) {
        return new Promise((resolve, reject) => {
            queryAddressReq(location.longitude, location.latitude)
                .then((res) => {
                    resolve(
                        res.data && res.data[0] && res.data[0].title
                            ? res.data[0].title
                            : ""
                    );
                })
                .catch((res) => {
                    reject(res);
                });
        });
    },
    noticeStartLocation() {
        wx.showModal({
            title: "打开设置页面进行授权",
            content: "需要获取您的地理位置，请到小程序的设置中打开地理位置授权",
            confirmText: "去设置",
            success: (confirmReponse) => {
                if (confirmReponse.confirm) {
                    wx.openSetting({
                        success: (setReponse) => {
                            if (setReponse.authSetting["scope.userLocation"]) {
                                wx.getLocation({
                                    type: "gcj02",
                                    altitude: false,
                                    success: (reponse) => {
                                        this.resetLocation(reponse);
                                    },
                                });
                            }
                        },
                    });
                }
            },
        });
    },
    /**
     * 前往门店首页
     * @param {*} storeid - 门店ID
     * @param {*} venderid - 门店wenderId
     */
    redirectShopFront: function(e) {
        let storeId = e.currentTarget.dataset.storeid;
        let venderId = e.currentTarget.dataset.venderid;

        app.globalData.storeId = storeId;
        app.globalData.venderId = venderId;
        wx.switchTab({
            url: `/pages/newShop/shopFront`,
        });
    }
});
