import {
    queryStoreDetailReq,
    generateQrCode,
    getNearStoreReq,
    queryActivityCoupons,
} from "@/api/index";
import {
    setFMInit,
    toh5,
    getMPQrCodeParams,
    getBrandBaseInfo,
} from "@/utils/JDH-pharmacy/index";
import kGetCleanOpenid from "@/utils/getOpenid";
import { ArrayToHeavy } from "@/utils/JDH-pharmacy/index";
import { APPID } from "@/constants/index";
import {
    APPType,
    LocationInfoType,
    JpassStoreInfoType,
} from "@/types/index";
import { getLocation, formatDistance, emitter } from "@/utils/util";
const app = getApp<APPType>();
// interface ShopFrontData {
//     options: any;
//     title: string;
//     storeId: string;
//     venderId: string;
//     jpassStoreInfo: JpassStoreInfoType;
//     yjsStoreInfo: any;
//     showFloorMap: any;
//     isHasShopInfo: boolean;
//     showFewTime: boolean;
//     longitude: number;
//     latitude: number;
//     fresherCoupons: any[]; // 新入会的优惠券
//     activityId: number | null;
//     activityType: number | null;
//     skeletonShow: boolean
// }

Page({
    data: {
        title: "", //微信埋点勿删
        storeId: "", //微信埋点勿删
        venderId: "",
        jpassStoreInfo: {} as JpassStoreInfoType, // 门店信息
        yjsStoreInfo: null, // 药急送门店信息
        isHasShopInfo: true, //是否有门店信息
        showFewTime: true,
        longitude: 0,
        latitude: 0,
        options: {},
        showFloorMap: {},
        fresherCoupons: [],
        activityId: null,
        activityType: 1,
        skeletonShow: true,
    },

    onLoad(options) {
        this.setData!({
            options: options,
        });
        setTimeout(() => {
            this.setData!({
                showFewTime: false,
            });
        }, 3000);
        setFMInit(this); //初始化指纹参数
        app.toShareUrl(options!, this); //  分享登陆态跳转页面分享的特殊处理
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        if (wx.getStorageSync("storeId") || wx.getStorageSync("venderId")) {
            this.setData!({
                storeId: wx.getStorageSync("storeId"),
                venderId: wx.getStorageSync("venderId") || "",
            });
        }

        getLocation((location) => {
            const { latitude, longitude }: LocationInfoType = location;
            this.setData!({
                longitude: longitude || 0,
                latitude: latitude || 0,
            });
            this.queryStoreDetail();
        });
    },

    onReady() {
        this.setFloorMap();
        setTimeout(() => {
            this.setData!({
                skeletonShow: false,
            });
        }, 500);
    },

    onReachBottom() {
        // @ts-ignore
        emitter.emit("onReachBottom");
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {
        const { venderId, storeId, title, jpassStoreInfo } = this.data!;

        return {
            title: `为您推荐${title}`,
            imageUrl: jpassStoreInfo.storePic,
            path: `/pages/newShop/shopFront?venderId=${venderId}&storeId=${storeId}`,
        };
    },
    onHide() {
        this.setData!({
            options: {},
        });
    },
    /**
     * 解析options，根据options的参数来处理各种场景
     * @param {*} options
     */
    // resloveOptions() {
    //     return new Promise(async (resolve) => {
    //         const options = this.data!.options;
    //         const hasOptions = Object.keys(options).length > 0;
    //         if (hasOptions) {
    //             // 分享卡片等打开
    //             if (options.storeId || options.venderId) {
    //                 app.globalData.storeId = options.storeId;
    //                 resolve({
    //                     storeId: options.storeId,
    //                     venderId: options.venderId || "",
    //                 });
    //             }
    //             // 旧版小程序码二维码
    //             if (options.id) {
    //                 let queryParams = options.id.split(",");
    //                 if (queryParams && queryParams.length > 1) {
    //                     app.globalData.storeId = queryParams[0];
    //                     resolve({
    //                         storeId: queryParams[0],
    //                         venderId: queryParams[1],
    //                     });
    //                 }
    //             }
    //             // 扫小程序码
    //             if (options.scene) {
    //                 try {
    //                     const result = await getMPQrCodeParams(options);
    //                     app.globalData.storeId = result.storeId;

    //                     resolve(result);
    //                 } catch (err) {
    //                     wx.showModal({
    //                         title: "",
    //                         content: `${err}`,
    //                         showCancel: false,
    //                     });
    //                 }
    //             }
    //         } else {
    //             resolve({
    //                 storeId: app.globalData.storeId,
    //             });
    //         }
    //     });
    // },
    async setFloorMap() {
        try {
            const { showFloorMap } = await getBrandBaseInfo();
            this.setData!({
                showFloorMap,
            });
        } catch (e) {
            console.error(e);
        }
    },
    onCouponDialogClose() {
        this.queryStoreDetail();
    },
    // 获取新人券
    queryActivityCoupons() {
        const { storeId, venderId } = this.data!.jpassStoreInfo;

        if (storeId && venderId) {
            queryActivityCoupons(storeId, venderId).then((res) => {
                const data = res.data;
                if (data) {
                    this.setData!({
                        fresherCoupons: data.coupons,
                        activityId: data.activityId,
                        activityType: data.activityType,
                    });
                } else {
                    this.setData!({
                        fresherCoupons: [],
                    });
                }
            });
        } else {
            this.setData!({
                fresherCoupons: [],
                activityId: null,
                activityType: null,
            });
        }
    },
    // 门店详细信息。
    async queryStoreDetail() {
        const { latitude, longitude } = this.data!;
        const { storeId } = await resloveOptions(this.data!.options);
        // 通过导购二维码 小程序分享卡片 等场景进入门店时会携带storeId
        if (storeId) {
            this.getStoreByStoreId(storeId);
        } else {
            // 如果没有storeId则说明用户是正常打开小程序，则需要使用lbs获取附近门店，
            // 根据定位获取storeId后再查询门店信息
            this.getStoreByLocated(longitude, latitude);
        }
    },

    async getStoreByLocated(longitude: string, latitude: string) {
        const { bizId, brandId } = await getBrandBaseInfo();
        getNearStoreReq(longitude, latitude, bizId, brandId).then((res) => {
            if ((res.code = "0000" && res.data)) {
                const data = res.data;
                const storeId = data.storeId;
                this.setData!({
                    storeId: storeId,
                    isHasShopInfo: true,
                });
                //只有定位信息，没有门店id时，请求完附近门店接口，有可能有门店信息出来，此时还需要查询详情
                this.getStoreByStoreId(storeId);
            } else {
                this.setData!({
                    jpassStoreInfo: {} as JpassStoreInfoType,
                    isHasShopInfo: false,
                });
            }
        });
    },

    async getStoreByStoreId(storeId: string) {
        // 全局记录storeID
        app.globalData.storeId = storeId;
        const { longitude, latitude } = this.data!;
        try {
            const openId = await kGetCleanOpenid();
            this.historyShopRecord(storeId, openId);
        } catch (err) {
            console.error(err);
        }

        queryStoreDetailReq(storeId, longitude, latitude)
            .then((res) => {
                const data = res.data;
                // 处理店铺信息
                if (res.code === "0000" && data) {
                    // 处理店铺详情
                    const jpassStoreInfo = processStoreInfo(data);
                    this.recordStoreInfo(jpassStoreInfo, data.yjsStoreInfo);
                    this.setData!({
                        title: data.storeName,
                        yjsStoreInfo: data.yjsStoreInfo,
                        jpassStoreInfo: jpassStoreInfo,
                        storeId: data.storeId,
                        venderId: data.venderId,
                        isHasShopInfo: true,
                    });
                    this.queryActivityCoupons();
                } else {
                    this.setData!({
                        isHasShopInfo: false,
                    });
                }
            })
            .catch((error) => {
                console.log(error);
            });
    },

    historyShopRecord(storeId: string, openId: string) {
        let newHistory = [];
        try {
            newHistory =
                JSON.parse(
                    JSON.stringify(
                        wx.getStorageSync("historyShopRecord-" + openId)
                    )
                ) || [];
            newHistory.unshift(Number(storeId));
            newHistory = ArrayToHeavy(newHistory); //去重
            wx.setStorageSync("historyShopRecord-" + openId, newHistory);
        } catch (e) {
            console.error("设置门店历史访问记录失败", e);
        }
    },

    // 存入jpassStoreInfo 在门店详情页的时候展示免去请求接口
    recordStoreInfo(jpassStoreInfo: JpassStoreInfoType, yjsStoreInfo?: any) {
        wx.setStorageSync("jpassStoreInfo", jpassStoreInfo);
        wx.setStorageSync("yjsStoreInfo", yjsStoreInfo);
    },

    getQcCode() {
        wx.showLoading({
            title: "正在生成",
        });
        const params = {
            url: "pages/newShop/shopFront",
            wxAppId: APPID,
            venderId: this.data!.venderId,
            storeId: this.data!.storeId,
        };
        generateQrCode(params)
            .then(([qrCodeUrl, bGImgUrl]) => {
                const info = {
                    qrCodeUrl,
                    bGImgUrl,
                    title: this.data!.title, // 导购员名字
                };
                const poster = this.selectComponent("#poster");

                if (poster) {
                    poster.makerPoster(info).then(() => {
                        wx.hideLoading();
                    });
                }
            })
            .catch((err) => {
                console.error(err);
                wx.hideLoading();
            });
    },
    toShare(obj: any) {
        if (obj.detail.type === "image") {
            this.getQcCode();
        }
    },
    // 去往店送的搜素H5页面
    gotoDSSearch: function() {
        // 如果jpass门店不支持店送，不跳转药急送的界面
        if (!this.data!.jpassStoreInfo.supportDs) return;

        let { venderId, storeId } = this.data!.yjsStoreInfo;
        let url = `${app.diansongUrl}/search?venderid=${venderId}&storeid=${storeId}&origin=go`;

        toh5(url);
    },
});

function formatAddress(address: string) {
    return address.length > 40 ? address.substring(0, 40) + "..." : address
}

function processStoreInfo(data: any) {
    return {
        ...data,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        isWithinFence: data.supportDs ? !data.isWithinFence : false, // 是否超过配送范围
        distance: formatDistance(data.distance),
        storeAddress: formatAddress(data.storeAddress)
    };
}

function resloveOptions(options: any):Promise<{storeId: string, venderId?: string}> {
    return new Promise(async (resolve) => {
        const hasOptions = Object.keys(options).length > 0;
        if (hasOptions) {
            // 分享卡片等打开
            if (options.storeId || options.venderId) {
                app.globalData.storeId = options.storeId;
                resolve({
                    storeId: options.storeId,
                    venderId: options.venderId || "",
                });
            }
            // 旧版小程序码二维码
            if (options.id) {
                let queryParams = options.id.split(",");
                if (queryParams && queryParams.length > 1) {
                    app.globalData.storeId = queryParams[0];
                    resolve({
                        storeId: queryParams[0],
                        venderId: queryParams[1],
                    });
                }
            }
            // 扫小程序码
            if (options.scene) {
                try {
                    const result = await getMPQrCodeParams(options);
                    app.globalData.storeId = result.storeId;

                    resolve(result);
                } catch (err) {
                    wx.showModal({
                        title: "",
                        content: `${err}`,
                        showCancel: false,
                    });
                }
            }
        } else {
            resolve({
                storeId: app.globalData.storeId,
            });
        }
    });
}