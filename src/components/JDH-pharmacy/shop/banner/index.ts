import { API, getShopBanner } from "../../../../api/index";
import { toh5 } from "../../../../utils/JDH-pharmacy/index";
import { safeGet } from "../../../../utils/JDH-pharmacy//helpers";

Component({
    properties: {
        yjsStoreInfo: {
            type: Object,
            observer(val: any) {
                this.getBanners(val)
            }
        },
    },

    data: {
        banners: [],
    },

    methods: {
        getBanners(val) {
            // 支持药急送
            if (val) {
                const { storeId, venderId } = val;
                if (storeId && venderId) {
                    getShopBanner(storeId, venderId).then((res) => {
                        if (res.code === 200) {
                            const bannerModule = res.data.pageModuleList.find(
                                (item: any) => item.moduleFlag === "mBanner"
                            );
        
                            if (bannerModule) {
                                // 兜底处理，因为依赖第三方的接口结构可能会变化
                                const banner = safeGet(
                                    bannerModule,
                                    "containerData.dataMap.slide_array.value.data",
                                    undefined
                                );
                                if (banner) {
                                    this.setData({
                                        banners: banner,
                                    });
                                } else {
                                    this.setData({
                                        banners:
                                            safeGet(
                                                bannerModule,
                                                "extInfo.preloadImages"
                                            ) || [],
                                    });
                                }
                            } else {
                                this.setData({
                                    banners: []
                                })
                            }
                        } else {
                            this.setData({
                                banners: []
                            })
                        }
                    });
                }
            } else {
                // 不支持药急送需要把banner清空，防止切换门店后banner没有消失
                this.setData({
                    banners: []
                })
            }
        },
        onClick(e) {
            const { item } = e.currentTarget.dataset;
            if (item) {
                const { configDataType = 999, configDataValue = {} } =
                    item.detail || {};
                const { storeId, venderId } = this.data.yjsStoreInfo;
                let url = "";

                const hostName = API.diansongUrl;

                switch (configDataType) {
                    //药急送二级页
                    case 11:
                        if (configDataValue.doctorIds) {
                            const dctData = JSON.parse(
                                configDataValue.doctorIds
                            );
                            url = `${hostName}/store-sale/${dctData.projectId}?storeId=${storeId}&venderId=${venderId}&pageId=${dctData.pageId}`;
                        }

                        break;
                    //店铺分类
                    case 3:
                        if (
                            configDataValue.cid != undefined &&
                            configDataValue.cid > 0
                        ) {
                            url = `${hostName}/store/${storeId}?venderid=${venderId}&ShopCategoryId=${configDataValue.cid}`;
                        } else {
                            url = `${hostName}/store/${storeId}?venderid=${venderId}`;
                        }
                        break;
                    //自定义链接
                    case 7:
                        url = configDataValue.linkUrl;

                        break;
                }

                url && toh5(url);
            }
        },
    },
});
