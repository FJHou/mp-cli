// import computedBehavior from 'miniprogram-computed'
import queryString from "query-string";
import { getBrandBaseInfo } from "../../../utils/JDH-pharmacy/index";
import { isLogin } from "../../../utils/loginUtils.js";
import { queryBrandBaseInfoByAppId } from "../../../api/index";
import { getMemeberCardInfo, loginScene } from "../../../utils/index";

const app = getApp();
Component({
    properties: {
        coupons: {
            type: Array,
            observer() {
                this.calcVisibleFresherCoupon();
            },
        },

        level: {
            type: Number,
            value: 0,
        },

        cardNumber: {
            type: Number,
        },

        score: {
            type: Number,
        },

        storeId: {
            type: String,
        },

        fresherCoupnVisible: {
            type: Boolean,
            value: true,
        },
    },

    data: {
        customerLevel: "",
        points: "",
        cardNo: "",
        isVip: false,
        cardCls: "",
        shouldShowFresherCoupon: false,
    },

    methods: {
        calcVisibleFresherCoupon() {
            if (!this.data.fresherCoupnVisible) return;
                
            let shouldShowFresherCoupon = false;

            if (isLogin()) {
                // 不是会员 并且配置了优惠券
                if (this.data.isVip) {
                    shouldShowFresherCoupon = false;
                } else {
                    shouldShowFresherCoupon = this.data.coupons.length !== 0;
                }
            } else {
                shouldShowFresherCoupon = this.data.coupons.length !== 0;
            }
            this.setData({
                shouldShowFresherCoupon,
            });
        },

        fresherCouponjoinMember() {
            loginScene.set("fresherCoupon");
            this.joinMember()
        },

        joinMember() {
            if (this.bizId && this.brandId) {
                this.memberCardTap();
            } else {
                // 没有brandId和bizId重新请求接口
                wx.showModal({
                    content: "没有会员体系id！，点击重试",
                    success: ({ confirm }) => {
                        if (confirm) {
                            queryBrandBaseInfoByAppId(
                                app.globalData.appid
                            ).then((res) => {
                                if (res.code === "0000" && res.data) {
                                    this.brandId = res.data.brandId;
                                    this.bizId = res.data.bizId;
                                    this.memberCardTap();
                                }
                            });
                        }
                    },
                });
            }
        },

        getMmemberCardInfo() {
            getMemeberCardInfo()
                .then((info) => {
                    if (info) {
                        this.setData({
                            ...info,
                        });
                    }
                    this.calcVisibleFresherCoupon();
                })
                .catch(() => {
                    this.calcVisibleFresherCoupon();
                });
        },

        memberCardTap() {
            const baseUrl = this.data.isVip
                ? "/pages/cardInfo/cardInfo"
                : "/pages/addVip/addVip";
            const url = this.buildUrl(baseUrl);

            wx.navigateTo({
                url,
            });
        },

        buildUrl(baseUrl) {
            const query = {
                brandId: this.brandId,
                bId: this.bizId,
            };
            if (this.data.storeId) {
                query.storeId = this.data.storeId;
            }
            const url = queryString.stringifyUrl({
                url: baseUrl,
                query,
            });

            return url;
        },

        /**
         * 重置会员卡信息
         * 场景是在用户退出登录后，要把会员卡的状态变为未开卡
         */
        resetCardInfo() {
            this.setData({
                customerLevel: "",
                points: "",
                cardNo: "",
                isVip: false,
                cardCls: "",
            });
            this.calcVisibleFresherCoupon();
        },

        async initComponent() {
            const { brandId, bizId, channel } = await getBrandBaseInfo();
            this.brandId = brandId;
            this.bizId = bizId;
            this.channel = channel;

            if (isLogin()) {
                this.getMmemberCardInfo();
            } else {
                this.resetCardInfo();
            }
        },
    },

    pageLifetimes: {
        show() {
            this.initComponent();
        },
    },

    lifetimes: {
        attached() {
            this.initComponent();
        },
    },
});
