import { queryActivityWareByActivity } from "@/api/index";
import { buildUrl, debounce, getMemeberCardInfo } from "@/utils/index";
import { isLogin } from "@/utils/loginUtils";
import { POINTS_MALL_URL } from "@/constants/index";
import loginUtil from "@/pages/login/util";
import { pointsMallButtonStatus } from "@/components/helpers/index";
import { JpassStoreInfoType } from "@/types/index";

Component({
    properties: {
        jpassStoreInfo: {
            type: null,
            observer(val: JpassStoreInfoType) {
                if (val.storeId) {
                    this.getCoupons();
                }
            },
        },
    },
    data: {
        coupons: [],
        total: 0,
        points: 0,
        businessType: "",
        isVip: false,
    },
    pageLifetimes: {
        show() {
            this.getPoints();
        },
    },
    methods: {
        onCouponClick(e) {
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
        getPoints() {
            if (isLogin()) {
                getMemeberCardInfo().then(({ points, customerLevel }) => {
                    this.setData!({
                        points: points,
                        isVip: !!customerLevel,
                    });
                });
            } else {
                this.setData({
                    isVip: false,
                });
            }
        },
        getCoupons: debounce(function() {
            queryActivityWareByActivity(
                // @ts-ignore
                this.data.jpassStoreInfo.storeId,
                6,
                1
            ).then((res) => {
                const data = res.data;
                data.page.data.forEach((coupon: any) => {
                    // @ts-ignore
                    pointsMallButtonStatus(this.data.points, coupon);
                });

                if (res.code === "0000" && data) {
                    // @ts-ignore
                    this.setData({
                        coupons: data.page.data,
                        total: data.page.totalCount,
                        businessType: data.businessType,
                    });
                } else {
                    // @ts-ignore
                    this.setData({
                        coupons: [],
                        total: 0,
                    });
                }
            });
        }, 300),

        getMore() {
            wx.navigateTo({
                url: `/pages/pointsMall/index?storeId=${this.data.jpassStoreInfo.storeId}`,
            });
        },
    },
});
