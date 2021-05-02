import { queryActivityWareByActivity } from "@/api/index";
import { POINTS_MALL_URL } from "@/constants/index";
import loginUtil from "@/pages/login/util";
import { buildUrl, getMemeberCardInfo } from "@/utils/index";
import { pointsMallButtonStatus } from "@/components/helpers/index";

type OptionsType = {
    storeId: string;
};

Page({
    data: {
        options: {
            storeId: "",
        },
        triggered: false,
        coupons: [] as any[],
        total: 0,
        businessType: "",
        tipShow: true,
        loading: false,
        loadOver: false,
        pageNo: 1,
        points: 0, // 积分商城的积分
    },

    onShow() {
        this.init();
    },

    onLoad(options: OptionsType) {
        this.setData!({
            options,
        });
    },

    onReachBottom() {
        if (this.data.loading || this.data.loadOver) return;

        this.setData!({
            pageNo: ++this.data.pageNo,
            loading: true,
        });
        this.getCoupons();
    },

    onPullDownRefresh() {
        this.init();
    },

    async init() {
        try {
            const { points = 0 } = await getMemeberCardInfo();
            this.setData!({
                points,
                triggered: true,
                pageNo: 1,
                coupons: [],
                loadOver: false,
            });
            this.getCoupons();
        } catch (err) {
            console.error(err);
        }
    },

    closeTip() {
        this.setData!({
            tipShow: false,
        });
    },

    toExchangeRecord() {
        const page = buildUrl({
            url: POINTS_MALL_URL.OrderList,
            query: {
                businessType: this.data.businessType,
            },
        });
        // @ts-ignore
        loginUtil.navigateToH5({
            page,
        });
    },

    onCouponClick(e: any) {
        const { coupon } = e.target.dataset;

        if (coupon) {
            const page = buildUrl({
                url: POINTS_MALL_URL.ProductDetail,
                query: {
                    businessType: this.data.businessType,
                    activityId: coupon.activityId,
                    skuId: coupon.wareBusinessId,
                },
            });
            // @ts-ignore
            loginUtil.navigateToH5({
                page,
            });
        }
    },

    // getCardInfo() {
    //     getMemeberCardInfo().then(({points}) => {
    //         this.setData!({
    //             points: points
    //         })
    //     }).finally(() => {
    //         this.getCoupons();
    //     })
    // },

    getCoupons() {
        queryActivityWareByActivity(
            this.data.options.storeId,
            10,
            this.data.pageNo
        )
            .then((res) => {
                const data = res.data;
                if (res.code === "0000" && data) {
                    data.page.data.forEach((coupon: any) => {
                        pointsMallButtonStatus(this.data.points, coupon);
                    });
                    this.setData!({
                        coupons: this.data.coupons.concat(data.page.data),
                        total: data.page.totalCount,
                        businessType: data.businessType,
                    });
                    if (this.data.total === this.data.coupons.length) {
                        this.setData!({
                            loadOver: true,
                        });
                    }
                } else {
                    this.setData!({
                        coupons: [],
                        total: 0,
                    });
                }
            })
            .finally(() => {
                this.setData!({
                    loading: false,
                    triggered: false,
                });
            });
    },
});
