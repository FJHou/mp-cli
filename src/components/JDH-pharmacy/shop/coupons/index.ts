import { getUnionCouponList } from "@/api/index";
import { getBrandBaseInfo } from "@/utils/JDH-pharmacy/index";
Component({
    properties: {
        yjsStoreInfo: {
            type: Object,
            observer() {
                this.getUnionCouponList();
            },
        },

        jpassStoreInfo: {
            type: Object,
            observer() {
                this.getUnionCouponList();
            },
        },
    },

    data: {
        storeCouponlist: [], //门店券，包含已经领（传递用户pin）和可以领的[]
        showFloorMap: {}
    },

    pageLifetimes: {
        show() {
            this.getUnionCouponList();
        }
    },

    methods: {
        async setFloorMap() {
            try {
                const { showFloorMap } = await getBrandBaseInfo();
                this.setData({
                    showFloorMap,
                });
            } catch (e) {
                console.error(e);
            }
        },
        /**
         * 获取门店优惠券
         */
        getUnionCouponList() {
            const {
                supportDs,
                storeId: jpassStoreId,
            } = this.data.jpassStoreInfo;
            const { storeId = "", venderId = "" } = this.data.yjsStoreInfo || {};
            const yjsStoreId = supportDs ? storeId : null;
            const yjsVenderId = supportDs ? venderId : null;
            // TODO: 下期优化
            if (supportDs) {
                getUnionCouponList(jpassStoreId, yjsStoreId, yjsVenderId).then(
                    (res) => {
                        if (res.code === "0000" && res.data) {
                            // 只展示前三张优惠券
                            this.setData({
                                storeCouponlist: res.data.slice(0, 3),
                            });
                        } else {
                            this.setData({
                                storeCouponlist: [],
                            });
                        }
                        this.setFloorMap()                        
                    }
                );
            } else {
                getUnionCouponList(jpassStoreId, "", "").then(
                    (res) => {
                        if (res.code === "0000" && res.data) {
                            // 只展示前三张优惠券
                            this.setData({
                                storeCouponlist: res.data.slice(0, 3),
                            });
                        } else {
                            this.setData({
                                storeCouponlist: [],
                            });
                        }
                        this.setFloorMap()
                    }
                );
            }
        },
        /**
         * 跳转到店铺优惠券页
         */
        gotoShopCoupon() {
            const jpassStoreId = this.data.jpassStoreInfo.storeId;
            const yjsStoreInfo = this.data.yjsStoreInfo;
            if (yjsStoreInfo) {
                //支持药急送
                const yjsStoreId = yjsStoreInfo.storeId || "";
                const yjsVenderId = yjsStoreInfo.venderId || "";

                wx.navigateTo({
                    url: `/pages/shopCoupon/shopCoupon?storeId=${jpassStoreId}&yjsStoreId=${yjsStoreId}&yjsVenderId=${yjsVenderId}&supportDs=${yjsStoreInfo.supportDs}`,
                });
            } else {
                wx.navigateTo({
                    url: `/pages/shopCoupon/shopCoupon?storeId=${jpassStoreId}&yjsStoreId=''&yjsVenderId=''&supportDs=false`,
                });
            }
        },
    },
});
