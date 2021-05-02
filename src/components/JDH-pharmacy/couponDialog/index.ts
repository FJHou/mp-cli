import {
    getShopCouponReq,
    drawActivityCoupons,
    drawJpassCouponReq,
    getEid,
    queryJpassCouponStatus,
} from "../../../api/index";
import { dateFormat } from "../../../utils/util";
import { CouponFromType } from "../../../types/index";
import { wxError, wxInfo } from "../../../utils/JDH-pharmacy/wxlog";
import {
    COUPON_DIALOG_CLOSED_TIME,
    USER_GETTING_COUPON_ID,
    COUPON_DIALOG_FROM_SCENE,
} from "../../../constants/index";
import { globalLoginShow, isLogin } from "../../../utils/loginUtils";

type STORE_TYPE = {
    1: "京东药急送使用";
    2: "到店使用";
};
type CouponType = {
    couponId: number; // 优惠券id
    storeType: keyof STORE_TYPE;
    activityType: number; // 活动类型
    beginTime: number;
    endTime: number;
    couponAmount: number; // 单张优惠券面值
    couponName: number; // 优惠券名称
    allProduct: number; // 1全部商品可用
    quota: number; // 满多少可用
    [key: string]: any;
};

Component({
    externalClasses: ["coupon-dialog-class"],

    properties: {
        fresherCoupons: {
            type: Array,
        },
        jpassStoreInfo: {
            type: Object,
        },
        yjsStoreInfo: {
            type: Object,
        },
        activityType: {
            type: Number,
        },
        activityId: {
            type: Number,
        },
    },

    observers: {
        "fresherCoupons, jpassStoreInfo, activityType": function() {
            this.initDialog();
        },
    },

    data: {
        title: "恭喜您被健康福利砸中～",
        visible: false,
        coupons: [],
        dialogType: "normal", // fresher（新人券弹窗） ｜ normal（正常弹窗券）
    },

    pageLifetimes: {
        show() {
            this.checkGettingCoupon();
        },
    },

    methods: {
        initDialog() {
            wxInfo("初始化优惠券弹窗", {
                fresherCoupons: this.data.fresherCoupons,
                isLogin: isLogin(),
            });

            // 从注册会员进入的自动领取新人券
            if (this.data.fresherCoupons.length && isLogin() && wx.getStorageSync(COUPON_DIALOG_FROM_SCENE) === "fresherCoupon") {
                this.getFresherCoupons();
            } else {
                this.getReceivableCoupons();
            }
        },
        handleClose() {
            this.setData({
                visible: false,
            });
            this.triggerEvent("close");
            // 场景：同时存在新人券和门店弹窗券的情况下，优先新人券弹窗，新人券弹窗关闭后再展示弹窗券
            if (this.data.dialogType === "fresher") {
                setTimeout(() => {
                    this.getReceivableCoupons();
                }, 300);
            } else {
                // 如果是弹窗券，则记录下本次关闭时间，保证一天内只弹一次弹窗券
                wx.setStorageSync(COUPON_DIALOG_CLOSED_TIME, new Date());
            }
        },
        // 领取到店弹窗优惠券
        async drawCoupon(couponId) {
            const eid = await getEid();
            const data = this.data;

            wx.showLoading({
                title: "正在领取...",
            });

            drawJpassCouponReq(
                data.jpassStoreInfo.storeId,
                data.jpassStoreInfo.venderId,
                couponId,
                data.activityType,
                eid
            )
                .then((result) => {
                    if (result.success) {
                        wx.showToast({
                            title: "领取成功",
                        });
                        this.setData({
                            visible: false,
                        });
                        setTimeout(() => {
                            wx.navigateTo({
                                url: `/pages/couponInfo/couponInfo?couponId=${couponId}`,
                            });
                        }, 1000);
                    } else {
                        wx.showToast({
                            title: result.msg,
                            icon: "none",
                        });
                    }
                })
                .catch((err) => {
                    console.error(err);
                    wxError(err);
                })
                .finally(() => {
                    wx.hideLoading();
                });
        },
        // 用户领取弹窗优惠券
        async handleOk() {
            // 当弹窗类型是普通的时候才能手动领取优惠券
            if (this.data.dialogType === "normal") {
                // 能执行到这说明this.data.coupons一定有值
                const couponId = this.data.coupons[0].couponId;
                // 当用未登录户点击领取弹窗券的时候记录，用户登录成功后调用接口请求下看用户是否领取过
                // 该弹窗券，如果领取过该弹窗券则提示
                if (!isLogin()) {
                    wx.setStorageSync(USER_GETTING_COUPON_ID, couponId);
                    globalLoginShow({
                        data: {
                            returnpage: "/pages/newShop/shopFront",
                            fromPageLevel: 1,
                        }
                    })
                } else {
                    this.drawCoupon(couponId);
                }
            }
        },
        // 获取新人券
        getFresherCoupons() {
            const { storeId, venderId } = this.data.jpassStoreInfo;
            const { activityType, activityId } = this.data;

            if (activityType && storeId) {
                drawActivityCoupons(storeId, venderId, activityType, activityId)
                    .then((res: any) => {
                        if (res.data) {
                            const coupons = couponKeyProcessor(
                                res.data.coupons
                            );
                            this.setData({
                                title: `已送您${coupons.length}张新会员专享优惠券`,
                                coupons: coupons,
                                visible: coupons.length > 0,
                                dialogType: "fresher",
                            });
                            wx.removeStorageSync(COUPON_DIALOG_FROM_SCENE);
                        } else {
                            wxError("领取新人券失败", res);
                        }
                    })
                    .catch((err) => {
                        wxError("领取新人券失败", err);
                    });
            } else {
                wxError("领取新人券失败", {activityType, storeId});
            }
        },
        // 获取可领取的弹窗券
        getReceivableCoupons() {
            const lastClosedTime = wx.getStorageSync("couponDialogClosedTime");
            // 如果上次关闭的日期和本次请求的日期为同一天，那么不展示弹窗
            if (isSameDay(lastClosedTime, new Date())) return;
            const storeId = this.data.jpassStoreInfo.storeId;

            if (storeId) {
                getShopCouponReq(storeId, 999, 1, 0).then((res: any) => {
                    if (res.code === "0000") {
                        let coupons = res.data.items;
                        if (coupons) {
                            coupons = couponKeyProcessor(coupons);
                            this.setData({
                                coupons: coupons.slice(0, 1), // 只展示第一张优惠券,
                                visible: coupons.length,
                                dialogType: "normal",
                            });
                        }
                    }
                });
            }
        },

        // 查询弹窗券是否领取过
        checkGettingCoupon() {
            const userGettingCouponId = wx.getStorageSync(
                USER_GETTING_COUPON_ID
            );
            // 如果登录之前点击过【领取】，则登录成功以后自动领取
            if (isLogin() && userGettingCouponId) {
                queryJpassCouponStatus(userGettingCouponId)
                    .then((res) => {
                        if (res.code === "0000" && res.data) {
                            // 不可领
                            if (res.data.status === 0) {
                                wx.showToast({
                                    title: res.data.msg,
                                    icon: "none",
                                });

                                this.setData({
                                    visible: false,
                                });
                            } else {
                                this.drawCoupon(userGettingCouponId);
                            }
                        }
                    })
                    .finally(() => {
                        wx.removeStorageSync(USER_GETTING_COUPON_ID);
                    });
            }
        },
    },
});

function isSameDay(prev: Date, last: Date): boolean {
    return new Date(prev).toDateString() === new Date(last).toDateString();
}

function couponKeyProcessor(coupons: CouponType[]) {
    return coupons.map((coupon) => couponKeyRewrite(coupon, 3));
}
//1:门店优惠券的药急送券；2：门店优惠券页面的到店券；3：门店首页优惠券
// 将优惠券的字段重写，方便ui展示
function couponKeyRewrite(coupon: CouponType, fromType: CouponFromType) {
    let startDate = dateFormat("YYYY.mm.dd", new Date(coupon.beginTime));
    let endDate = dateFormat("YYYY.mm.dd", new Date(coupon.endTime));
    let tag = "";

    if (fromType === 3) {
        const storeTag = {
            1: "京东药急送使用",
            2: "到店使用",
        };
        tag =
            coupon.storeType === 2 && coupon.activityType === 17
                ? "京东新人"
                : storeTag[coupon.storeType];
    } else {
        tag = coupon.allProduct ? "全部商品可用" : "部分商品可用";
    }

    return Object.assign(coupon, {
        date: `${startDate}-${endDate}`,
        tag,
        quota: `满${coupon.quota}元可用`,
    });
}
